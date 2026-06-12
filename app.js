// Live H1 Performance to Plan dashboard.
// Fetches each Vault project referenced in plan.js and renders the dashboard.
//
// Vault project JSON endpoint (Rails .json convention, SSO-protected):
//   GET https://vault.shopify.io/projects/{id}.json
//
// If the endpoint shape changes, adjust normalizeProject() below.

const VAULT_BASE = "https://vault.shopify.io/projects";

const PHASE_ORDER = ["Prototype", "Build", "Observe", "Release", "Done"];
const PHASE_COLORS = {
  "Off Vault": "var(--phase-offvault)",
  "Prototype": "var(--phase-prototype)",
  "Build":     "var(--phase-build)",
  "Observe":   "var(--phase-observe)",
  "Release":   "var(--phase-release)",
  "Done":      "var(--phase-done)",
  "Paused":    "var(--paused)",
  "Stopped":   "var(--stopped)"
};

const IN_PROGRESS_OR_DONE = new Set(PHASE_ORDER);

async function fetchProject(id) {
  const url = `${VAULT_BASE}/${id}.json`;
  try {
    const res = await fetch(url, { credentials: "include", headers: { "Accept": "application/json" } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return normalizeProject(id, data);
  } catch (err) {
    console.warn(`Vault fetch failed for ${id}:`, err);
    return { id, phase: "Unknown", status: "unknown", title: `#${id}`, url: `${VAULT_BASE}/${id}`, fetchError: true };
  }
}

function normalizeProject(id, raw) {
  // Vault project JSON shape is inferred — adjust keys as needed once we see real responses.
  // Common possibilities: { project: {...} } or top-level fields.
  const p = raw.project || raw;
  const phase = (p.phase || p.state || p.current_phase || "Unknown").toString();
  const status = (p.status || p.health || "on_track").toString();
  const title = p.title || p.name || `#${id}`;
  const url = p.url || `${VAULT_BASE}/${id}`;
  return { id, phase, status, title, url };
}

function phasePill(phase, status) {
  const cls = phase.toLowerCase().replace(/\s+/g, "");
  return `<span class="phase-pill ${cls}">${phase}</span>`;
}

function projectRow(outcome, project) {
  if (outcome.offVault || !project) {
    return `
      <div class="project">
        ${phasePill("Off Vault")}
        <div>
          <div>${outcome.outcome}</div>
          <div class="project-id">${outcome.priority} · ${outcome.owner}</div>
        </div>
        <div></div>
        <div class="project-status">no GSD project</div>
      </div>`;
  }
  const atRisk = project.status === "at_risk" || project.status === "off_track";
  const paused = project.phase === "Paused" || project.status === "paused";
  const rowClass = atRisk ? "at-risk" : paused ? "paused" : "";
  const statusText = atRisk ? "AT RISK" : paused ? "Paused" : project.status.replace(/_/g, " ");
  const statusCls = atRisk ? "risk" : "on-track";
  return `
    <div class="project ${rowClass}">
      ${phasePill(project.phase)}
      <div>
        <a class="project-title" href="${project.url}" target="_blank" rel="noopener">${project.title}</a>
        <div class="project-id">${outcome.priority} · ${outcome.owner} · #${project.id}</div>
      </div>
      <div></div>
      <div class="project-status ${statusCls}">${statusText}</div>
    </div>`;
}

function renderBet(bet, projects) {
  const total = bet.outcomes.length;
  const inFlight = bet.outcomes.filter(o => {
    if (o.offVault) return false;
    const p = projects[o.vaultId];
    return p && IN_PROGRESS_OR_DONE.has(p.phase);
  }).length;
  const pct = total ? Math.round((inFlight / total) * 100) : 0;

  // Phase breakdown for this bet
  const breakdown = {};
  bet.outcomes.forEach(o => {
    if (o.offVault) { breakdown["Off Vault"] = (breakdown["Off Vault"] || 0) + 1; return; }
    const p = projects[o.vaultId];
    const phase = p && p.phase ? p.phase : "Unknown";
    breakdown[phase] = (breakdown[phase] || 0) + 1;
  });
  const barSegments = Object.entries(breakdown)
    .map(([phase, n]) => `<div style="flex: ${n}; background: ${PHASE_COLORS[phase] || "#94a3b8"};" title="${phase}: ${n}"></div>`)
    .join("");

  const rows = bet.outcomes.map(o => projectRow(o, o.offVault ? null : projects[o.vaultId])).join("");

  return `
    <div class="bet">
      <div class="bet-header">
        <div>
          <h3 class="bet-title">${bet.title}</h3>
          <div class="bet-meta">${bet.blurb}</div>
        </div>
        <div class="bet-meta"><strong>${pct}%</strong> in flight · ${inFlight} / ${total}</div>
      </div>
      <div class="bet-bar">${barSegments}</div>
      <div class="project-list">${rows}</div>
    </div>`;
}

function renderAggregate(allOutcomes, projects) {
  let inFlight = 0;
  const breakdown = { "Off Vault": 0 };
  allOutcomes.forEach(o => {
    if (o.offVault) { breakdown["Off Vault"]++; return; }
    const p = projects[o.vaultId];
    if (!p) return;
    breakdown[p.phase] = (breakdown[p.phase] || 0) + 1;
    if (IN_PROGRESS_OR_DONE.has(p.phase)) inFlight++;
  });
  const total = allOutcomes.length;
  const pct = total ? Math.round((inFlight / total) * 100) : 0;

  // Donut
  const C = 2 * Math.PI * 50;
  const dash = (pct / 100) * C;
  document.getElementById("donut-fill").setAttribute("stroke-dasharray", `${dash} ${C - dash}`);
  document.getElementById("donut-pct").textContent = `${pct}%`;
  document.getElementById("aggregate-sub").innerHTML =
    `<strong>${total}</strong> intended outcomes · <strong>${inFlight}</strong> in flight or done · <strong>${breakdown["Off Vault"]}</strong> off Vault`;

  // Phase bar
  const bar = Object.entries(breakdown)
    .sort(([a], [b]) => {
      const order = ["Off Vault", "Prototype", "Build", "Observe", "Release", "Done"];
      return order.indexOf(a) - order.indexOf(b);
    })
    .map(([phase, n]) => `<div style="flex: ${n}; background: ${PHASE_COLORS[phase] || "#94a3b8"};" title="${phase}: ${n}"></div>`)
    .join("");
  document.getElementById("phase-bar").innerHTML = bar;

  // Legend
  const legend = Object.entries(breakdown)
    .sort(([a], [b]) => {
      const order = ["Off Vault", "Prototype", "Build", "Observe", "Release", "Done"];
      return order.indexOf(a) - order.indexOf(b);
    })
    .map(([phase, n]) => `<span><span class="swatch" style="background: ${PHASE_COLORS[phase] || "#94a3b8"};"></span>${phase} (${n})</span>`)
    .join("");
  document.getElementById("phase-legend").innerHTML = legend;
}

function renderOffVault(plan) {
  const items = [];
  plan.bets.forEach(bet => {
    bet.outcomes.filter(o => o.offVault).forEach(o => items.push({ ...o, bet: bet.title.split(":")[0] }));
  });
  document.getElementById("off-vault-list").innerHTML = items.map(o => `
    <div class="off-vault-item">
      <div>${o.outcome} <span class="project-id">· ${o.priority} · ${o.owner}</span></div>
      <span class="bet-tag">${o.bet}</span>
    </div>
  `).join("") || `<div class="loading">All intended outcomes have Vault projects.</div>`;
}

function renderPaused(plan, projects) {
  document.getElementById("paused-list").innerHTML = plan.paused.map(p => {
    const project = projects[p.vaultId];
    const title = project ? project.title : p.label;
    const url = project ? project.url : `${VAULT_BASE}/${p.vaultId}`;
    return `
      <div class="paused-item">
        <div>
          <a class="project-title" href="${url}" target="_blank" rel="noopener">${title}</a>
          <span class="project-id">#${p.vaultId}</span>
        </div>
        <div><span class="bet-tag">${p.reason}</span> <span class="bet-tag">${p.bet}</span></div>
      </div>`;
  }).join("");
}

async function main() {
  const plan = window.H1_PLAN;
  const allOutcomes = plan.bets.flatMap(b => b.outcomes);
  const idsToFetch = [
    ...new Set([
      ...allOutcomes.filter(o => !o.offVault).map(o => o.vaultId),
      ...plan.paused.map(p => p.vaultId)
    ])
  ];

  document.getElementById("last-updated").textContent =
    `Updated ${new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}`;

  // Parallel fetch
  const results = await Promise.all(idsToFetch.map(fetchProject));
  const projects = {};
  results.forEach(r => { projects[r.id] = r; });

  renderAggregate(allOutcomes, projects);
  document.getElementById("bets-container").innerHTML = plan.bets.map(b => renderBet(b, projects)).join("");
  renderOffVault(plan);
  renderPaused(plan, projects);

  // Check for fetch errors and surface them
  const failedCount = Object.values(projects).filter(p => p.fetchError).length;
  if (failedCount > 0) {
    const banner = document.createElement("div");
    banner.className = "error";
    banner.innerHTML = `⚠️ ${failedCount} Vault project(s) failed to load. Are you signed into vault.shopify.io? <a href="https://vault.shopify.io" target="_blank" rel="noopener">Sign in</a> and refresh.`;
    document.querySelector("main").prepend(banner);
  }
}

main().catch(err => {
  console.error(err);
  document.querySelector("main").innerHTML = `<div class="error">Failed to load dashboard: ${err.message}</div>`;
});
