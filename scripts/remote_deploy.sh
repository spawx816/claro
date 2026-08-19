#!/usr/bin/env bash
# ==============================================================================
# Script de Despliegue en la VPS (remote_deploy.sh)
# Ejecuta pull, build e inicio zero-downtime en PM2
# ==============================================================================

set -e

APP_DIR="/var/www/claro"

echo "🔄 [1/4] Accediendo a $APP_DIR y descargando últimos cambios..."
cd "$APP_DIR"
git fetch origin main
git reset --hard origin/main

echo "📦 [2/4] Instalando dependencias..."
npm install

echo "🏗️ [3/4] Compilando frontend (Vite)..."
npm run build

echo "🚀 [4/4] Recargando aplicación en PM2..."
pm2 reload ecosystem.config.cjs --update-env || pm2 start ecosystem.config.cjs

echo "✅ ¡Despliegue completado con éxito en la VPS!"
