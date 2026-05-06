# Security Notes — Budhi Lite V1

## What changed

The previous backend-based concept expected the OpenAI API key to live in a server `.env` file. That is the recommended production approach, but it does not work with GitHub Pages alone because GitHub Pages is static hosting.

For this GitHub Pages-ready teaser, the key strategy was changed:

- The app does not include a backend.
- Each user may type their own OpenAI API key.
- The key is stored only in `sessionStorage` during the browser session.
- The key is never written into project files.
- The key is never committed to GitHub.
- The key is not stored in `localStorage`.
- The key is not saved with profiles or match reports.

## Why sessionStorage

`sessionStorage` survives navigation between pages in the same tab, so the key remains available when the user moves from Home to Forms to Results.

It is safer than `localStorage` for this use case because it is temporary and is cleared when the tab/session ends.

## Remaining risk

This still means the key exists in the browser while the session is active. That is acceptable only for a teaser/demo where users knowingly provide their own key.

Possible browser-side risks include:

- malicious extensions;
- compromised device/browser;
- injected scripts if the page is modified;
- users sharing screenshots or copied values accidentally.

## Production recommendation

For a public production application, return to the backend approach:

```text
Frontend → Backend → OpenAI API
```

The API key should live in:

```text
OPENAI_API_KEY
```

as an environment variable on the server or hosting provider, never in frontend JavaScript.
