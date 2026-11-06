# UNI GENIUS 3.0 — Foundation build

A React + TypeScript + Vite PWA foundation for a third-year mechanical engineering study assistant. The original Flutter project is preserved separately in `../unigenius-main`; this web project carries forward the seven original subject IDs and names, the Quick / Study / Professor response modes, and the honest module-status philosophy.

## Included and working in this build
- Responsive Arabic-first interface with English toggle and dark/light themes.
- Seven original courses/labs from `SubjectRegistry`.
- PWA manifest and service worker shell caching for previously loaded app assets.
- Local browser persistence for chat history, notes, and study tasks.
- Offline tutor guidance that is explicitly labelled as local guidance, not a language model.
- Deterministic calculators: Mach number, compression ratio, density, ideal-gas amount, and sensible heat.
- Sample engineering concept quiz.
- Diagnostics page that distinguishes implemented, partial, and not-yet-implemented engines.
- Optional server-side OpenAI-compatible chat adapter. API keys remain on the server.

## Run locally
Requirements: Node.js 20+.

```bash
npm install
npm run dev
```

The frontend runs on the Vite development server. The optional AI API runs separately:

```bash
cp .env.example .env
# Edit .env with a provider URL, secret API key, and model name
npm run server
```

For local development, configure a reverse proxy so `/api` reaches `http://localhost:8787`, or use the deployment instructions below. Do not expose `AI_API_KEY` in frontend environment variables or commit `.env`.

## Production build

```bash
npm run build
```

Deploy the generated `dist/` directory to a static host with SPA fallback. Deploy `server/index.mjs` as a Node service and route `/api/*` to it. The frontend currently calls `/api/chat` on the same origin.

## Offline behaviour — honest limits
- After the first successful online load, the service worker caches the application shell for repeat visits. Browser cache behaviour and storage quotas vary by browser.
- Notes, tasks, and chat history use localStorage on the current browser/device; they are not synced or encrypted in this foundation build.
- The calculator and basic tutor guidance work without internet.
- Cloud AI, OCR, PDF text extraction/indexing, image understanding, speech, account sync, and a fully offline local LLM are **not implemented yet**.
- The service worker does not cache API calls or user files.

## Engineering calculation notes
- Mach number: `Ma = V/a` (input both speeds in m/s).
- Compression ratio: `r = V1/V2` (enter consistent positive volumes).
- Density: `rho = m/V` (kg and m^3).
- Ideal gas amount: `n = PV/(RT)` (Pa, m^3, K).
- Sensible heat: `Q = m cp deltaT` (kg, J/(kg K), K).

These are intentionally a small tested-by-inspection starter set, not a complete mechanical engineering formula library. Validate all calculations against course notes before academic submission.

## Next implementation gates
1. Connect a chosen AI provider and verify rate limits, data policy, and model suitability.
2. Add PDF extraction with page-level citations and local full-text search (IndexedDB + SQLite/WASM or equivalent).
3. Implement OCR and image analysis with user correction for equations.
4. Expand formula engine with unit conversion, domain validation, tests, and worked textbook examples.
5. Add generated quizzes from indexed course materials, voice, and optional local model after measuring real device RAM/performance.
6. Add automated tests, accessibility checks, and deploy to a stable HTTPS origin before student rollout.

## Source migration
`src/data/subjects.ts` preserves the exact seven IDs and names from the uploaded Flutter `lib/data/subjects.dart`. The previous Flutter source and architecture notes should remain archived until each needed feature is migrated and validated. This web foundation does not claim to port unimplemented Flutter stubs into working engines.

## Validation performed for this handoff
- `node --check server/index.mjs` passed.
- Core TypeScript calculation engine compiled independently and its five formula checks plus invalid-input guard passed (`npm run test:core`).
- TypeScript/TSX syntax transpilation passed for all authored source modules.
- A full Vite production build was **not verified in the authoring environment** because npm package installation could not complete. Run `npm install` and `npm run build` in an environment with npm registry access before deployment.
