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
  root.innerHTML = `<section class="hero"><div class="hero-top"><div><div class="eyebrow">✨ Budhi Lite · Phase 1 Snapshot</div><h1>${ml(
    profile.results_app.title
  )}</h1><p>${ml(
    profile.results_app.overview
  )}</p></div></div></section><section class="card report-cta-card"><div><h2 class="section-title"><span class="icon teal">✧</span>${t(
    "personalizedReport"
  )}</h2><p class="small">${t(
    "personalizedReportText"
  )}</p></div><a class="btn primary" href="./report.html?scope=profile&user=${encodeURIComponent(
    profile.username
  )}">${t(
    "generateReport"
  )}</a></section><section class="grid four">${profile.results_app.cards
    .map((c) => cardHtml(c, "profile"))
    .join(
      ""
    )}</section><section class="grid two"><article class="card character-card"><h2 class="section-title"><span class="icon navy">✦</span>${t(
    "discoverCharacter"
  )}</h2><p class="summary-text">${ml(
    profile.results_app.character_teaser
  )}</p><p class="small" style="margin-top:12px">${t(
    "completeSelf"
  )}</p></article><article class="card"><h2 class="section-title"><span class="icon purple">↻</span>${t(
    "editProfile"
  )}</h2><p class="small">${
    profile.source === "demo_seed" ? t("sampleProfilesLoaded") : ""
  }</p><div class="footer-actions"><a href="./forms.html" class="btn primary">${t(
    "editProfile"
  )}</a></div></article></section>`;

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
    .join(
      ""
    )}</section><section class="grid two"><article class="card"><h2 class="section-title"><span class="icon navy">🏷️</span>${t(
    "matchType"
  )}</h2><p class="summary-text"><strong>${ml(
    app.match_type.label
  )}</strong></p></article><article class="card"><h2 class="section-title"><span class="icon navy">💬</span>${t(
    "goldTip"
  )}</h2><p class="summary-text">${ml(
    app.gold_tip
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
    "tensions"
  )}</h2>${renderList(
    app.tensions,
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
