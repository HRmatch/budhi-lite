# Match card presentation merge

This patch changes only the match presentation layer in `js/results_controller.js`.

## What changed

The match page no longer renders 8 dimension-related cards.

Previously, the UI displayed:

```txt
4 main cards:
- Decision Style
- Values
- Life Pillars
- Worldview

+ 4 complementary breakdown cards:
- Value dynamics
- Pillar dynamics
- Decision rhythm
- Worldview pairing
```

Now, the complementary information is merged into the corresponding main card:

```txt
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

## What did not change

- No formula logic was changed.
- No AI prompt or AI return schema was changed.
- No Supabase structure was changed.
- No report generation/cache logic was changed.
- AI card clicks still use the same `data-ai-key` values: `decision`, `values`, `pillars`, and `worldview`.

## Files changed

```txt
js/results_controller.js
```
