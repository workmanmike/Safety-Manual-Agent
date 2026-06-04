import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const publicDir = join(__dirname, "public");
const port = Number(process.env.PORT || 4173);
const host = process.env.HOST || "127.0.0.1";
const maxJsonBodyBytes = Number(process.env.MAX_JSON_BODY_BYTES || 4 * 1024 * 1024);

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8"
};

class HttpError extends Error {
  constructor(status, message, details = {}) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.details = details;
  }
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    let tooLarge = false;
    req.on("data", (chunk) => {
      if (tooLarge) return;
      body += chunk;
      if (body.length > maxJsonBodyBytes) {
        tooLarge = true;
        body = "";
        reject(new HttpError(413, `Request entity too large. Keep hosted review payloads under ${formatBytes(maxJsonBodyBytes)}.`, {
          maxBytes: maxJsonBodyBytes
        }));
      }
    });
    req.on("end", () => {
      if (tooLarge) return;
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new HttpError(400, "Invalid JSON request."));
      }
    });
    req.on("error", reject);
  });
}

function formatBytes(bytes) {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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
    standardsRefs: Array.isArray(item.standardsRefs)
      ? item.standardsRefs.map(String).filter(Boolean)
      : [],
    requiredProgramElements: Array.isArray(item.requiredProgramElements)
      ? item.requiredProgramElements.map(String).filter(Boolean)
      : [],
    requiredEvidence: Array.isArray(item.requiredEvidence)
      ? item.requiredEvidence.map(String).filter(Boolean)
      : []
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
      const start = Math.max(0, index - 100);
      const end = Math.min(haystack.length, index + normalized.length + 140);
      matches.push({
        term,
        excerpt: haystack.slice(start, end).trim()
      });
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
    const evidenceMatches = findEvidence(text, terms);
    const score = terms.length ? evidenceMatches.length / terms.length : 0;
    const grade = text ? scoreToGrade(score) : "needs_review";

    return {
      id: item.id,
      category: item.category,
      requirement: item.requirement,
      severity: item.severity,
      standardsRefs: item.standardsRefs || [],
      grade,
      score: grade === "needs_review" ? 0 : Number(score.toFixed(2)),
      evidence: evidenceMatches.length
        ? evidenceMatches.slice(0, 3).map((match) => match.excerpt)
        : [],
      citation: evidenceMatches.length ? "Text match in uploaded/pasted content" : "No evidence found in available text",
      recommendation: grade === "pass"
        ? "Keep this requirement as written and verify during human review."
        : `Add clear language and evidence for: ${terms.slice(0, 4).join(", ")}.`,
      standardGaps: grade === "pass"
        ? []
        : (item.requiredProgramElements || []).slice(0, 5),
      confidence: text ? "low" : "none",
      needsHumanReview: true
    };
  });

  const possible = findings.length;
  const earned = findings.reduce((sum, item) => sum + (item.grade === "pass" ? 1 : item.grade === "partial" ? 0.5 : 0), 0);
  const score = possible ? Math.round((earned / possible) * 100) : 0;

  return {
    mode: "local heuristic",
    summary: {
      overallScore: score,
      pass: findings.filter((item) => item.grade === "pass").length,
      partial: findings.filter((item) => item.grade === "partial").length,
      fail: findings.filter((item) => item.grade === "fail").length,
      needsReview: findings.filter((item) => item.grade === "needs_review").length
    },
    findings,
    riskMemo: findings
      .filter((item) => item.grade !== "pass")
      .slice(0, 5)
      .map((item) => `${item.severity}: ${item.requirement}`)
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

async function openAiReview(payload) {
  const apiKey = String(payload.apiKey || process.env.OPENAI_API_KEY || "").trim();
  if (!apiKey) {
    return heuristicReview(payload);
  }

  const playbook = normalizePlaybook(payload.playbook);
  const model = String(payload.model || "gpt-5").trim();
  const content = [];

  if (payload.file?.base64) {
    content.push({
      type: "input_file",
      filename: payload.file.name || "manual.pdf",
      file_data: payload.file.base64
    });
  }

  const manualText = String(payload.manualText || "").trim();
  const instructions = [
    "You are a safety manual review agent for telecom/cell tower work.",
    "Grade the uploaded or pasted manual against the provided playbook.",
    "Every grade must be based on cited evidence from the manual or explicitly marked as missing evidence.",
    "For every playbook item, check that the manual includes the required program elements, not merely the topic heading.",
    "When standardsRefs are provided, assess whether the manual appears to address the intent of those standards and list missing standard-related gaps.",
    "Do not certify legal or regulatory compliance. Flag uncertain items for human review.",
    "Treat fall protection, tower rescue, RF exposure, electrical/LOTO, rigging, weather, PPE, and JHA gaps as safety-significant.",
    "",
    `Company context: ${payload.companyContext || "Cell tower construction, maintenance, and managed field work."}`,
    "",
    "Playbook JSON:",
    JSON.stringify(playbook, null, 2)
  ].join("\n");

  content.push({ type: "input_text", text: instructions });
  if (manualText) {
    content.push({
      type: "input_text",
      text: `Manual text supplied by the user:\n\n${manualText.slice(0, 300000)}`
    });
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
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
    const message = responseJson.error?.message || `OpenAI request failed with ${response.status}.`;
    throw new HttpError(502, message, {
      upstreamStatus: response.status,
      upstreamError: responseJson.error || responseJson
    });
  }

  const outputText = extractOutputText(responseJson);
  const parsed = JSON.parse(outputText);
  return { mode: `OpenAI ${model}`, ...parsed };
}

async function handleApi(req, res) {
  try {
    const payload = await readJsonBody(req);
    const normalized = {
      ...payload,
      playbook: normalizePlaybook(payload.playbook)
    };
    const result = await openAiReview(normalized);
    sendJson(res, 200, result);
  } catch (error) {
    const status = Number(error.status || 400);
    sendJson(res, status, {
      error: error.message || "Review failed.",
      status,
      details: error.details || null
    });
  }
}

function sendJson(res, status, payload) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

async function serveStatic(req, res) {
  const url = new URL(req.url || "/", `http://localhost:${port}`);
  const pathname = url.pathname === "/" ? "/index.html" : url.pathname;
  const target = normalize(join(publicDir, pathname));

  if (!target.startsWith(publicDir)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  try {
    const file = await readFile(target);
    res.writeHead(200, { "Content-Type": contentTypes[extname(target)] || "application/octet-stream" });
    res.end(file);
  } catch {
    res.writeHead(404);
    res.end("Not found");
  }
}

const server = createServer((req, res) => {
  const url = new URL(req.url || "/", `http://${host}:${port}`);

  if (url.pathname.startsWith("/api/") && url.pathname !== "/api/review") {
    sendJson(res, 404, {
      error: "API route not found.",
      status: 404,
      path: url.pathname
    });
    return;
  }

  if (url.pathname === "/api/review" && req.method !== "POST") {
    sendJson(res, 405, {
      error: "Method not allowed. Use POST for /api/review.",
      status: 405,
      method: req.method
    });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/review") {
    handleApi(req, res);
    return;
  }
  if (req.method === "GET") {
    serveStatic(req, res);
    return;
  }
  sendJson(res, 405, {
    error: "Method not allowed.",
    status: 405,
    method: req.method
  });
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${port} is already in use. Set PORT to another value and retry.`);
  } else if (error.code === "EACCES") {
    console.error(`Cannot bind to ${host}:${port}. Try a different PORT or run with the needed permission.`);
  } else {
    console.error(error);
  }
  process.exitCode = 1;
});

function shutdown(signal) {
  console.log(`Received ${signal}; closing server.`);
  server.close((error) => {
    if (error) {
      console.error(error);
      process.exitCode = 1;
    }
    process.exit();
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

server.listen(port, host, () => {
  console.log(`Tower Safety Manual Reviewer running at http://${host}:${port}`);
});
