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
      "The user currently favors movement, initiative and early action. This first layer suggests a profile that prefers to shape situations rather than wait for them to settle.",
      "O usuário atualmente favorece movimento, iniciativa e ação precoce. Esta primeira camada sugere um perfil que prefere moldar as situações em vez de esperar que elas se estabilizem.",
      "El usuario actualmente favorece el movimiento, la iniciativa y la acción temprana. Esta primera capa sugiere un perfil que prefiere moldear las situaciones en lugar de esperar a que se estabilicen.",
      "L’utilisateur favorise actuellement le mouvement, l’initiative et l’action précoce. Cette première couche suggère un profil qui préfère façonner les situations plutôt que d’attendre qu’elles se stabilisent.",
      "Der Nutzer bevorzugt derzeit Bewegung, Initiative und frühes Handeln. Diese erste Ebene deutet auf ein Profil hin, das Situationen lieber gestaltet, als darauf zu warten, dass sie sich stabilisieren.",
    );
  if (act === "wait")
    return obj(
      "The user currently values observation, timing and protection of energy before acting. This first layer suggests a profile that prefers to understand the context before moving.",
      "O usuário atualmente valoriza observação, timing e proteção de energia antes de agir. Esta primeira camada sugere um perfil que prefere compreender o contexto antes de se mover.",
      "El usuario actualmente valora la observación, el timing y la protección de energía antes de actuar. Esta primera capa sugiere un perfil que prefiere comprender el contexto antes de moverse.",
      "L’utilisateur valorise actuellement l’observation, le timing et la protection de l’énergie avant d’agir. Cette première couche suggère un profil qui préfère comprendre le contexte avant d’avancer.",
      "Der Nutzer schätzt derzeit Beobachtung, Timing und den Schutz von Energie vor dem Handeln. Diese erste Ebene deutet auf ein Profil hin, das den Kontext verstehen möchte, bevor es handelt.",
    );
  if (act === "adaptive")
    return obj(
      "The user currently combines pause and action, adjusting rhythm according to context. This first layer suggests strategic flexibility and situational judgment.",
      "O usuário atualmente combina pausa e ação, ajustando o ritmo de acordo com o contexto. Esta primeira camada sugere flexibilidade estratégica e julgamento situacional.",
      "El usuario actualmente combina pausa y acción, ajustando el ritmo según el contexto. Esta primera capa sugiere flexibilidad estratégica y juicio situacional.",
      "L’utilisateur combine actuellement pause et action, ajustant son rythme selon le contexte. Cette première couche suggère flexibilité stratégique et jugement situationnel.",
      "Der Nutzer kombiniert derzeit Pause und Handlung und passt den Rhythmus dem Kontext an. Diese erste Ebene deutet auf strategische Flexibilität und situatives Urteilsvermögen hin.",
    );
  return obj(
    "The user currently seeks balance between action and reflection. This first layer suggests a profile that avoids extremes and adapts smoothly across situations.",
    "O usuário atualmente busca equilíbrio entre ação e reflexão. Esta primeira camada sugere um perfil que evita extremos e se adapta suavemente entre situações.",
    "El usuario actualmente busca equilibrio entre acción y reflexión. Esta primera capa sugiere un perfil que evita extremos y se adapta con fluidez entre situaciones.",
    "L’utilisateur cherche actuellement un équilibre entre action et réflexion. Cette première couche suggère un profil qui évite les extrêmes et s’adapte avec fluidité selon les situations.",
    "Der Nutzer sucht derzeit ein Gleichgewicht zwischen Handlung und Reflexion. Diese erste Ebene deutet auf ein Profil hin, das Extreme vermeidet und sich flexibel an Situationen anpasst.",
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
    `The user's current worldview is organized around ${label.en}. This lens influences how meaning, choices and priorities are interpreted in this first profile layer.`,
    `A visão de mundo atual do usuário se organiza em torno de ${label.pt}. Essa lente influencia como sentido, escolhas e prioridades são interpretados nesta primeira camada de perfil.`,
    `La visión de mundo actual del usuario se organiza alrededor de ${label.es}. Esta lente influye en cómo se interpretan el sentido, las elecciones y las prioridades en esta primera capa del perfil.`,
    `La vision du monde actuelle de l’utilisateur s’organise autour de ${label.fr}. Cette lentille influence la manière dont le sens, les choix et les priorités sont interprétés dans cette première couche du profil.`,
    `Die aktuelle Weltanschauung des Nutzers ist um ${label.de} organisiert. Diese Perspektive beeinflusst, wie Bedeutung, Entscheidungen und Prioritäten in dieser ersten Profilebene interpretiert werden.`,
  );
}
function fallbackDetailsProfile(key, profile) {
  const dim = profile.results_app.dimensions[key] || {};
  const title = ml(dim.title) || key;
  const desc =
    {
      decision: obj(
        "This card explains how the user currently moves between intention and action. It combines the current moment and the preferred way of pursuing goals to reveal whether the user tends to move quickly, wait, adapt strategically or seek balance. In Budhi Lite, this is treated as a first-layer signal rather than a final character classification, because deeper phases will later add emotional stability, thinking style and action style.",
        "Este card explica como o usuário se move atualmente entre intenção e ação. Ele combina o momento atual e a forma preferida de perseguir objetivos para revelar se o usuário tende a avançar rapidamente, esperar, adaptar-se estrategicamente ou buscar equilíbrio. No Budhi Lite, isso é tratado como um sinal de primeira camada, e não como uma classificação final de character, porque fases mais profundas adicionarão estabilidade emocional, estilo de pensamento e estilo de ação.",
        "Este card explica cómo el usuario se mueve actualmente entre intención y acción. Combina el momento actual y la forma preferida de perseguir objetivos para revelar si el usuario tiende a avanzar rápidamente, esperar, adaptarse estratégicamente o buscar equilibrio. En Budhi Lite, esto se trata como una señal de primera capa, no como una clasificación final de character, porque fases más profundas añadirán estabilidad emocional, estilo de pensamiento y estilo de acción.",
        "Cette card explique comment l’utilisateur passe actuellement de l’intention à l’action. Elle combine le moment actuel et la manière préférée de poursuivre les objectifs pour révéler si l’utilisateur tend à avancer rapidement, attendre, s’adapter stratégiquement ou rechercher l’équilibre. Dans Budhi Lite, cela reste un signal de première couche, pas une classification finale de character.",
        "Diese Card erklärt, wie der Nutzer derzeit zwischen Absicht und Handlung wechselt. Sie kombiniert den aktuellen Moment und die bevorzugte Zielverfolgung, um zu zeigen, ob der Nutzer schnell handelt, wartet, sich strategisch anpasst oder Balance sucht. In Budhi Lite ist dies ein Signal der ersten Ebene, keine endgültige character-Klassifikation.",
      ),
      values: obj(
        "This card summarizes the selected values that most strongly organize the user’s current self-perception. Values are interpreted as anchors for trust, judgment and relational expectations. In the teaser report, they help identify what the user may protect, admire or expect from others before deeper personality dimensions are available.",
        "Este card resume os valores selecionados que mais organizam a autopercepção atual do usuário. Valores são interpretados como âncoras de confiança, julgamento e expectativas relacionais. No report teaser, ajudam a identificar aquilo que o usuário pode proteger, admirar ou esperar dos outros antes das dimensões mais profundas estarem disponíveis.",
        "Este card resume los valores seleccionados que más organizan la autopercepción actual del usuario. Los valores se interpretan como anclas de confianza, juicio y expectativas relacionales. En el report teaser, ayudan a identificar lo que el usuario puede proteger, admirar o esperar de otros antes de contar con dimensiones más profundas.",
        "Cette card résume les valeurs sélectionnées qui structurent le plus l’auto-perception actuelle de l’utilisateur. Les valeurs sont interprétées comme des ancrages de confiance, de jugement et d’attentes relationnelles.",
        "Diese Card fasst die ausgewählten Werte zusammen, die die aktuelle Selbstwahrnehmung des Nutzers am stärksten strukturieren. Werte gelten als Anker für Vertrauen, Urteil und Beziehungserwartungen.",
      ),
      pillars: obj(
        "This card identifies the life areas the user currently relies on most. Pillars are more situational than values: they show where energy, attention and emotional support are being placed today. This makes the card useful for understanding current life structure, not only long-term identity.",
        "Este card identifica as áreas da vida nas quais o usuário mais se apoia atualmente. Pilares são mais situacionais do que valores: mostram onde energia, atenção e suporte emocional estão sendo colocados hoje. Isso torna o card útil para compreender a estrutura de vida atual, não apenas a identidade de longo prazo.",
        "Este card identifica las áreas de la vida en las que el usuario se apoya más actualmente. Los pilares son más situacionales que los valores: muestran dónde se colocan hoy la energía, la atención y el apoyo emocional.",
        "Cette card identifie les domaines de vie sur lesquels l’utilisateur s’appuie le plus actuellement. Les piliers sont plus situationnels que les valeurs : ils montrent où l’énergie et le soutien émotionnel sont placés aujourd’hui.",
        "Diese Card identifiziert die Lebensbereiche, auf die sich der Nutzer derzeit am stärksten stützt. Säulen sind situationsbezogener als Werte: Sie zeigen, wo Energie, Aufmerksamkeit und emotionale Unterstützung heute liegen.",
      ),
      worldview: obj(
        "This card describes the perspective that currently guides how the user interprets life, choices and meaning. Worldview is important because it shapes the narrative behind decisions: two people can share similar behaviors but explain them through very different lenses. In Budhi Lite, worldview gives depth to the first-layer profile.",
        "Este card descreve a perspectiva que atualmente guia como o usuário interpreta a vida, as escolhas e o sentido. A visão de mundo é importante porque molda a narrativa por trás das decisões: duas pessoas podem ter comportamentos semelhantes, mas explicá-los por lentes muito diferentes. No Budhi Lite, a visão de mundo dá profundidade à primeira camada do perfil.",
        "Este card describe la perspectiva que actualmente guía cómo el usuario interpreta la vida, las elecciones y el sentido. La visión de mundo es importante porque moldea la narrativa detrás de las decisiones.",
        "Cette card décrit la perspective qui guide actuellement la manière dont l’utilisateur interprète la vie, les choix et le sens. La vision du monde donne de la profondeur à cette première couche du profil.",
        "Diese Card beschreibt die Perspektive, die derzeit steuert, wie der Nutzer Leben, Entscheidungen und Bedeutung interpretiert. Die Weltanschauung verleiht der ersten Profilebene Tiefe.",
      ),
    }[key] ||
    obj(
      "Profile detail.",
      "Detalhe do perfil.",
      "Detalle del perfil.",
      "Détail du profil.",
      "Profildetail.",
    );
  return {
    title,
    description: ml(desc),
    strengths: [
      ml(
        obj(
          "Provides an immediate first-layer reading.",
          "Oferece uma leitura imediata de primeira camada.",
          "Ofrece una lectura inmediata de primera capa.",
          "Fournit une lecture immédiate de première couche.",
          "Bietet eine unmittelbare erste Profilebene.",
        ),
      ),
      ml(
        obj(
          "Can be compared later in Match Lite.",
          "Pode ser comparado depois no Match Lite.",
          "Puede compararse luego en Match Lite.",
          "Peut être comparé ensuite dans Match Lite.",
          "Kann später in Match Lite verglichen werden.",
        ),
      ),
      ml(
        obj(
          "Works as a teaser before full character results.",
          "Funciona como teaser antes dos resultados completos de character.",
          "Funciona como teaser antes de los resultados completos de character.",
          "Fonctionne comme teaser avant les résultats complets de character.",
          "Funktioniert als Teaser vor vollständigen character-Ergebnissen.",
        ),
      ),
    ],
    challenges: [
      ml(
        obj(
          "It should not be interpreted as a final diagnosis.",
          "Não deve ser interpretado como diagnóstico final.",
          "No debe interpretarse como diagnóstico final.",
          "Ne doit pas être interprété comme un diagnostic final.",
          "Sollte nicht als endgültige Diagnose interpretiert werden.",
        ),
      ),
      ml(
        obj(
          "The full Self-Profile is needed for deeper classification.",
          "O Self-Profile completo é necessário para uma classificação mais profunda.",
          "Se necesita el Self-Profile completo para una clasificación más profunda.",
          "Le Self-Profile complet est nécessaire pour une classification plus profonde.",
          "Das vollständige Self-Profile ist für eine tiefere Klassifikation nötig.",
        ),
      ),
      ml(
        obj(
          "Context may change how this pattern appears.",
          "O contexto pode mudar como esse padrão aparece.",
          "El contexto puede cambiar cómo aparece este patrón.",
          "Le contexte peut modifier l’expression de ce modèle.",
          "Der Kontext kann verändern, wie dieses Muster erscheint.",
        ),
      ),
    ],
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
    "This first profile layer summarizes how the user currently acts, what values guide the user, which life pillars support the user today and which worldview frames the user’s life journey. It is intentionally a teaser: it offers enough structure for a first report and Match Lite, while leaving deeper character classification for the complete Self-Profile.",
    "Esta primeira camada de perfil resume como o usuário age atualmente, quais valores o guiam, quais pilares da vida o sustentam hoje e qual visão de mundo enquadra sua jornada. É propositalmente um teaser: oferece estrutura suficiente para um primeiro report e para o Match Lite, deixando a classificação mais profunda de character para o Self-Profile completo.",
    "Esta primera capa de perfil resume cómo actúa actualmente el usuario, qué valores lo guían, qué pilares de vida lo sostienen hoy y qué visión de mundo enmarca su recorrido. Es intencionalmente un teaser: ofrece estructura suficiente para un primer report y Match Lite, dejando la clasificación más profunda de character para el Self-Profile completo.",
    "Cette première couche de profil résume comment l’utilisateur agit actuellement, quelles valeurs le guident, quels piliers de vie le soutiennent aujourd’hui et quelle vision du monde encadre son parcours. Elle est volontairement un teaser.",
    "Diese erste Profilebene fasst zusammen, wie der Nutzer derzeit handelt, welche Werte ihn leiten, welche Lebenssäulen ihn heute stützen und welche Weltanschauung seine Reise rahmt. Sie ist bewusst ein Teaser.",
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
        "These values indicate the moral and relational anchors that currently feel most aligned with the user.",
        "Esses valores indicam as âncoras morais e relacionais que atualmente parecem mais alinhadas com o usuário.",
        "Estos valores indican las anclas morales y relacionales que actualmente se sienten más alineadas con el usuario.",
        "Ces valeurs indiquent les ancrages moraux et relationnels actuellement les plus alignés avec l’utilisateur.",
        "Diese Werte zeigen die moralischen und relationalen Anker, die derzeit am stärksten zum Nutzer passen.",
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
        "These pillars show where the user is currently placing energy, stability and life support.",
        "Esses pilares mostram onde o usuário está atualmente colocando energia, estabilidade e suporte de vida.",
        "Estos pilares muestran dónde el usuario está colocando actualmente energía, estabilidad y apoyo vital.",
        "Ces piliers montrent où l’utilisateur place actuellement son énergie, sa stabilité et son soutien de vie.",
        "Diese Säulen zeigen, wo der Nutzer derzeit Energie, Stabilität und Lebensunterstützung platziert.",
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
        "This is just an initial view. Discover your Character and access deep behavioral mapping in the full version of the BUDHI App.",
        "Esta é apenas uma visão inicial. Descubra seu Character e acesse o mapeamento comportamental profundo na versão completa do BUDHI App.",
        "Esta es solo una visión inicial. Descubra su Character y acceda al mapeo de comportamiento profundo en la versión completa de BUDHI App.",
        "Ceci n'est qu'un aperçu initial. Découvrez votre Character et accédez à une cartographie comportementale approfondie dans la version complète de BUDHI App.",
        "Dies ist nur ein erster Einblick. Entdecken Sie Ihren Character und greifen Sie auf tiefgreifendes Verhaltens-Mapping in der Vollversion der BUDHI App zu."
      ),
      // NOVA SESSÃO GOLD TIP AQUI:
      golden_tip: obj(
        "Use Match Lite as an opportunity to reflect on your current momentum and priorities. This pause for self-observation will help you better understand the motivations that guide your daily choices.",
        "Use o Match Lite como uma oportunidade de refletir sobre o seu momento e suas prioridades. Essa pausa para auto-observação ajudará a compreender melhor as motivações que guiam as suas escolhas diárias.",
        "Utilice Match Lite como una oportunidad para reflexionar sobre su momento y sus prioridades. Esta pausa para la autoobservación le ayudará a comprender mejor las motivaciones que guían sus elecciones diarias.",
        "Utilisez Match Lite comme une opportunité de réfléchir à votre dynamique et à vos priorités. Cette pause d'auto-observation vous aidera à mieux comprendre les motivations qui guident vos choix quotidiens.",
        "Nutzen Sie Match Lite als Gelegenheit, um über Ihre aktuelle Dynamik und Ihre Prioritäten nachzudenken. Diese Pause zur Selbstbeobachtung wird Ihnen helfen, die Motivationen, die Ihre täglichen Entscheidungen leiten, besser zu verstehen.",
      ),
    },
  };
  return profile;
}
