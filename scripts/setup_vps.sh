#!/usr/bin/env bash
# ==============================================================================
# Setup Inicial de VPS para Claro App
# Ejecutar en la VPS como root o con sudo:
# curl -sSL https://raw.githubusercontent.com/spawx816/claro/main/scripts/setup_vps.sh | bash
# ==============================================================================

set -e

echo "🚀 [1/6] Actualizando sistema..."
sudo apt update && sudo apt upgrade -y

echo "📦 [2/6] Instalando dependencias base (curl, git, ufw, nginx, certbot)..."
sudo apt install -y curl git ufw nginx certbot python3-certbot-nginx build-essential

echo "🟢 [3/6] Instalando Node.js (LTS 20.x)..."
if ! command -v node &> /dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt install -y nodejs
fi
node -v
npm -v

echo "⚡ [4/6] Instalando PM2 globalmente..."
sudo npm install -g pm2
pm2 startup systemd -u $USER --hp $HOME || true

echo "📁 [5/6] Creando directorio de la aplicación..."
sudo mkdir -p /var/www/claro
sudo chown -R $USER:$USER /var/www/claro

if [ ! -d "/var/www/claro/.git" ]; then
  echo "Clonando repositorio..."
  git clone https://github.com/spawx816/claro.git /var/www/claro
fi

cd /var/www/claro

echo "🔑 [6/6] Configurando archivo .env de producción..."
if [ ! -f "/var/www/claro/.env" ]; then
  cp .env.example .env
  echo "⚠️ Archivo /var/www/claro/.env creado desde plantilla. Por favor edita las credenciales si es necesario."
fi

echo "📦 Instalando paquetes y compilando frontend..."
npm install
npm run build

echo "🚀 Iniciando servicio con PM2..."
pm2 start ecosystem.config.cjs
pm2 save

echo "=============================================================================="
echo "✅ ¡Configuración completada con éxito!"
echo "Tu aplicación está corriendo en el puerto 3000 con PM2."
echo "Para verificar el estado: pm2 status"
echo "Para ver logs: pm2 logs claro-app"
echo "=============================================================================="
