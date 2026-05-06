# Budhi Lite V1 — GitHub Pages Ready

Standalone teaser web application for a first-layer Budhi Self-Profile and Match Lite experience.

This version was adjusted for **GitHub Pages** and does **not require a backend**. The user may insert their own OpenAI API key during the browser session to enable AI-generated card details.

## Pages

- `index.html` — Home, language selection, preset user selection, optional OpenAI API key input
- `forms.html` — Phase 1 Self-Profile form
- `results.html` — Individual report and Match Lite report

## Preset users

- beto
- luciana
- laercio
- ana_luiza / Ana Luiza
- idejan
- xarlys
- thierry
- admin

Default teaser password for regular users: `budhi-lite`  
Admin password: `budhi-admin`

This login is only a client-side demo gate. It is not secure authentication.

## API key behavior

The OpenAI API key is never committed to GitHub and is not hardcoded.

In this GitHub Pages version:

- the user types their own key in `index.html`;
- the key is stored temporarily in `sessionStorage` under `budhi_lite_openai_key`;
- the key survives navigation across `index.html`, `forms.html`, and `results.html` within the same tab/session;
- the key is removed when the tab/browser session ends or when the user clicks **Clear API key**;
- the key is not stored in `localStorage`;
- the key is not saved with profile results;
- the key is not sent to a Budhi backend, because this version has no backend.

If no key is present, the app uses local deterministic fallback details for the AI modals.

## Running locally

Because the app fetches `data/phase1_snapshot.json`, run it with a local static server instead of opening files directly:

```bash
python -m http.server 8000
```

Then open:

```text
http://127.0.0.1:8000/index.html
```

## Deploying to GitHub Pages

1. Create a GitHub repository.
2. Commit the contents of this folder.
3. Do not add any real API key to the repository.
4. In GitHub, go to `Settings > Pages`.
5. Choose the branch and folder to publish.
6. Open the generated GitHub Pages URL.

If you use a custom domain, point the domain to GitHub Pages normally. This version is static.

## Important security note

This browser-key approach is acceptable for a teaser/demo where each user provides their own key, but it is not the recommended production architecture. A production version should use a backend that stores the API key in environment variables or a secrets manager and proxies AI calls safely.

## Storage summary

- API key: `sessionStorage` only.
- Current user/language/model: `sessionStorage`.
- Deterministic profile reports: `localStorage`, so demo profiles can be reused across refreshes.
- No backend storage.

## Files

```text
index.html
forms.html
results.html
css/styles.css
js/i18n.js
js/users.js
js/session.js
js/storage.js
js/formula_phase1_lite.js
js/match_lite_formula.js
js/openai_client_browser.js
js/home.js
js/forms_controller.js
js/results_controller.js
data/phase1_snapshot.json
docs/SECURITY_NOTES.md
docs/FORMULA_CHANGES.md
```


## Supabase online buckets

This build saves profile and match buckets online using Supabase REST. See `docs/SUPABASE_SETUP.md` for the SQL and configuration details.
