# SafeAI Workspace

A minimal, production-shaped Human-in-the-Loop AI Gateway and DLP platform.
Employees can paste text or upload a DOCX/XLSX/CSV document; the app detects
likely sensitive data (people, emails, phone numbers, financial amounts,
card/bank numbers, dates of birth, ID numbers), lets a human review and
approve exactly what should be masked, tokenizes only the approved values,
and sends **only the tokenized document** to OpenAI or Anthropic. The AI's
reply is validated for token integrity and rehydrated back to the original
values locally before being shown to the user — the original sensitive
values never leave the server.

## Architecture

```
backend/   FastAPI service — session store, document parsers, DLP engine,
           tokenizer, AI gateway (OpenAI/Anthropic), rehydrator, exporter
src/       React + TypeScript + Tailwind frontend (Vite) — the workspace UI
```

See `backend/app/` for the module layout (`services/dlp`, `services/tokenization`,
`services/rehydration`, `services/ai_gateway`, `services/export`, `providers/`).

## Running the backend

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # add OPENAI_API_KEY and/or ANTHROPIC_API_KEY to enable chat
uvicorn app.main:app --reload --port 8000
```

API docs: http://localhost:8000/docs

Run the test suite (includes the critical test proving original sensitive
values never appear in the outbound AI payload):

```bash
cd backend && source .venv/bin/activate && pytest
```

## Running the frontend

```bash
npm install
cp .env.example .env   # VITE_API_URL defaults to http://localhost:8000
npm run dev
```

Open http://localhost:5173.

## Security notes

- The frontend never sees an AI provider API key — all provider calls happen
  server-side through the `AIProvider` abstraction (`OpenAIProvider` /
  `AnthropicProvider`), so adding a new provider means adding one more class.
- Nothing is masked automatically: detection and masking are separate steps,
  and a human must explicitly approve what gets tokenized.
- Session state (document, findings, token mapping, chat history) lives only
  in server memory with a TTL (default 1 hour, configurable via
  `SESSION_TTL_SECONDS`) and is wiped on expiry or when the user clicks
  "End session". No sensitive values or token mappings are ever logged.
- AI responses are checked for token integrity before rehydration: exact
  tokens are restored, purely-cosmetic formatting differences (e.g.
  `[PERSON 1]` vs `[PERSON_1]`) are safely auto-corrected, and anything else
  (an unrecognized or content-altered token) is left unmasked with a warning
  surfaced in the UI — it is never guessed.
