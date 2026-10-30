# 💚 Liana — Finance × Technology

A component-based React portfolio featuring interactive finance projects and an original **Bull vs Bear** browser game. Migrated from a hand-written HTML/CSS/JavaScript site without redesigning the original interface.

## 🛠 Tech stack

- **React 19 + Vite** — reusable UI components and production asset bundling
- **JavaScript + CSS** — no unnecessary UI framework dependencies
- **ESLint and Node tests** — automated code-quality checks
- **GitHub Actions + GitHub Pages** — automatic checks and deployment from `main`
- **Dependabot** — weekly dependency and workflow update proposals

## 🚀 Run locally (first time)

Install Node.js **22.12+** and then run these commands in the repository root:

```bash
npm install
npm run dev
```

Vite prints a local URL such as `http://localhost:5173/`. Open it to explore the site.

Run code checks and build:

```bash
npm run lint
npm run test
npm run build
npm run preview
```

**Commit the generated `package-lock.json`** after your first `npm install`. On subsequent installs, use `npm ci` for exactly locked dependencies. The repository's Actions workflow supports the first deployment without a lockfile, but creating and committing one is strongly recommended.

## 🖼 Put your original images back

The code conversion was based on the HTML, CSS and JS files provided. The *binary image files were not provided*, so the ZIP intentionally contains image folders but not invented replacement photographs.

Copy these exact files from your existing repository into `public/`:

```text
public/
├── favicon.png
└── assets/images/
    ├── profile/
    │   ├── pixel-liana.gif
    │   └── portrait.webp
    ├── projects/
    │   ├── credit-risk-dashboard-preview.png
    │   ├── equity-research-lab-preview.png
    │   └── bull-vs-bear-preview.png
    └── game/
        └── bull-vs-bear-icon.png
```

Leave the files' names unchanged. Put any existing `bull-vs-bear.md` documentation in `docs/`.

## 📁 Structure

```text
src/
├── App.jsx                  # Page composition and game state
├── main.jsx                 # React entry point
├── components/              # Ticker, Navbar, Hero, About, Projects, Footer
├── data/                    # Portfolio projects and illustrative ticker values
├── effects/                 # Canvas chart, binary rain, portrait pixelation
├── game/                    # Self-contained game engine
├── styles/                  # Original site styles and game styles
└── utils.js                 # GitHub Pages-safe asset URL handling
```

## 🌐 Publish to GitHub Pages

1. **Back up the current working repository first.** Create a branch, or download a ZIP from GitHub before replacing anything.
2. Copy all files from this project into your site repository (root-level `index.html`, `package.json`, `.github`, `src`, `public`, etc.). Remove old root-level `assets/css` and `assets/js` **only after** confirming the React version works. Images must be in `public/assets/images/` as above.
3. **Remove or disable your previous static Pages deployment workflow**, or both workflows may run and overwrite each other's deployments.
4. Run `npm install`, `npm run check` locally; commit `package-lock.json` with the source.
5. Push to the repository's `main` branch.
6. In GitHub → repository **Settings → Pages → Build and deployment → Source**, select **GitHub Actions**.
7. In the **Actions** tab, confirm the *Build, check and deploy portfolio* workflow passes. Visit the Pages URL and test animations, navigation, project links, image clarity and game controls.

The Vite config automatically chooses `/<repository>/` as the GitHub Pages base path during GitHub Actions builds, or `/` for username.github.io repositories. This is compatible with the current `Liredro/Liana_Webstie` repository, even if you rename it. When publishing under a custom domain, set your appropriate `base: '/'` in `vite.config.js` and configure the domain in GitHub Pages.

## 🛡 Security considerations

- The website remains static: no backend, authentication system, database or secret keys.
- Production builds receive a restrictive CSP meta tag. This does not replace HTTP response headers or GitHub account protections.
- External links use `rel="noopener noreferrer"` and HTTPS.
- User-controllable content is not concatenated into HTML; React escapes rendered text.
- The game's small, fixed HTML fragments remain DOM-generated for compatibility, but contain no untrusted visitor input.
- Use strong GitHub account security, review Actions permissions and keep dependencies updated.

## 🎮 Game controls

Activate **GAME MODE** at the top or click the play icon on the Bull vs Bear project card. Move using **A/D** or **←/→**, jump with **W/Space/↑**, and drop through platforms with **S/↓**. Collect 15 candlesticks to win.

## Note on verification

JavaScript/JSX syntax and CSS parsing have been checked with available local tools. Package installation, `vite build`, React hydration/rendering, and live browser smoke tests require npm packages that were unavailable in the creation environment. Run the commands above before replacing your live deployment.
