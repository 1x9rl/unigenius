# UNI GENIUS

## Running on Replit
- Node.js 20, React 18, TypeScript, Vite 6, and Express.
- The **Start application** workflow runs `npm run dev`.
- The launcher starts Vite on `0.0.0.0:5000` and the Express API on port 8787. Vite proxies same-origin `/api/*` requests to the API.
- The imported web source files are at the repository root. Flutter source and ZIP archives are preserved unchanged.
- `npm run build` checks TypeScript and writes the web build, including PWA assets, to `dist/`.
- `npm run test:core` checks the five existing engineering formulas and invalid-input handling.
- `npm run server` runs only the API.

## Cloud AI and attachments
- The backend uses the connected xAI integration through `@replit/connectors-sdk`. It discovers an image-capable model from xAI unless the non-secret `XAI_MODEL` setting overrides it.
- A direct `XAI_API_KEY` Replit Secret is supported only as a fallback if the integration cannot authenticate. Never put credentials in frontend code or commit them.
- `GET /api/health` checks the xAI model connection without exposing credentials. Cloud failures appear as explicit errors; the chat does not silently substitute local guidance.
- PNG/JPEG images are sent to xAI vision. Text-based PDFs are extracted with page labels, `.docx`, `.txt`, and `.md` files are extracted on the server. Scanned PDFs must be uploaded as page images; legacy `.doc` files and OCR from scanned PDFs are not supported.
- Chat history is stored in the current browser's localStorage. Image/document binary contents are not persisted there.

## Persistence and limits
Notes, tasks, and chat history are stored in the current browser's localStorage, not in a server database. PWA registration is production-only. Account sync, voice chat, PDF indexing, and OCR for scanned PDFs are not implemented.
