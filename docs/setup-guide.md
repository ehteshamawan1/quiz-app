# Setup Guide (Phase 1)

## Prerequisites
- Node.js 20+
- Docker Desktop

## Local Development
1. Copy `.env.example` to `.env` at repo root.
2. Start services:
   `docker-compose up -d`
3. Install dependencies:
   `npm install`
4. Run dev servers:
   `npm run dev`

## Notes
- Mailpit is available at http://localhost:8025.
- Backend runs on http://localhost:4000.
- Frontend runs on http://localhost:5173.
