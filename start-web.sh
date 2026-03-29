#!/bin/sh
set -e

echo "🔧 Configurando pnpm..."
corepack enable
corepack prepare pnpm@latest --activate

echo "📦 Instalando dependencias..."
cd /workspace
pnpm install

echo "🏗️ Construyendo paquetes internos..."
cd /workspace/packages/core
pnpm build

cd /workspace/packages/ui
pnpm build

cd /workspace/packages/species-config
pnpm build

echo "🚀 Iniciando Next.js..."
cd /workspace/apps/web
rm -rf .next
pnpm dev
