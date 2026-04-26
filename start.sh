#!/bin/bash
# ── KnowIt — One-shot setup & launch ────────────────────────
# Usage:  chmod +x start.sh && ./start.sh

set -e

echo ""
echo "  ✦ KnowIt — SRM Dashboard"
echo "  ──────────────────────────"

# ── Backend ──────────────────────────────────────────────────
echo ""
echo "  [1/4] Installing backend dependencies…"
cd backend
npm install --silent

# Create .env from example if it doesn't exist
if [ ! -f .env ]; then
  cp .env.example .env
  # Generate a random session secret
  SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
  # Replace placeholder in .env (works on both macOS and Linux)
  if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "s/replace-me-with-a-long-random-string-min-32-chars/$SECRET/" .env
  else
    sed -i "s/replace-me-with-a-long-random-string-min-32-chars/$SECRET/" .env
  fi
  echo "  ✓ Created backend/.env with a random SESSION_SECRET"
fi
cd ..

# ── Frontend ─────────────────────────────────────────────────
echo ""
echo "  [2/4] Installing frontend dependencies…"
cd frontend
npm install --silent

if [ ! -f .env ]; then
  cp .env.example .env
  echo "  ✓ Created frontend/.env"
fi
cd ..

# ── Root ─────────────────────────────────────────────────────
echo ""
echo "  [3/4] Installing root dependencies (concurrently)…"
npm install --silent

# ── Launch ───────────────────────────────────────────────────
echo ""
echo "  [4/4] Starting KnowIt…"
echo ""
echo "  Backend  →  http://localhost:4000"
echo "  Frontend →  http://localhost:5173"
echo ""
echo "  Demo login:  username=demo  password=demo123"
echo "  Press Ctrl+C to stop both servers."
echo ""

npm run dev
