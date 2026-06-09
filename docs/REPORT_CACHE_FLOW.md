# Report cache flow

This patch applies the same saved/regenerate strategy used for Match Lite to the full report buttons.

## Results page behavior

The report CTA checks the saved AI cache before choosing the button label:

- If a report already exists in the current language, the primary button shows `View saved report`.
- If a report exists in another language, the primary button shows `View report`; the report page will translate/adapt it if needed.
- If no report exists, the primary button shows `Generate report`.
- When a report exists in the current language, a secondary `Regenerate report` button is shown and opens `report.html` with a `refresh` parameter.

## Report page behavior

`report.html` still uses `getOrCreatePersonalizedReport()`:

1. Use cached report for the current language when available.
2. Translate/adapt from the original report when a report exists in another language.
3. Generate a new original only when no report exists, or when `refresh` is present.

## Storage

Reports continue to be stored in:

```txt
results_ai.ai_content.profile_full_report
results_ai.ai_content.match_full_report
```

with language-specific entries under `by_language`.
