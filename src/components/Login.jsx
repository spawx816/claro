import React, { useState } from 'react';
import { Lock, ShieldAlert, KeyRound, Check, Eye, EyeOff } from 'lucide-react';
import { sha256, validatePasswordCompliance } from '../utils/crypto';

export default function Login({ masterPasswordHash, onLoginSuccess, onPasswordReset, userName }) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  
  // Recovery factor inputs
  const [cedula, setCedula] = useState('');
  const [localidad, setLocalidad] = useState('');
  const [tarjeta, setTarjeta] = useState('');
  const [userId, setUserId] = useState(userName);
  const [recoveryError, setRecoveryError] = useState('');
  
  // New password inputs after recovery
  const [showNewPasswordForm, setShowNewPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [newPasswordErrors, setNewPasswordErrors] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const hash = await sha256(password);
    if (hash === masterPasswordHash) {
      onLoginSuccess(password);
    } else {
      setError('Contraseña incorrecta. Acceso denegado (MAN10).');
    }
  };

  const handleResetSubmit = (e) => {
    e.preventDefault();
    setRecoveryError('');
    
    // De acuerdo con MAN10 5.11.3:
    // Para demostración aceptamos credenciales específicas de Claro:
    // Cédula: 001-1234567-8
    // Localidad: Santo Domingo
    // Tarjeta: T-9921
    // ID: (coincide con userName, ej: "Claro Business Partner")
    const cleanCedula = cedula.replace(/[^0-9]/g, '');
    if (cleanCedula !== '00112345678' || localidad.toLowerCase().trim() !== 'santo domingo' || tarjeta.toUpperCase().trim() !== 'T-9921' || userId.trim() !== userName.trim()) {
      setRecoveryError('Factores de autenticación inválidos. No se pudo verificar su identidad corporativa.');
      return;
    }

    setShowNewPasswordForm(true);
  };

  const handleNewPasswordSubmit = async (e) => {
    e.preventDefault();
    const validation = validatePasswordCompliance(newPassword, userName);
    if (!validation.isValid) {
      setNewPasswordErrors(validation.errors);
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setNewPasswordErrors(['Las contraseñas no coinciden.']);
      return;
    }

    const newHash = await sha256(newPassword);
    onPasswordReset(newHash);
    setIsResetting(false);
    setShowNewPasswordForm(false);
    setPassword('');
    alert('Contraseña maestra restablecida con éxito.');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-primary)', padding: '20px' }}>
      <div className="glass-panel animate-scale-in" style={{ width: '100%', maxWidth: '440px', padding: '36px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
        
        {!isResetting ? (
          <div>
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
              <h2 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '8px', color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                Claro Insight Hub
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                Acceso restringido. Por favor ingrese su contraseña administrativa.
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="form-group">
                <label className="form-label">Contraseña Maestra</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    className="form-input" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Contraseña"
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
                {error && (
                  <span style={{ color: '#EF4444', fontSize: '0.8rem', marginTop: '6px', display: 'block', fontWeight: '500' }}>
                    ⚠️ {error}
                  </span>
                )}
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <KeyRound size={18} /> Iniciar Sesión
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <button 
                onClick={() => setIsResetting(true)}
                style={{ background: 'none', border: 'none', color: 'var(--claro-red)', fontSize: '0.825rem', fontWeight: '600', cursor: 'pointer' }}
              >
                ¿Olvidaste tu contraseña administrativa?
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ 
                width: '56px', 
                height: '56px', 
                borderRadius: 'var(--radius-full)', 
                backgroundColor: 'rgba(217, 119, 6, 0.1)', 
                display: 'inline-flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: '#D97706',
                marginBottom: '16px'
              }}>
                <ShieldAlert size={28} />
              </div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '8px', color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                Restablecer Credenciales
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.825rem' }}>
                De acuerdo con la norma **MAN10 (5.11.3)**, valide los siguientes 4 factores mínimos de identidad para desbloquear el restablecimiento de su clave.
              </p>
            </div>

            {!showNewPasswordForm ? (
              <form onSubmit={handleResetSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: '0.75rem', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', marginBottom: '8px' }}>
                  💡 Para la demo, utiliza:<br/>
                  • Cédula: <strong>001-1234567-8</strong><br/>
                  • Localidad: <strong>Santo Domingo</strong><br/>
                  • Tarjeta ID: <strong>T-9921</strong><br/>
                  • ID Usuario: <strong>{userName}</strong>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>1. Cédula de Identidad Personal</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="001-1234567-8"
                    value={cedula}
                    onChange={(e) => setCedula(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>2. Localidad (Provincia/Oficina)</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Santo Domingo"
                    value={localidad}
                    onChange={(e) => setLocalidad(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>3. Tarjeta de Identificación Claro</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="T-9921"
                    value={tarjeta}
                    onChange={(e) => setTarjeta(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>4. ID / Nombre registrado en el sistema</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    required
                  />
                </div>

                {recoveryError && (
                  <span style={{ color: '#EF4444', fontSize: '0.75rem', fontWeight: '500', display: 'block' }}>
                    ❌ {recoveryError}
                  </span>
                )}

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button 
                    type="button" 
                    onClick={() => { setIsResetting(false); setRecoveryError(''); }}
                    className="btn btn-secondary" 
                    style={{ flex: 1 }}
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    style={{ flex: 1 }}
                  >
                    Validar Factores
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleNewPasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '12px', borderRadius: 'var(--radius-md)', color: '#10B981', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Check size={16} /> Identidad validada correctamente.
                </div>

                <div className="form-group">
                  <label className="form-label">Nueva Contraseña Administrativa</label>
                  <input 
                    type="password" 
                    className="form-input" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Contraseña"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Confirmar Nueva Contraseña</label>
                  <input 
                    type="password" 
                    className="form-input" 
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Confirmar Contraseña"
                    required
                  />
                </div>

                {newPasswordErrors.length > 0 && (
                  <div style={{ color: '#EF4444', fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {newPasswordErrors.map((err, idx) => (
                      <span key={idx}>• {err}</span>
                    ))}
                  </div>
                )}

                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ width: '100%', padding: '12px', marginTop: '10px' }}
                >
                  Establecer y Guardar
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
