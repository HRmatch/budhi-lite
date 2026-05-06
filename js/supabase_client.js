// Supabase REST client for Budhi Lite V1
// Public browser configuration. The publishable key is safe to ship with the frontend
// when Row Level Security (RLS) and policies are configured correctly in Supabase.
// DO NOT put a service_role/secret key here.

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

async function supabaseFetchProfiles() {
  const rows = await supabaseRequest("budhi_profiles?select=*", { method: "GET" });
  const out = {};
  (rows || []).forEach(row => {
    out[row.username] = {
      username: row.username,
      display_name: row.display_name,
      lang: row.lang || "en",
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
  const payload = {
    username,
    display_name: profile.display_name || username,
    lang: profile.lang || profile.language || getLang(),
    answers: profile.answers || {},
    results_app: profile.results_app || {},
    results_ai: profile.results_ai || {},
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
  const users = (match.users || []).map(x => String(x || "").trim()).filter(Boolean);
  const userA = match.user_a || users[0];
  const userB = match.user_b || users[1];
  const matchId = match.match_id || makeMatchId(userA, userB);

  const payload = {
    match_id: matchId,
    user_a: userA,
    user_b: userB,
    lang: match.lang || getLang(),
    results_app: match.results_app || {},
    results_ai: match.results_ai || {},
    updated_at: new Date().toISOString()
  };

  const rows = await supabaseRequest("budhi_matches?on_conflict=match_id", {
    method: "POST",
    headers: { "Prefer": "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify(payload)
  });

  return Array.isArray(rows) ? rows[0] : rows;
}
