document.addEventListener('DOMContentLoaded', ()=>{
  setupHomeModal();
  applyStaticText();
  const langSelect=document.getElementById('language');
  langSelect.value=getLang();
  langSelect.addEventListener('change',()=>{setLang(langSelect.value); applyStaticText();});
  const userSelect=document.getElementById('username');
  PRESET_USERS.forEach(u=>{const opt=document.createElement('option'); opt.value=u.username; opt.textContent=u.display_name; userSelect.appendChild(opt)});
  const storedKey=getAPIKey(); if(storedKey) document.getElementById('apiKey').placeholder='••••••••••••••••••••';
  document.getElementById('model').value=getOpenAIModel();
  document.getElementById('clearApiKey').addEventListener('click',()=>{clearAPIKey(); document.getElementById('apiKey').value=''; document.getElementById('loginStatus').textContent=t('keyCleared')});
  document.getElementById('loginForm').addEventListener('submit', (e)=>{
    e.preventDefault();
    const username=userSelect.value;
    const password=document.getElementById('password').value || '';
    const u=findUser(username);
    const status=document.getElementById('loginStatus');
    if(!u || password !== u.password){status.textContent='Invalid demo user or password.'; return;}
    const lang=langSelect.value || 'en'; setLang(lang);
    const typedKey=document.getElementById('apiKey').value.trim(); if(typedKey) setAPIKey(typedKey);
    setOpenAIModel(document.getElementById('model').value);
    setCurrentUser(publicUser(u));
    status.textContent=getAPIKey()?t('apiKeyPresent'):t('apiKeyMissing');
    setTimeout(()=>location.href='./dashboard.html',450);
  });
});


function setupHomeModal(){
  const overlay=document.getElementById('modalOverlay');
  const openBtn=document.getElementById('openModal');
  const closeBtn=document.getElementById('closeModal');
  if(!overlay || !openBtn || !closeBtn) return;

  function openModal(){
    overlay.classList.add('open');
    document.body.classList.add('modal-open');
  }

  function closeModal(){
    overlay.classList.remove('open');
    document.body.classList.remove('modal-open');
  }

  openBtn.addEventListener('click', openModal);
  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', (e)=>{ if(e.target===overlay) closeModal(); });
  document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') closeModal(); });
}
