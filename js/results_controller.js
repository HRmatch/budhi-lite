let currentUser=null;
let currentProfile=null;
let currentMatch=null;

document.addEventListener('DOMContentLoaded', async ()=>{
  currentUser=requireSession();
  if(!currentUser) return;

  renderShell();
  setupTabs();
  setupModal();
  updateKeyState();

  await syncProfilesFromCloud();
  await syncMatchesFromCloud();

  loadIndividual();
  renderPartnerSelect();
  activateInitialTab();

  window.addEventListener('hashchange', activateInitialTab);
});

function updateKeyState(){
  const holder=document.getElementById('keyState');
  if(!holder) return;
  holder.innerHTML=getAPIKey()?`<strong>${t('apiKeyPresent')}</strong>`:`<span class="missing">${t('apiKeyMissing')}</span>`;
}

function setupTabs(){
  document.querySelectorAll('.tab').forEach(btn=>btn.addEventListener('click',()=>activateTab(btn.dataset.tab, true)));
}

function activateTab(tab, writeHash=false){
  const btn=document.querySelector(`.tab[data-tab="${tab}"]`);
  const panel=document.querySelector(`[data-panel="${tab}"]`);
  if(!btn||!panel) return;

  document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('[data-panel]').forEach(p=>p.classList.add('hidden'));
  panel.classList.remove('hidden');

  if(writeHash) history.replaceState(null, '', tab==='match'?'#match':'#individual');
}

function activateInitialTab(){
  if(location.hash==='#match') activateTab('match', false);
  else activateTab('individual', false);
}

function cardHtml(card, scope){
  const color=card.color||'navy';
  const tags=(card.tags||[]).filter(Boolean).map(tag=>`<span class="tag">${ml(tag)}</span>`).join('');
  return `
    <article class="card ai-clickable dimension ${color}-line" tabindex="0" role="button" data-ai-scope="${scope}" data-ai-key="${card.key}">
      <span class="ai-cta">${t('clickAI')}</span>
      <h2 class="section-title"><span class="icon ${color}">${card.icon||'◎'}</span>${ml(card.title)}</h2>
      <div class="metric">
        <span class="metric-label">${ml(card.metric_label)}</span>
        <span class="metric-value">${ml(card.metric_value)}</span>
      </div>
      <div class="bar"><div class="fill ${color}" style="width:${Number(card.bar||65)}%"></div></div>
      <p class="small">${ml(card.description)}</p>
      ${tags?`<h3 class="mini-title">${t('overview')}</h3><div class="tags">${tags}</div>`:''}
    </article>
  `;
}

function reportActionsHtml(scope){
  return `
    <section class="card report-trigger-card">
      <div>
        <h2 class="section-title"><span class="icon teal">✦</span>${t('personalizedReport')}</h2>
        <p class="small">${t('personalizedReportHint')}</p>
      </div>
      <button class="btn primary" type="button" data-report-scope="${scope}">${t('generatePersonalizedReport')}</button>
    </section>
    <section id="${scope}ReportRoot" class="personalized-report-root"></section>
  `;
}

function loadIndividual(){
  const root=document.getElementById('individualRoot');
  currentProfile=getProfile(currentUser.username);

  if(!currentProfile){
    root.innerHTML=`<div class="card empty-state"><p class="summary-text">${t('noProfile')}</p><div class="footer-actions"><a class="btn primary" href="./forms.html">${t('start')}</a></div></div>`;
    return;
  }

  renderIndividual(currentProfile, root);
}

function renderIndividual(profile, root){
  root.innerHTML=`
    <section class="hero">
      <div class="hero-top">
        <div>
          <div class="eyebrow">✨ Budhi Lite · Phase 1 Snapshot</div>
          <h1>${ml(profile.results_app.title)}</h1>
          <p>${ml(profile.results_app.overview)}</p>
        </div>
      </div>
    </section>

    <section class="grid four">
      ${profile.results_app.cards.map(c=>cardHtml(c,'profile')).join('')}
    </section>

    ${reportActionsHtml('profile')}

    <section class="grid two">
      <article class="card character-card">
        <h2 class="section-title"><span class="icon navy">✦</span>${t('discoverCharacter')}</h2>
        <p class="summary-text">${ml(profile.results_app.character_teaser)}</p>
        <p class="small" style="margin-top:12px">${t('completeSelf')}</p>
      </article>
      <article class="card">
        <h2 class="section-title"><span class="icon purple">↻</span>${t('editProfile')}</h2>
        <p class="small">${profile.source==='demo_seed'?t('sampleProfilesLoaded'):''}</p>
        <div class="footer-actions"><a href="./forms.html" class="btn primary">${t('editProfile')}</a></div>
      </article>
    </section>
  `;

  bindAICards();
  bindReportButtons();

  if(profile.results_ai && profile.results_ai.full_report){
    renderPersonalizedReport('profile', profile.results_ai.full_report);
  }
}

function renderPartnerSelect(){
  const select=document.getElementById('partnerSelect');
  if(!select) return;

  const profiles=loadProfiles();
  select.innerHTML='';

  PRESET_USERS.filter(u=>u.username!==currentUser.username).forEach(u=>{
    const opt=document.createElement('option');
    opt.value=u.username;
    opt.textContent=`${u.display_name}${profiles[u.username]?'':' · '+t('noProfileYet')}`;
    select.appendChild(opt);
  });

  document.getElementById('generateMatch').addEventListener('click', generateMatch);
}

async function generateMatch(){
  const partner=document.getElementById('partnerSelect').value;
  const root=document.getElementById('matchRoot');
  const profileA=getProfile(currentUser.username);
  const profileB=getProfile(partner);

  if(!profileA || !profileB){
    root.innerHTML=`<div class="card"><p class="summary-text">${t('noProfile')}</p></div>`;
    return;
  }

  currentMatch=buildMatchLite(profileA, profileB);
  currentMatch.match_id = makeMatchId(currentUser.username, partner);
  currentMatch.user_a = currentUser.username;
  currentMatch.user_b = partner;
  currentMatch.lang = getLang();

  const savedMatch = getMatch(currentMatch.match_id);
  if(savedMatch && savedMatch.results_ai){
    currentMatch.results_ai = savedMatch.results_ai;
  }

  renderMatch(currentMatch, root);

  try {
    await saveMatch(currentMatch);
  } catch(err) {
    console.warn('[Budhi Lite] Match cloud save failed.', err);
  }
}

function fallbackListItems(kind){
  const map = {
    strengths: [
      {title:t('strengths'), description:t('fallbackStrengthOne')},
      {title:t('overview'), description:t('fallbackStrengthTwo')},
      {title:t('goldTip'), description:t('fallbackStrengthThree')}
    ],
    tensions: [
      {title:t('tensions'), description:t('fallbackChallengeOne')},
      {title:t('overview'), description:t('fallbackChallengeTwo')},
      {title:t('goldTip'), description:t('fallbackChallengeThree')}
    ],
    gaps: [
      {gap:t('matchGaps'), description:t('fallbackGapOne'), severity:'low'},
      {gap:t('overview'), description:t('fallbackGapTwo'), severity:'low'},
      {gap:t('goldTip'), description:t('fallbackGapThree'), severity:'low'}
    ],
    dynamics: [
      {title:t('keyDynamics'), description:t('fallbackDynamicOne')},
      {title:t('overview'), description:t('fallbackDynamicTwo')},
      {title:t('goldTip'), description:t('fallbackDynamicThree')}
    ]
  };
  return map[kind] || map.dynamics;
}

function normalizeListItems(items, kind){
  const valid = (Array.isArray(items) ? items : []).filter(it => {
    const title = ml(it.title || it.gap);
    const desc = ml(it.description) || it.severity;
    return title || desc;
  });

  return valid.length ? valid : fallbackListItems(kind);
}

function renderList(items, color, kind='dynamics'){
  const safeItems = normalizeListItems(items, kind);
  return `<div class="list">${safeItems.map(it=>`
    <div class="item">
      <span class="dot ${color}"></span>
      <div>
        <strong>${ml(it.title||it.gap)}</strong>
        <span>${ml(it.description)||it.severity||''}</span>
      </div>
    </div>`).join('')}</div>`;
}

function renderMatch(match, root){
  const app=match.results_app;

  root.innerHTML=`
    <section class="hero">
      <div class="hero-top">
        <div>
          <div class="eyebrow">✨ Budhi Lite · Match Lite</div>
          <h1>${t('match')}: ${match.users.join(' & ')}</h1>
          <p>${ml(app.overview)}</p>
        </div>
        <aside class="score-card">
          <div class="score-label">${t('compatibilityScore')}</div>
          <div class="score-number">${app.score}%</div>
        </aside>
      </div>
    </section>

    <section class="grid four">
      ${app.cards.map(c=>cardHtml(c,'match')).join('')}
    </section>

    ${reportActionsHtml('match')}

    <section class="grid two">
      <article class="card">
        <h2 class="section-title"><span class="icon navy">🏷️</span>${t('matchType')}</h2>
        <p class="summary-text"><strong>${ml(app.match_type.label)}</strong></p>
      </article>
      <article class="card">
        <h2 class="section-title"><span class="icon navy">💬</span>${t('goldTip')}</h2>
        <p class="summary-text">${ml(app.gold_tip)}</p>
      </article>
    </section>

    <section class="grid three">
      <article class="card"><h2 class="section-title"><span class="icon blue">⚙</span>${t('keyDynamics')}</h2>${renderList(app.dynamics,'blue','dynamics')}</article>
      <article class="card"><h2 class="section-title"><span class="icon green">★</span>${t('strengths')}</h2>${renderList(app.strengths,'green','strengths')}</article>
      <article class="card"><h2 class="section-title"><span class="icon gold">⚠</span>${t('tensions')}</h2>${renderList(app.tensions,'gold','tensions')}</article>
    </section>

    <section class="grid two">
      <article class="card"><h2 class="section-title"><span class="icon purple">🧩</span>${t('matchGaps')}</h2>${renderList(app.gaps,'purple','gaps')}</article>
    </section>
  `;

  bindAICards();
  bindReportButtons();

  if(match.results_ai && match.results_ai.full_report){
    renderPersonalizedReport('match', match.results_ai.full_report);
  }
}

function bindAICards(){
  document.querySelectorAll('[data-ai-key]').forEach(card=>{
    card.onclick=()=>openAIDetails(card.dataset.aiScope, card.dataset.aiKey);
    card.onkeydown=(e)=>{
      if(e.key==='Enter'||e.key===' '){
        e.preventDefault();
        openAIDetails(card.dataset.aiScope,card.dataset.aiKey);
      }
    };
  });
}

function bindReportButtons(){
  document.querySelectorAll('[data-report-scope]').forEach(btn=>{
    btn.onclick=()=>openPersonalizedReport(btn.dataset.reportScope, btn);
  });
}

function setupModal(){
  const modal=document.getElementById('aiDetailsModal');
  modal.querySelector('.ai-modal-close').addEventListener('click', closeModal);
  modal.addEventListener('click', e=>{if(e.target===modal) closeModal()});
  document.addEventListener('keydown', e=>{if(e.key==='Escape') closeModal()});
}

function setModalLoading(){
  document.getElementById('aiModalTitle').textContent=t('loadingAI');
  document.getElementById('aiModalDescription').innerHTML='<span class="loader"></span> '+t('loadingAI');
  document.getElementById('aiModalStrengths').innerHTML='';
  document.getElementById('aiModalChallenges').innerHTML='';
  document.getElementById('aiModalFootnote').textContent='';
}

function safeModalList(items, fallback){
  const safe = ensureDetailArray3 ? ensureDetailArray3(items, fallback) : (Array.isArray(items) && items.length ? items : fallback);
  return safe.slice(0,3).map(x=>`<li>${x}</li>`).join('');
}

function renderModal(data){
  const fallback = {
    title:'AI Details',
    description:'This card summarizes a first-layer Budhi Lite insight.',
    strengths:['Provides a first-layer insight.','Can support reflection.','Can be compared in Match Lite.'],
    challenges:['It is not a final classification.','It depends on Phase 1 data only.','Context should be considered.']
  };

  document.getElementById('aiModalTitle').textContent=data.title||fallback.title;
  document.getElementById('aiModalDescription').textContent=data.description||fallback.description;
  document.getElementById('aiModalStrengths').innerHTML=safeModalList(data.strengths, fallback.strengths);
  document.getElementById('aiModalChallenges').innerHTML=safeModalList(data.challenges, fallback.challenges);
  document.getElementById('aiModalFootnote').textContent=data._note||'';
}

async function openAIDetails(scope,key){
  const modal=document.getElementById('aiDetailsModal');
  modal.classList.add('is-open');
  document.body.style.overflow='hidden';

  setModalLoading();

  const data=await generateAIDetails({scope,key,profile:currentProfile,match:currentMatch});
  renderModal(data);
}

function closeModal(){
  const modal=document.getElementById('aiDetailsModal');
  modal.classList.remove('is-open');
  document.body.style.overflow='';
}

function setReportLoading(scope){
  const root = document.getElementById(`${scope}ReportRoot`);
  if(!root) return;

  root.innerHTML=`
    <section class="card personalized-report">
      <p class="summary-text"><span class="loader"></span> ${t('reportLoading')}</p>
    </section>
  `;
}

function renderReportBullets(items){
  const safe = ensureArray3 ? ensureArray3(items, []) : (Array.isArray(items) ? items : []);
  return `<ul>${safe.map(x=>`<li>${x}</li>`).join('')}</ul>`;
}

function renderPersonalizedReport(scope, report){
  const root = document.getElementById(`${scope}ReportRoot`);
  if(!root) return;

  const safe = normalizePersonalizedReport
    ? normalizePersonalizedReport(report, scope==='match' ? fallbackMatchReport(currentMatch) : fallbackProfileReport(currentProfile))
    : report;

  root.innerHTML=`
    <article class="card personalized-report">
      <div class="report-header">
        <div>
          <p class="section-label">${t('personalizedReport')}</p>
          <h2>${safe.title}</h2>
        </div>
        <span class="tiny-pill">${safe._source === 'ai' ? t('aiGenerated') : t('fallbackUsed')}</span>
      </div>

      <p class="summary-text">${safe.intro}</p>

      <div class="report-section-grid">
        ${(safe.sections||[]).map(section=>`
          <section class="report-section">
            <h3>${section.title}</h3>
            <p>${section.body}</p>
            ${renderReportBullets(section.bullets)}
          </section>
        `).join('')}
      </div>

      <div class="grid three report-lists">
        <section class="report-list-card">
          <h3>${t('strengths')}</h3>
          ${renderReportBullets(safe.strengths)}
        </section>
        <section class="report-list-card">
          <h3>${t('challenges')}</h3>
          ${renderReportBullets(safe.challenges)}
        </section>
        <section class="report-list-card">
          <h3>${t('recommendations')}</h3>
          ${renderReportBullets(safe.recommendations)}
        </section>
      </div>

      <p class="quote report-closing">${safe.closing}</p>
      <p class="modal-footnote">${safe._note || ''}</p>
    </article>
  `;
}

async function openPersonalizedReport(scope, btn){
  if(scope === 'match' && !currentMatch) return;
  if(scope === 'profile' && !currentProfile) return;

  const original = btn.textContent;
  btn.disabled = true;
  btn.textContent = t('reportLoading');
  setReportLoading(scope);

  const report = await generatePersonalizedReport({
    scope,
    profile: currentProfile,
    match: currentMatch
  });

  renderPersonalizedReport(scope, report);

  try {
    if(scope === 'profile'){
      currentProfile.results_ai = currentProfile.results_ai || {};
      currentProfile.results_ai.full_report = report;
      await saveProfile(currentUser.username, currentProfile);
    } else {
      currentMatch.results_ai = currentMatch.results_ai || {};
      currentMatch.results_ai.full_report = report;
      await saveMatch(currentMatch);
    }
  } catch(err) {
    console.warn('[Budhi Lite] Report generated, but online save failed.', err);
  }

  btn.disabled = false;
  btn.textContent = original;
}
