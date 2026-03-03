# Implementation Plan: Keyword Matching Options

## 1. Knowledge Base Update
- Create a new constant `KEYWORD_MATCHING_GUIDE` in `services/gemini.ts`.
- This guide will detail:
    - **Broad Match**: Best for Smart Bidding, captures related searches.
    - **Phrase Match**: Moderate control, includes meaning of keyword.
    - **Exact Match**: Tightest control, same meaning.
    - **Negative Keywords**: Crucial for filtering irrelevant traffic.
    - **Close Variants**: How they work for each match type.

## 2. Prompt Engineering Update
- Inject `KEYWORD_MATCHING_GUIDE` into the `generateCampaign` prompt.
- Update instructions to:
    - Prioritize **Broad Match** when paired with Smart Bidding (Target CPA/ROAS).
    - Use **Phrase/Exact Match** for high-intent, specific terms or when budget is limited.
    - Explicitly generate **Negative Keywords** based on the business context to prevent wasted spend.

## 3. User Input Handling
- Ensure `campaignTypePreference` influences the match type strategy (e.g., "Search" might lean towards Phrase/Exact initially for control, while "PMAX" uses Broad/Signals).
- If the user selects "Smart Bidding" (or "AI Calculated" budget), the system should recommend Broad Match.

## 4. Output Schema
- Verify the `keywords` schema in `generateCampaign` supports `matchType` correctly (it already does).
- Ensure the AI populates `matchType` intelligently based on the strategy.

## 5. Execution
- Modify `services/gemini.ts` to include the new guide and prompt logic.
