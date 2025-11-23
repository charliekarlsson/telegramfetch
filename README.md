# Monko Landing Page

Single-page experience for the $MONKO memecoin with a drifting parallax hero, a spinning logo + wordmark combo, and a second section that highlights community pillars on a lush jungle backdrop.

## Features
- Full-viewport hero backed by `landingbg1.png`, with the `monkoring4.png` mark gently wobbling in place.
- Local Jungle Zone wordmark rendered with a gold gradient and responsive sizing.
- Constant sideways drift that subtly darkens and blurs while scrolling, keeping focus on the content.
- Info grid describing treasury, quests, and council plus CTAs for onboarding.

## Getting started
1. Open `index.html` in any modern browser (Chrome, Edge, Firefox, Safari).
2. Keep the following assets next to the HTML file: `landingbg1.png`, `monkoring4.png`, and the `Jungle Zone/` font folder.
3. Customize the info cards or CTAs to match your roadmap.

> Tip: Compress the PNGs or convert them to WebP before deploying to reduce bandwidth.

## Development notes
- All styles still live inside `index.html`; split into separate CSS if the project expands.
- Background drift uses a CSS keyframe again; a tiny script simply toggles a class on scroll so the `bg-dimmer` overlay fades in (20% darker + blur) when the page is not at the very top.
- Adjust the second section’s cards or colors by editing the `.info-section`, `.info-grid`, and `.info-card` rules.
