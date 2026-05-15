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

function cleanText(value, fallback) {
  fallback = fallback || '';
  const s = (value === null || value === undefined) ? '' : String(value).trim();
  return s || fallback;
}

function cleanArray(arr, fallback, count) {
  count = count || 3;
  const base    = Array.isArray(arr) ? arr : [];
  const cleaned = base.map(x => cleanText(x)).filter(Boolean);
  const fb      = Array.isArray(fallback) ? fallback.map(x => cleanText(x)).filter(Boolean) : [];
  const merged  = [...cleaned, ...fb].filter(Boolean);
  const out = [];
  const seen = new Set();
  merged.forEach(item => {
    const key = item.toLowerCase();
    if (!seen.has(key) && out.length < count) { seen.add(key); out.push(item); }
  });
  while (out.length < count) {
    out.push([
      'This point should be interpreted as a first-layer Budhi Lite insight.',
      'Use this result as a prompt for reflection rather than as a fixed conclusion.',
      'The full Self-Profile may refine this interpretation later.',
    ][out.length] || '');
  }
  return out.slice(0, count);
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

  return {
    display_name:    profile.display_name || profile.username || 'User',
    language:        profile.language || reportLang(),
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
   RICH FALLBACK SECTIONS
   Per-dimension fallback text for the report
   accordion — uses actual profile data so even
   the no-API-key experience feels personalized.
───────────────────────────────────────────── */

function buildFallbackSection(cardKey, cardResolved, ctx) {
  const name = ctx?.display_name || 'the user';
  const vals = ctx?.selected_values?.length  ? ctx.selected_values.join(', ')  : '';
  const pils = ctx?.selected_pillars?.length ? ctx.selected_pillars.join(', ') : '';
  const dec  = ctx?.decision_style || '';
  const wv   = ctx?.worldview || '';

  const descriptionByKey = {
    values:
      vals
        ? `${name} selected ${vals} as their guiding values. These anchors define the moral and relational standards that filter what is worth protecting, pursuing, and expecting from others. In the Budhi Lite first-layer reading, values describe not just what a person says they care about, but what they implicitly use as a standard when evaluating decisions, relationships, and commitments.`
        : cardResolved.description,
    pillars:
      pils
        ? `${name} is currently drawing the most consistent life support from ${pils}. These pillars describe where attention, energy, and emotional investment are being directed right now. Unlike values — which tend to be more stable — pillars are situational: they reflect the current structure of daily life, and they shift as circumstances, priorities, and relationships evolve.`
        : cardResolved.description,
    decision:
      dec
        ? `${name}'s current decision style is ${dec}. This pattern describes how this person characteristically moves from reflection to action — including the tempo of deliberation, the weight given to information versus intuition, and the degree of risk tolerance that feels natural. Decision style is one of the most visible dimensions in collaborative contexts, shaping how others experience ${name} when choices are being made.`
        : cardResolved.description,
    worldview:
      wv
        ? `${name} currently frames life experience through a ${wv} perspective. Worldview is the interpretive lens through which events acquire meaning, choices feel significant, and relationships are understood. In the Budhi Lite framework, worldview is often the most stable first-layer dimension — it acts as the background against which values are held and decisions are made.`
        : cardResolved.description,
  };

  const strengthsByKey = {
    values: [
      vals
        ? `The values ${vals} give ${name} a reliable internal compass that can anchor judgment and reduce the cognitive load of high-stakes decisions, especially when external guidance is absent.`
        : `The selected values give ${name} a reliable internal compass for high-stakes decisions.`,
      `Having named values creates a concrete shared vocabulary that partners, collaborators, and close relationships can use to understand what ${name} genuinely protects — reducing the risk of unspoken mismatches.`,
      `This values set establishes the moral and relational baseline for the Match Lite comparison, enabling a concrete and specific compatibility reading rather than a generic one.`,
    ],
    pillars: [
      pils
        ? `The pillars ${pils} show exactly where ${name} is making consistent investments of attention and energy, making it easier to identify what must be protected during periods of transition or high demand.`
        : `The selected pillars clearly show where consistent investments of attention are being made.`,
      `Knowing the current pillar structure helps ${name} evaluate new commitments against what is already load-bearing — a practical filter for avoiding overextension.`,
      `Pillar data is one of the most actionable first-layer results: it can be directly compared in Match Lite to reveal whether a partner's current life structure supports, complements, or competes with ${name}'s own.`,
    ],
    decision: [
      dec
        ? `A ${dec} style gives ${name} a recognizable behavioral rhythm that, once understood by those around them, can reduce friction and increase the quality of collaborative decisions.`
        : `This decision style gives ${name} a recognizable rhythm that others can learn to work with.`,
      `Understanding this style allows ${name} to identify contexts where their natural tempo is a clear advantage and situations where a deliberate adjustment — more speed, more deliberation — would produce better outcomes.`,
      `Decision style is one of the most directly actionable dimensions in Match Lite: the pair's style contrast reveals whether coordination is likely to feel natural or whether explicit protocols for shared decision-making would be useful.`,
    ],
    worldview: [
      wv
        ? `A ${wv} worldview gives ${name} a coherent interpretive framework that organizes values, motivations, and relational expectations into a consistent narrative — adding depth to all other first-layer dimensions.`
        : `This worldview gives ${name} a coherent interpretive framework that adds depth to all other dimensions.`,
      `Naming this perspective helps ${name} recognize when they are in genuine dialogue with a different interpretive framework, rather than mistaking worldview differences for personal disagreement or incompatibility.`,
      `In Match Lite, worldview is one of the deepest compatibility layers: pairs who share or genuinely complement each other's worldview tend to find meaning-making and long-term alignment more natural.`,
    ],
  };

  const challengesByKey = {
    values: [
      vals
        ? `Values like ${vals} can function as invisible expectations — standards the person applies to others without having made them explicit, which generates friction when those others operate from different frameworks.`
        : `Named values can function as invisible expectations that generate friction when not made explicit.`,
      `The labels used to describe values — even familiar ones — often carry different personal meanings; what ${name} means by any one of these values may not align precisely with how others interpret the same word.`,
      `The full Self-Profile will reveal how these values interact with character-level patterns, adding nuance that goes beyond what any first-layer reading can capture.`,
    ],
    pillars: [
      pils
        ? `A strong concentration in ${pils} can create areas of under-investment elsewhere that only become visible under stress, during transition, or when a relationship demands engagement in a deprioritized area.`
        : `Strong concentration in current pillars may reveal under-investment in other areas that becomes visible under stress.`,
      `Pillars describe the current configuration of life structure, not a permanent identity — they shift as circumstances, priorities, and relationships evolve, so this reading should be revisited periodically.`,
      `The full Self-Profile will distinguish between pillars that reflect genuine strengths and those that reflect situational adaptations or compensatory habits — a distinction with significant implications for long-term sustainability.`,
    ],
    decision: [
      dec
        ? `A ${dec} style may create visible friction in contexts that require a fundamentally different tempo — particularly when working closely with people whose natural decision rhythm diverges significantly.`
        : `This decision style may create friction in contexts that require a different tempo.`,
      `Decision style shifts under stress, in emotionally charged situations, and in unfamiliar environments — this first-layer result captures the current surface pattern, not the full behavioral range.`,
      `The full Self-Profile will connect this style to character-level patterns, clarifying how deep-seated the preference is and under what conditions it is most likely to express or suppress itself.`,
    ],
    worldview: [
      wv
        ? `A ${wv} perspective may generate systematic blind spots when engaging with situations, people, or arguments that operate from fundamentally different interpretive assumptions.`
        : `This worldview may generate blind spots when engaging with fundamentally different perspectives.`,
      `Worldview labels are broad categories, not precise identities — they should be treated as starting points for self-reflection rather than fixed classifications that exhaustively describe a person.`,
      `The full Self-Profile will connect this worldview to character-level drivers, showing how it shapes not just interpretation but also motivation, relational style, and the situations where ${name} feels most and least at home.`,
    ],
  };

  const defaultStr = [`${cardResolved.title} gives ${name} a clear first-layer reference point.`, `This result supports more intentional self-observation.`, `It establishes a foundation for the Match Lite comparison.`];
  const defaultCha = [`This is a first-layer signal — context can shift how it expresses.`, `The full Self-Profile will add character-level depth.`, `Labels here are starting points, not final classifications.`];

  return {
    key:         cardKey,
    title:       cardResolved.title,
    subtitle:    cardResolved.metric,
    description: descriptionByKey[cardKey] || cardResolved.description || '',
    strengths:   strengthsByKey[cardKey]   || defaultStr,
    challenges:  challengesByKey[cardKey]  || defaultCha,
  };
}

/* ─────────────────────────────────────────────
   FALLBACK REPORTS
   Full structured fallback used when no API
   key is present — data-rich, never generic.
───────────────────────────────────────────── */

function fallbackProfileReport(profile) {
  const displayName = profile?.display_name || profile?.username || 'User';
  const ctx         = extractProfileContext(profile);
  const cards       = profile?.results_app?.cards || [];
  const vals        = ctx?.selected_values?.length  ? ctx.selected_values.join(', ')  : '';
  const pils        = ctx?.selected_pillars?.length ? ctx.selected_pillars.join(', ') : '';
  const dec         = ctx?.decision_style || '';
  const wv          = ctx?.worldview || '';

  const descParts = [
    dec && vals
      ? `${displayName}'s first-layer Budhi Lite profile combines a ${dec} decision style with guiding values of ${vals}.`
      : `${displayName}'s first-layer Budhi Lite profile captures a first map of current behavioral direction.`,
    pils
      ? `The life pillars currently providing the most structural support are ${pils} — areas where energy and attention are being consistently invested right now.`
      : '',
    wv
      ? `A ${wv} worldview frames how ${displayName} interprets meaning, choice, and direction, adding a narrative layer that connects the other three dimensions into a coherent picture.`
      : '',
    `This report presents a first-layer reading designed for reflection and Match Lite comparison. It describes the current configuration — not a fixed character classification — and is most useful as a starting point for self-understanding and conversation, rather than a final answer.`,
  ].filter(Boolean).join(' ');

  const sections = cards.map(c => {
    const cardResolved = (ctx?.cards_resolved || []).find(r => r.key === c.key) || {
      key: c.key, title: rptResolveLabel(c.title), metric: rptResolveLabel(c.metric_value),
      bar: c.bar, description: rptResolveLabel(c.description), tags: [],
    };
    return buildFallbackSection(c.key, cardResolved, ctx);
  });

  return {
    title:    `${displayName} · Budhi Lite Profile Report`,
    subtitle: 'Individual first-layer profile report',
    description: descParts,
    strengths: [
      vals
        ? `The values ${vals} give ${displayName} a stable moral compass that can anchor high-stakes decisions and serve as a shared vocabulary in close relationships.`
        : `The selected values give ${displayName} a stable moral compass for decisions and relationships.`,
      pils
        ? `Active life pillars ${pils} create a visible structure of current priorities, making it easier to protect what matters most and to evaluate new commitments realistically.`
        : `The selected life pillars create a visible structure of current priorities.`,
      dec
        ? `A ${dec} decision style gives ${displayName} a recognizable behavioral rhythm that others can learn to understand — reducing friction and increasing the quality of collaborative decisions.`
        : `The decision style result gives ${displayName} a recognizable behavioral rhythm.`,
    ],
    challenges: [
      vals
        ? `Values like ${vals} can function as implicit expectations that others may not share, creating silent friction when left unspoken in relationships or collaborations.`
        : `Named values can create implicit expectations that require explicit communication with others.`,
      pils
        ? `A strong concentration in ${pils} may indicate areas of under-investment elsewhere that become visible only under stress or transition.`
        : `Current life pillars may indicate areas of under-investment that become visible under stress.`,
      `This first-layer reading captures the current configuration — life events, stress, and context can shift these patterns, and the full Self-Profile will add the character layer that explains why they express as they do.`,
    ],
    cross_analysis: {
      title:       'Integrated reading',
      description: [
        dec && vals
          ? `${displayName}'s ${dec} style, operating through values like ${vals}, describes a person with a recognizable direction and clear standards that filter what feels worth acting on.`
          : 'Decision style and values together describe direction and the standards that filter where energy is applied.',
        pils && wv
          ? `The current pillars (${pils}) and a ${wv} worldview work in tandem to shape both the structure and the meaning layer of ${displayName}'s daily life — not just how they act, but what makes those actions feel significant.`
          : 'Life pillars and worldview together shape both the structure and meaning of daily life.',
        `Reading these four dimensions together is more useful than any single result: a decision style is interpreted differently depending on which values it serves, and values carry different weight depending on the life structure and worldview that frame them.`,
      ].filter(Boolean).join(' '),
      bullets: [
        `Decision style describes the behavioral rhythm; values describe the compass that determines where that rhythm is applied.`,
        `Life pillars show the current structure of investment; worldview provides the narrative that makes that structure feel meaningful and directional.`,
        vals
          ? `Together, these four dimensions describe the first visible layer of ${displayName}'s current configuration — organized around ${vals} and expressed through a ${dec || 'recognizable'} action style.`
          : `Together, these four dimensions describe the first visible layer of the current behavioral and interpretive configuration.`,
      ],
    },
    sections,
  };
}

function fallbackMatchReport(match) {
  const userA   = match?.user_a || (match?.usernames || [])[0] || '';
  const userB   = match?.user_b || (match?.usernames || [])[1] || '';
  const profA   = typeof getProfile === 'function' ? getProfile(userA) : null;
  const profB   = typeof getProfile === 'function' ? getProfile(userB) : null;
  const ctxA    = extractProfileContext(profA);
  const ctxB    = extractProfileContext(profB);
  const app     = match?.results_app || {};
  const nameA   = ctxA?.display_name || (match?.users || [])[0] || userA || 'Person A';
  const nameB   = ctxB?.display_name || (match?.users || [])[1] || userB || 'Person B';
  const pairStr = `${nameA} & ${nameB}`;
  const score   = app.score;

  const valsA = ctxA?.selected_values?.length  ? ctxA.selected_values.join(', ')  : '';
  const valsB = ctxB?.selected_values?.length  ? ctxB.selected_values.join(', ')  : '';
  const pilsA = ctxA?.selected_pillars?.length ? ctxA.selected_pillars.join(', ') : '';
  const pilsB = ctxB?.selected_pillars?.length ? ctxB.selected_pillars.join(', ') : '';
  const decA  = ctxA?.decision_style || '';
  const decB  = ctxB?.decision_style || '';
  const wvA   = ctxA?.worldview || '';
  const wvB   = ctxB?.worldview || '';

  const descParts = [
    score !== undefined
      ? `${pairStr} achieved a first-layer compatibility score of ${score}% in this Budhi Lite Match Lite reading.`
      : `This first-layer Match Lite reading compares the profiles of ${pairStr}.`,
    valsA && valsB
      ? `${nameA} is guided by values of ${valsA}, while ${nameB} is guided by ${valsB} — a comparison that defines much of the moral and relational common ground the pair shares, and where implicit expectation gaps may need to be made explicit.`
      : '',
    decA && decB
      ? `Their decision styles — ${decA} for ${nameA} and ${decB} for ${nameB} — describe the rhythm pairing that shapes how the pair coordinates or creates friction when moving from reflection to action.`
      : '',
    wvA && wvB
      ? `A ${wvA} worldview meeting a ${wvB} perspective is often where the deepest resonance or the most persistent misunderstanding between the pair originates.`
      : '',
    `This report is a first-layer reading designed to start a conversation, not to deliver a final compatibility verdict. First-layer data captures current configurations — both profiles can evolve, and the full Self-Profile from both people would significantly refine this reading.`,
  ].filter(Boolean).join(' ');

  const matchCards = app.cards || [];
  const sections = matchCards.map(c => {
    const cardTitle    = rptResolveLabel(c.title) || c.key;
    const cardSubtitle = rptResolveLabel(c.metric_value) || '';
    const cardDesc     = rptResolveLabel(c.description) || '';

    const specificDesc = {
      values:
        valsA && valsB
          ? `${nameA} selected ${valsA} as guiding values, while ${nameB} selected ${valsB}. The overlap between these sets defines the moral and relational common ground the pair shares; the divergence points to areas where implicit expectations may differ — and where explicit conversation can prevent recurring friction.`
          : cardDesc,
      pillars:
        pilsA && pilsB
          ? `${nameA} is currently drawing life support from ${pilsA}, while ${nameB} relies on ${pilsB}. These pillar structures reveal whether the pair's current life investments run in parallel, complement each other, or pull in different directions — a meaningful signal for understanding availability, energy management, and mutual support.`
          : cardDesc,
      decision:
        decA && decB
          ? `${nameA}'s ${decA} decision style meets ${nameB}'s ${decB} style — a rhythm pairing that is often the most visible source of day-to-day coordination ease or friction. When the styles are understood by both people, the pair can design how they approach shared decisions intentionally, rather than letting style differences feel like character incompatibilities.`
          : cardDesc,
      worldview:
        wvA && wvB
          ? `${nameA} holds a ${wvA} worldview while ${nameB} operates from a ${wvB} perspective. Worldview shapes how each person assigns meaning to the same event, which makes this dimension one of the deepest sources of both resonance and misunderstanding. A shared or genuinely complementary worldview pairing tends to produce a sense that the pair "speaks the same language" even when they disagree on specifics.`
          : cardDesc,
    };

    return {
      key:         c.key,
      title:       cardTitle,
      subtitle:    cardSubtitle,
      description: specificDesc[c.key] || cardDesc,
      strengths: [
        `This dimension gives ${pairStr} a concrete and named reference point for conversation about how they compare.`,
        `Understanding the specific overlap and divergence here allows both people to engage differences directly rather than feeling them as vague incompatibility.`,
        `Named elements in this dimension can become an explicit shared vocabulary the pair develops over time.`,
      ],
      challenges: [
        `Divergences in this dimension may generate implicit friction if treated as shared without confirmation from both people.`,
        `First-layer data captures the current configuration — both profiles can evolve, and this comparison should be revisited as circumstances change.`,
        `A complete Self-Profile from both ${nameA} and ${nameB} would significantly refine and deepen this dimension's reading.`,
      ],
    };
  });

  const appStrengths = (app.strengths || [])
    .map(s => cleanText(rptResolveLabel(s.description) || rptResolveLabel(s.title)))
    .filter(Boolean);
  const appTensions = (app.tensions || [])
    .map(t => cleanText(rptResolveLabel(t.description) || rptResolveLabel(t.title)))
    .filter(Boolean);

  return {
    title:       `${pairStr} · Match Lite Report`,
    subtitle:    'Compatibility first-layer report',
    description: descParts,
    strengths: cleanArray(appStrengths, [
      valsA && valsB
        ? `${pairStr} share ${nameA}'s value of ${ctxA?.selected_values?.[0] || 'alignment'} and ${nameB}'s value of ${ctxB?.selected_values?.[0] || 'connection'}, creating at least one layer of implicit common ground.`
        : `The pair share at least some first-layer alignment that can serve as a starting point for deeper conversation.`,
      `Named similarities in values or pillars give the pair a concrete shared vocabulary they can use to coordinate explicitly rather than by assumption.`,
      `Understanding both profiles simultaneously creates a more intentional relational dynamic — each person can calibrate expectations based on what the other actually selected, not on projection.`,
    ], 3),
    challenges: cleanArray(appTensions, [
      valsA && valsB
        ? `Diverging values between ${nameA} (${valsA}) and ${nameB} (${valsB}) may generate implicit expectation gaps that need to be surfaced and discussed explicitly.`
        : `Value divergences between the pair may generate implicit expectation gaps that need to be surfaced.`,
      decA && decB && decA !== decB
        ? `The ${decA} and ${decB} decision rhythm pairing requires both people to develop an intentional shared protocol for collaborative choices, especially under time pressure.`
        : `Decision rhythm differences require the pair to develop intentional protocols for collaborative choices.`,
      `First-layer data captures today's configuration — both profiles can evolve, and the full Self-Profile from both people would significantly refine this match reading.`,
    ], 3),
    cross_analysis: {
      title:       'Integrated compatibility reading',
      description: [
        decA && decB
          ? `The decision rhythm pairing (${decA} × ${decB}) tends to be the most immediately visible layer of coordination or friction — it shapes how the pair experiences shared action and initiative in real time.`
          : 'Decision rhythm is often the most immediately visible layer of coordination or friction.',
        wvA && wvB
          ? `The worldview pairing (${wvA} × ${wvB}) is typically the deepest layer — it shapes not just specific disagreements but the meaning each person assigns to the same events and choices.`
          : 'Worldview alignment shapes the meaning each person assigns to the same events and choices.',
        valsA && valsB
          ? `Reading the values and pillar comparison together with the decision and worldview pairing gives a more complete picture: compatibility is not determined by any single result, but by the pattern formed when all four dimensions are read in relation to each other for ${nameA} and ${nameB}.`
          : `Reading all four dimensions together is more useful than any single result — compatibility is a pattern, not a score.`,
      ].filter(Boolean).join(' '),
      bullets: [
        `Decision style pairing describes how the pair synchronizes — or negotiates — real-time action and initiative.`,
        valsA && valsB
          ? `Value and pillar overlap defines the moral and structural common ground: where ${nameA}'s ${ctxA?.selected_values?.[0] || 'values'} and ${nameB}'s ${ctxB?.selected_values?.[0] || 'values'} converge is where the pair most naturally agrees on what matters.`
          : `Value and pillar overlap defines the moral and structural common ground between the pair.`,
        `Worldview alignment is the deepest compatibility layer — it determines whether the pair is likely to find each other's reasoning legible even in the moments where they strongly disagree.`,
      ],
    },
    sections,
  };
}

/* ─────────────────────────────────────────────
   NORMALIZE AI RESPONSE
   Merges AI output with the rich fallback,
   ensuring every field is filled.
───────────────────────────────────────────── */

function normalizeReport(raw, fallback) {
  const data          = raw && typeof raw === 'object' ? raw : {};
  const fallbackCross = fallback.cross_analysis || {};
  const sectionsRaw   = Array.isArray(data.result_sections) ? data.result_sections
    : (Array.isArray(data.sections) ? data.sections : []);
  const fallbackSects = Array.isArray(fallback.sections) ? fallback.sections : [];

  const sections = fallbackSects.map((fb, index) => {
    const candidate = sectionsRaw[index]
      || sectionsRaw.find(s => s && (
        s.key === fb.key ||
        String(s.title || '').toLowerCase() === String(fb.title || '').toLowerCase()
      ))
      || {};
    return {
      key:         cleanText(candidate.key,         fb.key         || `section_${index + 1}`),
      title:       cleanText(candidate.title,       fb.title       || `Result ${index + 1}`),
      subtitle:    cleanText(candidate.subtitle,    fb.subtitle    || ''),
      description: cleanText(candidate.description, fb.description || ''),
      strengths:   cleanArray(candidate.strengths,  fb.strengths,  3),
      challenges:  cleanArray(candidate.challenges, fb.challenges, 3),
    };
  });

  return {
    title:       cleanText(data.title,       fallback.title    || 'Budhi Lite Report'),
    subtitle:    cleanText(data.subtitle,    fallback.subtitle || ''),
    description: cleanText(data.description, fallback.description || ''),
    strengths:   cleanArray(data.strengths,  fallback.strengths, 3),
    challenges:  cleanArray(data.challenges, fallback.challenges, 3),
    cross_analysis: {
      title:       cleanText(
        data.cross_analysis?.title || data.integrated_analysis?.title,
        fallbackCross.title || 'Integrated Analysis'
      ),
      description: cleanText(
        data.cross_analysis?.description || data.integrated_analysis?.description,
        fallbackCross.description || ''
      ),
      bullets: cleanArray(
        data.cross_analysis?.bullets || data.integrated_analysis?.bullets,
        fallbackCross.bullets, 3
      ),
    },
    sections,
    generated_at: new Date().toISOString(),
  };
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
    return { ...fallback, _source: 'fallback', _note: t('fallbackUsed'), generated_at: new Date().toISOString() };
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
    const nameA   = ctxA?.display_name || (match?.users || [])[0] || userA || 'Person A';
    const nameB   = ctxB?.display_name || (match?.users || [])[1] || userB || 'Person B';
    const pairStr = `${nameA} & ${nameB}`;

    payload = {
      scope,
      language,
      pair:                pairStr,
      compatibility_score: app.score,
      match_type:          rptResolveLabel(app.match_type?.label),
      gold_tip:            rptResolveLabel(app.gold_tip),
      person_a: {
        name:            nameA,
        selected_values: ctxA?.selected_values,
        selected_pillars:ctxA?.selected_pillars,
        decision_style:  ctxA?.decision_style,
        worldview:       ctxA?.worldview,
      },
      person_b: {
        name:            nameB,
        selected_values: ctxB?.selected_values,
        selected_pillars:ctxB?.selected_pillars,
        decision_style:  ctxB?.decision_style,
        worldview:       ctxB?.worldview,
      },
      dimension_cards: (app.cards || []).map(c => ({
        key:         c.key,
        title:       rptResolveLabel(c.title),
        metric:      rptResolveLabel(c.metric_value),
        score:       c.bar,
        description: rptResolveLabel(c.description),
        tags:        (c.tags || []).map(rptResolveLabel).filter(Boolean),
      })),
      match_dynamics:  (app.dynamics  || []).map(d => `${rptResolveLabel(d.title)}: ${rptResolveLabel(d.description)}`).filter(Boolean),
      match_strengths: (app.strengths || []).map(s => `${rptResolveLabel(s.title)}: ${rptResolveLabel(s.description)}`).filter(Boolean),
      match_tensions:  (app.tensions  || []).map(t => `${rptResolveLabel(t.title)}: ${rptResolveLabel(t.description)}`).filter(Boolean),
      match_gaps:      (app.gaps      || []).map(g => `${rptResolveLabel(g.gap || g.title)}: ${rptResolveLabel(g.description)}`).filter(Boolean),
    };

    system = `You are Budhi Lite's full match report writer. Return ONLY valid JSON following the schema below exactly.
Language: ${language}. Write ALL text content in that language.
You are writing a full compatibility report for ${pairStr}.

━━━ MANDATORY RULES — APPLY TO EVERY SINGLE FIELD ━━━
1. ALWAYS reference specific values, pillars, decision styles, and worldviews by their exact names from the payload. NEVER write "their values" or "their differences" without naming what they actually are.
2. For each dimension section: explicitly compare both people. Name what they share in that dimension, name what differs, and explain the practical implication for the pair's dynamic.
3. "description" (top-level): 200–270 words of continuous flowing prose. NO line breaks inside the string. Cover: overall compatibility picture, key alignment points with specific names, main friction or growth sources with specific names, and what the pair can practically do with this information.
4. "sections[].description": 130–170 words of continuous flowing prose per section. NO line breaks. Compare both people in that specific dimension using their actual selected items.
5. All strength and challenge items (top-level and per-section): complete sentences, 40–70 words, naming specific profile elements from both people.
6. All cross_analysis bullets: complete sentences, 40–65 words, connecting multiple dimensions.
7. Tone: constructive, practical, non-diagnostic. No therapy language, no certainty claims, nothing that sounds like a final verdict.
8. Exactly 3 top-level strengths, 3 challenges, 3 cross_analysis bullets, 4 result_sections (one per dimension: decision, values, pillars, worldview), each with 3 strengths and 3 challenges.

Required JSON schema:
{
  "title": "string",
  "subtitle": "string",
  "description": "string — 200–270 words, flowing prose, no line breaks",
  "strengths": ["string 40–70w", "string 40–70w", "string 40–70w"],
  "challenges": ["string 40–70w", "string 40–70w", "string 40–70w"],
  "cross_analysis": {
    "title": "string",
    "description": "string — 120–160 words, flowing prose",
    "bullets": ["string 40–65w", "string 40–65w", "string 40–65w"]
  },
  "result_sections": [
    {
      "key": "decision|values|pillars|worldview",
      "title": "string",
      "subtitle": "string",
      "description": "string — 130–170 words, flowing prose, comparing both people",
      "strengths": ["string 40–70w", "string 40–70w", "string 40–70w"],
      "challenges": ["string 40–70w", "string 40–70w", "string 40–70w"]
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
You are writing a full personalized report for ${name}.

━━━ MANDATORY RULES — APPLY TO EVERY SINGLE FIELD ━━━
1. ALWAYS reference specific values, pillars, decision style, and worldview by their exact names from the payload. NEVER write "their values" or "your selection" without naming what they actually are.
2. Write specifically about ${name}'s result — not about what a dimension means in general, but what it means for this person given their specific selections.
3. Connect dimensions to each other when relevant: explain how the decision style serves the values, how the worldview frames the life pillars, etc.
4. "description" (top-level): 200–270 words of continuous flowing prose. NO line breaks inside the string. Describe all four dimensions and how they form a coherent first-layer picture for ${name}.
5. "sections[].description": 130–170 words of continuous flowing prose per section. NO line breaks. Write specifically about ${name}'s result in that dimension, referencing their actual selections.
6. All strength and challenge items (top-level and per-section): complete sentences, 40–70 words, referencing at least one specific element from ${name}'s profile.
7. All cross_analysis bullets: complete sentences, 40–65 words, connecting multiple dimensions.
8. Tone: elegant, constructive, non-diagnostic. No therapy language, no diagnosis, no certainty claims.
9. Exactly 3 top-level strengths, 3 challenges, 3 cross_analysis bullets, 4 result_sections (one per dimension: decision, values, pillars, worldview), each with 3 strengths and 3 challenges.

Required JSON schema:
{
  "title": "string",
  "subtitle": "string",
  "description": "string — 200–270 words, flowing prose, no line breaks",
  "strengths": ["string 40–70w", "string 40–70w", "string 40–70w"],
  "challenges": ["string 40–70w", "string 40–70w", "string 40–70w"],
  "cross_analysis": {
    "title": "string",
    "description": "string — 120–160 words, flowing prose",
    "bullets": ["string 40–65w", "string 40–65w", "string 40–65w"]
  },
  "result_sections": [
    {
      "key": "decision|values|pillars|worldview",
      "title": "string",
      "subtitle": "string",
      "description": "string — 130–170 words, flowing prose, specific to ${name}",
      "strengths": ["string 40–70w", "string 40–70w", "string 40–70w"],
      "challenges": ["string 40–70w", "string 40–70w", "string 40–70w"]
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
          { role: 'user',   content: JSON.stringify({ payload, fallback_structure: fallback }) },
        ],
        temperature:     0.62,
        response_format: { type: 'json_object' },
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data?.error?.message || 'OpenAI request failed');
    const raw    = data?.choices?.[0]?.message?.content || '{}';
    const parsed = JSON.parse(raw);
    return { ...normalizeReport(parsed, fallback), _source: 'ai', _note: t('aiGenerated') };

  } catch(err) {
    return {
      ...fallback,
      _source: 'fallback_error',
      _note:   `${t('aiFailed')} ${err.message || ''}`.trim(),
      generated_at: new Date().toISOString(),
    };
  }
}
