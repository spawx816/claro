import React, { useState, useEffect } from 'react';
import { FileText, Search, Download, Printer, RefreshCw, Filter, DollarSign, Calendar, CheckCircle2, Send, ExternalLink, Sparkles, Building, FileSpreadsheet } from 'lucide-react';
import OfficialQuoteModal from './OfficialQuoteModal';
import { exportQuoteToExcel } from '../utils/exportQuoteToExcel';
import { parseAndGenerateHPBXFromText, calculateHPBXQuote } from '../utils/hpbxQuotationModel';

export default function QuotationRepo() {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProductFilter, setSelectedProductFilter] = useState('ALL');
  const [selectedQuoteModal, setSelectedQuoteModal] = useState(null);

  // Fetch quotes from PostgreSQL API
  const fetchQuotes = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/chat/quotes');
      if (res.ok) {
        const data = await res.json();
        setQuotes(data || []);
      }
    } catch (err) {
      console.error("Error fetching quotes from DB:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  // Filter quotes based on search term and product filter
  const filteredQuotes = quotes.filter(q => {
    const matchesSearch = (q.productName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (q.id || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProduct = selectedProductFilter === 'ALL' || (q.productId || '').toLowerCase().includes(selectedProductFilter.toLowerCase());
    return matchesSearch && matchesProduct;
  });

  // Calculate KPIs
  const totalCount = quotes.length;
  const totalMonthlyUSD = quotes.reduce((acc, q) => {
    if ((q.monthlyTotal || '').toUpperCase().includes('USD')) {
      const match = (q.monthlyTotal || '').replace(/,/g, '').match(/[\d.]+/);
      return acc + (match ? parseFloat(match[0]) : 0);
    }
    return acc;
  }, 0);

  const totalMonthlyDOP = quotes.reduce((acc, q) => {
    if (!(q.monthlyTotal || '').toUpperCase().includes('USD')) {
      const match = (q.monthlyTotal || '').replace(/,/g, '').match(/[\d.]+/);
      return acc + (match ? parseFloat(match[0]) : 0);
    }
    return acc;
  }, 0);

  const getFullQuoteObject = (q) => {
    if (!q) return null;
    if (q.quoteObj) return q.quoteObj;
    
    const isHpba = (q.productId || '').includes('hpbx') || (q.productName || '').toLowerCase().includes('hpbx');
    if (isHpba) {
      const parsed = parseAndGenerateHPBXFromText(`${q.productName} para ${q.quantity || 3} usuarios`);
      parsed.quote.customer.quoteNo = q.id || parsed.quote.customer.quoteNo;
      parsed.quote.customer.date = q.createdAt ? new Date(q.createdAt).toLocaleDateString('es-DO') : parsed.quote.customer.date;
      return parsed.quote;
    }
    
    const netMonthly = parseFloat((q.monthlyTotal || '').replace(/[^0-9.]/g, '')) || 0;
    const netSetup = parseFloat((q.setupFee || '').replace(/[^0-9.]/g, '')) || 0;

    return {
      type: 'CORPORATIVO',
      customer: {
        name: 'Cliente Corporativo Claro',
        quoteNo: q.id || 'COT-CLARO',
        date: q.createdAt ? new Date(q.createdAt).toLocaleDateString('es-DO') : new Date().toLocaleDateString('es-DO'),
        activeUsers: q.quantity || 1,
        ipPhones: q.quantity || 1,
        locations: 1,
        validity: '30 Días'
      },
      services: [
        {
          partNumber: q.productId || 'SERV-01',
          description: q.productName || 'Servicio Claro Negocios',
          price: parseFloat((q.unitPrice || '').replace(/[^0-9.]/g, '')) || netMonthly,
          qty: q.quantity || 1,
          subTotal: netMonthly,
          tax: netMonthly * 0.30,
          total: netMonthly * 1.30
        }
      ],
      equipmentRental: [],
      equipmentSale: [],
      installation: [
        {
          partNumber: 'INSHPM',
          description: 'Instalación y Configuración Base',
          price: netSetup,
          qty: 1,
          subTotal: netSetup,
          tax: netSetup * 0.18,
          total: netSetup * 1.18
        }
      ],
      summary: {
        totalServicesNet: netMonthly,
        totalServicesTax: netMonthly * 0.30,
        totalServices: netMonthly * 1.30,
        totalEqRentalNet: 0,
        totalEqRentalTax: 0,
        totalEqRental: 0,
        totalMonthlyNet: netMonthly,
        totalMonthlyTax: netMonthly * 0.30,
        totalMonthlyWithTax: netMonthly * 1.30,
        totalEqSaleNet: 0,
        totalEqSaleTax: 0,
        totalEqSale: 0,
        totalInstNet: netSetup,
        totalInstTax: netSetup * 0.18,
        totalInst: netSetup * 1.18,
        grandTotal: (netMonthly * 1.30) + (netSetup * 1.18)
      },
      salesRep: 'Brian Quiroz (Claro Negocios)'
    };
  };

  const handlePrintQuote = (quote) => {
    setSelectedQuoteModal(quote);
  };

  const handleDownloadExcel = (quote) => {
    const fullObj = getFullQuoteObject(quote);
    exportQuoteToExcel(fullObj);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header Banner */}
      <div className="glass-panel no-print" style={{ padding: '24px', backgroundColor: 'var(--bg-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <img src="/claro-logo.png" alt="Claro Logo" style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', boxShadow: '0 4px 12px rgba(238, 28, 36, 0.3)' }} />
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0, fontFamily: 'var(--font-display)' }}>
              Repositorio de Cotizaciones Corporativas
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, fontWeight: '500' }}>
              Historial centralizado y respaldado en PostgreSQL de propuestas comerciales oficiales de Claro Dominicana
            </p>
          </div>
        </div>

        <button 
          onClick={fetchQuotes} 
          className="btn btn-secondary" 
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', fontSize: '0.85rem' }}
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Actualizar Repositorio
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid-cols-3 no-print" style={{ gap: '16px' }}>
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', backgroundColor: 'var(--bg-secondary)' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--claro-red-light)', color: 'var(--claro-red)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileText size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Propuestas Generadas</span>
            <h3 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>{totalCount}</h3>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', backgroundColor: 'var(--bg-secondary)' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-md)', backgroundColor: '#E0F2FE', color: '#0284C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <DollarSign size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Volumen Mensual USD</span>
            <h3 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
              ${totalMonthlyUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
            </h3>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', backgroundColor: 'var(--bg-secondary)' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-md)', backgroundColor: '#D1FAE5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Volumen Mensual DOP</span>
            <h3 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
              ${totalMonthlyDOP.toLocaleString('es-DO', { minimumFractionDigits: 2 })} DOP
            </h3>
          </div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="glass-panel no-print" style={{ padding: '16px 20px', backgroundColor: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
          <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            className="form-input" 
            placeholder="Buscar por producto o código de cotización..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '40px', fontSize: '0.875rem' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={16} style={{ color: 'var(--text-muted)' }} />
          <select 
            className="form-input" 
            value={selectedProductFilter}
            onChange={(e) => setSelectedProductFilter(e.target.value)}
            style={{ fontSize: '0.85rem', padding: '8px 12px', width: 'auto' }}
          >
            <option value="ALL">Todos los Productos</option>
            <option value="hpbx">Centralita HPBX</option>
            <option value="cloud-server">Cloud Server</option>
            <option value="plan-movil">Planes Móviles 5G</option>
            <option value="internet-dedicado">Internet Dedicado</option>
          </select>
        </div>
      </div>

      {/* Quotations Grid */}
      {loading ? (
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 12px auto' }} />
          <span>Cargando cotizaciones desde PostgreSQL...</span>
        </div>
      ) : filteredQuotes.length === 0 ? (
        <div className="glass-panel" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <FileText size={48} style={{ color: 'var(--border-hover)', margin: '0 auto 16px auto', display: 'block' }} />
          <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>
            No se encontraron cotizaciones
          </h4>
          <p style={{ fontSize: '0.85rem' }}>
            Las cotizaciones formales que generes interactuando con **Clara** aparecerán guardadas aquí automáticamente.
          </p>
        </div>
      ) : (
        <div className="grid-cols-2 no-print" style={{ gap: '20px' }}>
          {filteredQuotes.map((quote) => (
            <div 
              key={quote.id} 
              className="glass-panel hover-lift"
              style={{ 
                padding: '0', 
                backgroundColor: 'var(--bg-secondary)', 
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {/* Card Top Banner */}
              <div style={{ 
                backgroundColor: 'var(--claro-red)', 
                color: '#FFFFFF', 
                padding: '12px 18px', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <img src="/claro-logo.png" alt="Claro" style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }} />
                  <span style={{ fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    COTIZACIÓN CLARO NEGOCIOS
                  </span>
                </div>
                <span style={{ fontSize: '0.7rem', backgroundColor: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontWeight: '600' }}>
                  {quote.id}
                </span>
              </div>

              {/* Card Main Info */}
              <div style={{ padding: '18px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                      {quote.productName}
                    </h3>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={13} /> {quote.createdAt ? new Date(quote.createdAt).toLocaleDateString('es-DO') : new Date().toLocaleDateString('es-DO')}
                    </span>
                    <span>•</span>
                    <span style={{ color: '#10B981', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <CheckCircle2 size={12} /> Validez: 30 Días
                    </span>
                  </div>

                  {/* Summary Breakdown */}
                  <div style={{ backgroundColor: 'var(--bg-primary)', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Cantidad / Licencias:</span>
                      <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{quote.quantity}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Precio Unitario:</span>
                      <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{quote.unitPrice}</span>
                    </div>
                    {quote.setupFee && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Costo Instalación:</span>
                        <span style={{ fontWeight: '600', color: '#10B981' }}>{quote.setupFee}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Total & Action Buttons */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginBottom: '14px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Subtotal Mensual:</span>
                    <span style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--claro-red)' }}>
                      {quote.monthlyTotal}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                    <button 
                      onClick={() => handleDownloadExcel(quote)} 
                      className="btn btn-secondary" 
                      style={{ fontSize: '0.75rem', padding: '6px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}
                      title="Descargar plantilla Excel (.xlsx)"
                    >
                      <FileSpreadsheet size={13} color="#10B981" /> Excel
                    </button>
                    <button 
                      onClick={() => setSelectedQuoteModal(quote)} 
                      className="btn btn-primary" 
                      style={{ fontSize: '0.75rem', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                      title="Ver e Imprimir plantilla oficial en PDF"
                    >
                      <Printer size={13} /> Plantilla Oficial / PDF
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Official Printable / Detail Quote Modal */}
      {selectedQuoteModal && (
        <OfficialQuoteModal 
          quote={getFullQuoteObject(selectedQuoteModal)} 
          onClose={() => setSelectedQuoteModal(null)} 
        />
      )}

    </div>
  );
}
