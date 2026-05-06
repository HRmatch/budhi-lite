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
    const merged = {...loadProfilesLocal(), ...cloudProfiles};
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
  profiles[username] = profile;
  saveProfiles(profiles);

  if(typeof supabaseUpsertProfile === 'function'){
    try{
      await supabaseUpsertProfile(username, profile);
      // Refresh cache lightly after cloud write.
      await syncProfilesFromCloud();
    }catch(err){
      console.warn('[Budhi Lite] Profile saved locally, but Supabase write failed.', err);
      throw err;
    }
  }
  return profile;
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
    const merged = {...loadMatchesLocal(), ...cloudMatches};
    saveMatches(merged);
    return merged;
  }catch(err){
    console.warn('[Budhi Lite] Supabase match sync failed; using local cache.', err);
    BUDHI_MATCH_CACHE = loadMatchesLocal();
    return BUDHI_MATCH_CACHE;
  }
}

async function saveMatch(match){
  const userA = match.user_a || (match.users||[])[0];
  const userB = match.user_b || (match.users||[])[1];
  const matchId = match.match_id || makeMatchId(userA, userB);
  const record = {
    ...match,
    match_id: matchId,
    user_a: userA,
    user_b: userB,
    lang: match.lang || getLang(),
    updated_at: new Date().toISOString()
  };

  const matches = loadMatches();
  matches[matchId] = record;
  saveMatches(matches);

  if(typeof supabaseUpsertMatch === 'function'){
    try{
      await supabaseUpsertMatch(record);
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
