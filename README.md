# Claro Comm Repo 🏢✨

Repositorio centralizado para la gestión de comunicaciones, cotizaciones de Hosted PBX (HPBX Pymes y Corporativo), integración con correos/IMAP, base de datos PostgreSQL e inteligencia artificial.

---

## 🚀 Despliegue a la VPS con 1 Comando

Para desplegar automáticamente los últimos cambios desde tu máquina local a la VPS:

```bash
npm run deploy
```
*(o en PowerShell: `.\deploy.ps1`)*

Este comando realiza:
1. `git push origin main` (sube tus últimos cambios a GitHub).
2. Se conecta por SSH a la VPS (`74.208.192.253`).
3. Descarga los cambios con `git pull origin main`.
4. Instala dependencias (`npm install`) y compila el frontend (`npm run build`).
5. Recarga la aplicación con **PM2** con zero-downtime (`pm2 reload ecosystem.config.cjs`).

---

## 🛠️ Configuración Inicial en la VPS (Solo una vez)

Si es la primera vez que configuras la VPS, puedes ejecutar este comando directamente en la terminal de tu VPS:

```bash
curl -fsSL https://raw.githubusercontent.com/spawx816/claro/main/scripts/setup_vps.sh | bash
```

O paso a paso:
1. Clonar el repositorio en `/var/www/claro`:
   ```bash
   git clone https://github.com/spawx816/claro.git /var/www/claro
   cd /var/www/claro
   ```
2. Crear tu archivo `.env` con las variables de producción:
   ```bash
   cp .env.example .env
   nano .env
   ```
3. Instalar y construir:
   ```bash
   npm install
   npm run build
   ```
4. Iniciar con PM2:
   ```bash
   pm2 start ecosystem.config.cjs
   pm2 save
   pm2 startup
   ```

---

## 🌐 Configuración de Nginx (Opcional - Puerto 80/443)

Para redirigir las peticiones HTTP del puerto 80 al puerto 3000 de Node.js:

1. Copia la configuración:
   ```bash
   sudo cp nginx/claro.conf /etc/nginx/sites-available/claro
   sudo ln -s /etc/nginx/sites-available/claro /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```
2. (Opcional) Activar HTTPS con Certbot:
   ```bash
   sudo certbot --nginx -d tu-dominio.com
   ```

---

## 💻 Desarrollo Local

1. Instalar dependencias:
   ```bash
   npm install
   ```
2. Iniciar en modo desarrollo:
   ```bash
   npm run dev
   ```
3. Compilar para producción y probar servidor Node:
   ```bash
   npm run build
   npm start
   ```

---

## 📁 Estructura del Proyecto

```
├── .github/workflows/   # CI/CD automatizado con GitHub Actions
├── data/                # Base de datos local de respaldo (fallback JSON)
├── emails/              # Almacén de correos y plantillas
├── nginx/               # Plantilla de configuración Nginx reverse proxy
├── public/              # Recursos estáticos
├── scripts/             # Scripts de setup y despliegue (setup_vps.sh, deploy.js, remote_deploy.sh)
├── src/                 # Código fuente React (Components, Cotizador HPBX, Copilot)
├── .env.example         # Plantilla de variables de entorno
├── .gitignore           # Archivos ignorados por Git
├── db.js                # Conexión y operaciones con PostgreSQL
├── deploy.ps1           # Script de despliegue rápido para Windows PowerShell
├── ecosystem.config.cjs # Configuración de producción para PM2
├── package.json         # Dependencias y scripts del proyecto
├── server.js            # Servidor HTTP/API Node.js + Frontend SPA
└── vite.config.js       # Configuración de compilación Vite
```
