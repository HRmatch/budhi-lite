const SESSION_KEYS = {
  user:   'budhi_lite_user',
  lang:   'budhi_lite_lang',
  apiKey: 'budhi_lite_openai_key',
  model:  'budhi_lite_openai_model'
};

function setCurrentUser(user) {
  sessionStorage.setItem(SESSION_KEYS.user, JSON.stringify(user));
}

function getCurrentUser() {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEYS.user) || 'null');
  } catch (e) {
    return null;
  }
}

function getAPIKey() {
  return sessionStorage.getItem(SESSION_KEYS.apiKey) || '';
}

function setAPIKey(key) {
  if (key && key.trim()) sessionStorage.setItem(SESSION_KEYS.apiKey, key.trim());
}

function clearAPIKey() {
  sessionStorage.removeItem(SESSION_KEYS.apiKey);
}

function getOpenAIModel() {
  return sessionStorage.getItem(SESSION_KEYS.model) || 'gpt-4o-mini';
}

function setOpenAIModel(model) {
  sessionStorage.setItem(SESSION_KEYS.model, (model || 'gpt-4o-mini').trim() || 'gpt-4o-mini');
}

function requireSession() {
  const user = getCurrentUser();
  if (!user) { location.href = './index.html'; return null; }
  return user;
}

function logout() {
  sessionStorage.removeItem(SESSION_KEYS.user);
  location.href = './index.html';
}

function renderShell() {
  applyStaticText();
  const user = getCurrentUser();
  const holder = document.querySelector('[data-session-user]');
  if (holder && user) holder.textContent = user.display_name || user.username;
  const logoutBtn = document.querySelector('[data-logout]');
  if (logoutBtn) logoutBtn.addEventListener('click', logout);
  document.querySelectorAll('[data-clear-key]').forEach(btn =>
    btn.addEventListener('click', () => {
      clearAPIKey();
      alert(t('keyCleared'));
      updateKeyState?.();
    })
  );
}
