let reportCurrentUser = null;
let reportScope = 'profile';
let reportProfile = null;
let reportMatch = null;

document.addEventListener('DOMContentLoaded', async () => {
  reportCurrentUser = requireSession();
  if(!reportCurrentUser) return;

  renderShell();

  const root = document.getElementById('reportRoot');
  root.innerHTML = `<div class="card report-loading-card"><span class="loader"></span><p class="summary-text">${t('generatingReport')}</p></div>`;

  await syncProfilesFromCloud();
  await syncMatchesFromCloud();

  const params = new URLSearchParams(location.search);
  reportScope = params.get('scope') === 'match' ? 'match' : 'profile';

  try{
    if(reportScope === 'match'){
      const id = params.get('id') || sessionStorage.getItem('budhi_lite_last_match_id');
      reportMatch = hydrateMatchRecord(getMatch(id));
      if(!reportMatch) throw new Error('Missing match context.');
      const force = params.has('refresh');
      const report = await getOrCreatePersonalizedReport({scope:'match', match:reportMatch, force});
      renderReport(report, {scope:'match', match:reportMatch});
    }else{
      const username = params.get('user') || reportCurrentUser.username;
      reportProfile = getProfile(username);
      if(!reportProfile) throw new Error('Missing profile context.');
      const force = params.has('refresh');
      const report = await getOrCreatePersonalizedReport({scope:'profile', profile:reportProfile, force});
      renderReport(report, {scope:'profile', profile:reportProfile});
    }
  }catch(err){
    root.innerHTML = `<div class="card empty-state"><p class="summary-text">${t('noReportContext')}</p><p class="small">${escapeHtml(err.message || '')}</p><div class="footer-actions"><a class="btn primary" href="./results.html">${t('backToResults')}</a></div></div>`;
  }
});

function hydrateMatchRecord(match){
  if(!match) return null;
  const userA = match.user_a || (match.usernames || [])[0];
  const userB = match.user_b || (match.usernames || [])[1];
  const profileA = userA ? getProfile(userA) : null;
  const profileB = userB ? getProfile(userB) : null;
  const users = match.users || [
    profileA?.display_name || userA,
    profileB?.display_name || userB
  ].filter(Boolean);
  const usernames = match.usernames || [userA, userB].filter(Boolean);
  return {...match, users, usernames, user_a:userA, user_b:userB};
}

function escapeHtml(value){
  return String(value ?? '')
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#039;');
}

function listHtml(items){
  return `<ul class="report-list">${(items || []).map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
}

function sectionHtml(section, index){
  return `
    <details class="report-accordion" ${index === 0 ? 'open' : ''}>
      <summary>
        <span>
          <strong>${escapeHtml(section.title)}</strong>
          ${section.subtitle ? `<em>${escapeHtml(section.subtitle)}</em>` : ''}
        </span>
        <span class="accordion-symbol">+</span>
      </summary>
      <div class="accordion-body">
        <p>${escapeHtml(section.description)}</p>
        <div class="grid equal-two report-mini-grid">
          <div>
            <h4>${t('strengths')}</h4>
            ${listHtml(section.strengths)}
          </div>
          <div>
            <h4>${t('challenges')}</h4>
            ${listHtml(section.challenges)}
          </div>
        </div>
      </div>
    </details>
  `;
}

function renderReport(report, context){
  const root = document.getElementById('reportRoot');
  const scopeLabel = context.scope === 'match' ? t('matchReport') : t('individualReport');
  const sourceNote = report._note ? `<p class="modal-footnote">${escapeHtml(report._note)}</p>` : '';

  root.innerHTML = `
    <section class="report-hero">
      <div>
        <div class="eyebrow">✦ ${scopeLabel}</div>
        <h1>${escapeHtml(report.title)}</h1>
        ${report.subtitle ? `<p>${escapeHtml(report.subtitle)}</p>` : ''}
      </div>
      <div class="report-actions">
        <a class="btn ghost" href="./results.html${context.scope === 'match' ? '#match' : ''}">${t('backToResults')}</a>
        <button class="btn primary" id="regenerateReport">${t('regenerateReport')}</button>
      </div>
    </section>

    <section class="report-section">
      <p class="section-label">${t('description')}</p>
      <div class="card report-description-card">
        <p class="summary-text">${escapeHtml(report.description)}</p>
        ${sourceNote}
      </div>
    </section>

    <section class="grid equal-two report-grid">
      <article class="card report-insight-card">
        <h2 class="section-title"><span class="icon green">★</span>${t('strengths')}</h2>
        ${listHtml(report.strengths)}
      </article>
      <article class="card report-insight-card">
        <h2 class="section-title"><span class="icon amber">⚠</span>${t('challenges')}</h2>
        ${listHtml(report.challenges)}
      </article>
    </section>

    <section class="report-section">
      <p class="section-label">${t('integratedAnalysis')}</p>
      <article class="card report-cross-card">
        <h2 class="section-title"><span class="icon teal">∞</span>${escapeHtml(report.cross_analysis.title)}</h2>
        <p class="summary-text">${escapeHtml(report.cross_analysis.description)}</p>
        ${listHtml(report.cross_analysis.bullets)}
      </article>
    </section>

    <section class="report-section">
      <p class="section-label">${t('resultBreakdown')}</p>
      <div class="report-accordion-stack">
        ${(report.sections || []).map(sectionHtml).join('')}
      </div>
    </section>
  `;

  document.getElementById('regenerateReport').addEventListener('click', () => {
    const params = new URLSearchParams(location.search);
    params.set('refresh', Date.now().toString());
    location.search = params.toString();
  });
}
