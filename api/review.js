const maxJsonBodyBytes = Number(process.env.MAX_JSON_BODY_BYTES || 4 * 1024 * 1024);
const maxUploadFileBytes = Number(process.env.MAX_UPLOAD_FILE_BYTES || 25 * 1024 * 1024);
const maxMultipartBodyBytes = Number(process.env.MAX_MULTIPART_BODY_BYTES || 28 * 1024 * 1024);

class HttpError extends Error {
  constructor(status, message, details = {}) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.details = details;
  }
}

function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

function formatBytes(bytes) {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function readRawBody(req, maxBytes) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let total = 0;
    let tooLarge = false;

    req.on("data", (chunk) => {
      if (tooLarge) return;
      total += chunk.length;
      if (total > maxBytes) {
        tooLarge = true;
        reject(new HttpError(413, `Request entity too large. Keep uploads under ${formatBytes(maxUploadFileBytes)}.`, {
          maxBytes
        }));
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      if (!tooLarge) resolve(Buffer.concat(chunks));
    });
    req.on("error", reject);
  });
}

async function readPayload(req) {
  const contentType = req.headers["content-type"] || "";

  if (contentType.includes("multipart/form-data")) {
    const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
    if (!boundaryMatch) {
      throw new HttpError(400, "Invalid multipart request: missing boundary.");
    }
    const body = await readRawBody(req, maxMultipartBodyBytes);
    return parseMultipart(body, boundaryMatch[1] || boundaryMatch[2]);
  }

  if (req.body && typeof req.body === "object" && !Buffer.isBuffer(req.body)) {
    return { payload: req.body, uploadedFile: null };
  }

  const body = req.body
    ? Buffer.from(typeof req.body === "string" ? req.body : JSON.stringify(req.body))
    : await readRawBody(req, maxJsonBodyBytes);

  try {
    return { payload: body.length ? JSON.parse(body.toString("utf8")) : {}, uploadedFile: null };
  } catch {
    throw new HttpError(400, "Invalid JSON request.");
  }
}

function parseMultipart(body, boundary) {
  const delimiter = Buffer.from(`--${boundary}`);
  const parts = [];
  let cursor = body.indexOf(delimiter);

  while (cursor !== -1) {
    cursor += delimiter.length;
    if (body.slice(cursor, cursor + 2).toString() === "--") break;
    if (body.slice(cursor, cursor + 2).toString() === "\r\n") cursor += 2;

    const headerEnd = body.indexOf(Buffer.from("\r\n\r\n"), cursor);
    if (headerEnd === -1) break;

    const rawHeaders = body.slice(cursor, headerEnd).toString("utf8");
    const nextDelimiter = body.indexOf(delimiter, headerEnd + 4);
    if (nextDelimiter === -1) break;

    let contentEnd = nextDelimiter;
    if (body.slice(contentEnd - 2, contentEnd).toString() === "\r\n") contentEnd -= 2;

    const headers = Object.fromEntries(rawHeaders.split("\r\n").map((line) => {
      const index = line.indexOf(":");
      if (index === -1) return ["", ""];
      return [line.slice(0, index).trim().toLowerCase(), line.slice(index + 1).trim()];
    }).filter(([key]) => key));

    const disposition = headers["content-disposition"] || "";
    const name = disposition.match(/name="([^"]+)"/)?.[1];
    const filename = disposition.match(/filename="([^"]*)"/)?.[1];
    const content = body.slice(headerEnd + 4, contentEnd);

    if (name) {
      parts.push({
        name,
        filename,
        contentType: headers["content-type"] || "application/octet-stream",
        content
      });
    }

    cursor = nextDelimiter;
  }

  const fields = {};
  let uploadedFile = null;

  for (const part of parts) {
    if (part.filename) {
      uploadedFile = {
        name: part.filename,
        type: part.contentType,
        buffer: part.content
      };
    } else {
      fields[part.name] = part.content.toString("utf8");
    }
  }

  if (uploadedFile && uploadedFile.buffer.length > maxUploadFileBytes) {
    throw new HttpError(413, `PDF is ${formatBytes(uploadedFile.buffer.length)}. Upload limit is ${formatBytes(maxUploadFileBytes)}.`, {
      maxBytes: maxUploadFileBytes,
      actualBytes: uploadedFile.buffer.length
    });
  }

  try {
    return {
      payload: fields.payload ? JSON.parse(fields.payload) : {},
      uploadedFile
    };
  } catch {
    throw new HttpError(400, "Invalid multipart payload JSON.");
  }
}

function normalizePlaybook(playbook) {
  if (!Array.isArray(playbook)) return [];
  return playbook.map((item, index) => ({
    id: String(item.id || `REQ-${index + 1}`).trim(),
    category: String(item.category || "General").trim(),
    requirement: String(item.requirement || "").trim(),
    severity: String(item.severity || "Medium").trim(),
    passCriteria: String(item.passCriteria || item.pass || "").trim(),
    partialCriteria: String(item.partialCriteria || item.partial || "").trim(),
    failCriteria: String(item.failCriteria || item.fail || "").trim(),
    standardsRefs: Array.isArray(item.standardsRefs) ? item.standardsRefs.map(String).filter(Boolean) : [],
    requiredProgramElements: Array.isArray(item.requiredProgramElements) ? item.requiredProgramElements.map(String).filter(Boolean) : [],
    requiredEvidence: Array.isArray(item.requiredEvidence) ? item.requiredEvidence.map(String).filter(Boolean) : []
  })).filter((item) => item.requirement);
}

function scoreToGrade(score) {
  if (score >= 0.8) return "pass";
  if (score >= 0.35) return "partial";
  return "fail";
}

function findEvidence(text, terms) {
  const haystack = text.replace(/\s+/g, " ");
  const lower = haystack.toLowerCase();
  const matches = [];

  for (const term of terms) {
    const normalized = String(term).toLowerCase().trim();
    if (!normalized) continue;
    const index = lower.indexOf(normalized);
    if (index >= 0) {
      matches.push(haystack.slice(Math.max(0, index - 100), Math.min(haystack.length, index + normalized.length + 140)).trim());
    }
  }

  return matches;
}

function heuristicReview({ manualText, playbook }) {
  const text = String(manualText || "");
  const findings = playbook.map((item) => {
    const terms = item.requiredEvidence.length
      ? item.requiredEvidence
      : item.requirement.split(/\W+/).filter((word) => word.length > 4).slice(0, 8);
    const evidence = findEvidence(text, terms);
    const score = terms.length ? evidence.length / terms.length : 0;
    const grade = text ? scoreToGrade(score) : "needs_review";

    return {
      id: item.id,
      category: item.category,
      requirement: item.requirement,
      severity: item.severity,
      standardsRefs: item.standardsRefs || [],
      grade,
      score: grade === "needs_review" ? 0 : Number(score.toFixed(2)),
      evidence: evidence.slice(0, 3),
      citation: evidence.length ? "Text match in uploaded/pasted content" : "No evidence found in available text",
      recommendation: grade === "pass"
        ? "Keep this requirement as written and verify during human review."
        : `Add clear language and evidence for: ${terms.slice(0, 4).join(", ")}.`,
      standardGaps: grade === "pass" ? [] : (item.requiredProgramElements || []).slice(0, 5),
      confidence: text ? "low" : "none",
      needsHumanReview: true
    };
  });

  const possible = findings.length;
  const earned = findings.reduce((sum, item) => sum + (item.grade === "pass" ? 1 : item.grade === "partial" ? 0.5 : 0), 0);

  return {
    mode: "local heuristic",
    summary: {
      overallScore: possible ? Math.round((earned / possible) * 100) : 0,
      pass: findings.filter((item) => item.grade === "pass").length,
      partial: findings.filter((item) => item.grade === "partial").length,
      fail: findings.filter((item) => item.grade === "fail").length,
      needsReview: findings.filter((item) => item.grade === "needs_review").length
    },
    findings,
    riskMemo: findings.filter((item) => item.grade !== "pass").slice(0, 5).map((item) => `${item.severity}: ${item.requirement}`)
  };
}

function buildSchema() {
  return {
    type: "object",
    additionalProperties: false,
    properties: {
      summary: {
        type: "object",
        additionalProperties: false,
        properties: {
          overallScore: { type: "number" },
          pass: { type: "number" },
          partial: { type: "number" },
          fail: { type: "number" },
          needsReview: { type: "number" },
          executiveSummary: { type: "string" }
        },
        required: ["overallScore", "pass", "partial", "fail", "needsReview", "executiveSummary"]
      },
      findings: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            id: { type: "string" },
            category: { type: "string" },
            requirement: { type: "string" },
            severity: { type: "string" },
            standardsRefs: { type: "array", items: { type: "string" } },
            grade: { type: "string", enum: ["pass", "partial", "fail", "not_applicable", "needs_review"] },
            score: { type: "number" },
            evidence: { type: "array", items: { type: "string" } },
            citation: { type: "string" },
            recommendation: { type: "string" },
            standardGaps: { type: "array", items: { type: "string" } },
            confidence: { type: "string", enum: ["high", "medium", "low", "none"] },
            needsHumanReview: { type: "boolean" }
          },
          required: ["id", "category", "requirement", "severity", "standardsRefs", "grade", "score", "evidence", "citation", "recommendation", "standardGaps", "confidence", "needsHumanReview"]
        }
      },
      riskMemo: { type: "array", items: { type: "string" } }
    },
    required: ["summary", "findings", "riskMemo"]
  };
}

function extractOutputText(responseJson) {
  if (typeof responseJson.output_text === "string") return responseJson.output_text;
  const parts = [];
  for (const item of responseJson.output || []) {
    for (const content of item.content || []) {
      if (typeof content.text === "string") parts.push(content.text);
    }
  }
  return parts.join("\n");
}

async function uploadOpenAiFile({ apiKey, file }) {
  const formData = new FormData();
  const blob = new Blob([file.buffer], { type: file.type || "application/pdf" });
  formData.append("file", blob, file.name || "manual.pdf");
  formData.append("purpose", "user_data");

  const response = await fetch("https://api.openai.com/v1/files", {
    method: "POST",
    headers: { "Authorization": `Bearer ${apiKey}` },
    body: formData
  });

  const responseText = await response.text();
  let responseJson;
  try {
    responseJson = responseText ? JSON.parse(responseText) : {};
  } catch {
    throw new HttpError(502, "OpenAI file upload returned a non-JSON response.", {
      upstreamStatus: response.status,
      upstreamBody: responseText.slice(0, 1000)
    });
  }

  if (!response.ok) {
    throw new HttpError(502, responseJson.error?.message || `OpenAI file upload failed with ${response.status}.`, {
      upstreamStatus: response.status,
      upstreamError: responseJson.error || responseJson
    });
  }

  return responseJson.id;
}

async function openAiReview(payload) {
  const apiKey = String(payload.apiKey || process.env.OPENAI_API_KEY || "").trim();
  if (!apiKey) return heuristicReview(payload);

  const playbook = normalizePlaybook(payload.playbook);
  const content = [];

  if (payload.file?.fileId) {
    content.push({ type: "input_file", file_id: payload.file.fileId });
  }

  const manualText = String(payload.manualText || "").trim();
  content.push({
    type: "input_text",
    text: [
      "You are a safety manual review agent for telecom/cell tower work.",
      "Grade the uploaded or pasted manual against the provided playbook.",
      "Every grade must be based on cited evidence from the manual or explicitly marked as missing evidence.",
      "For every playbook item, check that the manual includes the required program elements, not merely the topic heading.",
      "When standardsRefs are provided, assess whether the manual appears to address the intent of those standards and list missing standard-related gaps.",
      "Do not certify legal or regulatory compliance. Flag uncertain items for human review.",
      `Company context: ${payload.companyContext || "Cell tower construction, maintenance, and managed field work."}`,
      `SOW base: ${payload.sowBase || "Tower/Elevated"}`,
      "Playbook JSON:",
      JSON.stringify(playbook, null, 2)
    ].join("\n")
  });

  if (manualText) {
    content.push({ type: "input_text", text: `Manual text supplied by the user:\n\n${manualText.slice(0, 300000)}` });
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: String(payload.model || "gpt-5").trim(),
      input: [{ role: "user", content }],
      text: {
        format: {
          type: "json_schema",
          name: "tower_safety_manual_review",
          schema: buildSchema(),
          strict: true
        }
      }
    })
  });

  const responseText = await response.text();
  let responseJson;
  try {
    responseJson = responseText ? JSON.parse(responseText) : {};
  } catch {
    throw new HttpError(502, "OpenAI returned a non-JSON response.", {
      upstreamStatus: response.status,
      upstreamBody: responseText.slice(0, 1000)
    });
  }

  if (!response.ok) {
    throw new HttpError(502, responseJson.error?.message || `OpenAI request failed with ${response.status}.`, {
      upstreamStatus: response.status,
      upstreamError: responseJson.error || responseJson
    });
  }

  return { mode: `OpenAI ${payload.model || "gpt-5"}`, ...JSON.parse(extractOutputText(responseJson)) };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    sendJson(res, 405, {
      error: "Method not allowed. Use POST for /api/review.",
      status: 405,
      method: req.method
    });
    return;
  }

  try {
    const { payload, uploadedFile } = await readPayload(req);
    const normalized = {
      ...payload,
      playbook: normalizePlaybook(payload.playbook)
    };

    const apiKey = String(normalized.apiKey || process.env.OPENAI_API_KEY || "").trim();
    if (uploadedFile) {
      if (!apiKey) {
        throw new HttpError(400, "PDF review requires an OpenAI API key. Paste extracted text to use local heuristic mode.");
      }
      const fileId = await uploadOpenAiFile({ apiKey, file: uploadedFile });
      normalized.file = {
        name: uploadedFile.name,
        type: uploadedFile.type,
        fileId
      };
    }

    sendJson(res, 200, await openAiReview(normalized));
  } catch (error) {
    const status = Number(error.status || 400);
    sendJson(res, status, {
      error: error.message || "Review failed.",
      status,
      details: error.details || null
    });
  }
}
