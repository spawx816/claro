import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileText, Search, Download, Printer, RefreshCw, Filter, DollarSign, 
  Calendar, CheckCircle2, Send, ExternalLink, Sparkles, Building, 
  FileSpreadsheet, Folder, FolderOpen, Trash2, Users, AlertTriangle, 
  ChevronRight, ArrowLeft, Eye, ShieldCheck, Plus, Package
} from 'lucide-react';
import OfficialQuoteModal from './OfficialQuoteModal';
import { exportQuoteToExcel } from '../utils/exportQuoteToExcel';
import { parseAndGenerateHPBXFromText, calculateHPBXQuote } from '../utils/hpbxQuotationModel';

export default function QuotationRepo() {
  const [quotes, setQuotes] = useState([]);
  const [clientFolders, setClientFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProductFilter, setSelectedProductFilter] = useState('ALL');
  const [selectedQuoteModal, setSelectedQuoteModal] = useState(null);
  
  // Navigation & View Mode
  const [activeTab, setActiveTab] = useState('folders'); // 'folders' | 'all-quotes'
  const [openedClientFolder, setOpenedClientFolder] = useState(null); // clientName or null
  
  // Clear Confirmation Modal
  const [showClearModal, setShowClearModal] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [deleteTargetQuote, setDeleteTargetQuote] = useState(null);

  // Fetch quotes and client folders from backend API
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
      console.error("Error fetching data from API:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle wiping all quotes
  const handleClearAllQuotes = async () => {
    setIsClearing(true);
    try {
      const res = await fetch('/api/chat/quotes', { method: 'DELETE' });
      if (res.ok) {
        setQuotes([]);
        setClientFolders([]);
        setOpenedClientFolder(null);
        setShowClearModal(false);
      }
    } catch (err) {
      console.error("Error clearing quotes:", err);
    } finally {
      setIsClearing(false);
    }
  };

  // Handle deleting a single quote
  const handleDeleteQuote = async (quoteId) => {
    try {
      const res = await fetch(`/api/chat/quotes/${quoteId}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchData();
        setDeleteTargetQuote(null);
      }
    } catch (err) {
      console.error("Error deleting quote:", err);
    }
  };

  // Filtered quotes
  const filteredQuotes = useMemo(() => {
    return quotes.filter(q => {
      const client = q.clientName || q.quoteObj?.customer?.name || '';
      const matchesSearch = (q.productName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (q.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                            client.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesProduct = selectedProductFilter === 'ALL' || (q.productId || '').toLowerCase().includes(selectedProductFilter.toLowerCase());
      return matchesSearch && matchesProduct;
    });
  }, [quotes, searchTerm, selectedProductFilter]);

  // Filtered client folders
  const filteredFolders = useMemo(() => {
    return clientFolders.filter(f => {
      return f.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
             f.quotes.some(q => (q.productName || '').toLowerCase().includes(searchTerm.toLowerCase()));
    });
  }, [clientFolders, searchTerm]);

  // Selected client folder object
  const activeFolderData = useMemo(() => {
    if (!openedClientFolder) return null;
    return clientFolders.find(f => f.clientName.toLowerCase() === openedClientFolder.toLowerCase()) || null;
  }, [clientFolders, openedClientFolder]);

  // Calculate KPIs
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

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header Banner */}
      <div className="glass-panel no-print" style={{ padding: '24px', backgroundColor: 'var(--bg-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <img src="/claro-logo.png" alt="Claro Logo" style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', boxShadow: '0 4px 12px rgba(238, 28, 36, 0.3)' }} />
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0, fontFamily: 'var(--font-display)' }}>
              Expedientes de Clientes y Cotizaciones
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, fontWeight: '500' }}>
              Gestión automatizada de carpetas por cliente con propuestas comerciales y documentos en PostgreSQL
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button 
            onClick={fetchData} 
            className="btn btn-secondary" 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', fontSize: '0.85rem' }}
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Actualizar
          </button>

          {quotes.length > 0 && (
            <button 
              onClick={() => setShowClearModal(true)} 
              className="btn" 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                padding: '8px 16px', 
                fontSize: '0.85rem', 
                backgroundColor: 'rgba(239, 68, 68, 0.15)', 
                color: '#ef4444', 
                border: '1px solid rgba(239, 68, 68, 0.3)' 
              }}
            >
              <Trash2 size={16} /> Vaciar Repositorio
            </button>
          )}
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid-cols-4 no-print" style={{ gap: '16px' }}>
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', backgroundColor: 'var(--bg-secondary)' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-md)', backgroundColor: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Folder size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Carpetas de Clientes</span>
            <h3 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>{totalClientsCount}</h3>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', backgroundColor: 'var(--bg-secondary)' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--claro-red-light)', color: 'var(--claro-red)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileText size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Propuestas Oficiales</span>
            <h3 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>{totalCount}</h3>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', backgroundColor: 'var(--bg-secondary)' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-md)', backgroundColor: '#D1FAE5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Volumen Mensual DOP</span>
            <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
              ${totalMonthlyDOP.toLocaleString('es-DO', { minimumFractionDigits: 2 })}
            </h3>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', backgroundColor: 'var(--bg-secondary)' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-md)', backgroundColor: '#E0F2FE', color: '#0284C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <DollarSign size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Volumen Mensual USD</span>
            <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
              ${totalMonthlyUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </h3>
          </div>
        </div>
      </div>

      {/* Navigation Tabs and Search Bar */}
      <div className="glass-panel no-print" style={{ padding: '16px 20px', backgroundColor: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        
        {/* Tab switcher */}
        <div style={{ display: 'flex', gap: '8px', backgroundColor: 'var(--bg-primary)', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <button 
            onClick={() => { setActiveTab('folders'); setOpenedClientFolder(null); }}
            style={{
              padding: '6px 16px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              backgroundColor: activeTab === 'folders' && !openedClientFolder ? 'var(--claro-red)' : 'transparent',
              color: activeTab === 'folders' && !openedClientFolder ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: '700',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all var(--transition-fast)'
            }}
          >
            <Folder size={15} /> Carpetas de Clientes ({totalClientsCount})
          </button>
          <button 
            onClick={() => { setActiveTab('all-quotes'); setOpenedClientFolder(null); }}
            style={{
              padding: '6px 16px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              backgroundColor: activeTab === 'all-quotes' ? 'var(--claro-red)' : 'transparent',
              color: activeTab === 'all-quotes' ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: '700',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all var(--transition-fast)'
            }}
          >
            <FileText size={15} /> Todas las Cotizaciones ({totalCount})
          </button>
        </div>

        {/* Search input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, justifyContent: 'flex-end', minWidth: '280px' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '360px' }}>
            <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              className="form-input" 
              placeholder="Buscar cliente, cotización o producto..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '38px', fontSize: '0.85rem', height: '38px' }}
            />
          </div>

          {activeTab === 'all-quotes' && (
            <select 
              className="form-input" 
              value={selectedProductFilter}
              onChange={(e) => setSelectedProductFilter(e.target.value)}
              style={{ fontSize: '0.85rem', padding: '8px 12px', width: 'auto', height: '38px' }}
            >
              <option value="ALL">Todos los Productos</option>
              <option value="hpbx">Centralita HPBX</option>
              <option value="cloud">Claro Cloud</option>
              <option value="movil">Planes Móviles</option>
            </select>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="glass-panel" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 14px auto', color: 'var(--claro-red)' }} />
          <span style={{ fontSize: '0.95rem', fontWeight: '600' }}>Cargando expedientes y cotizaciones desde PostgreSQL...</span>
        </div>
      ) : quotes.length === 0 ? (
        /* Empty State */
        <div className="glass-panel" style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
            <FolderOpen size={32} style={{ color: 'var(--text-muted)' }} />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '8px' }}>
            Repositorio Limpio y Preparado
          </h3>
          <p style={{ fontSize: '0.9rem', maxWidth: '540px', margin: '0 auto 20px auto', lineHeight: '1.6' }}>
            No hay cotizaciones registradas actualmente. Cada vez que solicites una cotización a <strong>Clara (Copilot)</strong> o cotices un producto, el sistema creará automáticamente una carpeta exclusiva con el nombre del cliente y guardará todos sus expedientes.
          </p>
        </div>
      ) : activeTab === 'folders' && !openedClientFolder ? (
        /* VISTA: CARPETAS DE CLIENTES */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-secondary)' }}>
              Mostrando {filteredFolders.length} expediente(s) de clientes
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {filteredFolders.map(folder => (
              <div 
                key={folder.folderPath} 
                className="glass-panel hover-lift"
                style={{ 
                  padding: '20px', 
                  backgroundColor: 'var(--bg-secondary)', 
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-lg)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '16px',
                  cursor: 'pointer'
                }}
                onClick={() => setOpenedClientFolder(folder.clientName)}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '46px', height: '46px', borderRadius: 'var(--radius-md)', backgroundColor: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Folder size={24} />
                      </div>
                      <div>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                          {folder.clientName}
                        </h4>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          📁 {folder.folderPath}
                        </span>
                      </div>
                    </div>
                    <span className="badge" style={{ backgroundColor: 'var(--claro-red-light)', color: 'var(--claro-red)', fontWeight: '700' }}>
                      {folder.totalQuotes} {folder.totalQuotes === 1 ? 'Propuesta' : 'Propuestas'}
                    </span>
                  </div>

                  {/* Summary Box */}
                  <div style={{ backgroundColor: 'var(--bg-primary)', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Renta Acumulada:</span>
                      <strong style={{ color: 'var(--claro-red)' }}>
                        {folder.totalMonthlyDOP > 0 ? `RD$ ${folder.totalMonthlyDOP.toLocaleString('es-DO', { minimumFractionDigits: 2 })}` : `$ ${folder.totalMonthlyUSD.toFixed(2)} USD`}
                      </strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Documentos Indexados:</span>
                      <strong style={{ color: 'var(--text-primary)' }}>{folder.documents?.length || folder.totalQuotes} archivos</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      <span>Última Actividad:</span>
                      <span>{folder.lastDate ? new Date(folder.lastDate).toLocaleDateString('es-DO') : 'Reciente'}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--claro-red)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Abrir Carpeta del Cliente <ChevronRight size={15} />
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    SharePoint Synced
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : activeTab === 'folders' && openedClientFolder ? (
        /* VISTA DETALLE: EXPEDIENTE DEL CLIENTE ABIERTO */
        activeFolderData ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Folder Navigation Header */}
            <div className="glass-panel" style={{ padding: '16px 20px', backgroundColor: 'var(--bg-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button 
                  onClick={() => setOpenedClientFolder(null)}
                  className="btn btn-secondary" 
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.825rem', padding: '6px 12px' }}
                >
                  <ArrowLeft size={16} /> Volver a Clientes
                </button>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FolderOpen size={20} color="#D97706" />
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                      Expediente: {activeFolderData.clientName}
                    </h3>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Ubicación en SharePoint: /sites/gevc/indiso/Shared Documents1/{activeFolderData.folderPath}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className="badge" style={{ backgroundColor: 'var(--claro-red-light)', color: 'var(--claro-red)', fontWeight: '700' }}>
                  {activeFolderData.quotes.length} Cotización(es)
                </span>
                <span className="badge" style={{ backgroundColor: '#D1FAE5', color: '#059669', fontWeight: '700' }}>
                  RD$ {activeFolderData.totalMonthlyDOP.toLocaleString('es-DO', { minimumFractionDigits: 2 })} / mes
                </span>
              </div>
            </div>

            {/* List of quotes for this client */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: '20px' }}>
              {activeFolderData.quotes.map(quote => (
                <div 
                  key={quote.id} 
                  className="glass-panel"
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
                  {/* Card Header */}
                  <div style={{ 
                    backgroundColor: 'var(--claro-red)', 
                    color: '#FFFFFF', 
                    padding: '12px 18px', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center' 
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Building size={16} />
                      <span style={{ fontSize: '0.85rem', fontWeight: '800' }}>
                        {quote.clientName}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.7rem', backgroundColor: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontWeight: '600' }}>
                      {quote.id}
                    </span>
                  </div>

                  {/* Card Content */}
                  <div style={{ padding: '18px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 6px 0' }}>
                        {quote.productName}
                      </h4>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={13} /> {quote.createdAt ? new Date(quote.createdAt).toLocaleDateString('es-DO') : 'Reciente'}
                        </span>
                        <span>•</span>
                        <span style={{ color: '#10B981', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <CheckCircle2 size={12} /> Validez 30 Días
                        </span>
                      </div>

                      <div style={{ backgroundColor: 'var(--bg-primary)', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Estaciones / Usuarios:</span>
                          <strong style={{ color: 'var(--text-primary)' }}>{quote.quantity}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Precio Unitario:</span>
                          <strong style={{ color: 'var(--text-primary)' }}>{quote.unitPrice}</strong>
                        </div>
                        {quote.setupFee && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Instalación:</span>
                            <strong style={{ color: '#10B981' }}>{quote.setupFee}</strong>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginBottom: '14px' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Renta Mensual:</span>
                        <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--claro-red)' }}>
                          {quote.monthlyTotal}
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        <button 
                          onClick={() => setDeleteTargetQuote(quote)}
                          className="btn btn-secondary" 
                          style={{ fontSize: '0.75rem', padding: '6px 8px', color: '#ef4444' }}
                          title="Eliminar esta propuesta"
                        >
                          <Trash2 size={13} />
                        </button>
                        <button 
                          onClick={() => handleDownloadExcel(quote)} 
                          className="btn btn-secondary" 
                          style={{ fontSize: '0.75rem', padding: '6px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}
                          title="Descargar Excel oficial"
                        >
                          <FileSpreadsheet size={13} color="#10B981" /> Excel
                        </button>
                        <button 
                          onClick={() => setSelectedQuoteModal(quote)} 
                          className="btn btn-primary" 
                          style={{ fontSize: '0.75rem', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                          title="Ver Plantilla Oficial Imprimible"
                        >
                          <Printer size={13} /> Plantilla Oficial / PDF
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null
      ) : (
        /* VISTA: TODAS LAS COTIZACIONES */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: '20px' }}>
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
                  <Building size={15} />
                  <span style={{ fontSize: '0.85rem', fontWeight: '800' }}>
                    {quote.clientName || 'Cliente Claro'}
                  </span>
                </div>
                <span style={{ fontSize: '0.7rem', backgroundColor: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontWeight: '600' }}>
                  {quote.id}
                </span>
              </div>

              {/* Card Main Info */}
              <div style={{ padding: '18px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 6px 0' }}>
                    {quote.productName}
                  </h3>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={13} /> {quote.createdAt ? new Date(quote.createdAt).toLocaleDateString('es-DO') : new Date().toLocaleDateString('es-DO')}
                    </span>
                    <span>•</span>
                    <span style={{ color: '#10B981', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <CheckCircle2 size={12} /> Validez: 30 Días
                    </span>
                  </div>

                  <div style={{ backgroundColor: 'var(--bg-primary)', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Cantidad / Usuarios:</span>
                      <strong style={{ color: 'var(--text-primary)' }}>{quote.quantity}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Precio Unitario:</span>
                      <strong style={{ color: 'var(--text-primary)' }}>{quote.unitPrice}</strong>
                    </div>
                    {quote.setupFee && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Instalación:</span>
                        <strong style={{ color: '#10B981' }}>{quote.setupFee}</strong>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginBottom: '14px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Renta Mensual:</span>
                    <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--claro-red)' }}>
                      {quote.monthlyTotal}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                    <button 
                      onClick={() => setDeleteTargetQuote(quote)}
                      className="btn btn-secondary" 
                      style={{ fontSize: '0.75rem', padding: '6px 8px', color: '#ef4444' }}
                      title="Eliminar esta propuesta"
                    >
                      <Trash2 size={13} />
                    </button>
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

      {/* Clear All Confirmation Modal */}
      {showClearModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="glass-panel animate-scale-up" style={{ maxWidth: '440px', width: '100%', padding: '24px', backgroundColor: 'var(--bg-secondary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: '#ef4444' }}>
              <AlertTriangle size={28} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
                ¿Vaciar Repositorio de Cotizaciones?
              </h3>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '20px' }}>
              Esta acción eliminará de forma permanente <strong>todas las cotizaciones y expedientes de clientes ({quotes.length} propuestas)</strong> de PostgreSQL y del almacenamiento local.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button 
                onClick={() => setShowClearModal(false)}
                className="btn btn-secondary"
                disabled={isClearing}
              >
                Cancelar
              </button>
              <button 
                onClick={handleClearAllQuotes}
                className="btn"
                style={{ backgroundColor: '#ef4444', color: '#ffffff' }}
                disabled={isClearing}
              >
                {isClearing ? 'Vaciando...' : 'Sí, Vaciar Todo'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Single Quote Modal */}
      {deleteTargetQuote && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="glass-panel animate-scale-up" style={{ maxWidth: '420px', width: '100%', padding: '24px', backgroundColor: 'var(--bg-secondary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: '#ef4444' }}>
              <Trash2 size={24} />
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
                Eliminar Cotización
              </h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '20px' }}>
              ¿Estás seguro de eliminar la cotización <strong>{deleteTargetQuote.id}</strong> para <strong>{deleteTargetQuote.clientName}</strong>?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button 
                onClick={() => setDeleteTargetQuote(null)}
                className="btn btn-secondary"
              >
                Cancelar
              </button>
              <button 
                onClick={() => handleDeleteQuote(deleteTargetQuote.id)}
                className="btn"
                style={{ backgroundColor: '#ef4444', color: '#ffffff' }}
              >
                Eliminar
              </button>
            </div>
          </div>
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

