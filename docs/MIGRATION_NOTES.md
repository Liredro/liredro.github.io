# React migration — implementation notes

## Kept from the previous site

- Original CSS layout, typography, project-card styling and responsive rules.
- Decorative ticker and infinitely advancing canvas chart.
- Biography, pixelated portrait slider and falling binary background.
- Carousel with pointer/touch scrolling, keyboard controls and navigation buttons.
- The same Bull vs Bear physics, collectible, enemy and particle systems.
- Existing links to credit-risk and equity-research projects.

## Architectural improvements

- Page split into six React components with state managed in React.
- Project metadata centralised in `src/data/projects.js`.
- Canvas animations wrapped in independently mountable/cleanable modules.
- Game exposed through an explicit `createBullBearGame` lifecycle interface, so both Game Mode and project card can launch it.
- Asset URLs use Vite's `BASE_URL` so project-site GitHub Pages paths resolve properly.
- CI runs lint, tests and build before deployment, with restricted token permissions.
- Production CSP injected into the page before scripts execute; Vite development HMR left unblocked.
- Dependabot configuration included.

## Verification performed during authoring

- TypeScript parser/transpiler: 16 JavaScript/JSX source modules checked for syntax errors (0 errors).
- PostCSS parser: both CSS files parsed successfully.
- Node test runner: 7 static/project tests passed.
- Chromium isolated engine smoke test: game enable/disable, overlay creation/removal and keyboard interaction; no page exceptions.
- Chromium isolated canvas smoke tests: chart, binary rain and pixel portrait module mounting; no page exceptions.

## Verification not possible in this environment

The npm registry was unavailable. As a result, `npm install`, ESLint, the real Vite production build, and a fully integrated React browser run were **not** executed. Browser tests exercised standalone game/effects modules, not the compiled React application. Run `npm run check` locally before publishing.

## Missing media

Image binaries and favicon were not supplied in this request. The archive includes placeholder directories only; copy exact original files into `public/assets/images` and `public/favicon.png` per README. The old HTML/CSS/JS source files themselves should not be copied back into `public`.
