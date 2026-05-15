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
  const vals  = ctx?.selected_values?.length  ? ctx.selected_values.join(', ')  : null;
  const pils  = ctx?.selected_pillars?.length ? ctx.selected_pillars.join(', ') : null;
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
      vals
        ? `The values ${vals} give ${name} a reliable moral compass that can filter noise from genuinely important decisions, reducing the cognitive load of high-stakes choices.`
        : `The selected values give ${name} a reliable moral compass for high-stakes decisions.`,
      `Having named values creates a shared vocabulary that others — partners, collaborators, family — can use to understand what ${name} genuinely protects and prioritizes.`,
      `This values set establishes a first-layer foundation for the Match Lite compatibility reading, enabling a concrete comparison of moral and relational anchors.`,
    ],
    pillars: [
      pils
        ? `The pillars ${pils} show where ${name} is making consistent investments of attention, which makes it easier to protect those areas during periods of high demand or transition.`
        : `The selected pillars show where ${name} is making consistent investments of attention.`,
      `Knowing the current pillar structure supports more intentional prioritization — ${name} can assess new commitments against what is already load-bearing in their life.`,
      `This pillar set can be compared in Match Lite to reveal whether a partner's current life structure is aligned, complementary, or in tension with ${name}'s own.`,
    ],
    decision: [
      dec
        ? `A ${dec} style gives ${name} a recognizable rhythm that, when understood, allows others to synchronize their expectations and reduce friction in joint decision-making.`
        : `This decision style gives ${name} a recognizable rhythm that others can learn to work with.`,
      `Understanding this style helps ${name} identify contexts where their natural pace is an advantage and where it may need adjustment.`,
      `The decision style result is one of the most directly actionable dimensions in the Match Lite reading, showing how the pair's action rhythms interact.`,
    ],
    worldview: [
      wv
        ? `A ${wv} worldview gives ${name} a coherent interpretive framework that adds depth and consistency to first-layer profile decisions and value choices.`
        : `This worldview gives ${name} a coherent interpretive framework that adds depth to other profile dimensions.`,
      `Naming this perspective makes it easier for ${name} to recognize when they are in dialogue with fundamentally different worldviews, reducing unproductive misunderstandings.`,
      `Worldview is one of the deepest compatibility levers in Match Lite — shared or complementary perspectives can support a more resonant relational dynamic.`,
    ],
  };

  const challengesByKey = {
    values: [
      vals
        ? `Values like ${vals} can function as implicit expectations that others do not share — creating friction when those expectations are not made explicit in close relationships or collaborations.`
        : `Selected values can function as implicit expectations that require explicit communication with others.`,
      `Surface-level value labels often carry a range of personal interpretations — what ${name} means by one of these values may differ significantly from how others understand the same word.`,
      `The full Self-Profile will reveal how these values interact with character patterns and emotional tendencies, adding a layer of nuance not captured here.`,
    ],
    pillars: [
      pils
        ? `A strong concentration in pillars like ${pils} can indicate areas of imbalance or under-investment elsewhere that only become visible under stress or transition.`
        : `The current pillar concentration may indicate areas of under-investment that become visible under stress.`,
      `Pillars reflect the present life structure, not a permanent configuration — shifts in context, relationships, or priorities can change which areas naturally command more energy.`,
      `The full Self-Profile will distinguish between pillars that reflect genuine character strengths and those that reflect temporary life circumstances or compensatory habits.`,
    ],
    decision: [
      dec
        ? `A ${dec} style may create visible friction in contexts that require a different tempo — particularly when working with people whose natural decision rhythm differs significantly.`
        : `This decision style may create friction in contexts that require a different tempo.`,
      `Decision style can shift substantially under stress, in unfamiliar environments, or in emotionally charged situations — this teaser captures the current surface pattern, not the full range.`,
      `The full Self-Profile will connect this style to deeper character patterns, distinguishing habitual responses from conscious preferences.`,
    ],
    worldview: [
      wv
        ? `A ${wv} perspective may generate blind spots when engaging with people or situations that operate from fundamentally different interpretive frameworks.`
        : `This worldview may generate blind spots when engaging with fundamentally different perspectives.`,
      `Worldview labels are broad anchors, not precise identities — they should be treated as starting points for reflection rather than fixed categories.`,
      `The full Self-Profile will connect this worldview to character-level patterns, showing how it shapes not just interpretation but also motivation and relational style.`,
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
      valsA && valsB
        ? `Shared or adjacent values between ${nameA} (${valsA}) and ${nameB} (${valsB}) create a moral and relational common ground that reduces the need to negotiate basic priorities.`
        : `Shared values between the pair create a moral and relational common ground.`,
      `Named value overlap gives the pair a concrete vocabulary they can use explicitly, rather than relying on unspoken assumptions about what each person protects and expects.`,
      `Understanding which values converge and which diverge helps the pair anticipate where alignment is easy and where deliberate communication becomes more important.`,
    ],
    pillars: [
      pilsA && pilsB
        ? `When ${nameA}'s pillars (${pilsA}) and ${nameB}'s pillars (${pilsB}) align or complement each other, the pair tends to naturally support each other's most important life investments.`
        : `Aligned or complementary life pillars between the pair tend to support each other's most important investments.`,
      `Understanding the pillar structures of both profiles helps each person appreciate the other's current demands, making it easier to coordinate availability and attention.`,
      `Where pillars differ, the contrast can be complementary rather than conflicting — one person's strong investment in an area the other has deprioritized can create a useful balance.`,
    ],
    decision: [
      decA && decB
        ? `When ${nameA}'s ${decA} style and ${nameB}'s ${decB} style are well understood, the pair can intentionally design how they approach shared decisions to minimize friction.`
        : `When both decision styles are well understood, the pair can intentionally design shared decision processes to minimize friction.`,
      `Naming the style contrast gives both people a non-personal frame for discussing differences in tempo, deliberation depth, and initiative — reducing the risk of misreading style differences as character flaws.`,
      `Even divergent decision styles can become a functional pairing when both people understand their complementary roles in moving from reflection to action.`,
    ],
    worldview: [
      wvA && wvB
        ? `A ${wvA} perspective and a ${wvB} perspective can enrich each other's interpretation of complex situations, offering the pair a broader combined view of meaning and possibility.`
        : `Different worldviews can enrich each other's interpretation of complex situations.`,
      `When the pair understands each other's worldview framing, they can interpret differences in reaction and meaning-making as perspectival rather than as personal rejection or disagreement.`,
      `A combination of worldviews can make the pair more adaptive when facing situations that challenge any single interpretive lens.`,
    ],
  };

  const challengesByKey = {
    values: [
      valsA && valsB
        ? `Diverging values between ${nameA} and ${nameB} — particularly those that appear in one list but not the other — can generate silent friction when treated as shared without confirmation.`
        : `Diverging values can generate silent friction when treated as shared without confirmation.`,
      `Even values that share a label can mean very different things in practice — the pair may need to explicitly explore what each value implies for expectations, priorities, and boundaries.`,
      `First-layer values data does not capture intensity or hierarchy; the full Self-Profile would reveal which values are load-bearing for each person and which are more aspirational.`,
    ],
    pillars: [
      pilsA && pilsB
        ? `Where ${nameA}'s pillars (${pilsA}) and ${nameB}'s pillars (${pilsB}) diverge significantly, the pair may need to explicitly negotiate how each person's life structure is respected by the other.`
        : `Where pillars diverge, the pair may need to negotiate how each person's life structure is respected.`,
      `Pillar data captures the current configuration, which can shift with life events — what is load-bearing today may look different in a year, requiring ongoing recalibration between the pair.`,
      `The full Self-Profile would add character-level data that clarifies whether pillar divergences reflect fundamental differences or simply distinct life moments.`,
    ],
    decision: [
      decA && decB
        ? `A ${decA} style meeting a ${decB} style can create persistent friction if neither person understands that the difference is stylistic rather than a reflection of commitment or care.`
        : `Divergent decision styles can create persistent friction if misread as commitment or care differences.`,
      `Under stress or time pressure, style differences often become more pronounced — the pair may find that their natural rhythms feel more mismatched in high-stakes moments than in routine ones.`,
      `The full Self-Profile would clarify whether these style patterns are stable traits or situational adaptations that could shift with context.`,
    ],
    worldview: [
      wvA && wvB
        ? `A ${wvA} and a ${wvB} worldview can generate persistent misunderstanding when the pair applies different interpretive frameworks to the same event without realizing they are doing so.`
        : `Different worldviews can generate misunderstanding when different interpretive frameworks are applied to the same event without recognition.`,
      `Worldview differences tend to be most challenging in high-stakes or emotionally loaded moments, where the meaning each person assigns to events may feel irreconcilable.`,
      `The full Self-Profile would reveal the character-level drivers behind each worldview, adding nuance that goes beyond first-layer classification.`,
    ],
  };

  const defaultStrengths  = [`This dimension gives ${nameA} and ${nameB} a concrete reference point for conversation.`, `Named comparisons create a shared vocabulary the pair can use to discuss differences explicitly.`, `Understanding this result supports more intentional coordination.`];
  const defaultChallenges = [`Differences in this dimension may create implicit friction if not addressed directly.`, `First-layer data captures current configuration only — both profiles can evolve.`, `The full Self-Profile from both people would significantly refine this reading.`];

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

━━━ MANDATORY RULES ━━━
1. ALWAYS name the specific values, pillars, decision styles, or worldviews from the data. NEVER write "their values" or "their differences" without naming what they actually are.
2. Explicitly compare person_a and person_b: name what they share, name what differs, and explain what each difference means in practice for their dynamic.
3. For overlapping items: name them and explain the practical benefit of that alignment.
4. For diverging items: name both sides and articulate whether the difference creates friction, complementarity, or requires explicit negotiation.
5. "description": 170–220 words of continuous flowing prose. NO line breaks inside the string. Structure: (a) what both profiles share or how they compare in this dimension, (b) what the key difference means in practice, (c) what this implies for the pair's relational dynamic.
6. Each "strengths" item: one complete sentence of 40–65 words naming specific elements from both profiles and explaining the positive dynamic they create.
7. Each "challenges" item: one complete sentence of 40–65 words naming specific diverging elements and explaining the practical tension or growth edge.
8. Exactly 3 strengths and 3 challenges. No sentence fragments.
9. Tone: constructive, practical, non-diagnostic. No therapy language, no certainty claims, nothing that sounds like a final verdict.`;

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

━━━ MANDATORY RULES ━━━
1. ALWAYS reference the user's specific selections by name. If values are "Autonomy, Creativity, Family", write about those exact values — never "your values" without naming them.
2. Connect this dimension to the user's other dimensions when relevant (e.g., how the decision style relates to the values or worldview).
3. Write specifically about ${name}'s result — not about what the "${key}" dimension means in general, but what it means for this person given these specific selections.
4. "description": 170–220 words of continuous flowing prose. NO line breaks inside the string. Explain concretely what this specific result means for ${name}, referencing their actual selections and how they relate to each other.
5. Each "strengths" item: one complete sentence of 40–65 words naming at least one specific element from ${name}'s profile and explaining a practical benefit, clarity, or advantage it provides.
6. Each "challenges" item: one complete sentence of 40–65 words naming at least one specific element and explaining a practical tension, blind spot, or productive growth edge.
7. Exactly 3 strengths and 3 challenges. No sentence fragments.
8. Tone: elegant, constructive, non-diagnostic. No therapy language, no diagnosis, no certainty claims.`;
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
