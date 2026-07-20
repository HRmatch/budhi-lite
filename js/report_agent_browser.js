// Budhi Lite — Full report agent (browser-side)
// Generates the personalized deep report in report.html
// The user's OpenAI key is read from sessionStorage and never stored elsewhere.

/* ─────────────────────────────────────────────
   UTILITIES
───────────────────────────────────────────── */

function reportLang() {
  return typeof getLang === 'function' ? getLang() : 'en';
}

function reportMl(obj, fallback) {
  fallback = fallback || '';
  try { return ml(obj) || fallback; } catch(_) { return fallback; }
}

function cleanText(value) {
  const s = (value === null || value === undefined) ? '' : String(value).trim();
  return s;
}

function cleanArray(arr, fallback, count) {
  count = count || 3;
  const base = Array.isArray(arr) ? arr : [];
  const cleaned = base.map(x => cleanText(x)).filter(Boolean);
  const out = [];
  const seen = new Set();
  cleaned.forEach(item => {
    const marker = item.toLowerCase();
    if (!seen.has(marker) && out.length < count) {
      seen.add(marker);
      out.push(item);
    }
  });
  return out;
}


function reportFallbackMessage() {
  if (typeof aiFallbackError === 'function') return aiFallbackError();
  return typeof t === 'function' ? t('ai_fallback_error') : 'ai_fallback_error';
}

function reportErrorFallback({scope, profile, match}) {
  const message = reportFallbackMessage();
  return {
    title: message,
    subtitle: '',
    description: message,
    strengths: [],
    challenges: [],
    cross_analysis: {
      title: '',
      description: '',
      bullets: []
    },
    sections: [],
    _error: true,
    error: true,
    message,
    _source: 'ai_fallback_error',
    _note: '',
    generated_at: reportNow()
  };
}

/* ─────────────────────────────────────────────
   LABEL RESOLUTION
   Converts multilingual objects to the current
   UI language string. Self-contained so this
   file works without openai_client_browser.js.
───────────────────────────────────────────── */

function rptResolveLabel(val) {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string') return val;
  if (Array.isArray(val)) return val.map(rptResolveLabel).join(', ');
  if (typeof val === 'object') {
    try { return ml(val) || val.en || Object.values(val).find(Boolean) || ''; }
    catch(_) { return val.en || Object.values(val).find(Boolean) || ''; }
  }
  return String(val);
}

/* ─────────────────────────────────────────────
   PROFILE CONTEXT EXTRACTION
   Pulls the user's actual selections so the AI
   can reference them by name throughout the report.
───────────────────────────────────────────── */

function extractProfileContext(profile) {
  if (!profile) return null;
  const app   = profile.results_app || {};
  const cards = app.cards || [];
  const get   = key => cards.find(c => c.key === key);

  const valCard = get('values');
  const pilCard = get('pillars');
  const decCard = get('decision');
  const wvCard  = get('worldview');

  // NOVO: Extrai a cor e busca o significado completo
const colorKey = profile.answers?.Qt2 || '';
  let colorMeaning = ''; 
  if (colorKey && typeof QT2_MEANINGS !== 'undefined' && QT2_MEANINGS[colorKey]) {
    colorMeaning = rptResolveLabel(QT2_MEANINGS[colorKey]);
  }

  return {
    display_name:    profile.display_name || profile.username || 'User',
    language:        profile.language || reportLang(),
    current_mood:    profile.answers?.Qt1 || '',
    symbolic_traits: colorMeaning, // <- Chave renomeada
    selected_values: (valCard?.tags  || []).map(rptResolveLabel).filter(Boolean),
    selected_pillars:(pilCard?.tags  || []).map(rptResolveLabel).filter(Boolean),
    decision_style:  rptResolveLabel(decCard?.metric_value),
    worldview:       rptResolveLabel(wvCard?.metric_value),
    decision_bar:    decCard?.bar || 0,
    cards_resolved: cards.map(c => ({
      key:         c.key,
      title:       rptResolveLabel(c.title),
      metric:      rptResolveLabel(c.metric_value),
      bar:         c.bar,
      description: rptResolveLabel(c.description),
      tags:        (c.tags || []).map(rptResolveLabel).filter(Boolean),
    })),
  };
}

/* ─────────────────────────────────────────────
   CENTRALIZED AI ERROR FALLBACKS
   Preserve the report shape expected by the UI,
   but use only the standard i18n error message.
───────────────────────────────────────────── */

function buildFallbackSection(cardKey, cardResolved, ctx) {
  const message = reportFallbackMessage();
  return {
    key: cardKey || '',
    title: message,
    subtitle: '',
    description: message,
    strengths: [],
    challenges: [],
    _error: true,
    error: true,
    message,
    _source: 'ai_fallback_error',
    _note: ''
  };
}

function fallbackProfileReport(profile) {
  return reportErrorFallback({ scope: 'profile', profile, match: null });
}

function fallbackMatchReport(match) {
  return reportErrorFallback({ scope: 'match', profile: null, match });
}

/* ─────────────────────────────────────────────
   NORMALIZE AI RESPONSE
   Keeps only the fields returned by the AI.
   Missing text fields remain empty; no local fallback
   content is injected.
───────────────────────────────────────────── */

function normalizeReport(raw) {
  const data = raw && typeof raw === 'object' ? raw : {};
  const sectionsRaw = Array.isArray(data.result_sections) ? data.result_sections
    : (Array.isArray(data.sections) ? data.sections : []);

  const sections = sectionsRaw.map(candidate => ({
    key:         cleanText(candidate?.key),
    title:       cleanText(candidate?.title),
    subtitle:    cleanText(candidate?.subtitle),
    description: cleanText(candidate?.description),
    strengths:   cleanArray(candidate?.strengths,  null, 3),
    challenges:  cleanArray(candidate?.challenges, null, 3),
  }));

  return {
    title:       cleanText(data.title),
    subtitle:    cleanText(data.subtitle),
    description: cleanText(data.description),
    strengths:   cleanArray(data.strengths,  null, 3),
    challenges:  cleanArray(data.challenges, null, 3),
    cross_analysis: {
      title:       cleanText(data.cross_analysis?.title || data.integrated_analysis?.title),
      description: cleanText(data.cross_analysis?.description || data.integrated_analysis?.description),
      bullets:     cleanArray(data.cross_analysis?.bullets || data.integrated_analysis?.bullets, null, 3),
    },
    sections,
    generated_at: reportNow(),
  };
}

function hasUsableReport(raw) {
  if (!raw || typeof raw !== 'object') return false;
  const sectionsRaw = Array.isArray(raw.result_sections) ? raw.result_sections
    : (Array.isArray(raw.sections) ? raw.sections : []);
  return Boolean(
    cleanText(raw.description) ||
    cleanArray(raw.strengths, null, 3).length ||
    cleanArray(raw.challenges, null, 3).length ||
    cleanText(raw.cross_analysis?.description || raw.integrated_analysis?.description) ||
    cleanArray(raw.cross_analysis?.bullets || raw.integrated_analysis?.bullets, null, 3).length ||
    sectionsRaw.some(section => cleanText(section?.description) || cleanArray(section?.strengths, null, 3).length || cleanArray(section?.challenges, null, 3).length)
  );
}

/* ─────────────────────────────────────────────
   MAIN FUNCTION
   Generates the full personalized report with
   rich context injected into payload and prompt.
───────────────────────────────────────────── */

async function generatePersonalizedReport({ scope, profile, match }) {
  const fallback = scope === 'match'
    ? fallbackMatchReport(match)
    : fallbackProfileReport(profile);

  const apiKey = getAPIKey();

  if (!apiKey) {
    return fallback;
  }

  const language = reportLang();
  const model    = getOpenAIModel();
  let payload, system;

  /* ── MATCH report ── */
  if (scope === 'match') {
    const userA   = match?.user_a || (match?.usernames || [])[0] || '';
    const userB   = match?.user_b || (match?.usernames || [])[1] || '';
    const profA   = typeof getProfile === 'function' ? getProfile(userA) : null;
    const profB   = typeof getProfile === 'function' ? getProfile(userB) : null;
    const ctxA    = extractProfileContext(profA);
    const ctxB    = extractProfileContext(profB);
    const app     = match?.results_app || {};
    const dims    = app.dimensions || {};
    const nameA   = ctxA?.display_name || (match?.users || [])[0] || userA || 'Person A';
    const nameB   = ctxB?.display_name || (match?.users || [])[1] || userB || 'Person B';
    const pairStr = `${nameA} & ${nameB}`;

    /* Extract formula-computed relational analysis */
    const vd = dims.values   || {};
    const pd = dims.pillars  || {};
    const dd = dims.decision || {};
    const wd = dims.worldview|| {};

    function rptResolveDimCode(code, type) {
      if (!code) return '';
      const s = String(code);
      try {
        if (type === 'value')  { const lbl = valueLabel(s);  if (lbl) return rptResolveLabel(lbl) || s; }
        if (type === 'pillar') { const lbl = pillarLabel(s); if (lbl) return rptResolveLabel(lbl) || s; }
      } catch(_) {}
      return s.charAt(0).toUpperCase() + s.slice(1);
    }

    function rptCodePairs(pairs, type) {
      return (pairs || []).map(([a, b]) => `${rptResolveDimCode(a, type)} ↔ ${rptResolveDimCode(b, type)}`);
    }

    const formulaAnalysis = {
      values: {
        shared:              (vd.shared    || []).map(c => rptResolveDimCode(c, 'value')).filter(Boolean),
        convergent_pairs:    rptCodePairs(vd.convergent, 'value'),
        potential_frictions: rptCodePairs(vd.divergent,  'value'),
        score:               vd.score,
        alignment_type:      rptResolveLabel(vd.type),
      },
      pillars: {
        shared:              (pd.shared    || []).map(c => rptResolveDimCode(c, 'pillar')).filter(Boolean),
        convergent_pairs:    rptCodePairs(pd.convergent, 'pillar'),
        potential_frictions: rptCodePairs(pd.divergent,  'pillar'),
        score:               pd.score,
        alignment_type:      rptResolveLabel(pd.type),
      },
      decision: {
        style_a:        rptResolveLabel((dd.tags || [])[0]),
        style_b:        rptResolveLabel((dd.tags || [])[1]),
        alignment_type: rptResolveLabel(dd.type),
        score:          dd.score,
      },
      worldview: {
        label_a:        rptResolveLabel((wd.pair || [])[0]),
        label_b:        rptResolveLabel((wd.pair || [])[1]),
        alignment_type: rptResolveLabel(wd.type),
        score:          wd.score,
      },
    };

    payload = {
      scope,
      language,
      pair:                pairStr,
      compatibility_score: app.score,
      match_type:          rptResolveLabel(app.match_type?.label),
      person_a: { name: nameA, current_mood: ctxA?.current_mood, symbolic_traits: ctxA?.symbolic_traits, decision_style: ctxA?.decision_style, worldview: ctxA?.worldview },
      person_b: { name: nameB, current_mood: ctxB?.current_mood, symbolic_traits: ctxB?.symbolic_traits, decision_style: ctxB?.decision_style, worldview: ctxB?.worldview },
      /* The relational formula analysis — core input for the report */
      formula_analysis: formulaAnalysis,
      match_dynamics:  (app.dynamics  || []).map(d => `${rptResolveLabel(d.title)}: ${rptResolveLabel(d.description)}`).filter(Boolean),
      match_strengths: (app.strengths || []).map(s => `${rptResolveLabel(s.title)}: ${rptResolveLabel(s.description)}`).filter(Boolean),
      match_challenges:  (app.challenges  || []).map(t => `${rptResolveLabel(t.title)}: ${rptResolveLabel(t.description)}`).filter(Boolean),
    };

    system = `You are Budhi Lite's full match report writer. Return ONLY valid JSON following the schema below exactly.
Language: ${language}. Write ALL text content in that language.
Target language name: ${reportLanguageName(language)}.
You are writing a full compatibility report for ${pairStr}.
For MATCH reports, write neutrally about the pair in third person. Do not address the viewer as "you" and do not write from only one participant's perspective.

━━━ FORMULA DATA — USE THIS, DO NOT IGNORE IT ━━━
payload.formula_analysis contains pre-computed relational data from the match engine. Additionally, incorporate their current moods and symbolic traits to explain the emotional atmosphere and behavioral tendencies of the relationship:


values / pillars (same structure):
• "shared": items BOTH people selected. These are established common ground. Name them and explain what that specific shared base creates for the pair — not "they share values" generically.
• "convergent_pairs" (format "A ↔ B"): semantically compatible items from different selections. For each pair, explain the specific compatible dynamic beneath the surface.
• "potential_frictions" (format "A ↔ B"): semantically opposed items. For each pair in the report, explain SPECIFICALLY what challenges it creates: what does each item imply for behavior, and where do those implications pull against each other?

decision: style_a and style_b are the specific rhythm labels. Analyze what THIS SPECIFIC pairing creates — when does it flow, when does it create friction?

worldview: label_a, label_b, and alignment_type. Analyze what this SPECIFIC combination of worldviews produces for the pair, keeping in mind the underlying emotional tone of their current moods and symbolic traits.

━━━ ANTI-PATTERN — BANNED ━━━
✗ "Decision rhythm and worldview together set the relationship's natural ease."
✗ "Their differences create potential for both connection and misunderstanding."
✗ Any sentence that would be true for ANY pair rather than specifically for ${pairStr}.
✗ Any section that re-lists the formula data without analyzing it.

━━━ QUALITY RULES ━━━
1. STRICT SECTION FOCUS: The top-level strengths/challenges must be about the relationship as a whole. However, inside the "result_sections" array, the strengths and challenges MUST be 100% exclusive and specific to that exact dimension (e.g., the "values" section must ONLY contain insights about their values overlap). DO NOT repeat top-level insights inside the result_sections.
2. ANALYZE — do not inventory. Lead every section with the pattern, not with "A has X and B has Y."
3. For friction pairs: name the specific pair AND explain WHY that combination creates challenges (what each item imply for behavior and where those implications conflict).
4. "description" (top-level): 200–260 words. Dominant compatibility pattern, key alignments and their practical implications, main friction/complementarity sources and their relational meaning.
5. "sections[].description": 120–150 words per section. Pattern-led, analytical. What does this dimension reveal for this specific pair?
6. Strength/challenge items (all levels): 25–40 words. One sharp specific insight. No generalities.
7. cross_analysis bullets: 30–45 words. Connect dimensions — show what the combination reveals.
8. Tone: constructive, non-diagnostic. No therapy language, no certainty claims.
9. Exactly 3 top-level strengths, 3 challenges, 3 cross_analysis bullets, 4 result_sections, each 3 strengths + 3 challenges.
10. NO EMPTY RESULTS: Always generate the complete JSON structure.

Required JSON schema:
{
  "title": "string",
  "subtitle": "string",
  "description": "string — 200–260 words, analytical prose, no line breaks",
  "strengths": ["string 25–40w", "string 25–40w", "string 25–40w"],
  "challenges": ["string 25–40w", "string 25–40w", "string 25–40w"],
  "cross_analysis": {
    "title": "string",
    "description": "string — 120–150 words, analytical prose",
    "bullets": ["string 30–45w", "string 30–45w", "string 30–45w"]
  },
  "result_sections": [
    {
      "key": "decision|values|pillars|worldview",
      "title": "string",
      "subtitle": "string",
      "description": "string — 120–150 words, analytical, pattern-led",
      "strengths": ["string 25–40w", "string 25–40w", "string 25–40w"],
      "challenges": ["string 25–40w", "string 25–40w", "string 25–40w"]
    }
  ]
}`;

  /* ── PROFILE report ── */
  } else {
    const ctx  = extractProfileContext(profile);
    const app  = profile?.results_app || {};
    const name = ctx?.display_name || profile?.display_name || 'User';

    payload = {
      scope,
      language,
      display_name: name,
      profile: {
        current_mood:     ctx?.current_mood,
        symbolic_traits:  ctx?.symbolic_traits,
        selected_values:  ctx?.selected_values,
        selected_pillars: ctx?.selected_pillars,
        decision_style:   ctx?.decision_style,
        worldview:        ctx?.worldview,
      },
      dimension_cards: (ctx?.cards_resolved || []).map(c => ({
        key:         c.key,
        title:       c.title,
        metric:      c.metric,
        score:       c.bar,
        description: c.description,
        tags:        c.tags,
      })),
      overview: rptResolveLabel(app.overview),
    };

    system = `You are Budhi Lite's full individual profile report writer. Return ONLY valid JSON following the schema below exactly.
Language: ${language}. Write ALL text content in that language.
Target language name: ${reportLanguageName(language)}.
You are writing a full personalized report for ${name}.

━━━ ANALYSIS RULES — APPLY TO EVERY SINGLE FIELD ━━━
1. STRICT SECTION FOCUS: The top-level strengths and challenges must summarize the person's overall profile. However, inside the "result_sections" array, the text, strengths, and challenges MUST focus exclusively on that specific dimension. Do NOT repeat top-level insights inside the individual dimension cards.
2. ANALYZE — do not enumerate. NEVER structure a description as "User selected X, Y, Z." Reveal what the combination of selections creates: a pattern, a challenges, a distinctive profile characteristic.
3. Reference specific items only when they serve an analytical point.
4. Connect dimensions: how does the decision style interact with your values? What does the worldview imply about how life pillars are experienced? Integrate their current mood and symbolic traits to add emotional resonance to the analysis. What does the combination of values and pillars reveal about where motivation and structure meet?
5. "description" (top-level): 200–260 words of analytical prose covering all four dimensions as a coherent profile — what the combination creates, not what each dimension contains.
6. "sections[].description": 120–150 words per section of analytical prose. Answer: what does this specific dimension create for ${name}, given their other dimensions?
7. All strength and challenge items (top-level and per-section): 25–40 words each. One sharp, specific insight — a practical implication, not a general observation. No re-listing.
8. All cross_analysis bullets: 30–45 words each. Synthesize across dimensions — show what the combination reveals that no single dimension would.
9. Tone: elegant, constructive, non-diagnostic. No therapy language, no certainty claims.
10. Exactly 3 top-level strengths, 3 challenges, 3 cross_analysis bullets, 4 result_sections (decision, values, pillars, worldview), each with 3 strengths and 3 challenges.

Required JSON schema:
{
  "title": "string",
  "subtitle": "string",
  "description": "string — 200–260 words, analytical prose, no line breaks",
  "strengths": ["string 25–40w", "string 25–40w", "string 25–40w"],
  "challenges": ["string 25–40w", "string 25–40w", "string 25–40w"],
  "cross_analysis": {
    "title": "string",
    "description": "string — 120–150 words, analytical prose",
    "bullets": ["string 30–45w", "string 30–45w", "string 30–45w"]
  },
  "result_sections": [
    {
      "key": "decision|values|pillars|worldview",
      "title": "string",
      "subtitle": "string",
      "description": "string — 120–150 words, analytical prose specific to ${name}",
      "strengths": ["string 25–40w", "string 25–40w", "string 25–40w"],
      "challenges": ["string 25–40w", "string 25–40w", "string 25–40w"]
    }
  ]
}`;
  }

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body:    JSON.stringify({
        model,
        messages: [
          { role: 'system', content: system },
          { role: 'user',   content: JSON.stringify({ payload }) },
        ],
        temperature:     0.62,
        response_format: { type: 'json_object' },
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data?.error?.message || reportFallbackMessage());
    const raw    = data?.choices?.[0]?.message?.content || '{}';
    const parsed = JSON.parse(raw);
    if (!hasUsableReport(parsed)) return fallback;
    return { ...normalizeReport(parsed), _source: 'ai', _note: t('aiGenerated') };

  } catch(err) {
    console.warn('[Budhi Lite] Personalized report generation failed.', err);
    return fallback;
  }
}


/* ─────────────────────────────────────────────
   MULTILINGUAL FULL REPORT CACHE + TRANSLATION
───────────────────────────────────────────── */

function reportLanguageName(code){
  return ({en:'English', pt:'Portuguese (Brazil)', es:'Spanish', fr:'French', de:'German', ge:'German'}[code] || code || 'English');
}

function reportViewerUsername(){
  try { return requireSession()?.username || sessionStorage.getItem('budhi_lite_user') || 'unknown'; }
  catch(_) { return 'unknown'; }
}

function reportNow(){ return new Date().toISOString(); }

function reportEnsureRoot(subject){
  subject.results_ai = subject.results_ai || {};
  subject.results_ai.ai_content = subject.results_ai.ai_content || {};
  return subject.results_ai.ai_content;
}

function reportSubjectRevision(subject, bucketName){
  if(!String(bucketName || '').startsWith('profile_')) return null;
  return subject?.results_app?.profile_revision || subject?.profile_revision || null;
}

function reportEnsureBucket(subject, bucketName){
  const root = reportEnsureRoot(subject);
  const currentRevision = reportSubjectRevision(subject, bucketName);
  const existingBucket = root[bucketName];
  const cachedRevision = existingBucket?.subject_revision || null;

  if(currentRevision && cachedRevision !== currentRevision){
    root[bucketName] = { original:null, by_language:{}, subject_revision:currentRevision };
  } else {
    root[bucketName] = existingBucket || { original:null, by_language:{} };
    if(currentRevision) root[bucketName].subject_revision = currentRevision;
  }

  root[bucketName].by_language = root[bucketName].by_language || {};
  return root[bucketName];
}

function reportGetLanguageContent(bucket, lang){
  return bucket?.by_language?.[lang]?.content || null;
}

function reportReadBucket(subject, bucketName){
  const bucket = subject?.results_ai?.ai_content?.[bucketName] || null;
  const currentRevision = reportSubjectRevision(subject, bucketName);
  if(currentRevision && bucket?.subject_revision !== currentRevision) return null;
  return bucket;
}

function getPersonalizedReportCacheStatus({scope, profile, match, lang}){
  const targetLang = lang || reportLang();
  const subject = scope === 'match' ? match : profile;
  const bucketName = scope === 'match' ? 'match_full_report' : 'profile_full_report';
  const bucket = reportReadBucket(subject, bucketName);
  const currentEntry = bucket?.by_language?.[targetLang] || null;
  const original = bucket?.original || null;
  return {
    targetLang,
    bucketName,
    has_current_language: Boolean(currentEntry?.content && !currentEntry.content._error),
    has_original: Boolean(original?.content && !original.content._error),
    original_language: original?.language || null,
    current_source: currentEntry?.source || null,
    updated_at: currentEntry?.updated_at || original?.generated_at || null
  };
}

function hasPersonalizedReportForCurrentLanguage({scope, profile, match}){
  return getPersonalizedReportCacheStatus({scope, profile, match}).has_current_language;
}

function hasAnyPersonalizedReport({scope, profile, match}){
  const status = getPersonalizedReportCacheStatus({scope, profile, match});
  return status.has_current_language || status.has_original;
}

function reportSetLanguageContent(bucket, lang, content, meta){
  bucket.by_language = bucket.by_language || {};
  bucket.by_language[lang] = {
    ...(bucket.by_language[lang] || {}),
    ...meta,
    language:lang,
    updated_at:reportNow(),
    content
  };
}

function reportSetOriginal(bucket, lang, content){
  const viewer = reportViewerUsername();
  bucket.original = {
    ...(bucket.original || {}),
    language: lang,
    generated_by: bucket.original?.generated_by || viewer,
    generated_at: bucket.original?.generated_at || reportNow(),
    content
  };
  reportSetLanguageContent(bucket, lang, content, {source:'original', generated_by:bucket.original.generated_by, generated_at:bucket.original.generated_at});
}

async function translatePersonalizedReport({scope, sourceReport, sourceLanguage, targetLanguage, profile, match}){
  const apiKey = getAPIKey();
  const fallback = scope === 'match' ? fallbackMatchReport(match) : fallbackProfileReport(profile);
  if(!apiKey){
    return fallback;
  }

  const model = getOpenAIModel();
  const targetName = reportLanguageName(targetLanguage);
  const sourceName = reportLanguageName(sourceLanguage);
  const system = `You are Budhi Lite's contextual translation/adaptation agent for full reports. Return ONLY valid JSON using the same report schema you receive: title, subtitle, description, strengths, challenges, cross_analysis, and result_sections.
Translate and adapt the source report from ${sourceName} to ${targetName}. Preserve the exact meaning, analytical claims, intensity, structure, field names, section keys, number of bullets, and order of sections. Do not reinterpret the match from scratch and do not add new analysis that is absent from the source report. All human-visible strings must be in ${targetName}.
For MATCH reports, keep the wording neutral about the pair in third person. Do not address the viewer as "you" and do not shift the report toward only one participant.
Never leave fields empty. Return valid JSON only.`;

  try{
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':`Bearer ${apiKey}`},
      body:JSON.stringify({
        model,
        messages:[
          {role:'system', content:system},
          {role:'user', content:JSON.stringify({scope, source_language:sourceLanguage, target_language:targetLanguage, source_report:sourceReport})}
        ],
        temperature:.18,
        response_format:{type:'json_object'}
      })
    });
    const data = await res.json();
    if(!res.ok) throw new Error(data?.error?.message || reportFallbackMessage());
    const parsed = JSON.parse(data?.choices?.[0]?.message?.content || '{}');
    if (!hasUsableReport(parsed)) return fallback;
    return {...normalizeReport(parsed), _source:'translation', _note:t('aiGenerated')};
  }catch(err){
    console.warn('[Budhi Lite] Personalized report translation failed.', err);
    return fallback;
  }
}

async function getOrCreatePersonalizedReport({scope, profile, match, force}){
  const targetLang = reportLang();
  const subject = scope === 'match' ? match : profile;
  const bucketName = scope === 'match' ? 'match_full_report' : 'profile_full_report';
  if(!subject) return generatePersonalizedReport({scope,profile,match});

  const bucket = reportEnsureBucket(subject, bucketName);
  const cached = reportGetLanguageContent(bucket, targetLang);
  if(cached && !cached._error && !force){
    return {...cached, _source: bucket.by_language?.[targetLang]?.source || 'cache', _note:t('aiGenerated')};
  }

  const original = bucket.original;
  let report;

  if(original?.content && original.language && original.language !== targetLang){
    report = await translatePersonalizedReport({
      scope,
      sourceReport: original.content,
      sourceLanguage: original.language,
      targetLanguage: targetLang,
      profile,
      match
    });
    if(!report._error){
      reportSetLanguageContent(bucket, targetLang, report, {
        source:'translation',
        translated_from:original.language,
        generated_for:reportViewerUsername(),
        generated_at:reportNow()
      });
    }
  } else {
    report = await generatePersonalizedReport({scope,profile,match});
    if(!report._error){
      if(!original || !original.language || original.language === targetLang || force){
        reportSetOriginal(bucket, targetLang, report);
      } else {
        reportSetLanguageContent(bucket, targetLang, report, {source:'original_independent', generated_by:reportViewerUsername(), generated_at:reportNow()});
      }
    }
  }

  if(!report?._error){
    try{
      if(scope === 'match') await saveMatch(subject);
      else await saveProfile(subject.username, subject);
    }catch(err){
      console.warn('[Budhi Lite] Full report generated but cache save failed.', err);
    }
  }

  return report;
}