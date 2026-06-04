const defaultPlaybook = [
  {
    id: "FP-001",
    category: "Fall Protection",
    requirement: "The manual requires 100 percent fall protection while climbing or working at height.",
    severity: "Critical",
    passCriteria: "Requires continuous tie-off or equivalent fall protection for tower climbing and elevated work.",
    partialCriteria: "Mentions fall protection but does not clearly require continuous protection.",
    failCriteria: "Does not require fall protection or allows unsupported free climbing.",
    requiredEvidence: ["100% tie-off", "continuous fall protection", "fall arrest", "anchorage", "climbing"]
  },
  {
    id: "RES-001",
    category: "Tower Rescue",
    requirement: "The manual includes a tower rescue plan with trained rescuers and rescue equipment.",
    severity: "Critical",
    passCriteria: "Requires a rescue plan, rescue-trained personnel, and accessible rescue equipment before work begins.",
    partialCriteria: "Mentions rescue but lacks training, equipment, or timing requirements.",
    failCriteria: "No tower rescue procedure or rescue readiness requirement.",
    requiredEvidence: ["rescue plan", "rescue kit", "trained rescuer", "emergency response", "EMS"]
  },
  {
    id: "RF-001",
    category: "RF Exposure",
    requirement: "The manual controls RF exposure before and during tower work.",
    severity: "High",
    passCriteria: "Requires RF assessment, coordination/shutdown where needed, signage, and controlled access.",
    partialCriteria: "Mentions RF hazards but lacks specific controls.",
    failCriteria: "No RF exposure control process.",
    requiredEvidence: ["RF exposure", "radio frequency", "shutdown", "monitor", "controlled area", "signage"]
  },
  {
    id: "JHA-001",
    category: "Pre-task Planning",
    requirement: "The manual requires a documented JHA or tailboard before field work.",
    severity: "High",
    passCriteria: "Requires documented hazard assessment with crew review before starting work.",
    partialCriteria: "Mentions hazard awareness but not a documented pre-task process.",
    failCriteria: "No pre-task hazard planning requirement.",
    requiredEvidence: ["JHA", "job hazard analysis", "tailboard", "pre-task", "hazard assessment"]
  },
  {
    id: "RIG-001",
    category: "Rigging and Hoisting",
    requirement: "The manual defines safe hoisting and rigging controls for tower work.",
    severity: "High",
    passCriteria: "Requires qualified riggers, lift planning, equipment inspection, tag lines, and dropped-object controls.",
    partialCriteria: "Mentions hoisting or rigging but lacks specific controls.",
    failCriteria: "No hoisting or rigging safety requirements.",
    requiredEvidence: ["rigging", "hoisting", "qualified rigger", "lift plan", "tag line", "dropped object"]
  },
  {
    id: "ELEC-001",
    category: "Electrical and LOTO",
    requirement: "The manual requires lockout/tagout and electrical hazard controls.",
    severity: "High",
    passCriteria: "Requires LOTO, verification of de-energization, and boundaries around energized equipment.",
    partialCriteria: "Mentions electrical safety without a clear LOTO process.",
    failCriteria: "No electrical isolation or LOTO requirement.",
    requiredEvidence: ["lockout", "tagout", "LOTO", "de-energized", "electrical hazard", "grounding"]
  },
  {
    id: "WX-001",
    category: "Weather",
    requirement: "The manual sets weather limits for tower work.",
    severity: "Medium",
    passCriteria: "Defines stop-work limits for lightning, wind, ice, and heat/cold stress.",
    partialCriteria: "Mentions weather but not clear work limits.",
    failCriteria: "No weather-related stop-work guidance.",
    requiredEvidence: ["lightning", "wind", "ice", "heat stress", "cold stress", "stop work"]
  },
  {
    id: "PPE-001",
    category: "PPE",
    requirement: "The manual lists required PPE for tower field work.",
    severity: "Medium",
    passCriteria: "Defines PPE including hard hat, gloves, eye protection, footwear, and fall protection gear.",
    partialCriteria: "Lists general PPE but misses tower-specific gear.",
    failCriteria: "No PPE requirements.",
    requiredEvidence: ["PPE", "hard hat", "gloves", "eye protection", "boots", "harness"]
  }
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
        <div><strong>Citation:</strong> ${escapeHtml(item.citation || "No citation supplied")}</div>
        <div class="evidence">
          ${evidence.length ? evidence.map((line) => `<div class="quote">${escapeHtml(line)}</div>`).join("") : `<div class="quote">No evidence found.</div>`}
        </div>
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
