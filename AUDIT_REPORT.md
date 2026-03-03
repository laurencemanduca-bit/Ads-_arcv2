# Pre-Deployment Audit Report
**Date:** February 2026
**Auditor:** AI QA Engineer
**Status:** In Progress

## 🔴 CRITICAL (0 Issues)
*None identified at this stage.*

## 🟠 HIGH (2 Issues)
**1. Missing Input Validation in Onboarding Wizard**
- **Location:** `src/components/OnboardingWizard.tsx` (Steps 2, 3, 5)
- **Issue:** Numeric fields (`monthlyBudget`, `targetLeadsPerMonth`, `avgSaleValue`, `customerLtv`, `maxCpa`) accept non-numeric input. Users can enter text, causing calculation errors in the AI prompt or ROI projections.
- **Expected:** Fields should restrict input to numbers.
- **Fix:** Change `<input type="text">` to `<input type="number">` and add `min="0"` constraints.

**2. Accessibility Violation in Auth Forms**
- **Location:** `src/components/Auth.tsx`
- **Issue:** Form labels are not programmatically associated with their input fields. Screen readers cannot identify which label belongs to which input.
- **Expected:** `<label>` tags must have `htmlFor` attributes matching the `id` of the input.
- **Fix:** Add `id` to inputs and `htmlFor` to labels.

## 🟡 MEDIUM (3 Issues)
**1. Step Navigation Logic Flaw**
- **Location:** `src/components/OnboardingWizard.tsx` (`nextStep` function)
- **Issue:** Users can click "Next" without filling in required fields for the current step. Validation only happens at the final submission or via HTML5 browser tooltips which are inconsistent.
- **Expected:** The "Next" button should be disabled or trigger validation for the current step's fields before proceeding.
- **Fix:** Implement per-step validation logic in `nextStep`.

**2. Missing Document Title Updates**
- **Location:** `src/App.tsx`
- **Issue:** The browser tab title remains static ("Vite + React + TS") or generic. It does not reflect the current view (e.g., "Login", "New Campaign", "Audit").
- **Expected:** Document title should update based on the current route/mode.
- **Fix:** Add `useEffect` hooks to update `document.title`.

**3. Hardcoded API Keys in Source**
- **Location:** `src/services/firebase.ts`
- **Issue:** Firebase config is hardcoded. While standard for public Firebase apps, it's better practice to use environment variables for flexibility across environments.
- **Fix:** Move config values to `import.meta.env.VITE_FIREBASE_...`.

## 🟢 LOW (2 Issues)
**1. Low Contrast Text**
- **Location:** `src/components/Auth.tsx`
- **Issue:** `text-slate-400` on white background might be hard to read for some users.
- **Fix:** Darken to `text-slate-500`.

**2. Missing Loading State on Submit**
- **Location:** `src/components/OnboardingWizard.tsx`
- **Issue:** The "Generate Strategy" button shows a loading state in `App.tsx` (overlay), but the button itself doesn't provide immediate feedback when clicked.
- **Fix:** Add `disabled={isSubmitting}` and a spinner to the button itself.
