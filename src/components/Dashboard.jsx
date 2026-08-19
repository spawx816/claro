import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { Mail, TrendingUp, AlertCircle, FileText } from 'lucide-react';

export default function Dashboard({ communications }) {
  // 1. KPI Calculations
  const totalComms = communications.length;
  
  const lastCommDate = communications.length > 0 
    ? new Date(Math.max(...communications.map(c => new Date(c.date).getTime())))
    : null;

  // 2. Data for Pie Chart (Category Distribution)
  const categoryData = useMemo(() => {
    const counts = {};
    communications.forEach(comm => {
      const cat = comm.category || 'Sin Categoría';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return Object.keys(counts).map(key => ({
      name: key,
      value: counts[key]
    })).sort((a, b) => b.value - a.value);
  }, [communications]);

  const COLORS = ['#2563EB', '#10B981', '#EF4444', '#D97706', '#8B5CF6', '#64748B'];

  // 3. Data for Bar Chart (Communications by Date)
  const dateData = useMemo(() => {
    const counts = {};
    communications.forEach(comm => {
      // Group by YYYY-MM
      const dateObj = new Date(comm.date);
      const monthYear = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`;
      counts[monthYear] = (counts[monthYear] || 0) + 1;
    });
    
    // Sort chronological
    return Object.keys(counts).sort().map(key => ({
      date: key,
      cantidad: counts[key]
    }));
  }, [communications]);

  return (
    <div className="animate-fade-in" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      <div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: '700', fontFamily: 'var(--font-display)' }}>Dashboard Analítico</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Métricas e indicadores en tiempo real de los comunicados procesados.</p>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', backgroundColor: 'var(--claro-red-light)', borderRadius: '12px', color: 'var(--claro-red)' }}>
            <Mail size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Total Comunicados</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{totalComms}</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', color: '#10B981' }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Categorías Activas</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{categoryData.length}</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', backgroundColor: 'rgba(37, 99, 235, 0.1)', borderRadius: '12px', color: '#2563EB' }}>
            <AlertCircle size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Último Recibido</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
              {lastCommDate ? lastCommDate.toLocaleDateString('es-DO') : 'N/A'}
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
        
        {/* Pie Chart */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={18} color="var(--claro-red)" />
            Distribución por Categoría
          </h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip formatter={(value) => [`${value} comunicados`, 'Cantidad']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={18} color="var(--claro-red)" />
            Volumen Histórico Mensual
          </h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dateData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                <XAxis dataKey="date" tick={{fontSize: 12, fill: 'var(--text-secondary)'}} />
                <YAxis allowDecimals={false} tick={{fontSize: 12, fill: 'var(--text-secondary)'}} />
                <RechartsTooltip 
                  cursor={{fill: 'rgba(238, 28, 36, 0.05)'}}
                  contentStyle={{borderRadius: '8px', border: '1px solid var(--border-color)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
                />
                <Bar dataKey="cantidad" fill="var(--claro-red)" radius={[4, 4, 0, 0]} name="Comunicados" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Latest Communications Table */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '20px', fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>Últimos 5 Comunicados Procesados</h3>
        <div style={{ overflowX: 'auto', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', whiteSpace: 'nowrap' }}>
            <thead style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '2px solid var(--border-color)' }}>
              <tr>
                <th style={{ padding: '16px', fontWeight: '600', color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fecha</th>
                <th style={{ padding: '16px', fontWeight: '600', color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Categoría</th>
                <th style={{ padding: '16px', fontWeight: '600', color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', width: '100%' }}>Asunto / Título</th>
                <th style={{ padding: '16px', fontWeight: '600', color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Autor</th>
              </tr>
            </thead>
            <tbody>
              {communications.slice(0, 5).map((comm, idx) => {
                const authorName = (comm.author || 'Claro').split('@')[0].replace(/[._]/g, ' ');
                const catColor = comm.category === 'Cloud' ? '#2563EB' : 
                                 comm.category === 'Móvil' ? '#10B981' : 
                                 comm.category === 'Telefonía IP' ? '#D97706' : 
                                 comm.category === 'Seguridad' ? '#EF4444' : 
                                 comm.category === 'Conectividad' ? '#8B5CF6' : 'var(--text-secondary)';
                
                return (
                  <tr key={idx} style={{ 
                    borderBottom: idx === 4 ? 'none' : '1px solid var(--border-color)',
                    transition: 'background-color 0.2s',
                    ':hover': { backgroundColor: 'var(--bg-secondary)' }
                  }}
                  className="table-row-hover"
                  >
                    <td style={{ padding: '16px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: catColor }}></div>
                        {comm.date}
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ 
                        backgroundColor: `${catColor}15`, 
                        color: catColor,
                        padding: '6px 12px', 
                        borderRadius: 'var(--radius-full)', 
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        textTransform: 'uppercase'
                      }}>
                        {comm.category}
                      </span>
                    </td>
                    <td style={{ padding: '16px', fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-primary)', whiteSpace: 'normal', minWidth: '300px' }}>
                      {comm.title}
                    </td>
                    <td style={{ padding: '16px', fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                      {authorName}
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
