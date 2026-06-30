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

function reportUrl(scope, subject, refresh) {
  const params = new URLSearchParams();
  params.set("scope", scope);
  if (scope === "match") {
    const id = subject?.match_id || makeMatchId(subject?.user_a, subject?.user_b);
    params.set("id", id);
  } else {
    params.set("user", subject?.username || currentUser?.username || "");
  }
  if (refresh) params.set("refresh", Date.now().toString());
  return `./report.html?${params.toString()}`;
}

function reportStatus(scope, subject) {
  try {
    if (typeof getPersonalizedReportCacheStatus !== "function") return { has_current_language:false, has_original:false };
    return getPersonalizedReportCacheStatus({
      scope,
      profile: scope === "profile" ? subject : null,
      match: scope === "match" ? subject : null,
      lang: getLang()
    });
  } catch (_) {
    return { has_current_language:false, has_original:false };
  }
}

function reportCtaHtml(scope, subject) {
  const status = reportStatus(scope, subject);
  const hasCurrent = status.has_current_language;
  const hasAny = status.has_current_language || status.has_original;
  const titleKey = scope === "match" ? "matchPersonalizedReport" : "personalizedReport";
  const textKey = hasCurrent
    ? "savedReportAvailableText"
    : (hasAny ? "reportTranslationAvailableText" : (scope === "match" ? "matchPersonalizedReportText" : "personalizedReportText"));
  const primaryLabel = hasCurrent ? t("viewSavedReport") : (hasAny ? t("viewReport") : t("generateReport"));
  const secondary = hasCurrent
    ? `<a class="btn ghost" href="${reportUrl(scope, subject, true)}">${t("regenerateReport")}</a>`
    : "";

  return `<section class="card report-cta-card">
      <div>
        <h2 class="section-title">
          <span class="icon teal">✧</span>${t(titleKey)}
        </h2>
        <p class="small">${t(textKey)}</p>
      </div>
      <div class="footer-actions">
        <a class="btn primary" href="${reportUrl(scope, subject, false)}">${primaryLabel}</a>
        ${secondary}
      </div>
    </section>`;
}


function goldenTipDomId(scope){
  return `${scope}GoldenTipText`;
}

function goldenTipCardHtml(scope, subject){
  const id = goldenTipDomId(scope);
  return `<article class="card golden-tip-card" data-golden-tip-scope="${scope}">
        <h2 class="section-title">
          <span class="icon navy">💬</span>${t("goldenTip")}
        </h2>
        <p class="summary-text" id="${id}">${t("loadingAI")}</p>
      </article>`;
}

async function hydrateGoldenTip(scope, subject){
  const el = document.getElementById(goldenTipDomId(scope));
  if(!el || !subject) return;

  if(typeof getOrCreateGoldenTip !== "function"){
    el.textContent = t("ai_fallback_error");
    return;
  }

  el.innerHTML = `<span class="loader"></span> ${t("loadingAI")}`;

  try{
    const data = await getOrCreateGoldenTip({
      scope,
      profile: scope === "profile" ? subject : null,
      match: scope === "match" ? subject : null
    });
    el.textContent = data?.text || t("ai_fallback_error");
  }catch(err){
    console.warn("[Budhi Lite] Golden Tip generation failed.", err);
    el.textContent = t("ai_fallback_error");
  }
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

    ${reportCtaHtml("profile", profile)}

    <section class="grid four">
      ${profile.results_app.cards.map((c) => cardHtml(c, "profile")).join("")}
    </section>

    <section class="grid three">
      ${goldenTipCardHtml("profile", profile)}

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
  hydrateGoldenTip("profile", profile);
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

  const generateBtn = document.getElementById("generateMatch");
  generateBtn?.addEventListener("click", () => openOrGenerateMatch(false));

  ensureMatchActionControls();
  select.addEventListener("change", () => {
    updateMatchActionState();
    renderSavedMatchPreviewForSelection(false);
  });

  updateMatchActionState();
  renderSavedMatchPreviewForSelection(true);
}

function ensureMatchActionControls() {
  const generateBtn = document.getElementById("generateMatch");
  if (!generateBtn || document.getElementById("regenerateMatch")) return;

  const holder = generateBtn.parentElement;
  const regen = document.createElement("button");
  regen.id = "regenerateMatch";
  regen.type = "button";
  regen.className = "btn ghost";
  regen.style.marginTop = "10px";
  regen.textContent = t("regenerateMatchLite");
  regen.addEventListener("click", () => openOrGenerateMatch(true));
  holder.appendChild(regen);

  const status = document.createElement("p");
  status.id = "savedMatchStatus";
  status.className = "small";
  status.style.marginTop = "8px";
  holder.appendChild(status);
}

function getSelectedPartner() {
  return document.getElementById("partnerSelect")?.value || "";
}

function getMatchIdForPartner(partner) {
  return makeMatchId(currentUser.username, partner);
}

function getPartnerFromMatchId(matchId) {
  const parts = String(matchId || "").split("__").filter(Boolean);
  return parts.find((p) => p !== currentUser.username) || parts[0] || "";
}

function hydrateSavedMatch(match, fallbackPartner) {
  if (!match) return null;

  const matchId = match.match_id || getMatchIdForPartner(fallbackPartner);
  const parts = String(matchId || "").split("__").filter(Boolean);

  const userA = match.user_a || parts[0] || currentUser.username;
  const userB = match.user_b || parts[1] || fallbackPartner;
  const profileA = userA ? getProfile(userA) : null;
  const profileB = userB ? getProfile(userB) : null;

  return {
    ...match,
    match_id: matchId,
    user_a: userA,
    user_b: userB,
    usernames: match.usernames || [userA, userB].filter(Boolean),
    users:
      match.users ||
      [profileA?.display_name || userA, profileB?.display_name || userB].filter(
        Boolean
      ),
  };
}

function getSavedMatchForPartner(partner) {
  const matchId = getMatchIdForPartner(partner);
  return hydrateSavedMatch(getMatch(matchId), partner);
}

function updateMatchActionState() {
  const partner = getSelectedPartner();
  const generateBtn = document.getElementById("generateMatch");
  const regenBtn = document.getElementById("regenerateMatch");
  const status = document.getElementById("savedMatchStatus");
  if (!partner || !generateBtn) return;

  const existing = getSavedMatchForPartner(partner);
  generateBtn.textContent = existing ? t("openSavedMatch") : t("generateMatch");

  if (regenBtn) {
    regenBtn.hidden = !existing;
    regenBtn.textContent = t("regenerateMatchLite");
  }

  if (status) {
    status.textContent = existing ? t("savedMatchAvailable") : t("noSavedMatchYet");
  }
}

function renderSavedMatchPreviewForSelection(preferLastMatch) {
  const root = document.getElementById("matchRoot");
  const select = document.getElementById("partnerSelect");
  if (!root || !select) return;

  let partner = getSelectedPartner();

  if (preferLastMatch) {
    const lastId = sessionStorage.getItem("budhi_lite_last_match_id") || "";
    const lastPartner = getPartnerFromMatchId(lastId);
    if (lastPartner && [...select.options].some((opt) => opt.value === lastPartner)) {
      partner = lastPartner;
      select.value = lastPartner;
    }
  }

  const existing = getSavedMatchForPartner(partner);
  if (existing) {
    currentMatch = existing;
    sessionStorage.setItem("budhi_lite_last_match_id", existing.match_id);
    renderMatch(existing, root);
  } else {
    currentMatch = null;
    root.innerHTML = "";
  }

  updateMatchActionState();
}

function buildFreshMatchForPartner(partner, resetAI) {
  const profileA = getProfile(currentUser.username);
  const profileB = getProfile(partner);

  if (!profileA || !profileB) return null;

  const match = buildMatchLite(profileA, profileB);
  match.match_id = getMatchIdForPartner(partner);
  match.user_a = currentUser.username;
  match.user_b = partner;
  match.lang = getLang();
  match.results_ai = resetAI ? {} : match.results_ai || {};
  if (resetAI) match.__replace_results_ai = true;

  return match;
}

async function openOrGenerateMatch(forceRegenerate) {
  const partner = getSelectedPartner();
  const root = document.getElementById("matchRoot");
  if (!partner || !root) return;

  if (typeof syncMatchesFromCloud === "function") {
    try {
      await syncMatchesFromCloud();
    } catch (err) {
      console.warn("[Budhi Lite] Could not refresh saved matches before opening.", err);
    }
  }

  const existing = getSavedMatchForPartner(partner);

  if (existing && !forceRegenerate) {
    currentMatch = existing;
    sessionStorage.setItem("budhi_lite_last_match_id", existing.match_id);
    renderMatch(existing, root);
    updateMatchActionState();
    return;
  }

  const fresh = buildFreshMatchForPartner(partner, Boolean(forceRegenerate));
  if (!fresh) {
    root.innerHTML = `<div class="card"><p class="summary-text">${t(
      "noProfile"
    )}</p></div>`;
    return;
  }

  sessionStorage.setItem("budhi_lite_last_match_id", fresh.match_id);

  try {
    currentMatch = await saveMatch(fresh);
    currentMatch = hydrateSavedMatch(currentMatch, partner);
  } catch (err) {
    console.warn("[Budhi Lite] Match cloud save failed.", err);
    currentMatch = fresh;
  }

  renderMatch(currentMatch, root);
  updateMatchActionState();
}

/* Backwards-compatible alias for older event bindings */
async function generateMatch() {
  return openOrGenerateMatch(false);
}

/* ─────────────────────────────────────────────
   MATCH DIMENSION PRESENTATION
   Presentation-only merge: the formula still returns the same
   cards and dimensions, but the UI combines each main card with
   its complementary breakdown data so the match shows 4 cards,
   not 8.
───────────────────────────────────────────── */

/* Multilingual labels for the merged match cards */
function tMatchLabel(key) {
  const lang = getLang();
  const map = {
    sharedGround:       {en:'Common ground',       pt:'Em comum',              es:'En común',              fr:'En commun',              de:'Gemeinsam'},
    compatibleDirs:     {en:'Compatible',          pt:'Compatíveis',           es:'Compatibles',           fr:'Compatibles',            de:'Kompatibel'},
    potentialFrictions: {en:'Potential frictions', pt:'Possíveis atritos',     es:'Fricciones posibles',   fr:'Frictions possibles',    de:'Mögliche Spannungen'},
    valueDynamics:      {en:'Value dynamics',      pt:'Dinâmica de valores',   es:'Dinámica de valores',   fr:'Dynamique des valeurs',  de:'Wertedynamik'},
    pillarDynamics:     {en:'Pillar dynamics',     pt:'Dinâmica de pilares',   es:'Dinámica de pilares',   fr:'Dynamique des piliers',  de:'Säulendynamik'},
    decisionRhythm:     {en:'Decision rhythm',     pt:'Ritmo de decisão',      es:'Ritmo de decisión',     fr:'Rythme décisionnel',     de:'Entscheidungsrhythmus'},
    worldviewPairing:   {en:'Worldview pairing',   pt:'Visões de mundo',       es:'Visiones de mundo',     fr:'Vision du monde',        de:'Weltanschauungs-Paarung'},
    styles:             {en:'Styles',              pt:'Estilos',               es:'Estilos',               fr:'Styles',                 de:'Stile'},
    perspectives:       {en:'Perspectives',        pt:'Perspectivas',          es:'Perspectivas',          fr:'Perspectives',           de:'Perspektiven'},
    noDirectLinks:      {en:'No direct links detected in this layer.', pt:'Nenhuma conexão direta detectada nesta camada.', es:'No se detectaron vínculos directos en esta capa.', fr:'Aucun lien direct détecté dans cette couche.', de:'Keine direkten Verbindungen in dieser Ebene erkannt.'}
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

function getMatchDimensionPresentationData(match) {
  const dims = match?.results_app?.dimensions || {};
  const vd   = dims.values   || {};
  const pd   = dims.pillars  || {};
  const dd   = dims.decision || {};
  const wd   = dims.worldview|| {};

  return {
    values: {
      shared: (vd.shared || []).map(c => resolveDimCode(c, 'value')).filter(Boolean),
      compatible: (vd.convergent || []).map(([a,b]) => `${resolveDimCode(a,'value')} · ${resolveDimCode(b,'value')}`).filter(Boolean),
      frictions: (vd.divergent || []).map(([a,b]) => `${resolveDimCode(a,'value')} · ${resolveDimCode(b,'value')}`).filter(Boolean)
    },
    pillars: {
      shared: (pd.shared || []).map(c => resolveDimCode(c, 'pillar')).filter(Boolean),
      compatible: (pd.convergent || []).map(([a,b]) => `${resolveDimCode(a,'pillar')} · ${resolveDimCode(b,'pillar')}`).filter(Boolean),
      frictions: (pd.divergent || []).map(([a,b]) => `${resolveDimCode(a,'pillar')} · ${resolveDimCode(b,'pillar')}`).filter(Boolean)
    },
    decision: {
      tags: (dd.tags || []).map(t => ml(t) || '').filter(Boolean),
      type: dd.type ? ml(dd.type) || '' : '',
      alignment: dd.alignment ? ml(dd.alignment) || '' : ''
    },
    worldview: {
      pair: (wd.pair || []).map(t => ml(t) || '').filter(Boolean),
      type: wd.type ? ml(wd.type) || '' : '',
      alignment: wd.alignment ? ml(wd.alignment) || '' : ''
    }
  };
}

function matchTagGroup(label, items, style) {
  if (!items || !items.length) return '';
  const tagStyle = {
    green: 'background:rgba(16,185,129,0.12);color:#065f46;border-color:rgba(16,185,129,0.3)',
    teal:  'background:rgba(20,184,166,0.10);color:#0f766e;border-color:rgba(20,184,166,0.25)',
    amber: 'background:rgba(245,158,11,0.12);color:#92400e;border-color:rgba(245,158,11,0.3)'
  }[style] || '';

  return `<div style="margin-top:12px">
    <p class="small" style="margin:0 0 6px;font-weight:600;color:var(--color-text-secondary)">${label}</p>
    <div class="tags">${items.map(i => `<span class="tag" style="${tagStyle}">${i}</span>`).join('')}</div>
  </div>`;
}

function matchPairTags(label, items) {
  if (!items || !items.length) return '';
  return `<div style="margin-top:12px">
    <p class="small" style="margin:0 0 6px;font-weight:600;color:var(--color-text-secondary)">${label}</p>
    <div class="tags">${items.map(i => `<span class="tag">${i}</span>`).join('<span style="margin:0 4px;opacity:.45">↔</span>')}</div>
  </div>`;
}

function matchMergedDetailsHtml(cardKey, match) {
  const data = getMatchDimensionPresentationData(match);

  if (cardKey === 'decision') {
    const details = [
      matchPairTags(tMatchLabel('styles'), data.decision.tags),
      data.decision.type || data.decision.alignment
        ? `<p class="small" style="margin-top:10px;color:var(--color-text-secondary)">${[data.decision.type, data.decision.alignment].filter(Boolean).join(' · ')}</p>`
        : ''
    ].join('');
    return details ? `<div style="margin-top:14px"><h3 class="mini-title">${tMatchLabel('decisionRhythm')}</h3>${details}</div>` : '';
  }

  if (cardKey === 'values') {
    const details = [
      matchTagGroup(tMatchLabel('sharedGround'), data.values.shared, 'green'),
      matchTagGroup(tMatchLabel('compatibleDirs'), data.values.compatible, 'teal'),
      matchTagGroup(tMatchLabel('potentialFrictions'), data.values.frictions, 'amber')
    ].join('');
    return `<div style="margin-top:14px"><h3 class="mini-title">${tMatchLabel('valueDynamics')}</h3>${details || `<p class="small">${tMatchLabel('noDirectLinks')}</p>`}</div>`;
  }

  if (cardKey === 'pillars') {
    const details = [
      matchTagGroup(tMatchLabel('sharedGround'), data.pillars.shared, 'green'),
      matchTagGroup(tMatchLabel('compatibleDirs'), data.pillars.compatible, 'teal'),
      matchTagGroup(tMatchLabel('potentialFrictions'), data.pillars.frictions, 'amber')
    ].join('');
    return `<div style="margin-top:14px"><h3 class="mini-title">${tMatchLabel('pillarDynamics')}</h3>${details || `<p class="small">${tMatchLabel('noDirectLinks')}</p>`}</div>`;
  }

  if (cardKey === 'worldview') {
    const details = [
      matchPairTags(tMatchLabel('perspectives'), data.worldview.pair),
      data.worldview.type || data.worldview.alignment
        ? `<p class="small" style="margin-top:10px;color:var(--color-text-secondary)">${[data.worldview.type, data.worldview.alignment].filter(Boolean).join(' · ')}</p>`
        : ''
    ].join('');
    return details ? `<div style="margin-top:14px"><h3 class="mini-title">${tMatchLabel('worldviewPairing')}</h3>${details}</div>` : '';
  }

  return '';
}

function matchCardHtml(card, match) {
  const color = card.color || "navy";
  const details = matchMergedDetailsHtml(card.key, match);

  return `<article class="card ai-clickable dimension ${color}-line" tabindex="0" role="button" data-ai-scope="match" data-ai-key="${card.key}">
    <span class="ai-cta">${t("clickAI")}</span>
    <h2 class="section-title"><span class="icon ${color}">${card.icon || "◎"}</span>${ml(card.title)}</h2>
    <div class="metric"><span class="metric-label">${ml(card.metric_label)}</span><span class="metric-value">${ml(card.metric_value)}</span></div>
    <p class="small">${ml(card.description)}</p>
    ${details}
  </article>`;
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
  }%</div></aside></div></section>${reportCtaHtml("match", match)}<section class="grid four">${app.cards
    .map((c) => matchCardHtml(c, match))
    .join("")}</section><section class="grid three"><article class="card"><h2 class="section-title"><span class="icon blue">⚙</span>${t(
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
  )}</article></section><section class="grid two">${goldenTipCardHtml(
    "match",
    match
  )}<article class="card"><h2 class="section-title"><span class="icon purple">🧩</span>${t(
    "matchGaps"
  )}</h2>${renderList(app.gaps, "purple")}</article></section>`;

  bindAICards();
  hydrateGoldenTip("match", match);
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

  const data = await getOrCreateAIDetails({
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

