function obj(en, pt, es, fr, de) {
  return { en, pt, es, fr, de };
}
const QT4_LABELS = {
  11: obj(
    "GO – Proactive",
    "GO – Proativo",
    "GO – Proactivo",
    "GO – Proactif",
    "GO – Proaktiv",
  ),
  22: obj(
    "WAIT – Reflective",
    "WAIT – Reflexivo",
    "WAIT – Reflexivo",
    "WAIT – Réfléchi",
    "WAIT – Reflektierend",
  ),
  33: obj(
    "WAIT and GO – Adaptive",
    "WAIT and GO – Adaptativo",
    "WAIT and GO – Adaptativo",
    "WAIT and GO – Adaptatif",
    "WAIT and GO – Adaptiv",
  ),
  44: obj(
    "WAIT or GO – Balanced",
    "WAIT or GO – Equilibrado",
    "WAIT or GO – Equilibrado",
    "WAIT or GO – Équilibré",
    "WAIT or GO – Ausgewogen",
  ),
};
const QT5_LABELS = {
  11: obj("Offensive", "Ofensivo", "Ofensivo", "Offensif", "Offensiv"),
  22: obj("Defensive", "Defensivo", "Defensivo", "Défensif", "Defensiv"),
  33: obj(
    "Counter-Offensive",
    "Contraofensivo",
    "Contraofensivo",
    "Contre-offensif",
    "Gegenoffensiv",
  ),
  44: obj("All-Rounder", "Versátil", "Versátil", "Polyvalent", "Allrounder"),
};
const WORLDVIEW_LABELS = {
  1: obj(
    "Materialistic",
    "Materialista",
    "Materialista",
    "Matérialiste",
    "Materialistisch",
  ),
  2: obj("Warrior", "Guerreiro", "Guerrero", "Guerrier", "Krieger"),
  3: obj(
    "Survivor",
    "Sobrevivente",
    "Sobreviviente",
    "Survivant",
    "Überlebender",
  ),
  4: obj("Spiritual", "Espiritual", "Espiritual", "Spirituel", "Spirituell"),
  5: obj("Sensual", "Sensual", "Sensual", "Sensuel", "Sinnlich"),
  6: obj("Erotic", "Erótico", "Erótico", "Érotique", "Erotisch"),
  7: obj("Pragmatic", "Pragmático", "Pragmático", "Pragmatique", "Pragmatisch"),
  8: obj("Holistic", "Holístico", "Holístico", "Holistique", "Ganzheitlich"),
  9: obj("Idealistic", "Idealista", "Idealista", "Idéaliste", "Idealistisch"),
  10: obj("Aesthetic", "Estético", "Estético", "Esthétique", "Ästhetisch"),
  11: obj("Skeptical", "Cético", "Escéptico", "Sceptique", "Skeptisch"),
  12: obj("Humanistic", "Humanista", "Humanista", "Humaniste", "Humanistisch"),
  13: obj(
    "Anthropological",
    "Antropológico",
    "Antropológico",
    "Anthropologique",
    "Anthropologisch",
  ),
  14: obj("Rational", "Racional", "Racional", "Rationnel", "Rational"),
  15: obj("Romantic", "Romântico", "Romántico", "Romantique", "Romantisch"),
  16: obj("Utopian", "Utópico", "Utópico", "Utopiste", "Utopisch"),
  17: obj("Realistic", "Realista", "Realista", "Réaliste", "Realistisch"),
  18: obj(
    "Egocentric",
    "Egocêntrico",
    "Egocéntrico",
    "Égocentrique",
    "Egozentrisch",
  ),
  19: obj("Altruistic", "Altruísta", "Altruista", "Altruiste", "Altruistisch"),
  20: obj(
    "Forward-Looking",
    "Visionário",
    "Visionario",
    "Visionnaire",
    "Visionär",
  ),
  21: obj("Empathetic", "Empático", "Empático", "Empathique", "Empathisch"),
  22: obj("Futuristic", "Futurista", "Futurista", "Futuriste", "Futuristisch"),
};
const VALUE_LABELS = {
  Honesty: obj(
    "Honesty",
    "Honestidade",
    "Honestidad",
    "Honnêteté",
    "Ehrlichkeit",
  ),
  Respect: obj("Respect", "Respeito", "Respeto", "Respect", "Respekt"),
  Empathy: obj("Empathy", "Empatia", "Empatía", "Empathie", "Empathie"),
  Responsibility: obj(
    "Responsibility",
    "Responsabilidade",
    "Responsabilidad",
    "Responsabilité",
    "Verantwortung",
  ),
  Perseverance: obj(
    "Perseverance",
    "Perseverança",
    "Perseverancia",
    "Persévérance",
    "Ausdauer",
  ),
  Courage: obj("Courage", "Coragem", "Coraje", "Courage", "Mut"),
  Gratitude: obj(
    "Gratitude",
    "Gratidão",
    "Gratitud",
    "Gratitude",
    "Dankbarkeit",
  ),
  Autonomy: obj("Autonomy", "Autonomia", "Autonomía", "Autonomie", "Autonomie"),
  Compassion: obj(
    "Compassion",
    "Compaixão",
    "Compasión",
    "Compassion",
    "Mitgefühl",
  ),
  Integrity: obj(
    "Integrity",
    "Integridade",
    "Integridad",
    "Intégrité",
    "Integrität",
  ),
  Solidarity: obj(
    "Solidarity",
    "Solidariedade",
    "Solidaridad",
    "Solidarité",
    "Solidarität",
  ),
  Justice: obj("Justice", "Justiça", "Justicia", "Justice", "Gerechtigkeit"),
  Freedom: obj("Freedom", "Liberdade", "Libertad", "Liberté", "Freiheit"),
  Tolerance: obj(
    "Tolerance",
    "Tolerância",
    "Tolerancia",
    "Tolérance",
    "Toleranz",
  ),
  Joy: obj("Joy", "Alegria", "Alegría", "Joie", "Freude"),
  Discipline: obj(
    "Discipline",
    "Disciplina",
    "Disciplina",
    "Discipline",
    "Disziplin",
  ),
  Trust: obj("Trust", "Confiança", "Confianza", "Confiance", "Vertrauen"),
  Humility: obj("Humility", "Humildade", "Humildad", "Humilité", "Demut"),
  Wisdom: obj("Wisdom", "Sabedoria", "Sabiduría", "Sagesse", "Weisheit"),
  Transparency: obj(
    "Transparency",
    "Transparência",
    "Transparencia",
    "Transparence",
    "Transparenz",
  ),
  Creativity: obj(
    "Creativity",
    "Criatividade",
    "Creatividad",
    "Créativité",
    "Kreativität",
  ),
  Resilience: obj(
    "Resilience",
    "Resiliência",
    "Resiliencia",
    "Résilience",
    "Resilienz",
  ),
};
const PILLAR_LABELS = {
  Work: obj("Work", "Trabalho", "Trabajo", "Travail", "Arbeit"),
  Love: obj("Love", "Amor", "Amor", "Amour", "Liebe"),
  Family: obj("Family", "Família", "Familia", "Famille", "Familie"),
  Friendships: obj(
    "Friendships",
    "Amizades",
    "Amistades",
    "Amitiés",
    "Freundschaften",
  ),
  Health: obj("Health", "Saúde", "Salud", "Santé", "Gesundheit"),
  Money: obj("Money", "Dinheiro", "Dinero", "Argent", "Geld"),
  Purpose: obj(
    "Purpose",
    "Propósito",
    "Propósito",
    "Raison d’être",
    "Bestimmung",
  ),
  SocialContribution: obj(
    "Social Contribution",
    "Contribuição Social",
    "Contribución Social",
    "Contribution Sociale",
    "Sozialer Beitrag",
  ),
  SelfKnowledge: obj(
    "Self-Knowledge",
    "Autoconhecimento",
    "Autoconocimiento",
    "Connaissance de soi",
    "Selbsterkenntnis",
  ),
  Recognition: obj(
    "Recognition",
    "Reconhecimento",
    "Reconocimiento",
    "Reconnaissance",
    "Anerkennung",
  ),
  Sustainability: obj(
    "Sustainability",
    "Sustentabilidade",
    "Sostenibilidad",
    "Durabilité",
    "Nachhaltigkeit",
  ),
  Entrepreneurship: obj(
    "Entrepreneurship",
    "Empreendedorismo",
    "Emprendimiento",
    "Entrepreneuriat",
    "Unternehmertum",
  ),
  Volunteering: obj(
    "Volunteering",
    "Voluntariado",
    "Voluntariado",
    "Bénévolat",
    "Ehrenamt",
  ),
  Ethics: obj("Ethics", "Ética", "Ética", "Éthique", "Ethik"),
  Spirituality: obj(
    "Spirituality",
    "Espiritualidade",
    "Espiritualidad",
    "Spiritualité",
    "Spiritualität",
  ),
  Leisure: obj("Leisure", "Lazer", "Ocio", "Loisirs", "Freizeit"),
  Education: obj("Education", "Educação", "Educación", "Éducation", "Bildung"),
  Resilience: obj(
    "Resilience",
    "Resiliência",
    "Resiliencia",
    "Résilience",
    "Resilienz",
  ),
  Dreams: obj("Dreams", "Sonhos", "Sueños", "Rêves", "Träume"),
  Hobbies: obj("Hobbies", "Hobbies", "Pasatiempos", "Hobbies", "Hobbys"),
};
function pillarLabel(key) {
  return (
    PILLAR_LABELS[String(key).replace(/[\s-]+/g, "")] ||
    obj(key, key, key, key, key)
  );
}
function valueLabel(key) {
  return VALUE_LABELS[key] || obj(key, key, key, key, key);
}
function pct(n) {
  return Math.max(0, Math.min(100, Math.round(n)));
}
function decisionActivation(code) {
  return (
    { 11: "go", 22: "wait", 33: "adaptive", 44: "balanced" }[Number(code)] ||
    "balanced"
  );
}
function combineML(a, b) {
  return {
    en: `${a.en} / ${b.en}`,
    pt: `${a.pt} / ${b.pt}`,
    es: `${a.es} / ${b.es}`,
    fr: `${a.fr} / ${b.fr}`,
    de: `${a.de} / ${b.de}`,
  };
}
function actionLabelFromCodes(q4, q5) {
  return combineML(
    QT4_LABELS[q4] || QT4_LABELS[44],
    QT5_LABELS[q5] || QT5_LABELS[44],
  );
}
function decisionDescription(q4, q5) {
  const act = decisionActivation(q4);
  const desired = Number(q5);
  if (act === "go")
    return obj(
      "This result reflects your current state, demonstrating a natural tendency towards movement, initiative, and taking action at the right time. Your pace of decision-making tends to bring energy to daily interactions, ensuring the fluidity and continuous advancement of situations.",
      "Este resultado reflete seu estado atual, demonstrando uma tendência natural ao movimento, à iniciativa e à ação no momento certo. Seu ritmo de decisão tende a levar energia às interações diárias, garantindo a fluidez e o avanço contínuo das situações.",
      "Este resultado refleja tu estado actual, demostrando una tendencia natural hacia el movimiento, la iniciativa y la acción en el momento adecuado. Tu ritmo de decisión tiende a aportar energía a las interacciones diarias, garantizando la fluidez y el avance continuo de las situaciones.",
      "Ce résultat reflète votre état actuel, démontrant une tendance naturelle au mouvement, à l'initiative et à l'action au bon moment. Votre rythme de décision a tendance à apporter de l'énergie aux interactions quotidiennes, garantissant la fluidité et l'avancement continu des situations.",
      "Dieses Ergebnis spiegelt Ihren aktuellen Zustand wider und zeigt eine natürliche Tendenz zu Bewegung, Initiative und Handeln im richtigen Moment. Ihr Entscheidungstempo bringt tendenziell Energie in alltägliche Interaktionen und sorgt für den Fluss und das kontinuierliche Voranschreiten von Situationen.",
    );
  if (act === "wait")
    return obj(
      "This result signals a more reflective pace, with space to observe, perceive the right moment, and act with care. In daily interactions, this can bring stability, active listening, and greater clarity on when to move forward. ",
      "Este resultado sinaliza um ritmo mais reflexivo, com espaço para observar, perceber o momento certo e agir com cuidado. Nas interações diárias, isso pode trazer estabilidade, escuta e mais clareza sobre quando avançar.",
      "Este resultado señala un ritmo más reflexivo, con espacio para observar, percibir el momento adecuado y actuar con cuidado. En las interacciones diarias, esto puede aportar estabilidad, escucha y mayor claridad sobre cuándo avanzar.",
      "Ce résultat signale un rythme plus réfléchi, avec de l'espace pour observer, percevoir le bon moment et agir avec soin. Dans les interactions quotidiennes, cela peut apporter de la stabilité, de l'écoute et une plus grande clarté sur le moment d'avancer.",
      "Dieses Ergebnis signalisiert ein eher nachdenkliches Tempo mit Raum zum Beobachten, Wahrnehmen des richtigen Moments und sorgfältigem Handeln. In alltäglichen Interaktionen kann dies Stabilität, Zuhören und mehr Klarheit darüber bringen, wann man voranschreiten sollte.",
    );
  if (act === "adaptive")
    return obj(
      "This result translates your current state, showing a flexible pace, capable of alternating between pause and action according to the moment. In everyday life, this can support more sensitive choices, because movement becomes guided by the context, not just by impulse.",
      "Este resultado traduz o seu estado atual, mostrando um ritmo flexível, capaz de alternar pausa e ação conforme o momento. No dia a dia, isso pode sustentar escolhas mais sensíveis, porque o movimento passa a ser guiado pelo contexto, não apenas pelo impulso.",
      "Este resultado traduce tu estado actual, mostrando un ritmo flexible, capaz de alternar entre pausa y acción según el momento. En el día a día, esto puede sustentar elecciones más sensibles, porque el movimiento pasa a ser guiado por el contexto, no solo por el impulso.",
      "Ce résultat traduit votre état actuel, montrant un rythme flexible, capable d'alterner entre pause et action selon le moment. Au quotidien, cela peut soutenir des choix plus sensibles, car le mouvement est guidé par le contexte, et non plus seulement par l'impulsion.",
      "Dieses Ergebnis übersetzt Ihren aktuellen Zustand und zeigt ein flexibles Tempo, das je nach Moment zwischen Pause und Aktion wechseln kann. Im Alltag kann dies sensiblere Entscheidungen unterstützen, da die Bewegung vom Kontext geleitet wird und nicht nur vom Impuls.",

    );
  return obj(
    "Your profile indicates a search for balance between action and reflection. In daily interactions, this pace can help you avoid extremes, listen to the moment, and move with greater presence.",
    "Seu perfil indica uma busca por equilíbrio entre ação e reflexão. Nas interações diárias, esse ritmo pode ajudar você a evitar extremos, escutar o momento e se mover com mais presença.",
    "Tu perfil indica una búsqueda de equilibrio entre acción y reflexión. En las interacciones diarias, este ritmo puede ayudarte a evitar los extremos, escuchar el momento y moverte con mayor presencia.",
    "Votre profil indique une recherche d'équilibre entre action et réflexion. Dans les interactions quotidiennes, ce rythme peut vous aider à éviter les extrêmes, à être à l'écoute du moment et à bouger avec plus de présence.",
    "Ihr Profil weist auf die Suche nach einem Gleichgewicht zwischen Aktion und Reflexion hin. In alltäglichen Interaktionen kann dieses Tempo Ihnen helfen, Extreme zu vermeiden, auf den Moment zu hören und sich mit mehr Präsenz zu bewegen.",
  );
}
function worldviewDescription(code) {
  const label =
    WORLDVIEW_LABELS[Number(code)] ||
    obj(
      "Worldview",
      "Visão de mundo",
      "Visión del mundo",
      "Vision du monde",
      "Weltanschauung",
    );
  return obj(
    `Your worldview is organized, at this moment, around ${label.en}. This perspective gently shapes how you make sense of experiences, choose priorities, and recognize what feels coherent in your current journey.`,
    `Sua visão de mundo se organiza, neste momento, em torno de ${label.pt}. Essa perspectiva molda com delicadeza a forma como você dá sentido às experiências, escolhe prioridades e reconhece o que parece coerente na sua jornada atual.`,
    `Tu visión del mundo se organiza, en este momento, en torno a ${label.es}. Esta perspectiva moldea con delicadeza la forma en que das sentido a las experiencias, eliges prioridades y reconoces lo que parece coherente en tu viaje actual.`,
    `Votre vision du monde s'organise, en ce moment, autour de ${label.fr}. Cette perspective façonne avec délicatesse la façon dont vous donnez du sens aux expériences, choisissez vos priorités et reconnaissez ce qui semble cohérent dans votre parcours actuel.`,
    `Ihre Weltanschauung organisiert sich derzeit um ${label.de}. Diese Perspektive prägt behutsam die Art und Weise, wie Sie Erfahrungen einen Sinn geben, Prioritäten setzen und erkennen, was auf Ihrer aktuellen Reise stimmig erscheint.`,
  );
}
function phase1AIFallbackMessage() {
  if (typeof aiFallbackError === 'function') return aiFallbackError();
  return typeof t === 'function' ? t('ai_fallback_error') : 'ai_fallback_error';
}

function phase1AIFallbackML() {
  const source = typeof I18N === 'object' && I18N ? I18N : null;
  const value = lang => source?.[lang]?.ai_fallback_error || 'ai_fallback_error';
  return obj(value('en'), value('pt'), value('es'), value('fr'), value('de'));
}

function fallbackDetailsProfile(key, profile) {
  const message = phase1AIFallbackMessage();
  return {
    title: message,
    description: message,
    strengths: [],
    challenges: [],
    _error: true,
    error: true,
    message,
    _source: 'ai_fallback_error',
    _note: ''
  };
}

function buildPhase1Profile({
  username,
  display_name,
  answers,
  language = "en",
  source = "user_form",
}) {
  const values = (Array.isArray(answers.Qt6) ? answers.Qt6 : []).slice(0, 5);
  const pillars = (Array.isArray(answers.Qt7) ? answers.Qt7 : []).slice(0, 5);
  const worldview = Number(answers.Qt8);
  const decisionLabel = actionLabelFromCodes(
    Number(answers.Qt4),
    Number(answers.Qt5),
  );
  const worldLabel =
    WORLDVIEW_LABELS[worldview] ||
    obj(
      "Worldview",
      "Visão de mundo",
      "Visión del mundo",
      "Vision du monde",
      "Weltanschauung",
    );
  const overview = obj(
    "Welcome to your Profile Snapshot. This result gathers four signals of your current journey: your decision-making pace, the values that illuminate your path, the life pillars that sustain you today, and the worldview through which you make sense of your experiences. Read this analysis as an invitation to observe patterns with curiosity, not as a fixed definition of who you are.",
    "Boas-vindas ao seu Profile Snapshot. Este resultado reúne quatro sinais da sua jornada atual: seu ritmo de decisão, os valores que iluminam o seu caminho, os pilares de vida que sustentam você hoje e a visão de mundo pela qual você dá sentido às suas experiências. Leia esta análise como um convite para observar padrões com curiosidade, não como uma definição fixa de quem você é.",
    "Te damos la bienvenida a tu Profile Snapshot. Este resultado reúne cuatro señales de tu viaje actual: tu ritmo de decisión, los valores que iluminan tu camino, los pilares de vida que te sostienen hoy y la visión del mundo a través de la cual das sentido a tus experiencias. Lee este análisis como una invitación a observar patrones con curiosidad, no como una definición fija de quién eres.",
    "Bienvenue dans votre Profile Snapshot. Ce résultat rassemble quatre signaux de votre parcours actuel : votre rythme de décision, les valeurs qui éclairent votre chemin, les piliers de vie qui vous soutiennent aujourd'hui, et la vision du monde par laquelle vous donnez du sens à vos expériences. Lisez cette analyse comme une invitation à observer des schémas avec curiosité, et non comme une définition figée de qui vous êtes.",
    "Willkommen bei Ihrem Profile Snapshot. Dieses Ergebnis fasst vier Signale Ihrer aktuellen Reise zusammen: Ihr Entscheidungstempo, die Werte, die Ihren Weg erhellen, die Lebenspfeiler, die Sie heute tragen, und die Weltanschauung, durch die Sie Ihren Erfahrungen einen Sinn geben. Lesen Sie diese Analyse als Einladung, Muster mit Neugier zu beobachten, nicht als feste Definition dessen, wer Sie sind.",
  );
  const cards = [
    {
      key: "decision",
      color: "blue",
      icon: "↗",
      title: obj(
        "Decision Style",
        "Decision Style",
        "Decision Style",
        "Decision Style",
        "Decision Style",
      ),
      metric_label: obj("Profile", "Perfil", "Perfil", "Profil", "Profil"),
      metric_value: decisionLabel,
      bar: 70,
      description: decisionDescription(
        Number(answers.Qt4),
        Number(answers.Qt5),
      ),
      tags: [QT4_LABELS[Number(answers.Qt4)], QT5_LABELS[Number(answers.Qt5)]],
    },
    {
      key: "values",
      color: "gold",
      icon: "♡",
      title: obj("Values", "Values", "Values", "Values", "Values"),
      metric_label: obj(
        "Selected",
        "Selecionados",
        "Seleccionados",
        "Sélectionnés",
        "Ausgewählt",
      ),
      metric_value: obj(
        `${values.length} / 5`,
        `${values.length} / 5`,
        `${values.length} / 5`,
        `${values.length} / 5`,
        `${values.length} / 5`,
      ),
      bar: pct(values.length * 20),
      description: obj(
        "These values signal what feels meaningful, reliable, and worthy of care on your current path.",
        "Esses valores sinalizam o que parece significativo, confiável e digno de cuidado no seu caminho atual.",
        "Estos valores señalan lo que parece significativo, confiable y digno de cuidado en tu camino actual.",
        "Ces valeurs signalent ce qui semble significatif, fiable et digne d'attention sur votre chemin actuel.",
        "Diese Werte signalisieren, was sich auf Ihrem aktuellen Weg bedeutungsvoll, verlässlich und pflegenswert anfühlt.",
      ),
      tags: values.map(valueLabel),
    },
    {
      key: "pillars",
      color: "green",
      icon: "▣",
      title: obj(
        "Life Pillars",
        "Life Pillars",
        "Life Pillars",
        "Life Pillars",
        "Life Pillars",
      ),
      metric_label: obj(
        "Selected",
        "Selecionados",
        "Seleccionados",
        "Sélectionnés",
        "Ausgewählt",
      ),
      metric_value: obj(
        `${pillars.length} / 5`,
        `${pillars.length} / 5`,
        `${pillars.length} / 5`,
        `${pillars.length} / 5`,
        `${pillars.length} / 5`,
      ),
      bar: pct(pillars.length * 20),
      description: obj(
        "These pillars constitute the foundations that sustain your journey today and shape your sense of direction.",
        "Esses pilares constituem as bases que sustentam a sua jornada hoje e dão forma ao seu senso de direção.",
        "Estos pilares constituyen las bases que sostienen tu viaje hoy y dan forma a tu sentido de dirección.",
        "Ces piliers constituent les bases qui soutiennent votre parcours aujourd'hui et façonnent votre sens de l'orientation.",
        "Diese Pfeiler bilden die Grundlagen, die Ihre heutige Reise stützen und Ihren Orientierungssinn formen.",

      ),
      tags: pillars.map(pillarLabel),
    },
    {
      key: "worldview",
      color: "purple",
      icon: "◎",
      title: obj(
        "Worldview",
        "Worldview",
        "Worldview",
        "Worldview",
        "Worldview",
      ),
      metric_label: obj(
        "Perspective",
        "Perspectiva",
        "Perspectiva",
        "Perspective",
        "Perspektive",
      ),
      metric_value: worldLabel,
      bar: 72,
      description: worldviewDescription(worldview),
      tags: [worldLabel],
    },
  ];
  const dimensions = {
    decision: {
      title: cards[0].title,
      current_code: Number(answers.Qt4),
      desired_code: Number(answers.Qt5),
      activation: decisionActivation(answers.Qt4),
      label: decisionLabel,
      tags: cards[0].tags,
      description: cards[0].description,
    },
    values: {
      title: cards[1].title,
      selected: values,
      labels: values.map(valueLabel),
      description: cards[1].description,
    },
    pillars: {
      title: cards[2].title,
      selected: pillars,
      labels: pillars.map(pillarLabel),
      description: cards[2].description,
    },
    worldview: {
      title: cards[3].title,
      code: worldview,
      label: worldLabel,
      description: cards[3].description,
    },
  };
  const profile = {
    username,
    display_name,
    language,
    answers,
    source,
    created_at: new Date().toISOString(),
    results_app: {
      title: obj(
        `${display_name || username}'s Profile Snapshot`,
        `Profile Snapshot de ${display_name || username}`,
        `Profile Snapshot de ${display_name || username}`,
        `Profile Snapshot de ${display_name || username}`,
        `Profile Snapshot von ${display_name || username}`,
      ),
      overview,
      dimensions,
      cards,
      character_teaser: obj(
        "Continue your self-discovery journey in the full version of the CheckMatch App to discover your complete Self Profile and access a deeper map of your behavioral patterns.",
        "Continue sua jornada de autoconhecimento na versão completa do CheckMatch App para descobrir seu Self Profile completo e acessar um mapa mais profundo dos seus padrões comportamentais.",
        "Continúa tu viaje de autoconocimiento en la versión completa de CheckMatch App para descubrir tu Self Profile completo y acceder a un mapa más profundo de tus patrones de comportamiento.",
        "Poursuivez votre parcours de découverte de soi dans la version complète de la CheckMatch App pour découvrir votre Self Profile complet et accéder à une cartographie plus approfondie de vos modèles de comportement.",
        "Setzen Sie Ihre Reise der Selbsterkenntnis in der Vollversion der CheckMatch App fort, um Ihr komplettes Self Profile zu entdecken und auf eine tiefere Karte Ihrer Verhaltensmuster zuzugreifen.",

      ),
      golden_tip: phase1AIFallbackML(),
    },
  };
  return profile;
}

