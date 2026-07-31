# Repository Guidelines

## Project Structure & Module Organization

PassSave is a Chrome Manifest V3 extension built with React, TypeScript, Vite, and Tailwind.

- `src/popup/`: popup UI, React components, hooks, styles, and vault utilities.
- `src/background/service-worker.ts`: extension lifecycle and background behavior.
- `src/content/`: page-level autofill logic and injected styles.
- `src/shared/`: domain and renewal helpers shared across extension contexts.
- `public/icons/`: source SVG and generated Chrome icon sizes.
- `scripts/generate-icons.js`: regenerates PNG icons from `icon-source.svg`.
- `manifest.json`: permissions, entry points, and metadata.
- `dist/`: generated unpacked extension output; do not edit it directly.

Keep Chrome API code in its extension context. Put context-independent logic in `src/shared/`.

## Build, Test, and Development Commands

- `npm install`: install dependencies from `package-lock.json`.
- `npm run dev`: start the Vite development server.
- `npm run build`: run strict TypeScript checking, then produce `dist/`.
- `npm run preview`: preview the most recent Vite build.
- `npm run icons`: regenerate `icon16.png`, `icon48.png`, and `icon128.png`.

For browser testing, build, open `chrome://extensions/`, enable Developer mode, and load `dist/` unpacked.

## Coding Style & Naming Conventions

Match existing style: two-space indentation, single quotes, no semicolons, and trailing commas in multiline objects. Use `PascalCase` for components and files (`PasswordCard.tsx`), `camelCase` for functions and variables, and `useX` for hooks (`useVault.ts`). Keep types explicit at storage, crypto, and Chrome API boundaries. TypeScript is strict; avoid `any`.

There is currently no configured formatter or linter, so keep changes visually consistent with neighboring code.

## Testing Guidelines

No automated test framework or coverage target is configured. Every change must pass `npm run build`. Manually verify affected Chrome flows, especially vault lock/unlock, encrypted import/export, autofill, notifications, and popup persistence. If adding tests, use `*.test.ts(x)` beside the module and add a runner command to `package.json`.

## Commit & Pull Request Guidelines

History uses short improvement-oriented subjects such as `Mejoras v3`. Prefer clearer imperative commits, for example `Fix vault draft restoration`, and keep each commit focused.

Pull requests should include a summary, manual verification steps, and any relevant issue. Add screenshots for UI changes. Call out changes to permissions, storage formats, cryptography, or `manifest.json`, including migration and security implications.

## Security & Configuration

Never log, commit, or persist plaintext passwords or master credentials. Preserve the design in which sensitive vault data is encrypted and the master password remains session-scoped. Request only the minimum Chrome permissions needed.
