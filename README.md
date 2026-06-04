# Safety Manual Agent

A local prototype for reviewing telecom and cell tower safety manuals against a structured playbook.

## What it does

- Upload a PDF manual for OpenAI-powered review.
- Paste TXT/MD/manual text for local no-key testing.
- Select an SOW base: Tower/Elevated, Electrical, Civil, or Other.
- Edit the telecom installation safety playbook as JSON.
- Grade each requirement as pass, partial, fail, not applicable, or needs review.
- Show evidence, citations, standards references, standard gaps, recommendations, confidence, and a short operational risk memo.
- Export the review as JSON.

## Run locally

```bash
npm start
```

Then open:

```text
http://127.0.0.1:4173
```

## Playbook

The default playbook covers visible Telecom Installation safety topics including fall protection, tower safety, RF/EME, rigging, cranes, electrical, LOTO, excavation, silica, PPE, emergency action planning, subcontractor management, and related field-safety programs.

Each topic includes required program elements and standards references such as OSHA 29 CFR 1926 and ANSI/ASSP A10.48 where applicable. The agent should check for complete program coverage, not just whether a heading exists.

## OpenAI mode

The app can use the OpenAI Responses API for PDF/manual review when an API key is supplied in the UI or via `OPENAI_API_KEY`.

Without an API key, the app uses a simple local heuristic mode for testing the playbook workflow on pasted text. Heuristic mode is intentionally low-confidence and should not be used as a safety determination.

## Hosted upload limit

The current prototype sends uploaded PDFs as multipart form data and limits direct PDF review to 25 MB. If your hosting platform has a smaller request-body limit, raise that platform limit or move file uploads to object storage.

Production should eventually move file uploads to object storage plus OpenAI file/vector-store ingestion so large manuals do not depend on a single web request.

## Safety note

This is a review assistant, not a compliance certifier. All findings require human safety review before use in operations, customer submissions, or regulatory decisions.
