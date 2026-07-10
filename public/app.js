const commonProgramElements = [
  "scope and applicability",
  "roles and responsibilities",
  "training or qualification requirements",
  "hazard controls and required procedures",
  "PPE or equipment requirements",
  "inspection or pre-use checks",
  "emergency response where applicable",
  "records or documentation requirements"
];

function topic({ id, category, severity = "High", standardsRefs = [], requiredEvidence = [], requiredProgramElements = [] }) {
  const elements = [...commonProgramElements, ...requiredProgramElements];
  return {
    id,
    category,
    requirement: `The manual contains a complete ${category} program section for telecom installation work.`,
    severity,
    standardsRefs,
    requiredProgramElements: elements,
    passCriteria: `Fully covers ${elements.join(", ")} and aligns with the listed OSHA/ANSI references where applicable.`,
    partialCriteria: "Mentions the topic but omits one or more required program elements, work controls, qualifications, or records.",
    failCriteria: "No meaningful manual section or enforceable procedure for this topic.",
    requiredEvidence
  };
}

const defaultPlaybook = [
  topic({
    id: "BBP-001",
    category: "Bloodborne Pathogens (BBP)",
    severity: "Medium",
    standardsRefs: ["OSHA 29 CFR 1910.1030 where occupational exposure exists"],
    requiredEvidence: ["bloodborne pathogens", "exposure control", "biohazard", "sharps", "post-exposure", "hepatitis B"],
    requiredProgramElements: ["exposure determination", "post-exposure response", "medical follow-up"]
  }),
  topic({
    id: "CHEM-001",
    category: "Chemical Safety",
    severity: "High",
    standardsRefs: ["OSHA 29 CFR 1926.59 / 1910.1200 Hazard Communication"],
    requiredEvidence: ["hazard communication", "SDS", "chemical inventory", "label", "secondary container", "spill"],
    requiredProgramElements: ["chemical inventory", "SDS access", "container labeling", "spill response"]
  }),
  topic({
    id: "CS-001",
    category: "Confined Space",
    severity: "Critical",
    standardsRefs: ["OSHA 29 CFR 1926 Subpart AA"],
    requiredEvidence: ["confined space", "permit-required", "atmospheric testing", "entrant", "attendant", "rescue"],
    requiredProgramElements: ["permit evaluation", "atmospheric monitoring", "entry roles", "rescue planning"]
  }),
  topic({
    id: "CRN-001",
    category: "Crane Operation",
    severity: "Critical",
    standardsRefs: ["OSHA 29 CFR 1926 Subpart CC", "ANSI/ASSP A10.48 communication structure work"],
    requiredEvidence: ["crane", "operator certification", "lift plan", "load chart", "signal person", "power line"],
    requiredProgramElements: ["operator qualification", "lift planning", "ground conditions", "signal person controls", "power-line clearance"]
  }),
  topic({
    id: "DA-001",
    category: "Drug and Alcohol",
    severity: "High",
    standardsRefs: ["Company policy and applicable DOT/customer requirements"],
    requiredEvidence: ["drug", "alcohol", "fit for duty", "impairment", "testing", "reasonable suspicion"],
    requiredProgramElements: ["fit-for-duty rules", "prohibited conduct", "testing or removal process", "supervisor escalation"]
  }),
  topic({
    id: "ELEC-001",
    category: "Electrical",
    severity: "Critical",
    standardsRefs: ["OSHA 29 CFR 1926 Subpart K"],
    requiredEvidence: ["electrical", "energized", "de-energized", "GFCI", "temporary power", "grounding"],
    requiredProgramElements: ["energized-work restrictions", "temporary power controls", "GFCI use", "approach boundaries"]
  }),
  topic({
    id: "ELEC-Q-001",
    category: "Electrical (Qualified)",
    severity: "Critical",
    standardsRefs: ["OSHA 29 CFR 1926 Subpart K"],
    requiredEvidence: ["qualified person", "electrical qualified", "training", "authorization", "energized equipment"],
    requiredProgramElements: ["qualified-person definition", "authorization limits", "task-specific training", "unqualified-worker restrictions"]
  }),
  topic({
    id: "ARC-001",
    category: "Electrical (Qualified): Electrical Arc Safety",
    severity: "Critical",
    standardsRefs: ["OSHA 29 CFR 1926 Subpart K", "NFPA 70E where adopted by company policy"],
    requiredEvidence: ["arc flash", "arc rated", "incident energy", "shock boundary", "flash boundary", "energized work permit"],
    requiredProgramElements: ["arc hazard assessment", "arc-rated PPE", "energized-work approval", "shock and arc boundaries"]
  }),
  topic({
    id: "AEGCP-001",
    category: "Electrical Equipment Grounding Assurance",
    severity: "High",
    standardsRefs: ["OSHA 29 CFR 1926.404"],
    requiredEvidence: ["assured equipment grounding", "grounding conductor", "continuity test", "GFCI", "cord inspection"],
    requiredProgramElements: ["cord and tool inspection", "test frequency", "failed-equipment removal", "GFCI or grounding program"]
  }),
  topic({
    id: "EAP-001",
    category: "Emergency Action Plan",
    severity: "Critical",
    standardsRefs: ["OSHA 29 CFR 1926.35"],
    requiredEvidence: ["emergency action plan", "evacuation", "assembly area", "emergency contact", "alarm", "site emergency"],
    requiredProgramElements: ["emergency contacts", "evacuation routes", "site access for responders", "communication method"]
  }),
  topic({
    id: "FP-001",
    category: "Fall Protection",
    severity: "Critical",
    standardsRefs: ["OSHA 29 CFR 1926 Subpart M", "ANSI/ASSP A10.48 communication structure work"],
    requiredEvidence: ["100% tie-off", "continuous fall protection", "fall arrest", "anchorage", "rescue", "competent person"],
    requiredProgramElements: ["100 percent tie-off expectation", "anchorage criteria", "equipment inspection", "competent-person oversight", "fall rescue"]
  }),
  topic({
    id: "FIRE-001",
    category: "Fire Protection",
    severity: "High",
    standardsRefs: ["OSHA 29 CFR 1926 Subpart F"],
    requiredEvidence: ["fire protection", "extinguisher", "flammable", "combustible", "fuel storage", "fire watch"],
    requiredProgramElements: ["extinguisher availability", "flammable storage", "ignition control", "fire watch triggers"]
  }),
  topic({
    id: "FA-001",
    category: "First Aid",
    severity: "High",
    standardsRefs: ["OSHA 29 CFR 1926.50"],
    requiredEvidence: ["first aid", "CPR", "medical services", "first aid kit", "AED", "emergency medical"],
    requiredProgramElements: ["first-aid availability", "medical response access", "first-aid kit inspection", "CPR/AED expectations"]
  }),
  topic({
    id: "GEN-001",
    category: "General Programs",
    severity: "High",
    standardsRefs: ["OSHA 29 CFR 1926 general construction safety obligations", "ANSI/ASSP A10.48 safety practices"],
    requiredEvidence: ["safety policy", "responsibilities", "training", "discipline", "inspection", "continuous improvement"],
    requiredProgramElements: ["management responsibilities", "employee responsibilities", "disciplinary policy", "program review"]
  }),
  topic({
    id: "HIRA-001",
    category: "Hazard Identification, Risk Assessment and Control",
    severity: "Critical",
    standardsRefs: ["ANSI/ASSP A10.48 planning and hazard control practices", "OSHA 29 CFR 1926 applicable hazard controls"],
    requiredEvidence: ["hazard assessment", "risk assessment", "JHA", "pre-task", "control measures", "hierarchy of controls"],
    requiredProgramElements: ["pre-task hazard assessment", "control selection", "crew communication", "changing-condition reassessment"]
  }),
  topic({
    id: "HME-001",
    category: "Heavy Mobile Equipment Operation",
    severity: "High",
    standardsRefs: ["OSHA 29 CFR 1926 Subpart O"],
    requiredEvidence: ["heavy equipment", "mobile equipment", "spotter", "backup alarm", "seat belt", "equipment inspection"],
    requiredProgramElements: ["operator authorization", "pre-use inspection", "spotter/backing controls", "pedestrian separation"]
  }),
  topic({
    id: "HOT-001",
    category: "Hot Work",
    severity: "High",
    standardsRefs: ["OSHA 29 CFR 1926 Subpart J", "OSHA 29 CFR 1926 Subpart F"],
    requiredEvidence: ["hot work", "welding", "cutting", "burning", "fire watch", "hot work permit"],
    requiredProgramElements: ["permit or authorization process", "fire watch", "combustible control", "cylinder handling"]
  }),
  topic({
    id: "INV-001",
    category: "Incident Investigation",
    severity: "High",
    standardsRefs: ["OSHA recordkeeping where applicable", "Company incident management requirements"],
    requiredEvidence: ["incident investigation", "near miss", "root cause", "corrective action", "reporting", "lessons learned"],
    requiredProgramElements: ["reporting thresholds", "investigation roles", "root-cause process", "corrective-action tracking"]
  }),
  topic({
    id: "LAD-001",
    category: "Ladders",
    severity: "High",
    standardsRefs: ["OSHA 29 CFR 1926 Subpart X"],
    requiredEvidence: ["ladder", "extension ladder", "step ladder", "three points of contact", "inspection", "secured"],
    requiredProgramElements: ["ladder selection", "inspection", "setup and securing", "defective ladder removal"]
  }),
  topic({
    id: "LOTO-001",
    category: "Lockout/Tagout",
    severity: "Critical",
    standardsRefs: ["OSHA 29 CFR 1926 Subpart K", "OSHA 29 CFR 1910.147 where applicable"],
    requiredEvidence: ["lockout", "tagout", "LOTO", "energy isolation", "zero energy", "verification"],
    requiredProgramElements: ["energy-control steps", "authorized employees", "verification of isolation", "release from lockout"]
  }),
  topic({
    id: "MEWP-001",
    category: "Mobile Elevating Work Platforms (MEWPs)",
    severity: "High",
    standardsRefs: ["OSHA 29 CFR 1926 Subpart L and applicable ANSI A92 requirements"],
    requiredEvidence: ["MEWP", "aerial lift", "boom lift", "scissor lift", "fall restraint", "platform inspection"],
    requiredProgramElements: ["operator training", "pre-use inspection", "fall protection in platform", "ground/slope limits"]
  }),
  topic({
    id: "NOISE-001",
    category: "Noise Exposure",
    severity: "Medium",
    standardsRefs: ["OSHA 29 CFR 1926.52", "OSHA 29 CFR 1926.101"],
    requiredEvidence: ["noise", "hearing protection", "audiometric", "hearing conservation", "decibel", "ear plugs"],
    requiredProgramElements: ["noise assessment", "hearing protection", "hearing conservation trigger", "training"]
  }),
  topic({
    id: "PIT-001",
    category: "Powered Industrial Trucks / Lift Trucks",
    severity: "High",
    standardsRefs: ["OSHA 29 CFR 1926.602", "OSHA 29 CFR 1910.178 where applicable"],
    requiredEvidence: ["forklift", "powered industrial truck", "lift truck", "operator training", "forks", "load capacity"],
    requiredProgramElements: ["operator authorization", "daily inspection", "load handling", "pedestrian controls"]
  }),
  topic({
    id: "PPE-001",
    category: "PPE (Personal Protective Equipment)",
    severity: "High",
    standardsRefs: ["OSHA 29 CFR 1926 Subpart E"],
    requiredEvidence: ["PPE", "hard hat", "gloves", "eye protection", "boots", "harness", "hazard assessment"],
    requiredProgramElements: ["PPE hazard assessment", "minimum site PPE", "task-specific PPE", "inspection and replacement"]
  }),
  topic({
    id: "RF-001",
    category: "Radio-Frequency (RF) Safety / Electromagnetic Energy (EME)",
    severity: "Critical",
    standardsRefs: ["FCC RF exposure requirements", "ANSI/ASSP A10.48 communication structure work"],
    requiredEvidence: ["RF exposure", "EME", "radio frequency", "shutdown", "monitor", "controlled area", "signage"],
    requiredProgramElements: ["RF hazard assessment", "carrier coordination", "shutdown or power reduction", "monitoring", "controlled access"]
  }),
  topic({
    id: "REC-001",
    category: "Records Retention",
    severity: "Medium",
    standardsRefs: ["OSHA documentation and recordkeeping requirements where applicable", "Company/customer retention requirements"],
    requiredEvidence: ["records retention", "training records", "inspection records", "incident records", "audit", "document control"],
    requiredProgramElements: ["record types", "retention periods", "record owner", "retrieval process"]
  }),
  topic({
    id: "RIG-001",
    category: "Rigging/Material Handling",
    severity: "Critical",
    standardsRefs: ["OSHA 29 CFR 1926 Subpart H", "OSHA 29 CFR 1926 Subpart CC", "ANSI/ASSP A10.48 communication structure work"],
    requiredEvidence: ["rigging", "material handling", "qualified rigger", "sling", "tag line", "dropped object", "lift plan"],
    requiredProgramElements: ["qualified rigger criteria", "rigging inspection", "load control", "dropped-object prevention", "lift planning"]
  }),
  topic({
    id: "SIL-001",
    category: "Silica Exposure Control",
    severity: "High",
    standardsRefs: ["OSHA 29 CFR 1926.1153"],
    requiredEvidence: ["silica", "respirable crystalline silica", "Table 1", "dust control", "respirator", "exposure control plan"],
    requiredProgramElements: ["exposure control plan", "engineering controls", "respiratory protection triggers", "housekeeping"]
  }),
  topic({
    id: "SWA-001",
    category: "Stop Work Authorization",
    severity: "Critical",
    standardsRefs: ["ANSI/ASSP A10.48 safety management expectations", "Company/customer stop-work requirements"],
    requiredEvidence: ["stop work", "stop-work authority", "unsafe condition", "no retaliation", "restart", "escalation"],
    requiredProgramElements: ["who may stop work", "no-retaliation language", "restart approval", "escalation path"]
  }),
  topic({
    id: "SUB-001",
    category: "Subcontractor Safety Management",
    severity: "High",
    standardsRefs: ["OSHA multi-employer worksite policy considerations", "ANSI/ASSP A10.48 contractor coordination practices"],
    requiredEvidence: ["subcontractor", "contractor", "prequalification", "orientation", "oversight", "site safety"],
    requiredProgramElements: ["prequalification", "site orientation", "coordination responsibilities", "performance monitoring"]
  }),
  topic({
    id: "TOOL-001",
    category: "Tool Safety",
    severity: "High",
    standardsRefs: ["OSHA 29 CFR 1926 Subpart I"],
    requiredEvidence: ["tool safety", "hand tools", "power tools", "guard", "inspection", "defective tool"],
    requiredProgramElements: ["tool inspection", "guarding", "defective-tool removal", "manufacturer instructions"]
  }),
  topic({
    id: "TOWER-001",
    category: "Tower Safety",
    severity: "Critical",
    standardsRefs: ["ANSI/ASSP A10.48 communication structure work", "OSHA 29 CFR 1926 applicable construction standards"],
    requiredEvidence: ["tower", "climber", "competent person", "100% tie-off", "rescue plan", "RF", "rigging plan"],
    requiredProgramElements: ["climber authorization", "competent-person oversight", "site-specific plan", "rescue readiness", "RF and rigging coordination"]
  }),
  topic({
    id: "EXC-001",
    category: "Trenching & Excavation",
    severity: "Critical",
    standardsRefs: ["OSHA 29 CFR 1926 Subpart P"],
    requiredEvidence: ["trenching", "excavation", "competent person", "protective system", "shoring", "sloping", "underground utilities"],
    requiredProgramElements: ["competent-person inspection", "utility locating", "protective systems", "access/egress", "spoils and water controls"]
  })
];

const sampleManual = `Demonstration Telecom Safety Manual

This example describes a mature safety program for cell tower construction, electrical, and civil work. Management assigns roles and responsibilities, qualified supervisors authorize work, employees receive task-specific training, required PPE and equipment are inspected before use, emergency response is planned, and training and inspection records are retained.

` + defaultPlaybook.map((item) => `${item.category}
This program applies to all affected employees and subcontractors. A competent or qualified person, as applicable, is responsible for planning, training, authorization, pre-use inspection, hazard controls, emergency response, and documentation. Required controls include ${item.requiredProgramElements.join(", ")}. The program specifically addresses ${item.requiredEvidence.join(", ")}. Defective equipment is removed from service, changing conditions require reassessment, and completed inspections and training are documented.
`).join("\n");

let selectedFile = null;
let selectedFileBase64 = "";
let lastResult = null;
const maxDirectFileBytes = 25 * 1024 * 1024;
const maxManualTextChars = 450000;

const $ = (id) => document.getElementById(id);

function init() {
  $("playbookEditor").value = JSON.stringify(defaultPlaybook, null, 2);
  $("manualFile").addEventListener("change", handleFile);
  $("runReview").addEventListener("click", runReview);
  $("loadSample").addEventListener("click", () => {
    $("manualText").value = sampleManual;
  });
  $("resetPlaybook").addEventListener("click", () => {
    $("playbookEditor").value = JSON.stringify(defaultPlaybook, null, 2);
  });
  $("exportJson").addEventListener("click", exportJson);
}

async function handleFile(event) {
  selectedFile = event.target.files?.[0] || null;
  selectedFileBase64 = "";
  $("fileName").textContent = selectedFile ? selectedFile.name : "Choose manual file";

  if (!selectedFile) return;

  if (selectedFile.type.startsWith("text/") || /\.(txt|md|text)$/i.test(selectedFile.name)) {
    if (selectedFile.size > maxManualTextChars) {
      selectedFile = null;
      event.target.value = "";
      $("fileName").textContent = "Choose manual file";
      renderError(`Text file is ${formatBytes(event.target.files[0].size)}. Hosted review supports pasted/extracted text up to about ${formatBytes(maxManualTextChars)} per request.`);
      return;
    }
    $("manualText").value = await selectedFile.text();
    return;
  }

  if (selectedFile.size > maxDirectFileBytes) {
    const actualSize = selectedFile.size;
    selectedFile = null;
    event.target.value = "";
    $("fileName").textContent = "Choose manual file";
    renderError(`PDF is ${formatBytes(actualSize)}. Hosted PDF review supports files up to ${formatBytes(maxDirectFileBytes)}.`);
    return;
  }
}

function parsePlaybook() {
  try {
    const value = JSON.parse($("playbookEditor").value);
    if (!Array.isArray(value)) throw new Error("Playbook must be a JSON array.");
    return value;
  } catch (error) {
    throw new Error(`Playbook JSON error: ${error.message}`);
  }
}

async function runReview() {
  const button = $("runReview");
  button.disabled = true;
  button.textContent = "Reviewing...";
  renderLoading();

  try {
    if (selectedFile && selectedFile.size > maxDirectFileBytes) {
      throw new Error(`PDF is ${formatBytes(selectedFile.size)}. Hosted PDF review currently supports files up to ${formatBytes(maxDirectFileBytes)}.`);
    }

    if ($("manualText").value.length > maxManualTextChars) {
      throw new Error(`Manual text is ${formatBytes($("manualText").value.length)}. Keep pasted text under about ${formatBytes(maxManualTextChars)} per hosted request.`);
    }

    const payload = {
      apiKey: $("apiKey").value,
      model: $("model").value,
      companyContext: $("companyContext").value,
      sowBase: $("sowBase").value,
      manualText: $("manualText").value,
      playbook: parsePlaybook(),
      file: null
    };

    let requestBody = JSON.stringify(payload);
    let headers = { "Content-Type": "application/json" };

    if (selectedFile) {
      const formData = new FormData();
      formData.append("payload", JSON.stringify(payload));
      formData.append("manual", selectedFile, selectedFile.name);
      requestBody = formData;
      headers = {};
    }

    const response = await fetch("/api/review", {
      method: "POST",
      headers,
      body: requestBody
    });
    const responseText = await response.text();
    let result;
    try {
      result = responseText ? JSON.parse(responseText) : {};
    } catch {
      if (!selectedFile && $("manualText").value.trim()) {
        result = clientHeuristicReview({
          manualText: $("manualText").value,
          playbook: payload.playbook,
          apiError: `Server returned non-JSON response (${response.status}): ${responseText.slice(0, 240)}`
        });
        lastResult = result;
        $("runMode").textContent = result.mode;
        $("exportJson").disabled = false;
        renderResults(result);
        return;
      }
      throw new Error(`Server returned non-JSON response (${response.status}): ${responseText.slice(0, 400)}`);
    }
    if (!response.ok) {
      const details = result.details ? ` ${JSON.stringify(result.details)}` : "";
      throw new Error(`${result.error || "Review failed."}${details}`);
    }
    lastResult = result;
    $("runMode").textContent = result.mode || "Review complete";
    $("exportJson").disabled = false;
    renderResults(result);
  } catch (error) {
    renderError(error.message);
  } finally {
    button.disabled = false;
    button.textContent = "Run review";
  }
}

function clientHeuristicReview({ manualText, playbook, apiError }) {
  const text = String(manualText || "");
  const normalizedPlaybook = Array.isArray(playbook) ? playbook : [];
  const findings = normalizedPlaybook.map((item, index) => {
    const requiredEvidence = Array.isArray(item.requiredEvidence) ? item.requiredEvidence : [];
    const requiredProgramElements = Array.isArray(item.requiredProgramElements) ? item.requiredProgramElements : [];
    const terms = requiredEvidence.length
      ? requiredEvidence
      : String(item.requirement || "").split(/\W+/).filter((word) => word.length > 4).slice(0, 8);
    const evidence = findClientEvidence(text, terms);
    const score = terms.length ? evidence.length / terms.length : 0;
    const grade = score >= 0.8 ? "pass" : score >= 0.35 ? "partial" : "fail";

    return {
      id: String(item.id || `REQ-${index + 1}`),
      category: String(item.category || "General"),
      requirement: String(item.requirement || ""),
      severity: String(item.severity || "Medium"),
      standardsRefs: Array.isArray(item.standardsRefs) ? item.standardsRefs : [],
      grade,
      score: Number(score.toFixed(2)),
      evidence: evidence.slice(0, 3),
      citation: evidence.length ? "Text match in pasted content" : "No evidence found in available text",
      recommendation: grade === "pass"
        ? "Keep this requirement as written and verify during human review."
        : `Add clear language and evidence for: ${terms.slice(0, 4).join(", ")}.`,
      standardGaps: grade === "pass" ? [] : requiredProgramElements.slice(0, 5),
      confidence: "low",
      needsHumanReview: true
    };
  });

  const earned = findings.reduce((sum, item) => sum + (item.grade === "pass" ? 1 : item.grade === "partial" ? 0.5 : 0), 0);
  const possible = findings.length;

  return {
    mode: "browser fallback",
    summary: {
      overallScore: possible ? Math.round((earned / possible) * 100) : 0,
      pass: findings.filter((item) => item.grade === "pass").length,
      partial: findings.filter((item) => item.grade === "partial").length,
      fail: findings.filter((item) => item.grade === "fail").length,
      needsReview: 0,
      executiveSummary: `The hosted API is currently unavailable, so this is a browser-only heuristic review for pasted text. ${apiError}`
    },
    findings,
    riskMemo: findings.filter((item) => item.grade !== "pass").slice(0, 5).map(operationalRisk)
  };
}

function operationalRisk(item) {
  const risks = {
    "FP-001": "Workers may climb without reliable tie-off, anchorage, inspection, or rescue controls, increasing the likelihood of a fatal fall and a delayed rescue.",
    "RF-001": "Crews may enter active RF fields without shutdown coordination or monitoring, creating uncontrolled exposure and possible injury.",
    "RIG-001": "Unqualified rigging decisions or uninspected gear may cause dropped loads, struck-by injuries, equipment loss, and tower damage.",
    "ELEC-001": "Unclear electrical controls can lead to contact with energized parts, shock, arc injury, fire, or unplanned service interruption.",
    "LOTO-001": "Hazardous energy may be restored or remain present during work, exposing employees to electrocution, crushing, or unexpected startup.",
    "TOWER-001": "Tower work may proceed without authorized climbers, competent oversight, rescue readiness, or coordinated RF and rigging controls.",
    "EAP-001": "Crews may lose critical response time during an emergency because evacuation, communication, responder access, and contacts are undefined.",
    "CS-001": "An unrecognized or uncontrolled confined-space atmosphere can cause incapacitation or fatality and expose rescuers to the same hazard.",
    "CRN-001": "Lifts may proceed without qualified operators, ground assessment, load controls, or power-line clearance, risking collapse or fatal struck-by events.",
    "EXC-001": "Excavation work may proceed without utility locating, protective systems, or safe access, risking cave-in, electrocution, or engulfment."
  };
  const consequence = risks[item.id] || `Accepting this gap leaves ${item.category.toLowerCase()} hazards without a complete, enforceable control process, increasing the chance of injury, work stoppage, inconsistent field decisions, and regulatory or customer exposure.`;
  return `${item.severity} — ${item.category}: ${consequence}`;
}

function findClientEvidence(text, terms) {
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
      matches.push(haystack.slice(start, end).trim());
    }
  }

  return matches;
}

function renderLoading() {
  $("results").innerHTML = `
    <div class="empty-state">
      <h2>Review in progress</h2>
      <p>Checking the manual against the tower safety playbook.</p>
    </div>
  `;
}

function renderError(message) {
  $("results").innerHTML = `
    <div class="error">
      <h2>Review failed</h2>
      <p>${escapeHtml(message)}</p>
    </div>
  `;
}

function renderResults(result) {
  const summary = result.summary || {};
  const findings = Array.isArray(result.findings) ? result.findings : [];
  const memo = Array.isArray(result.riskMemo) ? result.riskMemo : [];

  $("results").innerHTML = `
    <div class="report-header">
      <div class="scorebox">
        <div>
          <strong>${Math.round(summary.overallScore || 0)}</strong>
          <span>/ 100</span>
        </div>
      </div>
      <div>
        <h2>Safety manual scorecard</h2>
        <p>${escapeHtml(summary.executiveSummary || "Review complete. Human safety review is still required before relying on results.")}</p>
        <div class="stats">
          ${stat("Pass", summary.pass)}
          ${stat("Partial", summary.partial)}
          ${stat("Fail", summary.fail)}
          ${stat("Needs review", summary.needsReview)}
        </div>
        ${memo.length ? `<div class="memo"><strong>Operational risk memo</strong><p>${memo.map(escapeHtml).join("<br>")}</p></div>` : ""}
      </div>
    </div>
    <div class="finding-list">
      ${findings.map(renderFinding).join("")}
    </div>
  `;
}

function stat(label, value) {
  return `<div class="stat"><span>${label}</span><strong>${Number(value || 0)}</strong></div>`;
}

function renderFinding(item) {
  const grade = String(item.grade || "needs_review");
  const evidence = Array.isArray(item.evidence) ? item.evidence : [];
  const standardsRefs = Array.isArray(item.standardsRefs) ? item.standardsRefs : [];
  const standardGaps = Array.isArray(item.standardGaps) ? item.standardGaps : [];
  return `
    <article class="finding">
      <div class="finding-top">
        <span class="grade ${escapeHtml(grade)}">${escapeHtml(grade.replace("_", " "))}</span>
        <div>
          <strong>${escapeHtml(item.requirement || "")}</strong>
          <div class="meta">${escapeHtml(item.id || "")} | ${escapeHtml(item.category || "")} | ${escapeHtml(item.severity || "")}</div>
        </div>
        <strong>${Math.round((item.score || 0) * 100)}%</strong>
      </div>
      <div class="finding-body">
        ${standardsRefs.length ? `<div><strong>Standards:</strong> ${standardsRefs.map(escapeHtml).join("; ")}</div>` : ""}
        <div><strong>Citation:</strong> ${escapeHtml(item.citation || "No citation supplied")}</div>
        <div class="evidence">
          ${evidence.length ? evidence.map((line) => `<div class="quote">${escapeHtml(line)}</div>`).join("") : `<div class="quote">No evidence found.</div>`}
        </div>
        ${standardGaps.length ? `<div><strong>Standard gaps:</strong> ${standardGaps.map(escapeHtml).join("; ")}</div>` : ""}
        <div><strong>Recommendation:</strong> ${escapeHtml(item.recommendation || "")}</div>
        <div class="meta">Confidence: ${escapeHtml(item.confidence || "none")} | Human review: ${item.needsHumanReview ? "required" : "optional"}</div>
      </div>
    </article>
  `;
}

function exportJson() {
  if (!lastResult) return;
  const blob = new Blob([JSON.stringify(lastResult, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "tower-safety-review.json";
  anchor.click();
  URL.revokeObjectURL(url);
}

function formatBytes(bytes) {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

init();

