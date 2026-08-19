import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import { ImapFlow } from 'imapflow'
import { simpleParser } from 'mailparser'
import { getMessages, saveMessage, clearMessages, getQuotes, clearAllQuotes, deleteQuote, getClientFolders, getCommercialDocuments, saveCommercialDocument, bulkSaveCommercialDocuments } from './db.js'
import mammoth from 'mammoth'
import XLSX from 'xlsx'

// Helper to fetch and parse emails from an IMAP server
async function fetchImapEmails(settings) {
  const client = new ImapFlow({
    host: settings.host,
    port: parseInt(settings.port) || 993,
    secure: settings.secure === 'true' || settings.secure === true,
    auth: {
      user: settings.user,
      pass: settings.password
    },
    logger: false
  });

  client.on('error', err => {
    console.error("ImapFlow Client Socket Error:", err.message);
  });

  await client.connect();

  const lock = await client.getMailboxLock('INBOX');
  const emailsList = [];
  try {
    const mailbox = client.mailbox;
    const totalMessages = mailbox.exists;
    if (totalMessages > 0) {
      // Fetch the 10 most recent emails
      const startRange = Math.max(1, totalMessages - 9);
      const range = `${startRange}:${totalMessages}`;
      
      for await (let message of client.fetch(range, { source: true })) {
        try {
          const parsed = await simpleParser(message.source);
          emailsList.push({
            id: `imap-${message.uid}`,
            filename: `imap-${message.uid}.txt`,
            sender: parsed.from?.text || 'remitente.desconocido@claro.com.do',
            subject: parsed.subject || 'Sin Asunto',
            body: parsed.html || parsed.text || '',
            date: parsed.date ? new Date(parsed.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
          });
        } catch (parseErr) {
          console.error(`Failed parsing message UID ${message.uid}:`, parseErr);
        }
      }
    }
  } finally {
    lock.release();
  }

  await client.logout();
  return emailsList.reverse(); // Newest first
}

// Helper to parse JSON body from incoming POST stream
function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', err => reject(err));
  });
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'email-api',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          // Chat Database API Endpoints
          if (req.url.startsWith('/api/chat/history') && req.method === 'GET') {
            const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
            const sessionId = urlObj.searchParams.get('sessionId') || 'default-session';
            const history = await getMessages(sessionId);
            res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
            res.end(JSON.stringify(history));
            return;
          }

          if (req.url.startsWith('/api/chat/message') && req.method === 'POST') {
            try {
              const body = await readJsonBody(req);
              const saved = await saveMessage(body);
              res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
              res.end(JSON.stringify(saved));
            } catch (err) {
              res.writeHead(500, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
              res.end(JSON.stringify({ error: err.message }));
            }
            return;
          }

          if (req.url.startsWith('/api/chat/history') && req.method === 'DELETE') {
            const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
            const sessionId = urlObj.searchParams.get('sessionId') || 'default-session';
            const result = await clearMessages(sessionId);
            res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
            res.end(JSON.stringify(result));
            return;
          }

          if (req.url === '/api/chat/quotes' && req.method === 'GET') {
            const quotes = await getQuotes();
            res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
            res.end(JSON.stringify(quotes));
            return;
          }

          if (req.url === '/api/chat/quotes' && req.method === 'DELETE') {
            const result = await clearAllQuotes();
            res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
            res.end(JSON.stringify(result));
            return;
          }

          if (req.url.startsWith('/api/chat/quotes/') && req.method === 'DELETE') {
            const quoteId = req.url.replace('/api/chat/quotes/', '');
            const result = await deleteQuote(quoteId);
            res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
            res.end(JSON.stringify(result));
            return;
          }

          if (req.url.startsWith('/api/clients/folders') && req.method === 'GET') {
            const folders = await getClientFolders();
            res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
            res.end(JSON.stringify(folders));
            return;
          }

          // SharePoint File Explorer Endpoints
          if (req.url.startsWith('/api/sharepoint/files') && req.method === 'GET') {
            try {
              const documents = await getCommercialDocuments();
              res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
              res.end(JSON.stringify(documents));
            } catch (err) {
              res.writeHead(500, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
              res.end(JSON.stringify({ error: err.message }));
            }
            return;
          }

          if (req.url.startsWith('/api/sharepoint/save') && req.method === 'POST') {
            try {
              const body = await readJsonBody(req);
              const savedDoc = await saveCommercialDocument(body);
              res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
              res.end(JSON.stringify(savedDoc));
            } catch (err) {
              res.writeHead(500, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
              res.end(JSON.stringify({ error: err.message }));
            }
            return;
          }

          if (req.url.startsWith('/api/config/openai-key') && req.method === 'GET') {
            res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
            res.end(JSON.stringify({ apiKey: process.env.OPENAI_API_KEY || '' }));
            return;
          }

          if (req.url.startsWith('/api/sharepoint/sync') && req.method === 'POST') {
            try {
              const body = await readJsonBody(req);
              const { initialDocs, localPath } = body;

              if (initialDocs && Array.isArray(initialDocs) && initialDocs.length > 0) {
                const saved = await bulkSaveCommercialDocuments(initialDocs);
                res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
                res.end(JSON.stringify({ status: 'success', syncedCount: saved.length, documents: saved }));
                return;
              }

              if (localPath && fs.existsSync(localPath)) {
                const files = fs.readdirSync(localPath);
                const scannedDocs = [];
                for (const file of files) {
                  const fullPath = path.join(localPath, file);
                  const stat = fs.statSync(fullPath);
                  if (stat.isFile()) {
                    const ext = path.extname(file).replace('.', '').toLowerCase();
                    const doc = {
                      id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                      name: file,
                      title: file.replace(/[-_]/g, ' ').replace(/\.[^/.]+$/, ''),
                      folder: 'Carpeta Local Sincronizada',
                      category: 'General',
                      extension: ext || 'txt',
                      size: `${(stat.size / (1024 * 1024)).toFixed(2)} MB`,
                      sizeBytes: stat.size,
                      modifiedDate: stat.mtime.toISOString().split('T')[0],
                      author: 'OneDrive Sync Local',
                      version: '1.0',
                      sharepointUrl: `https://clarocomdo.sharepoint.com/sites/gevc/indiso/Shared%20Documents1/Documentaciones%20Comerciales/${encodeURIComponent(file)}`,
                      isSynced: true,
                      tags: ['LocalSync', ext.toUpperCase()],
                      aiSummary: `Documento indexado desde la carpeta local sincronizada con SharePoint: ${file}`,
                      keyTakeaways: [`Tamaño de archivo: ${(stat.size / 1024).toFixed(1)} KB`, `Última modificación: ${stat.mtime.toLocaleDateString()}`],
                      contentPreview: `Archivo: ${file}\nRuta: ${fullPath}\nIndexado automáticamente por el servicio de sincronización.`
                    };
                    const saved = await saveCommercialDocument(doc);
                    scannedDocs.push(saved);
                  }
                }
                res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
                res.end(JSON.stringify({ status: 'success', syncedCount: scannedDocs.length, documents: scannedDocs }));
                return;
              }

              const allDocs = await getCommercialDocuments();
              res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
              res.end(JSON.stringify({ status: 'success', syncedCount: allDocs.length, documents: allDocs }));
            } catch (err) {
              res.writeHead(500, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
              res.end(JSON.stringify({ error: err.message }));
            }
            return;
          }

          if (req.url.startsWith('/api/sharepoint/ai-analyze') && req.method === 'POST') {
            try {
              const body = await readJsonBody(req);
              const { docTitle, contentPreview, userQuery, apiKey } = body;
              const effectiveKey = apiKey || process.env.OPENAI_API_KEY;

              if (effectiveKey && effectiveKey.startsWith('sk-')) {
                const prompt = `Eres Clara, la asistente comercial experta de Claro Dominicana (B2B / Soluciones Empresariales).
Analiza el siguiente extracto de documento comercial de la biblioteca SharePoint 'Documentaciones Comerciales':

Título del Documento: "${docTitle || 'Documento Comercial Claro'}"
Contenido del Documento:
"""
${contentPreview || 'Sin contenido'}
"""

Pregunta o intención del usuario: "${userQuery || 'Genera un análisis ejecutivo estructurado con puntos clave y productos aplicables'}"

Instrucciones:
1. Responde de forma ejecutiva, precisa y comercialmente atractiva en español.
2. Si se mencionan precios, tarifas o códigos de producto (ej. HPBXPYME, AudioCodes, GXP, MPLS), destácalos con claridad.
3. Menciona la relevancia para clientes comerciales o cómo formular una cotización basada en este documento.`;

                const openAiRes = await fetch('https://api.openai.com/v1/chat/completions', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${effectiveKey}`
                  },
                  body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [
                      { role: 'system', content: 'Eres un analista de preventa y catálogo documental de Claro Dominicana.' },
                      { role: 'user', content: prompt }
                    ],
                    temperature: 0.3,
                    max_tokens: 600
                  })
                });

                if (openAiRes.ok) {
                  const aiData = await openAiRes.json();
                  const answer = aiData.choices?.[0]?.message?.content;
                  res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
                  res.end(JSON.stringify({ analysis: answer, source: 'openai' }));
                  return;
                }
              }

              res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
              res.end(JSON.stringify({
                analysis: `📄 **Análisis Inteligente de Documento**: ${docTitle}\n\n• **Resumen Comercial**: Este documento contiene condiciones operativas y comerciales clave de la cartera de Claro Dominicana.\n• **Aplicación en Ventas**: Proporciona las bases técnicas para el dimensionamiento de propuestas y cotizaciones con apego al marco impositivo (30% telecomunicaciones / 18% equipos e instalación).\n• **Acción Recomendada**: Puede utilizar los datos de este documento directamente en el módulo de Cotizaciones o transferir la consulta a Clara Copilot.`,
                source: 'local-heuristic'
              }));
            } catch (err) {
              res.writeHead(500, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
              res.end(JSON.stringify({ error: err.message }));
            }
            return;
          }

          // Document Viewer Parsers (DOCX, XLSX, PDF, TXT)
          if (req.url.startsWith('/api/documents/parse') && req.method === 'GET') {
            try {
              const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
              const name = urlObj.searchParams.get('name') || '';
              const folder = urlObj.searchParams.get('folder') || '';
              const ONEDRIVE_BASE_DIR = 'C:\\Users\\spawx\\OneDrive - Claro Dominicana';

              let filePath = null;
              if (folder && name) {
                const cand = folder === 'Raíz OneDrive' || folder === 'General'
                  ? path.join(ONEDRIVE_BASE_DIR, name)
                  : path.join(ONEDRIVE_BASE_DIR, folder, name);
                if (fs.existsSync(cand)) filePath = cand;
              }
              if (!filePath && name) {
                const direct = path.join(ONEDRIVE_BASE_DIR, name);
                if (fs.existsSync(direct)) filePath = direct;
              }

              if (!filePath || !fs.existsSync(filePath)) {
                res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
                res.end(JSON.stringify({ 
                  type: 'text', 
                  content: `Archivo no disponible en ruta local física.\nNombre: ${name}\nCarpeta: ${folder}` 
                }));
                return;
              }

              const ext = path.extname(filePath).toLowerCase().replace('.', '');

              // A. DOCX / Word
              if (ext === 'docx' || ext === 'doc') {
                try {
                  const result = await mammoth.convertToHtml({ path: filePath });
                  res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
                  res.end(JSON.stringify({ 
                    type: 'docx', 
                    html: result.value, 
                    fileName: path.basename(filePath),
                    sizeBytes: fs.statSync(filePath).size
                  }));
                  return;
                } catch (docxErr) {
                  res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
                  res.end(JSON.stringify({ type: 'text', content: `Error al leer DOCX: ${docxErr.message}` }));
                  return;
                }
              }

              // B. Excel XLSX / XLS / CSV
              if (ext === 'xlsx' || ext === 'xls' || ext === 'csv') {
                try {
                  const wb = XLSX.readFile(filePath);
                  const sheets = wb.SheetNames.map(sheetName => {
                    const sheet = wb.Sheets[sheetName];
                    const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
                    return {
                      name: sheetName,
                      rows: data.slice(0, 1000),
                      totalRows: data.length,
                      totalCols: data[0] ? data[0].length : 0
                    };
                  });
                  res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
                  res.end(JSON.stringify({ 
                    type: 'excel', 
                    sheets, 
                    fileName: path.basename(filePath) 
                  }));
                  return;
                } catch (xlsErr) {
                  res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
                  res.end(JSON.stringify({ type: 'text', content: `Error al leer Excel: ${xlsErr.message}` }));
                  return;
                }
              }

              // C. PDF Stream Reader
              if (ext === 'pdf') {
                res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
                res.end(JSON.stringify({ 
                  type: 'pdf', 
                  streamUrl: `/api/documents/file?name=${encodeURIComponent(name)}&folder=${encodeURIComponent(folder)}`,
                  fileName: path.basename(filePath)
                }));
                return;
              }

              // D. Plain Text
              const content = fs.readFileSync(filePath, 'utf-8');
              res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
              res.end(JSON.stringify({ type: 'text', content, fileName: path.basename(filePath) }));
            } catch (err) {
              res.writeHead(500, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
              res.end(JSON.stringify({ error: err.message }));
            }
            return;
          }

          // Document Raw Streaming (PDF, Image, etc.)
          if (req.url.startsWith('/api/documents/file') && req.method === 'GET') {
            const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
            const name = urlObj.searchParams.get('name') || '';
            const folder = urlObj.searchParams.get('folder') || '';
            const ONEDRIVE_BASE_DIR = 'C:\\Users\\spawx\\OneDrive - Claro Dominicana';

            let filePath = null;
            if (folder && name) {
              const cand = folder === 'Raíz OneDrive' || folder === 'General'
                ? path.join(ONEDRIVE_BASE_DIR, name)
                : path.join(ONEDRIVE_BASE_DIR, folder, name);
              if (fs.existsSync(cand)) filePath = cand;
            }
            if (!filePath && name) {
              const direct = path.join(ONEDRIVE_BASE_DIR, name);
              if (fs.existsSync(direct)) filePath = direct;
            }

            if (!filePath || !fs.existsSync(filePath)) {
              res.writeHead(404, { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*' });
              res.end('Archivo no encontrado');
              return;
            }

            const ext = path.extname(filePath).toLowerCase();
            const mimeType = ext === '.pdf' ? 'application/pdf'
              : ext === '.docx' ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
              : ext === '.xlsx' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
              : ext === '.png' ? 'image/png'
              : ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg'
              : 'application/octet-stream';

            res.writeHead(200, {
              'Content-Type': mimeType,
              'Access-Control-Allow-Origin': '*',
              'Content-Disposition': `inline; filename="${encodeURIComponent(path.basename(filePath))}"`
            });
            fs.createReadStream(filePath).pipe(res);
            return;
          }

          // Keep proxy GET endpoint as is (used for web scraping catalog if needed)
          if (req.url.startsWith('/api/proxy') && req.method === 'GET') {
            const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
            const targetUrl = urlObj.searchParams.get('url');
            if (!targetUrl) {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Missing url parameter' }));
              return;
            }
            try {
              const response = await fetch(targetUrl, {
                headers: {
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
              });
              const html = await response.text();
              res.writeHead(200, { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
              });
              res.end(JSON.stringify({ html }));
            } catch (err) {
              res.writeHead(500, { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
              });
              res.end(JSON.stringify({ error: err.message }));
            }
            return;
          }

          // Test IMAP Connection using secure POST body parameters
          if (req.url.startsWith('/api/emails/test') && req.method === 'POST') {
            try {
              const body = await readJsonBody(req);
              const { host, port, user, password, secure } = body;

              const client = new ImapFlow({
                host,
                port: parseInt(port) || 993,
                secure: secure === 'true' || secure === true,
                auth: {
                  user,
                  pass: password
                },
                logger: false,
                clientConnectionTimeout: 6000,
                authTimeout: 6000
              });

              client.on('error', err => {
                console.error("ImapFlow Test Client Socket Error:", err.message);
              });

              await client.connect();
              await client.logout();
              res.writeHead(200, { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
              });
              res.end(JSON.stringify({ status: 'success' }));
              return;
            } catch (err) {
              res.writeHead(200, { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
              });
              res.end(JSON.stringify({ status: 'error', message: err.message }));
              return;
            }
          }

          // Fetch emails using secure POST body parameters
          if (req.url.startsWith('/api/emails') && req.method === 'POST') {
            try {
              const body = await readJsonBody(req);
              const { host, port, user, password, secure } = body;

              let imapError = null;
              if (host && user && password && password.trim() !== '') {
                try {
                  const imapEmails = await fetchImapEmails({ host, port, user, password, secure });
                  res.writeHead(200, { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                  });
                  res.end(JSON.stringify(imapEmails));
                  return;
                } catch (err) {
                  console.error("IMAP connection failed, falling back to local files:", err.message);
                  imapError = err.message;
                }
              }

              const emailsDir = path.resolve(__dirname, 'emails');
              if (!fs.existsSync(emailsDir)) {
                res.writeHead(200, { 
                  'Content-Type': 'application/json',
                  'Access-Control-Allow-Origin': '*',
                  ...(imapError ? { 'x-imap-error': imapError } : {})
                });
                res.end(JSON.stringify([]));
                return;
              }
              try {
                const files = fs.readdirSync(emailsDir);
                const emails = files
                  .filter(file => file.endsWith('.txt') || file.endsWith('.eml'))
                  .map(file => {
                    const filePath = path.join(emailsDir, file);
                    const content = fs.readFileSync(filePath, 'utf-8');
                    return {
                      filename: file,
                      content: content
                    };
                  });
                res.writeHead(200, { 
                  'Content-Type': 'application/json',
                  'Access-Control-Allow-Origin': '*',
                  ...(imapError ? { 'x-imap-error': imapError } : {})
                });
                res.end(JSON.stringify(emails));
              } catch (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: err.message }));
              }
            } catch (err) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: err.message }));
            }
          } else {
            next();
          }
        });
      }
    }
  ],
})
