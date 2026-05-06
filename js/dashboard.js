document.addEventListener('DOMContentLoaded', async () => {
  const user = requireSession();
  if (!user) return;
  renderShell();
  await syncProfilesFromCloud();

  const userName = document.getElementById('dashboardUserName');
  if (userName) userName.textContent = user.display_name || user.username;

  const keyState = document.getElementById('dashboardKeyState');
  if (keyState) keyState.textContent = getAPIKey() ? t('apiKeyActiveMini') : t('apiKeyMissingMini');

  const profile = getProfile(user.username);
  const statusPill = document.getElementById('profileStatusPill');
  if (statusPill) statusPill.textContent = profile ? t('profileStatusReady') : t('profileStatusEmpty');
});
