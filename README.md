# Safety Manual Agent

A local prototype for reviewing telecom and cell tower safety manuals against a structured playbook.

## What it does

- Upload a PDF manual for OpenAI-powered review.
- Paste TXT/MD/manual text for local no-key testing.
- Edit the tower-safety playbook as JSON.
- Grade each playbook requirement as pass, partial, fail, not applicable, or needs review.
- Show evidence, citations, recommendations, confidence, and a short operational risk memo.
- Export the review as JSON.

## Run locally

```bash
npm start
```

Then open:

```text
http://127.0.0.1:4173
```

## OpenAI mode

The app can use the OpenAI Responses API for PDF/manual review when an API key is supplied in the UI or via `OPENAI_API_KEY`.

Without an API key, the app uses a simple local heuristic mode for testing the playbook workflow on pasted text. Heuristic mode is intentionally low-confidence and should not be used as a safety determination.

## Safety note

This is a review assistant, not a compliance certifier. All findings require human safety review before use in operations, customer submissions, or regulatory decisions.
