const VALUE_REL = {
  honesty:     { conv: ['integrity','transparency','trust','responsibility','respect'], div: [] },
  respect:     { conv: ['tolerance','empathy','compassion','humility','solidarity','trust'], div: ['autonomy','freedom'] },
  empathy:     { conv: ['compassion','solidarity','tolerance','respect','humility'], div: [] },
  responsibility: { conv: ['integrity','honesty','trust','discipline','perseverance'], div: ['joy','freedom'] },
  perseverance: { conv: ['resilience','discipline','responsibility','courage'], div: ['joy','freedom'] },
  courage:     { conv: ['autonomy','resilience','perseverance','creativity'], div: ['tolerance','humility'] },
  gratitude:   { conv: ['humility','empathy','compassion'], div: [] },
  autonomy:    { conv: ['freedom','courage','creativity','resilience'], div: ['solidarity','tolerance','humility'] },
  compassion:  { conv: ['empathy','solidarity','tolerance','respect','humility'], div: ['discipline','autonomy','freedom'] },
  integrity:   { conv: ['honesty','transparency','responsibility','justice','trust'], div: ['joy','creativity','freedom'] },
  solidarity:  { conv: ['compassion','empathy','tolerance','justice','respect'], div: ['autonomy'] },
  justice:     { conv: ['integrity','responsibility','honesty','solidarity','transparency','trust'], div: ['autonomy'] },
  freedom:     { conv: ['autonomy','courage','creativity'], div: ['discipline'] },
  tolerance:   { conv: ['respect','empathy','compassion','humility','solidarity'], div: ['discipline','autonomy'] },
  joy:         { conv: ['gratitude','creativity','freedom'], div: ['discipline'] },
  discipline:  { conv: ['perseverance','responsibility','resilience','integrity'], div: ['freedom','autonomy','joy'] },
  trust:       { conv: ['honesty','integrity','transparency','responsibility','respect'], div: [] },
  humility:    { conv: ['respect','solidarity','tolerance','empathy','compassion'], div: [] },
  wisdom:      { conv: ['resilience','humility'], div: [] },
  transparency: { conv: ['honesty','integrity','trust','responsibility','justice'], div: [] },
  creativity:  { conv: ['freedom','autonomy','courage','joy'], div: [] },
  resilience:  { conv: ['perseverance','discipline','courage','wisdom'], div: [] }
};

const PILLAR_REL = {
  work:                { conv: ['money','recognition','entrepreneurship','purpose','education'], div: ['hobbies','leisure'] },
  love:                { conv: ['family','friendships','dreams','self-knowledge','purpose','health'], div: [] },
  family:              { conv: ['love','friendships','health','ethics','purpose'], div: [] },
  friendships:         { conv: ['love','family','leisure','hobbies'], div: [] },
  health:              { conv: ['self-knowledge','spirituality','love','resilience'], div: [] },
  money:               { conv: ['work','entrepreneurship','recognition','purpose'], div: [] },
  purpose:             { conv: ['social contribution','volunteering','sustainability','ethics','work','money','family'], div: [] },
  'social contribution': { conv: ['volunteering','purpose','sustainability','ethics','spirituality'], div: ['recognition'] },
  'self-knowledge':    { conv: ['spirituality','health','education','purpose','resilience'], div: [] },
  recognition:         { conv: ['work','money','entrepreneurship','purpose','resilience'], div: ['social contribution','volunteering'] },
  sustainability:      { conv: ['social contribution','ethics','volunteering'], div: ['leisure'] },
  leisure:             { conv: ['hobbies','friendships','health','dreams'], div: ['work','recognition','entrepreneurship'] },
  entrepreneurship:    { conv: ['work','money','recognition','dreams'], div: ['volunteering'] },
  volunteering:        { conv: ['social contribution','purpose','ethics','sustainability','friendships'], div: ['recognition','money'] },
  ethics:              { conv: ['social contribution','sustainability','purpose'], div: ['recognition'] },
  spirituality:        { conv: ['self-knowledge','volunteering','purpose','ethics'], div: ['recognition','money','entrepreneurship'] },
  education:           { conv: ['work','purpose','dreams','self-knowledge'], div: ['leisure','recognition'] },
  resilience:          { conv: ['health','self-knowledge','purpose','education'], div: [] },
  dreams:              { conv: ['purpose','love','leisure','hobbies','entrepreneurship'], div: [] },
  hobbies:             { conv: ['leisure','friendships','health','dreams'], div: ['work','money'] }
};

function nkey(s) {
  return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function decisionPairScore(a, b) {
  a = Number(a);
  b = Number(b);
  if (a === b) return 1;
  const flex = [33, 44];
  if (flex.includes(a) && flex.includes(b)) return .9;
  if (flex.includes(a) || flex.includes(b)) return .76;
  if ((a === 11 && b === 22) || (a === 22 && b === 11)) return .42;
  return .62;
}

function relBetween(a, b, map) {
  const A = nkey(a), B = nkey(b);
  if (!A || !B) return 'none';
  if (A === B) return 'shared';
  const ra = map[A] || {}, rb = map[B] || {};
  if ((ra.div || []).includes(B) || (rb.div || []).includes(A)) return 'divergent';
  if ((ra.conv || []).includes(B) || (rb.conv || []).includes(A)) return 'convergent';
  return 'different';
}

function setScore(A, B, map) {
  A = (Array.isArray(A) ? A : []).slice(0, 5);
  B = (Array.isArray(B) ? B : []).slice(0, 5);
  const shared = [];
  const convergent = [];
  const divergent = [];
  for (const a of A) {
    for (const b of B) {
      const r = relBetween(a, b, map);
      if (r === 'shared' && !shared.some(x => nkey(x) === nkey(a))) shared.push(a);
      if (r === 'convergent') convergent.push([a, b]);
      if (r === 'divergent') divergent.push([a, b]);
    }
  }
  const sharedScore = shared.length / 5;
  const relationScore = Math.max(0, Math.min(1, .5 + (convergent.length * .035) - (divergent.length * .06)));
  const score = Math.max(0, Math.min(1, .58 * sharedScore + .42 * relationScore));
  return { score, shared, convergent, divergent };
}

const WORLDVIEW_GROUP = {
  1: 'material',        2: 'survival_action', 3: 'survival_action',
  4: 'meaning',         5: 'sensory',          6: 'sensory',
  7: 'practical',       8: 'meaning',          9: 'ideal_future',
  10: 'aesthetic',      11: 'rational',        12: 'human_people',
  13: 'human_people',   14: 'rational',        15: 'emotional',
  16: 'ideal_future',   17: 'practical',       18: 'self',
  19: 'human_people',   20: 'ideal_future',    21: 'human_people',
  22: 'ideal_future'
};

const WORLDVIEW_COMPLEMENT = new Set([
  'practical|human_people', 'practical|meaning', 'rational|practical',
  'rational|ideal_future', 'human_people|meaning', 'aesthetic|sensory',
  'survival_action|practical', 'ideal_future|practical'
]);

const WORLDVIEW_DIVERGENT = new Set([
  'material|meaning', 'material|spiritual', 'self|human_people',
  'self|meaning', 'rational|emotional', 'survival_action|sensory'
]);

function pairKey(a, b) {
  return [a, b].sort().join('|');
}

function worldviewScore(a, b) {
  const ca = Number(a), cb = Number(b);
  if (ca === cb) return { score: 1, type: 'aligned' };
  const ga = WORLDVIEW_GROUP[ca] || 'other', gb = WORLDVIEW_GROUP[cb] || 'other';
  if (ga === gb) return { score: .85, type: 'aligned' };
  if (WORLDVIEW_COMPLEMENT.has(pairKey(ga, gb))) return { score: .72, type: 'complementary' };
  if (WORLDVIEW_DIVERGENT.has(pairKey(ga, gb))) return { score: .35, type: 'divergent' };
  return { score: .56, type: 'different' };
}

function level(score) {
  if (score >= .74) return obj('High', 'Alto', 'Alto', 'Élevé', 'Hoch');
  if (score >= .52) return obj('Medium', 'Médio', 'Medio', 'Moyen', 'Mittel');
  return obj('Low', 'Baixo', 'Bajo', 'Faible', 'Niedrig');
}

function typeLabel(type) {
  const map = {
    aligned:       obj('Aligned', 'Alinhado', 'Alineado', 'Aligné', 'Stimmig'),
    complementary: obj('Complementary', 'Complementar', 'Complementario', 'Complémentaire', 'Komplementär'),
    divergent:     obj('Divergent', 'Divergente', 'Divergente', 'Divergent', 'Abweichend'),
    different:     obj('Different', 'Diferente', 'Diferente', 'Différent', 'Unterschiedlich')
  };
  return map[type] || map.different;
}

function matchAIFallbackMessage() {
  if (typeof aiFallbackError === 'function') return aiFallbackError();
  return typeof t === 'function' ? t('ai_fallback_error') : 'ai_fallback_error';
}

function matchAIFallbackML() {
  const source = typeof I18N === 'object' && I18N ? I18N : null;
  const value = lang => source?.[lang]?.ai_fallback_error || 'ai_fallback_error';
  return obj(value('en'), value('pt'), value('es'), value('fr'), value('de'));
}

function fallbackDetailsMatch(key, match) {
  const message = matchAIFallbackMessage();
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

function buildMatchLite(profileA, profileB) {
  const a = profileA.results_app.dimensions, b = profileB.results_app.dimensions;
  const d = (decisionPairScore(profileA.answers.Qt4, profileB.answers.Qt4) + decisionPairScore(profileA.answers.Qt5, profileB.answers.Qt5)) / 2;
  const v = setScore(a.values.selected, b.values.selected, VALUE_REL);
  const p = setScore(a.pillars.selected, b.pillars.selected, PILLAR_REL);
  const w = worldviewScore(profileA.answers.Qt8, profileB.answers.Qt8);
  const score = Math.round(d * 25 + v.score * 35 + p.score * 20 + w.score * 20);

  let type = 'misaligned';
  if (score >= 82) type = 'balanced';
  else if (score >= 65) type = 'growth';
  else if (score >= 45) type = 'challenges';

  const typeML = {
    balanced:  obj('Balanced Pair', 'Par Equilibrado', 'Par Equilibrado', 'Duo Équilibré', 'Ausgeglichenes Paar'),
    growth:    obj('Growth-Compatible Pair', 'Par Compatível para Crescimento', 'Par Compatible para Crecimiento', 'Duo Compatible pour la Croissance', 'Wachstumskompatibles Paar'),
    challenges:   obj('Challenges-Based Growth Pair', 'Par de Crescimento por Desafios', 'Par de Crecimiento por Desafíos', 'Duo de Croissance par les Défis', 'Herausforderungsbasiertes Wachstumspaar'),
    misaligned: obj('Misaligned Pair', 'Par Desalinhado', 'Par Desalineado', 'Duo Désaligné', 'Fehlangepasstes Paar')
  };

  const dimensions = {
    decision: {
      title:       obj('Decision Style', 'Decision Style', 'Decision Style', 'Decision Style', 'Decision Style'),
      score:       Math.round(d * 100),
      alignment:   level(d),
      type:        typeLabel(d >= .74 ? 'aligned' : d >= .52 ? 'complementary' : 'divergent'),
      description: obj(
        'Comparison of movement, timing and decision rhythm.',
        'Comparação de movimento, timing e ritmo de decisão.',
        'Comparación de movimiento, timing y ritmo de decisión.',
        'Comparaison du mouvement, du timing et du rythme décisionnel.',
        'Vergleich von Bewegung, Timing und Entscheidungsrhythmus.'
      ),
      tags: [a.decision.label, b.decision.label]
    },
    values: {
      title:       obj('Values', 'Values', 'Values', 'Values', 'Values'),
      score:       Math.round(v.score * 100),
      alignment:   level(v.score),
      type:        typeLabel(v.score >= .74 ? 'aligned' : v.score >= .52 ? 'complementary' : 'divergent'),
      description: obj(
        `The pair shares ${v.shared.length} selected values and has ${v.convergent.length} convergent value links.`,
        `O par compartilha ${v.shared.length} valores selecionados e possui ${v.convergent.length} conexões convergentes de valores.`,
        `El par comparte ${v.shared.length} valores seleccionados y tiene ${v.convergent.length} conexiones convergentes de valores.`,
        `Le duo partage ${v.shared.length} valeurs sélectionnées et possède ${v.convergent.length} liens convergents de valeurs.`,
        `Das Paar teilt ${v.shared.length} ausgewählte Werte und hat ${v.convergent.length} konvergente Werteverbindungen.`
      ),
      shared:     v.shared,
      convergent: v.convergent,
      divergent:  v.divergent,
      tags:       v.shared.map(valueLabel)
    },
    pillars: {
      title:       obj('Life Pillars', 'Life Pillars', 'Life Pillars', 'Life Pillars', 'Life Pillars'),
      score:       Math.round(p.score * 100),
      alignment:   level(p.score),
      type:        typeLabel(p.score >= .74 ? 'aligned' : p.score >= .52 ? 'complementary' : 'divergent'),
      description: obj(
        `The pair shares ${p.shared.length} current life pillars and has ${p.convergent.length} convergent pillar links.`,
        `O par compartilha ${p.shared.length} pilares de vida atuais e possui ${p.convergent.length} conexões convergentes de pilares.`,
        `El par comparte ${p.shared.length} pilares de vida actuales y tiene ${p.convergent.length} conexiones convergentes de pilares.`,
        `Le duo partage ${p.shared.length} piliers de vie actuels et possède ${p.convergent.length} liens convergents de piliers.`,
        `Das Paar teilt ${p.shared.length} aktuelle Lebenssäulen und hat ${p.convergent.length} konvergente Säulenverbindungen.`
      ),
      shared:     p.shared,
      convergent: p.convergent,
      divergent:  p.divergent,
      tags:       p.shared.map(pillarLabel)
    },
    worldview: {
      title:       obj('Worldview', 'Worldview', 'Worldview', 'Worldview', 'Worldview'),
      score:       Math.round(w.score * 100),
      alignment:   level(w.score),
      type:        typeLabel(w.type),
      description: obj(
        'Comparison of the perspectives that frame meaning, choices and life interpretation.',
        'Comparação das perspectivas que enquadram sentido, escolhas e interpretação da vida.',
        'Comparación de las perspectivas que enmarcan sentido, elecciones e interpretación de vida.',
        'Comparaison des perspectives qui encadrent le sens, les choix et l\'interprétation de la vie.',
        'Vergleich der Perspektiven, die Bedeutung, Entscheidungen und Lebensinterpretation rahmen.'
      ),
      pair: [a.worldview.label, b.worldview.label],
      tags: [a.worldview.label, b.worldview.label]
    }
  };

  const cards = [
    {
      key:          'decision',
      color:        'blue',
      icon:         '↗',
      title:        dimensions.decision.title,
      metric_label: obj('Alignment', 'Alinhamento', 'Alineación', 'Alignement', 'Ausrichtung'),
      metric_value: dimensions.decision.alignment,
      bar:          dimensions.decision.score,
      description:  dimensions.decision.description,
      tags:         dimensions.decision.tags
    },
    {
      key:          'values',
      color:        'gold',
      icon:         '♡',
      title:        dimensions.values.title,
      metric_label: obj('Overlap', 'Sobreposição', 'Superposición', 'Chevauchement', 'Überschneidung'),
      metric_value: obj(`${v.shared.length} / 5`, `${v.shared.length} / 5`, `${v.shared.length} / 5`, `${v.shared.length} / 5`, `${v.shared.length} / 5`),
      bar:          dimensions.values.score,
      description:  dimensions.values.description,
      tags:         dimensions.values.tags
    },
    {
      key:          'pillars',
      color:        'green',
      icon:         '▣',
      title:        dimensions.pillars.title,
      metric_label: obj('Overlap', 'Sobreposição', 'Superposición', 'Chevauchement', 'Überschneidung'),
      metric_value: obj(`${p.shared.length} / 5`, `${p.shared.length} / 5`, `${p.shared.length} / 5`, `${p.shared.length} / 5`, `${p.shared.length} / 5`),
      bar:          dimensions.pillars.score,
      description:  dimensions.pillars.description,
      tags:         dimensions.pillars.tags
    },
    {
      key:          'worldview',
      color:        'purple',
      icon:         '◎',
      title:        dimensions.worldview.title,
      metric_label: obj('Type', 'Tipo', 'Tipo', 'Type', 'Typ'),
      metric_value: dimensions.worldview.type,
      bar:          dimensions.worldview.score,
      description:  dimensions.worldview.description,
      tags:         dimensions.worldview.tags
    }
  ];

  const strengths = [], challenges = [], gaps = [], dynamics = [];

  if (d >= .62) {
    strengths.push({
      title:       obj('Workable decision rhythm', 'Ritmo de decisão funcional', 'Ritmo de decisión funcional', 'Rythme décisionnel fonctionnel', 'Funktionsfähiger Entscheidungsrhythmus'),
      description: obj('The pair can negotiate timing without losing movement.', 'O par pode negociar timing sem perder movimento.', 'El par puede negociar timing sin perder movimiento.', 'Le duo peut négocier le timing sans perdre le mouvement.', 'Das Paar kann Timing verhandeln, ohne Bewegung zu verlieren.')
    });
  } else {
    challenges.push({
      title:       obj('Decision pace friction', 'Atrito no ritmo de decisão', 'Fricción en el ritmo de decisión', 'Friction du rythme décisionnel', 'Reibung im Entscheidungstempo'),
      description: obj('One person may push for action while the other needs more context.', 'Uma pessoa pode pressionar por ação enquanto a outra precisa de mais contexto.', 'Una persona puede presionar por acción mientras la otra necesita más contexto.', 'Une personne peut pousser à l\'action tandis que l\'autre a besoin de plus de contexte.', 'Eine Person kann auf Handlung drängen, während die andere mehr Kontext braucht.')
    });
    gaps.push({ gap: obj('Decision Pace Gap', 'Gap de Ritmo de Decisão', 'Brecha de Ritmo de Decisión', 'Écart de Rythme Décisionnel', 'Entscheidungstempo-Gap'), severity: 'medium' });
  }

  if (v.shared.length >= 2) {
    strengths.push({
      title:       obj('Shared moral base', 'Base moral compartilhada', 'Base moral compartida', 'Base morale partagée', 'Gemeinsame moralische Basis'),
      description: obj('Shared values create anchors for trust and direct conversation.', 'Valores compartilhados criam âncoras para confiança e conversa direta.', 'Los valores compartidos crean anclas para confianza y conversación directa.', 'Les valeurs partagées créent des ancrages de confiance et de conversation directe.', 'Gemeinsame Werte schaffen Anker für Vertrauen und direkte Gespräche.')
    });
  } else {
    challenges.push({
      title:       obj('Value distance', 'Distância de valores', 'Distancia de valores', 'Distance de valeurs', 'Wertedistanz'),
      description: obj('The pair may judge priorities from different moral anchors.', 'O par pode julgar prioridades a partir de âncoras morais diferentes.', 'El par puede juzgar prioridades desde anclas morales diferentes.', 'Le duo peut juger les priorités à partir d\'ancrages moraux différents.', 'Das Paar kann Prioritäten aus unterschiedlichen moralischen Ankern beurteilen.')
    });
    gaps.push({ gap: obj('Value Alignment Gap', 'Gap de Alinhamento de Valores', 'Brecha de Alineación de Valores', 'Écart d\'Alignement des Valeurs', 'Werteausrichtungs-Gap'), severity: 'medium' });
  }

  if (p.shared.length >= 2) {
    strengths.push({
      title:       obj('Compatible life structure', 'Estrutura de vida compatível', 'Estructura de vida compatible', 'Structure de vie compatible', 'Kompatible Lebensstruktur'),
      description: obj('Shared pillars make daily priorities easier to understand.', 'Pilares compartilhados facilitam compreender prioridades diárias.', 'Los pilares compartidos facilitan comprender prioridades diarias.', 'Les piliers partagés facilitent la compréhension des priorités quotidiennes.', 'Gemeinsame Säulen erleichtern das Verständnis täglicher Prioritäten.')
    });
  } else {
    challenges.push({
      title:       obj('Priority distribution gap', 'Gap de distribuição de prioridades', 'Brecha de distribución de prioridades', 'Écart de distribution des priorités', 'Prioritätsverteilungs-Gap'),
      description: obj('Different pillars may compete for time and emotional energy.', 'Pilares diferentes podem competir por tempo e energia emocional.', 'Pilares diferentes pueden competir por tiempo y energía emocional.', 'Des piliers différents peuvent entrer en concurrence pour le temps et l\'énergie émotionnelle.', 'Unterschiedliche Säulen können um Zeit und emotionale Energie konkurrieren.')
    });
    gaps.push({ gap: obj('Life Priority Gap', 'Gap de Prioridades de Vida', 'Brecha de Prioridades de Vida', 'Écart de Priorités de Vie', 'Lebensprioritäten-Gap'), severity: 'low' });
  }

  if (w.score >= .7) {
    strengths.push({
      title:       obj('Perspective complementarity', 'Complementaridade de perspectiva', 'Complementariedad de perspectiva', 'Complémentarité de perspective', 'Perspektiven-Komplementarität'),
      description: obj('The pair can expand interpretation by combining different lenses.', 'O par pode ampliar a interpretação combinando lentes diferentes.', 'El par puede ampliar la interpretación combinando lentes diferentes.', 'Le duo peut élargir l\'interprétation en combinant différentes lentilles.', 'Das Paar kann Interpretation durch unterschiedliche Perspektiven erweitern.')
    });
  } else if (w.score < .45) {
    challenges.push({
      title:       obj('Worldview friction', 'Atrito de visão de mundo', 'Fricción de visión del mundo', 'Friction de vision du monde', 'Weltanschauungs-Reibung'),
      description: obj('The pair may explain the same situation through conflicting lenses.', 'O par pode explicar a mesma situação por lentes conflitantes.', 'El par puede explicar la misma situación con lentes conflictivas.', 'Le duo peut expliquer la même situation à travers des lentilles conflictuelles.', 'Das Paar kann dieselbe Situation durch widersprüchliche Linsen erklären.')
    });
    gaps.push({ gap: obj('Worldview Gap', 'Gap de Visão de Mundo', 'Brecha de Visión del Mundo', 'Écart de Vision du Monde', 'Weltanschauungs-Gap'), severity: 'medium' });
  }

  dynamics.push({
    title:       obj('Decision rhythm', 'Ritmo de decisão', 'Ritmo de decisión', 'Rythme décisionnel', 'Entscheidungsrhythmus'),
    description: dimensions.decision.description
  });
  dynamics.push({
    title:       obj('Moral alignment', 'Alinhamento moral', 'Alineación moral', 'Alignement moral', 'Moralische Ausrichtung'),
    description: dimensions.values.description
  });
  dynamics.push({
    title:       obj('Life moment', 'Momento de vida', 'Momento de vida', 'Moment de vie', 'Lebensmoment'),
    description: dimensions.pillars.description
  });

  const overview = obj(
    `${profileA.display_name} and ${profileB.display_name} have a ${score}% compatibility score in this CheckMatch Lite result. This reading brings together action rhythm, values, current life pillars, and worldview to show where the pair naturally connects and where a clearer conversation may support the journey.`,
    `${profileA.display_name} e ${profileB.display_name} têm ${score}% de compatibility score neste resultado CheckMatch Lite. Esta leitura reúne ritmo de ação, valores, pilares de vida atuais e visão de mundo para mostrar onde o par se conecta naturalmente e onde uma conversa mais clara pode apoiar a jornada.`,
    `${profileA.display_name} y ${profileB.display_name} tienen ${score}% de compatibility score en este resultado CheckMatch Lite. Esta lectura reúne ritmo de acción, valores, pilares de vida actuales y visión del mundo para mostrar dónde la pareja se conecta naturalmente y dónde una conversación más clara puede apoyar el recorrido.`,
    `${profileA.display_name} et ${profileB.display_name} ont un compatibility score de ${score}% dans ce résultat CheckMatch Lite. Cette lecture réunit rythme d’action, valeurs, piliers de vie actuels et vision du monde pour montrer où le duo se connecte naturellement et où une conversation plus claire peut soutenir le parcours.`,
    `${profileA.display_name} und ${profileB.display_name} haben in diesem CheckMatch Lite Ergebnis einen Compatibility Score von ${score}%. Diese Lesart verbindet Handlungsrhythmus, Werte, aktuelle Lebenssäulen und Weltanschauung, um zu zeigen, wo das Paar natürlich in Verbindung steht und wo ein klareres Gespräch die Reise unterstützen kann.`
  );

  return {
    users:      [profileA.display_name, profileB.display_name],
    usernames:  [profileA.username, profileB.username],
    generated_at: new Date().toISOString(),
    results_app: {
      score,
      overview,
      dimensions,
      cards,
      match_type: { key: type, label: typeML[type] },
      dynamics:   dynamics.slice(0, 3),
      strengths:  strengths.slice(0, 3),
      challenges: challenges.slice(0, 3),
      gaps:       gaps.slice(0, 3), // redução para 1
      golden_tip: matchAIFallbackML()
    }
  };
}
