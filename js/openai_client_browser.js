async function generateAIDetails({scope, key, profile, match}){
  const apiKey=getAPIKey();
  const fallback = scope==='match' ? fallbackDetailsMatch(key, match) : fallbackDetailsProfile(key, profile);
  if(!apiKey){ return {...fallback, _source:'fallback', _note:t('fallbackUsed')}; }
  const language=getLang();
  const model=getOpenAIModel();
  const payload = scope==='match' ? {scope, key, language, match_summary:match.results_app, users:match.users} : {scope, key, language, profile_summary:profile.results_app, username:profile.display_name};
  const system = `You are Budhi Lite's AI insight agent. Return only valid JSON with keys: title, description, strengths, challenges. Description must be one substantial paragraph. strengths and challenges must be arrays with exactly 3 short bullet strings each. Use the requested language code: ${language}. Keep the tone elegant, constructive, non-diagnostic, and aligned with a first-layer teaser report. Do not mention therapy, diagnosis, or certainty.`;
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
    if(!Array.isArray(parsed.strengths) || !Array.isArray(parsed.challenges)) throw new Error('Invalid AI response schema');
    return {title:parsed.title||fallback.title, description:parsed.description||fallback.description, strengths:parsed.strengths.slice(0,3), challenges:parsed.challenges.slice(0,3), _source:'ai', _note:t('aiGenerated')};
  }catch(err){
    return {...fallback, _source:'fallback_error', _note:`${t('aiFailed')} ${err.message || ''}`.trim()};
  }
}
