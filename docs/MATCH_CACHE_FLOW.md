# Match cache and regenerate flow

## Goal

The Match Lite page should not rebuild a match every time the user returns to the Results page.

A saved match must be opened from `localStorage` / Supabase so that existing AI content in `results_ai.ai_content` is reused.

## Behavior

When a user selects a partner:

1. If a saved match exists for the pair, the main button becomes **Open saved Match**.
2. Opening the saved match renders the existing `results_app` and reuses the saved `results_ai`.
3. The AI card modal and full report use the cached language version when available.
4. The **Regenerate Match Lite** button appears only when a saved match already exists.
5. Regenerating rebuilds the deterministic match from the latest profiles and clears old match AI content for that pair.

## Why this matters

The multilingual AI flow depends on a stable saved match:

- the first AI output becomes the original;
- later languages are translated/adapted from that original;
- re-opening the match should reuse saved content instead of creating a new interpretation.

## Files changed

```txt
js/results_controller.js
js/storage.js
js/supabase_client.js
js/i18n.js
```
