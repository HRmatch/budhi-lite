function obj(en, pt, es, fr, de) {
  return { en, pt, es, fr, de };
}

// 1. Mapeamento das Emoções (Qt1)
const QT1_LABELS = {
  Hopeful: obj("Hopeful", "Esperançoso", "Esperanzado", "Plein d'espoir", "Hoffnungsvoll"),
  Anxious: obj("Anxious", "Ansioso", "Ansioso", "Anxieux", "Ängstlich"),
  Calm: obj("Calm", "Calmo", "Tranquilo", "Calme", "Ruhig"),
  Restless: obj("Restless", "Inquieto", "Inquieto", "Agité", "Unruhig"),
  Joyful: obj("Joyful", "Alegre", "Alegre", "Joyeux", "Freudig"),
  Uncertain: obj("Uncertain", "Incerto", "Incierto", "Incertain", "Unsicher"),
  Motivated: obj("Motivated", "Motivado", "Motivado", "Motivé", "Motiviert"),
  Overwhelmed: obj("Overwhelmed", "Sobrecarregado", "Abrumado", "Débordé", "Überwältigt"),
  Stressed: obj("Stressed", "Estressado", "Estresado", "Stressé", "Gestresst"),
  Peaceful: obj("Peaceful", "Pacífico", "Pacífico", "Paisible", "Friedlich"),
  Grateful: obj("Grateful", "Grato", "Agradecido", "Reconnaissant", "Dankbar")
};

// 2. Mapeamento dos Significados das Cores (Qt2)
const QT2_MEANINGS = {
Red: obj(
    "Dynamic, courageous, and action-focused, with natural leadership and high physical energy, but with a tendency towards impulsivity and a short temper.",
    "Perfil dinâmico, corajoso e focado em ação, possuindo liderança natural e muita energia física, mas com tendência à impulsividade e pavio curto.",
    "Perfil dinámico, valiente y centrado en la acción, con liderazgo natural y alta energía, aunque con tendencia a la impulsividad.",
    "Profil dynamique, courageux et axé sur l'action, doté d'un leadership naturel et d'une forte énergie, mais avec une tendance à l'impulsivité.",
    "Dynamisches, mutiges und handlungsorientiertes Profil mit natürlicher Führung, jedoch mit einer Neigung zu Impulsivität."
  ),
  Blue: obj(
    "Calm, reliable, and logic-focused, seeking stability and thinking before acting, though potentially appearing cold or overly reserved.",
    "Perfil calmo, confiável e focado na lógica, que busca estabilidade e pensa antes de agir, embora possa parecer frio ou excessivamente reservado.",
    "Perfil tranquilo, confiable y enfocado en la lógica, que busca estabilidad, aunque puede parecer frío o reservado.",
    "Profil calme, fiable et axé sur la logique, qui cherche la stabilité, bien qu'il puisse paraître froid ou trop réservé.",
    "Ruhiges, zuverlässiges und logikorientiertes Profil, das Stabilität sucht, obwohl es kalt oder reserviert wirken kann."
  ),
  Yellow: obj(
    "Witty, creative, and future-focused, loving to share ideas and valuing freedom, but easily distracted or anxious.",
    "Perfil espirituoso, criativo e focado no futuro, que adora compartilhar ideias e preza pela liberdade, apresentando facilidade para se dispersar ou ficar ansioso.",
    "Perfil ingenioso, creativo y enfocado en el futuro, que ama compartir ideas, pero con facilidad para dispersarse.",
    "Profil spirituel, créatif et tourné vers l'avenir, qui aime partager des idées, mais qui se distrait facilement ou devient anxieux.",
    "Geistreiches, kreatives und zukunftsorientiertes Profil, das gerne Ideen teilt, aber leicht abgelenkt oder ängstlich ist."
  ),
  Green: obj(
    "Generous, balanced, and security-focused, acting as an excellent listener who seeks harmony, but with a fear of change and a tendency to isolate.",
    "Perfil generoso, equilibrado e focado na segurança, sendo um excelente ouvinte que busca harmonia nas relações, mas com medo de mudanças e tendência a isolar-se.",
    "Perfil generoso, equilibrado y enfocado en la seguridad, siendo un excelente oyente, pero con miedo al cambio y tendencia a aislarse.",
    "Profil généreux, équilibré et axé sur la sécurité, étant un excellent auditeur, mais avec une peur du changement et une tendance à s'isoler.",
    "Großzügiges, ausgeglichenes und sicherheitsorientiertes Profil und ausgezeichneter Zuhörer, jedoch mit Angst vor Veränderungen."
  ),
  Orange: obj(
    "Enthusiastic, friendly, and experience-focused, loving teamwork and attention, but having difficulty dealing with routine and loneliness.",
    "Perfil entusiasta, amigável e focado em experiências, que gosta de ser o centro das atenções e trabalhar em equipe, mas com dificuldade em lidar com rotinas e solidão.",
    "Perfil entusiasta, amigable y enfocado en experiencias, que disfruta del trabajo en equipo, pero con dificultad para manejar rutinas.",
    "Profil enthousiaste, amical et axé sur l'expérience, qui aime le travail d'équipe, mais avec des difficultés à gérer la routine.",
    "Enthusiastisches, freundliches und erfahrungsorientiertes Profil, das Teamarbeit liebt, jedoch Schwierigkeiten mit Routine hat."
  ),
  Pink: obj(
    "Affectionate, protective, and focused on others, with high sensitivity and a search for welcoming environments, though prone to naivety or emotional dependency.",
    "Perfil afetuoso, protetor e focado no bem-estar alheio, com sensibilidade alta e busca por ambientes acolhedores, embora com tendência a ser ingênuo ou dependente emocionalmente.",
    "Perfil afectuoso, protector y enfocado en otros, con alta sensibilidad, aunque con tendencia a la dependencia emocional.",
    "Profil affectueux, protecteur et concentré sur les autres, doté d'une grande sensibilité, mais avec une tendance à la dépendance émotionnelle.",
    "Liebevolles, beschützendes und auf andere fokussiertes Profil mit hoher Sensibilität, jedoch mit Neigung zur emotionalen Abhängigkeit."
  ),
  Purple: obj(
    "Intuitive, spiritual, artistic, and focused on the profound, with a unique, idealistic personality and strong intuition, but capable of isolating in their own world and seeming arrogant.",
    "Perfil intuitivo, espiritual, artístico e focado no profundo, apresentando uma personalidade única, idealista e com forte intuição, mas que pode se fechar em seu próprio mundo e parecer arrogante.",
    "Perfil intuitivo, espiritual y artístico, con una personalidad única e idealista, pero que puede cerrarse en su propio mundo.",
    "Profil intuitif, spirituel et artistique, doté d'une personnalité unique et d'une forte intuition, mais qui peut s'isoler dans son propre monde.",
    "Intuitives, spirituelles und künstlerisches Profil mit einer einzigartigen Persönlichkeit, das sich jedoch in seiner eigenen Welt isolieren kann."
  )
};

// 3. Adaptação para a nova Qt9 (que substitui Qt4 e Qt5)
const QT9_LABELS = {
  11: obj("Offensive", "Ofensiva", "Ofensiva", "Offensive", "Offensiv"),
  22: obj("Defensive", "Defensiva", "Defensiva", "Défensive", "Defensiv"),
  33: obj("Counter-Offensive", "Contra-Ofensiva", "Contraofensiva", "Contre-offensive", "Gegenoffensive"),
  44: obj("All-Rounder", "Versátil", "Versátil", "Polyvalent", "Allrounder"),
};

const WORLDVIEW_LABELS = {
  1: obj("Materialistic", "Materialista", "Materialista", "Matérialiste", "Materialistisch"),
  2: obj("Warrior", "Guerreiro", "Guerrero", "Guerrier", "Krieger"),
  3: obj("Survivor", "Sobrevivente", "Sobreviviente", "Survivant", "Überlebender"),
  4: obj("Spiritual", "Espiritual", "Espiritual", "Spirituel", "Spirituell"),
  5: obj("Sensual", "Sensual", "Sensual", "Sensuel", "Sinnlich"),
  6: obj("Erotic", "Erótico", "Erótico", "Érotique", "Erotisch"),
  7: obj("Pragmatic", "Pragmático", "Pragmático", "Pragmatique", "Pragmatisch"),
  8: obj("Holistic", "Holístico", "Holístico", "Holistique", "Ganzheitlich"),
  9: obj("Idealistic", "Idealista", "Idealista", "Idéaliste", "Idealistisch"),
  10: obj("Aesthetic", "Estético", "Estético", "Esthétique", "Ästhetisch"),
  11: obj("Skeptical", "Cético", "Escéptico", "Sceptique", "Skeptisch"),
  12: obj("Humanistic", "Humanista", "Humanista", "Humaniste", "Humanistisch"),
  13: obj("Anthropological", "Antropológico", "Antropológico", "Anthropologique", "Anthropologisch"),
  14: obj("Rational", "Racional", "Racional", "Rationnel", "Rational"),
  15: obj("Romantic", "Romântico", "Romántico", "Romantique", "Romantisch"),
  16: obj("Utopian", "Utópico", "Utópico", "Utopiste", "Utopisch"),
  17: obj("Realistic", "Realista", "Realista", "Réaliste", "Realistisch"),
  18: obj("Egocentric", "Egocêntrico", "Egocéntrico", "Égocentrique", "Egozentrisch"),
  19: obj("Altruistic", "Altruísta", "Altruista", "Altruiste", "Altruistisch"),
  20: obj("Forward-Looking", "Visionário", "Visionario", "Visionnaire", "Visionär"),
  21: obj("Empathetic", "Empático", "Empático", "Empathique", "Empathisch"),
  22: obj("Futuristic", "Futurista", "Futurista", "Futuriste", "Futuristisch"),
  23: obj("Perfectionist", "Perfeccionista", "Perfeccionista", "Perfectionniste", "Perfektionist")
};

const VALUE_LABELS = {
  Honesty: obj("Honesty", "Honestidade", "Honestidad", "Honnêteté", "Ehrlichkeit"),
  Respect: obj("Respect", "Respeito", "Respeto", "Respect", "Respekt"),
  Empathy: obj("Empathy", "Empatia", "Empatía", "Empathie", "Empathie"),
  Responsibility: obj("Responsibility", "Responsabilidade", "Responsabilidad", "Responsabilité", "Verantwortung"),
  Perseverance: obj("Perseverance", "Perseverança", "Perseverancia", "Persévérance", "Ausdauer"),
  Courage: obj("Courage", "Coragem", "Coraje", "Courage", "Mut"),
  Gratitude: obj("Gratitude", "Gratidão", "Gratitud", "Gratitude", "Dankbarkeit"),
  Compassion: obj("Compassion", "Compaixão", "Compasión", "Compassion", "Mitgefühl"),
  Integrity: obj("Integrity", "Integridade", "Integridad", "Intégrité", "Integrität"),
  Solidarity: obj("Solidarity", "Solidariedade", "Solidaridad", "Solidarité", "Solidarität"),
  Justice: obj("Justice", "Justiça", "Justicia", "Justice", "Gerechtigkeit"),
  Freedom: obj("Freedom", "Liberdade", "Libertad", "Liberté", "Freiheit"),
  Tolerance: obj("Tolerance", "Tolerância", "Tolerancia", "Tolérance", "Toleranz"),
  Joy: obj("Joy", "Alegria", "Alegría", "Joie", "Freude"),
  Discipline: obj("Discipline", "Disciplina", "Disciplina", "Discipline", "Disziplin"),
  Trust: obj("Trust", "Confiança", "Confianza", "Confiance", "Vertrauen"),
  Humility: obj("Humility", "Humildade", "Humildad", "Humilité", "Demut"),
  Wisdom: obj("Wisdom", "Sabedoria", "Sabiduría", "Sagesse", "Weisheit"),
  Transparency: obj("Transparency", "Transparência", "Transparencia", "Transparence", "Transparenz"),
  Creativity: obj("Creativity", "Criatividade", "Creatividad", "Créativité", "Kreativität")
};

const PILLAR_LABELS = {
  Work: obj("Work", "Trabalho", "Trabajo", "Travail", "Arbeit"),
  Love: obj("Love", "Amor", "Amor", "Amour", "Liebe"),
  Family: obj("Family", "Família", "Familia", "Famille", "Familie"),
  Friendships: obj("Friendships", "Amizades", "Amistades", "Amitiés", "Freundschaften"),
  Health: obj("Health", "Saúde", "Salud", "Santé", "Gesundheit"),
  Money: obj("Money", "Dinheiro", "Dinero", "Argent", "Geld"),
  Purpose: obj("Purpose", "Propósito", "Propósito", "Raison d'être", "Bestimmung"),
  SocialContribution: obj("Social Contribution", "Contribuição Social", "Contribución Social", "Contribution Sociale", "Sozialer Beitrag"),
  SelfKnowledge: obj("Self-Knowledge", "Autoconhecimento", "Autoconocimiento", "Connaissance de soi", "Selbsterkenntnis"),
  Resilience: obj("Resilience", "Resiliência", "Resiliencia", "Résilience", "Resilienz"),
  Recognition: obj("Recognition", "Reconhecimento", "Reconocimiento", "Reconnaissance", "Anerkennung"),
  Sustainability: obj("Sustainability", "Sustentabilidade", "Sostenibilidad", "Durabilité", "Nachhaltigkeit"),
  Entrepreneurship: obj("Entrepreneurship", "Empreendedorismo", "Emprendimiento", "Entrepreneuriat", "Unternehmertum"),
  Volunteering: obj("Volunteering", "Voluntariado", "Voluntariado", "Bénévolat", "Ehrenamt"),
  Ethics: obj("Ethics", "Ética", "Ética", "Éthique", "Ethik"),
  Spirituality: obj("Spirituality", "Espiritualidade", "Espiritualidad", "Spiritualité", "Spiritualität"),
  Leisure: obj("Leisure", "Lazer", "Ocio", "Loisirs", "Freizeit"),
  Education: obj("Education", "Educação", "Educación", "Éducation", "Bildung"),
  Dreams: obj("Dreams", "Sonhos", "Sueños", "Rêves", "Träume"),
  Hobbies: obj("Hobbies", "Hobbies", "Pasatiempos", "Hobbies", "Hobbys")
};

function pillarLabel(key) {
  return PILLAR_LABELS[String(key).replace(/[\s-]+/g, "")] || obj(key, key, key, key, key);
}
function valueLabel(key) {
  return VALUE_LABELS[key] || obj(key, key, key, key, key);
}


/* ─────────────────────────────────────────────
   Qt6 — Free-text human value validation + NLP
   The stored canonical value remains one of the
   20 active value categories. Resilience belongs
   exclusively to Qt7 (Life Pillars).
───────────────────────────────────────────── */

const QT6_VALUE_CATEGORIES = [
  "Honesty",
  "Respect",
  "Empathy",
  "Responsibility",
  "Perseverance",
  "Courage",
  "Gratitude",
  "Compassion",
  "Integrity",
  "Solidarity",
  "Justice",
  "Freedom",
  "Tolerance",
  "Joy",
  "Discipline",
  "Trust",
  "Humility",
  "Wisdom",
  "Transparency",
  "Creativity"
];

const QT7_PILLAR_CATEGORIES = [
  "Work",
  "Love",
  "Family",
  "Friendships",
  "Health",
  "Money",
  "Purpose",
  "Social Contribution",
  "Self-Knowledge",
  "Resilience",
  "Recognition",
  "Sustainability",
  "Entrepreneurship",
  "Volunteering",
  "Ethics",
  "Spirituality",
  "Leisure",
  "Education",
  "Dreams",
  "Hobbies"
];

const QT6_VALUE_LIBRARY = {
  "Honesty": {
    "label": {
      "en": "Honesty",
      "pt": "Honestidade",
      "es": "Honestidad",
      "fr": "Honnêteté",
      "de": "Ehrlichkeit"
    },
    "synonyms": {
      "en": [
        "truth",
        "truthfulness",
        "sincerity",
        "being honest",
        "telling the truth",
        "frankness",
        "uprightness",
        "candor"
      ],
      "pt": [
        "verdade",
        "veracidade",
        "sinceridade",
        "ser honesto",
        "falar a verdade",
        "franqueza",
        "retidão",
        "honesto"
      ],
      "es": [
        "verdad",
        "veracidad",
        "sinceridad",
        "ser honesto",
        "decir la verdad",
        "franqueza",
        "rectitud"
      ],
      "fr": [
        "vérité",
        "sincérité",
        "dire la vérité",
        "franchise",
        "droiture",
        "honnête"
      ],
      "de": [
        "wahrheit",
        "aufrichtigkeit",
        "ehrlich sein",
        "die wahrheit sagen",
        "rechtschaffenheit",
        "ehrliche offenheit"
      ]
    }
  },
  "Respect": {
    "label": {
      "en": "Respect",
      "pt": "Respeito",
      "es": "Respeto",
      "fr": "Respect",
      "de": "Respekt"
    },
    "synonyms": {
      "en": [
        "consideration",
        "regard",
        "dignity",
        "courtesy",
        "politeness",
        "recognition",
        "boundaries",
        "admiration",
        "self-respect",
        "self respect",
        "self-worth",
        "self worth",
        "self-esteem",
        "self esteem",
        "self dignity",
        "loving myself",
        "love myself",
        "love my self",
        "self-love",
        "self love"
      ],
      "pt": [
        "consideração",
        "dignidade",
        "cortesia",
        "educação",
        "reconhecimento",
        "limites",
        "respeitar",
        "admiração",
        "amor-próprio",
        "amor proprio",
        "autoestima",
        "auto-estima",
        "respeito próprio",
        "respeito proprio",
        "dignidade própria",
        "dignidade propria",
        "valor próprio",
        "valor proprio",
        "me amar",
        "amar a mim mesmo",
        "amar a mim mesma"
      ],
      "es": [
        "consideración",
        "dignidad",
        "cortesía",
        "educación",
        "reconocimiento",
        "límites",
        "respetar",
        "amor propio",
        "autoestima",
        "respeto propio",
        "dignidad propia",
        "valor propio",
        "amarme",
        "amar a mí mismo",
        "amar a mí misma"
      ],
      "fr": [
        "considération",
        "dignité",
        "courtoisie",
        "politesse",
        "reconnaissance",
        "limites",
        "respecter",
        "amour-propre",
        "amour propre",
        "estime de soi",
        "respect de soi",
        "dignité personnelle",
        "s’aimer",
        "s aimer"
      ],
      "de": [
        "achtung",
        "rücksicht",
        "würde",
        "höflichkeit",
        "anerkennung",
        "grenzen",
        "respektieren",
        "selbstachtung",
        "selbstrespekt",
        "selbstwert",
        "selbstwertgefühl",
        "sich selbst lieben"
      ]
    }
  },
  "Empathy": {
    "label": {
      "en": "Empathy",
      "pt": "Empatia",
      "es": "Empatía",
      "fr": "Empathie",
      "de": "Empathie"
    },
    "synonyms": {
      "en": [
        "understanding",
        "putting myself in others shoes",
        "sensitivity",
        "listening",
        "emotional understanding",
        "perspective taking"
      ],
      "pt": [
        "entender o outro",
        "se colocar no lugar do outro",
        "sensibilidade",
        "escuta",
        "compreensão emocional",
        "acolhimento"
      ],
      "es": [
        "entender al otro",
        "ponerse en el lugar del otro",
        "sensibilidad",
        "escucha",
        "comprensión emocional"
      ],
      "fr": [
        "comprendre l'autre",
        "se mettre à la place de l'autre",
        "sensibilité",
        "écoute",
        "compréhension émotionnelle"
      ],
      "de": [
        "verständnis",
        "sich in andere hineinversetzen",
        "sensibilität",
        "zuhören",
        "emotionales verständnis"
      ]
    }
  },
  "Responsibility": {
    "label": {
      "en": "Responsibility",
      "pt": "Responsabilidade",
      "es": "Responsabilidad",
      "fr": "Responsabilité",
      "de": "Verantwortung"
    },
    "synonyms": {
      "en": [
        "accountability",
        "commitment",
        "duty",
        "obligation",
        "ownership",
        "reliability",
        "being responsible",
        "answerability"
      ],
      "pt": [
        "compromisso",
        "dever",
        "obrigação",
        "assumir consequências",
        "confiabilidade",
        "ser responsável",
        "prestação de contas"
      ],
      "es": [
        "compromiso",
        "deber",
        "obligación",
        "asumir consecuencias",
        "confiabilidad",
        "ser responsable"
      ],
      "fr": [
        "engagement",
        "devoir",
        "obligation",
        "assumer les conséquences",
        "fiabilité",
        "être responsable"
      ],
      "de": [
        "verantwortlichkeit",
        "verpflichtung",
        "pflicht",
        "zuverlässigkeit",
        "verantwortlich sein",
        "rechenschaft"
      ]
    }
  },
  "Perseverance": {
    "label": {
      "en": "Perseverance",
      "pt": "Perseverança",
      "es": "Perseverancia",
      "fr": "Persévérance",
      "de": "Ausdauer"
    },
    "synonyms": {
      "en": [
        "persistence",
        "determination",
        "not giving up",
        "tenacity",
        "endurance",
        "steadfastness",
        "keep going"
      ],
      "pt": [
        "persistência",
        "determinação",
        "não desistir",
        "tenacidade",
        "constância",
        "seguir em frente",
        "insistência"
      ],
      "es": [
        "persistencia",
        "determinación",
        "no rendirse",
        "tenacidad",
        "constancia",
        "seguir adelante"
      ],
      "fr": [
        "persistance",
        "détermination",
        "ne pas abandonner",
        "ténacité",
        "constance",
        "continuer"
      ],
      "de": [
        "beharrlichkeit",
        "entschlossenheit",
        "nicht aufgeben",
        "ausdauernd",
        "standhaftigkeit",
        "weitermachen"
      ]
    }
  },
  "Courage": {
    "label": {
      "en": "Courage",
      "pt": "Coragem",
      "es": "Coraje",
      "fr": "Courage",
      "de": "Mut"
    },
    "synonyms": {
      "en": [
        "bravery",
        "boldness",
        "facing fear",
        "daring",
        "nerve",
        "initiative",
        "taking risks"
      ],
      "pt": [
        "bravura",
        "ousadia",
        "enfrentar o medo",
        "atrevimento",
        "iniciativa",
        "arriscar",
        "corajoso"
      ],
      "es": [
        "valentía",
        "osadía",
        "enfrentar el miedo",
        "atrevimiento",
        "iniciativa",
        "arriesgar"
      ],
      "fr": [
        "bravoure",
        "audace",
        "affronter la peur",
        "initiative",
        "prendre des risques"
      ],
      "de": [
        "tapferkeit",
        "kühnheit",
        "angst begegnen",
        "wagemut",
        "initiative",
        "risiko eingehen"
      ]
    }
  },
  "Gratitude": {
    "label": {
      "en": "Gratitude",
      "pt": "Gratidão",
      "es": "Gratitud",
      "fr": "Gratitude",
      "de": "Dankbarkeit"
    },
    "synonyms": {
      "en": [
        "thankfulness",
        "appreciation",
        "being grateful",
        "recognizing good",
        "thank you",
        "blessing"
      ],
      "pt": [
        "agradecimento",
        "apreciação",
        "ser grato",
        "reconhecer o bem",
        "obrigado",
        "bênção"
      ],
      "es": [
        "agradecimiento",
        "aprecio",
        "ser agradecido",
        "reconocer lo bueno",
        "gracias"
      ],
      "fr": [
        "remerciement",
        "appréciation",
        "être reconnaissant",
        "reconnaître le bien",
        "merci"
      ],
      "de": [
        "dank",
        "wertschätzung",
        "dankbar sein",
        "das gute erkennen",
        "danke"
      ]
    }
  },
  "Compassion": {
    "label": {
      "en": "Compassion",
      "pt": "Compaixão",
      "es": "Compasión",
      "fr": "Compassion",
      "de": "Mitgefühl"
    },
    "synonyms": {
      "en": [
        "kindness",
        "mercy",
        "care",
        "human warmth",
        "helping those who suffer",
        "tenderness",
        "self-compassion",
        "self compassion",
        "self-kindness",
        "self kindness",
        "kindness to myself",
        "being kind to myself"
      ],
      "pt": [
        "bondade",
        "misericórdia",
        "cuidado",
        "calor humano",
        "ajudar quem sofre",
        "ternura",
        "autocompaixão",
        "auto compaixão",
        "compaixão por mim",
        "gentileza comigo",
        "ser gentil comigo"
      ],
      "es": [
        "bondad",
        "misericordia",
        "cuidado",
        "calidez humana",
        "ayudar a quien sufre",
        "ternura",
        "autocompasión",
        "auto compasión",
        "compasión conmigo",
        "ser amable conmigo"
      ],
      "fr": [
        "bonté",
        "miséricorde",
        "soin",
        "chaleur humaine",
        "aider ceux qui souffrent",
        "tendresse",
        "autocompassion",
        "auto compassion",
        "compassion envers soi",
        "être gentil avec soi"
      ],
      "de": [
        "güte",
        "barmherzigkeit",
        "fürsorge",
        "menschliche wärme",
        "leidenden helfen",
        "zärtlichkeit",
        "selbstmitgefühl",
        "selbst mitgefühl",
        "mitgefühl mit mir selbst",
        "freundlich zu mir selbst"
      ]
    }
  },
  "Integrity": {
    "label": {
      "en": "Integrity",
      "pt": "Integridade",
      "es": "Integridad",
      "fr": "Intégrité",
      "de": "Integrität"
    },
    "synonyms": {
      "en": [
        "ethics",
        "moral coherence",
        "principles",
        "upright character",
        "doing what is right",
        "honor"
      ],
      "pt": [
        "ética",
        "coerência moral",
        "princípios",
        "caráter reto",
        "fazer o certo",
        "honra"
      ],
      "es": [
        "ética",
        "coherencia moral",
        "principios",
        "carácter recto",
        "hacer lo correcto",
        "honor"
      ],
      "fr": [
        "éthique",
        "cohérence morale",
        "principes",
        "caractère droit",
        "faire ce qui est juste",
        "honneur"
      ],
      "de": [
        "ethik",
        "moralische konsequenz",
        "prinzipien",
        "aufrichtiger charakter",
        "das richtige tun",
        "ehre"
      ]
    }
  },
  "Solidarity": {
    "label": {
      "en": "Solidarity",
      "pt": "Solidariedade",
      "es": "Solidaridad",
      "fr": "Solidarité",
      "de": "Solidarität"
    },
    "synonyms": {
      "en": [
        "mutual support",
        "community",
        "helping others",
        "togetherness",
        "cooperation",
        "social support"
      ],
      "pt": [
        "apoio mútuo",
        "comunidade",
        "ajudar os outros",
        "união",
        "cooperação",
        "suporte social"
      ],
      "es": [
        "apoyo mutuo",
        "comunidad",
        "ayudar a otros",
        "unión",
        "cooperación",
        "apoyo social"
      ],
      "fr": [
        "soutien mutuel",
        "communauté",
        "aider les autres",
        "union",
        "coopération",
        "soutien social"
      ],
      "de": [
        "gegenseitige unterstützung",
        "gemeinschaft",
        "anderen helfen",
        "zusammenhalt",
        "kooperation",
        "soziale unterstützung"
      ]
    }
  },
  "Justice": {
    "label": {
      "en": "Justice",
      "pt": "Justiça",
      "es": "Justicia",
      "fr": "Justice",
      "de": "Gerechtigkeit"
    },
    "synonyms": {
      "en": [
        "fairness",
        "equity",
        "rights",
        "what is fair",
        "social justice",
        "impartiality"
      ],
      "pt": [
        "justo",
        "equidade",
        "direitos",
        "o que é justo",
        "justiça social",
        "imparcialidade"
      ],
      "es": [
        "justo",
        "equidad",
        "derechos",
        "lo justo",
        "justicia social",
        "imparcialidad"
      ],
      "fr": [
        "équité",
        "droits",
        "ce qui est juste",
        "justice sociale",
        "impartialité"
      ],
      "de": [
        "gerechtigkeitssinn",
        "fairness",
        "rechte",
        "was gerecht ist",
        "soziale gerechtigkeit",
        "unparteilichkeit"
      ]
    }
  },
  "Freedom": {
    "label": {
      "en": "Freedom",
      "pt": "Liberdade",
      "es": "Libertad",
      "fr": "Liberté",
      "de": "Freiheit"
    },
    "synonyms": {
      "en": [
        "autonomy",
        "independence",
        "free choice",
        "self-direction",
        "liberty",
        "being free"
      ],
      "pt": [
        "autonomia",
        "independência",
        "livre escolha",
        "autodireção",
        "ser livre",
        "libertação"
      ],
      "es": [
        "autonomía",
        "independencia",
        "libre elección",
        "autodirección",
        "ser libre"
      ],
      "fr": [
        "autonomie",
        "indépendance",
        "libre choix",
        "autodirection",
        "être libre"
      ],
      "de": [
        "autonomie",
        "unabhängigkeit",
        "freie wahl",
        "selbstbestimmung",
        "frei sein"
      ]
    }
  },
  "Tolerance": {
    "label": {
      "en": "Tolerance",
      "pt": "Tolerância",
      "es": "Tolerancia",
      "fr": "Tolérance",
      "de": "Toleranz"
    },
    "synonyms": {
      "en": [
        "acceptance",
        "patience with differences",
        "plurality",
        "respect for difference",
        "inclusion",
        "open-mindedness",
        "openness to differences"
      ],
      "pt": [
        "aceitação",
        "paciência com diferenças",
        "pluralidade",
        "respeito à diferença",
        "inclusão",
        "mente aberta",
        "abertura às diferenças"
      ],
      "es": [
        "aceptación",
        "paciencia con diferencias",
        "pluralidad",
        "respeto a la diferencia",
        "inclusión",
        "mentalidad abierta",
        "apertura a las diferencias"
      ],
      "fr": [
        "acceptation",
        "patience face aux différences",
        "pluralité",
        "respect de la différence",
        "inclusion",
        "ouverture d'esprit",
        "ouverture aux différences"
      ],
      "de": [
        "akzeptanz",
        "geduld mit unterschieden",
        "pluralität",
        "respekt vor unterschieden",
        "inklusion",
        "aufgeschlossenheit",
        "offenheit für unterschiede"
      ]
    }
  },
  "Joy": {
    "label": {
      "en": "Joy",
      "pt": "Alegria",
      "es": "Alegría",
      "fr": "Joie",
      "de": "Freude"
    },
    "synonyms": {
      "en": [
        "happiness",
        "lightness",
        "cheerfulness",
        "good mood",
        "pleasure",
        "celebration",
        "delight"
      ],
      "pt": [
        "felicidade",
        "leveza",
        "bom humor",
        "prazer",
        "celebração",
        "contentamento",
        "alegre"
      ],
      "es": [
        "felicidad",
        "ligereza",
        "buen humor",
        "placer",
        "celebración",
        "alegrarse"
      ],
      "fr": [
        "bonheur",
        "légèreté",
        "bonne humeur",
        "plaisir",
        "célébration",
        "joie de vivre"
      ],
      "de": [
        "glück",
        "leichtigkeit",
        "gute laune",
        "freude",
        "feier",
        "vergnügen"
      ]
    }
  },
  "Discipline": {
    "label": {
      "en": "Discipline",
      "pt": "Disciplina",
      "es": "Disciplina",
      "fr": "Discipline",
      "de": "Disziplin"
    },
    "synonyms": {
      "en": [
        "self-control",
        "organization",
        "consistency",
        "routine",
        "focus",
        "method",
        "commitment to practice"
      ],
      "pt": [
        "autocontrole",
        "organização",
        "consistência",
        "rotina",
        "foco",
        "método",
        "regularidade"
      ],
      "es": [
        "autocontrol",
        "organización",
        "consistencia",
        "rutina",
        "enfoque",
        "método",
        "regularidad"
      ],
      "fr": [
        "maîtrise de soi",
        "organisation",
        "cohérence",
        "routine",
        "concentration",
        "méthode",
        "régularité"
      ],
      "de": [
        "selbstkontrolle",
        "organisation",
        "beständigkeit",
        "routine",
        "fokus",
        "methode",
        "regelmäßigkeit"
      ]
    }
  },
  "Trust": {
    "label": {
      "en": "Trust",
      "pt": "Confiança",
      "es": "Confianza",
      "fr": "Confiance",
      "de": "Vertrauen"
    },
    "synonyms": {
      "en": [
        "confidence",
        "faith in others",
        "reliance",
        "credibility",
        "safe bond",
        "believing",
        "self-confidence",
        "self confidence",
        "confidence in myself",
        "trusting myself",
        "trust myself"
      ],
      "pt": [
        "crer",
        "fé no outro",
        "segurança",
        "credibilidade",
        "vínculo seguro",
        "acreditar",
        "autoconfiança",
        "auto confiança",
        "confiança em mim",
        "confiar em mim",
        "confiar em mim mesmo",
        "confiar em mim mesma"
      ],
      "es": [
        "confianza en otros",
        "seguridad",
        "credibilidad",
        "vínculo seguro",
        "creer",
        "autoconfianza",
        "auto confianza",
        "confianza en mí",
        "confiar en mí",
        "confiar en mí mismo",
        "confiar en mí misma"
      ],
      "fr": [
        "foi en l'autre",
        "sécurité",
        "crédibilité",
        "lien sûr",
        "croire",
        "confiance en soi",
        "me faire confiance",
        "se faire confiance"
      ],
      "de": [
        "vertrauen in andere",
        "sicherheit",
        "glaubwürdigkeit",
        "sichere bindung",
        "glauben",
        "selbstvertrauen",
        "vertrauen in mich selbst",
        "mir selbst vertrauen"
      ]
    }
  },
  "Humility": {
    "label": {
      "en": "Humility",
      "pt": "Humildade",
      "es": "Humildad",
      "fr": "Humilité",
      "de": "Demut"
    },
    "synonyms": {
      "en": [
        "modesty",
        "simplicity",
        "learning posture",
        "low ego",
        "recognizing limits",
        "being humble"
      ],
      "pt": [
        "modéstia",
        "simplicidade",
        "postura de aprendiz",
        "baixo ego",
        "reconhecer limites",
        "ser humilde"
      ],
      "es": [
        "modestia",
        "simplicidad",
        "actitud de aprendiz",
        "poco ego",
        "reconocer límites",
        "ser humilde"
      ],
      "fr": [
        "modestie",
        "simplicité",
        "posture d'apprentissage",
        "peu d'ego",
        "reconnaître ses limites",
        "être humble"
      ],
      "de": [
        "bescheidenheit",
        "einfachheit",
        "lernhaltung",
        "wenig ego",
        "grenzen erkennen",
        "demütig sein"
      ]
    }
  },
  "Wisdom": {
    "label": {
      "en": "Wisdom",
      "pt": "Sabedoria",
      "es": "Sabiduría",
      "fr": "Sagesse",
      "de": "Weisheit"
    },
    "synonyms": {
      "en": [
        "discernment",
        "good judgment",
        "maturity",
        "learning from experience",
        "prudence",
        "insight"
      ],
      "pt": [
        "discernimento",
        "bom julgamento",
        "maturidade",
        "aprender com a experiência",
        "prudência",
        "lucidez"
      ],
      "es": [
        "discernimiento",
        "buen juicio",
        "madurez",
        "aprender de la experiencia",
        "prudencia",
        "lucidez"
      ],
      "fr": [
        "discernement",
        "bon jugement",
        "maturité",
        "apprendre de l'expérience",
        "prudence",
        "lucidité"
      ],
      "de": [
        "urteilskraft",
        "gutes urteilsvermögen",
        "reife",
        "aus erfahrung lernen",
        "klugheit",
        "einsicht"
      ]
    }
  },
  "Transparency": {
    "label": {
      "en": "Transparency",
      "pt": "Transparência",
      "es": "Transparencia",
      "fr": "Transparence",
      "de": "Transparenz"
    },
    "synonyms": {
      "en": [
        "clarity",
        "no hidden agenda",
        "being clear",
        "straightforwardness",
        "openness in communication",
        "transparent communication"
      ],
      "pt": [
        "clareza",
        "sem segundas intenções",
        "ser claro",
        "objetividade",
        "comunicação aberta",
        "transparência na comunicação"
      ],
      "es": [
        "claridad",
        "sin doble intención",
        "ser claro",
        "comunicación abierta",
        "transparencia en la comunicación",
        "comunicación directa"
      ],
      "fr": [
        "clarté",
        "sans arrière-pensée",
        "être clair",
        "communication ouverte",
        "transparence dans la communication"
      ],
      "de": [
        "klarheit",
        "keine versteckte absicht",
        "klar sein",
        "direktheit",
        "offene kommunikation",
        "transparenz in der kommunikation"
      ]
    }
  },
  "Creativity": {
    "label": {
      "en": "Creativity",
      "pt": "Criatividade",
      "es": "Creatividad",
      "fr": "Créativité",
      "de": "Kreativität"
    },
    "synonyms": {
      "en": [
        "imagination",
        "innovation",
        "originality",
        "inventiveness",
        "creating",
        "new ideas",
        "creative thinking"
      ],
      "pt": [
        "imaginação",
        "inovação",
        "originalidade",
        "inventividade",
        "criar",
        "novas ideias",
        "pensamento criativo"
      ],
      "es": [
        "imaginación",
        "innovación",
        "originalidad",
        "inventiva",
        "crear",
        "nuevas ideas",
        "pensamiento creativo"
      ],
      "fr": [
        "imagination",
        "innovation",
        "originalité",
        "inventivité",
        "créer",
        "nouvelles idées",
        "pensée créative"
      ],
      "de": [
        "vorstellungskraft",
        "innovation",
        "originalität",
        "erfindergeist",
        "erschaffen",
        "neue ideen",
        "kreatives denken"
      ]
    }
  }
};
const QT6_VALUE_MATCH_THRESHOLD = 0.60;
const QT6_VALUE_STRONG_LOCK_THRESHOLD = 0.72;
const QT6_VALUE_INVALID_SCOPE_THRESHOLD = 0.12;
const QT6_MIN_VALUES = 5;
const QT6_MAX_VALUES = 5;
const QT6_MIN_INPUT_CHARS = 2;
const QT6_MAX_INPUT_CHARS = 220;

const QT6_BLOCKED_PATTERNS = [
  /\b(fuck|shit|bitch|asshole|idiot|stupid|moron|trash|dumb)\b/i,
  /\b(merda|porra|caralho|puta|idiota|burro|lixo|ot[aá]rio|babaca|imbecil|est[uú]pido)\b/i,
  /\b(mierda|puta|idiota|est[uú]pido|imb[eé]cil|basura)\b/i,
  /\b(merde|connard|idiot|imb[eé]cile|stupide)\b/i,
  /\b(schei[sß]e|arschloch|idiot|dumm|m[üu]ll)\b/i
];

// Stopwords keep complete sentences readable while extracting only meaningful value words.
// They are intentionally multilingual because the app can run in EN, PT, ES, FR and DE.
const QT6_STOPWORDS = new Set([
  // English
  'i','me','my','mine','myself','self','own','you','your','yours','we','our','ours','us','they','them','their','theirs',
  'a','an','the','and','or','but','if','then','because','of','to','for','from','with','without','in','on','at','by','as','is','are','am','be','being','been','was','were','do','does','did','have','has','had','that','this','these','those','it','its','into','about','right','now','today','value','values','guide','guides','guided','guiding','feel','feels','connected','strongly','most','important','more','very','really','such','like','would','should','could','can',
  // Portuguese
  'eu','me','meu','minha','meus','minhas','mim','mesmo','mesma','proprio','propria','auto','voce','você','seu','sua','seus','suas','nos','nós','nossos','nossas','eles','elas','deles','delas',
  'o','a','os','as','um','uma','uns','umas','e','ou','mas','se','entao','então','porque','de','do','da','dos','das','para','por','com','sem','em','no','na','nos','nas','ao','aos','como','ser','sou','sao','são','estar','esta','está','estao','estão','foi','foram','ter','tem','têm','que','isso','isto','esses','essas','aqueles','aquelas','valor','valores','guia','guiam','guiar','guiado','guiada','sinto','sentir','conectado','conectada','fortemente','mais','muito','bem','vida','hoje','agora',
  // Spanish
  'yo','me','mi','mis','mio','mia','míos','mías','mismo','misma','propio','propia','tu','tus','usted','ustedes','nosotros','nosotras','nuestro','nuestra','ellos','ellas','sus','suyo','suya',
  'el','la','los','las','un','una','unos','unas','y','o','pero','si','entonces','porque','de','del','para','por','con','sin','en','al','como','ser','soy','son','estar','esta','está','estan','están','fue','fueron','tener','tiene','tienen','que','eso','esto','estos','estas','valor','valores','guia','guía','guian','guían','guiar','siento','sentir','conectado','conectada','fuertemente','mas','más','muy','vida','hoy','ahora',
  // French
  'je','me','mon','ma','mes','moi','soi','meme','même','propre','tu','vous','votre','vos','nous','notre','nos','ils','elles','leur','leurs',
  'le','la','les','un','une','des','et','ou','mais','si','alors','parce','que','de','du','pour','par','avec','sans','dans','sur','au','aux','comme','etre','être','suis','est','sont','ce','cet','cette','ces','valeur','valeurs','guide','guident','guider','sens','sentir','connecte','connecté','connectee','connectée','fortement','plus','tres','très','vie','aujourdhui','maintenant',
  // German
  'ich','mich','mir','mein','meine','meiner','meines','selbst','du','dich','dein','deine','sie','ihr','ihre','wir','uns','unser','unsere','der','die','das','ein','eine','und','oder','aber','wenn','dann','weil','von','zu','fur','für','mit','ohne','in','auf','an','als','ist','sind','bin','sein','war','waren','haben','hat','dass','dies','diese','dieser','wert','werte','leitet','leiten','fuhle','fühle','verbunden','stark','mehr','sehr','leben','heute','jetzt'
].map(semanticNormalizeText));

// Context terms may be meaningful in a sentence but are not one of the 20 canonical Qt6 values.
// They can be shown in diagnostics and ignored for automatic storage.
const QT6_CONTEXT_TERMS = [
  'spirituality','spiritual life','espiritualidade','vida espiritual','espiritualidad','vie spirituelle','spiritualité','spiritualitat','spiritualität'
];

function semanticNormalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’']/g, ' ')
    .replace(/[^a-z0-9À-ÿ\s-]/gi, ' ')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function semanticTokenize(value) {
  return semanticNormalizeText(value)
    .split(' ')
    .map(x => x.trim())
    .filter(x => x.length >= 2);
}

function semanticMeaningfulTokens(tokens) {
  return (tokens || []).filter(t => t && t.length >= 2 && !QT6_STOPWORDS.has(semanticNormalizeText(t)));
}

function semanticExtractKeywords(value) {
  return semanticMeaningfulTokens(semanticTokenize(value));
}

function semanticUnique(arr) {
  return [...new Set((arr || []).filter(Boolean))];
}

function semanticClamp01(n) {
  return Math.max(0, Math.min(1, Number(n) || 0));
}

function semanticLevenshtein(a, b) {
  a = semanticNormalizeText(a);
  b = semanticNormalizeText(b);
  if (a === b) return 0;
  if (!a) return b.length;
  if (!b) return a.length;
  const matrix = Array.from({ length: b.length + 1 }, (_, i) => [i]);
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      matrix[i][j] = b.charAt(i - 1) === a.charAt(j - 1)
        ? matrix[i - 1][j - 1]
        : Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
    }
  }
  return matrix[b.length][a.length];
}

function semanticSimilarity(a, b) {
  a = semanticNormalizeText(a);
  b = semanticNormalizeText(b);
  const max = Math.max(a.length, b.length);
  if (!max) return 1;
  return 1 - (semanticLevenshtein(a, b) / max);
}

function semanticDynamicCategoryMap(opts = {}) {
  return opts.categoryMap || opts.categoriesMap || opts.categories || opts.nlpCategories || null;
}

function semanticDynamicCategoryKeys(opts = {}) {
  const map = semanticDynamicCategoryMap(opts);
  if (map && typeof map === 'object') return Object.keys(map);
  return typeof QT6_VALUE_CATEGORIES !== 'undefined' ? QT6_VALUE_CATEGORIES : [];
}

function semanticDynamicCategoryData(category, opts = {}) {
  const map = semanticDynamicCategoryMap(opts);
  if (map && typeof map === 'object' && map[category]) return map[category] || {};
  return (typeof QT6_VALUE_LIBRARY !== 'undefined' && QT6_VALUE_LIBRARY[category]) || {};
}

function semanticCategoryTerms(category, opts = {}) {
  const data = semanticDynamicCategoryData(category, opts);
  const label = data.label || {};
  const synonyms = data.synonyms || {};
  const baseTerms = data.base_terms || data.baseTerms || [];
  const contextTerms = data.context_terms || data.contextTerms || [];
  return semanticUnique([
    category,
    ...Object.values(label),
    ...(Array.isArray(baseTerms) ? baseTerms : []),
    ...(Array.isArray(contextTerms) ? contextTerms : []),
    ...Object.values(synonyms).flat()
  ]).map(String).filter(Boolean);
}

function validateFreeTextInput(input, opts = {}) {
  const raw = String(input || '');
  const clean = raw.replace(/\s+/g, ' ').trim();
  const minChars = Number(opts.minChars || QT6_MIN_INPUT_CHARS);
  const maxChars = Number(opts.maxChars || QT6_MAX_INPUT_CHARS);

  // Safety block must run before the semantic matcher accepts a high-confidence category.
  // The IA resolver is loaded after this file, but this function is executed later,
  // so detectBlockedSemanticInput is available at runtime when js/ia_resolver.js is present.
  if (typeof detectBlockedSemanticInput === 'function') {
    const blocked = detectBlockedSemanticInput(clean, opts);
    if (blocked?.invalid) {
      return {
        valid: false,
        reason: blocked.reason || 'blocked_language',
        messageKey: blocked.messageKey || 'qt6InvalidContent',
        sanitized: clean,
        invalid: true,
        requiresFallback: false,
        safety: blocked.safety || null
      };
    }
  }

  if (!clean || clean.length < minChars) {
    return { valid: false, reason: 'empty_or_too_short', messageKey: 'qt6InvalidTooShort', sanitized: clean };
  }
  if (clean.length > maxChars) {
    return { valid: false, reason: 'too_long', messageKey: 'qt6InvalidTooLong', sanitized: clean };
  }
  if (/https?:\/\/|www\.|@/.test(clean)) {
    return { valid: false, reason: 'external_or_contact', messageKey: 'qt6InvalidScope', sanitized: clean };
  }
  if (!/[a-zA-ZÀ-ÿ]/.test(clean) || /(.)\1{8,}/.test(clean)) {
    return { valid: false, reason: 'noise', messageKey: 'qt6InvalidScope', sanitized: clean };
  }
  if (QT6_BLOCKED_PATTERNS.some(rx => rx.test(clean))) {
    return { valid: false, reason: 'blocked_language', messageKey: 'qt6InvalidContent', sanitized: clean };
  }
  return { valid: true, reason: null, messageKey: null, sanitized: clean };
}

function semanticTermScore(inputNorm, inputTokens, term) {
  const termNorm = semanticNormalizeText(term);
  if (!termNorm) return { score: 0, corrections: [] };

  const termTokens = semanticTokenize(termNorm);
  const inputKeywords = semanticMeaningfulTokens(inputTokens);
  const termKeywords = semanticMeaningfulTokens(termTokens);

  if (inputNorm === termNorm) return { score: 1, corrections: [] };
  if (inputNorm.includes(termNorm) && termNorm.length >= 3) return { score: 0.96, corrections: [] };

  // Phrase-level check after stopword removal. This lets sentences like
  // "os valores que me guiam são justiça e honestidade" resolve cleanly.
  const inputKeywordText = inputKeywords.join(' ');
  const termKeywordText = termKeywords.join(' ');
  if (termKeywordText && inputKeywordText.includes(termKeywordText)) return { score: 0.92, corrections: [] };

  const inputSet = new Set(inputKeywords);
  const termSet = new Set(termKeywords);
  const overlap = [...termSet].filter(t => inputSet.has(t)).length;
  if (termKeywords.length && overlap === termKeywords.length) return { score: 0.88, corrections: [] };
  if (overlap > 0) {
    return { score: Math.max(0.50, overlap / Math.max(termKeywords.length, inputKeywords.length || 1)), corrections: [] };
  }

  let typoScore = 0;
  const corrections = [];
  for (const a of inputKeywords) {
    if (a.length < 5) continue;
    for (const b of termKeywords) {
      if (b.length < 5) continue;
      const sim = semanticSimilarity(a, b);
      if (sim >= 0.84) {
        const score = sim * 0.78;
        if (score > typoScore) typoScore = score;
        corrections.push({ original: a, corrected: b, confidence: Math.round(sim * 100) });
      }
    }
  }
  return { score: typoScore, corrections };
}

function semanticContextualTerms(inputNorm, inputTokens, opts = {}) {
  const found = [];
  const contextSource = Array.isArray(opts.contextTerms || opts.context_terms) && (opts.contextTerms || opts.context_terms).length ? (opts.contextTerms || opts.context_terms) : QT6_CONTEXT_TERMS;
  for (const term of contextSource) {
    const termNorm = semanticNormalizeText(term);
    if (!termNorm) continue;
    if (inputNorm.includes(termNorm)) found.push(termNorm);
    else {
      for (const token of semanticMeaningfulTokens(inputTokens)) {
        if (token.length >= 5 && semanticSimilarity(token, termNorm) >= 0.80) found.push(termNorm);
      }
    }
  }
  return semanticUnique(found);
}

function calculateSemanticMatch(input, opts = {}) {
  const threshold = Number(opts.threshold || QT6_VALUE_MATCH_THRESHOLD);
  const strongLockThreshold = Number(opts.strongLockThreshold || opts.lockThreshold || QT6_VALUE_STRONG_LOCK_THRESHOLD);
  const minValues = Number(opts.minValues || QT6_MIN_VALUES);
  const maxValues = Number(opts.maxValues || QT6_MAX_VALUES);
  const categoryKeys = semanticDynamicCategoryKeys(opts);
  const inputNorm = semanticNormalizeText(input);
  const inputTokens = semanticTokenize(inputNorm);
  const keywords = semanticExtractKeywords(inputNorm);
  const validation = validateFreeTextInput(input, opts);

  if (!validation.valid) {
    return {
      category: null,
      categories: [],
      lockedCategories: [],
      score: 0,
      confidence: 0,
      threshold,
      minValues,
      maxValues,
      requiresFallback: false,
      invalid: true,
      reason: validation.reason,
      messageKey: validation.messageKey,
      keywords,
      candidates: []
    };
  }

  const candidates = categoryKeys.map(category => {
    const terms = semanticCategoryTerms(category, opts);
    let rawScore = 0;
    let matchedTerm = '';
    let corrections = [];
    for (const term of terms) {
      const res = semanticTermScore(inputNorm, inputTokens, term);
      if (res.score > rawScore) {
        rawScore = res.score;
        matchedTerm = term;
        corrections = res.corrections || [];
      }
    }
    return { category, rawScore: semanticClamp01(rawScore), matchedTerm, corrections };
  }).sort((a, b) => b.rawScore - a.rawScore);

  const accepted = candidates
    .filter(c => c.rawScore >= threshold)
    .slice(0, maxValues + 2);

  // Strong/validated categories are locked in the fallback screen. If the user typed
  // only 1 or 2 clear values, those stay fixed and the user selects the remaining ones.
  const lockedCategories = accepted
    .filter(c => c.rawScore >= strongLockThreshold)
    .slice(0, maxValues)
    .map(c => c.category);

  const categories = accepted.slice(0, maxValues).map(c => c.category);
  const best = candidates[0] || { category: null, rawScore: 0 };
  const confidenceBase = accepted.length
    ? accepted.slice(0, Math.min(maxValues, accepted.length)).reduce((sum, c) => sum + c.rawScore, 0) / Math.min(maxValues, accepted.length)
    : best.rawScore;
  const confidence = semanticClamp01(confidenceBase || 0);
  const score = Math.round(confidence * 100);

  let reason = null;
  if (!categories.length) reason = 'no_semantic_match';
  else if (accepted.length < minValues) reason = 'needs_more_values';
  else if (accepted.length > maxValues) reason = 'too_many_values_detected';

  return {
    category: categories[0] || best.category || null,
    categories,
    lockedCategories,
    score,
    confidence,
    threshold,
    strongLockThreshold,
    minValues,
    maxValues,
    requiresFallback: Boolean(reason),
    invalid: false,
    reason,
    messageKey: reason ? 'qt6NeedsManualFallback' : null,
    keywords,
    contextualTerms: semanticContextualTerms(inputNorm, inputTokens, opts),
    correctedTerms: semanticUnique(accepted.flatMap(c => c.corrections || []).map(c => `${c.original}→${c.corrected}`))
      .map(pair => {
        const [original, corrected] = pair.split('→');
        return { original, corrected };
      }),
    candidates: candidates.slice(0, 8).map(c => ({
      category: c.category,
      score: Math.round(semanticClamp01(c.rawScore) * 100),
      matchedTerm: c.matchedTerm || ''
    }))
  };
}

function normalizeSemanticAnswer(value, opts = {}) {
  const maxValues = Number(opts.maxValues || QT6_MAX_VALUES);
  if (Array.isArray(value)) return semanticUnique(value.map(String).filter(Boolean)).slice(0, maxValues);
  if (value && typeof value === 'object') {
    if (Array.isArray(value.categories)) return normalizeSemanticAnswer(value.categories, opts);
    if (value.category) return [String(value.category)];
    if (value.value) return [String(value.value)];
    if (value.text) return normalizeSemanticAnswer(value.text, opts);
  }
  const raw = String(value || '').trim();
  if (!raw) return [];
  if (semanticDynamicCategoryKeys(opts).map(String).includes(raw)) return [raw];
  const match = calculateSemanticMatch(raw, opts);
  return match.categories && !match.requiresFallback && !match.invalid ? match.categories.slice(0, maxValues) : [];
}

function semanticFallbackOptions(opts = {}) {
  const map = semanticDynamicCategoryMap(opts);
  if (map && typeof map === 'object') return Object.entries(map).map(([value, data]) => ({ value, label: data.label || obj(value, value, value, value, value) }));
  return QT6_VALUE_CATEGORIES.map(value => ({ value, label: VALUE_LABELS[value] || obj(value, value, value, value, value) }));
}

function normalizeCanonicalSelection(value, allowedCategories, maxValues = 5) {
  const source = Array.isArray(value)
    ? value
    : (value && typeof value === 'object' && Array.isArray(value.categories)
      ? value.categories
      : [value].filter(Boolean));

  const allowedByKey = new Map(
    (allowedCategories || []).map(category => [semanticNormalizeText(category), category])
  );

  return semanticUnique(
    source
      .map(item => allowedByKey.get(semanticNormalizeText(item)))
      .filter(Boolean)
  ).slice(0, maxValues);
}

function pct(n) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function decisionActivation(code) {
  // Ajustado para refletir os códigos da nova Qt9
  return (
    { 11: "go", 22: "wait", 33: "adaptive", 44: "balanced" }[Number(code)] ||
    "balanced"
  );
}

function actionLabelFromCode(q9) {
  return QT9_LABELS[Number(q9)] || QT9_LABELS[44];
}

function decisionDescription(q9) {
  const act = decisionActivation(q9);
  
  if (act === "go")
    return obj(
      "This result reflects your current state, demonstrating a natural tendency towards movement, initiative, and taking action at the right time. Your pace of decision-making tends to bring energy to daily interactions, ensuring the fluidity and continuous advancement of situations.",
      "Este resultado reflete seu estado atual, demonstrando uma tendência natural ao movimento, à iniciativa e à ação no momento certo. Seu ritmo de decisão tende a levar energia às interações diárias, garantindo a fluidez e o avanço contínuo das situações.",
      "Este resultado refleja tu estado actual, demostrando una tendencia natural hacia el movimiento, la iniciativa y la acción en el momento adecuado. Tu ritmo de decisión tiende a aportar energía a las interacciones diarias, garantizando la fluidez y el avance continuo de las situaciones.",
      "Ce résultat reflète votre état actuel, démontrant une tendance naturelle au mouvement, à l'initiative et à l'action au bon moment. Votre rythme de décision a tendance à apporter de l'énergie aux interactions quotidiennes, garantissant la fluidité et l'avancement continu des situations.",
      "Dieses Ergebnis spiegelt Ihren aktuellen Zustand wider und zeigt eine natürliche Tendenz zu Bewegung, Initiative und Handeln im richtigen Moment. Ihr Entscheidungstempo bringt tendenziell Energie in alltägliche Interaktionen und sorgt für den Fluss und das kontinuierliche Voranschreiten von Situationen."
    );
  if (act === "wait")
    return obj(
      "This result signals a more reflective pace, with space to observe, perceive the right moment, and act with care. In daily interactions, this can bring stability, active listening, and greater clarity on when to move forward.",
      "Este resultado sinaliza um ritmo mais reflexivo, com espaço para observar, perceber o momento certo e agir com cuidado. Nas interações diárias, isso pode trazer estabilidade, escuta e mais clareza sobre quando avançar.",
      "Este resultado señala un ritmo más reflexivo, con espacio para observar, percibir el momento adecuado y actuar con cuidado. En las interacciones diarias, esto puede aportar estabilidad, escucha y mayor claridad sobre cuándo avanzar.",
      "Ce résultat signale un rythme plus réfléchi, avec de l'espace pour observer, percevoir le bon moment et agir avec soin. Dans les interactions quotidiennes, cela peut apporter de la stabilité, de l'écoute et une plus grande clarté sur le moment d'avancer.",
      "Dieses Ergebnis signalisiert ein eher nachdenkliches Tempo mit Raum zum Beobachten, Wahrnehmen des richtigen Moments und sorgfältigem Handeln. In alltäglichen Interaktionen kann dies Stabilität, Zuhören und mehr Klarheit darüber bringen, wann man voranschreiten sollte."
    );
  if (act === "adaptive")
    return obj(
      "This result translates your current state, showing a flexible pace, capable of alternating between pause and action according to the moment. In everyday life, this can support more sensitive choices, because movement becomes guided by the context, not just by impulse.",
      "Este resultado traduz o seu estado atual, mostrando um ritmo flexível, capaz de alternar pausa e ação conforme o momento. No dia a dia, isso pode sustentar escolhas mais sensíveis, porque o movimento passa a ser guiado pelo contexto, não apenas pelo impulso.",
      "Este resultado traduce tu estado actual, mostrando un ritmo flexible, capaz de alternar entre pausa y acción según el momento. En el día a día, esto puede sustentar elecciones más sensibles, porque el movimiento pasa a ser guiado por el contexto, no solo por el impulso.",
      "Ce résultat traduit votre état actuel, montrant un rythme flexible, capable d'alterner entre pause et action selon le moment. Au quotidien, cela peut soutenir des choix plus sensibles, car le mouvement est guidé par le contexte, et non plus seulement par l'impulsion.",
      "Dieses Ergebnis übersetzt Ihren aktuellen Zustand und zeigt ein flexibles Tempo, das je nach Moment zwischen Pause und Aktion wechseln kann. Im Alltag kann dies sensiblere Entscheidungen unterstützen, da die Bewegung vom Kontext geleitet wird und nicht nur vom Impuls."
    );
    
  return obj(
    "Your profile indicates a search for balance between action and reflection. In daily interactions, this pace can help you avoid extremes, listen to the moment, and move with greater presence.",
    "Seu perfil indica uma busca por equilíbrio entre ação e reflexão. Nas interações diárias, esse ritmo pode ajudar você a evitar extremos, escutar o momento e se mover com mais presença.",
    "Tu perfil indica una búsqueda de equilibrio entre acción y reflexión. En las interacciones diarias, este ritmo puede ayudarte a evitar los extremos, escuchar el momento y moverte con mayor presencia.",
    "Votre profil indique une recherche d'équilibre entre action et réflexion. Dans les interactions quotidiennes, ce rythme peut vous aider à éviter les extrêmes, à être à l'écoute du moment et à bouger avec plus de présence.",
    "Ihr Profil weist auf die Suche nach einem Gleichgewicht zwischen Aktion und Reflexion hin. In alltäglichen Interaktionen kann dieses Tempo Ihnen helfen, Extreme zu vermeiden, auf den Moment zu hören und sich mit mehr Präsenz zu bewegen."
  );
}

// 4. Integração da Visão de Mundo (Qt8) com Sentimento (Qt1) e Cor (Qt2)
function worldviewDescription(code, moodKey, colorKey) {
  const label = WORLDVIEW_LABELS[Number(code)] || obj("Worldview", "Visão de mundo", "Visión del mundo", "Vision du monde", "Weltanschauung");
  const mood = QT1_LABELS[moodKey] || obj(moodKey, moodKey, moodKey, moodKey, moodKey);
  const color = QT2_MEANINGS[colorKey] || obj("", "", "", "", "");
  const format = (text) => text ? text.charAt(0).toLowerCase() + text.slice(1) : "";

  return obj(
    `In this moment of feeling ${mood.en.toLowerCase()}, your interpretation of the world is anchored in a ${label.en} perspective. This lens resonates with how you make sense of your experiences, choose priorities, and recognize what feels coherent in your current journey.`,
    `Neste momento em que se sente ${mood.pt.toLowerCase()}, sua leitura do mundo se estrutura a partir de uma visão ${label.pt}. Essa perspectiva ressoa na forma como você dá sentido às experiências, escolhe prioridades e reconhece o que parece coerente na sua jornada atual.`,
    `En este momento en que te sientes ${mood.es.toLowerCase()}, tu lectura del mundo se estructura a partir de una visión ${label.es}. Esta perspectiva resuena con la forma en que das sentido a las experiencias, eliges prioridades y reconoces lo que parece coherente en tu viaje actual.`,
    `En ce moment où vous vous sentez ${mood.fr.toLowerCase()}, votre lecture du monde s'ancre dans une perspective ${label.fr}. Cette lentille résonne avec la façon dont vous donnez du sens aux expériences, choisissez vos priorités et reconnaissez ce qui semble cohérent dans votre parcours actuel.`,
    `In diesem Moment, in dem Sie sich ${mood.de.toLowerCase()} fühlen, ist Ihre Sicht auf die Welt in einer ${label.de} Perspektive verankert. Diese Linse steht im Einklang mit der Art und Weise, wie Sie Erfahrungen einen Sinn geben, Prioritäten setzen und erkennen, was sich auf Ihrer aktuellen Reise stimmig anfühlt.`
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

function buildPhase1Profile({
  username,
  display_name,
  answers,
  questionDefinitions = [],
  language = "en",
  source = "user_form",
}) {
  const persistedAnswers = { ...(answers || {}) };
  const profileCreatedAt = new Date().toISOString();
  const profileRevision = `${profileCreatedAt}::${Math.random().toString(36).slice(2, 10)}`;
  const availableQuestionDefinitions = Array.isArray(questionDefinitions) && questionDefinitions.length
    ? questionDefinitions
    : (typeof questionnaire !== 'undefined' && Array.isArray(questionnaire?.questions) ? questionnaire.questions : []);
  const formulaExcludedIds = new Set(
    availableQuestionDefinitions
      .filter(question => question && question.formula_excluded === true)
      .map(question => question.id)
  );
  const isFormulaExcludedAnswerKey = answerKey => [...formulaExcludedIds].some(questionId =>
    answerKey === questionId || answerKey.startsWith(`${questionId}_`)
  );
  const formulaAnswers = Object.fromEntries(
    Object.entries(persistedAnswers).filter(([answerKey]) => !isFormulaExcludedAnswerKey(answerKey))
  );

  const values = normalizeCanonicalSelection(formulaAnswers.Qt6, QT6_VALUE_CATEGORIES, 5);
  const pillars = normalizeCanonicalSelection(formulaAnswers.Qt7, QT7_PILLAR_CATEGORIES, 5);
  const worldview = Number(formulaAnswers.Qt8);
  
  // Utilizando a nova Qt9 para ações
  const decisionLabel = actionLabelFromCode(Number(formulaAnswers.Qt9));
  
  const worldLabel = WORLDVIEW_LABELS[worldview] || obj("Worldview", "Visão de mundo", "Visión del mundo", "Vision du monde", "Weltanschauung");
  
  const overview = obj(
    "Welcome to your Profile Snapshot. This result gathers four signals of your current journey: your decision-making pace, the values that illuminate your path, the life pillars that sustain you today, and the worldview through which you make sense of your experiences. Read this analysis as an invitation to observe patterns with curiosity, not as a fixed definition of who you are.",
    "Boas-vindas ao seu Profile Snapshot. Este resultado reúne quatro sinais da sua jornada atual: seu ritmo de decisão, os valores que iluminam o seu caminho, os pilares de vida que sustentam você hoje e a visão de mundo pela qual você dá sentido às suas experiências. Leia esta análise como um convite para observar padrões com curiosidade, não como uma definição fixa de quem você é.",
    "Te damos la bienvenida a tu Profile Snapshot. Este resultado reúne cuatro señales de tu viaje actual: tu ritmo de decisión, los valores que iluminan tu camino, los pilares de vida que te sostienen hoy y la visión del mundo a través de la cual das sentido a tus experiencias. Lee este análisis como una invitación a observar patrones con curiosidad, no como una definición fija de quién eres.",
    "Bienvenue dans votre Profile Snapshot. Ce résultat rassemble quatre signaux de votre parcours actuel : votre rythme de décision, les valeurs qui éclairent votre chemin, les piliers de vie qui vous soutiennent aujourd'hui, et la vision du monde par laquelle vous donnez du sens à vos expériences. Lisez cette analyse comme une invitation à observer des schémas avec curiosité, et non comme une définition figée de qui vous êtes.",
    "Willkommen bei Ihrem Profile Snapshot. Dieses Ergebnis fasst vier Signale Ihrer aktuellen Reise zusammen: Ihr Entscheidungstempo, die Werte, die Ihren Weg erhellen, die Lebenspfeiler, die Sie heute tragen, und die Weltanschauung, durch die Sie Ihren Erfahrungen einen Sinn geben. Lesen Sie diese Analyse als Einladung, Muster mit Neugier zu beobachten, nicht als feste Definition dessen, wer Sie sind."
  );

  const cards = [
    {
      key: "decision",
      color: "blue",
      icon: "↗",
      title: obj("Decision Style", "Decision Style", "Decision Style", "Decision Style", "Decision Style"),
      metric_label: obj("Profile", "Perfil", "Perfil", "Profil", "Profil"),
      metric_value: decisionLabel,
      bar: 70,
      description: decisionDescription(Number(formulaAnswers.Qt9)),
      tags: [QT9_LABELS[Number(formulaAnswers.Qt9)]]
    },
    {
      key: "values",
      color: "gold",
      icon: "♡",
      title: obj("Values", "Values", "Values", "Values", "Values"),
      metric_label: obj("Selected", "Selecionados", "Seleccionados", "Sélectionnés", "Ausgewählt"),
      metric_value: obj(`${values.length} / 5`, `${values.length} / 5`, `${values.length} / 5`, `${values.length} / 5`, `${values.length} / 5`),
      bar: pct(values.length * 20),
      description: obj(
        "These values signal what feels meaningful, reliable, and worthy of care on your current path.",
        "Esses valores sinalizam o que parece significativo, confiável e digno de cuidado no seu caminho atual.",
        "Estos valores señalan lo que parece significativo, confiable y digno de cuidado en tu camino actual.",
        "Ces valeurs signalent ce qui semble significatif, fiable et digne d'attention sur votre chemin actuel.",
        "Diese Werte signalisieren, was sich auf Ihrem aktuellen Weg bedeutungsvoll, verlässlich und pflegenswert anfühlt."
      ),
      tags: values.map(valueLabel),
    },
    {
      key: "pillars",
      color: "green",
      icon: "▣",
      title: obj("Life Pillars", "Life Pillars", "Life Pillars", "Life Pillars", "Life Pillars"),
      metric_label: obj("Selected", "Selecionados", "Seleccionados", "Sélectionnés", "Ausgewählt"),
      metric_value: obj(`${pillars.length} / 5`, `${pillars.length} / 5`, `${pillars.length} / 5`, `${pillars.length} / 5`, `${pillars.length} / 5`),
      bar: pct(pillars.length * 20),
      description: obj(
        "These pillars constitute the foundations that sustain your journey today and shape your sense of direction.",
        "Esses pilares constituem as bases que sustentam a sua jornada hoje e dão forma ao seu senso de direção.",
        "Estos pilares constituyen las bases que sostienen tu viaje hoy y dan forma a tu sentido de dirección.",
        "Ces piliers constituent les bases qui soutiennent votre parcours aujourd'hui et façonnent votre sens de l'orientation.",
        "Diese Pfeiler bilden die Grundlagen, die Ihre heutige Reise stützen und Ihren Orientierungssinn formen."
      ),
      tags: pillars.map(pillarLabel),
    },
    {
      key: "worldview",
      color: "purple",
      icon: "◎",
      title: obj("Worldview", "Worldview", "Worldview", "Worldview", "Worldview"),
      metric_label: obj("Perspective", "Perspectiva", "Perspectiva", "Perspective", "Perspektive"),
      metric_value: worldLabel,
      bar: 72,
      // Passando as respostas de Qt1 e Qt2 para compor o parágrafo da Visão de Mundo
      description: worldviewDescription(worldview, formulaAnswers.Qt1, formulaAnswers.Qt2),
      tags: [worldLabel],
    },
  ];

  const dimensions = {
    decision: {
      title: cards[0].title,
      code: Number(formulaAnswers.Qt9),
      activation: decisionActivation(formulaAnswers.Qt9),
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
    answers: persistedAnswers,
    source,
    created_at: profileCreatedAt,
    results_app: {
      profile_revision: profileRevision,
      title: obj(
        `${display_name || username}'s Profile Snapshot`,
        `Profile Snapshot de ${display_name || username}`,
        `Profile Snapshot de ${display_name || username}`,
        `Profile Snapshot de ${display_name || username}`,
        `Profile Snapshot von ${display_name || username}`
      ),
      overview,
      dimensions,
      cards,
      character_teaser: obj(
        "Continue your self-discovery journey in the full version of the CheckMatch App to discover your complete Self Profile and access a deeper map of your behavioral patterns.",
        "Continue sua jornada de autoconhecimento na versão completa do CheckMatch App para descobrir seu Self Profile completo e acessar um mapa mais profundo dos seus padrões comportamentais.",
        "Continúa tu viaje de autoconocimiento en la versión completa de CheckMatch App para descubrir tu Self Profile completo y acceder a un mapa más profundo de tus patrones de comportamiento.",
        "Poursuivez votre parcours de découverte de soi dans la version complète de la CheckMatch App pour découvrir votre Self Profile complet et accéder à une cartographie plus approfondie de vos modèles de comportement.",
        "Setzen Sie Ihre Reise der Selbsterkenntnis in der Vollversion der CheckMatch App fort, um Ihr komplettes Self Profile zu entdecken und auf eine tiefere Karte Ihrer Verhaltensmuster zuzugreifen."
      ),
      golden_tip: phase1AIFallbackML(),
    },
  };
  return profile;
}