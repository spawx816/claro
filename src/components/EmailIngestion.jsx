import React, { useState } from 'react';
import { Mail, ArrowRight, Shield, Check, AlertCircle, RefreshCw, HelpCircle, FileText, Send } from 'lucide-react';

const EMAIL_TEMPLATES = [
  {
    name: 'Mantenimiento Cloud (Actualización de comm-1)',
    subject: 'RE: Mantenimiento Programado Servidores Cloud Santo Domingo',
    sender: 'soporte.cloud@claro.com.do',
    body: `Estimados clientes,
Hacemos referencia al mantenimiento programado en el Data Center de Santo Domingo.
Debido a condiciones climáticas desfavorables sobre la zona de Santo Domingo, hemos decidido prorrogar la fecha de mantenimiento de las cabinas SSD del 15 de junio al día 19 de junio a las 23:59.
El alcance y la duración del mantenimiento seguirán siendo los mismos (4 horas). Pedimos disculpas por los inconvenientes.

Atentamente,
Soporte Claro Cloud`
  },
  {
    name: 'Falla masiva de fibra (Nueva Conectividad)',
    subject: 'Aviso Importante: Rotura de fibra óptica interurbana en Autopista Duarte',
    sender: 'redes.core@claro.com.do',
    body: `Estimados socios de negocios,
Informamos que hace aproximadamente 45 minutos se presentó un corte físico de fibra óptica de alta capacidad provocado por trabajos viales ajenos a nuestra empresa en el kilómetro 54 de la Autopista Duarte.
Nuestro personal de redes de fibra ya se encuentra en la zona para iniciar los empalmes necesarios. Se estima un tiempo de restablecimiento de 3 horas.
Agradecemos su paciencia.

Dirección de Aseguramiento de Red
Claro Dominicana`
  },
  {
    name: 'Plan Móvil Especial (Nuevo Móvil)',
    subject: 'Nuevos Planes Claro Negocios 5G Ilimitados Plus',
    sender: 'ofertas.corporativas@claro.com.do',
    body: `¡Hola!
Queremos informarte sobre el lanzamiento de nuestro nuevo plan de telefonía empresarial "Planes Claro Móvil Negocios 5G Ilimitados Plus".
Este plan incluye cobertura extendida en más de 25 países con Roaming Premium, bolsa de datos ilimitada de alta velocidad 5G y suscripción gratuita por 6 meses a Claro Video.
El costo de este plan inicia en $3,200 DOP mensuales. Si te interesa contratarlo, por favor comunícate con tu ejecutivo comercial.

Saludos,
Claro Negocios`
  }
];

export default function EmailIngestion({ communications, onIngestCommunication, apiKey }) {
  const [emailSubject, setEmailSubject] = useState('');
  const [emailSender, setEmailSender] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Staging area state
  const [parsedData, setParsedData] = useState(null);
  const [error, setError] = useState(null);

  // Load a template
  const handleLoadTemplate = (tpl) => {
    setEmailSubject(tpl.subject);
    setEmailSender(tpl.sender);
    setEmailBody(tpl.body);
    setParsedData(null);
    setError(null);
  };

  // Run parsing (API or mock)
  const handleAnalyzeEmail = async () => {
    if (!emailBody.trim()) {
      setError('Por favor, escribe o pega el cuerpo del correo antes de analizar.');
      return;
    }
    
    setIsAnalyzing(true);
    setError(null);

    // Context from current communications to let AI know what we have
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
Remitente: ${emailSender}
Asunto: ${emailSubject}
Contenido del correo:
${emailBody}`;

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

        if (!response.ok) {
          throw new Error(`Error en la llamada a la API: ${response.statusText}`);
        }

        const data = await response.json();
        const content = data.choices[0].message.content.trim();
        
        // Clean JSON formatting if AI wrapped it in code block
        const cleanJson = content.replace(/^```json/, '').replace(/```$/, '').trim();
        const parsed = JSON.parse(cleanJson);
        
        // Add current date
        parsed.date = new Date().toISOString().split('T')[0];
        parsed.author = emailSender || 'Analizador de Correos Claro';
        
        setParsedData(parsed);
      } catch (err) {
        console.error(err);
        setError(`Ocurrió un error al conectar con la API de OpenAI: ${err.message}. Se activará el simulador local.`);
        runSimulatedParsing();
      } finally {
        setIsAnalyzing(false);
      }
    } else {
      // Simulate analysis with local rules after a short delay
      setTimeout(() => {
        runSimulatedParsing();
        setIsAnalyzing(false);
      }, 1500);
    }
  };

  const runSimulatedParsing = () => {
    const text = (emailSubject + " " + emailBody).toLowerCase();
    let category = 'Conectividad';
    let isUpdate = false;
    let updatesId = null;
    let title = emailSubject || 'Comunicación General Recibida';
    let version = '1.0';

    // Rule-based classification
    if (text.includes('cloud') || text.includes('servidor') || text.includes('vps') || text.includes('data center')) {
      category = 'Cloud';
    } else if (text.includes('movil') || text.includes('móvil') || text.includes('roaming') || text.includes('celular') || text.includes('5g')) {
      category = 'Móvil';
    } else if (text.includes('hpbx') || text.includes('telefonía') || text.includes('pbx') || text.includes('centralita') || text.includes('sip')) {
      category = 'Telefonía IP';
    } else if (text.includes('fibra') || text.includes('internet dedicado') || text.includes('enlace') || text.includes('ancho de banda')) {
      category = 'Conectividad';
    } else if (text.includes('seguridad') || text.includes('sd-wan') || text.includes('amenaza') || text.includes('hacker') || text.includes('firewall')) {
      category = 'Seguridad';
    }

    // Detect if update
    if (text.includes('re:') || text.includes('fwd:') || text.includes('seguimiento') || text.includes('actualización') || text.includes('prórroga') || text.includes('confirmación') || text.includes('finalizado')) {
      isUpdate = true;
      // Search matches in current state
      if (category === 'Cloud') {
        // Match with Santo Domingo cloud maintenance (comm-3 or comm-5 or comm-1)
        const match = communications.find(c => c.id === 'comm-5') || communications.find(c => c.id === 'comm-3') || communications.find(c => c.id === 'comm-1');
        if (match) {
          updatesId = match.id;
          version = (parseFloat(match.version) + 1.0).toFixed(1);
        }
      }
    }

    // Clean body text summary
    const lines = emailBody.split('\n').filter(line => line.trim() !== '');
    const cleanBodySummary = lines.length > 2 
      ? lines.slice(0, Math.min(lines.length - 1, 4)).join('\n')
      : emailBody;

    setParsedData({
      title: title.replace(/^(Re|Fwd|RE|FWD):\s*/i, ''),
      category,
      body: cleanBodySummary,
      isUpdate,
      updatesId,
      version,
      date: new Date().toISOString().split('T')[0],
      author: emailSender || 'sistema.correo@claro.com.do'
    });
  };

  const handleSaveToRepo = () => {
    if (!parsedData) return;
    
    // Assign a unique ID
    const newComm = {
      ...parsedData,
      id: `comm-${Date.now()}`
    };

    onIngestCommunication(newComm);
    
    // Clean fields
    setEmailSubject('');
    setEmailSender('');
    setEmailBody('');
    setParsedData(null);
    alert('¡Comunicación agregada con éxito al Repositorio de Claro!');
  };

  return (
    <div className="animate-fade-in grid-cols-2" style={{ gap: '24px' }}>
      
      {/* Left Column: Email input & templates */}
      <div>
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '8px', fontFamily: 'var(--font-display)' }}>
            Simulador de Ingesta de Correos
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            Las comunicaciones de proveedores y técnicos suelen llegar por email. Pega el contenido aquí para que la IA lo clasifique e integre al historial.
          </p>
        </div>

        {/* Templates quick selector */}
        <div className="glass-panel" style={{ padding: '16px', marginBottom: '20px' }}>
          <h4 style={{ fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FileText size={14} /> Seleccionar una plantilla de prueba:
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {EMAIL_TEMPLATES.map((tpl, idx) => (
              <button
                key={idx}
                onClick={() => handleLoadTemplate(tpl)}
                className="btn btn-secondary"
                style={{ justifyContent: 'flex-start', textAlign: 'left', fontSize: '0.825rem', padding: '10px' }}
              >
                <Mail size={14} style={{ color: 'var(--claro-red)', flexShrink: 0 }} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tpl.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Form to edit or paste email */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div className="form-group">
            <label className="form-label">Remitente (De:)</label>
            <input
              type="text"
              className="form-input"
              placeholder="correo@proveedor.com"
              value={emailSender}
              onChange={(e) => setEmailSender(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Asunto (Subject)</label>
            <input
              type="text"
              className="form-input"
              placeholder="Asunto del correo"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Cuerpo del Correo (Paste email body)</label>
            <textarea
              className="form-textarea"
              placeholder="Pega el texto completo del correo recibido aquí..."
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              style={{ minHeight: '180px', resize: 'vertical' }}
            />
          </div>

          {error && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              backgroundColor: 'rgba(239, 68, 68, 0.1)', 
              color: '#EF4444', 
              padding: '12px', 
              borderRadius: 'var(--radius-md)', 
              marginBottom: '16px',
              fontSize: '0.85rem'
            }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <button
            onClick={handleAnalyzeEmail}
            disabled={isAnalyzing}
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px' }}
          >
            {isAnalyzing ? (
              <>
                <RefreshCw size={16} className="animate-spin" style={{ animation: 'spin 1.5s linear infinite' }} />
                <span>Analizando con Inteligencia Artificial Claro...</span>
              </>
            ) : (
              <>
                <Send size={16} />
                <span>Analizar Correo con IA</span>
              </>
            )}
          </button>
          
          {!apiKey && (
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '10px' }}>
              ℹ️ Ejecutándose en <strong>Modo Simulación local</strong>. Agrega una clave de API OpenAI en Configuración para usar análisis real.
            </p>
          )}
        </div>
      </div>

      {/* Right Column: AI Analysis Result & Staging */}
      <div>
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '8px', fontFamily: 'var(--font-display)', opacity: 0 }}>
            Resultado
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            Verifica y ajusta los campos que la inteligencia artificial extrajo antes de insertar en el repositorio oficial.
          </p>
        </div>

        {parsedData ? (
          <div className="glass-panel animate-slide-right" style={{ padding: '24px', borderColor: 'var(--claro-red)', boxShadow: 'var(--shadow-glow)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--claro-red)', fontWeight: '700', fontSize: '0.9rem', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <Check size={18} />
              <span>Extracción de IA Exitosa</span>
            </div>

            <div className="form-group">
              <label className="form-label">Título Clasificado</label>
              <input
                type="text"
                className="form-input"
                value={parsedData.title}
                onChange={(e) => setParsedData({ ...parsedData, title: e.target.value })}
              />
            </div>

            <div className="grid-cols-2" style={{ gap: '16px', marginBottom: '16px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Categoría Detectada</label>
                <select
                  className="form-select"
                  value={parsedData.category}
                  onChange={(e) => setParsedData({ ...parsedData, category: e.target.value })}
                >
                  <option value="Cloud">Cloud</option>
                  <option value="Móvil">Móvil</option>
                  <option value="Telefonía IP">Telefonía IP</option>
                  <option value="Conectividad">Conectividad</option>
                  <option value="Seguridad">Seguridad</option>
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Versión Asignada</label>
                <input
                  type="text"
                  className="form-input"
                  value={parsedData.version}
                  onChange={(e) => setParsedData({ ...parsedData, version: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group" style={{ 
              backgroundColor: 'var(--bg-primary)', 
              padding: '12px 16px', 
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span className="form-label" style={{ margin: 0, fontWeight: '700', fontSize: '0.85rem' }}>Estatus de Actualización:</span>
                <span style={{ 
                  fontSize: '0.75rem', 
                  fontWeight: '700', 
                  backgroundColor: parsedData.isUpdate ? 'var(--claro-red-light)' : 'rgba(16, 185, 129, 0.1)', 
                  color: parsedData.isUpdate ? 'var(--claro-red)' : '#10B981',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)'
                }}>
                  {parsedData.isUpdate ? 'Actualización detectada' : 'Comunicado Nuevo'}
                </span>
              </div>
              
              {parsedData.isUpdate ? (
                <div style={{ marginTop: '8px', fontSize: '0.85rem' }}>
                  <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '4px' }}>Actualiza el documento:</label>
                  <select 
                    className="form-select"
                    value={parsedData.updatesId || ''}
                    onChange={(e) => setParsedData({ 
                      ...parsedData, 
                      updatesId: e.target.value || null,
                      isUpdate: e.target.value !== ''
                    })}
                    style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                  >
                    <option value="">-- No vincular a nada (Tratar como nuevo) --</option>
                    {communications.map(c => (
                      <option key={c.id} value={c.id}>
                        [{c.category}] {c.title} (v{c.version})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Este correo no coincide con ningún comunicado previo.</p>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Contenido Resumido para el Repositorio</label>
              <textarea
                className="form-textarea"
                value={parsedData.body}
                onChange={(e) => setParsedData({ ...parsedData, body: e.target.value })}
                style={{ minHeight: '120px', resize: 'vertical' }}
              />
            </div>

            <button
              onClick={handleSaveToRepo}
              className="btn btn-primary"
              style={{ width: '100%', gap: '8px', padding: '12px' }}
            >
              <Check size={18} /> Ingerir en Repositorio de Claro
            </button>
          </div>
        ) : (
          <div className="glass-panel" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '400px' }}>
            <Mail size={48} strokeWidth={1.5} style={{ marginBottom: '16px', color: 'var(--text-muted)' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '6px' }}>En espera del análisis</h3>
            <p style={{ fontSize: '0.875rem', maxWidth: '280px' }}>Introduce el contenido de un correo o selecciona una plantilla y presiona "Analizar Correo con IA" para ver los resultados.</p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}
