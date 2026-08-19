# Despliegue con un comando en PowerShell
param (
    [string]$HostIP = "74.208.192.253",
    [string]$User = "root",
    [string]$AppDir = "/var/www/claro"
)

Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "🚀 Desplegando Claro App a la VPS ($User@$HostIP)..." -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan

Write-Host "`n[1/2] Subiendo cambios a GitHub..." -ForegroundColor Yellow
git push origin main

Write-Host "`n[2/2] Conectando por SSH y actualizando VPS..." -ForegroundColor Yellow
$remoteCmd = "cd $AppDir && git pull origin main && npm install && npm run build && (pm2 reload ecosystem.config.cjs || pm2 start ecosystem.config.cjs)"
ssh "$User@$HostIP" "$remoteCmd"

Write-Host "`n🎉 ¡Despliegue completado con éxito!" -ForegroundColor Green
Write-Host "🔗 Acceso: http://$HostIP:3000" -ForegroundColor Green
