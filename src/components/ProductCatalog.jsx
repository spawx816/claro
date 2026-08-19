import React, { useState } from 'react';
import { 
  Search, Server, Phone, Smartphone, Globe, Shield, Tag, FileText, 
  ExternalLink, CheckCircle2, ShieldCheck, Database, HardDrive, 
  Video, Eye, Lock, Crosshair, GraduationCap, Users, LayoutGrid, 
  Mail, Palette, BarChart3, ShoppingBag, Bot, HeartPulse, 
  Activity, Wifi, GitBranch, Layers, Zap, Cloud, Network, 
  Receipt, Save, ShieldAlert, FileSearch, Sparkles
} from 'lucide-react';
import { productsData, CLARO_CLOUD_CATEGORIES } from '../data/claroProducts';

// Helper to get matching icon for each Claro Cloud product
function getProductIcon(product) {
  switch (product.id) {
    case 'hpbx': return Phone;
    case 'claro-cloud-empresarial': return Cloud;
    case 'azure': return Cloud;
    case 'amazon-web-services': return Server;
    case 'backup-empresarial': return Database;
    case 'almacenamiento-como-servicio': return HardDrive;
    case 'collocation': return Server;
    case 'claro-backup': return Save;
    case 'seguridad-negocios': return ShieldAlert;
    case 'videovigilancia': return Video;
    case 'ddos-protector': return ShieldCheck;
    case 'siem': return Eye;
    case 'spa-sdwan': return Network;
    case 'sase': return Lock;
    case 'pruebas-forenses': return FileSearch;
    case 'analisis-de-vulnerabilidad': return Crosshair;
    case 'capacitacion-concienciacion-seguridad': return GraduationCap;
    case 'claro-drive-negocio': return Database;
    case 'microsoft-365': return LayoutGrid;
    case 'google-workspace': return Mail;
    case 'pagina-web': return Globe;
    case 'diseno-pagina-web': return Palette;
    case 'facturacion-electronica-claro-cloud': return Receipt;
    case 'gestion-negocios-erp': return BarChart3;
    case 'punto-de-venta': return ShoppingBag;
    case 'bots-como-servicio': return Bot;
    case 'gestion-salud': return HeartPulse;
    case 'gestion-de-imagenes-medicas': return Activity;
    case 'comunicacion-unificada': return Video;
    case 'wi-fi-administrado': return Wifi;
    case 'servicios-profesionales-devops': return GitBranch;
    case 'servicios-profesionales-iaas': return Layers;
    case 'servicios-profesionales-power-platform': return Zap;
    default:
      if (product.category === 'Infraestructura') return Server;
      if (product.category === 'Seguridad') return Shield;
      if (product.category === 'Colaboración') return Users;
      if (product.category === 'Presencia Web') return Globe;
      if (product.category === 'Servicios Administrados') return Layers;
      return Zap;
  }
}

export default function ProductCatalog({ onSelectProductForQuote }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  const filteredProducts = productsData.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          product.shortDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (product.badge && product.badge.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'Todos' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '40px' }}>
      {/* Header section */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ 
              backgroundColor: 'var(--claro-red-light)', 
              color: 'var(--claro-red)', 
              padding: '4px 10px', 
              borderRadius: '20px', 
              fontSize: '0.75rem', 
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <Sparkles size={12} /> Catálogo Oficial Claro Cloud Dominicana
            </span>
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '8px', fontFamily: 'var(--font-display)' }}>
            Soluciones y Productos Claro Cloud
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '800px', fontSize: '0.95rem', lineHeight: '1.5' }}>
            Portafolio oficial y actualizado extraído de <a href="https://www.clarocloud.com.do/portal/cloud-do/cld/productos/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--claro-red)', fontWeight: '600', textDecoration: 'underline' }}>clarocloud.com.do</a>. Soluciones de Infraestructura, Ciberseguridad, Colaboración y Servicios Administrados para empresas en República Dominicana.
          </p>
        </div>

        <a 
          href="https://www.clarocloud.com.do/portal/cloud-do/cld/productos/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="btn btn-secondary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', fontSize: '0.85rem' }}
        >
          <ExternalLink size={15} /> Visitar Portal Claro Cloud
        </a>
      </div>

      {/* Filter and Search controls */}
      <div className="glass-panel" style={{ padding: '16px', marginBottom: '24px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {CLARO_CLOUD_CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`btn ${selectedCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '6px 14px', fontSize: '0.85rem', fontWeight: selectedCategory === cat ? '700' : '500' }}
            >
              {cat}
              {cat === 'Todos' && <span style={{ opacity: 0.7, marginLeft: '4px' }}>({productsData.length})</span>}
            </button>
          ))}
        </div>
        
        <div style={{ position: 'relative', width: '320px', maxWidth: '100%' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Buscar por producto, servicio o DGII..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '40px', paddingRight: '16px' }}
          />
          <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid-cols-2" style={{ gap: '20px' }}>
        {filteredProducts.map(product => {
          const IconComponent = getProductIcon(product);
          return (
            <div key={product.id} className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', position: 'relative', border: '1px solid var(--border-color)' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ 
                      width: '52px', 
                      height: '52px', 
                      minWidth: '52px',
                      backgroundColor: 'var(--claro-red-light)', 
                      borderRadius: 'var(--radius-md)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      color: 'var(--claro-red)' 
                    }}>
                      <IconComponent size={26} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ 
                          fontSize: '0.72rem', 
                          fontWeight: '700', 
                          textTransform: 'uppercase', 
                          color: 'var(--claro-red)', 
                          letterSpacing: '0.05em' 
                        }}>
                          {product.category}
                        </span>
                        {product.badge && (
                          <span style={{
                            fontSize: '0.68rem',
                            fontWeight: '600',
                            backgroundColor: 'var(--bg-tertiary)',
                            padding: '2px 8px',
                            borderRadius: '10px',
                            color: 'var(--text-secondary)'
                          }}>
                            {product.badge}
                          </span>
                        )}
                      </div>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-primary)', marginTop: '3px' }}>
                        {product.name}
                      </h3>
                    </div>
                  </div>
                  
                  <div style={{ 
                    padding: '6px 12px', 
                    backgroundColor: 'var(--bg-tertiary)', 
                    borderRadius: 'var(--radius-sm)', 
                    fontSize: '0.825rem', 
                    fontWeight: '700',
                    color: 'var(--text-primary)',
                    whiteSpace: 'nowrap'
                  }}>
                    {product.price}
                  </div>
                </div>

                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px', lineHeight: '1.6' }}>
                  {product.shortDescription}
                </p>

                <div style={{ backgroundColor: 'var(--bg-primary)', padding: '14px', borderRadius: 'var(--radius-md)', marginBottom: '20px' }}>
                  <h4 style={{ fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Tag size={12} /> Características Destacadas:
                  </h4>
                  <ul style={{ listStyleType: 'none', display: 'flex', flexDirection: 'column', gap: '7px' }}>
                    {product.details.features.map((feat, idx) => (
                      <li key={idx} style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                        <CheckCircle2 size={14} style={{ color: 'var(--claro-red)', minWidth: '14px', marginTop: '2px' }} />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: 'auto', flexWrap: 'wrap' }}>
                <button 
                  onClick={() => onSelectProductForQuote(product)}
                  className="btn btn-primary"
                  style={{ flex: 1, minWidth: '180px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <FileText size={16} /> Solicitar Cotización
                </button>
                {product.portalUrl && (
                  <a
                    href={product.portalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary"
                    style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '0 14px' }}
                    title="Ver en clarocloud.com.do"
                  >
                    <ExternalLink size={15} />
                  </a>
                )}
              </div>
            </div>
          );
        })}

        {filteredProducts.length === 0 && (
          <div className="glass-panel" style={{ gridColumn: '1 / -1', padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>No se encontraron productos que coincidan con la búsqueda.</p>
            <button className="btn btn-secondary" onClick={() => { setSearchTerm(''); setSelectedCategory('Todos'); }} style={{ marginTop: '16px' }}>
              Limpiar filtros
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
