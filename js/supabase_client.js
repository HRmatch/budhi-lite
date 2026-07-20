// Supabase REST client for Budhi Lite V1
// Public browser configuration. The publishable key is safe to ship with the frontend
// when Row Level Security (RLS) and policies are configured correctly in Supabase.
// DO NOT put a service_role or secret key here.

const SUPABASE_CONFIG = {
  url: "https://xzcnwbkinaswwsuiymqs.supabase.co",
  anonKey: "sb_publishable_RUoYwMn0qzWwkDcrw7Tm0Q_iJI8e6IK"
};

function supabaseBaseUrl() {
  return (SUPABASE_CONFIG.url || "").replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");
}

function supabaseRestUrl(path) {
  return `${supabaseBaseUrl()}/rest/v1/${path.replace(/^\//, "")}`;
}

function supabaseHeaders(extra = {}) {
  return {
    "apikey": SUPABASE_CONFIG.anonKey,
    "Authorization": `Bearer ${SUPABASE_CONFIG.anonKey}`,
    "Content-Type": "application/json",
    ...extra
  };
}

function isSupabaseConfigured() {
  return Boolean(SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey);
}

function supabaseIsPlainObject(value){
  return value && typeof value === 'object' && !Array.isArray(value);
}

function supabaseDeepMerge(base, incoming){
  if(!supabaseIsPlainObject(base)) base = {};
  if(!supabaseIsPlainObject(incoming)) return {...base};
  const out = {...base};
  Object.keys(incoming).forEach(key => {
    const next = incoming[key];
    const prev = out[key];
    if(supabaseIsPlainObject(prev) && supabaseIsPlainObject(next)) out[key] = supabaseDeepMerge(prev, next);
    else out[key] = next;
  });
  return out;
}

async function supabaseRequest(path, options = {}) {
  if (!isSupabaseConfigured()) throw new Error("Supabase is not configured.");
  const res = await fetch(supabaseRestUrl(path), {
    ...options,
    headers: supabaseHeaders(options.headers || {})
  });

  if (!res.ok) {
    let detail = "";
    try {
      const err = await res.json();
      detail = err.message || JSON.stringify(err);
    } catch (_) {
      detail = await res.text();
    }
    throw new Error(`Supabase request failed (${res.status}): ${detail}`);
  }

  if (res.status === 204) return null;
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

async function supabaseFetchProfile(username){
  const rows = await supabaseRequest(`budhi_profiles?select=*&username=eq.${encodeURIComponent(username)}`, { method: "GET" });
  return Array.isArray(rows) ? rows[0] : null;
}

async function supabaseFetchMatch(matchId){
  const rows = await supabaseRequest(`budhi_matches?select=*&match_id=eq.${encodeURIComponent(matchId)}`, { method: "GET" });
  return Array.isArray(rows) ? rows[0] : null;
}

async function supabaseFetchProfiles() {
  const rows = await supabaseRequest("budhi_profiles?select=*", { method: "GET" });
  const out = {};
  (rows || []).forEach(row => {
    out[row.username] = {
      username: row.username,
      display_name: row.display_name,
      lang: row.lang || "en",
      language: row.lang || "en",
      answers: row.answers || {},
      results_app: row.results_app || {},
      results_ai: row.results_ai || {},
      updated_at: row.updated_at,
      storage: "supabase"
    };
  });
  return out;
}

async function supabaseUpsertProfile(username, profile) {
  const replaceAI = profile.__replace_results_ai === true;
  let existing = null;
  try{ existing = await supabaseFetchProfile(username); }catch(err){ console.warn('[Budhi Lite] Could not prefetch profile before upsert.', err); }

  const payload = {
    username,
    display_name: profile.display_name || existing?.display_name || username,
    lang: profile.lang || profile.language || existing?.lang || getLang(),
    answers: profile.answers || existing?.answers || {},
    results_app: profile.results_app || existing?.results_app || {},
    results_ai: replaceAI ? (profile.results_ai || {}) : supabaseDeepMerge(existing?.results_ai || {}, profile.results_ai || {}),
    updated_at: new Date().toISOString()
  };

  const rows = await supabaseRequest("budhi_profiles?on_conflict=username", {
    method: "POST",
    headers: { "Prefer": "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify(payload)
  });

  return Array.isArray(rows) ? rows[0] : rows;
}

async function supabaseFetchMatches() {
  const rows = await supabaseRequest("budhi_matches?select=*", { method: "GET" });
  const out = {};
  (rows || []).forEach(row => {
    out[row.match_id] = {
      match_id: row.match_id,
      user_a: row.user_a,
      user_b: row.user_b,
      participants: row.participants || [row.user_a, row.user_b].filter(Boolean).sort(),
      lang: row.lang || "en",
      results_app: row.results_app || {},
      results_ai: row.results_ai || {},
      updated_at: row.updated_at,
      storage: "supabase"
    };
  });
  return out;
}

async function supabaseUpsertMatch(match) {
  const users = (match.usernames || match.users || []).map(x => String(x || "").trim()).filter(Boolean);
  const userA = match.user_a || users[0];
  const userB = match.user_b || users[1];
  const matchId = match.match_id || makeMatchId(userA, userB);
  const replaceAI = match.__replace_results_ai === true;
  let existing = null;
  try{ existing = await supabaseFetchMatch(matchId); }catch(err){ console.warn('[Budhi Lite] Could not prefetch match before upsert.', err); }

  const payload = {
    match_id: matchId,
    user_a: userA || existing?.user_a,
    user_b: userB || existing?.user_b,
    lang: match.lang || existing?.lang || getLang(),
    results_app: match.results_app || existing?.results_app || {},
    results_ai: replaceAI ? (match.results_ai || {}) : supabaseDeepMerge(existing?.results_ai || {}, match.results_ai || {}),
    updated_at: new Date().toISOString()
  };

  const rows = await supabaseRequest("budhi_matches?on_conflict=match_id", {
    method: "POST",
    headers: { "Prefer": "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify(payload)
  });

  return Array.isArray(rows) ? rows[0] : rows;
}
