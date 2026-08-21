import React, { useState, useEffect, useMemo } from 'react';
import { Search, Calendar, ChevronRight, Clock, RefreshCw, FileText, ArrowRight, CornerDownRight, Tag, Mail, Inbox, Check, AlertCircle, Plus, Send, Bot, Grid, List, Layers, Filter, GitBranch } from 'lucide-react';

const stripHtml = (html) => {
  if (!html) return '';
  const isHTML = /<[a-z][\s\S]*>/i.test(html) || html.includes('</div>') || html.includes('</p>') || html.includes('<br') || html.includes('</td>');
  if (!isHTML) return html;

  let clean = html;
  // Replace line breaks and block elements with newlines/spaces
  clean = clean.replace(/<br\s*\/?>/gi, '\n');
  clean = clean.replace(/<\/p>/gi, '\n\n');
  clean = clean.replace(/<\/div>/gi, '\n');
  clean = clean.replace(/<\/tr>/gi, '\n');
  clean = clean.replace(/<\/h[1-6]>/gi, '\n\n');

  // Remove style and script blocks completely
  clean = clean.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  clean = clean.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');

  // Remove all other tags
  clean = clean.replace(/<[^>]+>/g, ' ');

  // Replace common HTML entities
  clean = clean.replace(/&nbsp;/g, ' ')
               .replace(/&lt;/g, '<')
               .replace(/&gt;/g, '>')
               .replace(/&amp;/g, '&')
               .replace(/&quot;/g, '"');

  // Clean up whitespace
  clean = clean.replace(/[ \t]+/g, ' ');
  clean = clean.replace(/\n\s*\n+/g, '\n\n');
  return clean.trim();
};

export const initialCommunications = [
  {
    id: 'comm-1',
    title: 'Mantenimiento Programado Servidores Cloud Santo Domingo',
    date: '2026-06-10',
    category: 'Cloud',
    author: 'Claro Cloud Support',
    body: 'Estimado cliente, le informamos que realizaremos un mantenimiento preventivo en nuestro Data Center de Santo Domingo para optimizar las capacidades de almacenamiento SSD de los nodos de Claro Cloud Server. Este mantenimiento durará 2 horas. No se estiman interrupciones completas, pero sí variaciones menores en la latencia.',
    version: '1.0',
    updatesId: null,
    isUpdate: false
  },
  {
    id: 'comm-2',
    title: 'Actualización de Canales y Cobertura Claro Móvil Negocios',
    date: '2026-06-12',
    category: 'Móvil',
    author: 'Gestión Móvil Claro',
    body: 'Nos complace anunciar la inclusión de Roaming Internacional ampliado en toda la zona de Sudamérica para nuestros planes Corporativos y Emprendedores. Esta mejora se aplicará de forma automática en su próximo ciclo de facturación.',
    version: '1.0',
    updatesId: null,
    isUpdate: false
  },
  {
    id: 'comm-3',
    title: 'Mantenimiento Programado Servidores Cloud Santo Domingo - EJECUCIÓN',
    date: '2026-06-15',
    category: 'Cloud',
    author: 'Claro Cloud Support',
    body: 'Seguimiento al comunicado del 10 de junio. Confirmamos que las labores de mantenimiento en las cabinas SSD se ejecutarán esta noche a partir de las 23:59. El tiempo estimado de la ventana de cambios es de 4 horas.',
    version: '2.0',
    updatesId: 'comm-1',
    isUpdate: true
  },
  {
    id: 'comm-4',
    title: 'Mejoras en troncales SIP e IVR Claro HPBX',
    date: '2026-06-14',
    category: 'Telefonía IP',
    author: 'Ingeniería Claro Voz IP',
    body: 'Lanzamiento de la nueva actualización de firmware para los teléfonos IP Yealink y terminales del sistema Centralita Virtual Claro (HPBX). Se corrigen fallas menores de eco de voz y se optimiza el flujo del menú IVR principal.',
    version: '1.0',
    updatesId: null,
    isUpdate: false
  },
  {
    id: 'comm-5',
    title: 'Mantenimiento Programado Servidores Cloud Santo Domingo - FINALIZADO',
    date: '2026-06-16',
    category: 'Cloud',
    author: 'Claro Cloud Support',
    body: 'Confirmamos que las labores de optimización de almacenamiento SSD en el Data Center de Santo Domingo culminaron con total éxito a las 03:15 AM de hoy. Todos los servicios de Claro Cloud Server se encuentran estables y operando con mejoras en lecturas de disco de hasta 15%.',
    version: '3.0',
    updatesId: 'comm-3',
    isUpdate: true
  }
];

const MOCK_INCOMING_TEMPLATES = [
  {
    sender: 'noc.movil@claro.com.do',
    subject: 'Reporte: Degradación de señal 4G/5G en Santo Domingo Este',
    body: `Estimados,
Hemos detectado una degradación temporal de la señal de datos 4G/55G en el área de Santo Domingo Este debido a fallas físicas en los módulos RF de tres de nuestras antenas principales.
Nuestros técnicos ya están trabajando en la sustitución de las tarjetas RF. Se estima que los trabajos culminen a las 16:00 horas del día de hoy.
Afectación estimada: 15% de reducción en velocidad de descarga en la zona.

Soporte Técnico Claro Móvil`
  },
  {
    sender: 'seguridad.ti@claro.com.do',
    subject: 'Alerta de Seguridad: Campaña de Phishing detectada a nombre de Claro',
    body: `Estimados socios,
Se ha reportado una campaña activa de phishing mediante correos electrónicos falsos con el asunto "Tu factura Claro está vencida - Evita corte de servicio".
Estos correos provienen de dominios ajenos a nuestra empresa (como factura-clarodr.net) y redirigen a una pasarela de pago fraudulenta.
Recomendamos alertar a sus colaboradores para evitar ingresar credenciales o datos de pago fuera del portal oficial mi.claro.com.do.

Seguridad de la Información Claro`
  },
  {
    sender: 'cloud.backup@claro.com.do',
    subject: 'Actualización: Migración de plataforma Claro Cloud Backup a versión 4.2',
    body: `Estimados clientes,
Le informamos que el servicio Claro Cloud Backup será actualizado a la versión 4.2 para integrar cifrado AES-256 de extremo a extremo.
Esta migración se realizará en horario nocturno el 2 de julio entre las 02:00 y las 04:00 AM.
Durante esta ventana, las tareas de respaldo automáticas programadas podrían reportar fallas de conexión temporales. Se reintentarán automáticamente al finalizar la migración.

Atentamente,
Claro Cloud Operations`
  }
];

const parseEmailContent = (filename, rawText) => {
  const lines = rawText.split('\n');
  let sender = '';
  let subject = '';
  let bodyLines = [];
  let captureBody = false;

  for (let line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('De:') || trimmed.startsWith('From:')) {
      sender = trimmed.substring(trimmed.indexOf(':') + 1).trim();
    } else if (trimmed.startsWith('Asunto:') || trimmed.startsWith('Subject:')) {
      subject = trimmed.substring(trimmed.indexOf(':') + 1).trim();
    } else if (trimmed.startsWith('Cuerpo:') || trimmed.startsWith('Body:')) {
      captureBody = true;
      const afterCol = trimmed.substring(trimmed.indexOf(':') + 1).trim();
      if (afterCol) bodyLines.push(afterCol);
    } else {
      if (captureBody) {
        bodyLines.push(line);
      } else if (sender || subject) {
        if (trimmed !== '') {
          bodyLines.push(line);
        }
      } else {
        bodyLines.push(line);
      }
    }
  }

  return {
    id: `file-${filename}`,
    filename,
    sender: sender || 'remitente.desconocido@claro.com.do',
    subject: subject || filename.replace(/_/g, ' ').replace('.txt', ''),
    body: bodyLines.join('\n').trim() || rawText.trim(),
    date: new Date().toISOString().split('T')[0]
  };
};










export default function CommunicationsRepo({ 
  communications, 
  profileInterests, 
  onIngestCommunication, 
  apiKey, 
  monitoredEmail,
  emailHost,
  emailPort,
  emailPassword,
  emailSecure,
  targetCommId
}) {
  const [activeSubView, setActiveSubView] = useState('repository');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [activeCommId, setActiveCommId] = useState(null);
  const [viewMode, setViewMode] = useState('timeline'); // 'timeline' | 'cards' | 'list'

  // Sync targetCommId when selected externally from Clara Copilot
  useEffect(() => {
    if (targetCommId && communications && communications.length > 0) {
      // Find matching comm by id, ancNum, or title substring
      const found = communications.find(c => 
        c.id === targetCommId || 
        (c.ancNum && String(c.ancNum) === String(targetCommId)) ||
        (targetCommId.ancNum && c.ancNum && String(c.ancNum) === String(targetCommId.ancNum)) ||
        (targetCommId.subject && c.subject && c.subject.toLowerCase() === targetCommId.subject.toLowerCase())
      );
      if (found) {
        setActiveCommId(found.id);
        setActiveSubView('repository');
      } else if (typeof targetCommId === 'object' && targetCommId.id) {
        setActiveCommId(targetCommId.id);
        setActiveSubView('repository');
      }
    }
  }, [targetCommId, communications]);

  // Categories list
  const categories = [
    'Todos',
    '⚡ Solo Modificados (v2.0)',
    'Cloud & Microsoft 365',
    'Internet & Conectividad',
    'HPBX & Telefonía IP',
    'Móvil & Equipos',
    'Televisión & Claro TV+',
    'Videovigilancia & Ciberseguridad',
    'Comercial & Políticas'
  ];

  const renderEmailBody = (bodyText, maxHeight = '260px') => {
    const isHTML = /<[a-z][\s\S]*>/i.test(bodyText) || bodyText.includes('</div>') || bodyText.includes('</p>') || bodyText.includes('<br') || bodyText.includes('</td>');
    
    if (isHTML) {
      return (
        <iframe
          srcDoc={`
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <style>
                  body { 
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                    font-size: 13px;
                    color: #4B5563;
                    line-height: 1.5;
                    margin: 8px;
                    background-color: #FFFFFF;
                  }
                  p, div, span, td, th {
                    font-family: inherit !important;
                    font-size: inherit !important;
                  }
                </style>
              </head>
              <body>${bodyText}</body>
            </html>
          `}
          style={{
            width: '100%',
            height: maxHeight,
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: '#FFFFFF',
            display: 'block'
          }}
          title="Correo Formateado"
        />
      );
    }

    return (
      <div style={{ 
        fontSize: '0.75rem', 
        maxHeight: maxHeight, 
        overflowY: 'auto', 
        whiteSpace: 'pre-wrap', 
        wordBreak: 'break-word',
        overflowWrap: 'break-word',
        color: 'var(--text-muted)', 
        padding: '10px', 
        backgroundColor: 'var(--bg-primary)', 
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--border-color)',
        lineHeight: '1.5' 
      }}>
        {bodyText}
      </div>
    );
  };
















  // Ingestion history log (read-only history of auto-ingested emails)
  const [inboxEmails, setInboxEmails] = useState(() => {
    const local = localStorage.getItem('claro_inbox_emails_history');
    return local ? JSON.parse(local) : [];
  });
  
  const [isLoadingEmails, setIsLoadingEmails] = useState(false);
  const [activeEmailId, setActiveEmailId] = useState(null);
  const [notificationMsg, setNotificationMsg] = useState('');

  // Sync to localstorage
  useEffect(() => {
    try {
      const lightInbox = inboxEmails.map(({ body, ...rest }) => rest);
      localStorage.setItem('claro_inbox_emails_history', JSON.stringify(lightInbox));
    } catch (e) {
      console.warn('LocalStorage quota exceeded for claro_inbox_emails_history:', e);
    }
  }, [inboxEmails]);

  // Local rule-based classification logic
  const classifyEmailLocally = (email) => {
    const text = (email.subject + " " + email.body).toLowerCase();
    let category = 'Conectividad';
    let isUpdate = false;
    let updatesId = null;
    let title = email.subject || 'Comunicación General';
    let version = '1.0';

    if (text.includes('cloud') || text.includes('servidor') || text.includes('vps') || text.includes('backup') || text.includes('data center')) {
      category = 'Cloud';
    } else if (text.includes('movil') || text.includes('móvil') || text.includes('roaming') || text.includes('celular') || text.includes('5g') || text.includes('RF')) {
      category = 'Móvil';
    } else if (text.includes('hpbx') || text.includes('telefonía') || text.includes('pbx') || text.includes('centralita') || text.includes('sip') || text.includes('llamadas') || text.includes('voz ip')) {
      category = 'Telefonía IP';
    } else if (text.includes('fibra') || text.includes('internet') || text.includes('enlace') || text.includes('ancho de banda') || text.includes('redes')) {
      category = 'Conectividad';
    } else if (text.includes('seguridad') || text.includes('phishing') || text.includes('parche') || text.includes('fortigate') || text.includes('firewall') || text.includes('vulnerabilidad')) {
      category = 'Seguridad';
    }

    // Detect update
    if (text.includes('re:') || text.includes('fwd:') || text.includes('seguimiento') || text.includes('actualización') || text.includes('prórroga') || text.includes('confirmación') || text.includes('finalizado') || text.includes('corte') || text.includes('rotura')) {
      const matches = communications.filter(c => c.category === category);
      if (matches.length > 0) {
        const sortedMatches = [...matches].sort((a,b) => parseFloat(b.version) - parseFloat(a.version));
        updatesId = sortedMatches[0].id;
        isUpdate = true;
        version = (parseFloat(sortedMatches[0].version) + 1.0).toFixed(1);
      }
    }

    const lines = email.body.split('\n').filter(line => line.trim() !== '');
    const cleanBodySummary = lines.length > 2 
      ? lines.slice(0, Math.min(lines.length - 1, 4)).join('\n')
      : email.body;

    return {
      title: title.replace(/^(Re|Fwd|RE|FWD):\s*/i, '').replace(/^(Urgente|Reporte|Alerta|Aviso|Actualización):\s*/i, ''),
      category,
      body: cleanBodySummary,
      isUpdate,
      updatesId,
      version,
      date: new Date().toISOString().split('T')[0],
      author: email.sender
    };
  };










  // Async classifier (AI or rules)
  const classifyEmailAsync = async (email) => {
    const existingList = communications.map(c => ({ id: c.id, title: c.title, category: c.category, version: c.version }));

    if (apiKey && apiKey.trim() !== '') {
      try {
        const prompt = `Analiza el siguiente correo corporativo y responde ÚNICAMENTE con un objeto JSON válido con los campos que se describen a continuación. No agregues explicaciones, markdown fuera de las llaves, ni formato adicional. El JSON debe contener exactamente estos campos:
{
  "title": "Un título descriptivo e institucional en español basado en el correo",
  "category": "Una de las siguientes categorías exactas: 'Cloud', 'Móvil', 'Telefonía IP', 'Conectividad', 'Seguridad'",
  "body": "Un resumen ejecutivo claro, formal y limpio del cuerpo del correo",
  "isUpdate": true/false (indica si este correo hace referencia, da seguimiento, cancela o actualiza una comunicación que ya existía),
  "updatesId": "El ID de la comunicación existente que se está actualizando (busca en la lista de abajo), o null si es una comunicación totalmente nueva o si no coincide con ninguna.",
  "version": "Si es una actualización, propone una versión superior (ej: si la anterior era 1.0, esta es 2.0; si la anterior era 2.0, esta es 3.0). Si es nueva, la versión debe ser '1.0'"
}

Lista de comunicaciones existentes en el repositorio:
${JSON.stringify(existingList, null, 2)}

Correo a analizar:
Remitente: ${email.sender}
Asunto: ${email.subject}
Contenido del correo:
${stripHtml(email.body)}`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
              { role: 'system', content: 'Eres un analista de comunicaciones de Claro Dominicana experto en procesar e indexar correos y clasificarlos.' },
              { role: 'user', content: prompt }
            ],
            temperature: 0.1
          })
        });

        if (response.ok) {
          const data = await response.json();
          const content = data.choices[0].message.content.trim();
          const cleanJson = content.replace(/^```json/, '').replace(/```$/, '').trim();
          const parsed = JSON.parse(cleanJson);
          parsed.date = new Date().toISOString().split('T')[0];
          parsed.author = email.sender;
          return parsed;
        }
      } catch (err) {
        console.error("AI Classification failed, using local rules:", err);
      }
    }

    return classifyEmailLocally(email);
  };










  // Automatically process files from disk
  const processFileSystemEmails = async (silent = false) => {
    setIsLoadingEmails(true);

    // If no IMAP password is configured, skip IMAP and just load local files
    const hasImapConfig = emailHost && monitoredEmail && emailPassword && emailPassword.trim() !== '';
    if (!hasImapConfig && !silent) {
      setNotificationMsg('ℹ️ Modo local: Configura el servidor IMAP en ⚙️ Ajustes para sincronizar correos reales.');
      setTimeout(() => setNotificationMsg(''), 7000);
    }

    try {
      const params = new URLSearchParams();
      if (emailHost) params.append('host', emailHost);
      if (emailPort) params.append('port', emailPort);
      if (monitoredEmail) params.append('user', monitoredEmail);
      if (emailPassword) params.append('password', emailPassword);
      if (emailSecure !== undefined) params.append('secure', String(emailSecure));

      const response = await fetch(`/api/emails?${params.toString()}`);
      if (response.ok) {
        const imapError = response.headers.get('x-imap-error');
        if (imapError && !silent && hasImapConfig) {
          setNotificationMsg(`⚠️ Error IMAP: ${imapError}. Verifica tus credenciales en ⚙️ Ajustes.`);
          setTimeout(() => setNotificationMsg(''), 8000);
        }

        const data = await response.json();
        const parsed = data.map(item => {
          if (item.content !== undefined) {
            return parseEmailContent(item.filename, item.content);
          } else {
            return {
              id: item.id || `imap-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              filename: item.filename,
              sender: item.sender || 'remitente.desconocido@claro.com.do',
              subject: item.subject || 'Sin Asunto',
              body: item.body || '',
              date: item.date || new Date().toISOString().split('T')[0]
            };









          }
        });
        
        const localProcessed = localStorage.getItem('claro_processed_filenames');
        let processedFilenames = localProcessed ? JSON.parse(localProcessed) : [];

        let newlyProcessedLogs = [];
        let messages = [];

        for (const email of parsed) {
          if (!processedFilenames.includes(email.filename)) {
            // Classify automatically without human intervention
            const classification = await classifyEmailAsync(email);
            
            // Build the bulletin structure
            const newComm = {
              ...classification,
              id: `comm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              isAutoIngested: true,
              originalEmail: {
                sender: email.sender,
                subject: email.subject,
                body: email.body,
                date: email.date
              }
            };










            // Publish immediately!
            if (onIngestCommunication) {
              onIngestCommunication(newComm);
            }

            processedFilenames.push(email.filename);
            newlyProcessedLogs.push({
              ...email,
              id: `email-${email.filename}-${Date.now()}`,
              status: 'processed',
              classification: newComm
            });
            messages.push(`¡Correo "${email.subject}" clasificado y publicado automáticamente!`);
          }
        }

        if (newlyProcessedLogs.length > 0) {
          try {
            localStorage.setItem('claro_processed_filenames', JSON.stringify(processedFilenames));
          } catch (e) {}
          setInboxEmails(prev => [...newlyProcessedLogs, ...prev]);
          if (!silent) {
            setNotificationMsg(messages.join('\n'));
            setTimeout(() => setNotificationMsg(''), 6000);
          }
        } else {
          if (!silent) {
            setNotificationMsg('No se detectaron correos nuevos en la carpeta.');
            setTimeout(() => setNotificationMsg(''), 4000);
          }
        }
      }
    } catch (err) {
      console.error("Error loading/processing files:", err);
    } finally {
      setIsLoadingEmails(false);
    }
  };










  // Run auto-ingest once on component mount (silently check for new files)
  useEffect(() => {
    processFileSystemEmails(true);
  }, []);

  // Simulate incoming email, classify and publish immediately
  const handleSimulateIncomingEmail = async () => {
    setIsLoadingEmails(true);
    const randomTpl = MOCK_INCOMING_TEMPLATES[Math.floor(Math.random() * MOCK_INCOMING_TEMPLATES.length)];
    const mockEmail = {
      sender: randomTpl.sender,
      subject: randomTpl.subject,
      body: randomTpl.body,
      date: new Date().toISOString().split('T')[0]
    };










    const classification = await classifyEmailAsync(mockEmail);

    const newComm = {
      ...classification,
      id: `comm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      isAutoIngested: true,
      originalEmail: mockEmail
    };










    // Publish immediately
    if (onIngestCommunication) {
      onIngestCommunication(newComm);
    }

    const logEntry = {
      id: `mock-log-${Date.now()}`,
      sender: mockEmail.sender,
      subject: mockEmail.subject,
      body: mockEmail.body,
      date: mockEmail.date,
      status: 'processed',
      classification: newComm
    };










    setInboxEmails(prev => [logEntry, ...prev]);
    setIsLoadingEmails(false);

    setNotificationMsg(`¡Simulación Exitosa! Correo de "${mockEmail.sender}" recibido. Clasificado automáticamente como "${classification.category}" y publicado.`);
    setTimeout(() => setNotificationMsg(''), 6000);
  };










  // Timeline history resolver
  const getUpdateTimeline = (comm) => {
    if (!comm) return [];
    
    const num = comm.ancNum;
    const matches = (communications || []).filter(c => {
      if (c.id === comm.id) return true;
      if (num && c.ancNum && c.ancNum === num) return true;
      if (c.parentCommId === comm.id || comm.parentCommId === c.id) return true;
      if (c.updatesId === comm.id || comm.updatesId === c.id) return true;
      if (c.parentCommId && comm.parentCommId && c.parentCommId === comm.parentCommId) return true;
      if (c.updatesId && comm.updatesId && c.updatesId === comm.updatesId) return true;
      return false;
    });

    const uniqueMap = new Map();
    matches.forEach(m => uniqueMap.set(m.id, m));
    const uniqueList = Array.from(uniqueMap.values());

    return uniqueList.sort((a, b) => {
      if (!a.ancVariant && b.ancVariant) return -1;
      if (a.ancVariant && !b.ancVariant) return 1;
      if (a.ancVariant && b.ancVariant) return a.ancVariant.localeCompare(b.ancVariant);
      return new Date(a.date) - new Date(b.date);
    });
  };










  const getCategoryColor = (cat) => {
    if (!cat) return 'var(--text-secondary)';
    if (cat.includes('Cloud')) return '#2563EB';
    if (cat.includes('Internet') || cat.includes('Conectividad')) return '#8B5CF6';
    if (cat.includes('HPBX') || cat.includes('Telefonía')) return '#D97706';
    if (cat.includes('Móvil') || cat.includes('Equipos')) return '#10B981';
    if (cat.includes('Televisión') || cat.includes('TV')) return '#EC4899';
    if (cat.includes('Videovigilancia') || cat.includes('Seguridad')) return '#EF4444';
    if (cat.includes('Comercial') || cat.includes('Políticas')) return '#6B7280';
    return 'var(--claro-red)';
  };

  // Filter communications
  const filteredCommunications = useMemo(() => {
    return (communications || []).filter(c => {
      if (selectedCategory === '⚡ Solo Modificados (v2.0)') {
        const hasUpdates = c.isUpdate || c.parentCommId || c.ancVariant || (communications || []).some(other => other.parentCommId === c.id || other.updatesId === c.id);
        if (!hasUpdates) return false;
      } else if (selectedCategory !== 'Todos') {
        if (c.category !== selectedCategory && !c.category?.includes(selectedCategory)) {
          return false;
        }
      }
      if (searchTerm.trim() !== '') {
        const q = searchTerm.toLowerCase();
        const text = ((c.title || c.subject || '') + ' ' + (c.body || '') + ' ' + (c.author || c.sender || '') + ' ' + (c.ancNum || '')).toLowerCase();
        if (!text.includes(q)) return false;
      }
      return true;
    });
  }, [communications, selectedCategory, searchTerm]);

  // Group top-level base announcements for the Timeline
  const timelineGroups = useMemo(() => {
    const baseItems = filteredCommunications.filter(c => !c.parentCommId);
    
    const groups = {};
    baseItems.forEach(item => {
      let dateKey = 'Comunicaciones Recientes';
      if (item.date) {
        const parts = item.date.split('-');
        if (parts.length >= 2) {
          const [yyyy, mm] = parts;
          const dateObj = new Date(`${yyyy}-${mm}-01T00:00:00`);
          if (!isNaN(dateObj.getTime())) {
            dateKey = dateObj.toLocaleDateString('es-DO', { month: 'long', year: 'numeric' });
            dateKey = dateKey.charAt(0).toUpperCase() + dateKey.slice(1);
          } else {
            dateKey = `${yyyy}-${mm}`;
          }
        }
      }

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(item);
    });

    return Object.entries(groups).map(([dateGroup, items]) => ({
      dateGroup,
      items: items.sort((a, b) => new Date(b.date) - new Date(a.date))
    }));
  }, [filteredCommunications]);

  const getUpdatesForParent = (parentId) => {
    return (communications || []).filter(c => c.parentCommId === parentId || c.updatesId === parentId);
  };

  const renderFormattedClaroEmail = (comm) => {
    if (!comm) return null;

    const rawBody = comm.body || '';
    const isHTML = /<[a-z][\s\S]*>/i.test(rawBody) || rawBody.includes('</div>') || rawBody.includes('</p>') || rawBody.includes('<br') || rawBody.includes('</td>');

    let formattedDate = comm.date || '';
    if (comm.date && comm.date.includes('-')) {
      const parts = comm.date.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        if (!isNaN(d.getTime())) {
          formattedDate = d.toLocaleDateString('es-DO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
          formattedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
        }
      }
    }

    const paragraphs = rawBody.split(/\n\s*\n/);

    return (
      <div className="claro-email-card" style={{ 
        backgroundColor: '#FFFFFF', 
        borderRadius: 'var(--radius-md)', 
        border: '1px solid var(--border-color)', 
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
        overflow: 'hidden',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
      }}>
        {/* VERSION SWITCHER BANNER FOR MODIFICATIONS & V2.0 */}
        {activeTimeline.length > 1 && (
          <div style={{
            backgroundColor: '#EFF6FF',
            borderBottom: '2px solid #3B82F6',
            padding: '12px 18px',
            display: 'flex',
            alignItems: 'center',
            justify: 'space-between',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#1E40AF', fontWeight: '800' }}>
              <GitBranch size={18} style={{ color: '#2563EB' }} />
              <span>Historial de Versiones & Modificaciones ({activeTimeline.length} versiones registradas):</span>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              {activeTimeline.map((vItem, vIdx) => {
                const isSelected = vItem.id === comm.id;
                const verLabel = vIdx === 0 ? 'v1.0 (Anuncio Original)' : `v${(vIdx + 1)}.0 (Modificación ${vItem.ancVariant || ''})`;
                return (
                  <button
                    key={vItem.id}
                    onClick={() => setActiveCommId(vItem.id)}
                    style={{
                      padding: '5px 14px',
                      borderRadius: '99px',
                      fontSize: '0.75rem',
                      fontWeight: '800',
                      border: isSelected ? '2px solid #2563EB' : '1px solid #93C5FD',
                      backgroundColor: isSelected ? '#2563EB' : '#FFFFFF',
                      color: isSelected ? '#FFFFFF' : '#1E40AF',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'all 0.2s ease',
                      boxShadow: isSelected ? '0 2px 8px rgba(37,99,235,0.3)' : 'none'
                    }}
                  >
                    {isSelected ? '✓ ' : ''}{verLabel}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* OUTLOOK EMAIL CLIENT HEADER BAR */}
        <div style={{ 
          backgroundColor: 'var(--bg-secondary)', 
          padding: '14px 18px', 
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '6px 14px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <span style={{ fontWeight: '700', color: 'var(--text-muted)' }}>De:</span>
            <div style={{ wordBreak: 'break-all', overflowWrap: 'anywhere' }}>
              <strong style={{ color: 'var(--text-primary)' }}>{comm.senderName || comm.author || 'Info-Canales Claro'}</strong>
              <span style={{ color: 'var(--text-muted)', marginLeft: '6px', wordBreak: 'break-all', overflowWrap: 'anywhere' }}>&lt;{comm.senderEmail || 'info-canales@claro.com.do'}&gt;</span>
            </div>

            <span style={{ fontWeight: '700', color: 'var(--text-muted)' }}>Para:</span>
            <span style={{ color: 'var(--text-primary)' }}>Canales de Ventas Corporativas Claro; Consultores IT & Cloud; Fuerza Comercial</span>

            <span style={{ fontWeight: '700', color: 'var(--text-muted)' }}>Fecha:</span>
            <span style={{ color: 'var(--text-primary)' }}>{formattedDate || comm.date}</span>

            <span style={{ fontWeight: '700', color: 'var(--text-muted)' }}>Asunto:</span>
            <div style={{ fontWeight: '800', color: 'var(--text-primary)', fontSize: '0.9rem' }}>
              {comm.subject || comm.title}
            </div>
          </div>
        </div>

        {/* OFFICIAL CLARO CORPORATE EMAIL BRAND BANNER */}
        <div style={{ 
          background: 'linear-gradient(135deg, #EE1C24 0%, #B91C1C 100%)', 
          color: '#FFFFFF', 
          padding: '18px 20px', 
          display: 'flex', 
          justify: 'space-between', 
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ 
              width: '32px', 
              height: '32px', 
              borderRadius: '50%', 
              backgroundColor: '#FFFFFF', 
              color: '#EE1C24', 
              display: 'flex', 
              alignItems: 'center', 
              justify: 'center',
              fontWeight: '900',
              fontSize: '1.1rem',
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
            }}>
              C
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: '800', letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.9 }}>
                Claro empresas | Comunicado Oficial
              </div>
              <div style={{ fontSize: '1rem', fontWeight: '900', letterSpacing: '-0.01em' }}>
                Boletín Informativo de Canales
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ 
              fontSize: '0.675rem', 
              fontWeight: '800', 
              backgroundColor: 'rgba(255,255,255,0.22)', 
              color: '#FFFFFF', 
              padding: '3px 8px', 
              borderRadius: '99px',
              textTransform: 'uppercase'
            }}>
              {comm.category}
            </span>
            {comm.ancNum && (
              <span style={{ 
                fontSize: '0.675rem', 
                fontWeight: '800', 
                backgroundColor: '#FFFFFF', 
                color: '#EE1C24', 
                padding: '3px 8px', 
                borderRadius: '99px'
              }}>
                ANUNCIO NO. {comm.ancNum}{comm.ancVariant ? `-${comm.ancVariant}` : ''}
              </span>
            )}
          </div>
        </div>

        {/* EMAIL BODY CONTAINER WITH AMPLE LEFT MARGIN PADDING */}
        <div style={{ padding: '20px 24px 20px 36px', backgroundColor: '#FFFFFF', color: '#1E293B', overflowX: 'auto' }}>
          <style>{`
            .claro-email-native-content {
              padding-left: 12px !important;
            }
            .claro-email-native-content p,
            .claro-email-native-content div,
            .claro-email-native-content span {
              box-sizing: border-box !important;
            }
            .claro-email-native-content table {
              border-collapse: collapse !important;
              width: 100% !important;
              margin: 16px 0 !important;
              font-size: 13px !important;
            }
            .claro-email-native-content td, 
            .claro-email-native-content th {
              border: 1px solid #CBD5E1 !important;
              padding: 8px 12px !important;
              text-align: left !important;
              vertical-align: top !important;
            }
            .claro-email-native-content th {
              background-color: #F1F5F9 !important;
              font-weight: 700 !important;
              color: #0F172A !important;
            }
            .claro-email-native-content img {
              max-width: 100% !important;
              height: auto !important;
              display: inline-block !important;
              margin: 8px 0 !important;
            }
            .claro-email-native-content p {
              margin-bottom: 12px;
            }
            .claro-email-native-content a {
              color: #EE1C24;
              text-decoration: underline;
            }
          `}</style>
          {isHTML ? (
            <div 
              className="claro-email-native-content" 
              dangerouslySetInnerHTML={{ 
                __html: rawBody.includes('<body') ? rawBody.match(/<body[^>]*>([\s\S]*)<\/body>/i)[1] : rawBody 
              }} 
            />
          ) : (
            <div style={{ whiteSpace: 'pre-wrap', color: '#334155', lineHeight: '1.6', fontSize: '0.9rem' }}>
              {rawBody}
            </div>
          )}
        </div>

        {/* OFFICIAL CLARO CORPORATE SIGNATURE FOOTER */}
        <div style={{ 
          backgroundColor: '#F8FAFC', 
          padding: '16px 20px', 
          borderTop: '1px solid #E2E8F0',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px',
          fontSize: '0.75rem',
          color: '#64748B'
        }}>
          <div>
            <strong style={{ color: '#0F172A' }}>Compañía Dominicana de Teléfonos, S.A. (Claro)</strong> <br />
            <span>Dirección de Soluciones Corporativas & Canales de Ventas</span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span>Santo Domingo, República Dominicana</span> <br />
            <span style={{ color: '#EE1C24', fontWeight: '600' }}>soporte-canales@claro.com.do</span>
          </div>
        </div>
      </div>
    );
  };










  const activeComm = communications.find(c => c.id === activeCommId);
  const activeTimeline = activeComm ? getUpdateTimeline(activeComm) : [];

  const selectedEmailLog = inboxEmails.find(e => e.id === activeEmailId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* Sub-Navigation and Global Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ 
            fontSize: '0.85rem', 
            fontWeight: '700', 
            textTransform: 'uppercase', 
            color: 'var(--text-secondary)',
            letterSpacing: '0.05em',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <FileText size={16} style={{ color: 'var(--claro-red)' }} /> Repositorio de Boletines
          </span>
        </div>

        {/* Global trigger buttons directly in the header */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ 
            fontSize: '0.8rem', 
            color: 'var(--text-secondary)', 
            backgroundColor: 'var(--bg-secondary)', 
            padding: '6px 12px', 
            borderRadius: 'var(--radius-full)', 
            border: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginRight: '8px'
          }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }} />
            <span>Monitoreando casilla: <strong>{monitoredEmail}</strong></span>
          </div>

          <button 
            onClick={() => processFileSystemEmails(false)}
            disabled={isLoadingEmails}
            className="btn btn-secondary animate-fade-in"
            style={{ padding: '8px 14px', fontSize: '0.825rem', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <RefreshCw size={14} className={isLoadingEmails ? "animate-spin" : ""} style={{ animation: isLoadingEmails ? 'spin 1.2s linear infinite' : undefined }} />
            Sincronizar emails/
          </button>
          
          <button 
            onClick={handleSimulateIncomingEmail}
            disabled={isLoadingEmails}
            className="btn btn-primary"
            style={{ 
              padding: '8px 14px', 
              fontSize: '0.825rem', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px',
              backgroundColor: 'var(--claro-red)',
              borderColor: 'var(--claro-red)',
              color: '#FFFFFF'
            }}
          >
            <Plus size={14} />
            Simular Recibir Correo
          </button>
        </div>
      </div>

      {/* Notifications Alert Banner */}
      {notificationMsg && (
        <div className="glass-panel animate-fade-in" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          backgroundColor: 'rgba(37, 99, 235, 0.1)', 
          color: '#2563EB', 
          padding: '12px 18px', 
          borderRadius: 'var(--radius-md)', 
          fontSize: '0.9rem',
          borderLeft: '4px solid #2563EB',
          whiteSpace: 'pre-line'
        }}>
          <Check size={18} style={{ color: '#2563EB', flexShrink: 0 }} />
          <div><strong>{notificationMsg}</strong></div>
        </div>
      )}

      {/* VIEW 1: REPOSITORY (BOLETINES PUBLICADOS) */}
      {activeSubView === 'repository' && (
        <div className="animate-fade-in repo-layout">
          
          {/* Left panel: List of communications */}
          <div>
            <div style={{ marginBottom: '16px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '8px', fontFamily: 'var(--font-display)' }}>
                Repositorio Claro Insight
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Listado completo de boletines oficiales indexados y clasificados por IA.
              </p>
            </div>

            {/* Filter bar and search */}
            <div className="glass-panel" style={{ padding: '16px', marginBottom: '16px' }}>
              <div style={{ position: 'relative', marginBottom: '12px' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Buscar comunicados..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ paddingLeft: '40px', fontSize: '0.875rem' }}
                />
                <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>

              <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    style={{ 
                      padding: '6px 12px', 
                      fontSize: '0.75rem', 
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-color)',
                      backgroundColor: selectedCategory === cat ? 'var(--claro-red)' : 'var(--bg-secondary)',
                      color: selectedCategory === cat ? '#FFFFFF' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      fontWeight: '600',
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Communications List container */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '550px', overflowY: 'auto', paddingRight: '4px' }}>
              {filteredCommunications.length > 0 ? (
                filteredCommunications.map(comm => (
                  <div 
                    key={comm.id}
                    onClick={() => setActiveCommId(comm.id)}
                    className="glass-panel"
                    style={{ 
                      padding: '16px', 
                      cursor: 'pointer',
                      flexShrink: 0,
                      borderLeft: `4px solid ${getCategoryColor(comm.category)}`,
                      borderColor: activeCommId === comm.id ? 'var(--claro-red)' : undefined,
                      backgroundColor: activeCommId === comm.id ? 'rgba(238, 28, 36, 0.03)' : undefined,
                      transform: activeCommId === comm.id ? 'translateX(4px)' : undefined,
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <span style={{ 
                        fontSize: '0.7rem', 
                        fontWeight: '700', 
                        textTransform: 'uppercase', 
                        color: getCategoryColor(comm.category)
                      }}>
                        {comm.category}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                        <Calendar size={12} />
                        <span>{comm.date}</span>
                      </div>
                    </div>

                    <h4 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '6px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {comm.title}
                      {comm.isUpdate && (
                        <span style={{ 
                          backgroundColor: 'var(--claro-red-light)', 
                          color: 'var(--claro-red)', 
                          fontSize: '0.65rem', 
                          padding: '2px 6px', 
                          borderRadius: 'var(--radius-full)',
                          fontWeight: '700',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '2px'
                        }}>
                          <RefreshCw size={8} /> Act
                        </span>
                      )}
                      {comm.isAutoIngested && (
                        <span style={{ 
                          backgroundColor: 'rgba(37, 99, 235, 0.1)', 
                          color: '#2563EB', 
                          fontSize: '0.65rem', 
                          padding: '2px 6px', 
                          borderRadius: 'var(--radius-full)',
                          fontWeight: '700',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '2px'
                        }} title="Este boletín fue ingresado automáticamente desde un correo electrónico sin intervención humana">
                          <Mail size={8} /> Auto IA
                        </span>
                      )}
                    </h4>

                    <p style={{ 
                      color: 'var(--text-secondary)', 
                      fontSize: '0.825rem', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis', 
                      display: '-webkit-box', 
                      WebkitLineClamp: 2, 
                      WebkitBoxOrient: 'vertical',
                      lineHeight: '1.4'
                    }}>
                      {stripHtml(comm.body)}
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <span>Versión: v{comm.version}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '2px', color: 'var(--claro-red)', fontWeight: '600' }}>
                        Leer más <ChevronRight size={12} />
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="glass-panel" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <p style={{ fontSize: '0.9rem' }}>No hay comunicados en base a tus filtros.</p>
                  {profileInterests.length > 0 && (
                    <p style={{ fontSize: '0.8rem', marginTop: '6px' }}>Tienes filtros de interés aplicados en tu perfil.</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right panel: Details & update timeline */}
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, maxWidth: '100%', boxSizing: 'border-box' }}>
            {activeComm ? (
              <div className="glass-panel animate-slide-right" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', height: '100%', minHeight: '450px', overflowY: 'auto', minWidth: 0, maxWidth: '100%', boxSizing: 'border-box' }}>
                
                {/* Authentic Claro Corporate Email Viewer */}
                <div style={{ flex: 1 }}>
                  {renderFormattedClaroEmail(activeComm)}
                </div>

                {/* Original Email details if Auto-Ingested */}
                {activeComm.isAutoIngested && activeComm.originalEmail && (
                  <div style={{ 
                    marginTop: '10px', 
                    padding: '16px', 
                    backgroundColor: 'var(--bg-secondary)', 
                    border: '1px dashed var(--border-color)', 
                    borderRadius: 'var(--radius-md)' 
                  }}>
                    <h5 style={{ 
                      fontSize: '0.8rem', 
                      fontWeight: '800', 
                      textTransform: 'uppercase', 
                      color: '#2563EB', 
                      marginBottom: '8px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '4px' 
                    }}>
                      <Mail size={12} /> Correo Original Procesado por IA
                    </h5>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      <strong>Remitente:</strong> {activeComm.originalEmail.sender} <br />
                      <strong>Asunto original:</strong> {activeComm.originalEmail.subject}
                    </p>
                    {renderEmailBody(activeComm.originalEmail.body, '120px')}
                  </div>
                )}

                {/* Document Updates Timeline */}
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px', marginTop: '10px' }}>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={14} /> Línea de Tiempo / Historial de Actualizaciones
                  </h4>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative', paddingLeft: '20px' }}>
                    {/* Timeline vertical bar */}
                    <div style={{ 
                      position: 'absolute', 
                      left: '6px', 
                      top: '8px', 
                      bottom: '8px', 
                      width: '2px', 
                      backgroundColor: 'var(--border-color)' 
                    }}/>

                    {activeTimeline.map((tComm, index) => {
                      const isActive = tComm.id === activeComm.id;
                      return (
                        <div 
                          key={tComm.id} 
                          onClick={() => setActiveCommId(tComm.id)}
                          style={{ 
                            position: 'relative', 
                            cursor: 'pointer',
                            flexShrink: 0,
                            padding: '10px 14px',
                            backgroundColor: isActive ? 'var(--claro-red-light)' : 'var(--bg-primary)',
                            border: `1px solid ${isActive ? 'var(--claro-red)' : 'var(--border-color)'}`,
                            borderRadius: 'var(--radius-md)',
                            transition: 'all var(--transition-fast)'
                          }}
                        >
                          {/* Node point */}
                          <div style={{ 
                            position: 'absolute', 
                            left: '-18px', 
                            top: '16px', 
                            width: '10px', 
                            height: '10px', 
                            borderRadius: '99px', 
                            backgroundColor: isActive ? 'var(--claro-red)' : 'var(--text-muted)',
                            border: '2px solid var(--bg-secondary)',
                            boxShadow: isActive ? '0 0 8px var(--claro-red)' : undefined
                          }}/>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: isActive ? 'var(--claro-red)' : 'var(--text-primary)' }}>
                              v{tComm.version} {index === 0 && '(Inicial)'} {index === activeTimeline.length - 1 && index !== 0 && '(Última)'}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{tComm.date}</span>
                          </div>
                          <p style={{ 
                            fontSize: '0.8rem', 
                            color: 'var(--text-secondary)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            fontWeight: isActive ? '600' : 'normal'
                          }}>
                            {tComm.title}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass-panel" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', flex: 1, minHeight: '450px' }}>
                <FileText size={48} strokeWidth={1.5} style={{ marginBottom: '16px', color: 'var(--text-muted)' }} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '6px' }}>Ningún comunicado seleccionado</h3>
                <p style={{ fontSize: '0.875rem', maxWidth: '300px' }}>Selecciona un comunicado del panel izquierdo para ver sus detalles y línea de actualizaciones.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: LOG DE INGESTA HISTÓRICA */}
      {activeSubView === 'inbox_log' && (
        <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '24px', minWidth: 0 }}>
          
          {/* Left Panel: Log List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: 0 }}>
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: '700', margin: '0 0 4px 0', fontFamily: 'var(--font-display)' }}>
                Registro de Ingesta
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }} />
                {inboxEmails.length} correos procesados automáticamente por IA
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '620px', overflowY: 'auto', paddingRight: '2px' }}>
              {inboxEmails.length > 0 ? (
                inboxEmails.map(email => {
                  const isActive = activeEmailId === email.id;
                  const category = email.classification?.category || 'General';
                  const catColor = getCategoryColor(category);
                  const senderInitial = (email.sender || 'U').charAt(0).toUpperCase();
                  return (
                    <div 
                      key={email.id}
                      onClick={() => setActiveEmailId(email.id)}
                      style={{ 
                        padding: '14px 16px',
                        cursor: 'pointer',
                        flexShrink: 0,
                        borderRadius: 'var(--radius-md)',
                        border: `1px solid ${isActive ? catColor : 'var(--border-color)'}`,
                        backgroundColor: isActive ? `${catColor}08` : 'var(--bg-secondary)',
                        boxShadow: isActive ? `0 4px 16px ${catColor}15` : 'var(--shadow-sm)',
                        borderLeft: `4px solid ${catColor}`,
                        transform: isActive ? 'translateX(3px)' : undefined,
                        transition: 'all var(--transition-fast)',
                        minWidth: 0
                      }}
                    >
                      {/* Top row: sender avatar + category + date */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                          <div style={{
                            width: '28px', height: '28px', borderRadius: '50%',
                            backgroundColor: catColor,
                            color: '#FFF', fontWeight: '800', fontSize: '0.8rem',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            {senderInitial}
                          </div>
                          <span style={{
                            fontSize: '0.62rem', fontWeight: '800', textTransform: 'uppercase',
                            color: catColor, backgroundColor: `${catColor}15`,
                            padding: '2px 7px', borderRadius: '4px', letterSpacing: '0.04em',
                            flexShrink: 0
                          }}>
                            {category}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                          {email.date}
                        </span>
                      </div>

                      {/* Subject */}
                      <div style={{
                        fontSize: '0.875rem', fontWeight: '700',
                        color: 'var(--text-primary)', marginBottom: '4px',
                        overflow: 'hidden', textOverflow: 'ellipsis',
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                        lineHeight: '1.35'
                      }}>
                        {email.subject || '(Sin asunto)'}
                      </div>

                      {/* Sender row */}
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {email.sender || 'Remitente desconocido'}
                      </div>

                      {/* Bottom: AI badge */}
                      <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{
                          fontSize: '0.6rem', fontWeight: '700', textTransform: 'uppercase',
                          color: '#10B981', backgroundColor: 'rgba(16,185,129,0.1)',
                          padding: '2px 7px', borderRadius: '4px',
                          display: 'flex', alignItems: 'center', gap: '4px'
                        }}>
                          <Check size={9} /> Publicado por IA
                        </span>
                        <span style={{ fontSize: '0.65rem', color: isActive ? catColor : 'var(--text-muted)', fontWeight: '600' }}>
                          {isActive ? 'Viendo →' : 'Ver detalle →'}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                  <Mail size={36} strokeWidth={1.5} style={{ opacity: 0.5 }} />
                  <p style={{ fontSize: '0.875rem', fontWeight: '600' }}>Bandeja vacía</p>
                  <p style={{ fontSize: '0.775rem' }}>Haz clic en "Sincronizar emails/" o configura el IMAP en ⚙️ Ajustes.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel: Log Detail */}
          <div style={{ minWidth: 0 }}>
            {selectedEmailLog ? (
              <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', margin: 0 }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                    <Bot size={20} style={{ color: 'var(--claro-red)' }} /> Auditoría de Ingesta Inteligente
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {selectedEmailLog.id}</span>
                </div>

                <div className="glass-panel animate-scale-in" style={{ padding: '0', display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: '520px', minWidth: 0 }}>
                  {/* Status Banner */}
                  <div style={{ 
                    padding: '12px 18px', 
                    backgroundColor: 'rgba(16, 185, 129, 0.06)', 
                    borderBottom: '1px solid rgba(16, 185, 129, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '10px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', fontSize: '0.85rem', color: '#10B981' }}>
                      <Check size={16} /> Correo indexado automáticamente en el repositorio oficial
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ 
                        fontSize: '0.7rem', 
                        fontWeight: '700', 
                        color: '#FFFFFF',
                        backgroundColor: getCategoryColor(selectedEmailLog.classification.category),
                        padding: '3px 10px',
                        borderRadius: 'var(--radius-sm)'
                      }}>{selectedEmailLog.classification.category}</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-primary)' }}>v{selectedEmailLog.classification.version}</span>
                      
                      <button
                        onClick={() => {
                          setActiveSubView('repository');
                          // Try matching by subject or title
                          const matched = communications.find(c => 
                            c.title === selectedEmailLog.classification.title ||
                            (c.originalEmail && c.originalEmail.subject === selectedEmailLog.subject)
                          );
                          if (matched) {
                            setActiveCommId(matched.id);
                          }
                        }}
                        className="btn btn-secondary"
                        style={{ padding: '4px 10px', fontSize: '0.72rem', height: '26px', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <FileText size={12} /> Ver Boletín →
                      </button>
                    </div>
                  </div>

                  {/* Header metadata */}
                  <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px dashed var(--border-color)', fontSize: '0.825rem', color: 'var(--text-secondary)', backgroundColor: 'rgba(75, 85, 99, 0.02)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0, flex: 1 }}>
                      <div><strong>De:</strong> <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{selectedEmailLog.sender}</span></div>
                      <div style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={selectedEmailLog.subject}>
                        <strong>Asunto original:</strong> <span style={{ color: 'var(--text-primary)' }}>{selectedEmailLog.subject}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '4px', flexShrink: 0 }}>
                      <div><strong>Fecha de ingesta:</strong> {selectedEmailLog.date}</div>
                      <span style={{ fontSize: '0.65rem', alignSelf: 'flex-end', backgroundColor: 'var(--bg-primary)', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>MIME/HTML</span>
                    </div>
                  </div>

                  {/* Email body render */}
                  <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {renderEmailBody(selectedEmailLog.body, '450px')}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ 
                padding: '60px 48px', textAlign: 'center', color: 'var(--text-muted)', 
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
                minHeight: '480px',
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)'
              }}>
                <div style={{
                  width: '72px', height: '72px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--claro-red) 0%, #7C3AED 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '20px', opacity: 0.7,
                  boxShadow: '0 8px 24px rgba(255, 30, 39, 0.15)'
                }}>
                  <Bot size={34} style={{ color: '#FFFFFF' }} />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '8px', color: 'var(--text-primary)' }}>
                  Auditoría de Ingesta IA
                </h3>
                <p style={{ fontSize: '0.85rem', maxWidth: '260px', lineHeight: '1.6', color: 'var(--text-muted)' }}>
                  Selecciona un correo de la lista para comparar su contenido original con el boletín clasificado por IA.
                </p>
                <div style={{ marginTop: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', backgroundColor: 'var(--bg-tertiary)', padding: '4px 10px', borderRadius: '4px' }}>📧 IMAP / Email</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', backgroundColor: 'var(--bg-tertiary)', padding: '4px 10px', borderRadius: '4px' }}>🤖 Clasificación IA</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', backgroundColor: 'var(--bg-tertiary)', padding: '4px 10px', borderRadius: '4px' }}>📋 Repositorio</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1.2s linear infinite;
        }
      `}</style>
    </div>
  );
}