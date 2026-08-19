import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Download, Printer, RefreshCw, Award, X, Maximize2, Minimize2, Sparkles, MessageSquare, FileText, FileSpreadsheet } from 'lucide-react';
import confetti from 'canvas-confetti';
import { productsData } from '../data/claroProducts';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { parseAndGenerateHPBXFromText } from '../utils/hpbxQuotationModel';
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
  openaiModel = 'gpt-3.5-turbo',
  mode = 'floating' // 'floating' or 'embedded'
}) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: '¡Hola! Soy **Clara**, tu asistente virtual ejecutiva para **Claro Negocios**. \n\n¿En qué puedo ayudarte hoy? Puedes hacer clic en cualquiera de las sugerencias rápidas abajo o pedirme directamente una cotización escribiendo algo como: *"Hazme una cotización de HPBX para 10 usuarios"*.'
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
      const systemPrompt = `Eres Clara, la asistente inteligente oficial de Claro Dominicana para Clientes Corporativos. 
Tu tono es profesional, entusiasta, servicial y corporativo. Responde siempre en español de República Dominicana.

Tienes información detallada del catálogo de Claro Negocios:
${JSON.stringify(productsData, null, 2)}

Tu tarea es responder dudas de productos de Claro. Si el cliente pide cotizar un producto, por ejemplo: "hazme una cotización de HPBX de 15 usuarios", debes calcular el total mensual y además incluir al final de tu respuesta un bloque JSON estructurado encerrado entre :::QUOTE_DATA::: y :::END_QUOTE_DATA::: para que la aplicación renderice una tarjeta de cotización visual de manera nativa.

Formato del bloque de cotización (si aplica):
:::QUOTE_DATA:::
{
  "productId": "hpbx|cloud-server|plan-movil|internet-dedicado|sd-wan",
  "productName": "Nombre oficial del producto",
  "quantity": 15,
  "unitPrice": "$15 USD",
  "monthlyTotal": "$225 USD",
  "setupFee": "$0 USD (Sujeto a contrato de 24 meses)"
}
:::END_QUOTE_DATA:::

Ejemplo de cálculo para HPBX: Cantidad * $15 USD.
Ejemplo de cálculo para Planes Móviles: Cantidad * $990 DOP (o plan seleccionado).
Si no hay cantidad especificada, asume 1 unidad o pregunta al usuario.
Calcula los totales correctamente. No incluyas impuestos en el total (indica en texto que los impuestos de ley de RD aplican: ITBIS 18%, CDT 2%, ISC 10%).`;

      let hpbxContext = "";
      const lower = userMsgText.toLowerCase();
      if (lower.includes('hpbx') || lower.includes('centralita') || lower.includes('telefon') || lower.includes('planta') || lower.includes('cotiz')) {
        try {
          const hpbxParsed = parseAndGenerateHPBXFromText(userMsgText);
          hpbxContext = `\n\n[COTIZADOR OFICIAL CLARO HPBX]: Si el usuario solicita una cotización de Hosted PBX, debes utilizar obligatoriamente este resultado estructurado oficial con el formato exacto de Claro Dominicana:\n\n${hpbxParsed.markdown}\n\n:::QUOTE_DATA:::\n${JSON.stringify(hpbxParsed.quoteData, null, 2)}\n:::END_QUOTE_DATA:::`;
        } catch (e) {}
      }

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`
        },
        body: JSON.stringify({
          model: openaiModel || 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: systemPrompt + hpbxContext },
            ...history,
            { role: 'user', content: userMsgText }
          ],
          temperature: 0.3
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Error HTTP ${response.status} en la API de OpenAI.`);
      }

      const resData = await response.json();
      const botText = resData.choices[0].message.content;
      processBotResponse(botText);
    } catch (err) {
      console.warn("OpenAI Chat completion error, falling back to local Claro engine:", err);
      simulateBotResponse(userMsgText);
    } finally {
      setIsTyping(false);
    }
  };

  const processBotResponse = (text) => {
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
        const parsed = parseAndGenerateHPBXFromText(cleanText);
        quoteObj = parsed.quote;
      } catch (e) {
        // ignore
      }
    }

    const botMsgObj = {
      id: `msg-${Date.now()}`,
      sender: 'bot',
      text: cleanText,
      quoteData: quoteData,
      quoteObj: quoteObj
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

    if (text.includes('hpbx') || text.includes('telefon') || text.includes('centralita') || text.includes('planta') || text.includes('gxp') || text.includes('audiocodes') || text.includes('pyme') || text.includes('corporativ')) {
      if (text.includes('cotiza') || text.includes('precio') || text.includes('cuanto') || text.includes('costo') || text.includes('usuario') || text.includes('cliente') || text.includes('para')) {
        const hpbxResult = parseAndGenerateHPBXFromText(userText);
        reply = `¡Con gusto! He generado la propuesta formal bajo el formato oficial de **Claro Hosted PBX (${hpbxResult.quote.type})**:\n\n${hpbxResult.markdown}`;
        quoteData = hpbxResult.quoteData;
        quoteObj = hpbxResult.quote;
        triggerConfetti();
      } else {
        reply = `La **Centralita Virtual Claro (HPBX)** reemplaza la planta telefónica física por una solución en la nube con extensiones móviles, IVR interactivo y colas de atención. \n\nDisponemos de modelos **PYMES** (base 3 usuarios) y **CORPORATIVO** (base 8 usuarios). ¿Para cuántos usuarios deseas que elaboremos tu cotización?`;
      }
    } 
    else if (text.includes('cloud') || text.includes('servidor') || text.includes('vps')) {
      if (text.includes('cotiza') || text.includes('precio') || text.includes('cuanto')) {
        reply = `Perfecto. He elaborado una propuesta de **Claro Cloud Server** para tu empresa. El servidor se aprovisiona localmente en nuestro Data Center de Santo Domingo con garantía de máxima disponibilidad:`;
        
        quoteData = {
          productId: 'cloud-server',
          productName: 'Claro Cloud Server (1 vCPU, 2GB RAM, 50GB SSD)',
          quantity: 1,
          unitPrice: '$29.00 USD',
          monthlyTotal: '$29.00 USD',
          setupFee: '$0.00 USD (Aprovisionamiento Inmediato)'
        };
        triggerConfetti();
      } else {
        reply = `**Claro Cloud Server** ofrece servidores virtuales en nuestro Data Center local en República Dominicana, garantizando latencias mínimas y cumplimiento normativo. Planes desde **$29 USD/mes**.`;
      }
    }
    else if (text.includes('movil') || text.includes('móvil') || text.includes('plan') || text.includes('linea') || text.includes('línea')) {
      if (text.includes('cotiza') || text.includes('precio') || text.includes('linea') || text.includes('línea')) {
        const numbers = text.match(/\d+/);
        const qty = numbers ? parseInt(numbers[0]) : 3;
        const total = qty * 990;
        
        reply = `Excelente. He preparado la cotización para **${qty} líneas** del Plan Claro Móvil Negocios Emprendedor 5G (RD$990 DOP/mes por línea), con minutos ilimitados a la red Claro.`;
        
        quoteData = {
          productId: 'plan-movil',
          productName: 'Plan Claro Móvil Negocios Emprendedor 5G',
          quantity: qty,
          unitPrice: '$990.00 DOP',
          monthlyTotal: `$${total.toLocaleString('es-DO')} DOP`,
          setupFee: '$0.00 DOP (Chip SIM gratis)'
        };
        triggerConfetti();
      } else {
        reply = `Nuestros **Planes Móviles Negocios 5G** le otorgan minutos libres, gigas de alta velocidad y Roaming Sin Fronteras en EE.UU. y Latinoamérica. Entradas desde **RD$990 DOP al mes**.`;
      }
    }
    else if (text.includes('internet') || text.includes('dedicado') || text.includes('fibra')) {
      reply = `El **Internet Dedicado por Fibra Óptica** brinda ancho de banda 100% simétrico y disponibilidad del 99.9% (SLA). Requiere un levantamiento de factibilidad por dirección. ¿Te gustaría que registremos una evaluación técnica para tu localidad?`;
    }
    else if (text.includes('hola') || text.includes('buenos dias') || text.includes('buenas tardes')) {
      reply = `¡Hola! Qué gusto saludarte. Soy Clara, tu especialista en servicios empresariales de Claro. ¿Qué solución deseas cotizar o consultar hoy?`;
    }
    else {
      reply = `Entendido. Puedo brindarte información completa y cotizaciones al instante de: **Central Virtual HPBX**, **Cloud Server**, **Planes Móviles 5G**, **Internet Dedicado** y **SD-WAN**.\n\n¿De cuál de estos servicios necesitas una propuesta formal?`;
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
        padding: '16px 20px', 
        backgroundColor: 'var(--bg-secondary)', 
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            width: '38px', 
            height: '38px', 
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
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>Clara</h3>
              <span style={{ fontSize: '0.65rem', backgroundColor: 'var(--claro-red-light)', color: 'var(--claro-red)', padding: '2px 6px', borderRadius: 'var(--radius-full)', fontWeight: '700' }}>IA</span>
            </div>
            <span style={{ fontSize: '0.725rem', color: '#10B981', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Sparkles size={10} /> Cotizador Claro Negocios
            </span>
          </div>
        </div>

        {/* Window Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button 
            onClick={handleResetChat}
            className="btn btn-secondary" 
            title="Reiniciar chat"
            style={{ padding: '6px', borderRadius: 'var(--radius-full)', width: '32px', height: '32px' }}
          >
            <RefreshCw size={14} />
          </button>

          {mode === 'floating' && (
            <button 
              onClick={() => setIsExpanded(!isExpanded)} 
              className="btn btn-secondary" 
              title={isExpanded ? "Reducir ventana" : "Ampliar ventana"}
              style={{ padding: '6px', borderRadius: 'var(--radius-full)', width: '32px', height: '32px' }}
            >
              {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>
          )}

          {mode === 'floating' && onToggleOpen && (
            <button 
              onClick={() => onToggleOpen(false)} 
              className="btn btn-secondary" 
              title="Cerrar chat"
              style={{ padding: '6px', borderRadius: 'var(--radius-full)', width: '32px', height: '32px', color: 'var(--claro-red)' }}
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div style={{ 
        flex: 1, 
        padding: '16px', 
        overflowY: 'auto', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '14px',
        backgroundColor: 'var(--bg-primary)'
      }}>
        {messages.map(msg => (
          <div 
            key={msg.id}
            style={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '90%',
              alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start'
            }}
          >
            <div style={{ 
              display: 'flex', 
              alignItems: 'flex-start', 
              gap: '8px', 
              flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row' 
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
              }}>
                {msg.sender === 'user' ? (
                  <span style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</span>
                ) : (
                  <div className="chat-markdown-body" style={{ width: '100%' }}>
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({ children }) => <p style={{ margin: '6px 0', lineHeight: '1.6', fontSize: '0.875rem' }}>{children}</p>,
                        strong: ({ children }) => <strong style={{ color: 'var(--text-primary)', fontWeight: '700' }}>{children}</strong>,
                        em: ({ children }) => <em style={{ color: 'var(--text-secondary)' }}>{children}</em>,
                        ul: ({ children }) => <ul style={{ paddingLeft: '18px', margin: '8px 0', fontSize: '0.85rem' }}>{children}</ul>,
                        li: ({ children }) => <li style={{ margin: '3px 0', color: 'var(--text-secondary)' }}>{children}</li>,
                        h1: ({ children }) => <h3 style={{ fontSize: '1.05rem', fontWeight: '800', margin: '12px 0 6px 0', color: 'var(--claro-red)', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px' }}>{children}</h3>,
                        h2: ({ children }) => <h4 style={{ fontSize: '0.95rem', fontWeight: '700', margin: '10px 0 4px 0', color: 'var(--text-primary)' }}>{children}</h4>,
                        h3: ({ children }) => <h5 style={{ fontSize: '0.88rem', fontWeight: '700', margin: '10px 0 4px 0', color: 'var(--claro-red)' }}>{children}</h5>,
                        table: ({ children }) => (
                          <div style={{ overflowX: 'auto', margin: '10px 0', borderRadius: '8px', border: '1px solid var(--border-color)', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.76rem', minWidth: '380px' }}>
                              {children}
                            </table>
                          </div>
                        ),
                        thead: ({ children }) => <thead style={{ backgroundColor: 'rgba(238, 28, 36, 0.08)', borderBottom: '2px solid var(--border-color)' }}>{children}</thead>,
                        tbody: ({ children }) => <tbody>{children}</tbody>,
                        tr: ({ children }) => <tr style={{ borderBottom: '1px solid var(--border-color)' }}>{children}</tr>,
                        th: ({ children }) => <th style={{ padding: '6px 10px', fontWeight: '700', textAlign: 'left', borderRight: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>{children}</th>,
                        td: ({ children }) => <td style={{ padding: '6px 10px', borderRight: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>{children}</td>,
                        code: ({ children }) => <code style={{ backgroundColor: 'rgba(238, 28, 36, 0.08)', color: 'var(--claro-red)', padding: '2px 5px', borderRadius: '4px', fontSize: '0.8em', fontWeight: '600', fontFamily: 'monospace' }}>{children}</code>,
                        blockquote: ({ children }) => <blockquote style={{ borderLeft: '3px solid var(--claro-red)', paddingLeft: '10px', margin: '8px 0', color: 'var(--text-secondary)', fontStyle: 'italic' }}>{children}</blockquote>
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>
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
                      <span style={{ fontSize: '0.65rem', opacity: 0.9 }}>Cotización Corporativa Oficial</span>
                    </div>
                    <FileText size={20} />
                  </div>
                  
                  <div style={{ padding: '14px' }}>
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
