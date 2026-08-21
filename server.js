import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';
import { getMessages, saveMessage, clearMessages, getQuotes, clearAllQuotes, deleteQuote, deleteClientFolder, getClientFolders, getCommercialDocuments, saveCommercialDocument, bulkSaveCommercialDocuments, searchCommercialDocuments } from './db.js';
import { parseAndGenerateHPBXFromText, extractClientNameFromText } from './src/utils/hpbxQuotationModel.js';
import mammoth from 'mammoth';
import MsgReader from '@kenjiuno/msgreader';
import { decompressRTF } from '@kenjiuno/decompressrtf';
import { deEncapsulateSync } from 'rtf-stream-parser';
import iconv from 'iconv-lite';
import XLSX from 'xlsx';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const DIST_DIR = path.resolve(__dirname, 'dist');
const EMAILS_DIR = path.resolve(__dirname, 'emails');

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain',
};

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

const server = http.createServer(async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = urlObj.pathname;

  // Chat Database API Endpoints
  if (pathname === '/api/chat/history' && req.method === 'GET') {
    const sessionId = urlObj.searchParams.get('sessionId') || 'default-session';
    const history = await getMessages(sessionId);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(history));
    return;
  }

  if (pathname === '/api/chat/message' && req.method === 'POST') {
    try {
      const body = await readJsonBody(req);
      const saved = await saveMessage(body);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(saved));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  if (pathname === '/api/chat/history' && req.method === 'DELETE') {
    const sessionId = urlObj.searchParams.get('sessionId') || 'default-session';
    const result = await clearMessages(sessionId);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(result));
    return;
  }

  if (pathname === '/api/chat/quotes' && req.method === 'GET') {
    const quotes = await getQuotes();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(quotes));
    return;
  }

  if (pathname === '/api/chat/quotes' && req.method === 'DELETE') {
    const result = await clearAllQuotes();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(result));
    return;
  }

  if (pathname.startsWith('/api/chat/quotes/') && req.method === 'DELETE') {
    const quoteId = pathname.replace('/api/chat/quotes/', '');
    const result = await deleteQuote(quoteId);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(result));
    return;
  }

  // Client Folders Endpoint: Aggregated quotes and documents per client
  if (pathname === '/api/clients/folders' && req.method === 'GET') {
    const folders = await getClientFolders();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(folders));
    return;
  }

  if (pathname.startsWith('/api/clients/folders/') && req.method === 'DELETE') {
    const clientName = decodeURIComponent(pathname.replace('/api/clients/folders/', ''));
    const result = await deleteClientFolder(clientName);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(result));
    return;
  }

  // Config Endpoint: Expose server-configured OpenAI Key
  if (pathname === '/api/config/openai-key' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ apiKey: process.env.OPENAI_API_KEY || '' }));
    return;
  }

  // ==========================================================
  // SHAREPOINT & DOCUMENT EXPLORER API ENDPOINTS
  // ==========================================================
  
  // 1. GET /api/sharepoint/files - List all indexed commercial documents
  if (pathname === '/api/sharepoint/files' && req.method === 'GET') {
    try {
      const documents = await getCommercialDocuments();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(documents));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // 2. POST /api/sharepoint/save - Save or update a commercial document
  if (pathname === '/api/sharepoint/save' && req.method === 'POST') {
    try {
      const body = await readJsonBody(req);
      const savedDoc = await saveCommercialDocument(body);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(savedDoc));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // 3. POST /api/sharepoint/sync - Sync with SharePoint / Local directory / Bulk init
  if (pathname === '/api/sharepoint/sync' && req.method === 'POST') {
    try {
      const body = await readJsonBody(req);
      const { initialDocs, localPath, source } = body;

      if (initialDocs && Array.isArray(initialDocs) && initialDocs.length > 0) {
        const saved = await bulkSaveCommercialDocuments(initialDocs);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'success', syncedCount: saved.length, documents: saved }));
        return;
      }

      // Check if local folder scanning was requested
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
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'success', syncedCount: scannedDocs.length, documents: scannedDocs }));
        return;
      }

      const allDocs = await getCommercialDocuments();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'success', syncedCount: allDocs.length, documents: allDocs }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // 4. POST /api/ai/chat - Enterprise AI Copilot with RAG & Multi-Turn Quoting
  if (pathname === '/api/ai/chat' && req.method === 'POST') {
    try {
      const body = await readJsonBody(req);
      const { messages = [], userMsgText = '', model = 'gpt-4o-mini', apiKey, lastQuoteObj } = body;
      const effectiveKey = apiKey || process.env.OPENAI_API_KEY;

      function searchCommunicationsRepo(query, limit = 4) {
        if (!query || query.trim() === '') return [];
        try {
          const rootDir = process.cwd();
          const emailDir = path.join(rootDir, 'email');
          const matches = [];
          const tokens = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);
          if (tokens.length === 0) return [];

          const ReaderClass = MsgReader.default || MsgReader;
          if (fs.existsSync(emailDir)) {
            const msgFiles = fs.readdirSync(emailDir).filter(f => f.endsWith('.msg'));
            for (const f of msgFiles) {
              try {
                const filePath = path.join(emailDir, f);
                const buf = fs.readFileSync(filePath);
                const reader = new ReaderClass(buf);
                const info = reader.getFileData();

                const subject = info.subject || f.replace('.msg', '');
                const body = info.body || '';
                const fullText = (subject + ' ' + body).toLowerCase();

                let score = 0;
                tokens.forEach(tok => {
                  if (subject.toLowerCase().includes(tok)) score += 6;
                  if (fullText.includes(tok)) score += 1;
                });

                if (score > 0) {
                  const ancMatch = subject.match(/ANUNCIO\s+(?:NO\.?|NÚM\.?|Nº)?\s*(\d+)(?:\s*[-–]?\s*([A-Z]))?/i);
                  matches.push({
                    score,
                    id: 'msg-' + f.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase(),
                    subject,
                    title: subject,
                    ancNum: ancMatch ? ancMatch[1] : null,
                    ancVariant: ancMatch && ancMatch[2] ? ancMatch[2].toUpperCase() : null,
                    sender: info.senderName || 'Info-Canales Claro',
                    bodySnippet: body.slice(0, 450)
                  });
                }
              } catch(e) {}
            }
          }
          return matches.sort((a, b) => b.score - a.score).slice(0, limit);
        } catch (err) {
          return [];
        }
      }

      // 1. Search for relevant RAG documents from PostgreSQL & Communications Repo
      let ragDocs = [];
      let commDocs = [];
      try {
        ragDocs = await searchCommercialDocuments(userMsgText, 3);
        commDocs = searchCommunicationsRepo(userMsgText, 4);
      } catch (e) {
        console.error("RAG search error:", e.message);
      }

      // 2. Format RAG context
      let ragContextText = "";
      if (ragDocs && ragDocs.length > 0) {
        ragContextText += "\n\n[DOCUMENTOS COMERCIALES Y FICHAS TÉCNICAS RELEVANTES DE SHAREPOINT/ONEDRIVE]:\n" + 
          ragDocs.map((d, idx) => `Documento ${idx+1}: "${d.title || d.name}" (Categoría: ${d.category})\nResumen: ${d.aiSummary || d.contentPreview?.slice(0, 300)}`).join('\n\n');
      }
      if (commDocs && commDocs.length > 0) {
        ragContextText += "\n\n[COMUNICADOS E INFOCANALES OFICIALES ENCONTRADOS EN EL REPOSITORIO DE COMUNICACIONES DE CLARO]:\n" +
          commDocs.map((c, idx) => `Boletín/InfoCanal ${idx+1}: "${c.subject}" ${c.ancNum ? `(ANUNCIO NO. ${c.ancNum}${c.ancVariant ? `-${c.ancVariant}` : ''})` : ''}\nRemitente: ${c.sender}\nResumen del Contenido: ${c.bodySnippet}`).join('\n\n');
      }

      // 3. Check for HPBX quoting intent
      const lower = (userMsgText || '').toLowerCase();
      let hpbxParsed = null;
      let hpbxContext = "";

      if (lower.includes('hpbx') || lower.includes('centralita') || lower.includes('telefon') || lower.includes('planta') || lower.includes('cotiz')) {
        try {
          hpbxParsed = parseAndGenerateHPBXFromText(userMsgText, 'Brian Quiroz (Claro Negocios)');
          if (!hpbxParsed.hasClientName) {
            hpbxContext = `\n\n[REGLA DE NEGOCIO OBLIGATORIA]: El usuario solicitó cotizar pero NO especificó el nombre del cliente o empresa. Confirma los parámetros técnicos detectados (${hpbxParsed.quote.customer.activeUsers} usuarios, equipos) y pregúntale amablemente: "¿A nombre de qué cliente o empresa emitimos esta cotización formal para crear su expediente comercial?". NO incluyas el bloque :::QUOTE_DATA::: todavía.`;
          } else {
            hpbxContext = `\n\n[COTIZADOR OFICIAL CLARO HPBX]: Utiliza obligatoriamente esta propuesta oficial calculada para el cliente "${hpbxParsed.clientName}":\n\n${hpbxParsed.markdown}\n\n:::QUOTE_DATA:::\n${JSON.stringify({ ...hpbxParsed.quoteData, clientName: hpbxParsed.clientName }, null, 2)}\n:::END_QUOTE_DATA:::`;
          }
        } catch (e) {}
      }

      // 4. If we have OpenAI key, call OpenAI
      if (effectiveKey && effectiveKey.startsWith('sk-')) {
        const systemPrompt = `Eres Clara, la consultora comercial y asesora ejecutiva de Inteligencia Artificial para Claro Dominicana (Soluciones Corporativas y Negocios B2B).
Tu tono es ejecutivo, cordial, altamente técnico y comercialmente persuasivo. Respondes siempre en español de República Dominicana.

REGLAS DE ATENCIÓN, INFOCANALES Y COTIZACIÓN:
1. Tienes acceso total para consultar y leer todo el repositorio de Comunicaciones e InfoCanales Oficiales de Claro. Cuando el usuario pregunte sobre comunicados, boletines, anuncios (ej: Anuncio 8792, Smart TV TCL, penalidad Ultra Wi-Fi, IP Trunking, Microsoft 365, etc.), cita directamente los números de anuncio (ej: ANUNCIO NO. 8792), fechas y detalles específicos extraídos de los InfoCanales.
2. Si el cliente pide cotizar pero NO indica el nombre de su empresa o cliente, confirma la configuración técnica y solicita el nombre del cliente para crear su expediente comercial.
3. Cuando se proporcione el cliente, genera la propuesta estructurada con precios oficiales de Claro Dominicana e incluye al final el bloque :::QUOTE_DATA::: {...} :::END_QUOTE_DATA:::.
4. Si el usuario hace preguntas sobre normativas o boletines recientes, apóyate en los InfoCanales y documentos adjuntos para responder con precisión experta.`;

        const openAiRes = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${effectiveKey}`
          },
          body: JSON.stringify({
            model: model || 'gpt-4o-mini',
            messages: [
              { role: 'system', content: systemPrompt + ragContextText + hpbxContext },
              ...messages.slice(-10),
              { role: 'user', content: userMsgText }
            ],
            temperature: 0.3
          })
        });

        if (openAiRes.ok) {
          const aiData = await openAiRes.json();
          const botReply = aiData.choices?.[0]?.message?.content;
          res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
          res.end(JSON.stringify({
            text: botReply,
            ragDocs: ragDocs,
            commDocs: commDocs,
            model: model || 'gpt-4o-mini',
            hpbxParsed: hpbxParsed
          }));
          return;
        }
      }

      // Fallback local engine
      let fallbackReply = "";
      if (hpbxParsed) {
        if (!hpbxParsed.hasClientName) {
          fallbackReply = `¡Excelente! Tengo configurada la propuesta técnica de tu **Hosted PBX Claro (${hpbxParsed.quote.type})** para **${hpbxParsed.quote.customer.activeUsers} usuarios** con sus terminales y equipamiento correspondiente. 📋\n\n¿A nombre de **qué cliente o empresa** emitimos esta cotización formal para crear su expediente comercial y propuesta oficial?`;
        } else {
          fallbackReply = `¡Con gusto! He generado la propuesta formal oficial para **${hpbxParsed.clientName}** bajo el formato corporativo de **Claro Hosted PBX (${hpbxParsed.quote.type})**:\n\n${hpbxParsed.markdown}\n\n:::QUOTE_DATA:::\n${JSON.stringify({ ...hpbxParsed.quoteData, clientName: hpbxParsed.clientName }, null, 2)}\n:::END_QUOTE_DATA:::`;
        }
      } else {
        fallbackReply = `¡Hola! Como consultora comercial de **Claro Negocios**, puedo brindarte información técnica y cotizaciones inmediatas de Hosted PBX, Cloud Servers, Planes Móviles 5G e Internet Dedicado. ¿Qué cliente o solución deseas consultar?`;
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        text: fallbackReply,
        ragDocs: ragDocs,
        model: 'local-claro-engine',
        hpbxParsed: hpbxParsed
      }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // 4.2 POST /api/sharepoint/ai-analyze - Semantic Document Intelligence Analysis
  if (pathname === '/api/sharepoint/ai-analyze' && req.method === 'POST') {
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
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ analysis: answer, source: 'openai' }));
          return;
        }
      }

      // Fallback heuristic intelligent analysis
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        analysis: `📄 **Análisis Inteligente de Documento**: ${docTitle}\n\n• **Resumen Comercial**: Este documento contiene condiciones operativas y comerciales clave de la cartera de Claro Dominicana.\n• **Aplicación en Ventas**: Proporciona las bases técnicas para el dimensionamiento de propuestas y cotizaciones con apego al marco impositivo (30% telecomunicaciones / 18% equipos e instalación).\n• **Acción Recomendada**: Puede utilizar los datos de este documento directamente en el módulo de Cotizaciones o transferir la consulta a Clara Copilot.`,
        source: 'local-heuristic'
      }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // GET /api/emails/parsed - Parse all .msg and .txt emails from disk repository with thread matching
  if (pathname === '/api/emails/parsed' && req.method === 'GET') {
    try {
      const rootDir = process.cwd();
      const emailDir = path.join(rootDir, 'email');
      const txtDir = path.join(rootDir, 'emails');
      const list = [];

      function parseCategoryForEmail(subject, body) {
        const s = (subject + ' ' + (body || '')).toUpperCase();
        if (/HPBX|VOIP|PSTN|IP TRUNKING|TRUNKING|AUDIOCODES|GRANDSTREAM|SIP/i.test(s)) return 'HPBX & Telefonía IP';
        if (/MICROSOFT 365|OFFICE 365|M365|AZURE|COPILOT|GOOGLE WORKSPACE|DOMINIOS|CLARO CLOUD|SAAS|EXTENDED SERVICE TERM|LICENCIAS MICROSOFT/i.test(s)) return 'Cloud & Microsoft 365';
        if (/VIDEOVIGILANCIA|FORTINET|SEGURIDAD PERIMETRAL|CÁMARA|PUESTA A TIERRA|\bSPT\b/i.test(s)) return 'Videovigilancia & Ciberseguridad';
        if (/FLOTA|SMART CONNECT|\bIOT\b|RED 5G|PORTABILIDAD|PORT OUT|TABLETA|ASUS|SAMSUNG|ZTE|MOBILE MARKETING|LAPTOP|SMART TV/i.test(s)) return 'Móvil & Equipos';
        if (/CLARO TV\+|CLARO TV|IPTV|DTH|\bCANAL\b|\bCANALES\b|CRUNCHYROLL|CLARO VIDEO|ZONA FUTBOL/i.test(s)) return 'Televisión & Claro TV+';
        if (/INTERNET|FIBRA|ONT|METRO ETHERNET|XGSPON|ULTRA WI-FI|DEDICADO|BGP|FULL ROUTING|VELOCIDAD/i.test(s)) return 'Internet & Conectividad';
        return 'Comercial & Políticas';
      }

      function extractFullHtmlFromMsg(info, reader) {
        let html = null;
        if (info.compressedRtf) {
          try {
            const decompressed = decompressRTF(info.compressedRtf);
            const rtfStr = Buffer.from(decompressed).toString('binary');
            const result = deEncapsulateSync(rtfStr, {
              decode: (buf, encoding) => {
                try { return iconv.decode(buf, encoding === 'cp1252' ? 'win1252' : encoding); }
                catch (e) { return buf.toString('latin1'); }
              }
            });
            if (result && result.text) html = result.text;
          } catch (err) {}
        }

        if (!html) {
          html = info.body || '';
        }

        if (html && info.attachments && info.attachments.length > 0 && reader && reader.getAttachment) {
          info.attachments.forEach((att, attIdx) => {
            try {
              const attData = reader.getAttachment(attIdx);
              if (attData && attData.content) {
                const base64 = Buffer.from(attData.content).toString('base64');
                const ext = (att.extension || 'png').replace('.', '').toLowerCase();
                const mime = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : ext === 'gif' ? 'image/gif' : 'image/png';
                const dataUrl = 'data:' + mime + ';base64,' + base64;
                
                if (att.pidContentId) html = html.split('cid:' + att.pidContentId).join(dataUrl);
                if (att.fileName) html = html.split('cid:' + att.fileName).join(dataUrl);
                if (att.name) html = html.split('cid:' + att.name).join(dataUrl);
              }
            } catch (err) {}
          });
        }

        return html;
      }

      // 1. Process .msg files
      if (fs.existsSync(emailDir)) {
        const msgFiles = fs.readdirSync(emailDir).filter(f => f.endsWith('.msg'));
        const ReaderClass = MsgReader.default || MsgReader;

        for (const f of msgFiles) {
          try {
            const filePath = path.join(emailDir, f);
            const buf = fs.readFileSync(filePath);
            const reader = new ReaderClass(buf);
            const info = reader.getFileData();
            const stat = fs.statSync(filePath);

            let dateStr = stat.mtime.toISOString().split('T')[0];
            if (info.headers) {
              const match = info.headers.match(/Date:\s*([^\r\n]+)/i);
              if (match) {
                const d = new Date(match[1]);
                if (!isNaN(d.getTime())) dateStr = d.toISOString().split('T')[0];
              }
            }

            const subject = info.subject || f.replace('.msg', '');
            const fullHtml = extractFullHtmlFromMsg(info, reader);
            const plainBody = info.body || '';
            const ancMatch = subject.match(/ANUNCIO\s+(?:NO\.?|NÚM\.?|Nº)?\s*(\d+)(?:\s*[-–]?\s*([A-Z]))?/i);
            const ancNum = ancMatch ? ancMatch[1] : null;
            const ancVariant = ancMatch && ancMatch[2] ? ancMatch[2].toUpperCase() : null;
            const id = 'msg-' + f.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();

            list.push({
              id,
              filename: f,
              subject,
              sender: (info.senderName || 'Info-Canales Claro') + ' <' + (info.senderEmail || 'info-canales@claro.com.do') + '>',
              senderName: info.senderName || 'Info-Canales Claro',
              senderEmail: info.senderEmail || 'info-canales@claro.com.do',
              date: dateStr,
              category: parseCategoryForEmail(subject, plainBody),
              body: fullHtml,
              plainBody,
              ancNum,
              ancVariant
            });
          } catch (err) {}
        }
      }

      // 2. Process .txt files
      if (fs.existsSync(txtDir)) {
        const txtFiles = fs.readdirSync(txtDir).filter(f => f.endsWith('.txt'));
        for (const f of txtFiles) {
          try {
            const filePath = path.join(txtDir, f);
            const text = fs.readFileSync(filePath, 'utf-8');
            const stat = fs.statSync(filePath);
            let subject = f.replace(/_/g, ' ').replace('.txt', '');
            let sender = 'Claro Support';

            text.split('\n').forEach(l => {
              if (l.toLowerCase().startsWith('asunto:')) subject = l.substring(7).trim();
              if (l.toLowerCase().startsWith('remitente:')) sender = l.substring(10).trim();
            });

            const id = 'txt-' + f.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
            list.push({
              id,
              filename: f,
              subject,
              sender,
              senderName: sender.split('<')[0].trim(),
              senderEmail: sender.includes('<') ? sender.split('<')[1].replace('>', '').trim() : '',
              date: stat.mtime.toISOString().split('T')[0],
              category: parseCategoryForEmail(subject, text),
              body: text,
              ancNum: null,
              ancVariant: null
            });
          } catch (err) {}
        }
      }

      // Thread matching
      const numMap = {};
      list.forEach(item => {
        if (item.ancNum && !item.ancVariant && !item.subject.toUpperCase().includes('SUSTITUIR')) {
          numMap[item.ancNum] = item.id;
        }
      });

      list.forEach(item => {
        if (item.ancNum) {
          const parentId = numMap[item.ancNum];
          if (parentId && parentId !== item.id) {
            item.parentCommId = parentId;
            item.isUpdate = true;
            item.version = item.ancVariant ? `2.0 (${item.ancVariant})` : '2.0';
            item.updateType = item.subject.toUpperCase().includes('SUSTITUIR') ? 'sustitucion' : 'actualizacion';
          } else if (item.ancVariant || item.subject.toUpperCase().includes('SUSTITUIR')) {
            item.isUpdate = true;
            item.version = '2.0';
            item.updateType = 'actualizacion';
          } else {
            item.isUpdate = false;
            item.version = '1.0';
          }
        } else if (/ACTUALIZACIÓN|SUSTITUIR|RECORDATORIO|RECUERDA/i.test(item.subject)) {
          item.isUpdate = true;
          item.version = '1.5';
          item.updateType = 'actualizacion';
        } else {
          item.isUpdate = false;
          item.version = '1.0';
        }
      });

      list.sort((a, b) => new Date(b.date) - new Date(a.date));

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(list));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // 5. GET /api/documents/parse - Parse DOCX, XLSX, PDF, Text for in-app rich document viewer
  if (pathname === '/api/documents/parse' && req.method === 'GET') {
    try {
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
        const ext = path.extname(name).toLowerCase().replace('.', '') || 'xlsx';
        res.writeHead(200, { 'Content-Type': 'application/json' });

        if (ext === 'xlsx' || ext === 'xls' || ext === 'csv') {
          const clientName = name.replace(/^Cotizacion\s*de\s*/i, '').replace(/\.(xlsx|xls|csv)$/i, '').trim() || 'Cliente Comercial';
          res.end(JSON.stringify({ 
            type: 'excel',
            isCloudSimulated: true,
            sheets: [
              {
                name: 'Cotización HPBX',
                totalRows: 12,
                totalCols: 6,
                rows: [
                  ['Código', 'Descripción del Servicio / Equipo', 'Cantidad', 'Precio Unitario (RD$)', 'Impuestos (%)', 'Subtotal Mensual (RD$)'],
                  ['IPHOSTPRM', 'Renta HPBX Plan Premium Corporativo (8 Puestos, 5000 Min)', '1', '7,385.00', '30%', 'RD$ 7,385.00'],
                  ['HPBPAD1', 'Usuario Adicional Plan Premium', '12', '305.00', '30%', 'RD$ 3,660.00'],
                  ['IPHPBXAA', 'Auto Attendant (IVR Mensaje de Bienvenida 1 Árbol)', '1', '410.00', '30%', 'RD$ 410.00'],
                  ['GRP261501', 'Teléfono Grandstream GRP2615 (Pantalla Color 4.3")', '5', '1,275.00', '18%', 'RD$ 6,375.00'],
                  ['GRP260301', 'Teléfono Grandstream GRP2603 (Gigabit 3 Líneas)', '10', '220.00', '18%', 'RD$ 2,200.00'],
                  ['HPRTAC50', 'Router AudioCodes Mediant 50 Usuarios', '1', '2,835.00', '18%', 'RD$ 2,835.00'],
                  ['HPCPESW2', 'Switch 24 Puertos PoE Administrable', '1', '1,535.00', '18%', 'RD$ 1,535.00'],
                  ['INHPBX', 'Instalación Base Hosted PBX Corporativo (8 Usuarios)', '1', '4,200.00', '18%', 'RD$ 4,200.00 (Único)'],
                  ['', '', '', '', 'Subtotal Renta Mensual:', 'RD$ 24,400.00'],
                  ['', '', '', '', 'Total Impuestos (30% / 18%):', 'RD$ 5,832.00'],
                  ['', '', '', '', 'GRAN TOTAL MENSUAL CON IMPUESTOS:', 'RD$ 30,232.00']
                ]
              },
              {
                name: 'Condiciones de Contrato',
                totalRows: 6,
                totalCols: 3,
                rows: [
                  ['Parámetro', 'Valor', 'Detalle Regulatorio'],
                  ['Cliente Comercial', clientName, 'RNC Empresarial Registrado'],
                  ['Plazo de Contrato', '36 Meses', 'SLA Garantizado 99.9%'],
                  ['Validez de Oferta', '30 Días', 'Sujeto a factibilidad de red'],
                  ['Impuestos Aplicables', '30% Servicios / 18% Equipos', 'Ley 153-98 Telecomunicaciones'],
                  ['Soporte Técnico', '24/7 Nivel 3 Enterprise', 'Claro Dominicana']
                ]
              }
            ]
          }));
          return;
        }

        res.end(JSON.stringify({ 
          type: 'cloud_file', 
          isCloudOnly: true,
          name: name,
          folder: folder,
          content: `Archivo disponible en SharePoint Cloud.\nNombre: ${name}\nCarpeta: ${folder}` 
        }));
        return;
      }

      const ext = path.extname(filePath).toLowerCase().replace('.', '');

      // A. Word DOCX Parser
      if (ext === 'docx' || ext === 'doc') {
        try {
          const result = await mammoth.convertToHtml({ path: filePath });
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ 
            type: 'docx', 
            html: result.value, 
            fileName: path.basename(filePath),
            sizeBytes: fs.statSync(filePath).size
          }));
          return;
        } catch (docxErr) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ type: 'text', content: `Error al leer DOCX: ${docxErr.message}` }));
          return;
        }
      }

      // B. Excel XLSX / XLS / CSV Parser
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
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ 
            type: 'excel', 
            sheets, 
            fileName: path.basename(filePath) 
          }));
          return;
        } catch (xlsErr) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ type: 'text', content: `Error al leer Excel: ${xlsErr.message}` }));
          return;
        }
      }

      // C. PDF Stream Reader
      if (ext === 'pdf') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          type: 'pdf', 
          streamUrl: `/api/documents/file?name=${encodeURIComponent(name)}&folder=${encodeURIComponent(folder)}`,
          fileName: path.basename(filePath)
        }));
        return;
      }

      // D. Text / Plain text
      const content = fs.readFileSync(filePath, 'utf-8');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ type: 'text', content, fileName: path.basename(filePath) }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // 6. GET /api/documents/file - Stream raw PDF, images, or documents for browser viewer
  if (pathname === '/api/documents/file' && req.method === 'GET') {
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
      res.writeHead(404, { 'Content-Type': 'text/plain' });
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
      'Content-Disposition': `inline; filename="${encodeURIComponent(path.basename(filePath))}"`
    });
    fs.createReadStream(filePath).pipe(res);
    return;
  }

  // 1. ENDPOINT: Proxy GET (Scraping)
  if (pathname === '/api/proxy' && req.method === 'GET') {
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
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ html }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // 2. ENDPOINT: Test IMAP Connection (POST)
  if (pathname === '/api/emails/test' && req.method === 'POST') {
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
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'success' }));
    } catch (err) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'error', message: err.message }));
    }
    return;
  }

  // 3. ENDPOINT: Fetch emails (Supports both GET query-params and POST JSON-body)
  if (pathname === '/api/emails') {
    try {
      let host, port, user, password, secure;

      if (req.method === 'POST') {
        const body = await readJsonBody(req);
        host = body.host;
        port = body.port;
        user = body.user;
        password = body.password;
        secure = body.secure;
      } else if (req.method === 'GET') {
        host = urlObj.searchParams.get('host');
        port = urlObj.searchParams.get('port');
        user = urlObj.searchParams.get('user');
        password = urlObj.searchParams.get('password');
        secure = urlObj.searchParams.get('secure');
      }

      let imapError = null;
      if (host && user && password && password.trim() !== '') {
        try {
          const imapEmails = await fetchImapEmails({ host, port, user, password, secure });
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(imapEmails));
          return;
        } catch (err) {
          console.error("IMAP connection failed, falling back to local files:", err.message);
          imapError = err.message;
        }
      }

      // Local files fallback
      if (!fs.existsSync(EMAILS_DIR)) {
        res.writeHead(200, { 
          'Content-Type': 'application/json',
          ...(imapError ? { 'x-imap-error': imapError } : {})
        });
        res.end(JSON.stringify([]));
        return;
      }

      try {
        const files = fs.readdirSync(EMAILS_DIR);
        const emails = files
          .filter(file => file.endsWith('.txt') || file.endsWith('.eml'))
          .map(file => {
            const filePath = path.join(EMAILS_DIR, file);
            const content = fs.readFileSync(filePath, 'utf-8');
            return {
              filename: file,
              content: content
            };
          });
        res.writeHead(200, { 
          'Content-Type': 'application/json',
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
    return;
  }

  // 4. Serve Static Files / React SPA Fallback
  let filePath = path.join(DIST_DIR, pathname.slice(1) || 'index.html');

  // Directory traversal prevention
  const relative = path.relative(DIST_DIR, filePath);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // SPA fallback
      filePath = path.join(DIST_DIR, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
