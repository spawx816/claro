import fs from 'fs';
import path from 'path';

const parsedJsonPath = 'C:/Users/Spawx/.gemini/antigravity-ide/scratch/claro-comm-repo/scratch/all_parsed.json';
const repoPath = 'C:/Users/Spawx/.gemini/antigravity-ide/scratch/claro-comm-repo/src/components/CommunicationsRepo.jsx';

try {
  const parsedData = JSON.parse(fs.readFileSync(parsedJsonPath, 'utf8'));
  
  // Categorize based on keywords in the subject
  const getCategory = (subject) => {
    const text = subject.toLowerCase();
    if (text.includes('microsoft 365') || text.includes('cloud') || text.includes('servidor') || text.includes('vps')) {
      return 'Cloud';
    }
    if (text.includes('iot') || text.includes('smart connect') || text.includes('móvil') || text.includes('movil') || text.includes('futbol') || text.includes('claro video') || text.includes('renta para oferta')) {
      return 'Móvil';
    }
    if (text.includes('portabilidad') || text.includes('port out') || text.includes('telefon') || text.includes('hpbx') || text.includes('centralita')) {
      return 'Telefonía IP';
    }
    if (text.includes('videovigilancia') || text.includes('cámara') || text.includes('camara') || text.includes('seguridad')) {
      return 'Seguridad';
    }
    if (text.includes('mesh') || text.includes('wi-fi') || text.includes('wifi') || text.includes('ont') || text.includes('fibra') || text.includes('internet fijo') || text.includes('laptops')) {
      return 'Conectividad';
    }
    return 'Conectividad';
  };

  // Clean body text from multiple carriage returns, mailto links, and raw lines
  const cleanBody = (bodyText) => {
    if (!bodyText) return '';
    let cleaned = bodyText
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/<mailto:[^>]+>/gi, '')
      .replace(/<http[^>]+>/gi, '')
      .replace(/\t+/g, ' ')
      .trim();
    
    // Truncate bottom history (e.g. From: Sent:...) to make it a neat single communication,
    // but keep it as part of detail body if relevant. Let's keep it clean.
    return cleaned;
  };

  const processed = parsedData.map((item, index) => {
    const category = getCategory(item.subject);
    
    // Clean subject title from prefix ANUNCIO NO. XXXX:
    let title = item.subject.replace(/^ANUNCIO\s+NO\.\s*\d+[-A-Z]*:\s*/i, '');
    title = title.replace(/^¡*(IMPORTANTE|BUENAS NOTICIAS|NUEVO EQUIPO WI-FI MESH)!*\s*/i, '');
    title = title.trim();
    // Capitalize first letter
    title = title.charAt(0).toUpperCase() + title.slice(1);

    // Identify if it's an update
    let isUpdate = false;
    let updatesId = null;
    let version = '1.0';

    if (item.subject.includes('8443-A') || item.subject.toLowerCase().includes('cambio de plan') || item.subject.toLowerCase().includes('cambios en los paquetes')) {
      if (item.subject.includes('8443-A')) {
        isUpdate = true;
        updatesId = 'comm-parsed-iot-base'; // We'll link to an IoT base announcement
        version = '2.0';
      }
    }
    
    // Create friendly custom IDs
    let id = `comm-parsed-${index + 1}`;
    if (item.subject.includes('8443-A')) id = 'comm-parsed-iot-update';

    return {
      id,
      title,
      date: item.date,
      category,
      author: item.senderName,
      body: cleanBody(item.body),
      version,
      updatesId,
      isUpdate
    };
  });

  // Let's add a base IoT message to link the update
  const baseIoT = {
    id: 'comm-parsed-iot-base',
    title: 'Nuevos Planes de Datos IoT Smart Connect para Dispositivos IoT',
    date: '2026-01-29',
    category: 'Móvil',
    author: 'Info-Canales (ClaroDom)',
    body: 'Disponibilidad de nuevos planes de datos para dispositivos IoT (anteriormente Conectividad M2M o LVS) diseñados para GPS, Medidores, Cámaras inalámbricas, etc. SMS incluidos y topes de navegación libre.',
    version: '1.0',
    updatesId: null,
    isUpdate: false
  };
  processed.push(baseIoT);

  // Read the current CommunicationsRepo.jsx
  const currentContent = fs.readFileSync(repoPath, 'utf8');

  // We want to replace initialCommunications array definition
  const regex = /export const initialCommunications = \[([\s\S]*?)\];/;
  
  const newArrayStr = `export const initialCommunications = ${JSON.stringify(processed, null, 2)};`;
  const updatedContent = currentContent.replace(regex, newArrayStr);

  fs.writeFileSync(repoPath, updatedContent);
  console.log(`Successfully merged ${processed.length} real communications into CommunicationsRepo.jsx.`);

} catch (e) {
  console.error("Failed to merge parsed data:", e);
}
