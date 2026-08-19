import React, { useState, useEffect } from 'react';
import { Lock, Shield, Eye, EyeOff, Check, X } from 'lucide-react';
import { validatePasswordCompliance, sha256 } from '../utils/crypto';

export default function SetupPassword({ onPasswordConfigured, userName }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState([]);
  const [matchError, setMatchError] = useState(false);

  useEffect(() => {
    const validation = validatePasswordCompliance(password, userName);
    setErrors(validation.errors);
  }, [password, userName]);

  useEffect(() => {
    if (confirmPassword) {
      setMatchError(password !== confirmPassword);
    } else {
      setMatchError(false);
    }
  }, [password, confirmPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validation = validatePasswordCompliance(password, userName);
    if (!validation.isValid) return;
    if (password !== confirmPassword) {
      setMatchError(true);
      return;
    }
    
    // Hash password to store it
    const hash = await sha256(password);
    onPasswordConfigured(hash, password);
  };

  // Status checks for list
  const checkRule = (test) => {
    if (!password) return 'pending';
    return test ? 'valid' : 'invalid';
  };

  const hasLength = password.length >= 7;
  const hasLetterNum = /[a-zA-Z]/.test(password) && /[0-9]/.test(password);
  const noRepeats = !/(.)\1\1/.test(password);
  
  const consecutiveSequences = ["qwerty", "asdfgh", "zxcvbn", "123456", "012345"];
  const noSequences = !consecutiveSequences.some(seq => password.toLowerCase().includes(seq));
  
  const cleanUser = userName ? userName.toLowerCase().replace(/[^a-z0-9]/g, '') : '';
  const noUsername = !cleanUser || !password.toLowerCase().includes(cleanUser);

  const getRuleStyle = (status) => {
    if (status === 'valid') return { color: '#10B981', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: '500' };
    if (status === 'invalid') return { color: '#EF4444', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: '500' };
    return { color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' };
  };

  const isValid = hasLength && hasLetterNum && noRepeats && noSequences && noUsername && password === confirmPassword;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-primary)', padding: '20px' }}>
      <div className="glass-panel animate-scale-in" style={{ width: '100%', maxWidth: '480px', padding: '36px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <img 
            src="/claro-logo.png" 
            alt="Claro Logo" 
            style={{ 
              width: '64px', 
              height: '64px', 
              borderRadius: '50%', 
              objectFit: 'cover', 
              marginBottom: '16px',
              boxShadow: '0 6px 16px rgba(238, 28, 36, 0.25)' 
            }} 
          />
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '8px', color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
            Configurar Acceso Seguro
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Establece tu contraseña maestra administrativa de conformidad con las directivas corporativas de Claro **MAN10 (Sección 5.11)**.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div className="form-group">
            <label className="form-label">Nueva Contraseña Maestra</label>
            <div style={{ position: 'relative' }}>
              <input 
                type={showPassword ? "text" : "password"} 
                className="form-input" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa tu contraseña"
                style={{ paddingRight: '40px' }}
                required
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '8px' }}>
            <label className="form-label">Confirmar Contraseña</label>
            <input 
              type="password" 
              className="form-input" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repite la contraseña"
              required
            />
            {matchError && (
              <span style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                Las contraseñas no coinciden.
              </span>
            )}
          </div>

          {/* Compliance List */}
          <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>
              Directivas de Complejidad (MAN10):
            </span>
            
            <div style={getRuleStyle(checkRule(hasLength))}>
              {checkRule(hasLength) === 'valid' ? <Check size={14} /> : checkRule(hasLength) === 'invalid' ? <X size={14} /> : <div style={{width: 14}} />}
              Mínimo 7 caracteres de extensión
            </div>

            <div style={getRuleStyle(checkRule(hasLetterNum))}>
              {checkRule(hasLetterNum) === 'valid' ? <Check size={14} /> : checkRule(hasLetterNum) === 'invalid' ? <X size={14} /> : <div style={{width: 14}} />}
              Combinación de letras y números
            </div>

            <div style={getRuleStyle(checkRule(noRepeats))}>
              {checkRule(noRepeats) === 'valid' ? <Check size={14} /> : checkRule(noRepeats) === 'invalid' ? <X size={14} /> : <div style={{width: 14}} />}
              Sin repetir más de dos caracteres idénticos consecutivos (ej: 'aaa')
            </div>

            <div style={getRuleStyle(checkRule(noSequences))}>
              {checkRule(noSequences) === 'valid' ? <Check size={14} /> : checkRule(noSequences) === 'invalid' ? <X size={14} /> : <div style={{width: 14}} />}
              Sin secuencias del teclado (ej: 'qwerty', '123456')
            </div>

            <div style={getRuleStyle(checkRule(noUsername))}>
              {checkRule(noUsername) === 'valid' ? <Check size={14} /> : checkRule(noUsername) === 'invalid' ? <X size={14} /> : <div style={{width: 14}} />}
              Sin alusiones al nombre de usuario o empresa ('{userName || 'Claro'}')
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '12px', marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            disabled={!isValid}
          >
            <Lock size={18} /> Guardar y Activar Sistema
          </button>

        </form>
      </div>
    </div>
  );
}
