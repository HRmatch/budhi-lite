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

  const ctxValsArr = ctx?.selected_values  || [];
  const ctxPilsArr = ctx?.selected_pillars || [];
  const strengthsByKey = {
    values: [
      vals ? `Value clusters like ${ctxValsArr.slice(0,2).join(' and ') || vals} create a concrete moral filter that reduces noise in high-stakes decisions.` : `Named values create a concrete moral filter that reduces noise in high-stakes decisions.`,
      `A visible value set gives partners and collaborators a reliable map of what ${name} genuinely protects.`,
      `Named values enable a concrete Match Lite comparison rather than a generic compatibility reading.`,
    ],
    pillars: [
      pils ? `Current pillars show where ${name} directs consistent energy — a practical map for protecting what is load-bearing.` : `Current pillars show where consistent energy is being directed.`,
      `Knowing the pillar structure helps ${name} evaluate new commitments against what is already under load.`,
      `Pillar data generates a direct structural comparison in Match Lite — aligned pillars signal compatible life demands.`,
    ],
    decision: [
      dec ? `A ${dec} style creates a recognizable rhythm that others can learn to coordinate with rather than work against.` : `This decision style creates a recognizable rhythm that others can coordinate with.`,
      `Understanding this pattern helps identify contexts where the natural tempo is an asset and where adjustment adds value.`,
      `Decision style is one of the most actionable Match Lite dimensions — rhythm pairing shapes day-to-day coordination.`,
    ],
    worldview: [
      wv ? `A ${wv} perspective adds interpretive coherence that makes values and decisions read as a consistent profile.` : `This worldview adds interpretive coherence across values and decisions.`,
      `Naming this perspective helps recognize when a different worldview is in dialogue rather than in opposition.`,
      `Worldview alignment is one of the deepest compatibility levers — shared perspectives support lasting relational resonance.`,
    ],
  };

  const challengesByKey = {
    values: [
      `Value labels carry personal meanings — what ${name} intends by any one of them may differ from how others interpret the same word.`,
      `Values function as implicit expectations; friction arises when those standards are not made explicit with others.`,
      `The full Self-Profile will reveal how these values interact with character patterns not visible in this first layer.`,
    ],
    pillars: [
      pils ? `Concentration in ${ctxPilsArr[0] || 'current pillars'} may mask under-investment elsewhere — gaps that surface under stress or transition.` : `Strong pillar concentration may mask under-investment in other areas.`,
      `Pillars describe today's structure — they shift as relationships and circumstances evolve, requiring periodic recalibration.`,
      `The full Self-Profile will distinguish genuine strengths from situational or compensatory patterns.`,
    ],
    decision: [
      dec ? `A ${dec} style can create friction with people whose natural tempo differs — especially under time pressure.` : `This decision style can create friction with people whose natural tempo differs.`,
      `Decision patterns shift under stress and in emotionally charged situations — this result captures the current surface layer.`,
      `The full Self-Profile will clarify whether this style is a stable trait or a situational adaptation.`,
    ],
    worldview: [
      wv ? `A ${wv} perspective may generate blind spots when engaging with fundamentally different interpretive frameworks.` : `This worldview may generate blind spots with fundamentally different perspectives.`,
      `Worldview labels are broad anchors — useful starting points, not precise identities.`,
      `The full Self-Profile will reveal how this perspective connects to deeper motivational and relational patterns.`,
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
  const ctxValsArr  = ctx?.selected_values  || [];
  const vals        = ctxValsArr.length ? ctxValsArr.join(', ') : '';
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
      vals ? `Named values like ${ctxValsArr[0] || vals} create a moral filter that reduces noise in high-stakes decisions.` : `Named values create a concrete moral filter for high-stakes decisions.`,
      pils ? `Active pillars make it easy to see where ${displayName} is investing consistently — a map for protecting load-bearing areas.` : `Active life pillars make consistent investments visible and easier to protect.`,
      dec  ? `A ${dec} style creates a recognizable rhythm that others can coordinate with.` : `The decision style result creates a recognizable behavioral rhythm.`,
    ],
    challenges: [
      vals ? `Values function as implicit expectations — friction arises when others don't share the same standards without being told.` : `Named values can create implicit expectations that require explicit communication.`,
      pils ? `Concentration in current pillars may reveal under-investment elsewhere — gaps that surface under stress.` : `Current pillar concentration may reveal under-investment that becomes visible under stress.`,
      `This first-layer reading captures the current configuration — the full Self-Profile will add the character layer that explains why these patterns express as they do.`,
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
      `Named value overlap gives the pair a concrete vocabulary to use explicitly rather than assuming alignment.`,
      `Knowing where pillars align makes it easier for each person to support the other's most consistent investments.`,
      `Understanding both profiles simultaneously lets the pair calibrate expectations based on actual data, not projection.`,
    ], 3),
    challenges: cleanArray(appTensions, [
      valsA && valsB ? `Values exclusive to one list are implicit expectations the other person may not share — a friction zone if left unnamed.` : `Diverging values create implicit expectations that may generate friction if not surfaced.`,
      decA && decB && decA !== decB ? `A ${decA} and ${decB} rhythm pairing requires an explicit shared protocol — especially under time pressure.` : `Divergent decision rhythms require an explicit shared protocol for collaborative choices.`,
      `First-layer data captures today's configuration — both profiles can evolve, and full Self-Profile data would refine this reading.`,
    ], 3),
    cross_analysis: {
      title:       'Integrated compatibility reading',
      description: [
        decA && decB ? `The ${decA} × ${decB} decision pairing is typically where the most visible day-to-day coordination or friction originates — it shapes how the pair experiences joint action in real time.` : 'Decision rhythm pairing is where the most visible day-to-day coordination or friction originates.',
        wvA && wvB   ? `The ${wvA} × ${wvB} worldview combination is the deepest layer: it determines whether the pair finds each other's reasoning legible even in moments of strong disagreement.` : 'Worldview pairing is the deepest layer — it shapes whether each person finds the other´s reasoning legible.',
        `Compatibility is a pattern across all four dimensions, not a score on any one — reading values, pillars, decision style, and worldview together reveals dynamics that no single result shows.`,
      ].filter(Boolean).join(' '),
      bullets: [
        `Decision rhythm describes real-time coordination; worldview describes interpretive compatibility — together they set the floor and ceiling of the relationship's natural ease.`,
        valsA && valsB ? `Value overlap defines common moral ground; pillar alignment shows whether current life structures support or compete with each other.` : `Value overlap defines common moral ground; pillar comparison shows whether life structures align or compete.`,
        `The interaction between all four dimensions reveals whether differences are complementary — and therefore productive — or genuinely divergent and requiring explicit negotiation.`,
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

━━━ ANALYSIS RULES — APPLY TO EVERY SINGLE FIELD ━━━
1. ANALYZE — do not inventory. NEVER open a section with "Person A selected X, Person B selected Y." Identify patterns: what do both people share, what diverges, and what does each pattern create in practice for the pair?
2. For values and pillars: compute shared items (appear in both lists) and exclusive items (appear in only one). Analyze the shared ones as common ground — explain what that alignment enables. Analyze the exclusive ones as friction or complementarity — explain WHY the asymmetry matters, not just THAT it exists.
3. For decision style and worldview: analyze what the PAIRING produces as a dynamic, not what each individual style means in isolation.
4. "description" (top-level): 200–260 words of analytical prose. Cover: the dominant compatibility pattern, key alignment points and their practical implications, the main friction or complementarity sources and their relational meaning.
5. "sections[].description": 120–150 words per section of analytical prose. For each dimension, lead with the pattern the comparison reveals — not with a list of who selected what.
6. All strength and challenge items (top-level and per-section): 25–40 words each. One sharp, specific insight per item. No re-listing of items already analyzed in the description above it.
7. All cross_analysis bullets: 30–45 words each. Connect multiple dimensions — show how the combination of patterns creates a more complex relational picture than any single dimension suggests.
8. Tone: constructive, practical, non-diagnostic. No therapy language, no certainty claims.
9. Exactly 3 top-level strengths, 3 challenges, 3 cross_analysis bullets, 4 result_sections (decision, values, pillars, worldview), each with 3 strengths and 3 challenges.

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
      "description": "string — 120–150 words, analytical prose, pattern-led not inventory-led",
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

━━━ ANALYSIS RULES — APPLY TO EVERY SINGLE FIELD ━━━
1. ANALYZE — do not enumerate. NEVER structure a description as "User selected X, Y, Z." Reveal what the combination of selections creates: a pattern, a tension, a distinctive profile characteristic.
2. Reference specific items only when they serve an analytical point — to anchor an insight, not to create a list. One or two items named per analytical claim is sufficient; listing all of them adds length without depth.
3. Connect dimensions: how does the decision style interact with the values? What does the worldview imply about how life pillars are experienced? What does the combination of values and pillars reveal about where motivation and structure meet? These connections are the analysis.
4. "description" (top-level): 200–260 words of analytical prose covering all four dimensions as a coherent profile — what the combination creates, not what each dimension contains.
5. "sections[].description": 120–150 words per section of analytical prose. Answer: what does this specific dimension create for ${name}, given their other dimensions?
6. All strength and challenge items (top-level and per-section): 25–40 words each. One sharp, specific insight — a practical implication, not a general observation. No re-listing.
7. All cross_analysis bullets: 30–45 words each. Synthesize across dimensions — show what the combination reveals that no single dimension would.
8. Tone: elegant, constructive, non-diagnostic. No therapy language, no certainty claims.
9. Exactly 3 top-level strengths, 3 challenges, 3 cross_analysis bullets, 4 result_sections (decision, values, pillars, worldview), each with 3 strengths and 3 challenges.

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
