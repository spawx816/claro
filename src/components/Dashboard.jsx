import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { Mail, TrendingUp, Clock, FileText, GitBranch, Layers, ChevronRight, BarChart3, CheckCircle2 } from 'lucide-react';

export default function Dashboard({ communications = [] }) {
  // 1. KPI Calculations
  const totalComms = communications.length;
  
  const updatesCount = useMemo(() => {
    return communications.filter(c => c.isUpdate || c.parentCommId || c.ancVariant).length;
  }, [communications]);

  const lastCommDate = useMemo(() => {
    if (!communications || communications.length === 0) return 'N/A';
    const dates = communications
      .map(c => c.date ? new Date(c.date).getTime() : 0)
      .filter(t => !isNaN(t) && t > 0);
    
    if (dates.length === 0) return 'N/A';
    const maxDate = new Date(Math.max(...dates));
    return maxDate.toLocaleDateString('es-DO', { day: 'numeric', month: 'short', year: 'numeric' });
  }, [communications]);

  // Category Color Map (Official Claro Corporate Palette)
  const getCategoryColor = (cat) => {
    if (!cat) return '#64748B';
    if (cat.includes('Cloud')) return '#2563EB';
    if (cat.includes('Internet') || cat.includes('Conectividad')) return '#8B5CF6';
    if (cat.includes('HPBX') || cat.includes('Telefonía')) return '#D97706';
    if (cat.includes('Móvil') || cat.includes('Equipos')) return '#10B981';
    if (cat.includes('Televisión') || cat.includes('TV')) return '#EC4899';
    if (cat.includes('Videovigilancia') || cat.includes('Seguridad')) return '#EF4444';
    if (cat.includes('Comercial') || cat.includes('Políticas')) return '#64748B';
    return '#EE1C24';
  };

  // 2. Data for Donut Chart (Category Distribution)
  const categoryData = useMemo(() => {
    const counts = {};
    communications.forEach(comm => {
      const cat = comm.category || 'Comercial & Políticas';
      counts[cat] = (counts[cat] || 0) + 1;
    });

    const total = communications.length || 1;

    return Object.keys(counts).map(key => ({
      name: key,
      value: counts[key],
      percentage: ((counts[key] / total) * 100).toFixed(1),
      color: getCategoryColor(key)
    })).sort((a, b) => b.value - a.value);
  }, [communications]);

  // 3. Data for Bar Chart (Monthly Volume)
  const dateData = useMemo(() => {
    const counts = {};
    communications.forEach(comm => {
      if (!comm.date) return;
      const parts = comm.date.split('-');
      if (parts.length >= 2) {
        const key = `${parts[0]}-${parts[1]}`;
        counts[key] = (counts[key] || 0) + 1;
      }
    });

    return Object.keys(counts).sort().map(key => {
      const [yyyy, mm] = key.split('-');
      const dateObj = new Date(parseInt(yyyy), parseInt(mm) - 1, 1);
      const label = !isNaN(dateObj.getTime())
        ? dateObj.toLocaleDateString('es-DO', { month: 'short', year: 'numeric' })
        : key;
      
      return {
        date: label.charAt(0).toUpperCase() + label.slice(1),
        rawKey: key,
        cantidad: counts[key]
      };
    });
  }, [communications]);

  // 4. Latest 5 Processed Communications
  const latestComms = useMemo(() => {
    return [...communications]
      .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
      .slice(0, 5);
  }, [communications]);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', fontFamily: 'var(--font-display)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BarChart3 size={28} style={{ color: 'var(--claro-red)' }} />
            Dashboard Analítico de Inteligencia Comercial
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            Métricas operativas, distribución por servicio y seguimiento de versiones en tiempo real.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--bg-secondary)', padding: '6px 14px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-color)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          <CheckCircle2 size={14} style={{ color: '#10B981' }} />
          <span>Indexación IA Activa: <strong>{totalComms} boletines sincronizados</strong></span>
        </div>
      </div>

      {/* 1. 4-Column Balanced KPI Stat Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '16px' }}>
        
        {/* KPI 1: Total Comms */}
        <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-lg)', borderLeft: '4px solid var(--claro-red)', display: 'flex', alignItems: 'center', gap: '16px', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}>
          <div style={{ padding: '14px', backgroundColor: 'var(--claro-red-light)', borderRadius: '12px', color: 'var(--claro-red)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileText size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.775rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
              Total Comunicados
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: '900', color: 'var(--text-primary)', lineHeight: '1.2' }}>
              {totalComms}
            </div>
            <div style={{ fontSize: '0.725rem', color: '#10B981', fontWeight: '700', marginTop: '2px' }}>
              100% Indexados en sistema
            </div>
          </div>
        </div>

        {/* KPI 2: Versions & Updates */}
        <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-lg)', borderLeft: '4px solid #2563EB', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '14px', backgroundColor: 'rgba(37, 99, 235, 0.1)', borderRadius: '12px', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <GitBranch size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.775rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
              Modificaciones v2.0
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: '900', color: 'var(--text-primary)', lineHeight: '1.2' }}>
              {updatesCount}
            </div>
            <div style={{ fontSize: '0.725rem', color: '#2563EB', fontWeight: '700', marginTop: '2px' }}>
              Versiones v2.0 vinculadas
            </div>
          </div>
        </div>

        {/* KPI 3: Active Categories */}
        <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-lg)', borderLeft: '4px solid #10B981', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '14px', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Layers size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.775rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
              Categorías Activas
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: '900', color: 'var(--text-primary)', lineHeight: '1.2' }}>
              {categoryData.length}
            </div>
            <div style={{ fontSize: '0.725rem', color: '#10B981', fontWeight: '700', marginTop: '2px' }}>
              Clasificación inteligente
            </div>
          </div>
        </div>

        {/* KPI 4: Last Update */}
        <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-lg)', borderLeft: '4px solid #8B5CF6', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '14px', backgroundColor: 'rgba(139, 92, 246, 0.1)', borderRadius: '12px', color: '#8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.775rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
              Última Publicación
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-primary)', lineHeight: '1.3' }}>
              {lastCommDate}
            </div>
            <div style={{ fontSize: '0.725rem', color: '#8B5CF6', fontWeight: '700', marginTop: '2px' }}>
              Monitoreo continuo
            </div>
          </div>
        </div>

      </div>

      {/* 2. Charts Section: 2-Column Side-by-Side Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '20px' }}>
        
        {/* Donut Chart with Clean Side Legend */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={20} style={{ color: 'var(--claro-red)' }} />
              Distribución por Categoría Comercial
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>
              {categoryData.length} líneas de negocio
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '20px', alignItems: 'center', flex: 1, minHeight: '260px' }}>
            <div style={{ width: '100%', height: '230px', position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    formatter={(val, name) => [`${val} comunicados (${((val / totalComms) * 100).toFixed(1)}%)`, name]}
                    contentStyle={{ borderRadius: '8px', border: '1px solid var(--border-color)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--text-primary)', lineHeight: '1' }}>{totalComms}</div>
                <div style={{ fontSize: '0.65rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Boletines</div>
              </div>
            </div>

            {/* Custom Side Legend with exact counts & colors */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto', paddingRight: '4px' }}>
              {categoryData.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '0.8rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, overflow: 'hidden' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: item.color, flexShrink: 0 }} />
                    <span style={{ fontWeight: '600', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.name}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, marginLeft: '8px' }}>
                    <span style={{ fontWeight: '800', color: 'var(--text-primary)' }}>{item.value}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', width: '36px', textAlign: 'right' }}>{item.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bar Chart (Monthly Volume) */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={20} style={{ color: 'var(--claro-red)' }} />
              Volumen Histórico Mensual
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>
              {dateData.length} períodos registrados
            </span>
          </div>

          <div style={{ height: '250px', flex: 1, minWidth: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dateData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" opacity={0.6} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                <RechartsTooltip 
                  cursor={{ fill: 'rgba(238, 28, 36, 0.04)' }}
                  formatter={(val) => [`${val} comunicados`, 'Volumen']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid var(--border-color)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="cantidad" fill="var(--claro-red)" radius={[6, 6, 0, 0]} name="Comunicados" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* 3. Table of Latest Processed Communications */}
      <div className="glass-panel" style={{ padding: '24px', minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
              Últimos Comunicados Indexados
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Listado de las publicaciones oficiales más recientes sincronizadas en la plataforma.
            </p>
          </div>

          <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--claro-red)', backgroundColor: 'var(--claro-red-light)', padding: '4px 12px', borderRadius: '99px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>Mostrando {latestComms.length} más recientes</span>
          </div>
        </div>

        <div style={{ overflowX: 'auto', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '2px solid var(--border-color)' }}>
              <tr>
                <th style={{ padding: '12px 16px', fontWeight: '700', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fecha</th>
                <th style={{ padding: '12px 16px', fontWeight: '700', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Versión</th>
                <th style={{ padding: '12px 16px', fontWeight: '700', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Categoría</th>
                <th style={{ padding: '12px 16px', fontWeight: '700', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', width: '55%' }}>Asunto / Título Oficial</th>
                <th style={{ padding: '12px 16px', fontWeight: '700', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Remitente / Canal</th>
              </tr>
            </thead>
            <tbody>
              {latestComms.map((comm, idx) => {
                const catColor = getCategoryColor(comm.category);
                const displaySubject = comm.subject || comm.title || 'Comunicado Oficial Claro';
                const senderDisplay = comm.senderName || comm.author || 'Info-Canales Claro';
                const isV2 = comm.isUpdate || comm.ancVariant || comm.version === '2.0';

                return (
                  <tr 
                    key={comm.id || idx} 
                    style={{ 
                      borderBottom: idx === latestComms.length - 1 ? 'none' : '1px solid var(--border-color)',
                      transition: 'background-color 0.15s ease'
                    }}
                    className="table-row-hover"
                  >
                    <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: catColor, flexShrink: 0 }} />
                        <span style={{ fontWeight: '600' }}>{comm.date}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                      <span style={{ 
                        backgroundColor: isV2 ? '#EFF6FF' : 'var(--bg-secondary)', 
                        color: isV2 ? '#2563EB' : 'var(--text-secondary)',
                        border: `1px solid ${isV2 ? '#BFDBFE' : 'var(--border-color)'}`,
                        padding: '3px 8px', 
                        borderRadius: '99px', 
                        fontSize: '0.7rem',
                        fontWeight: '800'
                      }}>
                        {isV2 ? `v2.0 (${comm.ancVariant || 'Mod'})` : 'v1.0'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                      <span style={{ 
                        backgroundColor: `${catColor}15`, 
                        color: catColor,
                        padding: '4px 10px', 
                        borderRadius: '99px', 
                        fontSize: '0.725rem',
                        fontWeight: '800',
                        textTransform: 'uppercase'
                      }}>
                        {comm.category || 'General'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '0.875rem', fontWeight: '700', color: 'var(--text-primary)', lineHeight: '1.4' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>{displaySubject}</span>
                        {comm.ancNum && (
                          <span style={{ fontSize: '0.675rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-muted)', padding: '1px 6px', borderRadius: '4px', flexShrink: 0 }}>
                            #{comm.ancNum}
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                      {senderDisplay}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
