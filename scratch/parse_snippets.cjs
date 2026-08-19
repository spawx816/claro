const fs = require('fs');

const content = fs.readFileSync('C:/Users/spawx/.gemini/antigravity-ide/brain/1ef8f26a-3b20-409c-a248-345edd089ab0/.system_generated/steps/716/content.md', 'utf8');

// Search for product sections or descriptions in the HTML
const lines = content.split('\n');
console.log('Total lines:', lines.length);

// Let's search for keywords in the file
const keywords = [
  'Facturación Electrónica', 'Punto de Venta', 'Gestión Salud', 'Videovigilancia', 
  'Claro Cloud Empresarial', 'Azure', 'Backup Empresarial', 'Almacenamiento',
  'Collocation', 'Claro Backup', 'Seguridad Negocios', 'DDoS', 'SIEM', 'SD-WAN',
  'SASE', 'Pruebas Forenses', 'Vulnerabilidad', 'Capacitación', 'Claro drive',
  'Microsoft 365', 'Google Workspace', 'Página Web', 'Diseño Página Web',
  'Gestión de Negocios', 'Bots como Servicio', 'PBX Hosteada', 'Comunicación Unificada',
  'Wi-Fi Administrado', 'DevOps', 'Power Platform'
];

keywords.forEach(kw => {
  const idx = content.indexOf(kw);
  if (idx !== -1) {
    const snippet = content.substring(Math.max(0, idx - 50), Math.min(content.length, idx + 250))
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ');
    console.log(`[FOUND: ${kw}]:`, snippet);
  } else {
    console.log(`[NOT FOUND]: ${kw}`);
  }
});
