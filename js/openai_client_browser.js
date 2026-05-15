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

  return {
    display_name:    profile.display_name || profile.username || 'User',
    selected_values: (valCard?.tags  || []).map(resolveLabel).filter(Boolean),
    selected_pillars:(pilCard?.tags  || []).map(resolveLabel).filter(Boolean),
    decision_style:  resolveLabel(decCard?.metric_value),
    worldview:       resolveLabel(wvCard?.metric_value),
    decision_bar:    decCard?.bar || 0,
    // Full card list for cross-dimension references
    all_cards: cards.map(c => ({
      key:         c.key,
      title:       resolveLabel(c.title),
      metric:      resolveLabel(c.metric_value),
      bar:         c.bar,
      description: resolveLabel(c.description),
      tags:        (c.tags || []).map(resolveLabel).filter(Boolean),
    })),
  };
}

/* ─────────────────────────────────────────────
   MATCH CONTEXT EXTRACTION
   Pulls both profiles' actual selections plus
   the match formula's comparative output so the
   AI can name specifics for each dimension.
───────────────────────────────────────────── */

function buildMatchContext(match) {
  if (!match) return null;
  const userA    = match.user_a    || (match.usernames || [])[0] || '';
  const userB    = match.user_b    || (match.usernames || [])[1] || '';
  const profileA = typeof getProfile === 'function' ? getProfile(userA) : null;
  const profileB = typeof getProfile === 'function' ? getProfile(userB) : null;
  const app      = match.results_app || {};
  const ctxA     = buildProfileContext(profileA);
  const ctxB     = buildProfileContext(profileB);

  return {
    users:              match.users || [ctxA?.display_name || userA, ctxB?.display_name || userB].filter(Boolean),
    compatibility_score:app.score,
    match_type:         resolveLabel(app.match_type?.label),
    gold_tip:           resolveLabel(app.gold_tip),
    profile_a:          ctxA,
    profile_b:          ctxB,
    // Resolved match cards (per-dimension comparison scores)
    match_cards: (app.cards || []).map(c => ({
      key:         c.key,
      title:       resolveLabel(c.title),
      metric_value:resolveLabel(c.metric_value),
      bar:         c.bar,
      description: resolveLabel(c.description),
      tags:        (c.tags || []).map(resolveLabel).filter(Boolean),
    })),
    strengths: (app.strengths || []).map(s => ({
      title:       resolveLabel(s.title),
      description: resolveLabel(s.description),
    })),
    tensions: (app.tensions || []).map(t => ({
      title:       resolveLabel(t.title),
      description: resolveLabel(t.description),
    })),
    dynamics: (app.dynamics || []).map(d => ({
      title:       resolveLabel(d.title),
      description: resolveLabel(d.description),
    })),
  };
}

/* ─────────────────────────────────────────────
   RICH FALLBACKS
   Used when no API key is present or the call
   fails. Reference actual profile data so even
   the fallback feels personalized.
───────────────────────────────────────────── */

function fallbackDetailsProfile(key, profile) {
  const ctx   = buildProfileContext(profile);
  const cards = profile?.results_app?.cards || [];
  const card  = cards.find(c => c.key === key) || {};
  const title = resolveLabel(card.title) || key;
  const name  = ctx?.display_name || 'the user';
  const ctxVals = ctx?.selected_values  || [];
  const ctxPils = ctx?.selected_pillars || [];
  const vals  = ctxVals.length ? ctxVals.join(', ') : null;
  const pils  = ctxPils.length ? ctxPils.join(', ') : null;
  const dec   = ctx?.decision_style  || null;
  const wv    = ctx?.worldview || null;

  const descriptionByKey = {
    values:
      vals
        ? `${name} selected ${vals} as their guiding values. These anchors shape what this person protects, admires, and expects from relationships and decisions in their current life moment. Value sets tend to act as implicit standards — both for self-evaluation and for how others are judged.`
        : resolveLabel(card.description),
    pillars:
      pils
        ? `${name} is currently drawing life energy and support from ${pils}. These pillars reveal where consistent attention and emotional investment are concentrated right now. Pillars are more situational than values: they describe the structure of today's life, not necessarily a permanent identity.`
        : resolveLabel(card.description),
    decision:
      dec
        ? `${name}'s decision style is described as ${dec}. This pattern characterizes how this person currently moves from reflection to action — including how much information they gather, how much deliberation they prefer, and what tempo feels natural when navigating choices.`
        : resolveLabel(card.description),
    worldview:
      wv
        ? `${name} currently frames life experience through a ${wv} lens. This perspective shapes how events are interpreted, how meaning is assigned, and which directions feel worth pursuing. Worldview is often the most stable layer of a first-layer profile — it acts as the backdrop against which values and decisions acquire their significance.`
        : resolveLabel(card.description),
  };

  const strengthsByKey = {
    values: [
      vals ? `Values like ${ctxVals[0] || 'the ones selected'} create a concrete moral filter that reduces noise in high-stakes decisions.` : `Named values create a concrete moral filter that reduces noise in high-stakes decisions.`,
      `A visible value set gives others — partners, collaborators — a reliable map of what ${name} genuinely protects and prioritizes.`,
      `Named values enable a concrete Match Lite comparison instead of a generic one.`,
    ],
    pillars: [
      pils ? `Current pillars show where ${name} is investing consistent energy — a useful map for protecting what matters most under pressure.` : `Current pillars show where consistent energy is being invested.`,
      `Knowing the pillar structure allows ${name} to evaluate new commitments against what is already load-bearing.`,
      `Pillar data generates a direct and practical Match Lite comparison of life structure alignment.`,
    ],
    decision: [
      dec ? `A ${dec} style creates a recognizable behavioral rhythm that others can learn to coordinate with.` : `This decision style creates a recognizable rhythm that others can coordinate with.`,
      `Understanding this pattern helps ${name} identify contexts where the natural tempo is an advantage.`,
      `Decision style is one of the most visible and actionable dimensions in Match Lite coordination.`,
    ],
    worldview: [
      wv ? `A ${wv} worldview adds interpretive consistency that makes values and decisions cohere as a profile.` : `This worldview adds interpretive consistency that makes values and decisions cohere.`,
      `Naming this perspective helps ${name} recognize when different worldviews are in dialogue rather than in conflict.`,
      `Worldview is one of the deepest compatibility levers — shared or complementary perspectives support lasting relational resonance.`,
    ],
  };

  const challengesByKey = {
    values: [
      vals ? `Value labels carry personal meanings — what ${name} means by one of them may not match how others interpret the same word.` : `Value labels carry personal meanings that may not match how others interpret them.`,
      `Values function as implicit expectations; friction arises when those expectations are not made explicit with others.`,
      `The full Self-Profile will reveal how these values interact with character patterns not visible here.`,
    ],
    pillars: [
      pils ? `Concentration in current pillars may mask under-investment elsewhere — gaps that show up under stress or transition.` : `Strong pillar concentration may mask under-investment elsewhere.`,
      `Pillars describe today's structure, not a permanent identity — they shift as circumstances and relationships evolve.`,
      `The full Self-Profile will distinguish genuine character strengths from situational adaptation patterns.`,
    ],
    decision: [
      dec ? `A ${dec} style can create friction with people whose natural tempo differs significantly.` : `This decision style can create friction with people whose natural tempo differs.`,
      `Decision style shifts under stress and in emotionally charged situations — this result captures the current surface pattern.`,
      `The full Self-Profile will distinguish whether this pattern is a stable trait or a situational adaptation.`,
    ],
    worldview: [
      wv ? `A ${wv} perspective may generate blind spots when engaging with fundamentally different interpretive frameworks.` : `This worldview may generate blind spots with fundamentally different perspectives.`,
      `Worldview labels are broad anchors — useful as starting points, not as precise classifications.`,
      `The full Self-Profile will reveal how this worldview connects to deeper motivational and relational patterns.`,
    ],
  };

  const defaultStrengths  = [`${title} gives ${name} a clear reference point for self-observation.`, `This result supports more intentional reflection on current behavioral patterns.`, `It establishes a foundation for the Match Lite compatibility comparison.`];
  const defaultChallenges = [`${title} is a first-layer signal and should not be treated as a fixed label.`, `Context and life circumstances can shift how this pattern expresses itself.`, `The full Self-Profile will add depth and character-level nuance to this reading.`];

  return {
    title,
    description: descriptionByKey[key] || resolveLabel(card.description) || '',
    strengths:   strengthsByKey[key]   || defaultStrengths,
    challenges:  challengesByKey[key]  || defaultChallenges,
  };
}

function fallbackDetailsMatch(key, match) {
  const ctx   = buildMatchContext(match);
  const card  = (ctx?.match_cards || []).find(c => c.key === key) || {};
  const title = card.title || key;
  const pA    = ctx?.profile_a || {};
  const pB    = ctx?.profile_b || {};
  const nameA = pA.display_name || 'Person A';
  const nameB = pB.display_name || 'Person B';

  const valsA  = pA.selected_values?.length  ? pA.selected_values.join(', ')  : '';
  const valsB  = pB.selected_values?.length  ? pB.selected_values.join(', ')  : '';
  const pilsA  = pA.selected_pillars?.length ? pA.selected_pillars.join(', ') : '';
  const pilsB  = pB.selected_pillars?.length ? pB.selected_pillars.join(', ') : '';
  const decA   = pA.decision_style || '';
  const decB   = pB.decision_style || '';
  const wvA    = pA.worldview || '';
  const wvB    = pB.worldview || '';

  const descriptionByKey = {
    values:
      valsA && valsB
        ? `${nameA} selected ${valsA} as guiding values, while ${nameB} selected ${valsB}. The degree of overlap between these value sets defines much of the relational and moral common ground the pair shares — and the divergences point to areas where implicit expectations may need to be made explicit to avoid misunderstanding.`
        : resolveLabel(card.description) || '',
    pillars:
      pilsA && pilsB
        ? `${nameA} is currently drawing life support from ${pilsA}, while ${nameB} relies on ${pilsB}. These pillar structures reveal whether the pair's current life investments are naturally aligned, complementary, or pulling in different directions — a meaningful signal for understanding how each person manages energy and availability.`
        : resolveLabel(card.description) || '',
    decision:
      decA && decB
        ? `${nameA}'s decision style is ${decA}, while ${nameB}'s is ${decB}. This rhythm pairing is often where the most visible day-to-day coordination — or friction — originates. When styles are well-matched, the pair tends to move in sync; when they diverge, one person's deliberation can feel like hesitation to the other.`
        : resolveLabel(card.description) || '',
    worldview:
      wvA && wvB
        ? `${nameA} holds a ${wvA} perspective on life, while ${nameB} operates from a ${wvB} worldview. Worldview differences are often the deepest source of both meaningful dialogue and persistent misunderstanding — two people can share similar values and yet interpret the same event in ways that feel fundamentally different.`
        : resolveLabel(card.description) || '',
  };

  const strengthsByKey = {
    values: [
      valsA && valsB ? `Shared values between ${nameA} and ${nameB} create implicit common ground — reducing the need to negotiate basic moral priorities.` : `Shared values create implicit common ground between the pair.`,
      `Named overlap gives the pair a concrete vocabulary to use explicitly, rather than assuming alignment that may not exist.`,
      `Knowing which values diverge lets both people anticipate where negotiation is needed before friction accumulates.`,
    ],
    pillars: [
      pilsA && pilsB ? `Aligned pillars mean the pair's current life structures pull in compatible directions — supporting mutual availability and attention.` : `Aligned pillars mean current life structures pull in compatible directions.`,
      `Understanding each other's pillar structure helps the pair coordinate demands and protect what each person considers load-bearing.`,
      `Where pillars differ, the contrast can be complementary rather than conflicting — one person's strong area can serve what the other has deprioritized.`,
    ],
    decision: [
      decA && decB ? `When both styles are understood, the pair can design shared decision protocols intentionally rather than letting rhythm differences create recurring friction.` : `Named decision styles let the pair design shared protocols rather than improvising around friction.`,
      `Style differences become most visible under time pressure — naming them in advance reduces the risk of misreading tempo as commitment.`,
      `Even divergent styles can be a functional pairing when each person understands their complementary role in joint decisions.`,
    ],
    worldview: [
      wvA && wvB ? `A ${wvA} and a ${wvB} perspective can enrich each other's reading of complex situations, widening the pair's combined interpretive range.` : `Different worldviews can widen the pair's combined interpretive range.`,
      `When worldview framing is understood, interpretation differences feel perspectival rather than personal — reducing unnecessary conflict.`,
      `A worldview pairing that genuinely complements each other tends to produce a sense that the pair "speaks the same language" even when they disagree.`,
    ],
  };

  const challengesByKey = {
    values: [
      valsA && valsB ? `Values exclusive to one list are potential friction zones — implicit expectations the other person does not share and may not anticipate.` : `Values exclusive to one person are implicit expectations the other may not share.`,
      `Even shared value labels can mean different things; the pair may interpret the same word through different practical standards.`,
      `The full Self-Profile would reveal which values are load-bearing vs. aspirational for each person.`,
    ],
    pillars: [
      pilsA && pilsB ? `Where pillars diverge significantly, the pair may need to explicitly negotiate how each person's current structure is respected by the other.` : `Diverging pillars may require explicit negotiation about how each person's structure is respected.`,
      `Pillar data captures today's configuration — what is load-bearing now may shift with life events, requiring ongoing recalibration.`,
      `The full Self-Profile would distinguish structural character differences from different life moments.`,
    ],
    decision: [
      decA && decB ? `A ${decA} and a ${decB} rhythm pairing can create persistent friction if neither person frames the difference as stylistic rather than personal.` : `Divergent rhythms create friction when mistaken for differences in commitment or care.`,
      `Style gaps tend to widen under stress — the pair may find their natural rhythms feel more mismatched in high-stakes moments.`,
      `The full Self-Profile would clarify whether these patterns are stable traits or situational adaptations.`,
    ],
    worldview: [
      wvA && wvB ? `A ${wvA} and a ${wvB} perspective can apply different interpretive frameworks to the same event without realizing they are doing so.` : `Different worldviews can apply incompatible interpretive frames to the same event without awareness.`,
      `Worldview differences tend to be most challenging when the pair is under emotional load and meaning-assignment feels non-negotiable.`,
      `The full Self-Profile would add character-level drivers that explain why each worldview expresses as it does.`,
    ],
  };

  const defaultStrengths  = [`This dimension gives both people a concrete reference point for naming what they share.`, `Named comparisons let the pair discuss differences explicitly rather than feeling vague incompatibility.`, `Understanding this result supports more intentional coordination.`];
  const defaultChallenges = [`Differences here may generate implicit friction if left unnamed.`, `First-layer data captures current configuration only — both profiles can evolve.`, `Full Self-Profile data from both people would significantly refine this reading.`];

  return {
    title,
    description: descriptionByKey[key] || resolveLabel(card.description) || '',
    strengths:   strengthsByKey[key]   || defaultStrengths,
    challenges:  challengesByKey[key]  || defaultChallenges,
  };
}

/* ─────────────────────────────────────────────
   NORMALIZATION
   Merges AI output with fallback, ensuring every
   field is populated with useful content.
───────────────────────────────────────────── */

function ensureItems(items, fallbackItems, count) {
  const n       = count || 3;
  const cleaned = (Array.isArray(items) ? items : []).map(x => String(x || '').trim()).filter(Boolean);
  const fb      = (Array.isArray(fallbackItems) ? fallbackItems : []).map(x => String(x || '').trim()).filter(Boolean);
  const merged  = [...cleaned, ...fb];
  const out     = [];
  const seen    = new Set();
  merged.forEach(item => {
    const key = item.toLowerCase();
    if (item && !seen.has(key) && out.length < n) { seen.add(key); out.push(item); }
  });
  while (out.length < n) {
    out.push(['This first-layer result supports self-observation.', 'Use this insight as a starting point for reflection.', 'The full Self-Profile may refine this reading.'][out.length] || '');
  }
  return out.slice(0, n);
}

// Kept for any external reference
function ensureThreeItems(items, fallbackItems) { return ensureItems(items, fallbackItems, 3); }

function normalizeAIDetails(parsed, fallback) {
  return {
    title:       String(parsed?.title       || fallback?.title       || 'AI Details').trim(),
    description: String(parsed?.description || fallback?.description || '').trim(),
    strengths:   ensureItems(parsed?.strengths,  fallback?.strengths,  3),
    challenges:  ensureItems(parsed?.challenges, fallback?.challenges, 3),
  };
}

/* ─────────────────────────────────────────────
   MAIN FUNCTION
   Generates AI card details with full user
   context injected into both payload and prompt.
───────────────────────────────────────────── */

async function generateAIDetails({ scope, key, profile, match }) {
  const apiKey   = getAPIKey();
  const fallback = scope === 'match'
    ? fallbackDetailsMatch(key, match)
    : fallbackDetailsProfile(key, profile);

  if (!apiKey) {
    return { ...normalizeAIDetails(fallback, fallback), _source: 'fallback', _note: t('fallbackUsed') };
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
        description: cardCtx.description,
      },
      person_a: {
        name:            pA.display_name,
        selected_values: pA.selected_values,
        selected_pillars:pA.selected_pillars,
        decision_style:  pA.decision_style,
        worldview:       pA.worldview,
      },
      person_b: {
        name:            pB.display_name,
        selected_values: pB.selected_values,
        selected_pillars:pB.selected_pillars,
        decision_style:  pB.decision_style,
        worldview:       pB.worldview,
      },
      overall_strengths: ctx.strengths,
      overall_tensions:  ctx.tensions,
    };

    systemPrompt = `You are Budhi Lite's compatibility analyst. Return ONLY valid JSON with this exact schema: { "title": string, "description": string, "strengths": [string, string, string], "challenges": [string, string, string] }

Language: ${language}. Write ALL content in that language.

You are analyzing the "${key}" dimension for the pair ${names}.

━━━ ANALYSIS RULES ━━━
1. ANALYZE — do not describe. Do NOT open with "Person A selected X, Person B selected Y." The description must answer: What do both people share in this dimension? What diverges, and does the divergence create friction, complementarity, or both? What is the practical relational implication of each pattern?
2. For values and pillars: identify shared items (appear in both lists) as common ground and explain what that alignment enables. Identify exclusive items (appear in only one list) and explain whether the asymmetry creates tension or a useful complementarity — do not just state that it differs.
3. For decision style and worldview: analyze what the PAIRING produces as a dynamic, not what each style means in isolation.
4. "description": 160–200 words of analytical prose. NO line breaks inside the string. Lead with the dominant pattern the comparison reveals. Use specific names only to anchor the analysis — never to list inventories.
5. Each "strengths" item: 20–35 words. One focused insight about a shared or complementary element and what it creates in practice. No re-listing of items already analyzed in the description.
6. Each "challenges" item: 20–35 words. One focused friction point — name the specific asymmetry and its practical implication. No padding, no generalities.
7. Exactly 3 strengths and 3 challenges.
8. Tone: constructive, practical, non-diagnostic. No therapy language, no certainty claims.`;

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
        selected_values:  ctx?.selected_values,
        selected_pillars: ctx?.selected_pillars,
        decision_style:   ctx?.decision_style,
        worldview:        ctx?.worldview,
      },
      other_dimensions: otherDims,
    };

    systemPrompt = `You are Budhi Lite's insight specialist. Return ONLY valid JSON with this exact schema: { "title": string, "description": string, "strengths": [string, string, string], "challenges": [string, string, string] }

Language: ${language}. Write ALL content in that language.

You are writing personalized insights for ${name} about their "${key}" dimension.

━━━ ANALYSIS RULES ━━━
1. ANALYZE — do not enumerate. Reveal what this specific combination of selections creates for this person: a pattern, a tension, a distinctive profile characteristic. Do NOT structure the description as "User selected X, Y, Z and this means..."
2. Reference specific items only when they serve an analytical point. Name one or two to anchor an insight; do not list all selections in sequence.
3. Connect dimensions when it deepens the analysis: how does the decision style interact with the values? What does the worldview imply about how the life pillars are experienced? These connections are the analysis.
4. "description": 160–200 words of analytical prose. NO line breaks inside the string. Start from insight, not inventory.
5. Each "strengths" item: 20–35 words. One focused analytical insight — a practical benefit, clarity, or advantage this combination creates. No re-listing.
6. Each "challenges" item: 20–35 words. One focused tension or growth edge — a specific practical implication, not a general caveat.
7. Exactly 3 strengths and 3 challenges.
8. Tone: elegant, constructive, non-diagnostic. No therapy language, no certainty claims.`;
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
    if (!res.ok) throw new Error(data?.error?.message || 'OpenAI request failed');
    const parsed = JSON.parse(data?.choices?.[0]?.message?.content || '{}');
    return { ...normalizeAIDetails(parsed, fallback), _source: 'ai', _note: t('aiGenerated') };

  } catch(err) {
    return {
      ...normalizeAIDetails(fallback, fallback),
      _source: 'fallback_error',
      _note:   `${t('aiFailed')} ${err.message || ''}`.trim(),
    };
  }
}
