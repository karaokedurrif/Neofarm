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
# Start Next.js dev server
cd /workspace/apps/web
rm -rf .next
exec pnpm dev
