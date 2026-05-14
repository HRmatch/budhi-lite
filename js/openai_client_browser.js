function ensureDetailText(value, fallback) {
  const s = (value === null || value === undefined) ? "" : String(value).trim();
  return s || fallback || "";
}

function ensureDetailArray3(value, fallback) {
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
    out.push("Use this insight as a starting point for reflection and future comparison.");
  }

  return out.slice(0, 3);
}

function normalizeAIDetails(parsed, fallback, source, note) {
  return {
    title: ensureDetailText(parsed?.title, fallback.title || "AI Details"),
    description: ensureDetailText(parsed?.description, fallback.description || "This card summarizes a first-layer Budhi Lite insight."),
    strengths: ensureDetailArray3(parsed?.strengths, fallback.strengths),
    challenges: ensureDetailArray3(parsed?.challenges, fallback.challenges),
    _source: source,
    _note: note
  };
}

async function generateAIDetails({scope, key, profile, match}){
  const apiKey=getAPIKey();
  const fallback = scope==='match' ? fallbackDetailsMatch(key, match) : fallbackDetailsProfile(key, profile);
  if(!apiKey){
    return normalizeAIDetails(fallback, fallback, 'fallback', t('fallbackUsed'));
  }

  const language=getLang();
  const model=getOpenAIModel();
  const payload = scope==='match'
    ? {scope, key, language, match_summary:match?.results_app, users:match?.users}
    : {scope, key, language, profile_summary:profile?.results_app, username:profile?.display_name};

  const system = `You are Budhi Lite's AI insight agent. Return only valid JSON with keys: title, description, strengths, challenges. Description must be one substantial paragraph. strengths and challenges must be arrays with exactly 3 non-empty bullet strings each. Use the requested language code: ${language}. Keep the tone elegant, constructive, non-diagnostic, and aligned with a first-layer teaser report. Do not mention therapy, diagnosis, or certainty. Do not leave any field empty.`;

  try{
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':`Bearer ${apiKey}`},
      body:JSON.stringify({model, messages:[{role:'system', content:system},{role:'user', content:JSON.stringify(payload)}], temperature:.55, response_format:{type:'json_object'}})
    });

    const data = await res.json();
    if(!res.ok){throw new Error(data?.error?.message || 'OpenAI request failed')}

    const raw = data?.choices?.[0]?.message?.content || '{}';
    const parsed = JSON.parse(raw);
    return normalizeAIDetails(parsed, fallback, 'ai', t('aiGenerated'));
  }catch(err){
    return normalizeAIDetails(
      fallback,
      fallback,
      'fallback_error',
      `${t('aiFailed')} ${err.message || ''}`.trim()
    );
  }
}
