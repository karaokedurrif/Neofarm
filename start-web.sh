#!/bin/sh
set -e
corepack enable
corepack prepare pnpm@latest --activate
cd /workspace
pnpm install --no-frozen-lockfile
# Build packages (skip if they fail - they're optional placeholders)
cd /workspace/packages/core && pnpm build 2>/dev/null || true
cd /workspace/packages/ui && pnpm build 2>/dev/null || true
cd /workspace/packages/species-config && pnpm build 2>/dev/null || true
# Build and start Next.js in production mode
cd /workspace/apps/web
# Keep existing build if it exists, otherwise build
if [ ! -f ".next/BUILD_ID" ]; then
  echo "Building Next.js for production..."
  pnpm build
else
  echo "Using existing Next.js build..."
fi
echo "Starting Next.js in production mode..."
exec pnpm start
