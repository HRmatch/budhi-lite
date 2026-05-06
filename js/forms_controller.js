let questionnaire = null;
let currentQuestionIndex = 0;
let wizardAnswers = {};

const formEls = {};

document.addEventListener('DOMContentLoaded', async () => {
  const user = requireSession();
  if (!user) return;

  renderShell();
  questionnaire = await fetch('./data/phase1_snapshot.json').then(r => r.json());

  formEls.stage = document.getElementById('questions');
  formEls.prev = document.getElementById('prevQuestion');
  formEls.next = document.getElementById('nextQuestion');
  formEls.counter = document.getElementById('questionCounter');
  formEls.progress = document.getElementById('progressFill');
  formEls.status = document.getElementById('formStatus');
  formEls.answerStatus = document.getElementById('answerStatus');

  // Important: do not prefill existing saved profiles. The form always starts blank.
  wizardAnswers = {};
  currentQuestionIndex = 0;

  formEls.prev.addEventListener('click', goPrevious);
  formEls.next.addEventListener('click', goNextOrSubmit);

  renderCurrentQuestion();
});

function questions() {
  return (questionnaire && questionnaire.questions) || [];
}

function parseRaw(x) {
  try { return JSON.parse(x); } catch (e) { return x; }
}

function rawEquals(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function currentQuestion() {
  return questions()[currentQuestionIndex];
}

function getAnswer(qid) {
  return wizardAnswers[qid];
}

function setAnswer(qid, value) {
  wizardAnswers[qid] = value;
}

function isQuestionAnswered(q) {
  const answer = getAnswer(q.id);
  if (q.type === 'multi_choice') {
    const required = Number(q.max_select || 1);
    return Array.isArray(answer) && answer.length === required;
  }
  return answer !== null && answer !== undefined && answer !== '';
}

function renderCurrentQuestion() {
  const q = currentQuestion();
  if (!q) return;

  formEls.status.textContent = '';

  const total = questions().length;
  const progressPct = total ? ((currentQuestionIndex + 1) / total) * 100 : 0;
  formEls.counter.textContent = `${t('question')} ${currentQuestionIndex + 1} ${t('of')} ${total}`;
  formEls.progress.style.width = `${progressPct}%`;
  formEls.prev.disabled = currentQuestionIndex === 0;
  formEls.next.textContent = currentQuestionIndex === total - 1 ? t('saveProfile') : t('next');

  const selected = q.type === 'multi_choice' && Array.isArray(getAnswer(q.id)) ? getAnswer(q.id).length : 0;
  const required = Number(q.max_select || 1);
  const help = q.type === 'multi_choice'
    ? `<p class="question-help">${t('selectExactly')} ${required} · <span id="selectedCount">${selected}/${required}</span></p>`
    : `<p class="question-help">${t('chooseOneOption')}</p>`;

  const optionsHtml = (q.options || []).map((opt, idx) => {
    const inputType = q.type === 'multi_choice' ? 'checkbox' : 'radio';
    const raw = JSON.stringify(opt.value).replace(/'/g, '&apos;');
    const current = getAnswer(q.id);
    const checked = q.type === 'multi_choice'
      ? (Array.isArray(current) && current.some(v => rawEquals(v, opt.value)))
      : rawEquals(current, opt.value);

    return `
      <label class="option-card" data-option-index="${idx}">
        <input type="${inputType}" name="${q.id}" value="${String(opt.value).replace(/"/g, '&quot;')}" data-raw='${raw}' ${checked ? 'checked' : ''} autocomplete="off">
        <span class="option-marker"></span>
        <span class="option-text">${ml(opt.label)}</span>
      </label>
    `;
  }).join('');

  formEls.stage.innerHTML = `
    <section class="question wizard-question" data-qid="${q.id}" data-type="${q.type}" data-max="${q.max_select || 1}">
      <div class="question-kicker">${q.id}</div>
      <h3>${ml(q.text)}</h3>
      ${help}
      <div class="options-scroll">
        <div class="options options-compact">${optionsHtml}</div>
      </div>
    </section>
  `;

  const options = formEls.stage.querySelector('.options');
  options.addEventListener('change', () => handleQuestionChange(q));
  updateNextState();
}

function handleQuestionChange(q) {
  const inputs = [...formEls.stage.querySelectorAll(`input[name="${q.id}"]`)];

  if (q.type === 'multi_choice') {
    const required = Number(q.max_select || 1);
    let checked = inputs.filter(input => input.checked);
    if (checked.length > required) {
      checked[checked.length - 1].checked = false;
      checked = inputs.filter(input => input.checked);
    }
    setAnswer(q.id, checked.map(input => parseRaw(input.dataset.raw)));
    const counter = document.getElementById('selectedCount');
    if (counter) counter.textContent = `${checked.length}/${required}`;
  } else {
    const checked = inputs.find(input => input.checked);
    setAnswer(q.id, checked ? parseRaw(checked.dataset.raw) : null);
  }

  updateNextState();
}

function updateNextState() {
  const q = currentQuestion();
  const answered = isQuestionAnswered(q);
  formEls.next.disabled = !answered;
  formEls.answerStatus.textContent = answered ? t('answerSaved') : t('answerToContinue');
  formEls.answerStatus.classList.toggle('ready', answered);
}

function goPrevious() {
  if (currentQuestionIndex <= 0) return;
  currentQuestionIndex -= 1;
  renderCurrentQuestion();
}

async function goNextOrSubmit() {
  const q = currentQuestion();
  if (!isQuestionAnswered(q)) {
    formEls.status.textContent = t('required');
    updateNextState();
    return;
  }

  if (currentQuestionIndex < questions().length - 1) {
    currentQuestionIndex += 1;
    renderCurrentQuestion();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  await submitProfile();
}

function complete(answers) {
  return questions().every(q => q.type === 'multi_choice'
    ? Array.isArray(answers[q.id]) && answers[q.id].length === Number(q.max_select || 1)
    : answers[q.id] !== null && answers[q.id] !== undefined
  );
}

async function submitProfile() {
  const user = getCurrentUser();
  if (!complete(wizardAnswers)) {
    formEls.status.textContent = t('required');
    return;
  }

  formEls.status.innerHTML = '<span class="loader"></span> Processing...';
  formEls.next.disabled = true;
  formEls.prev.disabled = true;

  const profile = buildPhase1Profile({
    username: user.username,
    display_name: user.display_name,
    answers: wizardAnswers,
    language: getLang(),
    source: 'user_form'
  });

  try {
    await saveProfile(user.username, profile);
    formEls.status.textContent = t('saved');
    setTimeout(() => location.href = './results.html', 650);
  } catch (err) {
    formEls.status.textContent = 'Profile saved locally, but the online save failed. Check Supabase settings.';
    formEls.next.disabled = false;
    formEls.prev.disabled = false;
  }
}
