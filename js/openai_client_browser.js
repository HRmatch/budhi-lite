// Budhi Lite — AI card details agent (browser-side)
// Handles the AI details modal in results.html
// The user's OpenAI key is read from sessionStorage and never stored elsewhere.

/* ─────────────────────────────────────────────
   LABEL RESOLUTION
   Converts multilingual objects {en,pt,es,fr,de}
   to the current UI language string.
───────────────────────────────────────────── */

function resolveLabel(val) {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string') return val;
  if (Array.isArray(val)) return val.map(resolveLabel).join(', ');
  if (typeof val === 'object') {
    try { return ml(val) || val.en || Object.values(val).find(Boolean) || ''; }
    catch(_) { return val.en || Object.values(val).find(Boolean) || ''; }
  }
  return String(val);
}

function aiFallbackMessage() {
  return typeof t === 'function' ? t('ai_fallback_error') : 'ai_fallback_error';
}

function aiFallbackCardTitle(scope, key, profile, match) {
  if (scope === 'match') {
    const cards = match?.results_app?.cards || [];
    const card = cards.find(c => c.key === key) || {};
    return resolveLabel(card.title) || key || '';
  }
  const cards = profile?.results_app?.cards || [];
  const card = cards.find(c => c.key === key) || {};
  return resolveLabel(card.title) || key || '';
}

function aiDetailsErrorFallback({scope, key, profile, match}) {
  const message = aiFallbackMessage();
  return {
    title: aiFallbackCardTitle(scope, key, profile, match),
    description: message,
    strengths: [],
    challenges: [],
    _error: true,
    error: true,
    message,
    _source: 'ai_fallback_error',
    _note: message
  };
}

function aiGoldenTipErrorFallback() {
  const message = aiFallbackMessage();
  return {
    text: message,
    _error: true,
    error: true,
    message,
    _source: 'ai_fallback_error',
    _note: message
  };
}

/* ─────────────────────────────────────────────
   PROFILE CONTEXT EXTRACTION
   Pulls the user's actual selections from the
   stored profile so the AI can reference them
   by name instead of by generic category.
───────────────────────────────────────────── */

function buildProfileContext(profile) {
  if (!profile) return null;
  const app   = profile.results_app || {};
  const cards = app.cards || [];
  const get   = key => cards.find(c => c.key === key);

  const valCard = get('values');
  const pilCard = get('pillars');
  const decCard = get('decision');
  const wvCard  = get('worldview');

  // NOVO: Extrai a cor e busca o significado completo na constante QT2_MEANINGS
  const colorKey = profile.answers?.Qt2 || '';
  let colorMeaning = ''; // Fallback vazio para não enviar a cor literal
  if (colorKey && typeof QT2_MEANINGS !== 'undefined' && QT2_MEANINGS[colorKey]) {
    colorMeaning = resolveLabel(QT2_MEANINGS[colorKey]);
  }

  return {
    display_name: profile.display_name || profile.username || "User",
    current_mood: profile.answers?.Qt1 || '',
    symbolic_traits: colorMeaning, // <- Chave renomeada para ocultar a palavra "cor"
    selected_values: (valCard?.tags || []).map(resolveLabel).filter(Boolean),
    selected_pillars: (pilCard?.tags || []).map(resolveLabel).filter(Boolean),
    decision_style: resolveLabel(decCard?.metric_value),
    worldview: resolveLabel(wvCard?.metric_value),
    decision_bar: decCard?.bar || 0,
    all_cards: cards.map((c) => ({
      key: c.key,
      title: resolveLabel(c.title),
      metric: resolveLabel(c.metric_value),
      bar: c.bar,
      description: resolveLabel(c.description),
      tags: (c.tags || []).map(resolveLabel).filter(Boolean),
    })),
  };
}
/* ─────────────────────────────────────────────
   MATCH CONTEXT EXTRACTION
   Pulls both profiles' actual selections plus
   the match formula's comparative output so the
   AI can name specifics for each dimension.
───────────────────────────────────────────── */

/* ─────────────────────────────────────────────
   DIMENSION CODE RESOLVER
   Converts raw formula codes (e.g. 'honesty')
   to display labels using the phase1 functions
   that are available globally after formula files
   are loaded.
───────────────────────────────────────────── */
function resolveDimCode(code, type) {
  if (!code) return '';
  const s = String(code);
  try {
    if (type === 'value')  { const lbl = valueLabel(s);  if (lbl) return resolveLabel(lbl); }
    if (type === 'pillar') { const lbl = pillarLabel(s); if (lbl) return resolveLabel(lbl); }
  } catch(_) {}
  // Fallback: capitalise the raw code
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function buildMatchContext(match) {
  if (!match) return null;
  const userA    = match.user_a    || (match.usernames || [])[0] || '';
  const userB    = match.user_b    || (match.usernames || [])[1] || '';
  const profileA = typeof getProfile === 'function' ? getProfile(userA) : null;
  const profileB = typeof getProfile === 'function' ? getProfile(userB) : null;
  const app      = match.results_app || {};
  const dims     = app.dimensions   || {};
  const ctxA     = buildProfileContext(profileA);
  const ctxB     = buildProfileContext(profileB);

  /* Pull the formula's pre-computed relational analysis */
  const vd = dims.values   || {};
  const pd = dims.pillars  || {};
  const dd = dims.decision || {};
  const wd = dims.worldview|| {};

  function codePairs(pairs, type) {
    return (pairs || []).map(([a, b]) => ({
      a: resolveDimCode(a, type),
      b: resolveDimCode(b, type),
      label: `${resolveDimCode(a, type)} ↔ ${resolveDimCode(b, type)}`,
    }));
  }

  return {
    users:              match.users || [ctxA?.display_name || userA, ctxB?.display_name || userB].filter(Boolean),
    compatibility_score:app.score,
    match_type:         resolveLabel(app.match_type?.label),
    profile_a:          ctxA,
    profile_b:          ctxB,

    /* ── Formula-computed relational analysis ── */
    formula_analysis: {
      values: {
        shared:              (vd.shared    || []).map(c => resolveDimCode(c, 'value')).filter(Boolean),
        convergent_pairs:    codePairs(vd.convergent, 'value'),
        potential_frictions: codePairs(vd.divergent,  'value'),
        score:               vd.score,
        alignment_type:      resolveLabel(vd.type),
      },
      pillars: {
        shared:              (pd.shared    || []).map(c => resolveDimCode(c, 'pillar')).filter(Boolean),
        convergent_pairs:    codePairs(pd.convergent, 'pillar'),
        potential_frictions: codePairs(pd.divergent,  'pillar'),
        score:               pd.score,
        alignment_type:      resolveLabel(pd.type),
      },
      decision: {
        style_a:        resolveLabel((dd.tags || [])[0]),
        style_b:        resolveLabel((dd.tags || [])[1]),
        alignment_type: resolveLabel(dd.type),
        score:          dd.score,
      },
      worldview: {
        label_a:        resolveLabel((wd.pair || [])[0]),
        label_b:        resolveLabel((wd.pair || [])[1]),
        alignment_type: resolveLabel(wd.type),
        score:          wd.score,
      },
    },

    /* Resolved match cards */
    match_cards: (app.cards || []).map(c => ({
      key:         c.key,
      title:       resolveLabel(c.title),
      metric_value:resolveLabel(c.metric_value),
      bar:         c.bar,
      description: resolveLabel(c.description),
      tags:        (c.tags || []).map(resolveLabel).filter(Boolean),
    })),
    strengths: (app.strengths || []).map(s => ({ title: resolveLabel(s.title), description: resolveLabel(s.description) })),
    challenges: (app.challenges  || []).map(t => ({ title: resolveLabel(t.title), description: resolveLabel(t.description) })),
    dynamics:  (app.dynamics  || []).map(d => ({ title: resolveLabel(d.title), description: resolveLabel(d.description) })),
    gaps: (app.gaps      || []).map(g => ({ gap: resolveLabel(g.gap), severity: g.severity })),
  };
}

/* ─────────────────────────────────────────────
   CENTRALIZED AI ERROR FALLBACKS
   Preserve the object shape expected by the UI,
   but use only the standard i18n error message.
───────────────────────────────────────────── */

function fallbackDetailsProfile(key, profile) {
  return aiDetailsErrorFallback({ scope: 'profile', key, profile, match: null });
}

function fallbackDetailsMatch(key, match) {
  return aiDetailsErrorFallback({ scope: 'match', key, profile: null, match });
}

/* ─────────────────────────────────────────────
   NORMALIZATION
   Keeps the AI response shape without filling
   missing fields with textual local fallbacks.
───────────────────────────────────────────── */

function ensureItems(items, fallbackItems, count) {
  const n = count || 3;
  const cleaned = (Array.isArray(items) ? items : [])
    .map(x => String(x || '').trim())
    .filter(Boolean);
  const out = [];
  const seen = new Set();
  cleaned.forEach(item => {
    const marker = item.toLowerCase();
    if (!seen.has(marker) && out.length < n) {
      seen.add(marker);
      out.push(item);
    }
  });
  return out;
}

// Kept for any external reference
function ensureThreeItems(items, fallbackItems) { return ensureItems(items, null, 3); }

function hasUsableAIDetails(parsed) {
  if (!parsed || typeof parsed !== 'object') return false;
  const description = String(parsed.description || '').trim();
  const strengths = ensureItems(parsed.strengths, null, 3);
  const challenges = ensureItems(parsed.challenges, null, 3);
  return Boolean(description || strengths.length || challenges.length);
}

function normalizeAIDetails(parsed, fallback) {
  const data = parsed && typeof parsed === 'object' ? parsed : {};
  return {
    title:       String(data.title || fallback?.title || '').trim(),
    description: String(data.description || '').trim(),
    strengths:   ensureItems(data.strengths,  null, 3),
    challenges:  ensureItems(data.challenges, null, 3),
  };
}

/* ─────────────────────────────────────────────
   MAIN FUNCTION
   Generates AI card details with full user
   context injected into both payload and prompt.
───────────────────────────────────────────── */

async function generateAIDetails({ scope, key, profile, match }) {
  const apiKey   = getAPIKey();
  const fallback = aiDetailsErrorFallback({ scope, key, profile, match });

  if (!apiKey) {
    return fallback;
  }

  const language = getLang();
  const model    = getOpenAIModel();
  let payload, systemPrompt;

  /* ── MATCH scope ── */
  if (scope === 'match') {
    const ctx     = buildMatchContext(match);
    const pA      = ctx.profile_a || {};
    const pB      = ctx.profile_b || {};
    const cardCtx = (ctx.match_cards || []).find(c => c.key === key) || {};
    const names   = (ctx.users || []).join(' & ');
    const fa      = ctx.formula_analysis || {};

    payload = {
      scope,
      key,
      language,
      pair:                names,
      compatibility_score: ctx.compatibility_score,
      match_type:          ctx.match_type,
      dimension: {
        key,
        title:       cardCtx.title,
        metric:      cardCtx.metric_value,
        score:       cardCtx.bar,
      },
      person_a: { name: pA.display_name, current_mood: pA.current_mood, symbolic_traits: pA.symbolic_traits, decision_style: pA.decision_style, worldview: pA.worldview },
      person_b: { name: pB.display_name, current_mood: pB.current_mood, symbolic_traits: pB.symbolic_traits, decision_style: pB.decision_style, worldview: pB.worldview },
      /* Formula-computed relational data — the core of the analysis */
      formula_analysis: fa,
    };

    systemPrompt = `You are CheckMatch Lite's compatibility analyst. Return ONLY valid JSON: { "title": string, "description": string, "strengths": [string, string, string], "challenges": [string, string, string] }

Language: ${language}. Write ALL content in that language.
Target language name: ${aiLanguageName(language)}.

You are analyzing the "${key}" dimension for the combination ${names}.
Use an empathetic and neutral narrator voice. This Match can describe friends, collaborators, business partners, teams, or any general interaction between people. Do not assume romance, couple dynamics, family roles, or a specific relationship context unless the data explicitly states it.
Refer to the people as “these profiles”, “this combination”, “the interaction between ${names}”, or by their names. Keep the perspective warm, observational, and useful.

━━━ MANDATORY OPENING ━━━
The "description" field MUST begin with a welcoming phrase anchored in the result, written naturally in the target language. Use a natural translation or equivalent of one of these openings:
• "As observed in the dynamic between ${names}..."
• "The results of this combination show..."
• "Looking at how these profiles interact..."
After this opening, continue with the specific analysis of the "${key}" dimension.

━━━ FORMULA DATA — USE THIS, DO NOT IGNORE IT ━━━
The payload.formula_analysis contains pre-computed relational data you MUST use. Additionally, explicitly use the current mood and the symbolic traits of each person (from payload.person_a and payload.person_b) to understand the emotional undertone and behavioral tendencies of their interaction.

For values and pillars:
• "shared" = items BOTH people selected. Name these as established shared ground — not generically, but by explaining which specific items create common direction in practice.
• "convergent_pairs" = semantically compatible items from different selections. For each connection (format "A ↔ B"), explain the specific compatible dynamic.
• "potential_frictions" = semantically opposed items. For each connection, explain the SPECIFIC attention point.

For decision:
• Analyze what this SPECIFIC combination of styles creates in practice — when it flows, when it asks for clearer coordination. Include how their moods or symbolic traits influence this pace.

For worldview:
• Explain what this SPECIFIC combination of worldviews produces for the interaction between the profiles, utilizing their moods and symbolic traits for context.

━━━ ANTI-PATTERN — NEVER WRITE THIS ━━━
✗ "Decision rhythm and worldview together set the relationship's natural ease."
✗ "Their differences create potential for both connection and misunderstanding."
✗ Any sentence that assumes a romantic relationship, couple bond, or fixed personal role.
✗ Any sentence that would be true for ANY combination, not specifically for ${names}.
✗ Any output that sounds like a technical report, diagnosis, or cold assessment.

━━━ QUALITY RULES ━━━
1. STRICT DIMENSION FOCUS: Your output MUST be exclusively about the "${key}" dimension.
2. ANALYZE — do not inventory. Lead with the lived pattern.
3. Name specific items only to anchor useful insights, not to list them.
4. "description": 160–200 words. Start with the mandatory opening and then describe the dominant dynamic this dimension reveals for this combination.
5. Each "strengths" item: 20–35 words. One clear, helpful insight.
6. Each "challenges" item: 20–35 words. One specific attention point.
7. Exactly 3 strengths and 3 challenges.
8. Tone: Empathetic, elegant, and directly useful.
9. NO EMPTY RESULTS: You must always generate the complete JSON structure with populated content.`;

  /* ── PROFILE scope ── */
  } else {
    const ctx    = buildProfileContext(profile);
    const cards  = profile?.results_app?.cards || [];
    const card   = cards.find(c => c.key === key) || {};
    const name   = ctx?.display_name || 'the user';

    // Build cross-dimension context so the AI can connect dimensions
    const otherDims = (ctx?.all_cards || [])
      .filter(c => c.key !== key)
      .map(c => ({ key: c.key, title: c.title, metric: c.metric, tags: c.tags }));

    payload = {
      scope,
      key,
      language,
      display_name: name,
      dimension: {
        key,
        title:       resolveLabel(card.title),
        metric:      resolveLabel(card.metric_value),
        score:       card.bar,
        description: resolveLabel(card.description),
        tags:        (card.tags || []).map(resolveLabel).filter(Boolean),
      },
     
      profile: {
        current_mood:     ctx?.current_mood,
        symbolic_traits:  ctx?.symbolic_traits,
        selected_values:  ctx?.selected_values,
        selected_pillars: ctx?.selected_pillars,
        decision_style:   ctx?.decision_style,
        worldview:        ctx?.worldview,
      },
      other_dimensions: otherDims,
    };

    systemPrompt = `You are CheckMatch Lite's insight specialist. Return ONLY valid JSON with this exact schema: { "title": string, "description": string, "strengths": [string, string, string], "challenges": [string, string, string] }

Language: ${language}. Write ALL content in that language.
Target language name: ${aiLanguageName(language)}.

You are writing personalized insights directly to ${name} about the "${key}" dimension.
Use active voice and speak to the person in second person throughout the content. Use natural second-person language in the target language, such as "you", "your", "você", "seu", "sua", or the most natural equivalent.
Do NOT write about the person in third person. Avoid phrases like "the user", "this person", "the profile shows that they", or equivalents in any language.

━━━ MANDATORY OPENING ━━━
The "description" field MUST begin with a warm phrase anchored in the result, written naturally in the target language. Use a natural translation or equivalent of one of these openings:
• "According to your results..."
• "As observed in your profile..."
• "The analysis of your choices suggests..."
• "Looking at your current journey..."
After this opening, continue with a conversational, useful analysis of the "${key}" dimension.

━━━ ANALYSIS RULES ━━━
1. STRICT DIMENSION FOCUS: Your output MUST be exclusively about the "${key}" dimension. Do NOT write general summaries of the entire profile.
2. ANALYZE — do not enumerate. Reveal what this specific combination of selections creates for you: a pattern, a growth edge, or a distinctive way of moving through daily choices. Do NOT structure the description as "You selected X, Y, Z and this means..."
3. Reference specific items only when they serve an analytical point.
4. Connect dimensions when it deepens the analysis: how does your decision style interact with your values? What does your worldview suggest about how you experience your life pillars? Use the user's current mood and symbolic traits to give emotional texture and context to this specific dimension. These connections should feel practical and human, not technical.
5. "description": 160–200 words of conversational analytical prose. NO line breaks inside the string. Start with the mandatory opening.
6. Each "strengths" item: 20–35 words. One focused insight.
7. Each "challenges" item: 20–35 words. One focused growth edge.
8. Exactly 3 strengths and 3 challenges.
9. Tone: Empathetic, elegant, and directly useful.
10. NO EMPTY RESULTS: You must always generate the complete JSON structure with populated content.`; 
  }

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body:    JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user',   content: JSON.stringify(payload) },
        ],
        temperature:     0.6,
        response_format: { type: 'json_object' },
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data?.error?.message || aiFallbackMessage());
    const parsed = JSON.parse(data?.choices?.[0]?.message?.content || '{}');
    if (!hasUsableAIDetails(parsed)) return fallback;
    return { ...normalizeAIDetails(parsed, fallback), _source: 'ai', _note: t('aiGenerated') };

  } catch(err) {
    console.warn('[Budhi Lite] AI details generation failed.', err);
    return fallback;
  }
}


/* ─────────────────────────────────────────────
   MULTILINGUAL AI CACHE + TRANSLATION FLOW
   Match AI is generated once as an original and
   later translated/adapted per viewer language.
───────────────────────────────────────────── */

function aiLanguageName(code){
  return ({en:'English', pt:'Portuguese (Brazil)', es:'Spanish', fr:'French', de:'German', ge:'German'}[code] || code || 'English');
}

function aiViewerUsername(){
  try { return requireSession()?.username || sessionStorage.getItem('budhi_lite_user') || 'unknown'; }
  catch(_) { return 'unknown'; }
}

function aiNow(){ return new Date().toISOString(); }

function aiEnsureRoot(subject){
  subject.results_ai = subject.results_ai || {};
  subject.results_ai.ai_content = subject.results_ai.ai_content || {};
  return subject.results_ai.ai_content;
}

function aiSubjectRevision(subject, bucketName){
  if(!String(bucketName || '').startsWith('profile_')) return null;
  return subject?.results_app?.profile_revision || subject?.profile_revision || null;
}

function aiEnsureBucket(subject, bucketName){
  const root = aiEnsureRoot(subject);
  const currentRevision = aiSubjectRevision(subject, bucketName);
  const existingBucket = root[bucketName];
  const cachedRevision = existingBucket?.subject_revision || null;

  // Once a questionnaire has a revision, any unversioned or differently
  // versioned AI cache belongs to an older response cycle and is discarded.
  if(currentRevision && cachedRevision !== currentRevision){
    root[bucketName] = { original:null, by_language:{}, subject_revision:currentRevision };
  } else {
    root[bucketName] = existingBucket || { original:null, by_language:{} };
    if(currentRevision) root[bucketName].subject_revision = currentRevision;
  }

  root[bucketName].by_language = root[bucketName].by_language || {};
  return root[bucketName];
}

function aiGetCardFromLanguage(bucket, lang, key){
  return bucket?.by_language?.[lang]?.cards?.[key] || null;
}

function aiGetOriginalCard(bucket, key){
  return bucket?.original?.cards?.[key] || null;
}

function aiSetCardLanguage(bucket, lang, key, detail, meta){
  bucket.by_language = bucket.by_language || {};
  bucket.by_language[lang] = bucket.by_language[lang] || { cards:{} };
  bucket.by_language[lang].cards = bucket.by_language[lang].cards || {};
  bucket.by_language[lang] = {
    ...bucket.by_language[lang],
    ...meta,
    language: lang,
    updated_at: aiNow(),
    cards: {
      ...(bucket.by_language[lang].cards || {}),
      [key]: detail
    }
  };
}

function aiSetOriginalCard(bucket, lang, key, detail){
  const viewer = aiViewerUsername();
  bucket.original = bucket.original || { language:lang, generated_by:viewer, generated_at:aiNow(), cards:{} };
  bucket.original.language = bucket.original.language || lang;
  bucket.original.generated_by = bucket.original.generated_by || viewer;
  bucket.original.generated_at = bucket.original.generated_at || aiNow();
  bucket.original.cards = bucket.original.cards || {};
  bucket.original.cards[key] = detail;
  aiSetCardLanguage(bucket, lang, key, detail, { source:'original', generated_by:bucket.original.generated_by, generated_at:bucket.original.generated_at });
}

async function translateAIDetails({scope, key, sourceDetails, sourceLanguage, targetLanguage, profile, match}){
  const apiKey = getAPIKey();
  const fallback = aiDetailsErrorFallback({ scope, key, profile, match });
  if(!apiKey){
    return fallback;
  }
  const model = getOpenAIModel();
  const targetName = aiLanguageName(targetLanguage);
  const sourceName = aiLanguageName(sourceLanguage);
  const system = `You are CheckMatch Lite's contextual translation and adaptation agent for AI card details. Return ONLY valid JSON with exactly this schema: {"title": string, "description": string, "strengths": [string,string,string], "challenges": [string,string,string]}.
Translate and adapt the provided JSON from ${sourceName} to ${targetName}. Preserve meaning, intensity, structure, bullet counts, field names, and the original analytical claims. Do not add new interpretation from raw profile or match data. All human-visible strings must be in ${targetName}.

Voice rules:
• If scope is "profile", speak directly to the person in second person throughout the text. Use the natural target-language equivalent of "you", "your", "você", "seu", or "sua". Do not use third-person wording such as "the user", "this person", or equivalents.
• If scope is "match", use an empathetic and neutral narrator voice. Do not assume romance, couple dynamics, family roles, or a specific relationship context. Refer to the people as "these profiles", "this combination", "the interaction", or by their names when present.

Mandatory opening:
• For profile descriptions, the translated "description" MUST begin with a natural target-language equivalent of: "According to your results...", "As observed in your profile...", or "The analysis of your choices suggests...".
• For match descriptions, the translated "description" MUST begin with a natural target-language equivalent of: "As observed in the dynamic between these profiles...", "The results of this combination show...", or "Looking at how these profiles interact...".
• If the source text does not follow this opening rule, adapt the first sentence while preserving the original meaning.

Tone: Empathetic, elegant, and directly useful. Avoid clinical, diagnostic, or overly analytical jargon. Make the user feel seen and understood.
Never leave fields empty.`;
  try{
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':`Bearer ${apiKey}`},
      body:JSON.stringify({
        model,
        messages:[
          {role:'system', content:system},
          {role:'user', content:JSON.stringify({scope,key,source_language:sourceLanguage,target_language:targetLanguage,source_details:sourceDetails})}
        ],
        temperature:.18,
        response_format:{type:'json_object'}
      })
    });
    const data = await res.json();
    if(!res.ok) throw new Error(data?.error?.message || aiFallbackMessage());
    const parsed = JSON.parse(data?.choices?.[0]?.message?.content || '{}');
    if (!hasUsableAIDetails(parsed)) return fallback;
    return {...normalizeAIDetails(parsed, fallback), _source:'translation', _note:t('aiGenerated')};
  }catch(err){
    console.warn('[Budhi Lite] AI details translation failed.', err);
    return fallback;
  }
}

async function getOrCreateAIDetails({scope, key, profile, match}){
  const targetLang = getLang();
  const bucketName = scope === 'match' ? 'match_cards' : 'profile_cards';
  const subject = scope === 'match' ? match : profile;
  if(!subject) return generateAIDetails({scope,key,profile,match});

  const bucket = aiEnsureBucket(subject, bucketName);
  const cached = aiGetCardFromLanguage(bucket, targetLang, key);
  if(cached && !cached._error){
    return {...cached, _source: bucket.by_language?.[targetLang]?.source || 'cache', _note:t('aiGenerated')};
  }

  const originalLang = bucket.original?.language;
  const originalCard = aiGetOriginalCard(bucket, key);
  let detail;

  if(originalCard && originalLang && originalLang !== targetLang){
    detail = await translateAIDetails({scope,key,sourceDetails:originalCard,sourceLanguage:originalLang,targetLanguage:targetLang,profile,match});
    if(!detail._error){
      aiSetCardLanguage(bucket, targetLang, key, detail, {
        source:'translation',
        translated_from:originalLang,
        generated_for:aiViewerUsername(),
        generated_at:aiNow()
      });
    }
  } else {
    detail = await generateAIDetails({scope,key,profile,match});
    if(!detail._error){
      if(!bucket.original || !bucket.original.language || bucket.original.language === targetLang){
        aiSetOriginalCard(bucket, targetLang, key, detail);
      } else {
        aiSetCardLanguage(bucket, targetLang, key, detail, {source:'original_independent', generated_by:aiViewerUsername(), generated_at:aiNow()});
      }
    }
  }

  if(!detail?._error){
    try{
      if(scope === 'match') await saveMatch(subject);
      else await saveProfile(subject.username, subject);
    }catch(err){
      console.warn('[Budhi Lite] AI details generated but cache save failed.', err);
    }
  }
  return detail;
}


/* ─────────────────────────────────────────────
   AI GOLDEN TIP
   Context-sensitive golden tip for profile and
   match views. Uses the same multilingual cache
   strategy as AI card details.
───────────────────────────────────────────── */

function normalizeGoldenTip(value){
  // Golden Tip intentionally accepts only the AI contract field.
  // No local/static textual fallback is used here.
  const text = value && typeof value === 'object' ? value.golden_tip : '';
  return { text: String(text || '').replace(/\s+/g, ' ').trim() };
}

function hasUsableGoldenTip(value){
  return Boolean(normalizeGoldenTip(value).text);
}

function aiGetTipFromLanguage(bucket, lang){
  return bucket?.by_language?.[lang]?.tip || null;
}

function aiGetOriginalTip(bucket){
  return bucket?.original?.tip || null;
}

function aiSetTipLanguage(bucket, lang, tip, meta){
  bucket.by_language = bucket.by_language || {};
  bucket.by_language[lang] = {
    ...(bucket.by_language[lang] || {}),
    ...meta,
    language: lang,
    updated_at: aiNow(),
    tip
  };
}

function aiSetOriginalTip(bucket, lang, tip){
  const viewer = aiViewerUsername();
  bucket.original = bucket.original || { language:lang, generated_by:viewer, generated_at:aiNow(), tip:null };
  bucket.original.language = bucket.original.language || lang;
  bucket.original.generated_by = bucket.original.generated_by || viewer;
  bucket.original.generated_at = bucket.original.generated_at || aiNow();
  bucket.original.tip = tip;
  aiSetTipLanguage(bucket, lang, tip, { source:'original', generated_by:bucket.original.generated_by, generated_at:bucket.original.generated_at });
}

async function generateGoldenTip({scope, profile, match}){
  const targetLang = getLang();
  const apiKey = getAPIKey();
  const errorTip = aiGoldenTipErrorFallback();

  if(!apiKey){
    return errorTip;
  }

  const model = getOpenAIModel();
  const language = aiLanguageName(targetLang);
  const context = scope === 'match' ? buildMatchContext(match) : buildProfileContext(profile);

  const system = scope === 'match'
    ? `You are CheckMatch Lite's Golden Tip agent. Return ONLY valid JSON with this exact schema: {"golden_tip": string}.
Language: ${language}. Write the golden_tip in this language.
Create one elegant, practical, and highly personalized golden tip for the Match as an interaction between people, not for only one participant. Use an empathetic and neutral narrator voice. Do not assume romance, couple dynamics, family roles, or a specific relationship context.
The golden_tip MUST begin with a natural target-language equivalent of one of these openings:
• "In practice, this combination..."
• "Together, these profiles tend to..."
• "This connection..."
The tip must sinthesize the match's decision rhythm, values, life pillars, worldview, and current emotional tone (mood and symbolic traits) into one actionable recommendation. It should be 45–60 words, specific, non-diagnostic, and useful as a next-step conversation prompt. Do not repeat the compatibility score unless it is analytically necessary.
Tone: Empathetic, elegant, and directly useful. Avoid clinical, diagnostic, or overly analytical jargon. Make the reader feel seen and understood.
Never leave the field empty.`

    : `You are CheckMatch Lite's Golden Tip agent for an individual Self-Profile result. Return ONLY valid JSON with this exact schema: {"golden_tip": string}.
Language: ${language}. Write the golden_tip in this language.
Create one elegant, practical, and highly personalized golden tip for the person. Speak directly to the person in second person throughout the text, using the natural target-language equivalent of "you", "your", "você", "seu", or "sua".
The golden_tip MUST begin with a natural target-language equivalent of one of these openings:
• "You tend to..."
• "Stay..."
• "Your profile shows that..."
• "Try being more..."
The tip must sinthesize decision style, values, life pillars, worldview, and your current mood and symbolic traits into one actionable recommendation. It should be 45–60 words, specific, non-diagnostic, and useful as a next step for self-observation.
Tone: Empathetic, elegant, and directly useful. Avoid clinical, diagnostic, or overly analytical jargon. Make the user feel seen and understood.
Never leave the field empty.`;

  try{
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':`Bearer ${apiKey}`},
      body:JSON.stringify({
        model,
        messages:[
          {role:'system', content:system},
          {role:'user', content:JSON.stringify({scope, language:targetLang, context})}
        ],
        temperature:.55,
        response_format:{type:'json_object'}
      })
    });
    const data = await res.json();
    if(!res.ok) throw new Error(data?.error?.message || aiFallbackMessage());
    const parsed = JSON.parse(data?.choices?.[0]?.message?.content || '{}');
    if (!hasUsableGoldenTip(parsed)) return errorTip;
    return {...normalizeGoldenTip(parsed), _source:'ai', _note:t('aiGenerated')};
  }catch(err){
    console.warn('[Budhi Lite] Golden Tip generation failed.', err);
    return errorTip;
  }
}

async function translateGoldenTip({scope, sourceTip, sourceLanguage, targetLanguage, profile, match}){
  const apiKey = getAPIKey();
  const errorTip = aiGoldenTipErrorFallback();

  if(!apiKey){
    return errorTip;
  }

  const model = getOpenAIModel();
  const sourceName = aiLanguageName(sourceLanguage);
  const targetName = aiLanguageName(targetLanguage);
  const system = scope === 'match'
    ? `You are CheckMatch Lite's contextual translation and adaptation agent for a Match Lite Golden Tip. Return ONLY valid JSON with this exact schema: {"golden_tip": string}.
Translate and adapt the source golden tip from ${sourceName} to ${targetName}. Preserve the same analytical meaning, practical recommendation, intensity, and scope. Do not create a new interpretation from raw data.
Use an empathetic and neutral narrator voice. Do not assume romance, couple dynamics, family roles, or a specific relationship context. Refer to the Match as an interaction between profiles or people.
The translated golden_tip MUST begin with a natural target-language equivalent of: "As observed in the dynamic between these profiles...", "The results of this combination show...", or "Looking at how these profiles interact...". If the source text does not follow this opening rule, adapt the first sentence while preserving the same meaning.
Tone: Empathetic, elegant, and directly useful. Avoid clinical, diagnostic, or overly analytical jargon. Make the reader feel seen and understood.
Never leave the field empty.`
    : `You are CheckMatch Lite's contextual translation and adaptation agent for an individual Self-Profile Golden Tip. Return ONLY valid JSON with this exact schema: {"golden_tip": string}.
Translate and adapt the source golden tip from ${sourceName} to ${targetName}. Preserve the same analytical meaning, practical recommendation, intensity, and scope. Do not create a new interpretation from raw data.
Speak directly to the person in second person throughout the text, using the natural target-language equivalent of "you", "your", "você", "seu", or "sua". Do not use third-person wording such as "the user", "this person", or equivalents.
The translated golden_tip MUST begin with a natural target-language equivalent of: "According to your results...", "As observed in your profile...", "The analysis of your choices suggests...", or "Looking at your current journey...". If the source text does not follow this opening rule, adapt the first sentence while preserving the same meaning.
Tone: Empathetic, elegant, and directly useful. Avoid clinical, diagnostic, or overly analytical jargon. Make the user feel seen and understood.
Never leave the field empty.`;

  try{
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':`Bearer ${apiKey}`},
      body:JSON.stringify({
        model,
        messages:[
          {role:'system', content:system},
          {role:'user', content:JSON.stringify({scope, source_language:sourceLanguage, target_language:targetLanguage, source_tip:sourceTip})}
        ],
        temperature:.18,
        response_format:{type:'json_object'}
      })
    });
    const data = await res.json();
    if(!res.ok) throw new Error(data?.error?.message || aiFallbackMessage());
    const parsed = JSON.parse(data?.choices?.[0]?.message?.content || '{}');
    if (!hasUsableGoldenTip(parsed)) return errorTip;
    return {...normalizeGoldenTip(parsed), _source:'translation', _note:t('aiGenerated')};
  }catch(err){
    console.warn('[Budhi Lite] Golden Tip translation failed.', err);
    return errorTip;
  }
}

async function getOrCreateGoldenTip({scope, profile, match}){
  const targetLang = getLang();
  const bucketName = scope === 'match' ? 'match_golden_tip' : 'profile_golden_tip';
  const subject = scope === 'match' ? match : profile;

  if(!subject) return aiGoldenTipErrorFallback();

  const bucket = aiEnsureBucket(subject, bucketName);
  const cached = aiGetTipFromLanguage(bucket, targetLang);
  if(cached && !cached._error){
    return {...cached, _source: cached._source || bucket.by_language?.[targetLang]?.source || 'cache', _note: cached._note || t('aiGenerated')};
  }

  const originalLang = bucket.original?.language;
  const originalTip = aiGetOriginalTip(bucket);
  let tip;

  if(originalTip && originalLang && originalLang !== targetLang){
    tip = await translateGoldenTip({scope, sourceTip:originalTip, sourceLanguage:originalLang, targetLanguage:targetLang, profile, match});
    if(!tip._error){
      aiSetTipLanguage(bucket, targetLang, tip, {
        source:'translation',
        translated_from:originalLang,
        generated_for:aiViewerUsername(),
        generated_at:aiNow()
      });
    }
  } else {
    tip = await generateGoldenTip({scope, profile, match});
    if(!tip._error){
      if(!bucket.original || !bucket.original.language || bucket.original.language === targetLang){
        aiSetOriginalTip(bucket, targetLang, tip);
      } else {
        aiSetTipLanguage(bucket, targetLang, tip, {source:'original_independent', generated_by:aiViewerUsername(), generated_at:aiNow()});
      }
    }
  }

  if(!tip?._error){
    try{
      if(scope === 'match') await saveMatch(subject);
      else await saveProfile(subject.username, subject);
    }catch(err){
      console.warn('[Budhi Lite] Golden Tip generated but cache save failed.', err);
    }
  }

  return tip;
}