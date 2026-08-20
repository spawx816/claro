import pkg from 'pg';
const { Pool } = pkg;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, 'data');
const LOCAL_DB_PATH = path.resolve(DATA_DIR, 'chat_db.json');

// Ensure local data directory exists for fallback storage
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Helper to parse .env file
function loadEnv() {
  const envPath = path.resolve(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split(/\r?\n/).forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || '';
        if (value.length > 1 && value.startsWith('"') && value.endsWith('"')) {
          value = value.substring(1, value.length - 1);
        }
        process.env[key] = value.trim();
      }
    });
  }
}
loadEnv();

let pool = null;
let isPostgresAvailable = false;

// Helper to manage local JSON fallback storage
function readLocalDb() {
  try {
    if (fs.existsSync(LOCAL_DB_PATH)) {
      const data = fs.readFileSync(LOCAL_DB_PATH, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Error reading local DB:", err.message);
  }
  return { messages: [], quotes: [] };
}

function writeLocalDb(dbData) {
  try {
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(dbData, null, 2), 'utf-8');
  } catch (err) {
    console.error("Error writing local DB:", err.message);
  }
}

// Initialize Database Connection and Create Tables
export async function initDb() {
  loadEnv();
  const connectionString = process.env.DATABASE_URL;
  const pgConfig = connectionString ? {
    connectionString,
    connectionTimeoutMillis: 5000,
    ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : false
  } : {
    host: process.env.PGHOST || 'localhost',
    port: parseInt(process.env.PGPORT) || 5432,
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || 'postgres',
    database: process.env.PGDATABASE || 'claro_insight',
    connectionTimeoutMillis: 5000
  };

  try {
    pool = new Pool(pgConfig);
    const client = await pool.connect();
    
    // Create chat_messages table
    await client.query(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id VARCHAR(100) PRIMARY KEY,
        session_id VARCHAR(100) NOT NULL,
        sender VARCHAR(20) NOT NULL,
        message_text TEXT NOT NULL,
        quote_data JSONB,
        quote_obj JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(session_id);
      ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS quote_obj JSONB;
    `);

    // Create chat_quotes table
    await client.query(`
      CREATE TABLE IF NOT EXISTS chat_quotes (
        id VARCHAR(100) PRIMARY KEY,
        session_id VARCHAR(100) NOT NULL,
        client_name VARCHAR(255),
        client_folder VARCHAR(255),
        product_id VARCHAR(50),
        product_name VARCHAR(255) NOT NULL,
        quantity INTEGER DEFAULT 1,
        unit_price VARCHAR(100),
        monthly_total VARCHAR(100),
        setup_fee VARCHAR(255),
        quote_obj JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      ALTER TABLE chat_quotes ADD COLUMN IF NOT EXISTS client_name VARCHAR(255);
      ALTER TABLE chat_quotes ADD COLUMN IF NOT EXISTS client_folder VARCHAR(255);
      ALTER TABLE chat_quotes ADD COLUMN IF NOT EXISTS quote_obj JSONB;
      CREATE INDEX IF NOT EXISTS idx_chat_quotes_client ON chat_quotes(client_name);
    `);

    // Create commercial_documents table
    await client.query(`
      CREATE TABLE IF NOT EXISTS commercial_documents (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        title TEXT NOT NULL,
        folder TEXT NOT NULL,
        category TEXT NOT NULL,
        extension TEXT NOT NULL,
        size TEXT,
        size_bytes BIGINT,
        modified_date TEXT,
        author TEXT,
        version TEXT,
        sharepoint_url TEXT,
        is_synced BOOLEAN DEFAULT true,
        tags JSONB,
        ai_summary TEXT,
        key_takeaways JSONB,
        content_preview TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_commercial_documents_category ON commercial_documents(category);
      CREATE INDEX IF NOT EXISTS idx_commercial_documents_folder ON commercial_documents(folder);
    `);

    client.release();
    isPostgresAvailable = true;
    console.log("🟢 PostgreSQL Database Connected & Initialized.");
  } catch (err) {
    console.warn("⚠️ PostgreSQL connection unavailable:", err.message);
    console.log("📁 Falling back to local file-backed JSON database store.");
    isPostgresAvailable = false;
  }
}

// Save a chat message (User or Clara bot)
export async function saveMessage({ id, sessionId, sender, text, quoteData, quoteObj }) {
  const msgId = id || `msg-${Date.now()}`;
  const sessId = sessionId || 'default-session';
  const timestamp = new Date().toISOString();

  // Extract client information
  let clientName = 'Cliente Solicitante';
  if (quoteObj && quoteObj.customer && quoteObj.customer.name && quoteObj.customer.name !== 'Cliente Solicitante') {
    clientName = quoteObj.customer.name;
  } else if (quoteData && quoteData.clientName) {
    clientName = quoteData.clientName;
  } else {
    const nameMatch = (text || '').match(/(?:cliente|para(?:\sel)?\s(?:cliente)?)\s+([A-ZÁÉÍÓÚÑa-záéíóúñ0-9\.\-_ ]+?)(?:,|\.|\n|con|\d+\s*usuario|$)/i);
    if (nameMatch && nameMatch[1] && nameMatch[1].trim().length > 1 && !nameMatch[1].toLowerCase().startsWith('una hpbx')) {
      clientName = nameMatch[1].trim();
    }
  }
  const clientFolder = `Clientes/${clientName}`;

  if (isPostgresAvailable && pool) {
    try {
      await pool.query(
        `INSERT INTO chat_messages (id, session_id, sender, message_text, quote_data, quote_obj, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO UPDATE SET quote_data = EXCLUDED.quote_data, quote_obj = EXCLUDED.quote_obj`,
        [msgId, sessId, sender, text, quoteData ? JSON.stringify(quoteData) : null, quoteObj ? JSON.stringify(quoteObj) : null, timestamp]
      );

      if (quoteData) {
        await pool.query(
          `INSERT INTO chat_quotes (id, session_id, client_name, client_folder, product_id, product_name, quantity, unit_price, monthly_total, setup_fee, quote_obj, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
           ON CONFLICT (id) DO UPDATE SET
             client_name = EXCLUDED.client_name,
             client_folder = EXCLUDED.client_folder,
             quote_obj = EXCLUDED.quote_obj`,
          [
            `quote-${msgId}`,
            sessId,
            clientName,
            clientFolder,
            quoteData.productId || 'hpbx',
            quoteData.productName || 'Hosted PBX Claro',
            parseInt(quoteData.quantity) || 1,
            quoteData.unitPrice || '',
            quoteData.monthlyTotal || '',
            quoteData.setupFee || '',
            quoteObj ? JSON.stringify(quoteObj) : null,
            timestamp
          ]
        );

        // Auto create or update document in the Client's Dedicated Folder
        const quoteDoc = {
          id: `doc-quote-${msgId}`,
          name: `Cotización Hosted PBX - ${clientName}.pdf`,
          title: `Propuesta Comercial HPBX (${quoteObj?.type || 'PYMES'}) - ${clientName}`,
          folder: clientFolder,
          category: 'Cotizaciones y Clientes',
          extension: 'pdf',
          size: '142 KB',
          sizeBytes: 145408,
          modifiedDate: timestamp.split('T')[0],
          author: quoteObj?.salesRep || 'Brian Quiroz (Claro Negocios)',
          version: '1.0',
          sharepointUrl: `https://clarocomdo.sharepoint.com/sites/gevc/indiso/Shared%20Documents1/Clientes/${encodeURIComponent(clientName)}/Cotizacion_${encodeURIComponent(clientName)}.pdf`,
          isSynced: true,
          tags: ['Cotización', 'HPBX', clientName, quoteObj?.type || 'PYMES', 'Oficial'],
          aiSummary: `Expediente comercial y cotización formal de Hosted PBX para ${clientName}. Renta Mensual: ${quoteData.monthlyTotal || ''}. Instalación: ${quoteData.setupFee || ''}. Cantidad: ${quoteData.quantity || 1} estaciones.`,
          keyTakeaways: [
            `Cliente: ${clientName}`,
            `Renta Mensual: ${quoteData.monthlyTotal || 'Consultar'}`,
            `Instalación: ${quoteData.setupFee || 'Consultar'}`,
            `Vigencia: 30 Días Calendario`,
            `Carpeta Cliente: ${clientFolder}`
          ],
          contentPreview: quoteObj ? JSON.stringify(quoteObj, null, 2) : text
        };
        await saveCommercialDocument(quoteDoc);
      }
      return { id: msgId, sessionId: sessId, sender, text, quoteData, quoteObj, clientName, clientFolder, createdAt: timestamp };
    } catch (err) {
      console.error("PostgreSQL save error:", err.message);
    }
  }

  // Fallback to file storage
  const db = readLocalDb();
  const newMsg = { id: msgId, sessionId: sessId, sender, text, quoteData, quoteObj, clientName, clientFolder, createdAt: timestamp };
  db.messages = db.messages.filter(m => m.id !== msgId);
  db.messages.push(newMsg);

  if (quoteData) {
    db.quotes = (db.quotes || []).filter(q => q.id !== `quote-${msgId}`);
    db.quotes.push({
      id: `quote-${msgId}`,
      sessionId: sessId,
      clientName,
      clientFolder,
      productId: quoteData.productId || 'hpbx',
      productName: quoteData.productName || 'Hosted PBX Claro',
      quantity: quoteData.quantity || 1,
      unitPrice: quoteData.unitPrice || '',
      monthlyTotal: quoteData.monthlyTotal || '',
      setupFee: quoteData.setupFee || '',
      quoteObj: quoteObj || null,
      createdAt: timestamp
    });

    if (!db.documents) db.documents = [];
    db.documents = db.documents.filter(d => d.id !== `doc-quote-${msgId}`);
    db.documents.push({
      id: `doc-quote-${msgId}`,
      name: `Cotización Hosted PBX - ${clientName}.pdf`,
      title: `Propuesta Comercial HPBX (${quoteObj?.type || 'PYMES'}) - ${clientName}`,
      folder: clientFolder,
      category: 'Cotizaciones y Clientes',
      extension: 'pdf',
      size: '142 KB',
      sizeBytes: 145408,
      modifiedDate: timestamp.split('T')[0],
      author: quoteObj?.salesRep || 'Brian Quiroz (Claro Negocios)',
      version: '1.0',
      sharepointUrl: `https://clarocomdo.sharepoint.com/sites/gevc/indiso/Shared%20Documents1/Clientes/${encodeURIComponent(clientName)}/Cotizacion_${encodeURIComponent(clientName)}.pdf`,
      isSynced: true,
      tags: ['Cotización', 'HPBX', clientName, quoteObj?.type || 'PYMES', 'Oficial'],
      aiSummary: `Expediente comercial y cotización formal de Hosted PBX para ${clientName}.`,
      keyTakeaways: [`Cliente: ${clientName}`, `Carpeta: ${clientFolder}`],
      contentPreview: quoteObj ? JSON.stringify(quoteObj, null, 2) : text
    });
  }

  writeLocalDb(db);
  return newMsg;
}

// Fetch message history for a specific session
export async function getMessages(sessionId = 'default-session') {
  if (isPostgresAvailable && pool) {
    try {
      const res = await pool.query(
        `SELECT id, session_id as "sessionId", sender, message_text as "text", quote_data as "quoteData", quote_obj as "quoteObj", created_at as "createdAt"
         FROM chat_messages
         WHERE session_id = $1
         ORDER BY created_at ASC`,
        [sessionId]
      );
      return res.rows.map(row => ({
        ...row,
        quoteData: typeof row.quoteData === 'string' ? JSON.parse(row.quoteData) : row.quoteData,
        quoteObj: typeof row.quoteObj === 'string' ? JSON.parse(row.quoteObj) : row.quoteObj
      }));
    } catch (err) {
      console.error("PostgreSQL getMessages error:", err.message);
    }
  }

  // Fallback
  const db = readLocalDb();
  return (db.messages || []).filter(m => m.sessionId === sessionId);
}

// Clear message history for a specific session
export async function clearMessages(sessionId = 'default-session') {
  if (isPostgresAvailable && pool) {
    try {
      await pool.query(`DELETE FROM chat_messages WHERE session_id = $1`, [sessionId]);
      return { success: true };
    } catch (err) {
      console.error("PostgreSQL clearMessages error:", err.message);
    }
  }

  const db = readLocalDb();
  db.messages = (db.messages || []).filter(m => m.sessionId !== sessionId);
  writeLocalDb(db);
  return { success: true };
}

// Get all commercial quotes generated
export async function getQuotes() {
  if (isPostgresAvailable && pool) {
    try {
      const res = await pool.query(
        `SELECT id, session_id as "sessionId", client_name as "clientName", client_folder as "clientFolder",
                product_id as "productId", product_name as "productName", quantity, unit_price as "unitPrice",
                monthly_total as "monthlyTotal", setup_fee as "setupFee", quote_obj as "quoteObj", created_at as "createdAt"
         FROM chat_quotes
         ORDER BY created_at DESC`
      );
      return res.rows.map(row => {
        const quoteObj = typeof row.quoteObj === 'string' ? JSON.parse(row.quoteObj) : row.quoteObj;
        const clientName = row.clientName || quoteObj?.customer?.name || 'Cliente Solicitante';
        return {
          ...row,
          clientName,
          clientFolder: row.clientFolder || `Clientes/${clientName}`,
          quoteObj
        };
      });
    } catch (err) {
      console.error("PostgreSQL getQuotes error:", err.message);
    }
  }

  const db = readLocalDb();
  return (db.quotes || []).map(q => {
    const clientName = q.clientName || q.quoteObj?.customer?.name || 'Cliente Solicitante';
    return {
      ...q,
      clientName,
      clientFolder: q.clientFolder || `Clientes/${clientName}`
    };
  });
}

// Clear ALL quotes and clean client quote folders
export async function clearAllQuotes() {
  if (isPostgresAvailable && pool) {
    try {
      await pool.query(`DELETE FROM chat_quotes`);
      await pool.query(`UPDATE chat_messages SET quote_data = NULL, quote_obj = NULL WHERE quote_data IS NOT NULL`);
      await pool.query(`DELETE FROM commercial_documents WHERE category = 'Cotizaciones y Clientes' OR folder LIKE 'Clientes/%'`);
    } catch (err) {
      console.error("PostgreSQL clearAllQuotes error:", err.message);
    }
  }

  const db = readLocalDb();
  db.quotes = [];
  if (db.messages) {
    db.messages.forEach(m => {
      delete m.quoteData;
      delete m.quoteObj;
    });
  }
  if (db.documents) {
    db.documents = db.documents.filter(d => d.category !== 'Cotizaciones y Clientes' && !d.folder?.startsWith('Clientes/'));
  }
  writeLocalDb(db);
  return { success: true, message: 'Todas las cotizaciones y expedientes de clientes han sido eliminados.' };
}

// Delete a single quote by ID
export async function deleteQuote(quoteId) {
  if (isPostgresAvailable && pool) {
    try {
      await pool.query(`DELETE FROM chat_quotes WHERE id = $1`, [quoteId]);
      const docId = `doc-${quoteId}`;
      await pool.query(`DELETE FROM commercial_documents WHERE id = $1`, [docId]);
    } catch (err) {
      console.error("PostgreSQL deleteQuote error:", err.message);
    }
  }

  const db = readLocalDb();
  db.quotes = (db.quotes || []).filter(q => q.id !== quoteId);
  const docId = `doc-${quoteId}`;
  if (db.documents) {
    db.documents = db.documents.filter(d => d.id !== docId);
  }
  writeLocalDb(db);
  return { success: true };
}

// Delete an entire client folder with all its quotes and documents
export async function deleteClientFolder(clientName) {
  if (isPostgresAvailable && pool) {
    try {
      await pool.query(`DELETE FROM chat_quotes WHERE client_name = $1 OR client_folder = $2`, [clientName, `Clientes/${clientName}`]);
      await pool.query(`DELETE FROM commercial_documents WHERE folder = $1`, [`Clientes/${clientName}`]);
    } catch (err) {
      console.error("PostgreSQL deleteClientFolder error:", err.message);
    }
  }

  const db = readLocalDb();
  db.quotes = (db.quotes || []).filter(q => (q.clientName || q.quoteObj?.customer?.name) !== clientName && q.clientFolder !== `Clientes/${clientName}`);
  if (db.documents) {
    db.documents = db.documents.filter(d => d.folder !== `Clientes/${clientName}`);
  }
  writeLocalDb(db);
  return { success: true };
}

// Get all client folders grouped with their quotes & documents
export async function getClientFolders() {
  const quotes = await getQuotes();
  const docs = await getCommercialDocuments();

  const folderMap = new Map();

  // Group quotes by client
  quotes.forEach(quote => {
    const clientName = quote.clientName || quote.quoteObj?.customer?.name || 'Cliente Solicitante';
    const folderKey = `Clientes/${clientName}`;

    if (!folderMap.has(folderKey)) {
      folderMap.set(folderKey, {
        clientName,
        folderPath: folderKey,
        quotes: [],
        documents: [],
        totalQuotes: 0,
        lastDate: quote.createdAt,
        totalMonthlyDOP: 0,
        totalMonthlyUSD: 0
      });
    }

    const folder = folderMap.get(folderKey);
    folder.quotes.push(quote);
    folder.totalQuotes += 1;

    // Aggregate revenue
    const isUSD = (quote.monthlyTotal || '').toUpperCase().includes('USD');
    const amountMatch = (quote.monthlyTotal || '').replace(/,/g, '').match(/[\d.]+/);
    const amount = amountMatch ? parseFloat(amountMatch[0]) : 0;
    if (isUSD) {
      folder.totalMonthlyUSD += amount;
    } else {
      folder.totalMonthlyDOP += amount;
    }
  });

  // Group client documents
  docs.forEach(doc => {
    if (doc.folder && doc.folder.startsWith('Clientes/')) {
      const clientName = doc.folder.replace('Clientes/', '').trim();
      const folderKey = `Clientes/${clientName}`;

      if (!folderMap.has(folderKey)) {
        folderMap.set(folderKey, {
          clientName,
          folderPath: folderKey,
          quotes: [],
          documents: [],
          totalQuotes: 0,
          lastDate: doc.createdAt || doc.modifiedDate,
          totalMonthlyDOP: 0,
          totalMonthlyUSD: 0
        });
      }

      const folder = folderMap.get(folderKey);
      if (!folder.documents.some(d => d.id === doc.id)) {
        folder.documents.push(doc);
      }
    }
  });

  return Array.from(folderMap.values());
}

// Commercial Documents CRUD (SharePoint File Explorer)
export async function getCommercialDocuments() {
  if (isPostgresAvailable && pool) {
    try {
      const res = await pool.query(
        `SELECT id, name, title, folder, category, extension, size, size_bytes as "sizeBytes",
                modified_date as "modifiedDate", author, version, sharepoint_url as "sharepointUrl",
                is_synced as "isSynced", tags, ai_summary as "aiSummary", key_takeaways as "keyTakeaways",
                content_preview as "contentPreview", created_at as "createdAt"
         FROM commercial_documents
         ORDER BY category ASC, name ASC`
      );
      return res.rows.map(row => ({
        ...row,
        tags: typeof row.tags === 'string' ? JSON.parse(row.tags) : (row.tags || []),
        keyTakeaways: typeof row.keyTakeaways === 'string' ? JSON.parse(row.keyTakeaways) : (row.keyTakeaways || [])
      }));
    } catch (err) {
      console.error("PostgreSQL getCommercialDocuments error:", err.message);
    }
  }

  const db = readLocalDb();
  return db.documents || [];
}

export async function saveCommercialDocument(doc) {
  const docId = doc.id || `doc-${Date.now()}`;
  const timestamp = new Date().toISOString();

  if (isPostgresAvailable && pool) {
    try {
      await pool.query(
        `INSERT INTO commercial_documents (
           id, name, title, folder, category, extension, size, size_bytes,
           modified_date, author, version, sharepoint_url, is_synced, tags,
           ai_summary, key_takeaways, content_preview, created_at
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
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
           version = EXCLUDED.version,
           sharepoint_url = EXCLUDED.sharepoint_url,
           is_synced = EXCLUDED.is_synced,
           tags = EXCLUDED.tags,
           ai_summary = EXCLUDED.ai_summary,
           key_takeaways = EXCLUDED.key_takeaways,
           content_preview = EXCLUDED.content_preview`,
        [
          docId,
          doc.name,
          doc.title || doc.name,
          doc.folder || 'General',
          doc.category || 'General',
          doc.extension || 'pdf',
          doc.size || '1.0 MB',
          doc.sizeBytes || 1048576,
          doc.modifiedDate || new Date().toISOString().split('T')[0],
          doc.author || 'Equipo Comercial Claro',
          doc.version || '1.0',
          doc.sharepointUrl || '',
          doc.isSynced !== undefined ? doc.isSynced : true,
          JSON.stringify(doc.tags || []),
          doc.aiSummary || '',
          JSON.stringify(doc.keyTakeaways || []),
          doc.contentPreview || '',
          timestamp
        ]
      );
      return { ...doc, id: docId };
    } catch (err) {
      console.error("PostgreSQL saveCommercialDocument error:", err.message);
    }
  }

  const db = readLocalDb();
  if (!db.documents) db.documents = [];
  const index = db.documents.findIndex(d => d.id === docId);
  const updatedDoc = { ...doc, id: docId };
  if (index >= 0) {
    db.documents[index] = updatedDoc;
  } else {
    db.documents.push(updatedDoc);
  }
  writeLocalDb(db);
  return updatedDoc;
}

export async function bulkSaveCommercialDocuments(docs) {
  const results = [];
  for (const doc of docs) {
    const saved = await saveCommercialDocument(doc);
    results.push(saved);
  }
  return results;
}

export async function searchCommercialDocuments(query, limit = 5) {
  if (!query || typeof query !== 'string' || query.trim() === '') return [];
  const cleanTerms = query.toLowerCase().replace(/[^a-záéíóúñ0-9\s]/g, ' ').split(/\s+/).filter(t => t.length > 2 && !['para', 'con', 'las', 'los', 'una', 'uno', 'por', 'del', 'que', 'como'].includes(t));
  if (cleanTerms.length === 0) return [];

  if (isPostgresAvailable && pool) {
    try {
      const conditions = cleanTerms.map((_, i) => 
        `(name ILIKE $${i+1} OR title ILIKE $${i+1} OR category ILIKE $${i+1} OR ai_summary ILIKE $${i+1} OR content_preview ILIKE $${i+1})`
      ).join(' OR ');

      const params = cleanTerms.map(t => `%${t}%`);
      params.push(limit);

      const res = await pool.query(
        `SELECT id, name, title, folder, category, extension, size, modified_date as "modifiedDate",
                ai_summary as "aiSummary", key_takeaways as "keyTakeaways", content_preview as "contentPreview",
                sharepoint_url as "sharepointUrl"
         FROM commercial_documents
         WHERE ${conditions}
         ORDER BY 
           CASE 
             WHEN name ILIKE $1 THEN 1
             WHEN title ILIKE $1 THEN 2
             ELSE 3
           END
         LIMIT $${params.length}`,
        params
      );
      return res.rows.map(row => ({
        ...row,
        keyTakeaways: typeof row.keyTakeaways === 'string' ? JSON.parse(row.keyTakeaways) : (row.keyTakeaways || [])
      }));
    } catch (err) {
      console.error("searchCommercialDocuments error:", err.message);
    }
  }

  const all = await getCommercialDocuments();
  return all.filter(d => {
    const text = `${d.name || ''} ${d.title || ''} ${d.category || ''} ${d.aiSummary || ''} ${d.contentPreview || ''}`.toLowerCase();
    return cleanTerms.some(t => text.includes(t));
  }).slice(0, limit);
}

// Auto initialize on module load
initDb();


