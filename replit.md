# UNI GENIUS

## Running on Replit
- Node.js 20, React 18, TypeScript, Vite 6, and Express.
- The **Start application** workflow runs `npm run dev`.
- The launcher starts Vite on `0.0.0.0:5000` and the Express API on port 8787. Vite proxies same-origin `/api/*` requests to the API.
- The imported web source files are at the repository root. Flutter source and ZIP archives are preserved unchanged.
- `npm run build` checks TypeScript and writes the web build, including PWA assets, to `dist/`.
- `npm run test:core` checks the five existing engineering formulas and invalid-input handling.
- `npm run server` runs only the API.

## Optional cloud AI
No provider is configured by default. Local tutor guidance, calculators, notes, and study tasks remain usable without credentials.
Cloud AI requires `AI_BASE_URL` (OpenAI-compatible API base URL), `AI_MODEL`, and `AI_API_KEY`. Set the API key through Replit Secrets; never expose it as a frontend variable. Restart the workflow after configuring a provider.
`GET /api/health` reports API availability. Unconfigured cloud chat returns HTTP 503 rather than fabricated AI output.

## Persistence and limits
Notes, tasks, and chat history are stored in the current browser's localStorage, not in a server database. PWA registration is production-only. Cloud AI, OCR, PDF indexing, and account sync are not implied by running the app.
