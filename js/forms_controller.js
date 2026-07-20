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
  formEls.skip = document.getElementById('skipQuestion');
  formEls.next = document.getElementById('nextQuestion');
  formEls.counter = document.getElementById('questionCounter');
  formEls.progress = document.getElementById('progressFill');
  formEls.status = document.getElementById('formStatus');
  formEls.answerStatus = document.getElementById('answerStatus');

  // Important: do not prefill existing saved profiles. The form always starts blank.
  wizardAnswers = {};
  currentQuestionIndex = 0;

  formEls.prev.addEventListener('click', goPrevious);
  formEls.skip.addEventListener('click', skipCurrentQuestion);
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

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
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

function isSupplementaryQuestion(q) {
  return q && q.role === 'supplementary';
}

function shouldBypassSemanticResolver(q) {
  return isSupplementaryQuestion(q);
}

function isQuestionAnswered(q) {
  if (!q) return false;
  if (q.optional === true) return true;

  const answer = getAnswer(q.id);
  if (q.type === 'multi_choice') {
    const required = Number(q.max_select || 1);
    return Array.isArray(answer) && answer.length === required;
  }
  return answer !== null && answer !== undefined && answer !== '';
}

function isFinalQuestion(q) {
  return !q || q.std_next_question === 'finalize';
}

function getNextQuestionIndex(q) {
  if (!q || q.std_next_question === 'finalize') return -1;
  const declaredIndex = questions().findIndex(item => item.id === q.std_next_question);
  return declaredIndex >= 0 ? declaredIndex : currentQuestionIndex + 1;
}

function renderCurrentQuestion() {
  const q = currentQuestion();
  if (!q) return;

  formEls.status.textContent = '';

  // Optional answers must exist in profile.answers even when untouched or skipped.
  if (q.optional === true && getAnswer(q.id) === undefined) {
    setAnswer(q.id, '');
  }

  const total = questions().length;
  const progressPct = total ? ((currentQuestionIndex + 1) / total) * 100 : 0;
  formEls.counter.textContent = `${t('question')} ${currentQuestionIndex + 1} ${t('of')} ${total}`;
  formEls.progress.style.width = `${progressPct}%`;
  formEls.prev.disabled = currentQuestionIndex === 0;
  formEls.skip.hidden = q.skippable !== true;
  formEls.next.textContent = isFinalQuestion(q) ? t('saveProfile') : t('next');

  if (q.type === 'free_text') {
    renderFreeTextQuestion(q);
  } else {
    renderChoiceQuestion(q);
  }

  updateNextState();
}

function renderChoiceQuestion(q) {
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
  options.addEventListener('change', () => handleChoiceQuestionChange(q));
}

function renderFreeTextQuestion(q) {
  const answer = typeof getAnswer(q.id) === 'string' ? getAnswer(q.id) : '';
  const helpText = q.optional === true ? t('optionalAnswer') : t('answerToContinue');

  formEls.stage.innerHTML = `
    <section class="question wizard-question supplementary-question" data-qid="${q.id}" data-type="${q.type}" data-role="${q.role || ''}">
      <div class="question-kicker">${q.id}</div>
      <h3>${ml(q.text)}</h3>
      <p class="question-help">${helpText}</p>
      <div class="free-text-wrap">
        <textarea
          id="freeTextAnswer"
          class="free-text-answer"
          name="${q.id}"
          rows="7"
          autocomplete="off"
          placeholder="${escapeHtml(t('writeOptionalAnswer'))}"
        >${escapeHtml(answer)}</textarea>
      </div>
    </section>
  `;

  const textarea = document.getElementById('freeTextAnswer');
  textarea.addEventListener('input', () => handleFreeTextChange(q, textarea.value));
  requestAnimationFrame(() => textarea.focus());
}

function handleChoiceQuestionChange(q) {
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

function handleFreeTextChange(q, value) {
  setAnswer(q.id, value);

  // Supplementary answers are persisted as raw text only. They never enter the
  // IA Resolver, semantic fallback, NLP normalization, scoring or tagging flow.
  if (shouldBypassSemanticResolver(q)) {
    updateNextState();
    return;
  }

  updateNextState();
}

function updateNextState() {
  const q = currentQuestion();
  const answered = isQuestionAnswered(q);
  const hasOptionalText = q?.optional === true && String(getAnswer(q.id) || '').trim() !== '';

  formEls.next.disabled = !answered;
  formEls.answerStatus.textContent = q?.optional === true && !hasOptionalText
    ? t('optionalCanSkip')
    : (answered ? t('answerSaved') : t('answerToContinue'));
  formEls.answerStatus.classList.toggle('ready', answered);
}

function goPrevious() {
  if (currentQuestionIndex <= 0) return;
  currentQuestionIndex -= 1;
  renderCurrentQuestion();
}

async function skipCurrentQuestion() {
  const q = currentQuestion();
  if (!q || q.skippable !== true) return;

  setAnswer(q.id, '');
  await goNextOrSubmit();
}

async function goNextOrSubmit() {
  const q = currentQuestion();
  if (!isQuestionAnswered(q)) {
    formEls.status.textContent = t('required');
    updateNextState();
    return;
  }

  if (q.optional === true && getAnswer(q.id) === undefined) {
    setAnswer(q.id, '');
  }

  const nextIndex = getNextQuestionIndex(q);
  if (nextIndex >= 0 && nextIndex < questions().length) {
    currentQuestionIndex = nextIndex;
    renderCurrentQuestion();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  await submitProfile();
}

function complete(answers) {
  return questions().every(q => {
    if (q.optional === true) return true;
    if (q.type === 'multi_choice') {
      return Array.isArray(answers[q.id]) && answers[q.id].length === Number(q.max_select || 1);
    }
    return answers[q.id] !== null && answers[q.id] !== undefined && answers[q.id] !== '';
  });
}

function ensureOptionalAnswers(answers) {
  questions().forEach(q => {
    if (q.optional === true && answers[q.id] === undefined) {
      answers[q.id] = '';
    }
  });
}

async function submitProfile() {
  const user = getCurrentUser();
  ensureOptionalAnswers(wizardAnswers);

  if (!complete(wizardAnswers)) {
    formEls.status.textContent = t('required');
    return;
  }

  formEls.status.innerHTML = '<span class="loader"></span> Processing...';
  formEls.next.disabled = true;
  formEls.prev.disabled = true;
  formEls.skip.disabled = true;

  const profile = buildPhase1Profile({
    username: user.username,
    display_name: user.display_name,
    answers: wizardAnswers,
    questionDefinitions: questions(),
    language: getLang(),
    source: 'user_form'
  });

  try {
    // A completed questionnaire creates a new profile revision. AI content from
    // the previous revision must not survive this save; it will be generated
    // again on demand from the new answers.
    await saveProfile(user.username, {
      ...profile,
      results_ai: {},
      __replace_results_ai: true
    });
    formEls.status.textContent = t('saved');
    setTimeout(() => location.href = './results.html', 650);
  } catch (err) {
    formEls.status.textContent = 'Profile saved locally, but the online save failed. Check Supabase settings.';
    formEls.next.disabled = false;
    formEls.prev.disabled = false;
    formEls.skip.disabled = false;
  }
}
