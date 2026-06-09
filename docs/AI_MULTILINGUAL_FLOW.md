# AI multilingual flow for matches

This patch changes the AI behavior for Match Lite reports and card details.

## Goal

When two users have different interface languages, the match should keep one coherent AI interpretation and deliver it in each user's language.

Example:

1. Laercio logs in with English and generates the match with Idejan.
2. The AI creates the original match report/card details in English.
3. Idejan logs in with Portuguese or German and opens the same match.
4. If that language is not cached yet, a translation/adaptation agent converts the original AI JSON into Idejan's language.
5. The translated/adapted version is saved and reused later.

## Storage format

No SQL migration is required because `results_ai` is already a JSONB column.

The new content is stored under:

```json
{
  "ai_content": {
    "match_full_report": {
      "original": {
        "language": "en",
        "generated_by": "laercio",
        "generated_at": "...",
        "content": {}
      },
      "by_language": {
        "en": { "source": "original", "content": {} },
        "pt": { "source": "translation", "translated_from": "en", "content": {} }
      }
    },
    "match_cards": {
      "original": {
        "language": "en",
        "generated_by": "laercio",
        "cards": {
          "decision": {},
          "values": {},
          "pillars": {},
          "worldview": {}
        }
      },
      "by_language": {
        "en": { "source": "original", "cards": {} },
        "pt": { "source": "translation", "translated_from": "en", "cards": {} }
      }
    }
  }
}
```

## Match writing rule

Match AI text should be neutral about the pair:

- preferred: `Laercio and Idejan show...`, `the pair...`, `this match...`
- avoided: `you and Idejan...`, `your match...`

This makes contextual translation safer because the text is not tied to the first viewer's perspective.

## Fallback behavior

If no OpenAI API key is available and a translation is needed, the app cannot translate the original. In that case it shows the available source-language cached content with a note. Once an API key is present, the target-language version can be generated and cached.
