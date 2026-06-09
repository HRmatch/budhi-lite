const PROFILE_STORE_KEY = 'budhi_lite_profiles_v2';
const MATCH_STORE_KEY = 'budhi_lite_matches_v1';

let BUDHI_PROFILE_CACHE = null;
let BUDHI_MATCH_CACHE = null;

function loadProfilesLocal(){
  try{return JSON.parse(localStorage.getItem(PROFILE_STORE_KEY)||'{}')}catch(e){return {}}
}
function saveProfilesLocal(profiles){
  localStorage.setItem(PROFILE_STORE_KEY, JSON.stringify(profiles||{}));
}
function loadMatchesLocal(){
  try{return JSON.parse(localStorage.getItem(MATCH_STORE_KEY)||'{}')}catch(e){return {}}
}
function saveMatchesLocal(matches){
  localStorage.setItem(MATCH_STORE_KEY, JSON.stringify(matches||{}));
}

function isPlainObject(value){
  return value && typeof value === 'object' && !Array.isArray(value);
}

function deepMergeObjects(base, incoming){
  if(!isPlainObject(base)) base = {};
  if(!isPlainObject(incoming)) return {...base};
  const out = {...base};
  Object.keys(incoming).forEach(key => {
    const next = incoming[key];
    const prev = out[key];
    if(isPlainObject(prev) && isPlainObject(next)) out[key] = deepMergeObjects(prev, next);
    else out[key] = next;
  });
  return out;
}

function mergeResultsAI(existingAI, incomingAI){
  return deepMergeObjects(existingAI || {}, incomingAI || {});
}

function loadProfiles(){
  if(!BUDHI_PROFILE_CACHE) BUDHI_PROFILE_CACHE = loadProfilesLocal();
  return BUDHI_PROFILE_CACHE || {};
}

function saveProfiles(profiles){
  BUDHI_PROFILE_CACHE = profiles || {};
  saveProfilesLocal(BUDHI_PROFILE_CACHE);
}

function getProfile(username){
  return loadProfiles()[username] || null;
}

async function syncProfilesFromCloud(){
  if(typeof supabaseFetchProfiles !== 'function') return loadProfiles();
  try{
    const cloudProfiles = await supabaseFetchProfiles();
    const localProfiles = loadProfilesLocal();
    const merged = {...localProfiles, ...cloudProfiles};
    Object.keys(localProfiles || {}).forEach(username => {
      if(cloudProfiles?.[username]){
        merged[username] = {
          ...localProfiles[username],
          ...cloudProfiles[username],
          results_ai: mergeResultsAI(localProfiles[username]?.results_ai, cloudProfiles[username]?.results_ai)
        };
      }
    });
    saveProfiles(merged);
    return merged;
  }catch(err){
    console.warn('[Budhi Lite] Supabase profile sync failed; using local cache.', err);
    BUDHI_PROFILE_CACHE = loadProfilesLocal();
    return BUDHI_PROFILE_CACHE;
  }
}

async function saveProfile(username, profile){
  const profiles = loadProfiles();
  const existing = profiles[username] || {};
  const record = {
    ...existing,
    ...profile,
    username,
    lang: profile.lang || profile.language || existing.lang || existing.language || getLang(),
    language: profile.language || profile.lang || existing.language || existing.lang || getLang(),
    results_ai: mergeResultsAI(existing.results_ai, profile.results_ai),
    updated_at: new Date().toISOString()
  };

  profiles[username] = record;
  saveProfiles(profiles);

  if(typeof supabaseUpsertProfile === 'function'){
    try{
      await supabaseUpsertProfile(username, record);
      await syncProfilesFromCloud();
    }catch(err){
      console.warn('[Budhi Lite] Profile saved locally, but Supabase write failed.', err);
      throw err;
    }
  }
  return record;
}

function getCompletedUsers(){
  const profiles = loadProfiles();
  return PRESET_USERS.map(u=>({...publicUser(u), has_profile:!!profiles[u.username]}));
}

function makeMatchId(a,b){
  return [a,b].map(x=>String(x||'').trim()).sort().join('__');
}

function loadMatches(){
  if(!BUDHI_MATCH_CACHE) BUDHI_MATCH_CACHE = loadMatchesLocal();
  return BUDHI_MATCH_CACHE || {};
}

function saveMatches(matches){
  BUDHI_MATCH_CACHE = matches || {};
  saveMatchesLocal(BUDHI_MATCH_CACHE);
}

function getMatch(matchId){
  return loadMatches()[matchId] || null;
}

async function syncMatchesFromCloud(){
  if(typeof supabaseFetchMatches !== 'function') return loadMatches();
  try{
    const cloudMatches = await supabaseFetchMatches();
    const localMatches = loadMatchesLocal();
    const merged = {...localMatches, ...cloudMatches};
    Object.keys(localMatches || {}).forEach(matchId => {
      if(cloudMatches?.[matchId]){
        merged[matchId] = {
          ...localMatches[matchId],
          ...cloudMatches[matchId],
          results_ai: mergeResultsAI(localMatches[matchId]?.results_ai, cloudMatches[matchId]?.results_ai)
        };
      }
    });
    saveMatches(merged);
    return merged;
  }catch(err){
    console.warn('[Budhi Lite] Supabase match sync failed; using local cache.', err);
    BUDHI_MATCH_CACHE = loadMatchesLocal();
    return BUDHI_MATCH_CACHE;
  }
}

async function saveMatch(match){
  const userA = match.user_a || (match.usernames||[])[0] || (match.users||[])[0];
  const userB = match.user_b || (match.usernames||[])[1] || (match.users||[])[1];
  const matchId = match.match_id || makeMatchId(userA, userB);
  const matches = loadMatches();
  const existing = matches[matchId] || {};
  const canonicalParticipants = [userA, userB].map(x=>String(x||'').trim()).filter(Boolean).sort();
  const replaceAI = match.__replace_results_ai === true;
  const {__replace_results_ai, ...cleanMatch} = match;
  const record = {
    ...existing,
    ...cleanMatch,
    match_id: matchId,
    user_a: userA,
    user_b: userB,
    participants: existing.participants || canonicalParticipants,
    lang: cleanMatch.lang || existing.lang || getLang(),
    results_ai: replaceAI ? (cleanMatch.results_ai || {}) : mergeResultsAI(existing.results_ai, cleanMatch.results_ai),
    updated_at: new Date().toISOString()
  };

  matches[matchId] = record;
  saveMatches(matches);

  if(typeof supabaseUpsertMatch === 'function'){
    try{
      const payload = replaceAI ? {...record, __replace_results_ai:true} : record;
      await supabaseUpsertMatch(payload);
      await syncMatchesFromCloud();
    }catch(err){
      console.warn('[Budhi Lite] Match saved locally, but Supabase write failed.', err);
      throw err;
    }
  }
  return record;
}

// Kept as a harmless no-op for compatibility with older pages/scripts.
// Budhi Lite no longer auto-creates demo profiles because the form must start blank.
function ensureDemoProfiles(){return false}
