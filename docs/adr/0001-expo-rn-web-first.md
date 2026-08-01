# Build in Expo React Native, ship web-first to GitHub Pages

The app is written as a proper Expo React Native + TypeScript project, but the MVP is
delivered as an **Expo web export hosted on GitHub Pages** — Alex opens a bookmarked URL
in Chrome on his (personal) Chromebook. Native Android (an EAS build) is a deliberate
later step, not part of MVP.

## Why this is worth recording

A reader will reasonably ask "why RN if it ships as a web page?" and "why does this
break from Settle/Paths, which are vanilla HTML with no build step?"

- **RN, not vanilla HTML:** unlike Settle/Paths (small, throwaway-discipline tools), Line
  is a larger, durable app we want to build properly — typed, test-driven (Matt Pocock
  TDD flow), with a clean path to a real installed Android app later from the *same*
  codebase. That future native option is the whole reason to pay the RN tax now.
- **Web-first, not Expo Go:** the target device is a Chromebook. Expo Go is an
  Android/iOS shell that loads the app from a dev server or a published update — it is a
  *developer* tool, not a way for Alex to just open and play. Expo's web target needs
  only Chrome (already present), no Play Store, no dev server, works offline as a PWA.
- **GitHub Pages:** `expo export --platform web` produces a static site, which restores
  the `git push` → live-in-~1-minute loop that makes Settle and Paths maintainable. RN
  does not cost us that loop.

## Consequences

- Anything native-only (haptics, native gestures beyond pointer/touch) must degrade
  gracefully on web, since web is the shipping target.
- Content must stay bundled/static (no backend) so the static export is self-contained.
