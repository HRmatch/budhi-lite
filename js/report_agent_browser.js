// Budhi Lite personalized report agent.
// Browser-side agent for GitHub Pages V1. It uses the user's own OpenAI API key from sessionStorage.
// The agent always returns a complete structure, falling back to deterministic content if AI is unavailable
// or if any generated field is missing.

function ensureText(value, fallback) {
  const s = (value === null || value === undefined) ? "" : String(value).trim();
  return s || fallback || "";
}

function ensureArray3(value, fallback) {
  const base = Array.isArray(value) ? value : [];
  const cleaned = base
    .map(x => (x === null || x === undefined ? "" : String(x).trim()))
    .filter(Boolean);

  const fallbackClean = (Array.isArray(fallback) ? fallback : [])
    .map(x => (x === null || x === undefined ? "" : String(x).trim()))
    .filter(Boolean);

  const out = [...cleaned];
  for (const item of fallbackClean) {
    if (out.length >= 3) break;
    if (!out.includes(item)) out.push(item);
  }

  while (out.length < 3) {
    out.push("Use this first-layer reading as a starting point for reflection and future comparison.");
  }

  return out.slice(0, 3);
}

function ensureSections(value, fallbackSections) {
  const fallback = Array.isArray(fallbackSections) ? fallbackSections : [];
  const source = Array.isArray(value) ? value : [];

  const normalized = source.map((section, idx) => {
    const fb = fallback[idx] || fallback[0] || {};
    return {
      title: ensureText(section?.title, fb.title || "Report section"),
      body: ensureText(section?.body, fb.body || "This section summarizes one relevant part of the Budhi Lite reading."),
      bullets: ensureArray3(section?.bullets, fb.bullets || [])
    };
  });

  for (let i = normalized.length; i < fallback.length; i++) {
    normalized.push({
      title: ensureText(fallback[i].title, "Report section"),
      body: ensureText(fallback[i].body, "This section summarizes one relevant part of the Budhi Lite reading."),
      bullets: ensureArray3(fallback[i].bullets, [])
    });
  }

  return normalized.slice(0, 4);
}

function profileCardByKey(profile, key) {
  return (profile?.results_app?.cards || []).find(c => c.key === key) || {};
}

function matchCardByKey(match, key) {
  return (match?.results_app?.cards || []).find(c => c.key === key) || {};
}

function fallbackProfileReport(profile) {
  const title = ml(profile?.results_app?.title) || "Budhi Lite Profile Report";
  const overview = ml(profile?.results_app?.overview) || "This report summarizes the first layer of the Budhi Lite Self-Profile.";
  const decision = profileCardByKey(profile, "decision");
  const values = profileCardByKey(profile, "values");
  const pillars = profileCardByKey(profile, "pillars");
  const worldview = profileCardByKey(profile, "worldview");

  return {
    title,
    intro: overview,
    sections: [
      {
        title: ml(decision.title) || "Decision Style",
        body: ml(decision.description) || "This section describes the user's first-layer decision rhythm.",
        bullets: [
          `Main signal: ${ml(decision.metric_value) || "first-layer decision pattern"}.`,
          "This dimension helps clarify how the user moves between reflection and action.",
          "The interpretation should be read as a snapshot, not as a final character classification."
        ]
      },
      {
        title: ml(values.title) || "Values",
        body: ml(values.description) || "This section summarizes the values selected in the snapshot.",
        bullets: [
          "Values indicate what the user may protect, admire or expect in relationships.",
          "They provide a first anchor for trust, judgment and personal meaning.",
          "The full Self-Profile can later refine how these values appear in behavior."
        ]
      },
      {
        title: ml(pillars.title) || "Life Pillars",
        body: ml(pillars.description) || "This section describes the life pillars currently supporting the user.",
        bullets: [
          "Life pillars indicate current sources of attention, energy and stability.",
          "They help distinguish current life moment from deeper character structure.",
          "These priorities may change as context changes."
        ]
      },
      {
        title: ml(worldview.title) || "Worldview",
        body: ml(worldview.description) || "This section describes the user's current worldview lens.",
        bullets: [
          "Worldview adds meaning to how choices and experiences are interpreted.",
          "It can influence how the user frames goals, relationships and challenges.",
          "This first-layer signal becomes stronger when combined with later phases."
        ]
      }
    ],
    strengths: [
      "The report creates a clear first-layer snapshot from a short form.",
      "The four dimensions can later be compared in Match Lite.",
      "The structure prepares the user for deeper character-level insights."
    ],
    challenges: [
      "The reading is intentionally limited to Phase 1 information.",
      "It should not be interpreted as a complete personality or character classification.",
      "Context, timing and future answers may change the deeper interpretation."
    ],
    recommendations: [
      "Use the report to identify what feels accurate and what needs deeper exploration.",
      "Complete the full Self-Profile in the future to unlock character-level insights.",
      "Compare this profile with another completed profile to explore Match Lite."
    ],
    closing: "Budhi Lite should be read as a teaser: it reveals a useful first layer, while leaving deeper interpretation for the complete Budhi experience.",
    _source: "fallback",
    _note: t("fallbackUsed")
  };
}

function fallbackMatchReport(match) {
  const app = match?.results_app || {};
  const score = app.score ?? "—";
  const overview = ml(app.overview) || "This report summarizes the first layer of compatibility in Match Lite.";
  const typeLabel = ml(app.match_type?.label) || "Match Lite";
  const decision = matchCardByKey(match, "decision");
  const values = matchCardByKey(match, "values");
  const pillars = matchCardByKey(match, "pillars");
  const worldview = matchCardByKey(match, "worldview");

  return {
    title: `${t("match")} · ${typeLabel}`,
    intro: overview,
    sections: [
      {
        title: t("compatibilityScore"),
        body: `The pair has a ${score}% compatibility score in this first-layer Match Lite report. This number combines decision rhythm, values, life pillars and worldview into a single teaser score.`,
        bullets: [
          `Match type: ${typeLabel}.`,
          "The score should guide conversation, not replace it.",
          "The complete Budhi experience can later add deeper character-level compatibility."
        ]
      },
      {
        title: ml(decision.title) || "Decision Style",
        body: ml(decision.description) || "This section describes how the pair compares in decision rhythm.",
        bullets: [
          `Alignment signal: ${ml(decision.metric_value) || "first-layer alignment"}.`,
          "Decision rhythm can influence timing, initiative and perceived pressure.",
          "A shared language around timing can reduce friction."
        ]
      },
      {
        title: ml(values.title) || "Values",
        body: ml(values.description) || "This section describes how the pair compares in selected values.",
        bullets: [
          "Shared or convergent values can support trust.",
          "Divergent values are better treated as conversation points than failures.",
          "Values help explain what each person may protect or expect."
        ]
      },
      {
        title: ml(worldview.title) || "Worldview",
        body: ml(worldview.description) || "This section describes how the pair compares in worldview.",
        bullets: [
          "Worldview shapes how each person interprets situations.",
          "Complementarity can expand perspective when both lenses are respected.",
          "Divergence may require more explicit communication."
        ]
      }
    ],
    strengths: ensureArray3((app.strengths || []).map(x => ml(x.title) || ml(x.description)), [
      "The match creates a clear first-layer compatibility snapshot.",
      "The pair can use shared dimensions as anchors for conversation.",
      "The report highlights both alignment and possible growth areas."
    ]),
    challenges: ensureArray3((app.tensions || []).map(x => ml(x.title) || ml(x.description)), [
      "The reading is limited to Phase 1 information.",
      "Some deeper compatibility patterns may only appear after the full profile.",
      "The pair should avoid treating the score as a final judgment."
    ]),
    recommendations: ensureArray3([ml(app.gold_tip)], [
      "Use the Match Lite as a conversation starter.",
      "Discuss timing, values and current priorities before drawing conclusions.",
      "Complete the full Budhi profiles to refine compatibility."
    ]),
    closing: "Match Lite is designed to open the conversation, not close it. The strongest use of this report is to identify where the pair can align, where friction may arise and what deserves deeper exploration.",
    _source: "fallback",
    _note: t("fallbackUsed")
  };
}

function normalizePersonalizedReport(parsed, fallback) {
  return {
    title: ensureText(parsed?.title, fallback.title),
    intro: ensureText(parsed?.intro, fallback.intro),
    sections: ensureSections(parsed?.sections, fallback.sections),
    strengths: ensureArray3(parsed?.strengths, fallback.strengths),
    challenges: ensureArray3(parsed?.challenges, fallback.challenges),
    recommendations: ensureArray3(parsed?.recommendations, fallback.recommendations),
    closing: ensureText(parsed?.closing, fallback.closing),
    _source: parsed?._source || "ai",
    _note: parsed?._note || t("aiGenerated")
  };
}

async function generatePersonalizedReport({scope, profile, match}) {
  const fallback = scope === "match" ? fallbackMatchReport(match) : fallbackProfileReport(profile);
  const apiKey = getAPIKey();

  if (!apiKey) {
    return fallback;
  }

  const language = getLang();
  const model = getOpenAIModel();
  const payload = scope === "match"
    ? { scope, language, match_summary: match?.results_app, users: match?.users, usernames: match?.usernames }
    : { scope, language, profile_summary: profile?.results_app, answers: profile?.answers, username: profile?.display_name };

  const system = `You are Budhi Lite's personalized report agent. Return only valid JSON with keys: title, intro, sections, strengths, challenges, recommendations, closing. sections must be an array with 4 objects; each object must have title, body, and bullets. Every bullets array must contain exactly 3 non-empty strings. strengths, challenges, and recommendations must each contain exactly 3 non-empty strings. Use the requested language code: ${language}. Keep the tone elegant, constructive, non-diagnostic, non-clinical, and aligned with a first-layer teaser report. Do not mention therapy, diagnosis, certainty, or medical/psychological assessment. Do not leave any field empty.`;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {"Content-Type":"application/json", "Authorization":`Bearer ${apiKey}`},
      body: JSON.stringify({
        model,
        messages: [
          {role:"system", content:system},
          {role:"user", content:JSON.stringify(payload)}
        ],
        temperature: 0.55,
        response_format: {type:"json_object"}
      })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data?.error?.message || "OpenAI request failed");

    const raw = data?.choices?.[0]?.message?.content || "{}";
    const parsed = JSON.parse(raw);
    return normalizePersonalizedReport({...parsed, _source:"ai", _note:t("aiGenerated")}, fallback);
  } catch (err) {
    return normalizePersonalizedReport({
      ...fallback,
      _source: "fallback_error",
      _note: `${t("aiFailed")} ${err.message || ""}`.trim()
    }, fallback);
  }
}
