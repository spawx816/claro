const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const ONEDRIVE_DIR = 'C:\\Users\\spawx\\OneDrive - Claro Dominicana';

// Helper to determine category from path and filename
function determineCategory(relPath, fileName) {
  const p = relPath.toLowerCase();
  const f = fileName.toLowerCase();

  if (p.includes('levantamiento') || f.includes('cotiz') || f.includes('hpbx') || p.includes('cotizacion')) {
    return 'HPBX y Telefonía IP';
  }
  if (p.includes('flota') || p.includes('offer') || f.includes('offer') || p.includes('paquetes') || p.includes('prepago') || p.includes('móvil') || p.includes('movil')) {
    return 'Móvil Corporativo';
  }
  if (p.includes('procedimiento') || p.includes('proceso') || f.includes('procedimiento') || f.includes('proceso')) {
    return 'Procedimientos & Procesos';
  }
  if (p.includes('plantilla') || f.includes('plantilla') || f.includes('contrato') || f.includes('acuerdo')) {
    return 'Plantillas & Propuestas';
  }
  if (p.includes('cloud') || f.includes('cloud') || f.includes('server') || f.includes('datacenter')) {
    return 'Cloud & Data Center';
  }
  if (p.includes('mpls') || p.includes('enlace') || f.includes('enlace') || f.includes('conectividad') || f.includes('dia')) {
    return 'Conectividad & MPLS';
  }
  if (p.includes('ids') || p.includes('seguridad') || f.includes('seguridad')) {
    return 'Ciberseguridad & SOC';
  }
  return 'Documentaciones Comerciales';
}

function extractAuthorAndTitle(fileName) {
  const cleanName = fileName.replace(/\.[^/.]+$/, '');
  let author = 'Equipo Claro Dominicana';
  let title = cleanName;

  // Check if filename contains author suffix like '_Carolina R Guzman'
  const authorMatch = cleanName.match(/^(.*?)_([A-Za-z\s]+)$/);
  if (authorMatch && authorMatch[2].length > 3) {
    title = authorMatch[1].replace(/[-_]/g, ' ').trim();
    author = authorMatch[2].trim();
  } else {
    title = cleanName.replace(/[-_]/g, ' ').trim();
  }

  return { title, author };
}

function getAllFiles(dirPath, arrayOfFiles = []) {
  try {
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
      const fullPath = path.join(dirPath, file);
      try {
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          getAllFiles(fullPath, arrayOfFiles);
        } else {
          const ext = path.extname(file).toLowerCase().replace('.', '');
          if (['docx', 'doc', 'xlsx', 'xls', 'pdf', 'txt', 'pptx', 'ppt', 'vsd', 'vsdx', 'csv'].includes(ext)) {
            arrayOfFiles.push({
              name: file,
              fullPath: fullPath,
              ext: ext,
              size: stat.size,
              mtime: stat.mtime
            });
          }
        }
      } catch (err) {}
    }
  } catch (err) {}
  return arrayOfFiles;
}

async function indexAll() {
  console.log("🔍 Escaneando archivos en:", ONEDRIVE_DIR);
  const foundFiles = getAllFiles(ONEDRIVE_DIR);
  console.log(`📁 Total encontrados: ${foundFiles.length} archivos`);

  // Transform into documents
  const indexedDocuments = foundFiles.map((fileObj, index) => {
    const relPath = path.relative(ONEDRIVE_DIR, fileObj.fullPath);
    const category = determineCategory(relPath, fileObj.name);
    const { title, author } = extractAuthorAndTitle(fileObj.name);
    const parentFolder = path.dirname(relPath) === '.' ? 'Raíz OneDrive' : path.dirname(relPath);

    // Tags extraction
    const tags = [category, fileObj.ext.toUpperCase()];
    if (fileObj.name.toLowerCase().includes('hpbx')) tags.push('HPBX');
    if (fileObj.name.toLowerCase().includes('cotiz')) tags.push('Cotización');
    if (fileObj.name.toLowerCase().includes('flota')) tags.push('Flota');
    if (fileObj.name.toLowerCase().includes('offer')) tags.push('Offers');
    if (fileObj.name.toLowerCase().includes('cpe')) tags.push('Equipos CPE');
    if (fileObj.name.toLowerCase().includes('contrato')) tags.push('Contrato');

    const sizeFormatted = fileObj.size > 1024 * 1024 
      ? `${(fileObj.size / (1024 * 1024)).toFixed(2)} MB` 
      : `${(fileObj.size / 1024).toFixed(1)} KB`;

    return {
      id: `onedrive-doc-${index + 1}`,
      name: fileObj.name,
      title: title || fileObj.name,
      folder: parentFolder,
      category: category,
      extension: fileObj.ext,
      size: sizeFormatted,
      sizeBytes: fileObj.size,
      modifiedDate: fileObj.mtime.toISOString().split('T')[0],
      author: author,
      version: '1.0',
      sharepointUrl: `https://clarocomdo.sharepoint.com/sites/gevc/indiso/Shared%20Documents1/Documentaciones%20Comerciales/${encodeURIComponent(fileObj.name)}`,
      isSynced: true,
      tags: tags,
      aiSummary: `Documento comercial '${title}' clasificado en ${category}. Ubicación local: ${relPath}.`,
      keyTakeaways: [
        `Ubicación: OneDrive - Claro Dominicana > ${parentFolder}`,
        `Formato: .${fileObj.ext.toUpperCase()} (${sizeFormatted})`,
        `Responsable / Autor: ${author}`,
        `Última actualización: ${fileObj.mtime.toLocaleDateString()}`
      ],
      contentPreview: `Archivo: ${fileObj.name}\nRuta Local: ${fileObj.fullPath}\nCategoría: ${category}\nAutor: ${author}\nIndexado para búsqueda inteligente y generación de cotizaciones con Clara Copilot.`
    };
  });

  // Save to local JSON backup
  const DATA_DIR = path.resolve(__dirname, '../data');
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  const LOCAL_DB_PATH = path.resolve(DATA_DIR, 'chat_db.json');

  let dbData = { messages: [], quotes: [], documents: [] };
  if (fs.existsSync(LOCAL_DB_PATH)) {
    try {
      dbData = JSON.parse(fs.readFileSync(LOCAL_DB_PATH, 'utf-8'));
    } catch (e) {}
  }
  dbData.documents = indexedDocuments;
  fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(dbData, null, 2), 'utf-8');
  console.log(`💾 Guardados ${indexedDocuments.length} documentos en archivo local chat_db.json`);

  // Try saving to PostgreSQL
  try {
    const pool = new Pool({
      connectionString: 'postgres://claro_user:TuPasswordSeguro123!@74.208.192.253:5432/claro_insight',
      connectionTimeoutMillis: 8000,
      ssl: false
    });
    const client = await pool.connect();
    
    console.log("🟢 Conectado a PostgreSQL. Insertando documentos...");

    // Insert in batches of 100
    const batchSize = 100;
    for (let i = 0; i < indexedDocuments.length; i += batchSize) {
      const batch = indexedDocuments.slice(i, i + batchSize);
      for (const doc of batch) {
        await client.query(`
          INSERT INTO commercial_documents (
            id, name, title, folder, category, extension, size, size_bytes,
            modified_date, author, version, sharepoint_url, is_synced, tags,
            ai_summary, key_takeaways, content_preview, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, CURRENT_TIMESTAMP)
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            title = EXCLUDED.title,
            folder = EXCLUDED.folder,
            category = EXCLUDED.category,
            extension = EXCLUDED.extension,
            size = EXCLUDED.size,
            size_bytes = EXCLUDED.size_bytes,
            modified_date = EXCLUDED.modified_date,
            author = EXCLUDED.author,
            tags = EXCLUDED.tags,
            ai_summary = EXCLUDED.ai_summary,
            key_takeaways = EXCLUDED.key_takeaways,
            content_preview = EXCLUDED.content_preview
        `, [
          doc.id, doc.name, doc.title, doc.folder, doc.category, doc.extension,
          doc.size, doc.sizeBytes, doc.modifiedDate, doc.author, doc.version,
          doc.sharepointUrl, doc.isSynced, JSON.stringify(doc.tags),
          doc.aiSummary, JSON.stringify(doc.keyTakeaways), doc.contentPreview
        ]);
      }
      process.stdout.write(`\rProcesados ${Math.min(i + batchSize, indexedDocuments.length)} / ${indexedDocuments.length} documentos en PostgreSQL...`);
    }
    console.log("\n✅ Todos los documentos fueron indexados exitosamente en PostgreSQL.");
    client.release();
    await pool.end();
  } catch (err) {
    console.warn("\n⚠️ Nota PostgreSQL:", err.message, "(Datos guardados en fallback JSON).");
  }
}

indexAll();
