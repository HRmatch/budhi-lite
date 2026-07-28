let questionnaire = null;
let currentQuestionIndex = 0;
let wizardAnswers = {};
let questionHistory = [];

const formEls = {};

document.addEventListener('DOMContentLoaded', async () => {
  const user = requireSession();
  if (!user) return;

  renderShell();
  questionnaire = await fetch('./data/phase1_snapshot.json').then(r => r.json());

  formEls.stage = document.getElementById('questions');
  formEls.prev = document.getElementById('prevQuestion');
  formEls.next = document.getElementById('nextQuestion');
  formEls.skip = document.getElementById('skipQuestion');
  if (!formEls.skip) {
    formEls.skip = document.createElement('button');
    formEls.skip.type = 'button';
    formEls.skip.id = 'skipQuestion';
    formEls.skip.className = 'btn ghost skip-question-btn';
    formEls.next.parentNode.insertBefore(formEls.skip, formEls.next);
  }
  formEls.skip.textContent = formMessage('supplementalSkip');
  formEls.skip.hidden = true;
  formEls.counter = document.getElementById('questionCounter');
  formEls.progress = document.getElementById('progressFill');
  formEls.status = document.getElementById('formStatus');
  formEls.answerStatus = document.getElementById('answerStatus');

  // Important: do not prefill existing saved profiles. The form always starts blank.
  wizardAnswers = {};
  questionHistory = [];
  currentQuestionIndex = getStartQuestionIndex();

  formEls.prev.addEventListener('click', goPrevious);
  formEls.next.addEventListener('click', goNextOrSubmit);
  formEls.skip.addEventListener('click', skipCurrentQuestion);

  renderCurrentQuestion();
});

function questions() {
  return (questionnaire && questionnaire.questions) || [];
}

function questionIndexById(questionId) {
  return questions().findIndex(question => question?.id === questionId);
}

function getStartQuestionIndex() {
  const declaredStart = questionnaire?.start_question || questionnaire?.startQuestion || 'Qt2';
  const declaredIndex = questionIndexById(declaredStart);
  return declaredIndex >= 0 ? declaredIndex : 0;
}

function isFinalQuestion(q) {
  return !q || q.std_next_question === 'finalize';
}

function getNextQuestionIndex(q) {
  if (isFinalQuestion(q)) return -1;
  const nextId = q?.std_next_question;
  if (!nextId) return -1;
  return questionIndexById(nextId);
}

function routedQuestions() {
  const all = questions();
  const result = [];
  const visited = new Set();
  let index = getStartQuestionIndex();
  while (index >= 0 && index < all.length) {
    const q = all[index];
    if (!q || visited.has(q.id)) break;
    visited.add(q.id);
    result.push(q);
    if (isFinalQuestion(q)) break;
    index = getNextQuestionIndex(q);
  }
  return result;
}

function currentStepNumber() {
  return questionHistory.length + 1;
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

function isFreeTextQuestion(q) {
  return q && ['free_text', 'text_input', 'textarea'].includes(q.type);
}

function isSupplementalQuestion(q) {
  return Boolean(q && (q.role === 'supplementary' || q.formula_excluded === true));
}

function isOptionalQuestion(q) {
  return Boolean(q && (q.optional === true || q.skippable === true || isSupplementalQuestion(q)));
}

function getSupplementalAnswer(qid) {
  const direct = wizardAnswers[qid];
  if (direct !== undefined && direct !== null) return String(direct);
  return String(wizardAnswers[`${qid}_text`] || '');
}

function setSupplementalAnswer(qid, value) {
  const clean = String(value || '').slice(0, 420);
  wizardAnswers[qid] = clean;
  wizardAnswers[`${qid}_text`] = clean;
  delete wizardAnswers[`${qid}_score`];
  delete wizardAnswers[`${qid}_match`];
  delete wizardAnswers[`${qid}_ai_match`];
  delete wizardAnswers[`${qid}_manual`];
  delete wizardAnswers[`${qid}_validated_text`];
}

function formMl(map, fallback) {
  try { return ml(map) || fallback || ''; } catch (_) { return fallback || ''; }
}

function formMessage(key) {
  const messages = {
    supplementalSkip: obj(
      'Skip',
      'Pular',
      'Saltar',
      'Passer',
      'Überspringen'
    ),
    qt6InvalidContent: obj(
      'Please use respectful language and enter human values.',
      'Use uma linguagem respeitosa e informe valores humanos.',
      'Use un lenguaje respetuoso e indique valores humanos.',
      'Veuillez utiliser un langage respectueux et indiquer des valeurs humaines.',
      'Bitte verwenden Sie respektvolle Sprache und geben Sie menschliche Werte ein.'
    ),
    qt6InvalidTooShort: obj(
      'Please write at least one meaningful word.',
      'Escreva pelo menos uma palavra com sentido.',
      'Escriba al menos una palabra con sentido.',
      'Écrivez au moins un mot significatif.',
      'Schreiben Sie mindestens ein sinnvolles Wort.'
    ),
    qt6InvalidTooLong: obj(
      'Please keep your answer short.',
      'Mantenha sua resposta curta.',
      'Mantenga su respuesta breve.',
      'Veuillez garder une réponse courte.',
      'Bitte halten Sie Ihre Antwort kurz.'
    ),
    qt6InvalidScope: obj(
      'Select the values that best match your answer on the next screen.',
      'Selecione os valores que melhor representam sua resposta na próxima tela.',
      'Seleccione los valores que mejor representen su respuesta en la siguiente pantalla.',
      'Sélectionnez les valeurs qui correspondent le mieux à votre réponse sur l’écran suivant.',
      'Wählen Sie auf dem nächsten Bildschirm die Werte aus, die am besten zu Ihrer Antwort passen.'
    ),
    qt6NeedsManualFallback: obj(
      'Choose enough values to complete your answer.',
      'Escolha valores suficientes para completar sua resposta.',
      'Elija suficientes valores para completar su respuesta.',
      'Choisissez suffisamment de valeurs pour compléter votre réponse.',
      'Wählen Sie genügend Werte aus, um Ihre Antwort zu vervollständigen.'
    ),
    qt6DetectedLocked: obj(
      'Detected and locked',
      'Detectados e travados',
      'Detectados y bloqueados',
      'Détectées et verrouillées',
      'Erkannt und gesperrt'
    ),
    qt6SelectionCounter: obj(
      'Selected',
      'Selecionados',
      'Seleccionados',
      'Sélectionnées',
      'Ausgewählt'
    ),
    qt6AIReviewing: obj(
      'Reviewing spelling, context, and similarity with AI...',
      'Avaliando grafia, contexto e similaridade com IA...',
      'Evaluando ortografía, contexto y similitud con IA...',
      'Analyse de l’orthographe, du contexte et de la similarité avec l’IA...',
      'KI prüft Rechtschreibung, Kontext und Ähnlichkeit...'
    ),
    qt6AIUnavailable: obj(
      'AI review was not available. Please complete the selection manually.',
      'A avaliação por IA não estava disponível. Complete a seleção manualmente.',
      'La revisión por IA no estuvo disponible. Complete la selección manualmente.',
      'L’analyse par IA n’était pas disponible. Veuillez compléter la sélection manuellement.',
      'Die KI-Prüfung war nicht verfügbar. Bitte vervollständigen Sie die Auswahl manuell.'
    ),
    manualSelectionLabel: obj(
      'Choose from a list',
      'Escolher em uma lista',
      'Elegir de una lista',
      'Choisir dans une liste',
      'Aus einer Liste auswählen'
    ),
  };
  return formMl(messages[key], key);
}

function getFreeTextAnswer(qid) {
  return String(wizardAnswers[`${qid}_text`] || '').trim();
}

function setFreeTextAnswer(qid, value) {
  wizardAnswers[`${qid}_text`] = String(value || '').slice(0, QT6_MAX_INPUT_CHARS || 140);
  delete wizardAnswers[qid];
  delete wizardAnswers[`${qid}_score`];
  delete wizardAnswers[`${qid}_match`];
  delete wizardAnswers[`${qid}_ai_match`];
  delete wizardAnswers[`${qid}_manual`];
  delete wizardAnswers[`${qid}_validated_text`];
}

function freeTextUsesSlots(q) {
  return Boolean(q && Number(q.free_text_slots || q.text_slots || 0) > 1);
}

function freeTextSlotCount(q) {
  return Math.max(1, Number(q?.free_text_slots || q?.text_slots || freeTextMaxValues(q) || 1));
}

function getFreeTextSlots(q) {
  const stored = wizardAnswers[`${q.id}_slots`];
  if (Array.isArray(stored)) return stored.slice(0, freeTextSlotCount(q));
  const raw = getFreeTextAnswer(q.id);
  const parts = raw ? raw.split(/[,;\n]+/).map(x => x.trim()).filter(Boolean) : [];
  return Array.from({ length: freeTextSlotCount(q) }, (_, idx) => parts[idx] || '');
}

function setFreeTextSlots(q, values) {
  const slots = Array.from({ length: freeTextSlotCount(q) }, (_, idx) => String((values || [])[idx] || '').trim());
  wizardAnswers[`${q.id}_slots`] = slots;
  setFreeTextAnswer(q.id, slots.filter(Boolean).join(', '));
  wizardAnswers[`${q.id}_slots`] = slots;
}

function freeTextFilledSlotCount(q) {
  return getFreeTextSlots(q).filter(Boolean).length;
}

function freeTextOptionsForQuestion(q) {
  if (q?.nlp?.categories && typeof q.nlp.categories === 'object') {
    return Object.entries(q.nlp.categories).map(([value, data]) => ({ value, label: data.label || obj(value, value, value, value, value) }));
  }
  if (Array.isArray(q?.options)) return q.options.map(opt => ({ value: opt.value, label: opt.label }));
  return typeof semanticFallbackOptions === 'function' ? semanticFallbackOptions() : [];
}

function freeTextQuestionMessage(q, key, fallbackKey) {
  const supplementalScreen = q?.nlp?.supplemental_screen || q?.supplemental_screen || {};
  const source = q?.[key] || q?.nlp?.ui?.[key] || supplementalScreen[key];
  return formMl(source, formMessage(fallbackKey));
}

function freeTextManualSelectionEnabled(q) {
  if (!q || isSupplementalQuestion(q) || !isFreeTextQuestion(q)) return false;
  if (q.manual_selection_enabled === false) return false;
  return freeTextOptionsForQuestion(q).length > 0;
}

function freeTextRangeLabel(q) {
  const minValues = freeTextMinValues(q);
  const maxValues = freeTextMaxValues(q);
  const unit = formMl(q?.unit_label || q?.nlp?.ui?.unit_label, ml(obj('items required', 'itens obrigatórios', 'ítems requeridos', 'éléments requis', 'erforderliche Elemente')));
  const countText = minValues === maxValues ? String(maxValues) : `${minValues}–${maxValues}`;
  return `<strong>${countText}</strong> ${unit}`;
}

function freeTextFinalAnswerValue(q, categories) {
  const clean = [...new Set((Array.isArray(categories) ? categories : []).filter(v => v !== null && v !== undefined).map(String))];
  return freeTextMaxValues(q) === 1 ? (clean[0] || '') : clean.slice(0, freeTextMaxValues(q));
}


function freeTextMinValues(q) {
  return Number(q?.min_values || q?.min_select || q?.nlp?.min_values || QT6_MIN_VALUES || 3);
}

function freeTextMaxValues(q) {
  return Number(q?.max_values || q?.max_select || q?.nlp?.max_values || QT6_MAX_VALUES || 5);
}

function freeTextIsFallbackScreen(q) {
  return Boolean(formEls.stage?.querySelector(`[data-qid="${q.id}"][data-fallback="true"]`));
}

function freeTextSelectedValues(q) {
  const answer = getAnswer(q.id);
  if (Array.isArray(answer)) return answer;
  return answer !== null && answer !== undefined && answer !== '' ? [answer] : [];
}

function freeTextIsValidSelection(q) {
  const count = freeTextSelectedValues(q).length;
  return count >= freeTextMinValues(q) && count <= freeTextMaxValues(q);
}

function isQuestionAnswered(q) {
  if (isOptionalQuestion(q)) return true;
  const answer = getAnswer(q.id);
  if (q.type === 'multi_choice') {
    const required = Number(q.max_select || 1);
    return Array.isArray(answer) && answer.length === required;
  }
  if (isFreeTextQuestion(q)) {
    if (freeTextIsFallbackScreen(q)) return freeTextIsValidSelection(q);
    if (Array.isArray(answer)) return freeTextIsValidSelection(q);
    if (freeTextUsesSlots(q)) return freeTextFilledSlotCount(q) >= freeTextMinValues(q);
    return getFreeTextAnswer(q.id).length >= Number(q.min_chars || QT6_MIN_INPUT_CHARS || 2);
  }
  return answer !== null && answer !== undefined && answer !== '';
}


function renderFreeTextQuestion(q, fallbackMatch) {
  const supplemental = isSupplementalQuestion(q);
  const raw = supplemental ? getSupplementalAnswer(q.id) : getFreeTextAnswer(q.id);
  const total = questions().length;
  const progressPct = total ? (currentStepNumber() / total) * 100 : 0;
  const minValues = freeTextMinValues(q);
  const maxValues = freeTextMaxValues(q);
  const useSlots = supplemental ? false : freeTextUsesSlots(q);
  const slotCount = freeTextSlotCount(q);
  const slots = getFreeTextSlots(q);
  const maxChars = Number(q.max_chars || QT6_MAX_INPUT_CHARS || 220);

  formEls.counter.textContent = `${t('question')} ${currentStepNumber()} ${t('of')} ${total}`;
  formEls.progress.style.width = `${progressPct}%`;
  formEls.prev.disabled = questionHistory.length === 0;
  formEls.next.textContent = isFinalQuestion(q) ? t('saveProfile') : t('next');

  const slotPlaceholders = q.slot_placeholders || {};
  const slotInputsHtml = useSlots ? `
      <div class="free-text-slots" data-slot-count="${slotCount}">
        ${Array.from({ length: slotCount }, (_, idx) => {
          const fallback = `${ml(obj('Item', 'Item', 'Ítem', 'Élément', 'Element'))} ${idx + 1}`;
          const phList = slotPlaceholders[getLang?.() || 'en'] || slotPlaceholders.en || [];
          const placeholder = phList[idx] || fallback;
          return `<input class="free-text-slot" type="text" id="${q.id}Slot${idx}" data-slot-index="${idx}" maxlength="80" placeholder="${freeTextEsc(placeholder)}" value="${freeTextEsc(slots[idx] || '')}" autocomplete="off">`;
        }).join('')}
      </div>
      <p class="question-help"><span id="${q.id}FilledCount">${freeTextFilledSlotCount(q)}</span>/${maxValues} ${ml(obj('filled', 'preenchidos', 'completados', 'remplis', 'ausgefüllt'))}</p>
    ` : `
      <textarea class="free-text-answer" id="${q.id}Input" maxlength="${maxChars}" placeholder="${ml(q.placeholder || {}) || ''}">${raw}</textarea>
      <p class="question-help"><span id="${q.id}CharCount">${raw.length}</span>/${maxChars}</p>
    `;

  formEls.stage.innerHTML = `
    <section class="question wizard-question ${supplemental ? 'supplemental-question' : ''}" data-qid="${q.id}" data-type="${q.type}" data-role="${supplemental ? 'supplemental' : 'computed'}" data-slots="${useSlots ? slotCount : 0}">
      <div class="question-kicker">${supplemental ? `${q.id} · ${formMessage('supplementalSkip')}` : q.id}</div>
      <h3>${ml(q.text)}</h3>
      ${supplemental ? '' : `<p class="question-help">${freeTextRangeLabel(q)}</p>`}
      ${slotInputsHtml}
      ${!supplemental && freeTextManualSelectionEnabled(q) ? `
        <div class="free-text-selection-assist">
          <button type="button" class="btn ghost free-text-selection-btn" id="${q.id}ManualSelection">
            ${freeTextQuestionMessage(q, 'manual_selection_label', 'manualSelectionLabel')}
          </button>
        </div>
      ` : ''}
    </section>
  `;

  const manualSelectionButton = document.getElementById(`${q.id}ManualSelection`);
  manualSelectionButton?.addEventListener('click', () => openFreeTextManualSelection(q));

  if (useSlots) {
    const slotInputs = [...formEls.stage.querySelectorAll('.free-text-slot')];
    const filledCounter = document.getElementById(`${q.id}FilledCount`);
    slotInputs.forEach(input => input.addEventListener('input', () => {
      const values = slotInputs.map(el => el.value);
      setFreeTextSlots(q, values);
      if (filledCounter) filledCounter.textContent = String(freeTextFilledSlotCount(q));
      formEls.status.textContent = '';
      updateNextState();
    }));
  } else {
    const input = document.getElementById(`${q.id}Input`);
    const counter = document.getElementById(`${q.id}CharCount`);
    input?.addEventListener('input', () => {
      if (supplemental) setSupplementalAnswer(q.id, input.value);
      else setFreeTextAnswer(q.id, input.value);
      if (counter) counter.textContent = (supplemental ? getSupplementalAnswer(q.id) : getFreeTextAnswer(q.id)).length;
      formEls.status.textContent = '';
      updateNextState();
    });
  }

  updateNextState();
}


function freeTextEsc(value) {
  return String(value || '').replace(/[<>&"]/g, ch => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[ch]));
}

function renderFreeTextFallback(q, match) {
  const options = freeTextOptionsForQuestion(q);

  const raw = getFreeTextAnswer(q.id);
  const minValues = freeTextMinValues(q);
  const maxValues = freeTextMaxValues(q);
  const locked = [...new Set((match?.lockedCategories || match?.categories || []).filter(Boolean))].slice(0, maxValues);
  const previous = freeTextSelectedValues(q);
  const inputType = maxValues === 1 ? 'radio' : 'checkbox';
  const selectedSet = new Set([...locked, ...previous].slice(0, maxValues));


  const optionsHtml = options.map((opt, idx) => {
    const value = String(opt.value);
    const rawValue = JSON.stringify(opt.value).replace(/'/g, '&apos;');
    const isLocked = locked.includes(value);
    const isChecked = selectedSet.has(value);
    return `
      <label class="option-card ${isLocked ? 'locked-option' : ''}" data-option-index="${idx}" data-locked="${isLocked ? 'true' : 'false'}">
        <input type="${inputType}" name="${q.id}_fallback" value="${value.replace(/"/g, '&quot;')}" data-raw='${rawValue}' ${isChecked ? 'checked' : ''} ${isLocked ? 'disabled' : ''} autocomplete="off">
        <span class="option-marker"></span>
        <span class="option-text">${ml(opt.label)}</span>
        ${isLocked ? `<span class="locked-badge">${formMessage('qt6DetectedLocked')}</span>` : ''}
      </label>
    `;
  }).join('');

  formEls.stage.innerHTML = `
    <section class="question wizard-question qt6-fallback-screen" data-qid="${q.id}" data-type="${q.type}" data-fallback="true" data-min="${minValues}" data-max="${maxValues}">
      <div class="question-kicker">${q.id}</div>
      <h3>${ml(q.text)}</h3>
      ${raw ? `<div class="qt6-raw-preview">“${freeTextEsc(raw)}”</div>` : ''}
      <div class="qt6-selection-status">
        <strong>${formMessage('qt6SelectionCounter')}:</strong>
        <span id="${q.id}SelectedCount">0</span>/${maxValues}
        <span id="${q.id}NeedMore" class="qt6-need-more"></span>
      </div>
      <div class="options-scroll qt6-fallback-options">
        <div class="options options-compact">${optionsHtml}</div>
      </div>
    </section>
  `;

  function readFallbackSelection() {
    const inputs = [...formEls.stage.querySelectorAll(`input[name="${q.id}_fallback"]`)];
    const selected = inputs.filter(input => input.checked).map(input => parseRaw(input.dataset.raw));
    const uniqueSelected = [...new Set(selected.map(String))].slice(0, maxValues);
    setAnswer(q.id, freeTextFinalAnswerValue(q, uniqueSelected));
    wizardAnswers[`${q.id}_score`] = match?.score || 0;
    wizardAnswers[`${q.id}_manual`] = true;
    wizardAnswers[`${q.id}_validated_text`] = raw;
    wizardAnswers[`${q.id}_match`] = match || null;
    updateFallbackCounter();
    updateNextState();
  }

  function updateFallbackCounter() {
    const count = freeTextSelectedValues(q).length;
    const counter = document.getElementById(`${q.id}SelectedCount`);
    const needMore = document.getElementById(`${q.id}NeedMore`);
    if (counter) counter.textContent = String(count);
    if (needMore) {
      const missing = Math.max(0, minValues - count);
      needMore.textContent = missing
        ? ` · ${missing} ${ml(obj('more needed', 'ainda necessários', 'más necesarios', 'encore nécessaires', 'weitere erforderlich'))}`
        : '';
    }
  }

  formEls.stage.querySelector('.options')?.addEventListener('change', (event) => {
    const target = event.target;
    if (!target || target.disabled) return;
    const inputs = [...formEls.stage.querySelectorAll(`input[name="${q.id}_fallback"]`)];
    const checked = inputs.filter(input => input.checked);
    if (checked.length > maxValues) {
      target.checked = false;
      formEls.status.textContent = `${formMessage('qt6SelectionCounter')}: ${maxValues}/${maxValues}`;
    } else {
      formEls.status.textContent = '';
    }
    readFallbackSelection();
  });


  readFallbackSelection();
}

function freeTextSupplementalFallbackMatch(q, raw, source = {}) {
  const clean = String(raw || '').trim();
  let keywords = [];
  try {
    if (typeof semanticNormalizeText === 'function' && typeof semanticExtractKeywords === 'function') {
      keywords = semanticExtractKeywords(semanticNormalizeText(clean));
    }
  } catch (_) {}

  return {
    category: null,
    categories: [],
    lockedCategories: [],
    score: 0,
    confidence: 0,
    threshold: Number(q?.nlp?.association_threshold || QT6_VALUE_MATCH_THRESHOLD || 0.6),
    strongLockThreshold: Number(q?.nlp?.strong_lock_threshold || QT6_VALUE_STRONG_LOCK_THRESHOLD || 0.72),
    minValues: freeTextMinValues(q),
    maxValues: freeTextMaxValues(q),
    requiresFallback: true,
    invalid: false,
    reason: 'manual_selection_required',
    messageKey: null,
    keywords,
    contextualTerms: [],
    correctedTerms: [],
    candidates: [],
    sourceReason: source.reason || source.invalid_reason || source.messageKey || null
  };
}

function freeTextShouldOpenSupplementalFromInvalid(result) {
  const reason = String(result?.reason || result?.invalid_reason || '').toLowerCase();
  const messageKey = String(result?.messageKey || '').toLowerCase();

  // Hard moderation still blocks. Semantic uncertainty never blocks.
  if (reason.includes('blocked') || reason.includes('offensive') || reason.includes('abusive') || reason.includes('depreciative')) return false;
  if (messageKey === 'qt6invalidcontent') return false;
  if (reason === 'too_long') return false;

  return true;
}

function freeTextOpenSupplementalScreen(q, raw, match) {
  renderFreeTextFallback(q, match || freeTextSupplementalFallbackMatch(q, raw));
  formEls.status.textContent = '';
  window.scrollTo({ top: 0, behavior: 'smooth' });
  return { ok: false, needsFallback: true };
}

function openFreeTextManualSelection(q) {
  if (!freeTextManualSelectionEnabled(q)) return;

  const raw = getFreeTextAnswer(q.id);
  if (!raw) {
    freeTextOpenSupplementalScreen(q, raw, freeTextSupplementalFallbackMatch(q, raw));
    updateNextState();
    return;
  }

  const validation = typeof validateFreeTextInput === 'function'
    ? validateFreeTextInput(raw, { maxChars: q.max_chars || QT6_MAX_INPUT_CHARS })
    : { valid: Boolean(raw), sanitized: raw };

  if (!validation.valid) {
    if (!freeTextShouldOpenSupplementalFromInvalid(validation)) {
      formEls.status.textContent = formMessage(validation.messageKey || 'qt6InvalidContent');
      return;
    }
    freeTextOpenSupplementalScreen(q, raw, freeTextSupplementalFallbackMatch(q, validation.sanitized || raw, validation));
    updateNextState();
    return;
  }

  const localMatch = typeof calculateSemanticMatch === 'function'
    ? calculateSemanticMatch(validation.sanitized, {
        threshold: q.nlp?.association_threshold || QT6_VALUE_MATCH_THRESHOLD,
        strongLockThreshold: q.nlp?.strong_lock_threshold || QT6_VALUE_STRONG_LOCK_THRESHOLD,
        invalidScopeThreshold: q.nlp?.invalid_scope_threshold || QT6_VALUE_INVALID_SCOPE_THRESHOLD,
        minValues: freeTextMinValues(q),
        maxValues: freeTextMaxValues(q),
        maxChars: q.max_chars || QT6_MAX_INPUT_CHARS,
        categoryMap: q.nlp?.categories || null,
        questionId: q.id,
        questionText: ml(q.text),
        questionMode: q.nlp?.mode || 'semantic_association'
      })
    : freeTextSupplementalFallbackMatch(q, validation.sanitized);

  if (localMatch?.invalid && !freeTextShouldOpenSupplementalFromInvalid(localMatch)) {
    formEls.status.textContent = formMessage(localMatch.messageKey || 'qt6InvalidContent');
    return;
  }

  freeTextOpenSupplementalScreen(
    q,
    raw,
    localMatch?.invalid ? freeTextSupplementalFallbackMatch(q, validation.sanitized || raw, localMatch) : localMatch
  );
  updateNextState();
}

async function resolveFreeTextQuestion(q) {
  if (isSupplementalQuestion(q)) {
    setSupplementalAnswer(q.id, getSupplementalAnswer(q.id));
    return { ok: true, needsFallback: false };
  }
  const raw = getFreeTextAnswer(q.id);
  const existing = getAnswer(q.id);
  const alreadyValidated = freeTextIsValidSelection(q)
    && wizardAnswers[`${q.id}_validated_text`] === raw;
  if (alreadyValidated) return { ok: true, needsFallback: false };

  const validation = typeof validateFreeTextInput === 'function'
    ? validateFreeTextInput(raw, { maxChars: q.max_chars || QT6_MAX_INPUT_CHARS })
    : { valid: Boolean(raw), sanitized: raw };

  if (!validation.valid) {
    if (freeTextShouldOpenSupplementalFromInvalid(validation)) {
      return freeTextOpenSupplementalScreen(q, raw, freeTextSupplementalFallbackMatch(q, validation.sanitized || raw, validation));
    }
    formEls.status.textContent = formMessage(validation.messageKey || 'qt6InvalidContent');
    return { ok: false, needsFallback: false };
  }

  const localOptions = {
    threshold: q.nlp?.association_threshold || QT6_VALUE_MATCH_THRESHOLD,
    strongLockThreshold: q.nlp?.strong_lock_threshold || QT6_VALUE_STRONG_LOCK_THRESHOLD,
    invalidScopeThreshold: q.nlp?.invalid_scope_threshold || QT6_VALUE_INVALID_SCOPE_THRESHOLD,
    minValues: freeTextMinValues(q),
    maxValues: freeTextMaxValues(q),
    maxChars: q.max_chars || QT6_MAX_INPUT_CHARS,
    categoryMap: q.nlp?.categories || null,
    questionId: q.id,
    questionText: ml(q.text),
    questionMode: q.nlp?.mode || 'semantic_association'
  };

  const localMatch = typeof calculateSemanticMatch === 'function'
    ? calculateSemanticMatch(validation.sanitized, localOptions)
    : { categories: [validation.sanitized], category: validation.sanitized, score: 100, requiresFallback: false };

  if (localMatch.invalid) {
    if (freeTextShouldOpenSupplementalFromInvalid(localMatch)) {
      return freeTextOpenSupplementalScreen(q, raw, freeTextSupplementalFallbackMatch(q, validation.sanitized || raw, localMatch));
    }
    formEls.status.textContent = formMessage(localMatch.messageKey || 'qt6InvalidContent');
    return { ok: false, needsFallback: false };
  }

  let match = localMatch;
  const shouldAskAI = typeof analyzeFreeTextInputWithAI === 'function'
    && typeof shouldUseIAResolver === 'function'
    && shouldUseIAResolver(localMatch, q, { aiReviewBelowScore: q.nlp?.ai_review_below_score || 82 });

  if (shouldAskAI) {
    formEls.status.textContent = formMessage('qt6AIReviewing');
    formEls.next.disabled = true;

    const aiResult = await analyzeFreeTextInputWithAI(validation.sanitized, localMatch, {
      threshold: q.nlp?.association_threshold || QT6_VALUE_MATCH_THRESHOLD,
      aiThreshold: q.nlp?.ai_association_threshold || q.nlp?.association_threshold || QT6_VALUE_MATCH_THRESHOLD,
      strongLockThreshold: q.nlp?.strong_lock_threshold || QT6_VALUE_STRONG_LOCK_THRESHOLD,
      aiLockThreshold: q.nlp?.ai_lock_threshold || q.nlp?.strong_lock_threshold || QT6_VALUE_STRONG_LOCK_THRESHOLD,
      minValues: freeTextMinValues(q),
      maxValues: freeTextMaxValues(q),
      maxChars: q.max_chars || QT6_MAX_INPUT_CHARS,
      categoryMap: q.nlp?.categories || null,
      questionId: q.id,
      questionText: ml(q.text),
      questionMode: q.nlp?.mode || 'semantic_association'
    });

    if (aiResult?.ok && aiResult.match) {
      match = aiResult.match;
      wizardAnswers[`${q.id}_ai_match`] = aiResult.raw || aiResult.match.aiAssessment || null;
    } else if (aiResult?.reason === 'missing_api_key') {
      // No key: keep deterministic behavior and let the manual fallback complete the answer.
      match = localMatch;
    } else {
      // If AI is unavailable, continue with the deterministic result and open
      // the supplemental values screen whenever completion is needed.
      match = localMatch;
    }
  }

  if (match.invalid) {
    if (freeTextShouldOpenSupplementalFromInvalid(match)) {
      return freeTextOpenSupplementalScreen(q, raw, freeTextSupplementalFallbackMatch(q, validation.sanitized || raw, match));
    }
    formEls.status.textContent = formMessage(match.messageKey || 'qt6InvalidContent');
    return { ok: false, needsFallback: false };
  }

  if (match.requiresFallback || !Array.isArray(match.categories) || match.categories.length < freeTextMinValues(q)) {
    return freeTextOpenSupplementalScreen(q, raw, match);
  }

  const categories = [...new Set(match.categories)].slice(0, freeTextMaxValues(q));
  setAnswer(q.id, freeTextFinalAnswerValue(q, categories));
  wizardAnswers[`${q.id}_text`] = raw;
  wizardAnswers[`${q.id}_score`] = match.score;
  wizardAnswers[`${q.id}_manual`] = false;
  wizardAnswers[`${q.id}_validated_text`] = raw;
  wizardAnswers[`${q.id}_match`] = match;
  return { ok: true, needsFallback: false };
}

function renderCurrentQuestion() {
  const q = currentQuestion();
  if (!q) return;

  formEls.status.textContent = '';

  if (isFreeTextQuestion(q)) {
    renderFreeTextQuestion(q);
    return;
  }

  const total = questions().length;
  const progressPct = total ? (currentStepNumber() / total) * 100 : 0;
  formEls.counter.textContent = `${t('question')} ${currentStepNumber()} ${t('of')} ${total}`;
  formEls.progress.style.width = `${progressPct}%`;
  formEls.prev.disabled = questionHistory.length === 0;
  formEls.next.textContent = isFinalQuestion(q) ? t('saveProfile') : t('next');

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
  const optional = isOptionalQuestion(q);
  const canOpenManualSelection = freeTextManualSelectionEnabled(q) && !freeTextIsFallbackScreen(q);
  formEls.next.disabled = !(answered || canOpenManualSelection);
  if (formEls.skip) {
    formEls.skip.hidden = !(optional && q?.skippable === true);
    formEls.skip.textContent = formMessage('supplementalSkip');
  }
  formEls.answerStatus.textContent = optional
    ? formMessage('supplementalOptionalHelp')
    : (answered ? t('answerSaved') : t('answerToContinue'));
  formEls.answerStatus.classList.toggle('ready', answered || optional || canOpenManualSelection);
}

function advanceOrSubmitCurrent(q = currentQuestion()) {
  const nextIndex = getNextQuestionIndex(q);
  if (nextIndex >= 0 && nextIndex < questions().length) {
    questionHistory.push(currentQuestionIndex);
    currentQuestionIndex = nextIndex;
    renderCurrentQuestion();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }
  return submitProfile();
}

function skipCurrentQuestion() {
  const q = currentQuestion();
  if (!q || q.skippable !== true) return;
  setSupplementalAnswer(q.id, '');
  formEls.status.textContent = '';
  return advanceOrSubmitCurrent(q);
}

function goPrevious() {
  if (!questionHistory.length) return;
  currentQuestionIndex = questionHistory.pop();
  renderCurrentQuestion();
}

async function goNextOrSubmit() {
  const q = currentQuestion();

  if (isFreeTextQuestion(q)) {
    const resolved = await resolveFreeTextQuestion(q);
    if (!resolved.ok) {
      updateNextState();
      return;
    }
  }

  if (!isQuestionAnswered(q)) {
    formEls.status.textContent = t('required');
    updateNextState();
    return;
  }

  await advanceOrSubmitCurrent(q);
}

function complete(answers) {
  return routedQuestions().every(q => {
    if (isOptionalQuestion(q)) return true;
    if (q.type === 'multi_choice') {
      return Array.isArray(answers[q.id]) && answers[q.id].length === Number(q.max_select || 1);
    }
    if (isFreeTextQuestion(q)) {
      const answer = answers[q.id];
      const minValues = freeTextMinValues(q);
      const maxValues = freeTextMaxValues(q);
      if (maxValues === 1) return answer !== null && answer !== undefined && String(answer).trim() !== '';
      return Array.isArray(answer) && answer.length >= minValues && answer.length <= maxValues;
    }
    return answers[q.id] !== null && answers[q.id] !== undefined && answers[q.id] !== '';
  });
}

function ensureOptionalAnswers(answers) {
  routedQuestions().forEach(q => {
    if (isOptionalQuestion(q) && answers[q.id] === undefined) {
      answers[q.id] = '';
      if (q.store_raw_answer_as) answers[q.store_raw_answer_as] = '';
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
  if (formEls.skip) formEls.skip.disabled = true;

  const profile = buildPhase1Profile({
    username: user.username,
    display_name: user.display_name,
    answers: wizardAnswers,
    questionDefinitions: questions(),
    language: getLang(),
    source: 'user_form'
  });

  try {
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
    if (formEls.skip) formEls.skip.disabled = false;
  }
}
