# Checkmatch Lite V1

Checkmatch Lite is a standalone teaser web application for a first-layer Self-Profile and Match Lite experience.

The application was designed to run on GitHub Pages and can operate without a traditional backend. User profiles and match results can be stored online through Supabase, while OpenAI-powered insights are generated using an API key provided by the user during the browser session.

## Overview

Checkmatch Lite provides a lightweight experience based on the first phase of the Self-Profile. It focuses on four core dimensions:

* Decision Style
* Values
* Life Pillars
* Worldview

From these results, the application can generate:

* an individual profile snapshot;
* a Match Lite compatibility report between two completed profiles;
* AI-generated card details and personalized reports when an OpenAI API key is provided.

## Pages

* `index.html` — Home, language selection, preset user selection and optional OpenAI API key input
* `dashboard.html` — Logged area with access to forms, results and match features
* `forms.html` — Phase 1 Self-Profile form
* `results.html` — Individual results and Match Lite results
* `report.html` — Personalized individual or match report generated from saved results

## Preset users

The current version includes preset demo users:

* `beto`
* `luciana`
* `laercio`
* `ana_luiza`
* `idejan`
* `xarlys`
* `thierry`
* `admin`

Default password for regular users

This login is a client-side demo gate only. It should not be treated as secure authentication for production use.

## OpenAI API key behavior

The application does not include a hardcoded OpenAI API key.

In this version:

* the user may enter their own OpenAI API key on the Home page;
* the key is stored temporarily in `sessionStorage`;
* the key is available only during the active browser session;
* the key is removed when the session ends or when the user clicks **Clear API key**;
* the key is not stored in `localStorage`;
* the key is not saved in Supabase;
* the key is not saved with profile or match results;
* the key is not committed to GitHub.

The session key is stored under:

```text
budhi_lite_openai_key
```

If no OpenAI API key is available, the application uses deterministic fallback content for AI-related details.

## Supabase storage

This version uses Supabase REST to store profile and match buckets online.

The Supabase integration allows completed profiles and match results to be reused across sessions and devices, instead of depending only on browser-local storage.

Main online buckets:

* `budhi_profiles` — stores individual Self-Profile results
* `budhi_matches` — stores Match Lite results

See:

```text
docs/SUPABASE_SETUP.md
```

for the SQL schema and Supabase configuration details.

## Local storage behavior

The application also keeps a local cache in the browser.

Storage summary:

* OpenAI API key: `sessionStorage` only
* Current user, language and selected model: `sessionStorage`
* Profile cache: `localStorage`
* Match cache: `localStorage`
* Online profile and match storage: Supabase

The local cache is used as a fallback and to improve responsiveness, but Supabase is the main storage layer for online use.

## Running locally

Because the application fetches local JSON data, it should be run with a local static server instead of opening the HTML files directly.

From the project root, run:

```bash
python -m http.server 8000
```

Then open:

```text
http://127.0.0.1:8000/index.html
```

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

* use a backend or serverless function to proxy OpenAI calls;
* store API keys in environment variables or a secrets manager;
* replace the client-side demo login with secure authentication;
* define stricter Supabase Row Level Security policies;
* avoid exposing any private service keys in frontend code.

The Supabase publishable key can be used in the browser when Row Level Security policies are configured correctly. The Supabase `service_role` key must never be placed in frontend code.

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

docs/SECURITY_NOTES.md
docs/FORMULA_CHANGES.md
docs/SUPABASE_SETUP.md
```

## Current scope

Checkmatch Lite V1 is focused on a first-layer profile and compatibility experience.

It does not yet include the full character model, deeper Self-Profile phases or the complete match system from the full application.
