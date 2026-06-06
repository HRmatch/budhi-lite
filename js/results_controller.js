let currentUser = null;
let currentProfile = null;
let currentMatch = null;

document.addEventListener("DOMContentLoaded", async () => {
  currentUser = requireSession();
  if (!currentUser) return;

  renderShell();
  setupTabs();
  setupModal();
  updateKeyState();

  await syncProfilesFromCloud();
  await syncMatchesFromCloud();

  loadIndividual();
  renderPartnerSelect();
  activateInitialTab();

  window.addEventListener("hashchange", activateInitialTab);
});

function updateKeyState() {
  const holder = document.getElementById("keyState");
  if (!holder) return;

  holder.innerHTML = getAPIKey()
    ? `<strong>${t("apiKeyPresent")}</strong>`
    : `<span class="missing">${t("apiKeyMissing")}</span>`;
}

function setupTabs() {
  document.querySelectorAll(".tab").forEach((btn) =>
    btn.addEventListener("click", () => activateTab(btn.dataset.tab, true))
  );
}

function activateTab(tab, writeHash = false) {
  const btn = document.querySelector(`.tab[data-tab="${tab}"]`);
  const panel = document.querySelector(`[data-panel="${tab}"]`);
  if (!btn || !panel) return;

  document.querySelectorAll(".tab").forEach((x) => x.classList.remove("active"));
  btn.classList.add("active");

  document
    .querySelectorAll("[data-panel]")
    .forEach((p) => p.classList.add("hidden"));
  panel.classList.remove("hidden");

  if (writeHash)
    history.replaceState(
      null,
      "",
      tab === "match" ? "#match" : "#individual"
    );
}

function activateInitialTab() {
  if (location.hash === "#match") activateTab("match", false);
  else activateTab("individual", false);
}

function cardHtml(card, scope) {
  const color = card.color || "navy";
  const tags = (card.tags || [])
    .filter(Boolean)
    .map((tag) => `<span class="tag">${ml(tag)}</span>`)
    .join("");

  return `<article class="card ai-clickable dimension ${color}-line" tabindex="0" role="button" data-ai-scope="${scope}" data-ai-key="${
    card.key
  }"><span class="ai-cta">${t("clickAI")}</span><h2 class="section-title"><span class="icon ${color}">${
    card.icon || "◎"
  }</span>${ml(card.title)}</h2><div class="metric"><span class="metric-label">${ml(
    card.metric_label
  )}</span><span class="metric-value">${ml(
    card.metric_value
  )}</span></div><div class="bar"><div class="fill ${color}" style="width:${Number(
    card.bar || 65
  )}%"></div></div><p class="small">${ml(card.description)}</p>${
    tags
      ? `<h3 class="mini-title">${t(
          "overview"
        )}</h3><div class="tags">${tags}</div>`
      : ""
  }</article>`;
}

function loadIndividual() {
  const root = document.getElementById("individualRoot");
  currentProfile = getProfile(currentUser.username);

  if (!currentProfile) {
    root.innerHTML = `<div class="card empty-state"><p class="summary-text">${t(
      "noProfile"
    )}</p><div class="footer-actions"><a class="btn primary" href="./forms.html">${t(
      "start"
    )}</a></div></div>`;
    return;
  }

  renderIndividual(currentProfile, root);
}

function renderIndividual(profile, root) {
root.innerHTML = `
    <section class="hero">
      <div class="hero-top">
        <div>
          <div class="eyebrow">✨ Budhi Lite · Phase 1 Snapshot</div>
          <h1>${ml(profile.results_app.title)}</h1>
          <p>${ml(profile.results_app.overview)}</p>
        </div>
      </div>
    </section>

    <section class="card report-cta-card">
      <div>
        <h2 class="section-title">
          <span class="icon teal">✧</span>${t("personalizedReport")}
        </h2>
        <p class="small">${t("personalizedReportText")}</p>
      </div>
      <a class="btn primary"
         href="./report.html?scope=profile&user=${encodeURIComponent(profile.username)}">
        ${t("generateReport")}
      </a>
    </section>

    <section class="grid four">
      ${profile.results_app.cards.map((c) => cardHtml(c, "profile")).join("")}
    </section>

    <section class="grid three">
      <article class="card">
        <h2 class="section-title">
          <span class="icon navy">💬</span>${t("goldenTip")}
        </h2>
        <p class="summary-text">${ml(profile.results_app.golden_tip)}</p>
      </article>

      <article class="card character-card">
        <h2 class="section-title">
          <span class="icon navy">✦</span>${t("discoverCharacter")}
        </h2>
        <p class="summary-text">${ml(profile.results_app.character_teaser)}</p>
        <p class="small" style="margin-top:12px">${t("completeSelf")}</p>
      </article>

      <article class="card">
        <h2 class="section-title">
          <span class="icon purple">↻</span>${t("editProfile")}
        </h2>
        <p class="small">
          ${profile.source === "demo_seed" ? t("sampleProfilesLoaded") : ""}
        </p>
        <div class="footer-actions">
          <a href="./forms.html" class="btn primary">${t("editProfile")}</a>
        </div>
      </article>
    </section>
  `;

  bindAICards();
}

function renderPartnerSelect() {
  const select = document.getElementById("partnerSelect");
  if (!select) return;

  const profiles = loadProfiles();
  select.innerHTML = "";

  PRESET_USERS.filter((u) => u.username !== currentUser.username).forEach(
    (u) => {
      const opt = document.createElement("option");
      opt.value = u.username;
      opt.textContent = `${u.display_name}${
        profiles[u.username] ? "" : " · " + t("noProfileYet")
      }`;
      select.appendChild(opt);
    }
  );

  document
    .getElementById("generateMatch")
    .addEventListener("click", generateMatch);
}

async function generateMatch() {
  const partner = document.getElementById("partnerSelect").value;
  const root = document.getElementById("matchRoot");

  const profileA = getProfile(currentUser.username);
  const profileB = getProfile(partner);

  if (!profileA || !profileB) {
    root.innerHTML = `<div class="card"><p class="summary-text">${t(
      "noProfile"
    )}</p></div>`;
    return;
  }

  currentMatch = buildMatchLite(profileA, profileB);
  currentMatch.match_id = makeMatchId(currentUser.username, partner);
  currentMatch.user_a = currentUser.username;
  currentMatch.user_b = partner;
  currentMatch.lang = getLang();

  sessionStorage.setItem("budhi_lite_last_match_id", currentMatch.match_id);

  try {
    await saveMatch(currentMatch);
  } catch (err) {
    console.warn("[Budhi Lite] Match cloud save failed.", err);
  }

  renderMatch(currentMatch, root);
}

/* ─────────────────────────────────────────────
   MATCH DIMENSION BREAKDOWN
   Shows the formula's computed shared / convergent /
   potential-friction data directly in the UI.
───────────────────────────────────────────── */

/* Multilingual labels for the new breakdown UI */
function tMatchLabel(key) {
  const lang = getLang();
  const map = {
    sharedGround:      {en:'Common ground',    pt:'Em comum',           es:'En común',            fr:'En commun',        de:'Gemeinsam'},
    compatibleDirs:    {en:'Compatible',       pt:'Compatíveis',        es:'Compatibles',         fr:'Compatibles',      de:'Kompatibel'},
    potentialFrictions:{en:'Potential frictions',pt:'Possíveis atritos',es:'Fricciones posibles', fr:'Frictions possibles',de:'Mögliche Spannungen'},
    valueDynamics:     {en:'Value dynamics',   pt:'Dinâmica de valores',es:'Dinámica de valores', fr:'Dynamique des valeurs',de:'Wertedynamik'},
    pillarDynamics:    {en:'Pillar dynamics',  pt:'Dinâmica de pilares',es:'Dinámica de pilares', fr:'Dynamique des piliers',de:'Säulendynamik'},
    decisionRhythm:    {en:'Decision rhythm',  pt:'Ritmo de decisão',   es:'Ritmo de decisión',  fr:'Rythme décisionnel',de:'Entscheidungsrhythmus'},
    worldviewPairing:  {en:'Worldview pairing',pt:'Visões de mundo',    es:'Visiones de mundo',  fr:'Vision du monde',   de:'Weltanschauungs-Paarung'},
  };
  return (map[key] || {})[lang] || (map[key] || {}).en || key;
}

/* Resolve a raw formula code (e.g. 'honesty') to a display label */
function resolveDimCode(code, type) {
  if (!code) return '';
  if (typeof code === 'object') { try { return ml(code); } catch(_) {} }
  const s = String(code);
  try {
    if (type === 'value')  { const lbl = valueLabel(s);  if (lbl) return ml(lbl) || s; }
    if (type === 'pillar') { const lbl = pillarLabel(s); if (lbl) return ml(lbl) || s; }
  } catch(_) {}
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function matchDimensionBreakdownHtml(match) {
  const dims = match?.results_app?.dimensions || {};
  const vd   = dims.values   || {};
  const pd   = dims.pillars  || {};
  const dd   = dims.decision || {};
  const wd   = dims.worldview|| {};

  const vShared = (vd.shared    || []).map(c => resolveDimCode(c, 'value')).filter(Boolean);
  const vConv   = (vd.convergent|| []).map(([a,b]) => `${resolveDimCode(a,'value')} · ${resolveDimCode(b,'value')}`).filter(Boolean);
  const vFric   = (vd.divergent || []).map(([a,b]) => `${resolveDimCode(a,'value')} · ${resolveDimCode(b,'value')}`).filter(Boolean);

  const pShared = (pd.shared    || []).map(c => resolveDimCode(c, 'pillar')).filter(Boolean);
  const pConv   = (pd.convergent|| []).map(([a,b]) => `${resolveDimCode(a,'pillar')} · ${resolveDimCode(b,'pillar')}`).filter(Boolean);
  const pFric   = (pd.divergent || []).map(([a,b]) => `${resolveDimCode(a,'pillar')} · ${resolveDimCode(b,'pillar')}`).filter(Boolean);

  const decTags  = (dd.tags || []).map(t => ml(t) || '').filter(Boolean);
  const wvPair   = (wd.pair || []).map(t => ml(t) || '').filter(Boolean);
  const wvType   = wd.type ? ml(wd.type) || '' : '';

  const hasValues  = vShared.length || vConv.length || vFric.length;
  const hasPillars = pShared.length || pConv.length || pFric.length;
  if (!hasValues && !hasPillars) return '';

  function tagGroup(label, items, style) {
    if (!items.length) return '';
    const tagStyle = {
      green: 'background:rgba(16,185,129,0.12);color:#065f46;border-color:rgba(16,185,129,0.3)',
      teal:  'background:rgba(20,184,166,0.10);color:#0f766e;border-color:rgba(20,184,166,0.25)',
      amber: 'background:rgba(245,158,11,0.12);color:#92400e;border-color:rgba(245,158,11,0.3)',
    }[style] || '';
    return `<div style="margin-top:10px">
      <p class="small" style="margin:0 0 6px;font-weight:500;color:var(--color-text-secondary)">${label}</p>
      <div class="tags">${items.map(i => `<span class="tag" style="${tagStyle}">${i}</span>`).join('')}</div>
    </div>`;
  }

  function dimCard(icon, color, title, shared, conv, fric) {
    return `<article class="card">
      <h2 class="section-title"><span class="icon ${color}">${icon}</span>${title}</h2>
      ${tagGroup(tMatchLabel('sharedGround'),       shared, 'green')}
      ${tagGroup(tMatchLabel('compatibleDirs'),     conv,   'teal')}
      ${tagGroup(tMatchLabel('potentialFrictions'), fric,   'amber')}
    </article>`;
  }

  const valCard = hasValues
    ? dimCard('♡', 'gold',  tMatchLabel('valueDynamics'),  vShared, vConv, vFric)
    : '';
  const pilCard = hasPillars
    ? dimCard('▣', 'green', tMatchLabel('pillarDynamics'), pShared, pConv, pFric)
    : '';

  /* Decision & worldview compact strip */
  const rhythmCard = decTags.length === 2 ? `<article class="card">
    <h2 class="section-title"><span class="icon blue">↗</span>${tMatchLabel('decisionRhythm')}</h2>
    <div class="tags" style="margin-top:10px">
      ${decTags.map(s => `<span class="tag">${s}</span>`).join('<span style="margin:0 4px;opacity:.45">↔</span>')}
    </div>
    <p class="small" style="margin-top:8px;color:var(--color-text-secondary)">${ml(dd.type)||''} · ${ml(dd.alignment)||''}</p>
  </article>` : '';

  const wvCard = wvPair.length === 2 ? `<article class="card">
    <h2 class="section-title"><span class="icon purple">◎</span>${tMatchLabel('worldviewPairing')}</h2>
    <div class="tags" style="margin-top:10px">
      ${wvPair.map(l => `<span class="tag">${l}</span>`).join('<span style="margin:0 4px;opacity:.45">↔</span>')}
    </div>
    <p class="small" style="margin-top:8px;color:var(--color-text-secondary)">${wvType}</p>
  </article>` : '';

  return `
    <section class="grid equal-two" style="margin-top:1.4rem">${valCard}${pilCard}</section>
    ${rhythmCard || wvCard ? `<section class="grid equal-two">${rhythmCard}${wvCard}</section>` : ''}
  `;
}

function renderList(items, color) {
  return `<div class="list">${(items || [])
    .map(
      (it) =>
        `<div class="item"><span class="dot ${color}"></span><div><strong>${ml(
          it.title || it.gap
        )}</strong><span>${ml(it.description) || it.severity || ""}</span></div></div>`
    )
    .join("")}</div>`;
}

function renderMatch(match, root) {
  const app = match.results_app;

  root.innerHTML = `<section class="hero"><div class="hero-top"><div><div class="eyebrow">✨ Budhi Lite · Match Lite</div><h1>${t(
    "match"
  )}: ${match.users.join(" & ")}</h1><p>${ml(
    app.overview
  )}</p></div><aside class="score-card"><div class="score-label">${t(
    "compatibilityScore"
  )}</div><div class="score-number">${
    app.score
  }%</div></aside></div></section><section class="card report-cta-card"><div><h2 class="section-title"><span class="icon teal">✧</span>${t(
    "matchPersonalizedReport"
  )}</h2><p class="small">${t(
    "matchPersonalizedReportText"
  )}</p></div><a class="btn primary" href="./report.html?scope=match&id=${encodeURIComponent(
    match.match_id || makeMatchId(match.user_a, match.user_b)
  )}">${t(
    "generateReport"
  )}</a></section><section class="grid four">${app.cards
    .map((c) => cardHtml(c, "match"))
    .join("")}</section>${matchDimensionBreakdownHtml(match)}<section class="grid two"><article class="card"><h2 class="section-title"><span class="icon navy">🏷️</span>${t(
    "matchType"
  )}</h2><p class="summary-text"><strong>${ml(
    app.match_type.label
  )}</strong></p></article><article class="card"><h2 class="section-title"><span class="icon navy">💬</span>${t(
    "goldenTip"
  )}</h2><p class="summary-text">${ml(
    app.golden_tip
  )}</p></article></section><section class="grid three"><article class="card"><h2 class="section-title"><span class="icon blue">⚙</span>${t(
    "keyDynamics"
  )}</h2>${renderList(
    app.dynamics,
    "blue"
  )}</article><article class="card"><h2 class="section-title"><span class="icon green">★</span>${t(
    "strengths"
  )}</h2>${renderList(
    app.strengths,
    "green"
  )}</article><article class="card"><h2 class="section-title"><span class="icon gold">⚠</span>${t(
    "challenges"
  )}</h2>${renderList(
    app.challenges,
    "gold"
  )}</article></section><section class="grid two"><article class="card"><h2 class="section-title"><span class="icon purple">🧩</span>${t(
    "matchGaps"
  )}</h2>${renderList(app.gaps, "purple")}</article></section>`;

  bindAICards();
}

function bindAICards() {
  document.querySelectorAll("[data-ai-key]").forEach((card) => {
    card.onclick = () => openAIDetails(card.dataset.aiScope, card.dataset.aiKey);

    card.onkeydown = (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openAIDetails(card.dataset.aiScope, card.dataset.aiKey);
      }
    };
  });
}

function setupModal() {
  const modal = document.getElementById("aiDetailsModal");

  modal
    .querySelector(".ai-modal-close")
    .addEventListener("click", closeModal);

  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
}

function setModalLoading() {
  document.getElementById("aiModalTitle").textContent = t("loadingAI");
  document.getElementById(
    "aiModalDescription"
  ).innerHTML = `<span class="loader"></span> ${t("loadingAI")}`;
  document.getElementById("aiModalStrengths").innerHTML = "";
  document.getElementById("aiModalChallenges").innerHTML = "";
  document.getElementById("aiModalFootnote").textContent = "";
}

function renderModal(data) {
  document.getElementById("aiModalTitle").textContent =
    data.title || "AI Details";
  document.getElementById("aiModalDescription").textContent =
    data.description || "";

  document.getElementById("aiModalStrengths").innerHTML = (data.strengths || [])
    .slice(0, 3)
    .map((x) => `<li>${x}</li>`)
    .join("");

  document.getElementById("aiModalChallenges").innerHTML = (
    data.challenges || []
  )
    .slice(0, 3)
    .map((x) => `<li>${x}</li>`)
    .join("");

  document.getElementById("aiModalFootnote").textContent = data._note || "";
}

async function openAIDetails(scope, key) {
  const modal = document.getElementById("aiDetailsModal");
  modal.classList.add("is-open");

  document.body.style.overflow = "hidden";

  setModalLoading();

  const data = await generateAIDetails({
    scope,
    key,
    profile: currentProfile,
    match: currentMatch,
  });

  renderModal(data);
}

function closeModal() {
  const modal = document.getElementById("aiDetailsModal");
  modal.classList.remove("is-open");
  document.body.style.overflow = "";
}

