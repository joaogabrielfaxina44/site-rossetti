# AERA 01 — Spatial Design System

A high-fidelity design system extracted from the **AERA 01 Spatial Headset** website concept.

Includes an interactive living catalog, authentic WebGL ribbon shaders, Three.js 3D wordmark, procedural WebGL2 chromatic metal buttons, atmospheric spatial surfaces, and W3C/DTCG-compliant design tokens.

---

## 🗂️ Structure

```text
aera-design-system/
├── design-system.html          # Interactive dual-view catalog (Overview & Components)
├── README.md                   # Repository documentation & usage
├── tokens/
│   ├── tokens.json             # W3C / DTCG design tokens (Colors, Typography, Radii, Elevation)
│   └── tokens.css              # Ready-to-import CSS custom properties
└── assets/
    └── overview/
        ├── index.html          # Full original interactive experience (Phase 1 Overview)
        ├── source-styles.css   # Cleaned source styles
        ├── favicon.svg         # AERA brand glyph
        ├── netflix.svg         # Cleaned streaming icon
        ├── metal-fx-standalone.js      # Procedural WebGL2 button sheen & liquid bend engine
        ├── chrome-wordmark-standalone.js # Three.js 3D polished wordmark & tilt module
        └── assets/             # Full local photographic, video & 3D assets
```

---

## 🚀 Quick Start

### 1. View Locally
Simply open `design-system.html` in any modern web browser:
- **Double click** `design-system.html` or navigate via `file:///.../design-system.html`.
- Use the top navigation bar to toggle between **Overview** and **Components**.

### 2. GitHub Pages Deployment
To publish as a live web showcase:
1. Push this repository to GitHub.
2. In GitHub, go to **Settings > Pages**.
3. Under **Build and deployment > Branch**, select `main` / `root` and click **Save**.
4. Set the custom entry URL to `design-system.html` (or create a symbolic link / rename to `index.html`).

---

## 🎨 Token Usage

### CSS
Import `tokens/tokens.css` into your stylesheet:
```css
@import url('./tokens/tokens.css');

.my-card {
  background: var(--aera-color-paper);
  color: var(--aera-color-ink);
  border: 1px solid var(--aera-border-line);
  border-radius: var(--aera-radius-md);
}
```

### JSON / Figma / Style Dictionary
Use `tokens/tokens.json` directly with modern token tooling (Tokens Studio, Style Dictionary, Tailwind CSS).

---

## 📄 License
Extracted for study, reference, and design system exploration. All concept product media and trademarks belong to their respective creators.
