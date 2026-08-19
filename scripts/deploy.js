import { execSync } from 'child_process';
import readline from 'readline';

const VPS_HOST = process.env.VPS_HOST || '74.208.192.253';
const VPS_USER = process.env.VPS_USER || 'root';
const APP_DIR = process.env.VPS_APP_DIR || '/var/www/claro';

function run(cmd, desc) {
  console.log(`\n⏳ ${desc}...`);
  try {
    execSync(cmd, { stdio: 'inherit', shell: true });
  } catch (err) {
    console.error(`❌ Error durante: ${desc}`);
    process.exit(1);
  }
}

async function main() {
  console.log('======================================================');
  console.log('🚀 Iniciando despliegue de Claro App a la VPS');
  console.log(`🌐 Destino: ${VPS_USER}@${VPS_HOST}:${APP_DIR}`);
  console.log('======================================================');

  // 1. Subir cambios locales a GitHub
  try {
    console.log('\n🔍 Verificando estado de Git...');
    run('git push origin main', 'Subiendo últimos cambios a GitHub (git push)');
  } catch (e) {
    console.log('ℹ️ Asegúrate de tener los cambios commiteados en local.');
  }

  // 2. Ejecutar comandos en la VPS vía SSH
  const remoteCommand = `bash -c "cd ${APP_DIR} && git pull origin main && npm install && npm run build && pm2 reload ecosystem.config.cjs || pm2 start ecosystem.config.cjs"`;
  
  console.log(`\n📡 Conectando por SSH a ${VPS_USER}@${VPS_HOST}...`);
  run(`ssh ${VPS_USER}@${VPS_HOST} "${remoteCommand}"`, 'Ejecutando actualización y recarga en la VPS');

  console.log('\n======================================================');
  console.log('🎉 ¡Despliegue finalizado exitosamente en la VPS!');
  console.log(`🔗 Verifica tu aplicación en: http://${VPS_HOST}:3000`);
  console.log('======================================================\n');
}

main();
