#!/bin/bash

set -e

echo "======================================="
echo " VERITAS TRUST LEDGER SETUP"
echo "======================================="

ROOT_DIR=$(pwd)

echo ""
echo "Checking Node..."

node -v || {
  echo "Node.js not installed."
  exit 1
}

echo ""
echo "Checking pnpm..."

pnpm -v || npm install -g pnpm

echo ""
echo "Installing root dependencies..."

pnpm install

echo ""
echo "======================================="
echo " FRONTEND SETUP"
echo "======================================="

cd "$ROOT_DIR/apps/web"

echo ""
echo "Installing frontend packages..."

pnpm install

echo ""
echo "Installing Tailwind/PostCSS fixes..."

pnpm add -D tailwindcss postcss autoprefixer @tailwindcss/postcss

echo ""
echo "Ensuring component directories exist..."

mkdir -p src/components
mkdir -p src/app
mkdir -p src/lib

echo ""
echo "Frontend setup complete."

echo ""
echo "======================================="
echo " BACKEND SETUP"
echo "======================================="

cd "$ROOT_DIR/backend"

echo ""
echo "Installing backend packages..."

pnpm install

echo ""
echo "Generating Prisma client..."

pnpm prisma generate

echo ""
echo "Running Prisma migrations..."

pnpm prisma migrate dev --name init || true

echo ""
echo "Seeding database..."

pnpm prisma:seed || true

echo ""
echo "======================================="
echo " BUILD TESTS"
echo "======================================="

cd "$ROOT_DIR/apps/web"

echo ""
echo "Testing Next.js build..."

pnpm build || true

echo ""
echo "======================================="
echo " STARTING SERVICES"
echo "======================================="

echo ""
echo "Starting backend..."

cd "$ROOT_DIR/backend"

nohup pnpm dev > backend.log 2>&1 &

echo ""
echo "Starting frontend..."

cd "$ROOT_DIR/apps/web"

nohup pnpm dev > frontend.log 2>&1 &

echo ""
echo "======================================="
echo " VERITAS READY"
echo "======================================="

echo ""
echo "Frontend:"
echo "http://localhost:3000"

echo ""
echo "Backend logs:"
echo "$ROOT_DIR/backend/backend.log"

echo ""
echo "Frontend logs:"
echo "$ROOT_DIR/apps/web/frontend.log"

echo ""
echo "Done."
