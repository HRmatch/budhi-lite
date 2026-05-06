# Formula Changes — Budhi Lite V1

## Source basis

The application was adapted from the Phase 1 Snapshot questionnaire and the existing Budhi formula logic.

## Individual profile formula

File:

```text
js/formula_phase1_lite.js
```

Inputs:

- `Qt4` — current movement state: GO, WAIT, WAIT and GO, WAIT or GO
- `Qt5` — desired goal-action stance: Offensive, Defensive, Counter-Offensive, All-Rounder
- `Qt6` — selected values, max 5
- `Qt7` — selected life pillars, max 5
- `Qt8` — worldview

Outputs:

```text
profile.results_app
├── title
├── overview
├── dimensions
│   ├── decision
│   ├── values
│   ├── pillars
│   └── worldview
├── cards
└── character_teaser
```

Main addition:

- deterministic descriptions were added for all four report cards;
- card-level fallback details were added for modal behavior when no API key is present;
- no final `character` is calculated in this V1.

## Match Lite formula

File:

```text
js/match_lite_formula.js
```

The Match Lite formula is a simplified version of the full Budhi match logic.

### Score weights

```text
Decision Style       25%
Values               35%
Life Pillars         20%
Worldview            20%
```

### Decision Style

Uses both `Qt4` and `Qt5`.

- exact match receives high alignment;
- Adaptive and Balanced are treated as flexible/complementary states;
- GO vs WAIT receives lower alignment because it may create timing friction.

### Values and Life Pillars

The formula considers:

- direct overlap;
- convergent relationships;
- divergent relationships.

This is intentionally simpler than the full super formula but preserves the idea that two different selections can still be compatible if they belong to related value or life-priority families.

### Worldview

Worldviews are grouped into broad interpretive families:

- practical;
- rational;
- meaning-oriented;
- human/people-oriented;
- ideal/future-oriented;
- sensory/aesthetic;
- self-oriented;
- survival/action-oriented.

The score considers:

- exact alignment;
- same group;
- complementary groups;
- divergent groups;
- neutral/different groups.

## AI details

File:

```text
js/openai_client_browser.js
```

AI details are not generated during the deterministic formula. They are generated only when the user clicks a card.

If an API key is present, the browser sends the request to OpenAI directly using the user's key.

If no key is present or the call fails, local fallback content is shown.

## Future migration back to Budhi

When integrating into the final Budhi app, the recommended changes are:

1. move `openai_client_browser.js` logic back to backend agents;
2. keep the Match Lite formula as a separate lightweight `super_formula_lite` layer;
3. persist results in `_userdb` buckets instead of `localStorage`;
4. replace client-side preset login with real authentication;
5. connect the character teaser to the full Self-Profile pipeline.
