Checkmatch Lite v8 - 08 Jul 26

Checkmatch Lite is a standalone teaser web application for Self-Profile and Match Lite. It runs as a static frontend on GitHub Pages with Supabase persistence and optional OpenAI integration.

What’s New in v8

Integrated Emotional Context: The AI now receives the current emotional state (Qt1) and symbolic traits derived from the selected color (Qt2) as independent variables, enabling deeper and less mechanical analyses.

Decision Rationalization: Decision-related variables have been unified in Qt9, making compatibility calculation more deterministic and efficient.

Optimized Writing: Worldview descriptions have been updated with a more fluid and organic tone, naturally integrating the meaning of colors (“revealing the foundation of who you seem to be”) instead of using direct quotations.

Refined AI Syntax: System prompts have been updated to ensure that the AI synthesizes technical information into practical insights, avoiding the repetition of raw data and focusing on the user experience.

Overview of Dimensions

The profile is based on four core dimensions:

Decision Style (Qt9 - Offensive, Defensive, Counter-Offensive, Versatile)

Values (Selection of moral values)

Life Pillars (Life support pillars)

Worldview

Compatibility (Match Lite)

The compatibility formula calculates the final score (0–100%) based on:

Decision Style: 25%

Values: 35%

Life Pillars: 20%

Worldview: 20%

Note: The multilingual AI cache system ensures that, once an insight is generated, it can be faithfully translated and adapted for other users while preserving interpretive consistency.

AI Behavior

API Key: Provided by the user via sessionStorage (not persisted).

Golden Tips: Now generated dynamically and contextually, incorporating mood and symbolic traits.

Smart Cache: AI results are stored in the results_ai table (Supabase), with automatic on-demand translation to maintain stability across different languages.

Key File Structure

js/formula_phase1_lite.js: Deterministic logic and profile calculation.

js/match_lite_formula.js: Pair compatibility algorithms.

js/openai_client_browser.js: Card details agent with symbolic trait injection.

js/report_agent_browser.js: Full report agent with emotional context support.

