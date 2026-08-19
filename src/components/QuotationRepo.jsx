import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileText, Search, Download, Printer, RefreshCw, Filter, DollarSign, 
  Calendar, CheckCircle2, Send, ExternalLink, Sparkles, Building, 
  FileSpreadsheet, Folder, FolderOpen, Trash2, Users, AlertTriangle, 
  ChevronRight, ArrowLeft, Eye, ShieldCheck, Plus, Package, ArrowUpRight,
  TrendingUp, Clock, FileCheck, Layers, Briefcase
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
  const [selectedQuoteModal, setSelectedQuoteModal] = useState(null);
  
  // Navigation & View Mode
  const [activeTab, setActiveTab] = useState('crm'); // 'crm' | 'quotes'
  const [dossierClient, setDossierClient] = useState(null); // Client object for detail modal
  
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
        setDossierClient(null);
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
        if (dossierClient) {
          const updatedQuotes = dossierClient.quotes.filter(q => q.id !== quoteId);
          if (updatedQuotes.length === 0) {
            setDossierClient(null);
          } else {
            setDossierClient({ ...dossierClient, quotes: updatedQuotes });
          }
        }
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

  // Filtered CRM Client Folders
  const filteredClients = useMemo(() => {
    return clientFolders.filter(f => {
      const matchSearch = f.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          f.quotes.some(q => (q.productName || '').toLowerCase().includes(searchTerm.toLowerCase()));
      const matchProduct = selectedProductFilter === 'ALL' || f.quotes.some(q => (q.productId || '').toLowerCase().includes(selectedProductFilter.toLowerCase()));
      return matchSearch && matchProduct;
    });
  }, [clientFolders, searchTerm, selectedProductFilter]);

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

  // Helper to generate initials avatar
  const getInitials = (name) => {
    if (!name) return 'CL';
    const words = name.trim().split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header Banner */}
      <div className="glass-panel no-print" style={{ 
        padding: '20px 24px', 
        backgroundColor: 'var(--bg-secondary)', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        flexWrap: 'wrap', 
        gap: '16px',
        borderLeft: '4px solid var(--claro-red)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: 'var(--claro-red-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Briefcase size={24} color="var(--claro-red)" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0, fontFamily: 'var(--font-display)' }}>
              CRM y Gestor de Cotizaciones Corporativas
            </h2>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: 0 }}>
              Expedientes organizados por cliente con propuestas oficiales, cálculos fiscales y exportación directa
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button 
            onClick={fetchData} 
            className="btn btn-secondary" 
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', fontSize: '0.825rem' }}
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Actualizar
          </button>

          {quotes.length > 0 && (
            <button 
              onClick={() => setShowClearModal(true)} 
              className="btn" 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px', 
                padding: '8px 14px', 
                fontSize: '0.825rem', 
                backgroundColor: 'rgba(239, 68, 68, 0.1)', 
                color: '#ef4444', 
                border: '1px solid rgba(239, 68, 68, 0.25)' 
              }}
            >
              <Trash2 size={15} /> Vaciar Historial
            </button>
          )}
        </div>
      </div>

      {/* KPI Stats Grid - 4 Columns Horizontal */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', 
        gap: '16px' 
      }} className="no-print">
        
        {/* KPI 1: Clientes */}
        <div className="glass-panel" style={{ 
          padding: '16px 18px', 
          backgroundColor: 'var(--bg-secondary)', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '14px',
          borderLeft: '3px solid #D97706'
        }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Building size={20} />
          </div>
          <div style={{ overflow: 'hidden' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Clientes Atendidos
            </span>
            <h3 style={{ fontSize: '1.45rem', fontWeight: '800', color: 'var(--text-primary)', margin: '2px 0 0 0' }}>
              {totalClientsCount}
            </h3>
          </div>
        </div>

        {/* KPI 2: Cotizaciones */}
        <div className="glass-panel" style={{ 
          padding: '16px 18px', 
          backgroundColor: 'var(--bg-secondary)', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '14px',
          borderLeft: '3px solid var(--claro-red)'
        }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'var(--claro-red-light)', color: 'var(--claro-red)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <FileText size={20} />
          </div>
          <div style={{ overflow: 'hidden' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Propuestas Creadas
            </span>
            <h3 style={{ fontSize: '1.45rem', fontWeight: '800', color: 'var(--text-primary)', margin: '2px 0 0 0' }}>
              {totalCount}
            </h3>
          </div>
        </div>

        {/* KPI 3: Renta DOP */}
        <div className="glass-panel" style={{ 
          padding: '16px 18px', 
          backgroundColor: 'var(--bg-secondary)', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '14px',
          borderLeft: '3px solid #059669'
        }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#D1FAE5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <TrendingUp size={20} />
          </div>
          <div style={{ overflow: 'hidden' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Renta Mensual DOP
            </span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)', margin: '2px 0 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              RD$ {totalMonthlyDOP.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
          </div>
        </div>

        {/* KPI 4: Renta USD */}
        <div className="glass-panel" style={{ 
          padding: '16px 18px', 
          backgroundColor: 'var(--bg-secondary)', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '14px',
          borderLeft: '3px solid #0284C7'
        }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#E0F2FE', color: '#0284C7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <DollarSign size={20} />
          </div>
          <div style={{ overflow: 'hidden' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Renta Mensual USD
            </span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)', margin: '2px 0 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              ${totalMonthlyUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
            </h3>
          </div>
        </div>

      </div>

      {/* Control Bar: Search + Filter + View Toggle */}
      <div className="glass-panel no-print" style={{ 
        padding: '14px 20px', 
        backgroundColor: 'var(--bg-secondary)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        flexWrap: 'wrap', 
        gap: '12px' 
      }}>
        
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
          <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            className="form-input" 
            placeholder="Buscar por cliente, cotización o solución..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '38px', fontSize: '0.85rem', height: '38px' }}
          />
        </div>

        {/* Product Filter */}
        <select 
          className="form-input" 
          value={selectedProductFilter}
          onChange={(e) => setSelectedProductFilter(e.target.value)}
          style={{ fontSize: '0.85rem', padding: '8px 12px', width: 'auto', height: '38px' }}
        >
          <option value="ALL">Todas las Soluciones</option>
          <option value="hpbx">Hosted PBX Claro</option>
          <option value="cloud">Claro Cloud</option>
          <option value="movil">Planes Móviles</option>
        </select>

        {/* View switcher */}
        <div style={{ display: 'flex', gap: '4px', backgroundColor: 'var(--bg-primary)', padding: '3px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <button 
            onClick={() => setActiveTab('crm')}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              backgroundColor: activeTab === 'crm' ? 'var(--claro-red)' : 'transparent',
              color: activeTab === 'crm' ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: '700',
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Users size={14} /> Clientes ({totalClientsCount})
          </button>
          <button 
            onClick={() => setActiveTab('quotes')}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              backgroundColor: activeTab === 'quotes' ? 'var(--claro-red)' : 'transparent',
              color: activeTab === 'quotes' ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: '700',
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <FileText size={14} /> Propuestas ({totalCount})
          </button>
        </div>

      </div>

      {/* Main CRM Table View */}
      {loading ? (
        <div className="glass-panel" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 14px auto', color: 'var(--claro-red)' }} />
          <span style={{ fontSize: '0.95rem', fontWeight: '600' }}>Cargando datos comerciales...</span>
        </div>
      ) : quotes.length === 0 ? (
        /* Empty State */
        <div className="glass-panel" style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
            <FolderOpen size={28} style={{ color: 'var(--text-muted)' }} />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '6px' }}>
            Repositorio Comercial Limpio
          </h3>
          <p style={{ fontSize: '0.875rem', maxWidth: '500px', margin: '0 auto 20px auto', lineHeight: '1.5' }}>
            No hay cotizaciones registradas. Al interactuar con <strong>Clara (Copilot)</strong> o solicitar una propuesta, el sistema creará automáticamente la ficha del cliente y su carpeta correspondiente.
          </p>
        </div>
      ) : activeTab === 'crm' ? (
        /* TABLA MODERNA CRM DE CLIENTES */
        <div className="glass-panel" style={{ padding: '0', backgroundColor: 'var(--bg-secondary)', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-primary)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '14px 18px', fontWeight: '700' }}>Cliente / Empresa</th>
                  <th style={{ padding: '14px 18px', fontWeight: '700' }}>Solución Cotizada</th>
                  <th style={{ padding: '14px 18px', fontWeight: '700', textAlign: 'center' }}>Propuestas</th>
                  <th style={{ padding: '14px 18px', fontWeight: '700' }}>Renta Mensual</th>
                  <th style={{ padding: '14px 18px', fontWeight: '700' }}>Instalación</th>
                  <th style={{ padding: '14px 18px', fontWeight: '700' }}>Última Actividad</th>
                  <th style={{ padding: '14px 18px', fontWeight: '700', textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((client) => {
                  const primaryQuote = client.quotes[0] || {};
                  const isHpba = (primaryQuote.productId || '').includes('hpbx') || (primaryQuote.productName || '').toLowerCase().includes('hpbx');
                  
                  return (
                    <tr 
                      key={client.clientName}
                      style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color var(--transition-fast)' }}
                      className="table-row-hover"
                    >
                      {/* Cliente */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ 
                            width: '38px', 
                            height: '38px', 
                            borderRadius: '10px', 
                            backgroundColor: '#FEF3C7', 
                            color: '#D97706', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            fontWeight: '800',
                            fontSize: '0.85rem',
                            flexShrink: 0
                          }}>
                            {getInitials(client.clientName)}
                          </div>
                          <div>
                            <div style={{ fontWeight: '800', color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                              {client.clientName}
                            </div>
                            <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                              📁 {client.folderPath}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Solución */}
                      <td style={{ padding: '14px 18px' }}>
                        <span className="badge" style={{ 
                          backgroundColor: isHpba ? 'rgba(238, 28, 36, 0.1)' : 'rgba(2, 132, 199, 0.1)', 
                          color: isHpba ? 'var(--claro-red)' : '#0284C7',
                          fontWeight: '700',
                          fontSize: '0.75rem'
                        }}>
                          {primaryQuote.productName || 'Hosted PBX Claro'}
                        </span>
                      </td>

                      {/* Cantidad de propuestas */}
                      <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                        <span className="badge" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', fontWeight: '700', color: 'var(--text-primary)' }}>
                          {client.totalQuotes} {client.totalQuotes === 1 ? 'cotización' : 'cotizaciones'}
                        </span>
                      </td>

                      {/* Renta Mensual */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontWeight: '800', color: 'var(--claro-red)', fontSize: '0.95rem' }}>
                          {client.totalMonthlyDOP > 0 ? `RD$ ${client.totalMonthlyDOP.toLocaleString('es-DO', { minimumFractionDigits: 2 })}` : `$ ${client.totalMonthlyUSD.toFixed(2)} USD`}
                        </div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>con impuestos</span>
                      </td>

                      {/* Instalación */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontWeight: '600', color: '#10B981', fontSize: '0.85rem' }}>
                          {primaryQuote.setupFee || 'N/A'}
                        </div>
                      </td>

                      {/* Fecha */}
                      <td style={{ padding: '14px 18px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={13} />
                          {client.lastDate ? new Date(client.lastDate).toLocaleDateString('es-DO') : 'Reciente'}
                        </div>
                      </td>

                      {/* Acciones */}
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                          <button 
                            onClick={() => setDossierClient(client)}
                            className="btn btn-secondary" 
                            style={{ padding: '6px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                            title="Ver expediente y propuestas del cliente"
                          >
                            <FolderOpen size={13} color="#D97706" /> Expediente
                          </button>
                          <button 
                            onClick={() => handleDownloadExcel(primaryQuote)} 
                            className="btn btn-secondary" 
                            style={{ padding: '6px 8px', fontSize: '0.75rem' }}
                            title="Descargar Excel oficial (.xlsx)"
                          >
                            <FileSpreadsheet size={14} color="#10B981" />
                          </button>
                          <button 
                            onClick={() => setSelectedQuoteModal(primaryQuote)} 
                            className="btn btn-primary" 
                            style={{ padding: '6px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                            title="Imprimir propuesta oficial en PDF"
                          >
                            <Printer size={13} /> PDF
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* VISTA: TODAS LAS COTIZACIONES EN TABLA DETALLADA */
        <div className="glass-panel" style={{ padding: '0', backgroundColor: 'var(--bg-secondary)', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-primary)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '14px 18px', fontWeight: '700' }}>Código / Fecha</th>
                  <th style={{ padding: '14px 18px', fontWeight: '700' }}>Cliente</th>
                  <th style={{ padding: '14px 18px', fontWeight: '700' }}>Solución</th>
                  <th style={{ padding: '14px 18px', fontWeight: '700', textAlign: 'center' }}>Estaciones</th>
                  <th style={{ padding: '14px 18px', fontWeight: '700' }}>Renta Mensual</th>
                  <th style={{ padding: '14px 18px', fontWeight: '700' }}>Instalación</th>
                  <th style={{ padding: '14px 18px', fontWeight: '700', textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredQuotes.map((quote) => (
                  <tr 
                    key={quote.id} 
                    style={{ borderBottom: '1px solid var(--border-color)' }}
                    className="table-row-hover"
                  >
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{quote.id}</div>
                      <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                        {quote.createdAt ? new Date(quote.createdAt).toLocaleDateString('es-DO') : 'Reciente'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px', fontWeight: '800', color: 'var(--text-primary)' }}>
                      {quote.clientName || 'Cliente Claro'}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span className="badge" style={{ backgroundColor: 'rgba(238, 28, 36, 0.1)', color: 'var(--claro-red)', fontWeight: '700' }}>
                        {quote.productName}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'center', fontWeight: '700' }}>
                      {quote.quantity}
                    </td>
                    <td style={{ padding: '14px 18px', fontWeight: '800', color: 'var(--claro-red)' }}>
                      {quote.monthlyTotal}
                    </td>
                    <td style={{ padding: '14px 18px', color: '#10B981', fontWeight: '600' }}>
                      {quote.setupFee || 'N/A'}
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                        <button 
                          onClick={() => setDeleteTargetQuote(quote)}
                          className="btn btn-secondary" 
                          style={{ padding: '6px 8px', color: '#ef4444' }}
                          title="Eliminar propuesta"
                        >
                          <Trash2 size={13} />
                        </button>
                        <button 
                          onClick={() => handleDownloadExcel(quote)} 
                          className="btn btn-secondary" 
                          style={{ padding: '6px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                          title="Descargar Excel oficial (.xlsx)"
                        >
                          <FileSpreadsheet size={13} color="#10B981" /> Excel
                        </button>
                        <button 
                          onClick={() => setSelectedQuoteModal(quote)} 
                          className="btn btn-primary" 
                          style={{ padding: '6px 12px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                          title="Ver e Imprimir plantilla oficial en PDF"
                        >
                          <Printer size={13} /> PDF
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Expediente del Cliente (Dossier) */}
      {dossierClient && (
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
          <div className="glass-panel animate-scale-up" style={{ 
            maxWidth: '750px', 
            width: '100%', 
            maxHeight: '85vh',
            display: 'flex',
            flexDirection: 'column',
            padding: '0', 
            backgroundColor: 'var(--bg-secondary)',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{ 
              padding: '18px 24px', 
              backgroundColor: 'var(--bg-primary)', 
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>
                  {getInitials(dossierClient.clientName)}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                    Expediente: {dossierClient.clientName}
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    📁 Carpeta SharePoint: {dossierClient.folderPath}
                  </span>
                </div>
              </div>

              <button 
                onClick={() => setDossierClient(null)}
                className="btn btn-secondary"
                style={{ padding: '6px 12px', fontSize: '0.8rem' }}
              >
                Cerrar
              </button>
            </div>

            {/* Modal Body - Quotes List */}
            <div style={{ padding: '20px 24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-secondary)' }}>
                  Propuestas Registradas ({dossierClient.quotes.length})
                </span>
                <span className="badge" style={{ backgroundColor: '#D1FAE5', color: '#059669', fontWeight: '700' }}>
                  Total Inversión: RD$ {dossierClient.totalMonthlyDOP.toLocaleString('es-DO', { minimumFractionDigits: 2 })} / mes
                </span>
              </div>

              {dossierClient.quotes.map(quote => (
                <div 
                  key={quote.id}
                  style={{
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: '16px 18px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontWeight: '800', color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                        {quote.productName}
                      </span>
                      <span className="badge" style={{ fontSize: '0.7rem' }}>{quote.id}</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: '14px' }}>
                      <span>Usuarios / Estaciones: <strong>{quote.quantity}</strong></span>
                      <span>Precio Unitario: <strong>{quote.unitPrice}</strong></span>
                      {quote.setupFee && <span>Instalación: <strong style={{ color: '#10B981' }}>{quote.setupFee}</strong></span>}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--claro-red)' }}>
                        {quote.monthlyTotal}
                      </div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Renta Mensual</span>
                    </div>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button 
                        onClick={() => handleDownloadExcel(quote)} 
                        className="btn btn-secondary" 
                        style={{ padding: '6px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                        title="Descargar Excel oficial"
                      >
                        <FileSpreadsheet size={13} color="#10B981" /> Excel
                      </button>
                      <button 
                        onClick={() => setSelectedQuoteModal(quote)} 
                        className="btn btn-primary" 
                        style={{ padding: '6px 12px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                        title="Ver e Imprimir PDF"
                      >
                        <Printer size={13} /> PDF
                      </button>
                      <button 
                        onClick={() => setDeleteTargetQuote(quote)}
                        className="btn btn-secondary" 
                        style={{ padding: '6px 8px', color: '#ef4444' }}
                        title="Eliminar cotización"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
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


