// Budhi Lite full report agent.
// This file runs entirely in the browser. The user's OpenAI key is read from sessionStorage.
// It never saves the OpenAI key to Supabase, GitHub, localStorage or any server.

function reportLang(){ return getLang ? getLang() : 'en'; }

function reportMl(obj, fallback=''){
  try { return ml(obj) || fallback; } catch(_) { return fallback; }
}

function cleanText(value, fallback=''){
  const s = (value === null || value === undefined) ? '' : String(value).trim();
  return s || fallback;
}

function cleanArray(arr, fallback, count=3){
  const base = Array.isArray(arr) ? arr : [];
  const cleaned = base.map(x => cleanText(x)).filter(Boolean);
  const fb = Array.isArray(fallback) ? fallback.map(x => cleanText(x)).filter(Boolean) : [];
  const merged = [...cleaned, ...fb].filter(Boolean);
  const out = [];
  const seen = new Set();
  merged.forEach(item => {
    const key = item.toLowerCase();
    if(!seen.has(key) && out.length < count){
      seen.add(key);
      out.push(item);
    }
  });
  while(out.length < count){
    out.push([
      'This point should be interpreted as a first-layer Budhi Lite insight.',
      'Use this result as a prompt for reflection rather than as a fixed conclusion.',
      'The full Self-Profile may refine this interpretation later.'
    ][out.length]);
  }
  return out.slice(0, count);
}

function fallbackProfileSections(profile){
  const cards = profile?.results_app?.cards || [];
  return cards.map(card => {
    const title = reportMl(card.title, card.key || 'Result');
    const desc = reportMl(card.description, 'This result summarizes one first-layer dimension of the Budhi Lite profile.');
    const metric = reportMl(card.metric_value, '');
    return {
      key: card.key || title.toLowerCase().replace(/\s+/g, '_'),
      title,
      subtitle: metric,
      description: desc,
      strengths: cleanArray([], [
        `${title} gives structure to the first profile layer.`,
        `This result can support clearer self-observation.`,
        `It can later be compared in Match Lite.`
      ]),
      challenges: cleanArray([], [
        `${title} is still a surface-level signal.`,
        `Context can change how this pattern appears.`,
        `The full Self-Profile is needed for deeper classification.`
      ])
    };
  });
}

function fallbackMatchSections(match){
  const cards = match?.results_app?.cards || [];
  return cards.map(card => {
    const title = reportMl(card.title, card.key || 'Result');
    const desc = reportMl(card.description, 'This result summarizes one first-layer dimension of the Match Lite compatibility reading.');
    const metric = reportMl(card.metric_value, '');
    return {
      key: card.key || title.toLowerCase().replace(/\s+/g, '_'),
      title,
      subtitle: metric,
      description: desc,
      strengths: cleanArray([], [
        `${title} helps clarify how the pair connects.`,
        `This dimension can support a more concrete conversation.`,
        `It gives the match a practical point of comparison.`
      ]),
      challenges: cleanArray([], [
        `${title} should not be treated as a final compatibility verdict.`,
        `The pair may need to interpret this result in context.`,
        `A full profile can change the deeper match reading.`
      ])
    };
  });
}

function fallbackProfileReport(profile){
  const displayName = profile?.display_name || profile?.username || 'User';
  const sections = fallbackProfileSections(profile);
  return {
    title: `${displayName} · Budhi Lite Report`,
    subtitle: 'Individual first-layer profile report',
    description: reportMl(profile?.results_app?.overview, 'This personalized report expands the Budhi Lite profile snapshot into a more structured reading. It connects decision style, selected values, life pillars and worldview to describe how the user currently organizes action, meaning and priorities. The report remains intentionally first-layer: it is useful for reflection and Match Lite, while deeper character interpretation belongs to the full Self-Profile.'),
    strengths: cleanArray([], [
      'The profile offers a clear first map of current behavioral direction.',
      'The selected values and pillars help identify what currently organizes meaning and priorities.',
      'The worldview result adds interpretive depth to the first-layer reading.'
    ]),
    challenges: cleanArray([], [
      'This is not yet a full character classification.',
      'Current answers may shift as context and life moment change.',
      'The report should be used as a reflective starting point, not as a fixed label.'
    ]),
    cross_analysis: {
      title: 'Integrated Analysis',
      description: 'The cross-result reading connects how the user acts, what the user values, where the user places life energy and which worldview frames interpretation. Together, these dimensions describe the first visible layer of the profile: not the complete character, but the current configuration of movement, meaning and priorities.',
      bullets: cleanArray([], [
        'Decision Style shows how the user moves toward action.',
        'Values and Life Pillars show what currently anchors choices and energy.',
        'Worldview frames how the user interprets meaning and direction.'
      ])
    },
    sections
  };
}

function fallbackMatchReport(match){
  const users = match?.users || match?.usernames || [match?.user_a, match?.user_b].filter(Boolean);
  const pairName = users.length ? users.join(' & ') : 'Match Lite';
  const sections = fallbackMatchSections(match);
  return {
    title: `${pairName} · Match Lite Report`,
    subtitle: 'Compatibility first-layer report',
    description: reportMl(match?.results_app?.overview, 'This personalized match report expands the Match Lite result into a more structured compatibility reading. It connects decision rhythm, values, life pillars and worldview to show where the pair naturally aligns, where friction may appear and which points deserve conversation. The report is a first-layer compatibility teaser, not a final verdict.'),
    strengths: cleanArray((match?.results_app?.strengths || []).map(x => reportMl(x.description || x.title)), [
      'The match offers a clear starting point for conversation.',
      'Shared or convergent results can support trust and cooperation.',
      'The report highlights practical areas where alignment can be strengthened.'
    ]),
    challenges: cleanArray((match?.results_app?.tensions || []).map(x => reportMl(x.description || x.title)), [
      'The pair may need to coordinate expectations before drawing conclusions.',
      'Some differences may be contextual rather than structural.',
      'The full Self-Profile can refine the match interpretation later.'
    ]),
    cross_analysis: {
      title: 'Integrated Analysis',
      description: 'The cross-result reading connects how both people move, what they value, where they place life energy and how they interpret the world. This integrated view is important because compatibility is not only about overlap: it also depends on whether differences can become useful complementarity instead of repeated friction.',
      bullets: cleanArray([], [
        'Decision Style indicates whether timing and initiative are synchronized.',
        'Values and Life Pillars reveal moral and practical compatibility.',
        'Worldview shows how each person may interpret the same situation.'
      ])
    },
    sections
  };
}

function normalizeReport(raw, fallback){
  const data = raw && typeof raw === 'object' ? raw : {};
  const fallbackCross = fallback.cross_analysis || {};
  const sectionsRaw = Array.isArray(data.result_sections) ? data.result_sections : (Array.isArray(data.sections) ? data.sections : []);
  const fallbackSections = Array.isArray(fallback.sections) ? fallback.sections : [];
  const sections = fallbackSections.map((fb, index) => {
    const candidate = sectionsRaw[index] || sectionsRaw.find(s => s && (s.key === fb.key || String(s.title||'').toLowerCase() === String(fb.title||'').toLowerCase())) || {};
    return {
      key: cleanText(candidate.key, fb.key || `section_${index+1}`),
      title: cleanText(candidate.title, fb.title || `Result ${index+1}`),
      subtitle: cleanText(candidate.subtitle, fb.subtitle || ''),
      description: cleanText(candidate.description, fb.description || 'This section summarizes one relevant result.'),
      strengths: cleanArray(candidate.strengths, fb.strengths, 3),
      challenges: cleanArray(candidate.challenges, fb.challenges, 3)
    };
  });

  return {
    title: cleanText(data.title, fallback.title || 'Budhi Lite Report'),
    subtitle: cleanText(data.subtitle, fallback.subtitle || ''),
    description: cleanText(data.description, fallback.description || 'This report summarizes a first-layer Budhi Lite reading.'),
    strengths: cleanArray(data.strengths, fallback.strengths, 3),
    challenges: cleanArray(data.challenges, fallback.challenges, 3),
    cross_analysis: {
      title: cleanText(data.cross_analysis?.title || data.integrated_analysis?.title, fallbackCross.title || 'Integrated Analysis'),
      description: cleanText(data.cross_analysis?.description || data.integrated_analysis?.description, fallbackCross.description || 'This block connects the main results into one integrated reading.'),
      bullets: cleanArray(data.cross_analysis?.bullets || data.integrated_analysis?.bullets, fallbackCross.bullets, 3)
    },
    sections,
    generated_at: new Date().toISOString()
  };
}

async function generatePersonalizedReport({scope, profile, match}){
  const fallback = scope === 'match' ? fallbackMatchReport(match) : fallbackProfileReport(profile);
  const apiKey = getAPIKey();

  if(!apiKey){
    return {...fallback, _source:'fallback', _note:t('fallbackUsed'), generated_at:new Date().toISOString()};
  }

  const language = reportLang();
  const model = getOpenAIModel();
  const payload = scope === 'match'
    ? { scope, language, match_summary: match?.results_app, users: match?.users || match?.usernames || [], profile_a: match?.user_a, profile_b: match?.user_b }
    : { scope, language, profile_summary: profile?.results_app, username: profile?.display_name || profile?.username };

  const system = `You are Budhi Lite's full report agent. Return only valid JSON. Use language code ${language}. 
Required schema:
{
  "title": "string",
  "subtitle": "string",
  "description": "one substantial paragraph",
  "strengths": ["exactly 3 short items"],
  "challenges": ["exactly 3 short items"],
  "cross_analysis": {
    "title": "string",
    "description": "one paragraph connecting all dimensions",
    "bullets": ["exactly 3 short items"]
  },
  "result_sections": [
    {
      "key": "decision|values|pillars|worldview or another existing result key",
      "title": "string",
      "subtitle": "string",
      "description": "one paragraph",
      "strengths": ["exactly 3 short items"],
      "challenges": ["exactly 3 short items"]
    }
  ]
}
The report must be elegant, practical, non-diagnostic, and clearly adapted to Budhi Lite concepts. Do not mention therapy, diagnosis, certainty, or that this is a final classification. Always fill every field with useful content.`;

  try{
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':`Bearer ${apiKey}`},
      body:JSON.stringify({
        model,
        messages:[
          {role:'system', content:system},
          {role:'user', content:JSON.stringify({payload, deterministic_fallback_structure:fallback})}
        ],
        temperature:.55,
        response_format:{type:'json_object'}
      })
    });
    const data = await res.json();
    if(!res.ok) throw new Error(data?.error?.message || 'OpenAI request failed');
    const raw = data?.choices?.[0]?.message?.content || '{}';
    const parsed = JSON.parse(raw);
    return {...normalizeReport(parsed, fallback), _source:'ai', _note:t('aiGenerated')};
  }catch(err){
    return {...fallback, _source:'fallback_error', _note:`${t('aiFailed')} ${err.message || ''}`.trim(), generated_at:new Date().toISOString()};
  }
}
