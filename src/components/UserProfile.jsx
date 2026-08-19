import React from 'react';
import { User, Check, Shield, Bell, Cloud, Smartphone, Phone, Globe } from 'lucide-react';

const CATEGORIES_INFO = [
  { id: 'Cloud', name: 'Nube & Cloud Servers', desc: 'Alertas de mantenimiento, nuevas instancias y servicios cloud.', icon: Cloud, color: '#2563EB' },
  { id: 'Móvil', name: 'Servicios Móviles', desc: 'Actualizaciones de planes, roaming, eSIM y cobertura 5G.', icon: Smartphone, color: '#10B981' },
  { id: 'Telefonía IP', name: 'Telefonía IP (HPBX)', desc: 'Actualizaciones de firmware softphone, troncales y funciones IVR.', icon: Phone, color: '#D97706' },
  { id: 'Conectividad', name: 'Conectividad & Internet', desc: 'Mantenimientos preventivos de fibra y avisos de contingencia.', icon: Globe, color: '#8B5CF6' },
  { id: 'Seguridad', name: 'Ciberseguridad & SD-WAN', desc: 'Boletines de amenazas de seguridad y optimizaciones SD-WAN.', icon: Shield, color: '#EF4444' },
];

export default function UserProfile({ profileInterests, onToggleInterest, userName, onChangeUserName }) {
  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '8px', fontFamily: 'var(--font-display)' }}>
          Mi Perfil y Preferencias
        </h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          Personaliza los temas de los que deseas recibir notificaciones y comunicaciones comerciales o técnicas en tu repositorio.
        </p>
      </div>

      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            borderRadius: 'var(--radius-full)', 
            backgroundColor: 'var(--claro-red-light)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            color: 'var(--claro-red)' 
          }}>
            <User size={32} />
          </div>
          <div style={{ flex: 1 }}>
            <label className="form-label" style={{ marginBottom: '4px' }}>Nombre de Usuario / Empresa</label>
            <input 
              type="text" 
              className="form-input" 
              value={userName} 
              onChange={(e) => onChangeUserName(e.target.value)}
              placeholder="Ej. Claro Dominicana - Cliente Demo"
              style={{ fontWeight: '500', fontSize: '1.1rem' }}
            />
          </div>
        </div>

        <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Bell size={18} style={{ color: 'var(--claro-red)' }} /> Categorías de Interés
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
          Marca los temas de los que deseas recibir notificaciones. Las comunicaciones del panel principal se filtrarán automáticamente según tus preferencias.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {CATEGORIES_INFO.map(cat => {
            const Icon = cat.icon;
            const isSelected = profileInterests.includes(cat.id);
            return (
              <div 
                key={cat.id} 
                onClick={() => onToggleInterest(cat.id)}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  border: `1px solid ${isSelected ? 'var(--claro-red)' : 'var(--border-color)'}`,
                  backgroundColor: isSelected ? 'var(--claro-red-glow)' : 'var(--bg-secondary)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ 
                    width: '40px', 
                    height: '40px', 
                    borderRadius: 'var(--radius-sm)', 
                    backgroundColor: isSelected ? 'rgba(238, 28, 36, 0.1)' : 'var(--bg-primary)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    color: isSelected ? 'var(--claro-red)' : 'var(--text-secondary)' 
                  }}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <h4 style={{ fontWeight: '600', fontSize: '0.95rem', color: 'var(--text-primary)' }}>{cat.name}</h4>
                    <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>{cat.desc}</p>
                  </div>
                </div>

                <div style={{ 
                  width: '24px', 
                  height: '24px', 
                  borderRadius: 'var(--radius-full)', 
                  border: `2px solid ${isSelected ? 'var(--claro-red)' : 'var(--border-color)'}`,
                  backgroundColor: isSelected ? 'var(--claro-red)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  transition: 'all var(--transition-fast)'
                }}>
                  {isSelected && <Check size={14} strokeWidth={3} />}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="glass-panel" style={{ padding: '16px', backgroundColor: 'var(--claro-red-light)', borderColor: 'rgba(238, 28, 36, 0.2)', color: 'var(--text-primary)' }}>
        <p style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <strong>Aviso:</strong> Si desmarcas todas las categorías, se mostrarán todas las comunicaciones por defecto para evitar un panel vacío.
        </p>
      </div>
    </div>
  );
}
