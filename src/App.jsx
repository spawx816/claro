import React, { useState, useEffect } from 'react';
import { BookOpen, Bot, User, Settings, Database, Moon, Sun, RefreshCw, Check, LogOut, TrendingUp, FileText, FolderTree } from 'lucide-react';
import CommunicationsRepo, { initialCommunications } from './components/CommunicationsRepo';
import Dashboard from './components/Dashboard';

import ProductCatalog from './components/ProductCatalog';
import UserProfile from './components/UserProfile';
import ClaroCopilot from './components/ClaroCopilot';
import QuotationRepo from './components/QuotationRepo';
import SetupPassword from './components/SetupPassword';
import Login from './components/Login';
import SharePointFileExplorer from './components/SharePointFileExplorer';
import { generateSalt, decryptData, encryptData } from './utils/crypto';

export default function App() {
  const [activeTab, setActiveTab] = useState('comms');
  const [communications, setCommunications] = useState(() => {
    const local = localStorage.getItem('claro_comms');
    return local ? JSON.parse(local) : initialCommunications;
  });
  
  // User profiles and interests state
  const [profileInterests, setProfileInterests] = useState(() => {
    const local = localStorage.getItem('claro_interests');
    return local ? JSON.parse(local) : ['Cloud', 'Móvil', 'Telefonía IP', 'Conectividad', 'Seguridad'];
  });
  const [userName, setUserName] = useState(() => {
    return localStorage.getItem('claro_username') || 'Claro Business Partner';
  });

  const [emailHost, setEmailHost] = useState(() => {
    return localStorage.getItem('claro_email_host') || '';
  });
  const [emailPort, setEmailPort] = useState(() => {
    return localStorage.getItem('claro_email_port') || '993';
  });
  const [emailUser, setEmailUser] = useState(() => {
    return localStorage.getItem('claro_email_user') || '';
  });
  const [emailSecure, setEmailSecure] = useState(() => {
    const val = localStorage.getItem('claro_email_secure');
    return val !== null ? JSON.parse(val) : true;
  });
  const [connectionStatus, setConnectionStatus] = useState('idle');

  // Security & Authentication States (Compliance POL22/MAN10)
  const [masterPasswordHash, setMasterPasswordHash] = useState(() => {
    return localStorage.getItem('claro_master_hash') || '';
  });
  const [salt, setSalt] = useState(() => {
    let s = localStorage.getItem('claro_salt');
    if (!s) {
      s = generateSalt();
      localStorage.setItem('claro_salt', s);
    }
    return s;
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('claro_session_active') === 'true' || sessionStorage.getItem('claro_session_active') === 'true';
  });
  const [masterPassword, setMasterPassword] = useState(() => {
    return sessionStorage.getItem('claro_session_pass') || '';
  });
  
  // Decrypted sensitive data kept strictly in-memory
  const [decryptedApiKey, setDecryptedApiKey] = useState(() => {
    return localStorage.getItem('claro_active_api_key') || '';
  });
  const [decryptedEmailPassword, setDecryptedEmailPassword] = useState('');

  // Security logs state
  const [securityLogs, setSecurityLogs] = useState(() => {
    const local = localStorage.getItem('claro_security_logs');
    return local ? JSON.parse(local) : [];
  });

  // Settings Modal display
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [theme, setTheme] = useState('light');

  // Custom Agent & Workflow Integration states
  const [customAgentMode, setCustomAgentMode] = useState(() => {
    return localStorage.getItem('claro_agent_mode') || 'openai';
  });
  const [assistantId, setAssistantId] = useState(() => {
    return localStorage.getItem('claro_assistant_id') || '';
  });
  const [webhookUrl, setWebhookUrl] = useState(() => {
    return localStorage.getItem('claro_webhook_url') || '';
  });
  const [openaiModel, setOpenaiModel] = useState(() => {
    return localStorage.getItem('claro_openai_model') || 'gpt-3.5-turbo';
  });

  // Prefilled query trigger and visibility for Copilot
  const [copilotTriggerQuery, setCopilotTriggerQuery] = useState(null);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);

  // Sync basic data to localstorage
  useEffect(() => {
    localStorage.setItem('claro_comms', JSON.stringify(communications));
  }, [communications]);

  useEffect(() => {
    localStorage.setItem('claro_interests', JSON.stringify(profileInterests));
  }, [profileInterests]);

  useEffect(() => {
    localStorage.setItem('claro_username', userName);
  }, [userName]);

  useEffect(() => {
    localStorage.setItem('claro_agent_mode', customAgentMode);
  }, [customAgentMode]);

  useEffect(() => {
    localStorage.setItem('claro_assistant_id', assistantId);
  }, [assistantId]);

  useEffect(() => {
    localStorage.setItem('claro_webhook_url', webhookUrl);
  }, [webhookUrl]);

  useEffect(() => {
    localStorage.setItem('claro_openai_model', openaiModel);
  }, [openaiModel]);

  useEffect(() => {
    if (decryptedApiKey) localStorage.setItem('claro_active_api_key', decryptedApiKey);
  }, [decryptedApiKey]);

  useEffect(() => {
    localStorage.setItem('claro_email_host', emailHost);
  }, [emailHost]);

  useEffect(() => {
    localStorage.setItem('claro_email_port', emailPort);
  }, [emailPort]);

  useEffect(() => {
    localStorage.setItem('claro_email_user', emailUser);
  }, [emailUser]);

  useEffect(() => {
    localStorage.setItem('claro_email_secure', JSON.stringify(emailSecure));
  }, [emailSecure]);

  // Clean legacy plaintext keys & save encrypted ones when modified
  useEffect(() => {
    localStorage.removeItem('claro_openai_key');
    localStorage.removeItem('claro_email_password');

    // Auto-fetch server-configured OpenAI Key if not set in local storage
    fetch('/api/config/openai-key')
      .then(res => res.json())
      .then(data => {
        if (data.apiKey) {
          setDecryptedApiKey(prev => prev || data.apiKey);
          if (!localStorage.getItem('claro_active_api_key')) {
            localStorage.setItem('claro_active_api_key', data.apiKey);
          }
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (isAuthenticated && masterPassword) {
      encryptData(decryptedApiKey, masterPassword, salt).then(enc => {
        localStorage.setItem('claro_openai_key_enc', enc);
      });
    }
  }, [decryptedApiKey, isAuthenticated, masterPassword, salt]);

  useEffect(() => {
    if (isAuthenticated && masterPassword) {
      encryptData(decryptedEmailPassword, masterPassword, salt).then(enc => {
        localStorage.setItem('claro_email_password_enc', enc);
      });
    }
  }, [decryptedEmailPassword, isAuthenticated, masterPassword, salt]);

  // Restore decrypted credentials on page refresh if active session exists
  useEffect(() => {
    const savedPass = sessionStorage.getItem('claro_session_pass');
    if (isAuthenticated && savedPass) {
      const encKey = localStorage.getItem('claro_openai_key_enc') || '';
      const encPass = localStorage.getItem('claro_email_password_enc') || '';
      if (encKey && !decryptedApiKey) {
        decryptData(encKey, savedPass, salt).then(k => { if (k) setDecryptedApiKey(k); }).catch(() => {});
      }
      if (encPass && !decryptedEmailPassword) {
        decryptData(encPass, savedPass, salt).then(p => { if (p) setDecryptedEmailPassword(p); }).catch(() => {});
      }
    }
  }, [isAuthenticated, salt]);

  // Activity listener for automatic Terminal Time-Out (MAN10 5.6.5.7)
  useEffect(() => {
    if (!isAuthenticated) return;

    let timeoutId;
    const resetTimer = () => {
      clearTimeout(timeoutId);
      // Desconexión automática tras 5 minutos de inactividad
      timeoutId = setTimeout(() => {
        handleLogout('TIMEOUT');
      }, 300000);
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(evt => window.addEventListener(evt, resetTimer));
    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      events.forEach(evt => window.removeEventListener(evt, resetTimer));
    };
  }, [isAuthenticated]);

  const addSecurityLog = (type, details) => {
    const newLog = {
      timestamp: new Date().toISOString(),
      type,
      details,
      ip: '127.0.0.1'
    };
    setSecurityLogs(prev => {
      const updated = [newLog, ...prev].slice(0, 100);
      localStorage.setItem('claro_security_logs', JSON.stringify(updated));
      return updated;
    });
  };

  const handleLogout = (reason = 'USER') => {
    localStorage.removeItem('claro_session_active');
    sessionStorage.removeItem('claro_session_active');
    sessionStorage.removeItem('claro_session_pass');
    setMasterPassword('');
    setDecryptedApiKey('');
    setDecryptedEmailPassword('');
    setIsAuthenticated(false);
    
    if (reason === 'TIMEOUT') {
      addSecurityLog('SESSION_TIMEOUT', 'Sesión cerrada automáticamente por inactividad (MAN10 5.6.5.7).');
      alert('Tu sesión administrativa ha expirado por inactividad.');
    } else {
      addSecurityLog('LOGOUT', 'Sesión administrativa cerrada por el usuario.');
    }
  };

  const handleToggleInterest = (id) => {
    setProfileInterests(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleTestConnection = async () => {
    setConnectionStatus('testing');
    try {
      const response = await fetch('/api/emails/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          host: emailHost,
          port: emailPort,
          user: emailUser,
          password: decryptedEmailPassword,
          secure: String(emailSecure)
        })
      });
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success') {
          setConnectionStatus('success');
          addSecurityLog('IMAP_TEST_SUCCESS', `Prueba de conexión exitosa para usuario: ${emailUser}`);
        } else {
          setConnectionStatus('error');
          addSecurityLog('IMAP_TEST_FAIL', `Prueba de conexión fallida: ${data.message}`);
          alert(`Falla de conexión IMAP: ${data.message || 'Error de credenciales'}`);
        }
      } else {
        setConnectionStatus('error');
        addSecurityLog('IMAP_TEST_FAIL', 'Error HTTP al probar conexión.');
        alert(`Error al probar la conexión.`);
      }
    } catch (err) {
      setConnectionStatus('error');
      addSecurityLog('IMAP_TEST_FAIL', `Error de red: ${err.message}`);
      alert(`Error de red al probar conexión: ${err.message}`);
    }
  };

  const handleIngestCommunication = (newComm) => {
    setCommunications(prev => [newComm, ...prev]);
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  const handleSelectProductForQuote = (product) => {
    setIsCopilotOpen(true);
    const query = `Hazme una cotización de ${product.name} para 10 usuarios`;
    setCopilotTriggerQuery(query);
  };

  // Render Login and Setup flows if not authenticated
  if (!masterPasswordHash) {
    return (
      <SetupPassword 
        userName={userName}
        onPasswordConfigured={async (hash, rawPassword) => {
          localStorage.setItem('claro_master_hash', hash);
          localStorage.setItem('claro_session_active', 'true');
          sessionStorage.setItem('claro_session_active', 'true');
          sessionStorage.setItem('claro_session_pass', rawPassword);
          setMasterPasswordHash(hash);
          setMasterPassword(rawPassword);
          setDecryptedApiKey('');
          setDecryptedEmailPassword('');
          setIsAuthenticated(true);
          addSecurityLog('CONFIG_INITIAL', 'Configuración inicial de contraseña maestra.');
          addSecurityLog('LOGIN_SUCCESS', 'Sesión administrativa inicial iniciada.');
        }}
      />
    );
  }

  if (!isAuthenticated) {
    return (
      <Login 
        masterPasswordHash={masterPasswordHash}
        userName={userName}
        onLoginSuccess={async (rawPassword) => {
          localStorage.setItem('claro_session_active', 'true');
          sessionStorage.setItem('claro_session_active', 'true');
          sessionStorage.setItem('claro_session_pass', rawPassword);
          setMasterPassword(rawPassword);
          const encKey = localStorage.getItem('claro_openai_key_enc') || '';
          const encPass = localStorage.getItem('claro_email_password_enc') || '';
          try {
            const decKey = encKey ? await decryptData(encKey, rawPassword, salt) : '';
            const decPass = encPass ? await decryptData(encPass, rawPassword, salt) : '';
            setDecryptedApiKey(decKey);
            setDecryptedEmailPassword(decPass);
            setIsAuthenticated(true);
            addSecurityLog('LOGIN_SUCCESS', 'Sesión administrativa iniciada con éxito.');
          } catch (e) {
            addSecurityLog('LOGIN_FAIL', 'Error al descifrar credenciales con clave maestra.');
            alert('Error de descifrado: La clave maestra no pudo desbloquear los datos.');
          }
        }}
        onPasswordReset={(newHash) => {
          localStorage.setItem('claro_master_hash', newHash);
          setMasterPasswordHash(newHash);
          localStorage.removeItem('claro_openai_key_enc');
          localStorage.removeItem('claro_email_password_enc');
          setDecryptedApiKey('');
          setDecryptedEmailPassword('');
          addSecurityLog('PASSWORD_RESET', 'Contraseña maestra restablecida por factores de autenticación.');
        }}
      />
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Premium Navigation Header */}
      <header className="app-header">
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          
          {/* Logo brand Claro */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => setActiveTab('comms')}>
            <img 
              src="/claro-logo.png" 
              alt="Claro Logo" 
              style={{ 
                width: '42px', 
                height: '42px', 
                borderRadius: '50%', 
                objectFit: 'cover',
                boxShadow: '0 4px 10px rgba(238, 28, 36, 0.3)' 
              }} 
            />
            <div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.02em', margin: 0, fontFamily: 'var(--font-display)' }}>
                Claro <span style={{ color: 'var(--claro-red)' }}>Insight</span>
              </h1>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginTop: '-3px', fontWeight: '500' }}>
                Hub Inteligente de Comunicaciones
              </span>
            </div>
          </div>

          {/* User profile brief */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div 
              onClick={() => setActiveTab('profile')}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                padding: '6px 12px', 
                backgroundColor: 'var(--bg-primary)', 
                border: '1px solid var(--border-color)', 
                borderRadius: 'var(--radius-full)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
              className="btn-secondary"
            >
              <div style={{ width: '24px', height: '24px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--claro-red-light)', color: 'var(--claro-red)', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
                <User size={14} />
              </div>
              <span style={{ fontSize: '0.825rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                {userName}
              </span>
            </div>

            {/* Logout button */}
            <button 
              onClick={() => handleLogout('USER')} 
              className="btn btn-secondary" 
              title="Cerrar Sesión Segura (MAN10)"
              style={{ padding: '8px', borderRadius: 'var(--radius-full)', width: '38px', height: '38px', color: 'var(--claro-red)' }}
            >
              <LogOut size={18} />
            </button>

            {/* Dark mode switch */}
            <button onClick={toggleTheme} className="btn btn-secondary" style={{ padding: '8px', borderRadius: 'var(--radius-full)', width: '38px', height: '38px' }}>
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            {/* Settings button */}
            <button onClick={() => setShowSettingsModal(true)} className="btn btn-secondary" style={{ padding: '8px', borderRadius: 'var(--radius-full)', width: '38px', height: '38px' }}>
              <Settings size={18} />
            </button>
          </div>

        </div>
      </header>

      {/* Main Tabs Navigation Bar */}
      <nav className="container" style={{ marginTop: '24px' }}>
        <div className="tabs-nav">
          <button 
            onClick={() => setActiveTab('dashboard')} 
            className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          >
            <TrendingUp size={16} /> Dashboard
          </button>

          <button 
            onClick={() => setActiveTab('comms')} 
            className={`tab-btn ${activeTab === 'comms' ? 'active' : ''}`}
          >
            <BookOpen size={16} /> Repositorio
          </button>

          <button 
            onClick={() => setActiveTab('sharepoint')} 
            className={`tab-btn ${activeTab === 'sharepoint' ? 'active' : ''}`}
          >
            <FolderTree size={16} /> Explorador Documental
          </button>

          <button 
            onClick={() => setActiveTab('catalog')} 
            className={`tab-btn ${activeTab === 'catalog' ? 'active' : ''}`}
          >
            <Database size={16} /> Catálogo de Productos
          </button>
          <button 
            onClick={() => {
              setActiveTab('chatbot');
              setIsCopilotOpen(true);
            }} 
            className={`tab-btn ${activeTab === 'chatbot' ? 'active' : ''}`}
          >
            <Bot size={16} /> Clara (Chatbot)
          </button>
          <button 
            onClick={() => setActiveTab('quotes')} 
            className={`tab-btn ${activeTab === 'quotes' ? 'active' : ''}`}
          >
            <FileText size={16} /> Cotizaciones
          </button>

          <button 
            onClick={() => setActiveTab('profile')} 
            className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          >
            <User size={16} /> Mi Perfil
          </button>
        </div>
      </nav>

      {/* Tab Contents */}
      <main className="container" style={{ flex: 1, paddingBottom: '48px' }}>
        {activeTab === 'dashboard' && (
          <Dashboard communications={communications} />
        )}

        {activeTab === 'comms' && (
          <CommunicationsRepo 
            communications={communications} 
            profileInterests={profileInterests} 
            onIngestCommunication={handleIngestCommunication}
            apiKey={decryptedApiKey}
            monitoredEmail={emailUser}
            emailHost={emailHost}
            emailPort={emailPort}
            emailPassword={decryptedEmailPassword}
            emailSecure={emailSecure}
          />
        )}

        {activeTab === 'sharepoint' && (
          <SharePointFileExplorer 
            apiKey={decryptedApiKey}
            onAskCopilot={(prompt) => {
              setActiveTab('chatbot');
              setIsCopilotOpen(true);
              setCopilotTriggerQuery(prompt);
            }}
            onGenerateQuote={(doc) => {
              setActiveTab('chatbot');
              setIsCopilotOpen(true);
              setCopilotTriggerQuery(`Genera una cotización formal basada en el documento ${doc.title} (${doc.name})`);
            }}
          />
        )}

        {activeTab === 'catalog' && (
          <ProductCatalog 
            onSelectProductForQuote={handleSelectProductForQuote} 
          />
        )}

        {activeTab === 'quotes' && (
          <QuotationRepo />
        )}

        {activeTab === 'chatbot' && (
          <ClaroCopilot 
            apiKey={decryptedApiKey}
            communications={communications}
            prefilledQuery={copilotTriggerQuery}
            onClearPrefilled={() => setCopilotTriggerQuery(null)}
            customAgentMode={customAgentMode}
            assistantId={assistantId}
            webhookUrl={webhookUrl}
            openaiModel={openaiModel}
            mode="embedded"
          />
        )}
        {activeTab === 'profile' && (
          <UserProfile 
            profileInterests={profileInterests} 
            onToggleInterest={handleToggleInterest}
            userName={userName}
            onChangeUserName={setUserName}
            securityLogs={securityLogs}
            onClearLogs={() => {
              localStorage.setItem('claro_security_logs', JSON.stringify([]));
              setSecurityLogs([]);
            }}
            onLogout={() => handleLogout('USER')}
          />
        )}
      </main>

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && setShowSettingsModal(false)}>
          <div className="modal-panel animate-scale-in" style={{ padding: '28px' }}>

            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
              <Settings size={20} style={{ color: 'var(--claro-red)' }} /> Configuración de Claro Insight
            </h3>
            
            {/* AI Agent & Workflow Settings */}
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>
                1. Configuración del Agente de IA (Clara) & Workflows
              </h4>
              
              {/* Agent Mode Selector */}
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label className="form-label">Modo de Integración del Agente</label>
                <select 
                  className="form-input" 
                  value={customAgentMode}
                  onChange={(e) => setCustomAgentMode(e.target.value)}
                  style={{ fontSize: '0.85rem' }}
                >
                  <option value="openai">OpenAI Standard / Custom Model (API Key)</option>
                  <option value="assistant">OpenAI Assistants API (Assistant ID: asst_...)</option>
                  <option value="webhook">Custom Agent Webhook (n8n / Make / Flowise / HTTP)</option>
                </select>
              </div>

              {/* Mode 1: OpenAI standard / Model */}
              {customAgentMode === 'openai' && (
                <div className="grid-cols-2" style={{ gap: '10px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>OpenAI API Key</label>
                    <input 
                      type="password" 
                      className="form-input" 
                      placeholder="sk-..."
                      value={decryptedApiKey} 
                      onChange={(e) => setDecryptedApiKey(e.target.value)}
                      style={{ fontSize: '0.85rem' }}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Modelo / Fine-Tuned Model</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="gpt-3.5-turbo o ft:gpt-4o:..."
                      value={openaiModel} 
                      onChange={(e) => setOpenaiModel(e.target.value)}
                      style={{ fontSize: '0.85rem' }}
                    />
                  </div>
                </div>
              )}

              {/* Mode 2: OpenAI Assistant ID */}
              {customAgentMode === 'assistant' && (
                <div className="grid-cols-2" style={{ gap: '10px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>OpenAI API Key</label>
                    <input 
                      type="password" 
                      className="form-input" 
                      placeholder="sk-..."
                      value={decryptedApiKey} 
                      onChange={(e) => setDecryptedApiKey(e.target.value)}
                      style={{ fontSize: '0.85rem' }}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Assistant ID (OpenAI Platform)</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="asst_abc123xyz..."
                      value={assistantId} 
                      onChange={(e) => setAssistantId(e.target.value)}
                      style={{ fontSize: '0.85rem' }}
                    />
                  </div>
                </div>
              )}

              {/* Mode 3: Custom Webhook URL */}
              {customAgentMode === 'webhook' && (
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>URL del Webhook / Agente Externo</label>
                  <input 
                    type="url" 
                    className="form-input" 
                    placeholder="https://n8n.tudominio.com/webhook/clara-agent"
                    value={webhookUrl} 
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    style={{ fontSize: '0.85rem' }}
                  />
                  <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                    Clara enviará un POST con <code>{`{ message, history, userId }`}</code> y espera un JSON con <code>{`{ reply, quoteData }`}</code>.
                  </span>
                </div>
              )}
            </div>

            {/* IMAP Mail Server Settings */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginBottom: '20px' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>2. Servidor de Correo Entrante (IMAP)</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                Configura tu servidor para recibir y sincronizar correos reales. Ejemplos: <strong>imap.gmail.com</strong> (Gmail) · <strong>outlook.office365.com</strong> (Outlook)
              </p>
              
              <div className="grid-cols-3" style={{ gap: '10px', marginBottom: '10px', gridTemplateColumns: '2.5fr 1fr 1fr' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Servidor / Host IMAP</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="imap.claro.com.do"
                    value={emailHost} 
                    onChange={(e) => setEmailHost(e.target.value)}
                    style={{ fontSize: '0.825rem', padding: '8px 10px' }}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Puerto</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="993"
                    value={emailPort} 
                    onChange={(e) => setEmailPort(e.target.value)}
                    style={{ fontSize: '0.825rem', padding: '8px 10px' }}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', paddingBottom: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                    <input 
                      type="checkbox" 
                      checked={emailSecure}
                      onChange={(e) => setEmailSecure(e.target.checked)}
                      style={{ cursor: 'pointer' }}
                    />
                    SSL/TLS
                  </label>
                </div>
              </div>

              <div className="grid-cols-2" style={{ gap: '10px', marginBottom: '14px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Usuario / Correo a monitorear</label>
                  <input 
                    type="email" 
                    className="form-input" 
                    placeholder="tu-correo@gmail.com"
                    value={emailUser} 
                    onChange={(e) => setEmailUser(e.target.value)}
                    style={{ fontSize: '0.825rem', padding: '8px 10px' }}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Clave de Aplicación (App Password)</label>
                  <input 
                    type="password" 
                    className="form-input" 
                    placeholder="Contraseña generada en tu cuenta (no tu clave personal)"
                    value={decryptedEmailPassword} 
                    onChange={(e) => setDecryptedEmailPassword(e.target.value)}
                    style={{ fontSize: '0.825rem', padding: '8px 10px' }}
                  />
                </div>
              </div>

              {/* Test Connection Button and Status */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', backgroundColor: 'var(--bg-primary)', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div>
                  {connectionStatus === 'idle' && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Conexión no probada</span>
                  )}
                  {connectionStatus === 'testing' && (
                    <span style={{ fontSize: '0.75rem', color: '#2563EB', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <RefreshCw size={12} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} /> Probando credenciales...
                    </span>
                  )}
                  {connectionStatus === 'success' && (
                    <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Check size={12} /> 🟢 Conexión exitosa al servidor IMAP
                    </span>
                  )}
                </div>

                <button 
                  type="button" 
                  onClick={handleTestConnection}
                  disabled={connectionStatus === 'testing'}
                  className="btn btn-secondary" 
                  style={{ padding: '6px 12px', fontSize: '0.75rem', cursor: 'pointer' }}
                >
                  Probar Conexión
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
              <button onClick={() => { setDecryptedApiKey(''); setShowSettingsModal(false); }} className="btn btn-secondary" style={{ color: 'var(--claro-red)' }}>
                Limpiar Clave
              </button>
              <button onClick={() => setShowSettingsModal(false)} className="btn btn-primary">
                Guardar y Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Chatbot Bubble & Drawer Widget (Always visible) */}
      <ClaroCopilot 
        apiKey={decryptedApiKey}
        communications={communications}
        prefilledQuery={copilotTriggerQuery}
        onClearPrefilled={() => setCopilotTriggerQuery(null)}
        isOpen={isCopilotOpen}
        onToggleOpen={setIsCopilotOpen}
        customAgentMode={customAgentMode}
        assistantId={assistantId}
        webhookUrl={webhookUrl}
        openaiModel={openaiModel}
        mode="floating"
      />

      {/* Footer */}
      <footer className="app-footer">
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <p>© {new Date().getFullYear()} Claro Dominicana · Todos los derechos reservados.</p>
          <p style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }} />
            Claro Insight Hub v1.0 — Powered by IA
          </p>
        </div>
      </footer>
    </div>
  );
}
