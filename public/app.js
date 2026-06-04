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

const sampleManual = `Tower Operations Safety Manual

All climbing work requires continuous fall protection. Climbers must maintain 100% tie-off while ascending, descending, and working from the structure. Harnesses, lanyards, fall arrest systems, and anchorage points must be inspected before use.

Before field work starts, the crew lead will conduct a documented JHA and tailboard meeting. The team must review site hazards, access limits, weather, equipment, and stop-work authority.

Tower rescue readiness is required before climbing. A rescue plan, rescue kit, and at least one trained rescuer must be available on site. Emergency response access and EMS contact information must be confirmed.

RF exposure must be assessed before work. The supervisor will coordinate radio shutdowns or controlled area restrictions when RF exposure may exceed limits. RF signage and monitor readings must be reviewed.

Rigging and hoisting tasks require a lift plan, qualified rigger, inspected equipment, tag lines when practical, and dropped-object controls.

Electrical work requires lockout/tagout. Equipment must be de-energized and verified before work unless an approved energized-work plan is used.

Work stops during lightning, unsafe wind, ice accumulation, or heat/cold stress conditions that cannot be controlled.
`;

let selectedFile = null;
let selectedFileBase64 = "";
let lastResult = null;

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
    $("manualText").value = await selectedFile.text();
    return;
  }

  selectedFileBase64 = await fileToBase64(selectedFile);
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      resolve(result.includes(",") ? result.split(",")[1] : result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
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
    const payload = {
      apiKey: $("apiKey").value,
      model: $("model").value,
      companyContext: $("companyContext").value,
      manualText: $("manualText").value,
      playbook: parsePlaybook(),
      file: selectedFileBase64
        ? {
            name: selectedFile?.name || "manual.pdf",
            type: selectedFile?.type || "application/pdf",
            base64: selectedFileBase64
          }
        : null
    };

    const response = await fetch("/api/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Review failed.");
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

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

init();
