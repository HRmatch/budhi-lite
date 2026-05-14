function ensureThreeItems(items, fallbackItems){
  const cleaned = (Array.isArray(items) ? items : []).map(x => String(x || '').trim()).filter(Boolean);
  const fallback = (Array.isArray(fallbackItems) ? fallbackItems : []).map(x => String(x || '').trim()).filter(Boolean);
  const merged = [...cleaned, ...fallback];
  const out = [];
  const seen = new Set();
  merged.forEach(item => {
    const key = item.toLowerCase();
    if(item && !seen.has(key) && out.length < 3){
      seen.add(key);
      out.push(item);
    }
  });
  while(out.length < 3){
    out.push([
      'This first-layer result supports reflection.',
      'Use this insight as a conversation starter.',
      'The full Self-Profile may refine this reading.'
    ][out.length]);
  }
  return out.slice(0,3);
}

function normalizeAIDetails(parsed, fallback){
  return {
    title: String(parsed?.title || fallback?.title || 'AI Details').trim(),
    description: String(parsed?.description || fallback?.description || 'This first-layer Budhi Lite insight summarizes the selected result in a practical and non-diagnostic way.').trim(),
    strengths: ensureThreeItems(parsed?.strengths, fallback?.strengths),
    challenges: ensureThreeItems(parsed?.challenges, fallback?.challenges)
  };
}

async function generateAIDetails({scope, key, profile, match}){
  const apiKey=getAPIKey();
  const fallback = scope==='match' ? fallbackDetailsMatch(key, match) : fallbackDetailsProfile(key, profile);
  if(!apiKey){ return {...normalizeAIDetails(fallback, fallback), _source:'fallback', _note:t('fallbackUsed')}; }
  const language=getLang();
  const model=getOpenAIModel();
  const payload = scope==='match' ? {scope, key, language, match_summary:match.results_app, users:match.users} : {scope, key, language, profile_summary:profile.results_app, username:profile.display_name};
  const system = `You are Budhi Lite's AI insight agent. Return only valid JSON with keys: title, description, strengths, challenges. Description must be one substantial paragraph. strengths and challenges must be arrays with exactly 3 short bullet strings each. Use the requested language code: ${language}. Keep the tone elegant, constructive, non-diagnostic, and aligned with a first-layer teaser report. Do not mention therapy, diagnosis, or certainty. Never leave any field empty.`;
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
    return {...normalizeAIDetails(parsed, fallback), _source:'ai', _note:t('aiGenerated')};
  }catch(err){
    return {...normalizeAIDetails(fallback, fallback), _source:'fallback_error', _note:`${t('aiFailed')} ${err.message || ''}`.trim()};
  }
}
