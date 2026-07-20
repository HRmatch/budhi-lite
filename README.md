Checkmatch Lite v8 - 20 Jul 26

# Checkmatch Lite — Version 8

## Implemented Updates

This Version 8 update adds optional supplementary questions to the main questionnaire and fixes the storage and regeneration cycle for AI-generated profile card content.

---

## 1. Supplementary Questions

Optional free-text questions were added after each of the following main questions:

- `Qt2_reason`
- `Qt1_reason`
- `Qt6_reason`
- `Qt7_reason`
- `Qt8_reason`
- `Qt9_reason`

### New Questionnaire Sequence

```text
Qt2
→ Qt2_reason
→ Qt1
→ Qt1_reason
→ Qt6
→ Qt6_reason
→ Qt7
→ Qt7_reason
→ Qt8
→ Qt8_reason
→ Qt9
→ Qt9_reason
→ Finalization
```

### Supplementary Question Configuration

The supplementary questions were configured with:

```json
{
  "type": "free_text",
  "role": "supplementary",
  "optional": true,
  "skippable": true,
  "computed": true,
  "formula_excluded": true
}
```

### Interface Behavior

- The **Skip** button is displayed for supplementary questions.
- Users may continue even when the field is left empty.
- When a question is skipped, its answer is stored as an empty string: `""`.
- Answers remain available in `profile.answers` for future use in reports.
- Qt6 and Qt7 still require exactly five entries.

---

## 2. Formula Isolation

Questions marked with `formula_excluded: true` are ignored by profile calculations.

Content entered in supplementary questions does not change:

- Scores;
- Cards;
- Tags;
- Gaps;
- Dimensions;
- Match Lite;
- Compatibility Score;
- Deterministic profile results.

Supplementary answers are persisted but do not participate in the mathematical or semantic profile-building process.

---

## 3. AI and NLP Bypass

Questions with `role: "supplementary"`:

- Do not trigger the AI Resolver;
- Do not pass through the NLP engine used by the main questions;
- Do not open semantic fallback screens;
- Do not interfere with Qt6 and Qt7 validation rules.

---

## 4. Profile Revision

Each new questionnaire completion creates a new revision identifier:

```text
profile_revision
```

This revision distinguishes the current submission from previous submissions made by the same user.

---

## 5. AI Card Storage

AI-generated card content now follows this cycle:

1. The user completes the questionnaire.
2. A new `profile_revision` is created.
3. AI results from the previous revision are invalidated.
4. The user opens a card.
5. The system sends a new request to the AI.
6. The result is stored for the current card and language.
7. Subsequent visits reuse the saved result.
8. When the questionnaire is completed again, a new revision starts the cycle again.

### Expected Behavior

- AI content remains saved while the user does not retake the questionnaire.
- The first card click after a new submission queries the AI again.
- Following clicks reuse the saved result.
- Results from previous revisions are not displayed in the current profile.

---

## 6. Cache and Synchronization

The persistence logic was updated to prevent old results from being restored during synchronization.

Main changes:

- A new submission replaces the previous `results_ai` cache.
- Within the same revision, results continue to be added by card and language.
- Local storage and Supabase respect the current profile revision.
- An old cache cannot overwrite or repopulate a newer revision.
- No changes are required to the Supabase table structure.

---

## 7. Related Content

When the questionnaire is completed again, the following content is also invalidated:

- Golden Tip;
- Individual report;
- Detailed individual card texts.

These items are generated again using the current profile revision.

The **Match Lite** storage and generation flow was not changed.

---

## 8. Compatibility

- Existing profiles continue to work normally.
- Current saved results remain available until the user completes the questionnaire again.
- After a new submission, the profile starts using the revision and cache-invalidation logic.
- Existing Qt6, Qt7, NLP, fallback, and calculation rules remain unchanged.

---

## 9. Main Modified Files

- `data/phase1_snapshot.json`
- `js/forms_controller.js`
- `js/formula_phase1_lite.js`
- `js/storage.js`
- `js/supabase_client.js`
- `js/openai_client_browser.js`
- `js/report_agent_browser.js`

---

## 10. Validated Acceptance Criteria

- Users may skip all supplementary questions without interrupting the flow.
- Empty answers are persisted correctly.
- Qt6 and Qt7 still require exactly five entries.
- Supplementary questions do not change scores, cards, tags, gaps, or matches.
- A new submission invalidates previous AI-generated texts.
- The first card click after a new submission queries the AI again.
- The saved result is reused while the profile revision remains unchanged.
- Old results are not restored through Supabase synchronization.

---

## Reference Version

**Checkmatch Lite — Version 8**  
Updates: optional supplementary questions and AI card cache correction.
