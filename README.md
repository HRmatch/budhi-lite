# Checkmatch Lite V7 - 08 Jun 26

Checkmatch Lite is a standalone teaser web application for a first-layer Self-Profile and Match Lite experience.

The application is designed to run on GitHub Pages as a static frontend. It uses Supabase REST for online persistence and can generate OpenAI-powered insights when the user provides an OpenAI API key during the active browser session.

Some internal storage keys and legacy labels still use the `budhi_lite` prefix for compatibility with previous builds.

## Overview

Checkmatch Lite provides a lightweight profile and compatibility experience based on the first phase of the Self-Profile.

The current profile layer focuses on four core dimensions:

- Decision Style
- Values
- Life Pillars
- Worldview

From these dimensions, the application can generate:

- an individual Self-Profile snapshot;
- a Match Lite compatibility result between two completed profiles;
- AI card details for each core dimension;
- AI-generated Golden Tips for individual profiles and matches;
- personalized individual and match reports;
- multilingual AI outputs with caching and contextual translation/adaptation.

## Main experience

### Individual Self-Profile

The user completes the Phase 1 form and receives a first-layer profile snapshot based on:

- current and desired decision movement;
- selected values;
- selected life pillars;
- worldview.

The individual result page displays the four core cards and can request AI details for each card.

### Match Lite

Match Lite compares two completed profiles using a simplified compatibility formula.

The match result currently uses:

```text
Decision Style       25%
Values               35%
Life Pillars         20%
Worldview            20%
```

The match page displays four main dimension cards:

```text
Decision Style
└── Decision rhythm

Values
└── Value dynamics
    ├── Common ground
    ├── Compatible
    └── Potential frictions

Life Pillars
└── Pillar dynamics
    ├── Common ground
    ├── Compatible
    └── Potential frictions

Worldview
└── Worldview pairing
```

Additional match sections include:

- Key Dynamics
- Strengths
- Challenges
- Golden Tip
- Match Gaps

The previous standalone `Match Type` block is no longer shown in the match results page.

## AI behavior

AI is used only when an OpenAI API key is available in the user's browser session.

The application includes AI flows for:

- card details in the individual result;
- card details in the match result;
- individual Golden Tip;
- match Golden Tip;
- full individual report;
- full match report.

If no OpenAI API key is present, the app falls back to deterministic/local content where available.

## Golden Tip behavior

Golden Tips are no longer only static deterministic text from `results_app`.

The app now uses a dedicated AI Golden Tip flow:

- `profile_golden_tip` for individual Self-Profile results;
- `match_golden_tip` for Match Lite results.

For individual results, the Golden Tip is directed to the user and synthesizes:

- Decision Style
- Values
- Life Pillars
- Worldview

For match results, the Golden Tip is directed to the pair and synthesizes:

- decision rhythm;
- value dynamics;
- pillar dynamics;
- worldview pairing.

Match Golden Tips are written neutrally about the pair, rather than from only one participant's point of view.

## Multilingual AI cache

AI content is cached by language to keep results stable across sessions and users.

The first generated AI output becomes the original version. When another user opens the same result in a different language, the app translates/adapts the original AI output instead of generating a new interpretation from scratch.

Example:

```text
Laercio generates a match in English
↓
The AI creates the original English interpretation
↓
Idejan opens the same match in Portuguese or German
↓
The app translates/adapts the original interpretation
↓
The translated/adapted version is saved and reused
```

This keeps the match interpretation coherent for both users while respecting each user's selected language.

AI content is stored under:

```text
results_ai.ai_content
```

Current AI content buckets include:

```text
profile_cards
match_cards
profile_golden_tip
match_golden_tip
profile_full_report
match_full_report
```

Each bucket follows the same general structure:

```text
original
by_language
```

## Match cache and regeneration

The Match Lite page does not rebuild a match every time the user returns to the results page.

When a saved match exists:

- the app opens the saved match;
- deterministic results are reused;
- saved AI content is preserved;
- cached card details, Golden Tips and reports are reused when available.

When the user explicitly chooses to regenerate the match:

- the deterministic match is rebuilt using the latest profile data;
- previous AI content for that match is cleared;
- future AI outputs are generated from the new match state.

## Full report behavior

The report page uses the same cache-first strategy.

When opening a report:

1. If a report exists in the current language, it is displayed from cache.
2. If a report exists in another language, it is translated/adapted into the current language.
3. If no report exists, a new original report is generated.
4. A report is regenerated only when the user explicitly uses the regenerate flow.

Reports are stored in:

```text
results_ai.ai_content.profile_full_report
results_ai.ai_content.match_full_report
```

## Pages

- `index.html` — Home, language selection, preset user selection and optional OpenAI API key input
- `dashboard.html` — Logged area with access to the form, results and match features
- `forms.html` — Phase 1 Self-Profile form
- `results.html` — Individual results and Match Lite results
- `report.html` — Personalized individual or match report generated from saved results

## Preset users

The current version includes preset demo users:

- `beto`
- `luciana`
- `laercio`
- `ana_luiza`
- `idejan`
- `xarlys`
- `thierry`
- `admin`

Default password for regular users:

```text
budhi-lite
```

Admin password:

```text
budhi-admin
```

This login is a client-side demo gate only. It should not be treated as secure authentication for production use.

## OpenAI API key behavior

The application does not include a hardcoded OpenAI API key.

In this version:

- the user may enter their own OpenAI API key on the Home page;
- the key is stored temporarily in `sessionStorage`;
- the key is available only during the active browser session;
- the key is removed when the session ends or when the user clicks **Clear API key**;
- the key is not stored in `localStorage`;
- the key is not saved in Supabase;
- the key is not saved with profile or match results;
- the key is not committed to GitHub.

The session key is stored under:

```text
budhi_lite_openai_key
```

The selected OpenAI model is also stored in session storage under:

```text
budhi_lite_openai_model
```

If no OpenAI API key is available, the app uses deterministic fallback content for AI-related areas when possible.

## Supabase storage

This version uses Supabase REST to store profile and match buckets online.

The Supabase integration allows completed profiles, match results and generated AI content to be reused across sessions and devices.

Main online tables:

- `budhi_profiles` — stores individual Self-Profile results
- `budhi_matches` — stores Match Lite results

Main stored fields:

```text
answers
results_app
results_ai
updated_at
```

The `results_ai` field is a JSONB object and stores AI-generated and translated/adapted content.

See:

```text
docs/SUPABASE_SETUP.md
```

for the SQL schema and Supabase configuration details.

## Local storage behavior

The application also keeps a local browser cache.

Storage summary:

- OpenAI API key: `sessionStorage` only
- Current user, language and selected model: `sessionStorage`
- Profile cache: `localStorage`
- Match cache: `localStorage`
- Online profile and match storage: Supabase

Local storage improves responsiveness and provides fallback behavior, but Supabase is the main storage layer for online use.

## Running locally

Because the application fetches local JSON and JavaScript resources, it should be run with a local static server instead of opening the HTML files directly.

From the project root, run:

```bash
python -m http.server 8000
```

Then open:

```text
http://127.0.0.1:8000/index.html
```

On Windows, this may also work:

```bash
py -m http.server 8000
```

The project can also be tested with the VS Code Live Server extension.

## GitHub Pages deployment

The project is compatible with GitHub Pages.

The root of the repository should contain:

```text
index.html
dashboard.html
forms.html
results.html
report.html
css/
js/
data/
docs/
```

In GitHub Pages settings, the recommended configuration is:

```text
Source: Deploy from a branch
Branch: main
Folder: / (root)
```

## Security notes

This version is suitable for a teaser, prototype or controlled demo.

For a production application, the recommended architecture is different:

- use a backend or serverless function to proxy OpenAI calls;
- store API keys in environment variables or a secrets manager;
- replace the client-side demo login with secure authentication;
- define stricter Supabase Row Level Security policies;
- avoid exposing any private service keys in frontend code.

The Supabase publishable key can be used in the browser when Row Level Security policies are configured correctly. The Supabase `service_role` key must never be placed in frontend code.

The OpenAI API key is user-provided and session-scoped. It should not be hardcoded in any project file.

## Main files

```text
index.html
dashboard.html
forms.html
results.html
report.html

css/styles.css

js/i18n.js
js/users.js
js/session.js
js/storage.js
js/supabase_client.js
js/formula_phase1_lite.js
js/match_lite_formula.js
js/openai_client_browser.js
js/report_agent_browser.js
js/home.js
js/dashboard.js
js/forms_controller.js
js/results_controller.js
js/report_controller.js

data/phase1_snapshot.json

docs/AI_MULTILINGUAL_FLOW.md
docs/FORMULA_CHANGES.md
docs/MATCH_CACHE_FLOW.md
docs/MATCH_CARD_PRESENTATION_MERGE.md
docs/REPORT_CACHE_FLOW.md
docs/SECURITY_NOTES.md
docs/SUPABASE_SETUP.md
```

## Current scope

Checkmatch Lite V7 is focused on a first-layer profile and compatibility experience.

It does not yet include:

- the full character model;
- deeper Self-Profile phases;
- the complete match system from the full Budhi application;
- production-grade authentication;
- backend-proxied OpenAI calls.

The current version is intended as a teaser and validation layer for the broader Checkmatch/Budhi experience.
