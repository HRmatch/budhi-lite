// CheckMatch Lite — IA semantic resolver
// Browser-side layer for typo/context/similarity analysis of free-text answers.
// Uses the user's OpenAI key from sessionStorage through getAPIKey(); never persists the key.
// Semantic term model: prioritizes `semantic_terms` and falls back to legacy `synonyms`.


function iaLegacyGlobal(name, fallback) {
  try {
    return typeof globalThis !== 'undefined' && globalThis[name] !== undefined ? globalThis[name] : fallback;
  } catch (_) {
    return fallback;
  }
}

function iaDefaultMinValues(fallback = 1) {
  return iaLegacyGlobal('QT6_MIN_VALUES', fallback);
}

function iaDefaultMaxValues(fallback = 1) {
  return iaLegacyGlobal('QT6_MAX_VALUES', fallback);
}

function iaDefaultMatchThreshold(fallback = 0.60) {
  return iaLegacyGlobal('QT6_VALUE_MATCH_THRESHOLD', fallback);
}

function iaDefaultLockThreshold(fallback = 0.72) {
  return iaLegacyGlobal('QT6_VALUE_STRONG_LOCK_THRESHOLD', fallback);
}

function iaLanguageName(code) {
  return ({
    en: 'English',
    pt: 'Portuguese (Brazil)',
    es: 'Spanish',
    fr: 'French',
    de: 'German',
    ge: 'German'
  }[code] || code || 'English');
}

function iaResolveLabel(val, lang) {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string') return val;
  if (Array.isArray(val)) return val.map(x => iaResolveLabel(x, lang)).join(', ');
  if (typeof val === 'object') {
    return val[lang] || val.en || Object.values(val).find(Boolean) || '';
  }
  return String(val);
}

function iaNormalizeTerm(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[_-]+/g, ' ')
    .replace(/[^\p{L}\p{N}\s]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function iaNormalizePercent(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}


/* ─────────────────────────────────────────────
   Local safety filter
   Blocks insults, hate/discriminatory ideologies, and slurs BEFORE any AI call.
   This is intentionally deterministic so the UI does not rely only on model judgment.
───────────────────────────────────────────── */
function iaNormalizeSafetyText(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[@4]/g, 'a')
    .replace(/[3]/g, 'e')
    .replace(/[1!|]/g, 'i')
    .replace(/[0]/g, 'o')
    .replace(/[$5]/g, 's')
    .replace(/[7]/g, 't')
    .replace(/[_\-]+/g, ' ')
    .replace(/[^a-z0-9\s]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function iaEscapeRegExp(value) {
  return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function iaSafetyTermMatches(normalizedText, normalizedTerm) {
  if (!normalizedText || !normalizedTerm) return false;
  const term = iaEscapeRegExp(normalizedTerm);
  return new RegExp(`(^|\\s)${term}($|\\s)`, 'i').test(normalizedText);
}

const IA_DEFAULT_BLOCKED_TERMS = Object.freeze({
  hate_or_extremist_ideology: [
    'white supremacy', 'supremacia branca', 'supremacia racial', 'supremacismo branco',
    'racial supremacy', 'aryan supremacy', 'nazi', 'nazism', 'nazismo', 'neo nazi', 'neonazi', 'neonazismo'
  ],
  discriminatory_content: [
    'racismo', 'racist', 'racista', 'xenofobia', 'xenophobia', 'xenofobico', 'xenofobica',
    'homofobia', 'homophobia', 'transfobia', 'transphobia', 'misoginia', 'misogyny',
    'antisemitismo', 'antisemitism', 'islamofobia', 'islamophobia', 'misantropia', 'misanthropy'
  ],
  identity_slur_or_dehumanization: [
    'macaco', 'bicha', 'viado', 'traveco', 'boiola', 'fag', 'faggot', 'dyke', 'monkey', 'ape'
  ],
  direct_abuse_or_insult: [
    'idiota', 'imbecil', 'burro', 'burra', 'lixo', 'estupido', 'estupida', 'otario', 'otaria',
    'stupid', 'idiot', 'moron', 'trash', 'scum', 'dumb', 'dumbass'
  ]
});

function iaConfiguredBlockedTerms(opts = {}) {
  const groups = [];
  const addGroup = (source, defaultReason = 'blocked_language') => {
    if (!source) return;
    if (Array.isArray(source)) {
      groups.push({ reason: defaultReason, terms: source });
      return;
    }
    if (typeof source === 'object') {
      Object.entries(source).forEach(([reason, terms]) => {
        if (Array.isArray(terms)) groups.push({ reason, terms });
      });
    }
  };

  addGroup(IA_DEFAULT_BLOCKED_TERMS);
  addGroup(opts.blockedTerms || opts.blocklist || opts.safetyTerms);
  try {
    if (typeof globalThis !== 'undefined') {
      addGroup(globalThis.CHECKMATCH_BLOCKED_TERMS);
      addGroup(globalThis.CHECKMATCH_SAFETY_TERMS);
    }
  } catch (_) {}
  return groups;
}

function iaDetectBlockedInput(input, opts = {}) {
  const normalizedText = iaNormalizeSafetyText(input);
  if (!normalizedText) return null;

  for (const group of iaConfiguredBlockedTerms(opts)) {
    for (const rawTerm of group.terms || []) {
      const normalizedTerm = iaNormalizeSafetyText(rawTerm);
      if (iaSafetyTermMatches(normalizedText, normalizedTerm)) {
        return {
          blocked: true,
          reason: String(group.reason || 'blocked_language'),
          matched: normalizedTerm,
          normalizedText
        };
      }
    }
  }
  return null;
}

function iaBlockedAssessment(input, blocked, opts = {}) {
  const minValues = Number(opts.minValues || opts.min_select || iaDefaultMinValues(1));
  const maxValues = Number(opts.maxValues || opts.max_select || iaDefaultMaxValues(1));
  const thresholdPct = Math.round(Number(opts.aiThreshold || opts.threshold || opts.aiAssociationThreshold || iaDefaultMatchThreshold(0.60)) * 100);
  const lockPct = Math.round(Number(opts.aiLockThreshold || opts.strongLockThreshold || iaDefaultLockThreshold(0.72)) * 100);

  return {
    category: null,
    categories: [],
    lockedCategories: [],
    score: 0,
    confidence: 0,
    threshold: thresholdPct / 100,
    strongLockThreshold: lockPct / 100,
    minValues,
    maxValues,
    requiresFallback: false,
    invalid: true,
    reason: blocked?.reason || 'blocked_language',
    messageKey: 'qt6InvalidContent',
    keywords: [],
    contextualTerms: [],
    correctedText: '',
    correctedTerms: [],
    aiAssessment: null,
    candidates: [],
    safety: {
      blocked: true,
      reason: blocked?.reason || 'blocked_language',
      // Keep the matched normalized term only for debugging; the UI should not display it.
      matched: blocked?.matched || null
    }
  };
}

// Public helper for forms_controller.js or formula_phase1_lite.js.
// Returns a normalized invalid-match object or null.
function detectBlockedSemanticInput(input, opts = {}) {
  const blocked = iaDetectBlockedInput(input, opts);
  return blocked ? iaBlockedAssessment(input, blocked, opts) : null;
}

function iaTermLanguageOrder(lang, availableMap = null) {
  const preferred = [];
  const push = value => {
    const key = String(value || '').trim();
    if (!key || preferred.includes(key)) return;
    if (availableMap && typeof availableMap === 'object' && !Object.prototype.hasOwnProperty.call(availableMap, key)) return;
    preferred.push(key);
  };

  push(lang || (typeof getLang === 'function' ? getLang() : 'en'));
  push('en');
  push('pt');
  push('es');
  push('fr');
  push('de');

  if (availableMap && typeof availableMap === 'object') {
    Object.keys(availableMap).forEach(push);
  }
  return preferred;
}

function iaCoerceTerm(item, fallbackKind = 'synonym', fallbackWeight = 0.82, fallbackMatch = 'token_or_fuzzy') {
  const text = typeof item === 'string' ? item : item?.text;
  const normalized = iaNormalizeTerm(typeof item === 'string' ? item : (item?.normalized || text));
  if (!text || !normalized) return null;

  const weight = typeof item === 'object' && item !== null
    ? Number(item.weight ?? fallbackWeight)
    : Number(fallbackWeight);

  return {
    text: String(text),
    normalized,
    kind: typeof item === 'object' && item !== null ? (item.kind || fallbackKind) : fallbackKind,
    weight: Number.isFinite(weight) ? weight : fallbackWeight,
    match: typeof item === 'object' && item !== null ? (item.match || fallbackMatch) : fallbackMatch,
    lock: typeof item === 'object' && item !== null ? Boolean(item.lock) : fallbackWeight >= 0.9
  };
}

function iaPushTerm(out, seen, item, fallbackKind, fallbackWeight, fallbackMatch) {
  const term = iaCoerceTerm(item, fallbackKind, fallbackWeight, fallbackMatch);
  if (!term || seen.has(term.normalized)) return;
  seen.add(term.normalized);
  out.push(term);
}

function iaSemanticTermsForCategory(categoryData, lang = 'en', opts = {}) {
  const out = [];
  const seen = new Set();
  const maxTerms = Number(opts.maxSemanticTermsPerCategory || 54);

  const semanticMap = categoryData?.semantic_terms || categoryData?.semanticTerms || {};
  iaTermLanguageOrder(lang, semanticMap).forEach(language => {
    (semanticMap?.[language] || []).forEach(item => iaPushTerm(out, seen, item, 'synonym', 0.82, 'token_or_fuzzy'));
  });

  // Compatibility with the older model: add base terms as canonical evidence.
  const baseTermsMap = categoryData?.base_terms || categoryData?.baseTerms || {};
  iaTermLanguageOrder(lang, baseTermsMap).forEach(language => {
    (baseTermsMap?.[language] || []).forEach(text => {
      iaPushTerm(out, seen, {
        text,
        kind: 'canonical',
        weight: 1.0,
        match: 'exact',
        lock: true
      }, 'canonical', 1.0, 'exact');
    });
  });

  // Legacy fallback: still read synonyms, but with weaker/default weight.
  const synonymsMap = categoryData?.synonyms || {};
  iaTermLanguageOrder(lang, synonymsMap).forEach(language => {
    (synonymsMap?.[language] || []).forEach(text => {
      const normalized = iaNormalizeTerm(text);
      const wordCount = normalized ? normalized.split(' ').length : 0;
      const kind = wordCount <= 1 && normalized.length <= 5 ? 'short_term' : 'synonym';
      const weight = kind === 'short_term' ? 0.7 : 0.82;
      const match = wordCount > 1 ? 'phrase' : 'token_or_fuzzy';
      iaPushTerm(out, seen, { text, kind, weight, match, lock: false }, kind, weight, match);
    });
  });

  return out
    .sort((a, b) => {
      if (b.weight !== a.weight) return b.weight - a.weight;
      return b.normalized.length - a.normalized.length;
    })
    .slice(0, Number.isFinite(maxTerms) && maxTerms > 0 ? maxTerms : 54);
}

function iaLegacyReferenceTerms(categoryData, maxPerLanguage = 24) {
  const synonyms = categoryData?.synonyms || {};
  return Object.fromEntries(
    Object.entries(synonyms).map(([key, values]) => [key, (values || []).slice(0, maxPerLanguage)])
  );
}

function iaTermModelFromQuestion(opts = {}) {
  return opts.termModel || opts.nlp?.term_model || opts.question?.nlp?.term_model || {
    preferred_field: 'semantic_terms',
    legacy_synonyms_supported: true,
    normalization: {
      lowercase: true,
      remove_diacritics: true,
      collapse_whitespace: true
    },
    weights: {
      canonical: 1.0,
      phrase: 0.92,
      synonym: 0.82,
      short_term: 0.70,
      context: 0.45,
      negative: -1.0
    }
  };
}

/* ─────────────────────────────────────────────
   Generic IA resolver
   Reads the active question's NLP category map.
───────────────────────────────────────────── */
function iaQuestionCategoryMap(opts = {}) {
  return opts.categoryMap || opts.categoriesMap || opts.categories || opts.question?.nlp?.categories || null;
}

function iaQuestionCategoryKeys(opts = {}) {
  const map = iaQuestionCategoryMap(opts);
  if (map && typeof map === 'object') return Object.keys(map);
  if (typeof QT6_VALUE_CATEGORIES !== 'undefined') return QT6_VALUE_CATEGORIES;
  return [];
}

function iaBaseItems(lang, opts = {}) {
  const map = iaQuestionCategoryMap(opts);
  const categories = iaQuestionCategoryKeys(opts);
  const maxTerms = Number(opts.maxSemanticTermsPerCategory || 54);

  return categories.map(category => {
    const data = (map && map[category]) || (typeof QT6_VALUE_LIBRARY !== 'undefined' && QT6_VALUE_LIBRARY[category]) || {};
    const label = data.label || (typeof VALUE_LABELS !== 'undefined' ? VALUE_LABELS[category] : null) || {};
    const semanticTerms = iaSemanticTermsForCategory(data, lang, { ...opts, maxSemanticTermsPerCategory: maxTerms });
    const negativeTerms = semanticTerms.filter(term => term.kind === 'negative' || Number(term.weight) < 0);

    return {
      category: String(data.value ?? category),
      label: iaResolveLabel(label, lang),
      labels: label,
      value: data.value ?? category,
      semantic_terms: semanticTerms.map(term => ({
        text: term.text,
        normalized: term.normalized,
        kind: term.kind,
        weight: Number(term.weight),
        match: term.match,
        lock: Boolean(term.lock)
      })),
      negative_terms: negativeTerms.map(term => term.normalized),
      reference_terms: iaLegacyReferenceTerms(data),
      term_counts: {
        semantic_terms: semanticTerms.length,
        negative_terms: negativeTerms.length
      }
    };
  });
}

function iaUniqueCategories(items, maxValues, opts = {}) {
  const valid = new Set(iaQuestionCategoryKeys(opts).map(String));
  const out = [];
  const seen = new Set();

  (items || []).forEach(item => {
    const category = String((item?.category ?? item?.value ?? item) || '').trim();
    if (!category || seen.has(category)) return;
    if (valid.size && !valid.has(category)) return;
    seen.add(category);
    out.push(item && typeof item === 'object' ? { ...item, category } : { category });
  });

  return out.slice(0, maxValues || 5);
}

function iaBuildUserPayload(input, localMatch, opts = {}) {
  const lang = typeof getLang === 'function' ? getLang() : (opts.language || 'en');
  return {
    question_id: opts.questionId || opts.qid || 'free_text',
    question_mode: opts.questionMode || opts.mode || 'semantic_association',
    question_text: opts.questionText || '',
    raw_input: String(input || ''),
    language: lang,
    language_name: iaLanguageName(lang),
    min_values: Number(opts.minValues || opts.min_select || iaDefaultMinValues(1)),
    max_values: Number(opts.maxValues || opts.max_select || iaDefaultMaxValues(1)),
    association_threshold: Math.round(Number(opts.threshold || opts.aiAssociationThreshold || iaDefaultMatchThreshold(0.60)) * 100),
    lock_threshold: Math.round(Number(opts.aiLockThreshold || opts.strongLockThreshold || iaDefaultLockThreshold(0.72)) * 100),
    term_model: iaTermModelFromQuestion(opts),
    local_analysis: localMatch || null,
    base_categories: iaBaseItems(lang, opts)
  };
}

function iaSystemPrompt(opts = {}) {
  const minValues = Number(opts.minValues || opts.min_select || iaDefaultMinValues(1));
  const maxValues = Number(opts.maxValues || opts.max_select || iaDefaultMaxValues(1));
  const threshold = Math.round(Number(opts.threshold || opts.aiAssociationThreshold || iaDefaultMatchThreshold(0.60)) * 100);
  const lockThreshold = Math.round(Number(opts.aiLockThreshold || opts.strongLockThreshold || iaDefaultLockThreshold(0.72)) * 100);
  const qid = opts.questionId || 'the current question';
  const rangeText = minValues === maxValues ? `${maxValues}` : `${minValues}-${maxValues}`;

  return `You are CheckMatch Lite's semantic resolver for ${qid}. Analyze the user's free-text answer and compare it ONLY with the provided payload.base_categories.
Return ONLY valid JSON with this exact schema:
{
  "valid": boolean,
  "detected_language": string,
  "corrected_text": string,
  "keywords": [string],
  "contextual_terms": [string],
  "invalid_reason": string|null,
  "selected_categories": [
    {
      "category": string,
      "similarity": number,
      "evidence": [string],
      "spelling_notes": [string],
      "rationale": string,
      "recommended_lock": boolean
    }
  ],
  "rejected_candidates": [
    { "term": string, "reason": string }
  ],
  "ambiguous": boolean,
  "requires_fallback": boolean
}

Rules:
1. category MUST be one of payload.base_categories[].category. Never invent category names.
2. Use payload.base_categories[].semantic_terms as the primary semantic dictionary. Each term has text, normalized, kind, weight, match, and lock.
3. Use reference_terms only as legacy fallback evidence. Do not prefer reference_terms over semantic_terms.
4. Treat term weights as confidence hints: canonical/phrase terms are stronger; short_term/context terms are weaker; negative terms are false-positive guards.
5. recommended_lock=true only when evidence is strong/direct, similarity is ${lockThreshold}+ and the matched semantic term has lock=true or clearly behaves as canonical/phrase evidence.
6. Similarity is 0-100. Use ${threshold}+ only when the input has clear semantic evidence for that base category.
7. The final answer must contain exactly or within ${rangeText} category item(s), according to payload.min_values and payload.max_values. If fewer than payload.min_values categories are strongly supported, set requires_fallback=true.
8. If more than payload.max_values categories appear, return the most supported categories up to payload.max_values and set requires_fallback=true so the interface can ask the user to confirm.
9. If the answer arrives from multiple boxes joined by line breaks, commas, semicolons, pipes, bullets, or numbered items, treat each non-empty segment as a candidate item.
10. If the input contains a meaningful concept outside base_categories, put it in contextual_terms or rejected_candidates, not in selected_categories.
11. Do not over-infer. A broad phrase should not be expanded into categories unless the words clearly support them.
12. If a term appears to fit multiple categories similarly, set ambiguous=true and requires_fallback=true unless one category has clearly stronger evidence.
13. If the text is offensive, depreciative, hateful, discriminatory, dehumanizing, extremist, a slur, nonsense, a link/contact, or unrelated to the expected question pattern, set valid=false and invalid_reason accordingly.
14. Local safety filtering runs before this model call, but you must still reject any harmful content that reaches you.
15. Keep rationale concise, practical, and non-diagnostic.`;
}

function iaNormalizeAssessment(aiRaw, localMatch, opts = {}) {
  const minValues = Number(opts.minValues || opts.min_select || iaDefaultMinValues(1));
  const maxValues = Number(opts.maxValues || opts.max_select || iaDefaultMaxValues(1));
  const thresholdPct = Math.round(Number(opts.aiThreshold || opts.threshold || opts.aiAssociationThreshold || iaDefaultMatchThreshold(0.60)) * 100);
  const lockPct = Math.round(Number(opts.aiLockThreshold || opts.strongLockThreshold || iaDefaultLockThreshold(0.72)) * 100);
  const data = aiRaw && typeof aiRaw === 'object' ? aiRaw : {};

  if (data.valid === false) {
    const invalidReason = String(data.invalid_reason || 'ai_unresolved').toLowerCase();
    const hardBlock = ['blocked_language', 'offensive', 'abusive', 'depreciative', 'hate', 'harassment'].some(token => invalidReason.includes(token));
    return {
      category: null,
      categories: [],
      lockedCategories: [],
      score: 0,
      confidence: 0,
      threshold: thresholdPct / 100,
      strongLockThreshold: lockPct / 100,
      minValues,
      maxValues,
      requiresFallback: !hardBlock,
      invalid: hardBlock,
      reason: hardBlock ? (data.invalid_reason || 'blocked_language') : 'manual_selection_required',
      messageKey: hardBlock ? 'qt6InvalidContent' : null,
      keywords: Array.isArray(data.keywords) ? data.keywords : (localMatch?.keywords || []),
      contextualTerms: Array.isArray(data.contextual_terms) ? data.contextual_terms : (localMatch?.contextualTerms || []),
      correctedText: String(data.corrected_text || ''),
      aiAssessment: data,
      candidates: []
    };
  }

  const localLocked = iaUniqueCategories(
    ((localMatch?.lockedCategories || []).map(category => ({ category, similarity: 100, source: 'local' }))),
    maxValues,
    opts
  );

  const aiSelected = iaUniqueCategories(data.selected_categories || [], maxValues + 3, opts)
    .map(item => ({
      ...item,
      similarity: iaNormalizePercent(item.similarity),
      recommended_lock: Boolean(item.recommended_lock)
    }))
    .filter(item => item.similarity >= thresholdPct)
    .sort((a, b) => b.similarity - a.similarity);

  const mergedMap = new Map();
  [...aiSelected, ...localLocked].forEach(item => {
    const existing = mergedMap.get(item.category);
    if (!existing || (item.similarity || 0) > (existing.similarity || 0)) mergedMap.set(item.category, item);
  });

  const merged = [...mergedMap.values()]
    .sort((a, b) => (b.similarity || 0) - (a.similarity || 0))
    .slice(0, maxValues);

  const categories = merged.map(x => x.category);
  const lockedCategories = merged
    .filter(x => x.recommended_lock || Number(x.similarity) >= lockPct || localLocked.some(l => l.category === x.category))
    .map(x => x.category)
    .slice(0, maxValues);

  const avg = merged.length
    ? merged.reduce((sum, item) => sum + Number(item.similarity || 0), 0) / merged.length
    : Number(localMatch?.score || 0);

  let reason = null;
  if (!categories.length) reason = 'no_semantic_match';
  else if (categories.length < minValues) reason = 'manual_selection_required';
  else if (categories.length > maxValues) reason = 'too_many_values_detected';
  else if (data.ambiguous) reason = 'ambiguous_ai_result';
  else if (data.requires_fallback) reason = 'manual_selection_required';

  return {
    category: categories[0] || null,
    categories,
    lockedCategories,
    score: iaNormalizePercent(avg),
    confidence: Math.max(0, Math.min(1, Number(avg || 0) / 100)),
    threshold: thresholdPct / 100,
    strongLockThreshold: lockPct / 100,
    minValues,
    maxValues,
    requiresFallback: Boolean(reason),
    invalid: false,
    reason,
    messageKey: reason ? 'qt6NeedsManualFallback' : null,
    keywords: Array.isArray(data.keywords) ? data.keywords : (localMatch?.keywords || []),
    contextualTerms: Array.isArray(data.contextual_terms) ? data.contextual_terms : (localMatch?.contextualTerms || []),
    correctedText: String(data.corrected_text || ''),
    correctedTerms: Array.isArray(data.selected_categories)
      ? data.selected_categories.flatMap(c => c.spelling_notes || []).filter(Boolean)
      : (localMatch?.correctedTerms || []),
    aiAssessment: data,
    candidates: merged.map(item => ({
      category: item.category,
      score: iaNormalizePercent(item.similarity),
      matchedTerm: (item.evidence || []).join(', '),
      rationale: item.rationale || '',
      source: item.source || 'ai'
    }))
  };
}

async function analyzeFreeTextInputWithAI(input, localMatch, opts = {}) {
  const blocked = iaDetectBlockedInput(input, opts);
  if (blocked) {
    return {
      ok: false,
      skipped: true,
      reason: blocked.reason || 'blocked_language',
      match: iaBlockedAssessment(input, blocked, opts)
    };
  }

  const apiKey = typeof getAPIKey === 'function' ? getAPIKey() : '';
  if (!apiKey) {
    return {
      ok: false,
      skipped: true,
      reason: 'missing_api_key',
      match: localMatch || null
    };
  }

  const model = typeof getOpenAIModel === 'function' ? getOpenAIModel() : 'gpt-4o-mini';
  const payload = iaBuildUserPayload(input, localMatch, opts);

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: iaSystemPrompt(opts) },
          { role: 'user', content: JSON.stringify(payload) }
        ],
        temperature: 0.12,
        response_format: { type: 'json_object' }
      })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data?.error?.message || 'IA semantic analysis failed');
    const parsed = JSON.parse(data?.choices?.[0]?.message?.content || '{}');
    return {
      ok: true,
      skipped: false,
      reason: null,
      raw: parsed,
      match: iaNormalizeAssessment(parsed, localMatch, opts)
    };
  } catch (err) {
    console.warn('[CheckMatch Lite] IA resolver failed.', err);
    return {
      ok: false,
      skipped: false,
      reason: 'ai_error',
      error: String(err?.message || err),
      match: localMatch || null
    };
  }
}

function shouldUseIAResolver(localMatch, q, opts = {}) {
  if (!localMatch || localMatch.invalid) return false;
  if (opts.forceAI) return true;
  if (localMatch.requiresFallback) return true;
  if ((localMatch.correctedTerms || []).length) return true;
  if ((localMatch.contextualTerms || []).length) return true;
  if ((localMatch.ambiguousTerms || []).length) return true;
  if (Number(localMatch.score || 0) < Number(opts.aiReviewBelowScore || 82)) return true;
  return false;
}
