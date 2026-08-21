import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Download, Printer, RefreshCw, Award, X, Maximize2, Minimize2, Sparkles, MessageSquare, FileText, FileSpreadsheet } from 'lucide-react';
import confetti from 'canvas-confetti';
import { productsData } from '../data/claroProducts';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { parseAndGenerateHPBXFromText, extractClientNameFromText } from '../utils/hpbxQuotationModel';
import OfficialQuoteModal from './OfficialQuoteModal';
import { exportQuoteToExcel } from '../utils/exportQuoteToExcel';

const TEASER_PROMPTS = [
  "⚡ ¿Deseas cotizar Hosted PBX oficial en segundos?",
  "📜 ¿Cumples con la Ley 32-23 DGII de Facturación Electrónica?",
  "☁️ ¿Necesitas IaaS en Claro Cloud Empresarial con baja latencia?",
  "🛡️ ¡Protege tu empresa con SASE, SD-WAN y SIEM SOC 24/7!",
  "💡 ¡Hola! Pregúntame sobre cualquier solución de Claro Cloud."
];

const QUICK_CHIPS = [
  { label: '⚡ Cotizar Hosted PBX', query: 'Cotízame una HPBX corporativa para 10 usuarios con teléfonos y sistema de tierra' },
  { label: '📜 Facturación Electrónica DGII', query: '¿Cómo funciona la Facturación Electrónica Claro Cloud para la Ley 32-23 de la DGII?' },
  { label: '☁️ Claro Cloud Empresarial', query: '¿Qué ventajas y características tiene Claro Cloud Empresarial (IaaS)?' },
  { label: '🛡️ Ciberseguridad & SASE', query: '¿Qué soluciones de seguridad perimetral, SD-WAN y SASE ofrece Claro Cloud?' },
  { label: '💼 ERP & Punto de Venta', query: '¿Qué funcionalidades incluye Gestión de Negocios ERP y Punto de Venta Cloud?' }
];

export default function ClaroCopilot({ 
  apiKey, 
  prefilledQuery, 
  onClearPrefilled, 
  isOpen, 
  onToggleOpen,
  customAgentMode = 'openai',
  assistantId = '',
  webhookUrl = '',
  openaiModel = 'gpt-4o-mini',
  mode = 'floating', // 'floating' or 'embedded'
  onOpenCommunication
}) {
  const [pendingQuoteDraft, setPendingQuoteDraft] = useState(null);
  const [selectedModel, setSelectedModel] = useState('gpt-4o-mini');
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: '¡Hola! Soy **Clara**, tu Consultora Comercial con Inteligencia Artificial para **Claro Negocios**. 🇩🇴\n\nTengo acceso al catálogo oficial y a toda la base documental técnica de Claro Cloud, Hosted PBX, Datacenter y Facturación Electrónica DGII.\n\n¿A qué cliente o solución deseas que le elaboremos una propuesta hoy?'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showTeaser, setShowTeaser] = useState(true);
  const [teaserIndex, setTeaserIndex] = useState(0);
  const [hasUnread, setHasUnread] = useState(false);
  const [activeOfficialQuote, setActiveOfficialQuote] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-cycle incentive speech teaser prompts every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setTeaserIndex(prev => (prev + 1) % TEASER_PROMPTS.length);
    }, 6500);
    return () => clearInterval(timer);
  }, []);

  // Load conversation history from database on mount
  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        const res = await fetch('/api/chat/history?sessionId=default-session');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setMessages(data);
          }
        }
      } catch (err) {
        console.error("Error loading chat history from database:", err);
      }
    };
    loadChatHistory();
  }, []);

  // Helper to persist message object to database
  const saveMessageToDb = async (msgObj) => {
    try {
      await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: msgObj.id,
          sessionId: 'default-session',
          sender: msgObj.sender,
          text: msgObj.text,
          quoteData: msgObj.quoteData || null,
          quoteObj: msgObj.quoteObj || null
        })
      });
    } catch (err) {
      console.error("Error persisting message to DB:", err);
    }
  };

  // Auto scroll to bottom when messages update
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setHasUnread(false);
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [messages, isTyping, isOpen]);

  // Handle prefilled query triggers from external components (e.g. Product Catalog)
  useEffect(() => {
    if (prefilledQuery) {
      if (!isOpen && onToggleOpen) {
        onToggleOpen(true);
      }
      processUserMessage(prefilledQuery);
      if (onClearPrefilled) onClearPrefilled();
    }
  }, [prefilledQuery]);

  const [serverApiKey, setServerApiKey] = useState('');

  useEffect(() => {
    fetch('/api/config/openai-key')
      .then(res => res.json())
      .then(data => {
        if (data.apiKey) setServerApiKey(data.apiKey);
      })
      .catch(() => {});
  }, []);

  const rawKey = apiKey || localStorage.getItem('claro_active_api_key') || serverApiKey || '';
  const activeApiKey = rawKey.trim();

  const processUserMessage = async (userMsgText) => {
    const userMsgId = `msg-${Date.now()}`;
    
    const userMsgObj = { id: userMsgId, sender: 'user', text: userMsgText };
    setMessages(prev => [...prev, userMsgObj]);
    saveMessageToDb(userMsgObj);
    setIsTyping(true);

    if (!isOpen && onToggleOpen) {
      onToggleOpen(true);
    }

    const chatHistory = messages.map(m => ({
      role: m.sender === 'user' ? 'user' : 'assistant',
      content: m.text
    }));

    if (customAgentMode === 'webhook' && webhookUrl && webhookUrl.trim() !== '') {
      runWebhookAgent(chatHistory, userMsgText);
    } else if (customAgentMode === 'assistant' && assistantId && activeApiKey) {
      runAssistantAgent(userMsgText, activeApiKey);
    } else if (activeApiKey && activeApiKey.trim() !== '') {
      runFetchChat(chatHistory, userMsgText, activeApiKey);
    } else {
      setTimeout(() => {
        simulateBotResponse(userMsgText);
        setIsTyping(false);
      }, 500);
    }
  };

  const runWebhookAgent = async (history, userMsgText) => {
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsgText,
          history: history,
          userId: 'Claro Business User'
        })
      });
      if (!response.ok) throw new Error('Error de comunicación con Webhook del Agente.');
      const data = await response.json();
      const botText = data.reply || data.text || data.message || (typeof data === 'string' ? data : JSON.stringify(data));
      const quoteData = data.quoteData || null;
      processBotResponse(botText, quoteData);
    } catch (err) {
      console.error("Webhook Agent error:", err);
      simulateBotResponse(userMsgText);
    } finally {
      setIsTyping(false);
    }
  };

  const runAssistantAgent = async (userMsgText, keyToUse) => {
    const key = keyToUse || activeApiKey;
    try {
      // 1. Create Thread
      const threadRes = await fetch('https://api.openai.com/v1/threads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`,
          'OpenAI-Beta': 'assistants=v2'
        }
      });
      const thread = await threadRes.json();
      if (!threadRes.ok) throw new Error(thread.error?.message || 'Error al crear thread en OpenAI Assistants');
      const threadId = thread.id;

      // 2. Add Message
      await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`,
          'OpenAI-Beta': 'assistants=v2'
        },
        body: JSON.stringify({
          role: 'user',
          content: userMsgText
        })
      });

      // 3. Create Run
      const runRes = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`,
          'OpenAI-Beta': 'assistants=v2'
        },
        body: JSON.stringify({
          assistant_id: assistantId
        })
      });
      const run = await runRes.json();
      if (!runRes.ok) throw new Error(run.error?.message || 'Error al ejecutar Assistant Run');
      const runId = run.id;

      // 4. Poll Run status
      let runStatus = run.status;
      let attempts = 0;
      while (runStatus !== 'completed' && attempts < 25) {
        await new Promise(r => setTimeout(r, 1000));
        attempts++;
        const pollRes = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs/${runId}`, {
          headers: {
            'Authorization': `Bearer ${key}`,
            'OpenAI-Beta': 'assistants=v2'
          }
        });
        const pollData = await pollRes.json();
        runStatus = pollData.status;
        if (runStatus === 'failed' || runStatus === 'cancelled') {
          throw new Error(`Asistente finalizó con estado: ${runStatus}`);
        }
      }

      // 5. Fetch Messages
      const msgRes = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
        headers: {
          'Authorization': `Bearer ${key}`,
          'OpenAI-Beta': 'assistants=v2'
        }
      });
      const msgData = await msgRes.json();
      const botMsg = msgData.data ? msgData.data.find(m => m.role === 'assistant') : null;
      const botText = botMsg?.content?.[0]?.text?.value || 'Respuesta generada por tu asistente.';
      processBotResponse(botText);
    } catch (err) {
      console.warn("OpenAI Assistant error, falling back to local Claro engine:", err);
      simulateBotResponse(userMsgText);
    } finally {
      setIsTyping(false);
    }
  };

  const runFetchChat = async (history, userMsgText, keyToUse) => {
    const key = keyToUse || activeApiKey;
    try {
      let overrideClient = null;
      if (pendingQuoteDraft) {
        overrideClient = extractClientNameFromText(userMsgText) || userMsgText.trim();
      }

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: history,
          userMsgText: userMsgText,
          model: selectedModel || 'gpt-4o-mini',
          apiKey: key,
          overrideClient: overrideClient
        })
      });

      if (!response.ok) {
        throw new Error(`Error en servidor AI: ${response.status}`);
      }

      const resData = await response.json();
      processBotResponse(resData.text, resData.ragDocs || [], resData.commDocs || [], resData.hpbxParsed);
    } catch (err) {
      console.warn("AI Chat API error, falling back to local Claro engine:", err);
      simulateBotResponse(userMsgText);
    } finally {
      setIsTyping(false);
    }
  };

  const processBotResponse = (text, ragDocs = [], commDocs = [], hpbxParsed = null) => {
    let quoteData = null;
    let cleanText = text;

    const regex = /:::QUOTE_DATA:::([\s\S]*?):::END_QUOTE_DATA:::/;
    const match = text.match(regex);

    if (match) {
      try {
        quoteData = JSON.parse(match[1].trim());
        cleanText = text.replace(regex, '').trim();
        triggerConfetti();
      } catch (e) {
        console.error('Error al parsear JSON de cotización:', e);
      }
    }

    let quoteObj = null;
    if (cleanText.includes('HOSTED PBX') || cleanText.includes('HPBX') || cleanText.includes('Propuesta Comercial')) {
      try {
        const clientName = quoteData?.clientName || extractClientNameFromText(cleanText) || null;
        const parsed = hpbxParsed || parseAndGenerateHPBXFromText(cleanText, 'Brian Quiroz (Claro Negocios)', clientName);
        quoteObj = parsed.quote;
        if (!quoteData && parsed.quoteData) {
          quoteData = { ...parsed.quoteData, clientName: parsed.clientName };
          triggerConfetti();
        }
      } catch (e) {
        // ignore
      }
    }

    const botMsgObj = {
      id: `msg-${Date.now()}`,
      sender: 'bot',
      text: cleanText,
      quoteData: quoteData,
      quoteObj: quoteObj,
      ragDocs: ragDocs,
      commDocs: commDocs
    };
    setMessages(prev => [...prev, botMsgObj]);
    saveMessageToDb(botMsgObj);

    if (!isOpen) {
      setHasUnread(true);
    }
  };

  const simulateBotResponse = (userText) => {
    const text = userText.toLowerCase();
    let reply = "";
    let quoteData = null;
    let quoteObj = null;

    // 0. Check if we have a pending quote draft waiting for client name
    if (pendingQuoteDraft) {
      const clientName = extractClientNameFromText(userText) || userText.trim();
      if (clientName && clientName.length >= 2) {
        if (pendingQuoteDraft.type === 'hpbx') {
          const hpbxResult = parseAndGenerateHPBXFromText(pendingQuoteDraft.rawPrompt, 'Brian Quiroz (Claro Negocios)', clientName);
          reply = `¡Perfecto! He generado la propuesta formal oficial para **${clientName}** bajo el modelo de **Claro Hosted PBX (${hpbxResult.quote.type})** y creado su carpeta de expediente comercial:\n\n${hpbxResult.markdown}`;
          quoteData = { ...hpbxResult.quoteData, clientName: clientName };
          quoteObj = hpbxResult.quote;
          triggerConfetti();
          setPendingQuoteDraft(null);
        } else if (pendingQuoteDraft.type === 'cloud') {
          reply = `¡Listo! He registrado la cotización de **Claro Cloud Server** para **${clientName}** y creado su carpeta de expediente comercial:`;
          quoteData = {
            ...pendingQuoteDraft.quoteData,
            clientName: clientName
          };
          triggerConfetti();
          setPendingQuoteDraft(null);
        } else if (pendingQuoteDraft.type === 'movil') {
          reply = `¡Excelente! He generado la propuesta de **Planes Móviles Negocios 5G** para **${clientName}**:`;
          quoteData = {
            ...pendingQuoteDraft.quoteData,
            clientName: clientName
          };
          triggerConfetti();
          setPendingQuoteDraft(null);
        }
      }
    }
    // 1. HPBX Quoting flow
    else if (text.includes('hpbx') || text.includes('telefon') || text.includes('centralita') || text.includes('planta') || text.includes('gxp') || text.includes('audiocodes') || text.includes('pyme') || text.includes('corporativ')) {
      if (text.includes('cotiza') || text.includes('precio') || text.includes('cuanto') || text.includes('costo') || text.includes('usuario') || text.includes('cliente') || text.includes('para')) {
        const hpbxResult = parseAndGenerateHPBXFromText(userText);
        
        if (!hpbxResult.hasClientName) {
          // Ask for client name before issuing quote
          setPendingQuoteDraft({ type: 'hpbx', rawPrompt: userText, parsed: hpbxResult });
          reply = `¡Excelente! Tengo configurada la propuesta técnica de tu **Hosted PBX Claro (${hpbxResult.quote.type})** para **${hpbxResult.quote.customer.activeUsers} usuarios** con sus terminales y equipamiento correspondiente. 📋\n\n¿A nombre de **qué cliente o empresa** emitimos esta cotización formal para crear su expediente comercial y propuesta oficial?`;
        } else {
          reply = `¡Con gusto! He generado la propuesta formal oficial para **${hpbxResult.clientName}** bajo el formato corporativo de **Claro Hosted PBX (${hpbxResult.quote.type})**:\n\n${hpbxResult.markdown}`;
          quoteData = { ...hpbxResult.quoteData, clientName: hpbxResult.clientName };
          quoteObj = hpbxResult.quote;
          triggerConfetti();
        }
      } else {
        reply = `La **Centralita Virtual Claro (HPBX)** reemplaza la planta telefónica física por una solución en la nube con extensiones móviles, IVR interactivo y colas de atención. \n\nDisponemos de modelos **PYMES** (base 3 usuarios) y **CORPORATIVO** (base 8 usuarios). ¿Para cuántos usuarios y qué cliente deseas que elaboremos tu cotización?`;
      }
    } 
    else if (text.includes('cloud') || text.includes('servidor') || text.includes('vps')) {
      if (text.includes('cotiza') || text.includes('precio') || text.includes('cuanto')) {
        const clientName = extractClientNameFromText(userText);
        if (!clientName) {
          setPendingQuoteDraft({
            type: 'cloud',
            rawPrompt: userText,
            quoteData: {
              productId: 'cloud-server',
              productName: 'Claro Cloud Server (1 vCPU, 2GB RAM, 50GB SSD)',
              quantity: 1,
              unitPrice: '$29.00 USD',
              monthlyTotal: '$29.00 USD',
              setupFee: '$0.00 USD (Aprovisionamiento Inmediato)'
            }
          });
          reply = `¡Perfecto! El **Claro Cloud Server (1 vCPU, 2GB RAM, 50GB SSD)** en nuestro Data Center local está listo para cotizar a **$29.00 USD/mes**.\n\n¿A nombre de **qué cliente o empresa** emitimos esta propuesta formal?`;
        } else {
          reply = `Perfecto. He elaborado una propuesta de **Claro Cloud Server** para **${clientName}**. El servidor se aprovisiona localmente en nuestro Data Center de Santo Domingo con garantía de máxima disponibilidad:`;
          quoteData = {
            clientName: clientName,
            productId: 'cloud-server',
            productName: 'Claro Cloud Server (1 vCPU, 2GB RAM, 50GB SSD)',
            quantity: 1,
            unitPrice: '$29.00 USD',
            monthlyTotal: '$29.00 USD',
            setupFee: '$0.00 USD (Aprovisionamiento Inmediato)'
          };
          triggerConfetti();
        }
      } else {
        reply = `**Claro Cloud Server** ofrece servidores virtuales en nuestro Data Center local en República Dominicana, garantizando latencias mínimas y cumplimiento normativo. Planes desde **$29 USD/mes**.`;
      }
    }
    else if (text.includes('movil') || text.includes('móvil') || text.includes('plan') || text.includes('linea') || text.includes('línea')) {
      if (text.includes('cotiza') || text.includes('precio') || text.includes('linea') || text.includes('línea')) {
        const numbers = text.match(/\d+/);
        const qty = numbers ? parseInt(numbers[0]) : 3;
        const total = qty * 990;
        const clientName = extractClientNameFromText(userText);
        
        if (!clientName) {
          setPendingQuoteDraft({
            type: 'movil',
            rawPrompt: userText,
            quoteData: {
              productId: 'plan-movil',
              productName: 'Plan Claro Móvil Negocios Emprendedor 5G',
              quantity: qty,
              unitPrice: '$990.00 DOP',
              monthlyTotal: `$${total.toLocaleString('es-DO')} DOP`,
              setupFee: '$0.00 DOP (Chip SIM gratis)'
            }
          });
          reply = `Excelente. Tengo lista la cotización para **${qty} líneas** del Plan Claro Móvil Negocios 5G (RD$990 DOP/mes por línea).\n\n¿A nombre de **qué cliente o empresa** emitimos la cotización?`;
        } else {
          reply = `Excelente. He preparado la cotización para **${clientName}** con **${qty} líneas** del Plan Claro Móvil Negocios Emprendedor 5G (RD$990 DOP/mes por línea), con minutos ilimitados a la red Claro.`;
          quoteData = {
            clientName: clientName,
            productId: 'plan-movil',
            productName: 'Plan Claro Móvil Negocios Emprendedor 5G',
            quantity: qty,
            unitPrice: '$990.00 DOP',
            monthlyTotal: `$${total.toLocaleString('es-DO')} DOP`,
            setupFee: '$0.00 DOP (Chip SIM gratis)'
          };
          triggerConfetti();
        }
      } else {
        reply = `Nuestros **Planes Móviles Negocios 5G** le otorgan minutos libres, gigas de alta velocidad y Roaming Sin Fronteras en EE.UU. y Latinoamérica. Entradas desde **RD$990 DOP al mes**.`;
      }
    }
    else if (text.includes('internet') || text.includes('dedicado') || text.includes('fibra')) {
      reply = `El **Internet Dedicado por Fibra Óptica** brinda ancho de banda 100% simétrico y disponibilidad del 99.9% (SLA). Requiere un levantamiento de factibilidad por dirección. ¿Te gustaría que registremos una evaluación técnica para tu localidad?`;
    }
    else if (text.includes('quien eres') || text.includes('quién eres') || text.includes('presentate') || text.includes('presentate') || text.includes('que haces') || text.includes('qué haces') || text.includes('tu nombre')) {
      reply = `¡Hola! 👋 Soy **Clara**, tu Consultora Comercial y Asistente con Inteligencia Artificial para **Claro Dominicana (Soluciones Corporativas y Negocios)**.\n\nEstoy aquí para ayudarte a:\n- 📞 **Elaborar cotizaciones formales de Hosted PBX** (Planes PYMES y Corporativo con teléfonos Grandstream serie GRP).\n- ☁️ **Configurar servidores Claro Cloud** y Data Center Virtual en Santo Domingo.\n- 🔒 **Asesorarte en Ciberseguridad, Enlaces MPLS y SD-WAN**.\n- 📊 **Generar propuestas imprimibles y plantillas Excel oficiales** listas para tus clientes.\n\n¿Qué cliente o solución deseas que preparemos hoy?`;
    }
    else if (text.includes('hola') || text.includes('buenos dias') || text.includes('buenas tardes') || text.includes('saludos') || text.includes('hey')) {
      reply = `¡Hola! Qué gusto saludarte. Soy **Clara**, tu asistente ejecutiva de Claro Negocios. 🇩🇴\n\nPuedo cotizarte al instante cualquier solución de telecomunicaciones o consultar nuestro catálogo oficial. ¿En qué puedo apoyarte hoy?`;
    }
    else {
      reply = `¡Con gusto te asisto! Como consultora comercial de **Claro Negocios**, puedo brindarte información técnica y cotizaciones inmediatas de:\n\n- 📞 **Hosted PBX (Centralitas Virtuales)** para PYMES y Grandes Empresas.\n- ☁️ **Cloud Servers & IaaS**.\n- 📱 **Planes Móviles Corporativos 5G**.\n- 🌐 **Internet Dedicado y Redes MPLS**.\n\nEscríbeme por ejemplo: *"Cotízame una HPBX de 6 usuarios para Farmacia Carol"* o haz clic en una de las sugerencias rápidas abajo.`;
    }

    const botMsgObj = {
      id: `msg-${Date.now()}`,
      sender: 'bot',
      text: reply,
      quoteData: quoteData,
      quoteObj: quoteObj
    };
    setMessages(prev => [...prev, botMsgObj]);
    saveMessageToDb(botMsgObj);

    if (!isOpen) {
      setHasUnread(true);
    }
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#EE1C24', '#FFFFFF', '#FF8F94']
    });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    const msg = inputMessage;
    setInputMessage('');
    processUserMessage(msg);
  };

  const handleChipClick = (query) => {
    processUserMessage(query);
  };

  const handleResetChat = async () => {
    const welcomeMsg = {
      id: 'welcome',
      sender: 'bot',
      text: '¡Hola! Soy **Clara**, tu asistente virtual ejecutiva para **Claro Negocios**. \n\n¿En qué puedo ayudarte hoy? Puedes hacer clic en cualquiera de las sugerencias rápidas abajo o pedirme directamente una cotización.'
    };
    setMessages([welcomeMsg]);
    try {
      await fetch('/api/chat/history?sessionId=default-session', { method: 'DELETE' });
      await saveMessageToDb(welcomeMsg);
    } catch (err) {
      console.error("Error clearing chat history:", err);
    }
  };

  const handlePrintQuote = () => {
    window.print();
  };

  const renderChatContent = () => (
    <>
      {/* Drawer / Window Header */}
      <div style={{ 
        padding: '12px 16px', 
        backgroundColor: 'var(--bg-secondary)', 
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        boxSizing: 'border-box',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, overflow: 'hidden' }}>
          <div style={{ 
            width: '36px', 
            height: '36px', 
            borderRadius: 'var(--radius-full)', 
            position: 'relative',
            boxShadow: '0 4px 12px rgba(238, 28, 36, 0.3)',
            flexShrink: 0
          }}>
            <img 
              src="/claro-logo.png" 
              alt="Clara" 
              style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} 
            />
            <span style={{ 
              position: 'absolute', 
              bottom: '0', 
              right: '0', 
              width: '10px', 
              height: '10px', 
              borderRadius: '50%', 
              backgroundColor: '#10B981', 
              border: '2px solid var(--bg-secondary)' 
            }}/>
          </div>
          <div style={{ minWidth: 0, overflow: 'hidden', whiteSpace: 'nowrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>Clara Copilot</h3>
              <span style={{ fontSize: '0.625rem', backgroundColor: 'var(--claro-red-light)', color: 'var(--claro-red)', padding: '2px 6px', borderRadius: 'var(--radius-full)', fontWeight: '800' }}>IA</span>
            </div>
            <span style={{ fontSize: '0.7rem', color: '#10B981', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '1px' }}>
              <Sparkles size={10} /> Claro Negocios B2B
            </span>
          </div>
        </div>

        {/* Model Selector & Window Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            style={{
              fontSize: '0.7rem',
              padding: '4px 6px',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              fontWeight: '700',
              cursor: 'pointer',
              outline: 'none',
              maxWidth: '105px'
            }}
            title="Seleccionar Modelo de Inteligencia Artificial"
          >
            <option value="gpt-4o-mini">⚡ GPT-4o Mini</option>
            <option value="gpt-4o">🧠 GPT-4o Omni</option>
            <option value="gpt-3.5-turbo">🤖 GPT-3.5</option>
          </select>

          <button 
            onClick={handleResetChat}
            className="btn btn-secondary" 
            title="Reiniciar chat"
            style={{ padding: '4px', borderRadius: 'var(--radius-full)', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <RefreshCw size={13} />
          </button>

          {mode === 'floating' && (
            <button 
              onClick={() => setIsExpanded(!isExpanded)} 
              className="btn btn-secondary" 
              title={isExpanded ? "Reducir ventana" : "Ampliar ventana"}
              style={{ padding: '4px', borderRadius: 'var(--radius-full)', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {isExpanded ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
            </button>
          )}

          {mode === 'floating' && onToggleOpen && (
            <button 
              onClick={() => onToggleOpen(false)} 
              className="btn btn-secondary" 
              title="Cerrar chat"
              style={{ padding: '4px', borderRadius: 'var(--radius-full)', width: '30px', height: '30px', color: 'var(--claro-red)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div style={{ 
        flex: 1, 
        padding: '16px', 
        overflowY: 'auto', 
        overflowX: 'hidden',
        display: 'flex', 
        flexDirection: 'column', 
        gap: '14px',
        backgroundColor: 'var(--bg-primary)',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        {messages.map(msg => (
          <div 
            key={msg.id}
            style={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '95%',
              width: '100%',
              minWidth: 0,
              boxSizing: 'border-box',
              alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start'
            }}
          >
            <div style={{ 
              display: 'flex', 
              alignItems: 'flex-start', 
              gap: '8px', 
              flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row',
              maxWidth: '100%',
              minWidth: 0,
              boxSizing: 'border-box'
            }}>
              <div style={{ 
                width: '28px', 
                height: '28px', 
                borderRadius: 'var(--radius-full)', 
                backgroundColor: msg.sender === 'user' ? 'var(--text-secondary)' : 'transparent', 
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                overflow: 'hidden'
              }}>
                {msg.sender === 'user' ? (
                  <User size={14} />
                ) : (
                  <img src="/claro-logo.png" alt="Clara" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
              </div>
              
              <div style={{ 
                padding: '10px 14px', 
                borderRadius: 'var(--radius-md)', 
                backgroundColor: msg.sender === 'user' ? 'var(--text-primary)' : 'var(--bg-secondary)',
                color: msg.sender === 'user' ? '#FFFFFF' : 'var(--text-primary)',
                boxShadow: 'var(--shadow-sm)',
                fontSize: '0.875rem',
                lineHeight: '1.5',
                border: msg.sender === 'user' ? 'none' : '1px solid var(--border-color)',
                borderTopRightRadius: msg.sender === 'user' ? '0' : undefined,
                borderTopLeftRadius: msg.sender === 'bot' ? '0' : undefined,
                maxWidth: '100%',
                minWidth: 0,
                boxSizing: 'border-box',
                wordBreak: 'break-word',
                overflowWrap: 'anywhere'
              }}>
                {msg.sender === 'user' ? (
                  <span style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{msg.text}</span>
                ) : (
                  <div className="chat-markdown-body" style={{ width: '100%', minWidth: 0, boxSizing: 'border-box', wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({ children }) => <p style={{ margin: '6px 0', lineHeight: '1.6', fontSize: '0.875rem', wordBreak: 'break-word' }}>{children}</p>,
                        strong: ({ children }) => <strong style={{ color: 'var(--text-primary)', fontWeight: '700' }}>{children}</strong>,
                        em: ({ children }) => <em style={{ color: 'var(--text-secondary)' }}>{children}</em>,
                        ul: ({ children }) => <ul style={{ paddingLeft: '18px', margin: '8px 0', fontSize: '0.85rem' }}>{children}</ul>,
                        li: ({ children }) => <li style={{ margin: '3px 0', color: 'var(--text-secondary)' }}>{children}</li>,
                        h1: ({ children }) => <h3 style={{ fontSize: '1.05rem', fontWeight: '800', margin: '12px 0 6px 0', color: 'var(--claro-red)', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px' }}>{children}</h3>,
                        h2: ({ children }) => <h4 style={{ fontSize: '0.95rem', fontWeight: '700', margin: '10px 0 4px 0', color: 'var(--text-primary)' }}>{children}</h4>,
                        h3: ({ children }) => <h5 style={{ fontSize: '0.88rem', fontWeight: '700', margin: '10px 0 4px 0', color: 'var(--claro-red)' }}>{children}</h5>,
                        table: ({ children }) => (
                          <div style={{ overflowX: 'auto', maxWidth: '100%', margin: '10px 0', borderRadius: '8px', border: '1px solid var(--border-color)', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.76rem', minWidth: '320px' }}>
                              {children}
                            </table>
                          </div>
                        ),
                        thead: ({ children }) => <thead style={{ backgroundColor: 'rgba(238, 28, 36, 0.08)', borderBottom: '2px solid var(--border-color)' }}>{children}</thead>,
                        tbody: ({ children }) => <tbody>{children}</tbody>,
                        tr: ({ children }) => <tr style={{ borderBottom: '1px solid var(--border-color)' }}>{children}</tr>,
                        th: ({ children }) => <th style={{ padding: '6px 10px', fontWeight: '700', textAlign: 'left', borderRight: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>{children}</th>,
                        td: ({ children }) => <td style={{ padding: '6px 10px', borderRight: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>{children}</td>,
                        code: ({ children }) => <code style={{ backgroundColor: 'rgba(238, 28, 36, 0.08)', color: 'var(--claro-red)', padding: '2px 5px', borderRadius: '4px', fontSize: '0.8em', fontWeight: '600', fontFamily: 'monospace', wordBreak: 'break-all' }}>{children}</code>,
                        blockquote: ({ children }) => <blockquote style={{ borderLeft: '3px solid var(--claro-red)', paddingLeft: '10px', margin: '8px 0', color: 'var(--text-secondary)', fontStyle: 'italic' }}>{children}</blockquote>
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>

                    {/* RAG SOURCED DOCUMENTS BADGE */}
                    {msg.ragDocs && msg.ragDocs.length > 0 && (
                      <div style={{ marginTop: '10px', padding: '8px 12px', borderRadius: '8px', backgroundColor: 'rgba(238, 28, 36, 0.04)', border: '1px solid rgba(238, 28, 36, 0.15)', fontSize: '0.73rem', display: 'flex', flexDirection: 'column', gap: '5px', maxWidth: '100%', boxSizing: 'border-box', minWidth: 0 }}>
                        <span style={{ fontWeight: '700', color: 'var(--claro-red)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          📚 Fuentes Técnicas y Comerciales Consultadas ({msg.ragDocs.length}):
                        </span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', maxWidth: '100%' }}>
                          {msg.ragDocs.map((doc, idx) => (
                            <span key={idx} style={{ backgroundColor: 'var(--bg-primary)', padding: '3px 8px', borderRadius: '6px', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.7rem', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={doc.aiSummary || doc.title}>
                              📄 {doc.title || doc.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* RAG SOURCED INFOCANALES / COMUNICADOS BADGE */}
                    {msg.commDocs && msg.commDocs.length > 0 && (
                      <div style={{ marginTop: '10px', padding: '10px 12px', borderRadius: '8px', backgroundColor: 'rgba(37, 99, 235, 0.06)', border: '1px solid rgba(37, 99, 235, 0.25)', fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '6px', maxWidth: '100%', boxSizing: 'border-box', minWidth: 0 }}>
                        <span style={{ fontWeight: '800', color: '#1E40AF', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          📢 Boletines e InfoCanales Oficiales Consultados ({msg.commDocs.length}):
                        </span>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxWidth: '100%' }}>
                          {msg.commDocs.map((comm, idx) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-primary)', padding: '6px 10px', borderRadius: '6px', border: '1px solid #BFDBFE', color: '#1E40AF', gap: '8px', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0, flex: 1, overflow: 'hidden' }}>
                                <span style={{ fontWeight: '800', color: '#2563EB', flexShrink: 0, fontSize: '0.7rem' }}>
                                  {comm.ancNum ? `ANUNCIO NO. ${comm.ancNum}${comm.ancVariant ? `-${comm.ancVariant}` : ''}` : 'BOLETÍN'}
                                </span>
                                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-secondary)', fontSize: '0.725rem', flex: 1, minWidth: 0 }} title={comm.subject}>
                                  {comm.subject}
                                </span>
                              </div>
                              <button
                                onClick={() => {
                                  if (onOpenCommunication) onOpenCommunication(comm);
                                }}
                                style={{
                                  padding: '4px 10px',
                                  borderRadius: '99px',
                                  fontSize: '0.675rem',
                                  fontWeight: '800',
                                  backgroundColor: '#2563EB',
                                  color: '#FFFFFF',
                                  border: 'none',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  flexShrink: 0,
                                  boxShadow: '0 2px 6px rgba(37,99,235,0.25)',
                                  transition: 'all 0.15s ease'
                                }}
                                title="Abrir y leer este boletín completo en la pestaña Comunicaciones"
                              >
                                Abrir Boletín ↗
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* QUOTATION CARD */}
            {msg.quoteData && (
              <div className="animate-fade-in" style={{ 
                width: '100%', 
                marginTop: '10px', 
                marginLeft: msg.sender === 'user' ? '0' : '36px'
              }}>
                <div style={{ 
                  backgroundColor: '#FFFFFF', 
                  color: '#1F2937', 
                  borderRadius: 'var(--radius-md)', 
                  border: '2px solid var(--claro-red)', 
                  boxShadow: '0 8px 20px rgba(238, 28, 36, 0.15)',
                  overflow: 'hidden'
                }}>
                  <div style={{ 
                    backgroundColor: 'var(--claro-red)', 
                    color: '#FFFFFF', 
                    padding: '12px 16px', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center' 
                  }}>
                    <div>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: '800', textTransform: 'uppercase', margin: 0 }}>Claro Dominicana</h4>
                      <span style={{ fontSize: '0.65rem', opacity: 0.9 }}>
                        {msg.quoteData.clientName ? `Expediente: Clientes/${msg.quoteData.clientName}` : 'Cotización Corporativa Oficial'}
                      </span>
                    </div>
                    <FileText size={20} />
                  </div>
                  
                  <div style={{ padding: '14px' }}>
                    {msg.quoteData.clientName && (
                      <div style={{ display: 'inline-block', padding: '3px 8px', borderRadius: '6px', backgroundColor: 'rgba(238, 28, 36, 0.08)', color: 'var(--claro-red)', fontSize: '0.75rem', fontWeight: '800', marginBottom: '8px' }}>
                        🏢 CLIENTE: {msg.quoteData.clientName}
                      </div>
                    )}

                    <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>
                      {msg.quoteData.productName}
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px', backgroundColor: '#F9FAFB', padding: '10px', borderRadius: 'var(--radius-sm)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                        <span style={{ color: '#6B7280' }}>Cantidad:</span>
                        <span style={{ fontWeight: '600' }}>{msg.quoteData.quantity}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                        <span style={{ color: '#6B7280' }}>Precio Unitario:</span>
                        <span style={{ fontWeight: '600' }}>{msg.quoteData.unitPrice}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                        <span style={{ color: '#6B7280' }}>Instalación:</span>
                        <span style={{ fontWeight: '600', color: '#10B981' }}>{msg.quoteData.setupFee}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E5E7EB', paddingTop: '8px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#111827' }}>Subtotal Mensual:</span>
                      <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--claro-red)' }}>
                        {msg.quoteData.monthlyTotal}
                      </span>
                    </div>
                  </div>

                  {/* Refinement Quick Chips */}
                  <div style={{ padding: '8px 14px', backgroundColor: '#FAFAFA', borderTop: '1px solid #F3F4F6', display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.68rem', color: '#9CA3AF', fontWeight: '700' }}>Ajustar:</span>
                    <button 
                      onClick={() => handleSendSuggested(`A la cotización de ${msg.quoteData.clientName || 'la propuesta'}, agrégale un switch de 24 puertos PoE`)}
                      className="btn btn-secondary" 
                      style={{ fontSize: '0.68rem', padding: '3px 8px', borderRadius: '12px' }}
                    >
                      + Switch 24p PoE
                    </button>
                    <button 
                      onClick={() => handleSendSuggested(`A la cotización de ${msg.quoteData.clientName || 'la propuesta'}, agrégale Sistema de Tierra`)}
                      className="btn btn-secondary" 
                      style={{ fontSize: '0.68rem', padding: '3px 8px', borderRadius: '12px' }}
                    >
                      + Sistema de Tierra
                    </button>
                    <button 
                      onClick={() => handleSendSuggested(`Aumenta la cotización de ${msg.quoteData.clientName || 'la propuesta'} a 15 usuarios`)}
                      className="btn btn-secondary" 
                      style={{ fontSize: '0.68rem', padding: '3px 8px', borderRadius: '12px' }}
                    >
                      + 15 Usuarios
                    </button>
                  </div>

                  <div style={{ 
                    backgroundColor: '#F3F4F6', 
                    padding: '10px 14px', 
                    display: 'flex', 
                    gap: '8px', 
                    justifyContent: 'flex-end',
                    flexWrap: 'wrap',
                    borderTop: '1px solid #E5E7EB'
                  }}>
                    <button 
                      onClick={() => {
                        const q = msg.quoteObj || parseAndGenerateHPBXFromText(msg.text).quote;
                        exportQuoteToExcel(q);
                      }}
                      className="btn btn-secondary" 
                      style={{ fontSize: '0.75rem', padding: '5px 10px', display: 'flex', alignItems: 'center', gap: '5px' }}
                      title="Descargar Plantilla Oficial en Excel (.xlsx)"
                    >
                      <FileSpreadsheet size={14} color="#10B981" /> Descargar Excel
                    </button>
                    <button 
                      onClick={() => {
                        const q = msg.quoteObj || parseAndGenerateHPBXFromText(msg.text).quote;
                        setActiveOfficialQuote(q);
                      }}
                      className="btn btn-primary" 
                      style={{ fontSize: '0.75rem', padding: '5px 12px', display: 'flex', alignItems: 'center', gap: '5px' }}
                      title="Ver / Imprimir Plantilla Oficial en PDF"
                    >
                      <Printer size={14} /> Plantilla Oficial / PDF
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div style={{ display: 'flex', gap: '8px', alignSelf: 'flex-start', alignItems: 'center' }}>
            <div style={{ 
              width: '28px', 
              height: '28px', 
              borderRadius: 'var(--radius-full)', 
              backgroundColor: 'var(--claro-red)', 
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Bot size={14} />
            </div>
            <div className="glass-panel" style={{ padding: '8px 12px', borderRadius: 'var(--radius-md)', fontSize: '0.8rem' }}>
              <span className="dot-flashing">Clara está procesando...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* QUICK SUGGESTION CHIPS FOR INCENTIVIZING USAGE */}
      <div className="copilot-quick-chips">
        {QUICK_CHIPS.map((chip, idx) => (
          <button 
            key={idx} 
            onClick={() => handleChipClick(chip.query)} 
            className="copilot-chip-btn"
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Chat Input Footer */}
      <form onSubmit={handleSendMessage} style={{ 
        padding: '12px 16px', 
        backgroundColor: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        gap: '8px'
      }}>
        <input
          ref={inputRef}
          type="text"
          className="form-input"
          placeholder="Escribe tu consulta o pide una cotización..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          disabled={isTyping}
          style={{ flex: 1, fontSize: '0.85rem' }}
        />
        <button 
          type="submit" 
          disabled={isTyping || !inputMessage.trim()}
          className="btn btn-primary"
          style={{ width: '40px', height: '40px', padding: 0, borderRadius: 'var(--radius-full)', flexShrink: 0 }}
        >
          <Send size={16} />
        </button>
      </form>
    </>
  );

  // IF EMBEDDED MODE (Full tab page)
  if (mode === 'embedded') {
    return (
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 200px)', minHeight: '550px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>
        {renderChatContent()}
      </div>
    );
  }

  // FLOATING BUBBLE & DRAWER MODE
  return (
    <div className="copilot-floating-wrapper">
      
      {/* Floating Chat Drawer Window */}
      {isOpen && (
        <div className={`copilot-drawer-panel ${isExpanded ? 'expanded' : ''}`}>
          {renderChatContent()}
        </div>
      )}

      {/* Speech Teaser Tooltip when closed */}
      {!isOpen && showTeaser && (
        <div 
          className="copilot-teaser-tooltip"
          onClick={() => {
            if (onToggleOpen) onToggleOpen(true);
          }}
        >
          <MessageSquare size={16} style={{ color: 'var(--claro-red)', flexShrink: 0 }} />
          <span>{TEASER_PROMPTS[teaserIndex]}</span>
          <button 
            className="copilot-teaser-close"
            onClick={(e) => {
              e.stopPropagation();
              setShowTeaser(false);
            }}
          >
            <X size={12} />
          </button>
        </div>
      )}

      {/* Floating Action Avatar Button */}
      <div 
        className={`copilot-floating-bubble ${isOpen ? 'active' : ''}`}
        onClick={() => {
          if (onToggleOpen) onToggleOpen(!isOpen);
        }}
        title="Hablar con Clara (Cotizador Claro Negocios)"
      >
        {isOpen ? (
          <X size={26} />
        ) : (
          <img 
            src="/claro-logo.png" 
            alt="Clara" 
            style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} 
          />
        )}
        {!isOpen && hasUnread && (
          <span className="copilot-badge-dot">!</span>
        )}
      </div>

      {/* Official Printable Quotation Modal */}
      {activeOfficialQuote && (
        <OfficialQuoteModal 
          quote={activeOfficialQuote} 
          onClose={() => setActiveOfficialQuote(null)} 
        />
      )}

    </div>
  );
}
