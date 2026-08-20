import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileText, Search, Download, Printer, RefreshCw, Filter, DollarSign, 
  Calendar, CheckCircle2, Building, FileSpreadsheet, Folder, Trash2, 
  Users, ChevronDown, ChevronRight, ArrowLeft, TrendingUp, Sparkles,
  Layers, Package, Check, X, AlertCircle
} from 'lucide-react';
import OfficialQuoteModal from './OfficialQuoteModal';
import { exportQuoteToExcel } from '../utils/exportQuoteToExcel';
import { parseAndGenerateHPBXFromText } from '../utils/hpbxQuotationModel';

export default function QuotationRepo() {
  const [quotes, setQuotes] = useState([]);
  const [clientFolders, setClientFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProductFilter, setSelectedProductFilter] = useState('ALL');
  
  // Expanded client rows (Set of client names)
  const [expandedClients, setExpandedClients] = useState(new Set());
  
  // View full quote document inline (replaces table cleanly without popup distortion)
  const [viewingQuoteDoc, setViewingQuoteDoc] = useState(null);

  // Inline confirmation state for wiping all data
  const [confirmClearAll, setConfirmClearAll] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  // Inline confirmation state for deleting a single client
  const [confirmDeleteClient, setConfirmDeleteClient] = useState(null);

  // Fetch data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [resQuotes, resFolders] = await Promise.all([
        fetch('/api/chat/quotes'),
        fetch('/api/clients/folders')
      ]);

      if (resQuotes.ok) {
        const dataQuotes = await resQuotes.json();
        setQuotes(Array.isArray(dataQuotes) ? dataQuotes : []);
      }
      if (resFolders.ok) {
        const dataFolders = await resFolders.json();
        setClientFolders(Array.isArray(dataFolders) ? dataFolders : []);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Toggle client row expansion
  const toggleExpand = (clientName) => {
    setExpandedClients(prev => {
      const next = new Set(prev);
      if (next.has(clientName)) {
        next.delete(clientName);
      } else {
        next.add(clientName);
      }
      return next;
    });
  };

  // Expand or collapse all
  const toggleExpandAll = () => {
    if (expandedClients.size === clientFolders.length) {
      setExpandedClients(new Set());
    } else {
      setExpandedClients(new Set(clientFolders.map(c => c.clientName)));
    }
  };

  // Handle wiping all quotes
  const handleClearAllQuotes = async () => {
    setIsClearing(true);
    try {
      const res = await fetch('/api/chat/quotes', { method: 'DELETE' });
      if (res.ok) {
        setQuotes([]);
        setClientFolders([]);
        setExpandedClients(new Set());
        setConfirmClearAll(false);
      }
    } catch (err) {
      console.error("Error clearing quotes:", err);
    } finally {
      setIsClearing(false);
    }
  };

  // Handle deleting an entire client folder
  const handleDeleteClientFolder = async (clientName) => {
    try {
      const res = await fetch(`/api/clients/folders/${encodeURIComponent(clientName)}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchData();
        setConfirmDeleteClient(null);
      }
    } catch (err) {
      console.error("Error deleting client folder:", err);
    }
  };

  // Handle deleting a single quote
  const handleDeleteQuote = async (quoteId) => {
    try {
      const res = await fetch(`/api/chat/quotes/${quoteId}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchData();
      }
    } catch (err) {
      console.error("Error deleting quote:", err);
    }
  };

  // Helper to parse or construct full Claro Quote Object
  const getFullQuoteObject = (q) => {
    if (!q) return null;
    if (q.quoteObj) return q.quoteObj;
    
    const isHpba = (q.productId || '').includes('hpbx') || (q.productName || '').toLowerCase().includes('hpbx');
    if (isHpba) {
      const parsed = parseAndGenerateHPBXFromText(`${q.productName} para ${q.quantity || 3} usuarios`);
      parsed.quote.customer.name = q.clientName || parsed.quote.customer.name;
      parsed.quote.customer.quoteNo = q.id || parsed.quote.customer.quoteNo;
      parsed.quote.customer.date = q.createdAt ? new Date(q.createdAt).toLocaleDateString('es-DO') : parsed.quote.customer.date;
      return parsed.quote;
    }
    
    const netMonthly = parseFloat((q.monthlyTotal || '').replace(/[^0-9.]/g, '')) || 0;
    const netSetup = parseFloat((q.setupFee || '').replace(/[^0-9.]/g, '')) || 0;

    return {
      type: 'CORPORATIVO',
      customer: {
        name: q.clientName || 'Cliente Corporativo Claro',
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

  const handleDownloadExcel = (quote) => {
    const fullObj = getFullQuoteObject(quote);
    exportQuoteToExcel(fullObj);
  };

  // Filtered clients list
  const filteredClients = useMemo(() => {
    return clientFolders.filter(c => {
      const matchSearch = c.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.quotes.some(q => (q.productName || '').toLowerCase().includes(searchTerm.toLowerCase()) || (q.id || '').toLowerCase().includes(searchTerm.toLowerCase()));
      const matchProduct = selectedProductFilter === 'ALL' || c.quotes.some(q => (q.productId || '').toLowerCase().includes(selectedProductFilter.toLowerCase()));
      return matchSearch && matchProduct;
    });
  }, [clientFolders, searchTerm, selectedProductFilter]);

  // KPI Calculations
  const totalCount = quotes.length;
  const totalClientsCount = clientFolders.length;
  
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

  const getInitials = (name) => {
    if (!name) return 'CL';
    const words = name.trim().split(' ');
    if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  // If user is previewing a quote, render the in-page clean document view (No modal distortion!)
  if (viewingQuoteDoc) {
    const fullQuote = getFullQuoteObject(viewingQuoteDoc);
    return (
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Top bar */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          padding: '16px 20px', 
          backgroundColor: 'var(--bg-secondary)', 
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)',
          flexWrap: 'wrap',
          gap: '12px'
        }} className="no-print">
          <button 
            onClick={() => setViewingQuoteDoc(null)}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}
          >
            <ArrowLeft size={16} /> Volver a Cotizaciones
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button 
              onClick={() => handleDownloadExcel(viewingQuoteDoc)}
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
            >
              <FileSpreadsheet size={15} color="#10B981" /> Descargar Excel
            </button>
            <button 
              onClick={() => window.print()}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
            >
              <Printer size={15} /> Imprimir / Guardar PDF
            </button>
          </div>
        </div>

        {/* Official Printable Sheet Container */}
        <div style={{ maxWidth: '850px', margin: '0 auto', width: '100%' }}>
          <OfficialQuoteModal quote={fullQuote} isEmbedded={true} onClose={() => setViewingQuoteDoc(null)} />
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      
      {/* 4 Minimal Metric Cards (Stripe/Linear Style) */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', 
        gap: '12px' 
      }} className="no-print">
        
        {/* Metric 1 */}
        <div style={{ 
          padding: '14px 18px', 
          backgroundColor: 'var(--bg-secondary)', 
          borderRadius: 'var(--radius-md)', 
          border: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Clientes
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-primary)', marginTop: '2px' }}>
              {totalClientsCount}
            </div>
          </div>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Building size={18} />
          </div>
        </div>

        {/* Metric 2 */}
        <div style={{ 
          padding: '14px 18px', 
          backgroundColor: 'var(--bg-secondary)', 
          borderRadius: 'var(--radius-md)', 
          border: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Propuestas
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-primary)', marginTop: '2px' }}>
              {totalCount}
            </div>
          </div>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'var(--claro-red-light)', color: 'var(--claro-red)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileText size={18} />
          </div>
        </div>

        {/* Metric 3 */}
        <div style={{ 
          padding: '14px 18px', 
          backgroundColor: 'var(--bg-secondary)', 
          borderRadius: 'var(--radius-md)', 
          border: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Renta Mensual DOP
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-primary)', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              RD$ {totalMonthlyDOP.toLocaleString('es-DO', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#D1FAE5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <TrendingUp size={18} />
          </div>
        </div>

        {/* Metric 4 */}
        <div style={{ 
          padding: '14px 18px', 
          backgroundColor: 'var(--bg-secondary)', 
          borderRadius: 'var(--radius-md)', 
          border: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Renta Mensual USD
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-primary)', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              ${totalMonthlyUSD.toFixed(2)} USD
            </div>
          </div>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#E0F2FE', color: '#0284C7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <DollarSign size={18} />
          </div>
        </div>

      </div>

      {/* Action & Filter Toolbar (Stripe/Linear Style) */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        flexWrap: 'wrap', 
        gap: '12px',
        padding: '12px 16px',
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-color)'
      }} className="no-print">
        
        {/* Search & Filter pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '280px' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '320px' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              className="form-input" 
              placeholder="Filtrar por cliente, producto o ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '34px', fontSize: '0.825rem', height: '34px' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '4px' }}>
            {['ALL', 'hpbx', 'cloud', 'movil'].map(type => (
              <button 
                key={type}
                onClick={() => setSelectedProductFilter(type)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid',
                  borderColor: selectedProductFilter === type ? 'var(--claro-red)' : 'var(--border-color)',
                  backgroundColor: selectedProductFilter === type ? 'var(--claro-red-light)' : 'transparent',
                  color: selectedProductFilter === type ? 'var(--claro-red)' : 'var(--text-secondary)',
                  fontWeight: selectedProductFilter === type ? '700' : '500',
                  fontSize: '0.75rem',
                  cursor: 'pointer'
                }}
              >
                {type === 'ALL' ? 'Todos' : type === 'hpbx' ? 'HPBX' : type === 'cloud' ? 'Cloud' : 'Móviles'}
              </button>
            ))}
          </div>
        </div>

        {/* Global Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {clientFolders.length > 0 && (
            <button 
              onClick={toggleExpandAll}
              className="btn btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.75rem' }}
            >
              {expandedClients.size === clientFolders.length ? 'Colapsar Filas' : 'Expandir Filas'}
            </button>
          )}

          <button 
            onClick={fetchData}
            className="btn btn-secondary"
            style={{ padding: '6px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
            title="Recargar datos"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Actualizar
          </button>

          {quotes.length > 0 && !confirmClearAll && (
            <button 
              onClick={() => setConfirmClearAll(true)}
              className="btn"
              style={{ padding: '6px 12px', fontSize: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.08)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' }}
            >
              <Trash2 size={13} /> Vaciar Todo
            </button>
          )}

          {confirmClearAll && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '4px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid #ef4444' }}>
              <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: '700' }}>¿Confirmar vaciado?</span>
              <button 
                onClick={handleClearAllQuotes}
                disabled={isClearing}
                style={{ padding: '2px 8px', fontSize: '0.7rem', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '700' }}
              >
                {isClearing ? '...' : 'Sí'}
              </button>
              <button 
                onClick={() => setConfirmClearAll(false)}
                style={{ padding: '2px 6px', fontSize: '0.7rem', backgroundColor: 'transparent', color: 'var(--text-secondary)', border: 'none', cursor: 'pointer' }}
              >
                No
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Main Stripe/Linear Interactive Table */}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 10px auto', color: 'var(--claro-red)' }} />
          <div style={{ fontSize: '0.875rem' }}>Cargando cotizaciones...</div>
        </div>
      ) : clientFolders.length === 0 ? (
        /* Empty State */
        <div style={{ padding: '50px 20px', textAlign: 'center', color: 'var(--text-muted)', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border-color)' }}>
          <Building size={32} style={{ margin: '0 auto 12px auto', color: 'var(--text-muted)', opacity: 0.5 }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>
            No hay cotizaciones registradas
          </h3>
          <p style={{ fontSize: '0.825rem', maxWidth: '420px', margin: '0 auto' }}>
            Solicita una cotización a <strong>Clara</strong> o en el catálogo de productos para crear un cliente y sus propuestas automáticamente.
          </p>
        </div>
      ) : (
        <div style={{ 
          backgroundColor: 'var(--bg-secondary)', 
          borderRadius: 'var(--radius-md)', 
          border: '1px solid var(--border-color)', 
          overflow: 'hidden' 
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.825rem' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-primary)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.04em' }}>
                <th style={{ width: '40px', padding: '12px 14px' }}></th>
                <th style={{ padding: '12px 14px' }}>Cliente / Empresa</th>
                <th style={{ padding: '12px 14px' }}>Solución Principal</th>
                <th style={{ padding: '12px 14px', textAlign: 'center' }}>Propuestas</th>
                <th style={{ padding: '12px 14px' }}>Renta Mensual</th>
                <th style={{ padding: '12px 14px' }}>Instalación</th>
                <th style={{ padding: '12px 14px' }}>Fecha</th>
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map((client) => {
                const isExpanded = expandedClients.has(client.clientName);
                const primaryQuote = client.quotes[0] || {};
                const isHpba = (primaryQuote.productId || '').includes('hpbx') || (primaryQuote.productName || '').toLowerCase().includes('hpbx');
                
                return (
                  <React.Fragment key={client.clientName}>
                    {/* Main Client Row */}
                    <tr 
                      style={{ 
                        borderBottom: isExpanded ? 'none' : '1px solid var(--border-color)',
                        backgroundColor: isExpanded ? 'var(--bg-tertiary)' : 'transparent',
                        transition: 'background-color var(--transition-fast)'
                      }}
                      className="table-row-hover"
                    >
                      {/* Expand Chevron Toggle */}
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        <button 
                          onClick={() => toggleExpand(client.clientName)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          title={isExpanded ? "Colapsar detalles" : "Expandir cotizaciones de este cliente"}
                        >
                          {isExpanded ? <ChevronDown size={16} color="var(--claro-red)" /> : <ChevronRight size={16} />}
                        </button>
                      </td>

                      {/* Client Name + Folder */}
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ 
                            width: '32px', 
                            height: '32px', 
                            borderRadius: '6px', 
                            backgroundColor: '#FEF3C7', 
                            color: '#D97706', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            fontWeight: '800',
                            fontSize: '0.75rem',
                            flexShrink: 0
                          }}>
                            {getInitials(client.clientName)}
                          </div>
                          <div>
                            <div style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                              {client.clientName}
                            </div>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                              📁 {client.folderPath}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Main Solution */}
                      <td style={{ padding: '12px 14px' }}>
                        <span className="badge" style={{ 
                          backgroundColor: isHpba ? 'rgba(238, 28, 36, 0.08)' : 'rgba(2, 132, 199, 0.08)', 
                          color: isHpba ? 'var(--claro-red)' : '#0284C7',
                          fontWeight: '600',
                          fontSize: '0.725rem'
                        }}>
                          {primaryQuote.productName || 'Hosted PBX Claro'}
                        </span>
                      </td>

                      {/* Proposal Count */}
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        <span style={{ 
                          padding: '2px 8px', 
                          borderRadius: '12px', 
                          backgroundColor: 'var(--bg-primary)', 
                          border: '1px solid var(--border-color)', 
                          fontSize: '0.75rem', 
                          fontWeight: '700', 
                          color: 'var(--text-primary)' 
                        }}>
                          {client.totalQuotes}
                        </span>
                      </td>

                      {/* Monthly Total */}
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontWeight: '800', color: 'var(--claro-red)', fontSize: '0.9rem' }}>
                          {client.totalMonthlyDOP > 0 ? `RD$ ${client.totalMonthlyDOP.toLocaleString('es-DO', { minimumFractionDigits: 2 })}` : `$ ${client.totalMonthlyUSD.toFixed(2)} USD`}
                        </div>
                        <span style={{ fontSize: '0.675rem', color: 'var(--text-muted)' }}>con impuestos</span>
                      </td>

                      {/* Setup Fee */}
                      <td style={{ padding: '12px 14px', color: '#10B981', fontWeight: '600', fontSize: '0.8rem' }}>
                        {primaryQuote.setupFee || 'N/A'}
                      </td>

                      {/* Date */}
                      <td style={{ padding: '12px 14px', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                        {client.lastDate ? new Date(client.lastDate).toLocaleDateString('es-DO') : 'Reciente'}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                          <button 
                            onClick={() => toggleExpand(client.clientName)}
                            className="btn btn-secondary" 
                            style={{ padding: '4px 8px', fontSize: '0.725rem' }}
                            title="Ver desglose de cotizaciones"
                          >
                            {isExpanded ? 'Ocultar' : 'Ver Propuestas'}
                          </button>

                          <button 
                            onClick={() => handleDownloadExcel(primaryQuote)} 
                            className="btn btn-secondary" 
                            style={{ padding: '4px 8px', fontSize: '0.725rem' }}
                            title="Descargar Excel (.xlsx)"
                          >
                            <FileSpreadsheet size={13} color="#10B981" /> Excel
                          </button>

                          <button 
                            onClick={() => setViewingQuoteDoc(primaryQuote)} 
                            className="btn btn-primary" 
                            style={{ padding: '4px 10px', fontSize: '0.725rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                            title="Ver plantilla oficial / Imprimir PDF"
                          >
                            <Printer size={13} /> PDF
                          </button>

                          {confirmDeleteClient === client.clientName ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                              <span style={{ fontSize: '0.7rem', color: '#ef4444' }}>¿Borrar?</span>
                              <button 
                                onClick={() => handleDeleteClientFolder(client.clientName)}
                                style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '3px', fontSize: '0.65rem', padding: '1px 5px', cursor: 'pointer' }}
                              >
                                Sí
                              </button>
                              <button 
                                onClick={() => setConfirmDeleteClient(null)}
                                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '0.65rem', cursor: 'pointer' }}
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <button 
                              onClick={() => setConfirmDeleteClient(client.clientName)}
                              className="btn btn-secondary" 
                              style={{ padding: '4px 6px', color: '#ef4444' }}
                              title="Eliminar cliente y sus cotizaciones"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* Expandable Sub-Table (Stripe/Linear Nested Rows) */}
                    {isExpanded && (
                      <tr style={{ backgroundColor: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-color)' }}>
                        <td colSpan={8} style={{ padding: '0 0 16px 54px' }}>
                          <div style={{ 
                            backgroundColor: 'var(--bg-secondary)', 
                            borderRadius: 'var(--radius-sm)', 
                            border: '1px solid var(--border-color)', 
                            marginRight: '14px',
                            overflow: 'hidden'
                          }}>
                            <div style={{ 
                              padding: '8px 14px', 
                              backgroundColor: 'var(--bg-primary)', 
                              borderBottom: '1px solid var(--border-color)',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}>
                              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)' }}>
                                Propuestas individuales de {client.clientName} ({client.quotes.length})
                              </span>
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                Total acumulado: <strong>RD$ {client.totalMonthlyDOP.toLocaleString('es-DO', { minimumFractionDigits: 2 })} / mes</strong>
                              </span>
                            </div>

                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.775rem' }}>
                              <thead>
                                <tr style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)' }}>
                                  <th style={{ padding: '8px 12px' }}>Código ID</th>
                                  <th style={{ padding: '8px 12px' }}>Producto / Descripción</th>
                                  <th style={{ padding: '8px 12px', textAlign: 'center' }}>Estaciones</th>
                                  <th style={{ padding: '8px 12px' }}>Precio Unitario</th>
                                  <th style={{ padding: '8px 12px' }}>Renta Mensual</th>
                                  <th style={{ padding: '8px 12px' }}>Instalación</th>
                                  <th style={{ padding: '8px 12px', textAlign: 'right' }}>Acciones</th>
                                </tr>
                              </thead>
                              <tbody>
                                {client.quotes.map((quote) => (
                                  <tr key={quote.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '8px 12px', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                                      {quote.id}
                                    </td>
                                    <td style={{ padding: '8px 12px', fontWeight: '600', color: 'var(--text-primary)' }}>
                                      {quote.productName}
                                    </td>
                                    <td style={{ padding: '8px 12px', textAlign: 'center', fontWeight: '700' }}>
                                      {quote.quantity}
                                    </td>
                                    <td style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>
                                      {quote.unitPrice}
                                    </td>
                                    <td style={{ padding: '8px 12px', fontWeight: '700', color: 'var(--claro-red)' }}>
                                      {quote.monthlyTotal}
                                    </td>
                                    <td style={{ padding: '8px 12px', color: '#10B981' }}>
                                      {quote.setupFee || 'N/A'}
                                    </td>
                                    <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                                        <button 
                                          onClick={() => handleDownloadExcel(quote)}
                                          className="btn btn-secondary"
                                          style={{ padding: '3px 6px', fontSize: '0.7rem' }}
                                          title="Descargar Excel"
                                        >
                                          <FileSpreadsheet size={12} color="#10B981" />
                                        </button>
                                        <button 
                                          onClick={() => setViewingQuoteDoc(quote)}
                                          className="btn btn-primary"
                                          style={{ padding: '3px 8px', fontSize: '0.7rem' }}
                                          title="Ver PDF Oficial"
                                        >
                                          <Printer size={12} />
                                        </button>
                                        <button 
                                          onClick={() => handleDeleteQuote(quote.id)}
                                          className="btn btn-secondary"
                                          style={{ padding: '3px 6px', color: '#ef4444' }}
                                          title="Eliminar esta cotización"
                                        >
                                          <Trash2 size={12} />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}



