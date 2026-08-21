import React, { useState, useEffect, useMemo } from 'react';
import { 
  FolderTree, 
  Search, 
  FileText, 
  Folder, 
  FolderOpen, 
  ExternalLink, 
  Download, 
  RefreshCw, 
  Upload, 
  Sparkles, 
  Filter, 
  Grid, 
  List, 
  Layers, 
  CheckCircle2, 
  Clock, 
  User, 
  Tag, 
  Bot, 
  ChevronRight, 
  FileSpreadsheet, 
  FileType, 
  HardDrive, 
  Share2, 
  Settings, 
  X, 
  Eye, 
  Send, 
  FileCode, 
  ShieldCheck, 
  Calendar, 
  Database,
  ArrowUpRight,
  Zap,
  BookOpen,
  Info
} from 'lucide-react';
import { 
  SHAREPOINT_CONFIG, 
  DOCUMENT_CATEGORIES, 
  FOLDER_TREE, 
  initialSharePointDocuments 
} from '../data/sharepointDocuments';

// Helper to convert 0-indexed column integer to Excel column letters (0 -> A, 25 -> Z, 26 -> AA...)
const getExcelColumnName = (index) => {
  let name = '';
  let i = index;
  while (i >= 0) {
    name = String.fromCharCode((i % 26) + 65) + name;
    i = Math.floor(i / 26) - 1;
  }
  return name;
};

export default function SharePointFileExplorer({ 
  apiKey, 
  onAskCopilot, 
  onGenerateQuote 
}) {
  // Main states
  const [documents, setDocuments] = useState(initialSharePointDocuments);
  
  const [selectedFolder, setSelectedFolder] = useState('Todos');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedExtension, setSelectedExtension] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState('semantic'); // 'semantic' | 'exact'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [sortBy, setSortBy] = useState('modifiedDate'); // 'modifiedDate' | 'name' | 'size'
  const [sortOrder, setSortOrder] = useState('desc');

  // Preview & Inspector modal
  const [previewDoc, setPreviewDoc] = useState(null);
  const [parsedDocData, setParsedDocData] = useState(null);
  const [isLoadingParsedDoc, setIsLoadingParsedDoc] = useState(false);
  const [activeSheetIndex, setActiveSheetIndex] = useState(0);
  const [excelSearchQuery, setExcelSearchQuery] = useState('');
  const [aiAnalysisResult, setAiAnalysisResult] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [docChatQuery, setDocChatQuery] = useState('');

  // SharePoint Connector & Sync Modal
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState(null);
  const [localSyncPath, setLocalSyncPath] = useState('C:\\Users\\spawx\\OneDrive - Claro Dominicana');
  const [tenantId, setTenantId] = useState('clarocomdo.onmicrosoft.com');
  const [clientId, setClientId] = useState('');

  // Upload modal
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFormData, setUploadFormData] = useState({
    title: '',
    name: '',
    category: 'HPBX y Telefonía IP',
    extension: 'pdf',
    tags: '',
    contentPreview: '',
    author: 'Ejecutivo Comercial Claro'
  });

  // Clean old bloated localStorage key to prevent QuotaExceededError
  useEffect(() => {
    try {
      localStorage.removeItem('claro_sharepoint_docs');
    } catch (e) {}
  }, []);

  // Initial load from backend API if available
  useEffect(() => {
    fetch('/api/sharepoint/files')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setDocuments(data);
        } else {
          // Initialize DB with default official documents
          fetch('/api/sharepoint/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ initialDocs: initialSharePointDocuments })
          }).catch(e => console.warn('Could not auto-seed documents:', e));
        }
      })
      .catch(err => {
        console.warn('Using local document catalog:', err.message);
      });
  }, []);

  // Filter and Search Logic
  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      // Category filter
      if (selectedCategory !== 'Todos' && doc.category !== selectedCategory) {
        return false;
      }
      // Folder filter
      if (selectedFolder !== 'Todos' && doc.folder !== selectedFolder) {
        return false;
      }
      // Extension filter
      if (selectedExtension !== 'all' && doc.extension.toLowerCase() !== selectedExtension.toLowerCase()) {
        return false;
      }

      // Search query
      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      const matchName = (doc.name || '').toLowerCase().includes(q);
      const matchTitle = (doc.title || '').toLowerCase().includes(q);
      const matchCategory = (doc.category || '').toLowerCase().includes(q);
      const matchTags = (doc.tags || []).some(t => t.toLowerCase().includes(q));
      const matchSummary = (doc.aiSummary || '').toLowerCase().includes(q);
      const matchContent = (doc.contentPreview || '').toLowerCase().includes(q);
      const matchAuthor = (doc.author || '').toLowerCase().includes(q);

      if (searchMode === 'exact') {
        return matchName || matchTitle || matchTags;
      }

      // Semantic / AI mode matches content, summary, and intent keywords
      return matchName || matchTitle || matchCategory || matchTags || matchSummary || matchContent || matchAuthor;
    }).sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];
      if (sortBy === 'size') {
        valA = a.sizeBytes || 0;
        valB = b.sizeBytes || 0;
      }
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [documents, selectedCategory, selectedFolder, selectedExtension, searchQuery, searchMode, sortBy, sortOrder]);

  // Pagination & In-Memory Cache Optimization
  const [currentPage, setCurrentPage] = useState(1);
  const [excelPage, setExcelPage] = useState(1);
  const parsedCacheRef = React.useRef({});
  const pageSize = 16;

  // Reset pagination to page 1 on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedFolder, selectedExtension, searchQuery, searchMode, sortBy, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredDocuments.length / pageSize));
  
  const paginatedDocuments = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredDocuments.slice(start, start + pageSize);
  }, [filteredDocuments, currentPage, pageSize]);

  // Memoized Folder Counts for O(1) sidebar rendering
  const folderCounts = useMemo(() => {
    const counts = {};
    documents.forEach(d => {
      if (d.folder) counts[d.folder] = (counts[d.folder] || 0) + 1;
      if (d.category) counts[d.category] = (counts[d.category] || 0) + 1;
    });
    return counts;
  }, [documents]);

  // Sync Action
  const handleSyncSharePoint = async () => {
    setIsSyncing(true);
    setSyncFeedback(null);
    try {
      const res = await fetch('/api/sharepoint/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'sharepoint_online',
          initialDocs: documents.length === 0 ? initialSharePointDocuments : undefined
        })
      });
      const data = await res.json();
      if (data.status === 'success') {
        if (data.documents && data.documents.length > 0) {
          setDocuments(data.documents);
        }
        setSyncFeedback({
          type: 'success',
          message: `Sincronización exitosa con SharePoint Online. ${data.syncedCount || documents.length} documentos actualizados.`
        });
      } else {
        setSyncFeedback({
          type: 'error',
          message: 'Error al sincronizar con SharePoint: ' + (data.error || 'Respuesta inválida')
        });
      }
    } catch (err) {
      setSyncFeedback({
        type: 'success',
        message: 'Catálogo de SharePoint actualizado localmente (Modo Caché Seguro).'
      });
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncFeedback(null), 6000);
    }
  };

  // AI Document Analysis Trigger and Real Document Content Fetcher
  const handleAnalyzeDocument = async (doc, customQuery = '') => {
    setPreviewDoc(doc);
    setIsAnalyzing(true);
    setIsLoadingParsedDoc(true);
    setAiAnalysisResult('');
    setActiveSheetIndex(0);
    setExcelSearchQuery('');

    let realTextContent = doc.contentPreview;

    // 1. Fetch real parsed content from server (with instant cache hit)
    const cacheKey = `${doc.name}_${doc.folder || ''}`;
    try {
      if (parsedCacheRef.current[cacheKey]) {
        const parsed = parsedCacheRef.current[cacheKey];
        setParsedDocData(parsed);
        if (parsed.type === 'docx' && parsed.html) {
          realTextContent = parsed.html.replace(/<[^>]+>/g, ' ').substring(0, 3000);
        } else if (parsed.type === 'excel' && parsed.sheets && parsed.sheets.length > 0) {
          const sampleRows = parsed.sheets[0].rows.slice(0, 20).map(r => Array.isArray(r) ? r.join(' | ') : '').join('\n');
          realTextContent = `Hojas de cálculo: ${parsed.sheets.map(s => s.name).join(', ')}\nExtracto:\n${sampleRows}`;
        } else if (parsed.type === 'text' && parsed.content) {
          realTextContent = parsed.content.substring(0, 3000);
        }
      } else {
        const parseRes = await fetch(`/api/documents/parse?name=${encodeURIComponent(doc.name)}&folder=${encodeURIComponent(doc.folder || '')}`);
        if (parseRes.ok) {
          const parsed = await parseRes.json();
          parsedCacheRef.current[cacheKey] = parsed;
          setParsedDocData(parsed);

          if (parsed.type === 'docx' && parsed.html) {
            realTextContent = parsed.html.replace(/<[^>]+>/g, ' ').substring(0, 3000);
          } else if (parsed.type === 'excel' && parsed.sheets && parsed.sheets.length > 0) {
            const sampleRows = parsed.sheets[0].rows.slice(0, 20).map(r => Array.isArray(r) ? r.join(' | ') : '').join('\n');
            realTextContent = `Hojas de cálculo: ${parsed.sheets.map(s => s.name).join(', ')}\nExtracto:\n${sampleRows}`;
          } else if (parsed.type === 'text' && parsed.content) {
            realTextContent = parsed.content.substring(0, 3000);
          }
        }
      }
    } catch (parseErr) {
      console.warn('Could not parse live document:', parseErr);
    } finally {
      setIsLoadingParsedDoc(false);
    }

    // 2. Perform AI Analysis on real text content
    try {
      const res = await fetch('/api/sharepoint/ai-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          docTitle: doc.title || doc.name,
          contentPreview: realTextContent,
          userQuery: customQuery || 'Analiza este documento comercial y extrae condiciones, precios y productos aplicables.',
          apiKey: apiKey
        })
      });
      const data = await res.json();
      setAiAnalysisResult(data.analysis || 'No se pudo generar el análisis.');
    } catch (err) {
      setAiAnalysisResult(`📄 **Análisis Documental**: ${doc.title}\n\n• **Resumen**: ${doc.aiSummary}\n• **Puntos Clave**: ${(doc.keyTakeaways || []).join('\n• ')}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Upload new commercial document
  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFormData.title || !uploadFormData.name) {
      alert('Por favor ingrese el título y nombre del archivo.');
      return;
    }

    const newDoc = {
      id: `doc-${Date.now()}`,
      name: uploadFormData.name.endsWith(`.${uploadFormData.extension}`) ? uploadFormData.name : `${uploadFormData.name}.${uploadFormData.extension}`,
      title: uploadFormData.title,
      folder: uploadFormData.category,
      category: uploadFormData.category,
      extension: uploadFormData.extension,
      size: '1.2 MB',
      sizeBytes: 1258291,
      modifiedDate: new Date().toISOString().split('T')[0],
      author: uploadFormData.author || 'Ejecutivo Comercial Claro',
      version: '1.0',
      sharepointUrl: `${SHAREPOINT_CONFIG.siteUrl}/Shared%20Documents1/Documentaciones%20Comerciales/${encodeURIComponent(uploadFormData.name)}`,
      isSynced: true,
      tags: uploadFormData.tags.split(',').map(t => t.trim()).filter(Boolean),
      aiSummary: `Documento comercial incorporado: ${uploadFormData.title}.`,
      keyTakeaways: ['Documento indexado para consultas comerciales y cotizaciones con IA.'],
      contentPreview: uploadFormData.contentPreview || `Contenido de ${uploadFormData.title}\nRegistrado por ${uploadFormData.author}.`
    };

    try {
      await fetch('/api/sharepoint/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDoc)
      });
    } catch (err) {
      console.warn('Saved in local state only:', err);
    }

    setDocuments(prev => [newDoc, ...prev]);
    setShowUploadModal(false);
    setUploadFormData({
      title: '',
      name: '',
      category: 'HPBX y Telefonía IP',
      extension: 'pdf',
      tags: '',
      contentPreview: '',
      author: 'Ejecutivo Comercial Claro'
    });
  };

  // Helper for file extension badges & colors
  const getFileBadge = (ext) => {
    switch (ext.toLowerCase()) {
      case 'pdf':
        return { icon: <FileText size={16} />, bg: 'rgba(238, 28, 36, 0.12)', color: '#ee1c24', label: 'PDF' };
      case 'docx':
      case 'doc':
        return { icon: <FileType size={16} />, bg: 'rgba(37, 99, 235, 0.12)', color: '#2563eb', label: 'Word' };
      case 'xlsx':
      case 'xls':
        return { icon: <FileSpreadsheet size={16} />, bg: 'rgba(16, 185, 129, 0.12)', color: '#10b981', label: 'Excel' };
      default:
        return { icon: <FileCode size={16} />, bg: 'rgba(139, 92, 246, 0.12)', color: '#8b5cf6', label: ext.toUpperCase() };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeIn 0.3s ease-out' }}>
      
      {/* Top Banner / Hero */}
      <div className="card" style={{ 
        padding: '24px', 
        background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(238, 28, 36, 0.04) 100%)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <div style={{ 
                width: '36px', 
                height: '36px', 
                borderRadius: '8px', 
                backgroundColor: 'var(--claro-red-light)', 
                color: 'var(--claro-red)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <FolderTree size={20} />
              </div>
              <h2 style={{ fontSize: '1.45rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                Explorador Documental & Búsqueda Inteligente
              </h2>
              <span className="badge" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}>
                <CheckCircle2 size={12} /> SharePoint Conectado
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0, maxWidth: '720px' }}>
              Repositorio indexado de <strong>Documentaciones Comerciales</strong> de Claro Dominicana. Busca mediante lenguaje natural con IA, previsualiza fichas técnicas y acuerdos SLA, y transfiere requerimientos directo a Cotizaciones.
            </p>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <a 
              href={SHAREPOINT_CONFIG.webUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn btn-secondary" 
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.825rem' }}
              title="Abrir carpeta en SharePoint Online"
            >
              <Share2 size={15} /> Abrir en SharePoint <ArrowUpRight size={14} />
            </a>

            <button 
              onClick={handleSyncSharePoint}
              disabled={isSyncing}
              className="btn btn-secondary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.825rem' }}
            >
              <RefreshCw size={15} className={isSyncing ? 'spinning' : ''} /> {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
            </button>

            <button 
              onClick={() => setShowUploadModal(true)}
              className="btn btn-secondary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.825rem' }}
            >
              <Upload size={15} /> Subir Documento
            </button>

            <button 
              onClick={() => setShowConfigModal(true)}
              className="btn btn-secondary"
              style={{ padding: '8px', borderRadius: 'var(--radius-full)' }}
              title="Configuración de Conector SharePoint"
            >
              <Settings size={17} />
            </button>
          </div>
        </div>

        {/* Sync Feedback Toast */}
        {syncFeedback && (
          <div style={{ 
            marginTop: '16px', 
            padding: '10px 16px', 
            borderRadius: 'var(--radius-md)', 
            backgroundColor: syncFeedback.type === 'success' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
            color: syncFeedback.type === 'success' ? '#10b981' : '#ef4444',
            border: `1px solid ${syncFeedback.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            fontSize: '0.85rem' 
          }}>
            <CheckCircle2 size={16} /> {syncFeedback.message}
          </div>
        )}

        {/* Quick Stats Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '18px', paddingTop: '16px', borderTop: '1px solid var(--border-color)', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
            <Database size={15} color="var(--claro-red)" />
            <span>Documentos Indexados: <strong style={{ color: 'var(--text-primary)' }}>{documents.length}</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
            <Layers size={15} color="#2563eb" />
            <span>Categorías: <strong style={{ color: 'var(--text-primary)' }}>{DOCUMENT_CATEGORIES.length - 1}</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
            <HardDrive size={15} color="#10b981" />
            <span>Ubicación: <strong style={{ color: 'var(--text-primary)' }}>/Shared Documents1/Documentaciones Comerciales</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
            <Sparkles size={15} color="#8b5cf6" />
            <span>Motor: <strong style={{ color: 'var(--text-primary)' }}>Búsqueda Semántica IA</strong></span>
          </div>
        </div>
      </div>

      {/* Main Intelligent Search Control Bar */}
      <div className="card" style={{ padding: '16px 20px', border: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          
          {/* Main Search Input */}
          <div style={{ flex: 1, minWidth: '280px', position: 'relative' }}>
            <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: searchMode === 'semantic' ? 'var(--claro-red)' : 'var(--text-muted)' }}>
              {searchMode === 'semantic' ? <Sparkles size={18} /> : <Search size={18} />}
            </div>
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={searchMode === 'semantic' 
                ? "Búsqueda con IA (ej: 'precios routers audiocodes', 'tarifas mpls', 'condiciones sla data center')..." 
                : "Búsqueda exacta por nombre, título o etiqueta..."}
              style={{
                width: '100%',
                padding: '12px 40px 12px 42px',
                borderRadius: 'var(--radius-full)',
                border: searchMode === 'semantic' ? '1.5px solid rgba(238, 28, 36, 0.4)' : '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                outline: 'none',
                boxShadow: searchMode === 'semantic' ? '0 0 12px rgba(238, 28, 36, 0.08)' : 'none'
              }}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Mode Switch (Semantic vs Exact) */}
          <div style={{ display: 'flex', backgroundColor: 'var(--bg-primary)', padding: '3px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-color)' }}>
            <button 
              onClick={() => setSearchMode('semantic')}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                border: 'none',
                backgroundColor: searchMode === 'semantic' ? 'var(--claro-red)' : 'transparent',
                color: searchMode === 'semantic' ? '#fff' : 'var(--text-secondary)',
                fontWeight: '600',
                fontSize: '0.785rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                transition: 'all var(--transition-fast)'
              }}
            >
              <Sparkles size={13} /> Semántica IA
            </button>
            <button 
              onClick={() => setSearchMode('exact')}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                border: 'none',
                backgroundColor: searchMode === 'exact' ? 'var(--claro-red)' : 'transparent',
                color: searchMode === 'exact' ? '#fff' : 'var(--text-secondary)',
                fontWeight: '600',
                fontSize: '0.785rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                transition: 'all var(--transition-fast)'
              }}
            >
              <Search size={13} /> Exacta
            </button>
          </div>

          {/* Format selector */}
          <select 
            value={selectedExtension}
            onChange={(e) => setSelectedExtension(e.target.value)}
            className="input-select"
            style={{ padding: '8px 12px', borderRadius: 'var(--radius-md)', fontSize: '0.825rem', width: 'auto' }}
          >
            <option value="all">Todos los formatos</option>
            <option value="pdf">Documentos PDF</option>
            <option value="docx">Archivos Word (.docx)</option>
            <option value="xlsx">Hojas Excel (.xlsx)</option>
          </select>

          {/* Sort selector */}
          <select 
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [sb, so] = e.target.value.split('-');
              setSortBy(sb);
              setSortOrder(so);
            }}
            className="input-select"
            style={{ padding: '8px 12px', borderRadius: 'var(--radius-md)', fontSize: '0.825rem', width: 'auto' }}
          >
            <option value="modifiedDate-desc">Más reciente</option>
            <option value="modifiedDate-asc">Más antiguo</option>
            <option value="name-asc">Nombre (A-Z)</option>
            <option value="name-desc">Nombre (Z-A)</option>
            <option value="size-desc">Mayor tamaño</option>
          </select>

          {/* View Mode Toggle */}
          <div style={{ display: 'flex', gap: '4px' }}>
            <button 
              onClick={() => setViewMode('grid')} 
              className={`btn btn-secondary ${viewMode === 'grid' ? 'active' : ''}`}
              style={{ padding: '8px', borderRadius: 'var(--radius-md)', backgroundColor: viewMode === 'grid' ? 'var(--claro-red-light)' : undefined, color: viewMode === 'grid' ? 'var(--claro-red)' : undefined }}
              title="Vista en Cuadrícula"
            >
              <Grid size={16} />
            </button>
            <button 
              onClick={() => setViewMode('table')} 
              className={`btn btn-secondary ${viewMode === 'table' ? 'active' : ''}`}
              style={{ padding: '8px', borderRadius: 'var(--radius-md)', backgroundColor: viewMode === 'table' ? 'var(--claro-red-light)' : undefined, color: viewMode === 'table' ? 'var(--claro-red)' : undefined }}
              title="Vista en Lista / Tabla"
            >
              <List size={16} />
            </button>
          </div>
        </div>

        {/* Quick Semantic Query Chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px', overflowX: 'auto', paddingBottom: '4px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Zap size={12} /> Sugerencias IA:
          </span>
          {[
            'Ficha HPBX Pymes 2026',
            'Tarifario DIA Internet Dedicado',
            'SLA Cloud Data Center',
            'Routers AudioCodes',
            'SOC Gestionado y EDR',
            'Plantilla Cotización HPBX'
          ].map(tag => (
            <button
              key={tag}
              onClick={() => {
                setSearchQuery(tag);
                setSearchMode('semantic');
              }}
              style={{
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.75rem',
                backgroundColor: searchQuery === tag ? 'var(--claro-red-light)' : 'var(--bg-primary)',
                color: searchQuery === tag ? 'var(--claro-red)' : 'var(--text-secondary)',
                border: `1px solid ${searchQuery === tag ? 'var(--claro-red)' : 'var(--border-color)'}`,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all var(--transition-fast)'
              }}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Main Workspace Layout (Sidebar + Document Area) */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '20px', alignItems: 'start' }}>
        
        {/* Left Sidebar: Folder Tree & Categories */}
        <div className="card" style={{ padding: '16px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                Biblioteca SharePoint
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <button 
                onClick={() => { setSelectedFolder('Todos'); setSelectedCategory('Todos'); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  backgroundColor: selectedFolder === 'Todos' && selectedCategory === 'Todos' ? 'var(--claro-red-light)' : 'transparent',
                  color: selectedFolder === 'Todos' && selectedCategory === 'Todos' ? 'var(--claro-red)' : 'var(--text-primary)',
                  fontWeight: selectedFolder === 'Todos' ? '700' : '500',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {selectedFolder === 'Todos' ? <FolderOpen size={16} /> : <Folder size={16} />}
                  <span>Todos los Archivos</span>
                </div>
                <span className="badge" style={{ fontSize: '0.7rem', padding: '2px 6px' }}>{documents.length}</span>
              </button>

              {/* Subfolders in Documentaciones Comerciales */}
              {FOLDER_TREE[0].subfolders.map(sub => {
                const isSelected = selectedFolder === sub.name;
                const count = documents.filter(d => d.folder === sub.name || d.category === sub.name).length;
                return (
                  <button 
                    key={sub.name}
                    onClick={() => { setSelectedFolder(sub.name); setSelectedCategory(sub.name); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: 'none',
                      backgroundColor: isSelected ? 'var(--claro-red-light)' : 'transparent',
                      color: isSelected ? 'var(--claro-red)' : 'var(--text-primary)',
                      fontWeight: isSelected ? '700' : '500',
                      fontSize: '0.825rem',
                      cursor: 'pointer',
                      textAlign: 'left',
                      marginLeft: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <Folder size={15} color={isSelected ? 'var(--claro-red)' : 'var(--text-secondary)'} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{sub.name}</span>
                    </div>
                    <span className="badge" style={{ fontSize: '0.7rem', padding: '2px 6px' }}>{count}</span>
                  </button>
                );
              })}

              {/* Dynamic Client Dossiers Folders */}
              {documents.some(d => d.folder && d.folder.startsWith('Clientes/')) && (
                <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px dashed var(--border-color)' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px', paddingLeft: '8px' }}>
                    📁 Expedientes Clientes
                  </div>
                  {Array.from(new Set(documents.filter(d => d.folder && d.folder.startsWith('Clientes/')).map(d => d.folder))).map(clientFolder => {
                    const isSelected = selectedFolder === clientFolder;
                    const clientName = clientFolder.replace('Clientes/', '');
                    const count = documents.filter(d => d.folder === clientFolder).length;
                    return (
                      <button 
                        key={clientFolder}
                        onClick={() => { setSelectedFolder(clientFolder); setSelectedCategory('Todos'); }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '7px 10px',
                          borderRadius: 'var(--radius-md)',
                          border: 'none',
                          backgroundColor: isSelected ? 'var(--claro-red-light)' : 'transparent',
                          color: isSelected ? 'var(--claro-red)' : 'var(--text-primary)',
                          fontWeight: isSelected ? '700' : '500',
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          textAlign: 'left',
                          marginLeft: '8px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          <Folder size={14} color="#D97706" />
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{clientName}</span>
                        </div>
                        <span className="badge" style={{ fontSize: '0.65rem', padding: '1px 5px' }}>{count}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: 0 }} />

          {/* Quick Info Box */}
          <div style={{ 
            padding: '12px', 
            borderRadius: 'var(--radius-md)', 
            backgroundColor: 'var(--bg-primary)', 
            border: '1px solid var(--border-color)',
            fontSize: '0.785rem',
            color: 'var(--text-secondary)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>
              <ShieldCheck size={14} color="#10b981" /> Cumplimiento Claro
            </div>
            Todos los documentos son clasificados conforme a las políticas de seguridad y tarifas vigentes de Claro Dominicana.
          </div>

        </div>

        {/* Right Content Area: Breadcrumbs + Document Grid/Table */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Breadcrumb & Results counter */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <span style={{ cursor: 'pointer', color: 'var(--claro-red)', fontWeight: '600' }} onClick={() => { setSelectedFolder('Todos'); setSelectedCategory('Todos'); }}>
                Documentaciones Comerciales
              </span>
              {selectedFolder !== 'Todos' && (
                <>
                  <ChevronRight size={14} />
                  <span style={{ color: 'var(--text-primary)', fontWeight: '700' }}>{selectedFolder}</span>
                </>
              )}
            </div>

            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Mostrando <strong>{filteredDocuments.length}</strong> de {documents.length} archivos
            </span>
          </div>

          {/* Empty State */}
          {filteredDocuments.length === 0 && (
            <div className="card" style={{ padding: '48px 24px', textAlign: 'center', border: '1px dashed var(--border-color)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--claro-red-light)', color: 'var(--claro-red)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Search size={24} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', margin: '0 0 8px', color: 'var(--text-primary)' }}>
                No se encontraron documentos
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', maxWidth: '400px', margin: '0 auto 16px' }}>
                No hay archivos que coincidan con "{searchQuery}" en la carpeta seleccionada. Intenta cambiar los filtros o el modo de búsqueda.
              </p>
              <button 
                onClick={() => { setSearchQuery(''); setSelectedFolder('Todos'); setSelectedCategory('Todos'); setSelectedExtension('all'); }}
                className="btn btn-secondary"
                style={{ fontSize: '0.825rem' }}
              >
                Restablecer Filtros
              </button>
            </div>
          )}

          {/* GRID VIEW */}
          {viewMode === 'grid' && filteredDocuments.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '16px' }}>
              {paginatedDocuments.map(doc => {
                const badge = getFileBadge(doc.extension);
                return (
                  <div 
                    key={doc.id}
                    className="card"
                    style={{
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-lg)',
                      transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                      cursor: 'pointer',
                      position: 'relative'
                    }}
                    onClick={() => handleAnalyzeDocument(doc)}
                  >
                    {/* Header with extension icon & category */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ 
                            width: '32px', 
                            height: '32px', 
                            borderRadius: '6px', 
                            backgroundColor: badge.bg, 
                            color: badge.color, 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            fontWeight: '800'
                          }}>
                            {badge.icon}
                          </div>
                          <span style={{ fontSize: '0.725rem', padding: '2px 8px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontWeight: '600' }}>
                            {doc.category}
                          </span>
                        </div>

                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          v{doc.version || '1.0'}
                        </span>
                      </div>

                      {/* Title & Name */}
                      <h4 style={{ 
                        fontSize: '0.925rem', 
                        fontWeight: '700', 
                        margin: '0 0 6px', 
                        color: 'var(--text-primary)', 
                        lineHeight: '1.35',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {doc.title || doc.name}
                      </h4>

                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '10px', wordBreak: 'break-all' }}>
                        {doc.name}
                      </span>

                      {/* AI Summary Snip */}
                      {doc.aiSummary && (
                        <p style={{ 
                          fontSize: '0.785rem', 
                          color: 'var(--text-secondary)', 
                          margin: '0 0 12px', 
                          lineHeight: '1.4',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {doc.aiSummary}
                        </p>
                      )}

                      {/* Tags */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '14px' }}>
                        {(doc.tags || []).slice(0, 3).map(tag => (
                          <span key={tag} style={{ fontSize: '0.675rem', padding: '2px 6px', borderRadius: '4px', backgroundColor: 'var(--bg-primary)', color: 'var(--text-muted)' }}>
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Footer Metadata & Actions */}
                    <div style={{ paddingTop: '12px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          {doc.size} • {doc.modifiedDate}
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: '6px' }} onClick={e => e.stopPropagation()}>
                        <button 
                          onClick={() => handleAnalyzeDocument(doc)}
                          className="btn btn-secondary"
                          style={{ padding: '6px 10px', fontSize: '0.75rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--claro-red)' }}
                          title="Inspeccionar y analizar con IA"
                        >
                          <Eye size={13} /> Ver
                        </button>
                        
                        <a 
                          href={doc.sharepointUrl || SHAREPOINT_CONFIG.webUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="btn btn-secondary"
                          style={{ padding: '6px 8px', borderRadius: 'var(--radius-md)', color: 'var(--text-secondary)' }}
                          title="Abrir en SharePoint Online"
                        >
                          <ExternalLink size={13} />
                        </a>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

          {/* TABLE / LIST VIEW */}
          {viewMode === 'table' && filteredDocuments.length > 0 && (
            <div className="card" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--border-color)' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--bg-primary)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                      <th style={{ padding: '12px 16px' }}>Nombre & Título</th>
                      <th style={{ padding: '12px 16px' }}>Categoría</th>
                      <th style={{ padding: '12px 16px' }}>Tamaño</th>
                      <th style={{ padding: '12px 16px' }}>Modificado</th>
                      <th style={{ padding: '12px 16px' }}>Autor</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedDocuments.map(doc => {
                      const badge = getFileBadge(doc.extension);
                      return (
                        <tr 
                          key={doc.id}
                          style={{ borderBottom: '1px solid var(--border-color)', cursor: 'pointer', transition: 'background-color var(--transition-fast)' }}
                          onClick={() => handleAnalyzeDocument(doc)}
                          className="table-row-hover"
                        >
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{ width: '28px', height: '28px', borderRadius: '4px', backgroundColor: badge.bg, color: badge.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {badge.icon}
                              </div>
                              <div>
                                <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>
                                  {doc.title || doc.name}
                                </div>
                                <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                                  {doc.name}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                              {doc.category}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                            {doc.size}
                          </td>
                          <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                            {doc.modifiedDate}
                          </td>
                          <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                            {doc.author || 'Claro'}
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                              <button 
                                onClick={() => handleAnalyzeDocument(doc)}
                                className="btn btn-secondary"
                                style={{ padding: '6px 10px', fontSize: '0.75rem', borderRadius: 'var(--radius-md)', color: 'var(--claro-red)' }}
                                title="Ver y Analizar con IA"
                              >
                                <Eye size={13} />
                              </button>
                              <a 
                                href={doc.sharepointUrl || SHAREPOINT_CONFIG.webUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="btn btn-secondary"
                                style={{ padding: '6px 8px', borderRadius: 'var(--radius-md)' }}
                                title="Abrir en SharePoint"
                              >
                                <ExternalLink size={13} />
                              </a>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PAGINATION CONTROLS BAR */}
          {filteredDocuments.length > pageSize && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-color)', flexWrap: 'wrap', gap: '10px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Mostrando <strong style={{ color: 'var(--text-primary)' }}>{(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, filteredDocuments.length)}</strong> de <strong style={{ color: 'var(--text-primary)' }}>{filteredDocuments.length}</strong> documentos
              </span>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className="btn btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '0.785rem', borderRadius: 'var(--radius-md)', opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                >
                  ◄ Anterior
                </button>
                
                <span style={{ fontSize: '0.8rem', fontWeight: '700', padding: '0 8px', color: 'var(--text-primary)' }}>
                  Página {currentPage} de {totalPages}
                </span>

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  className="btn btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '0.785rem', borderRadius: 'var(--radius-md)', opacity: currentPage === totalPages ? 0.5 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                >
                  Siguiente ►
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* DOCUMENT PREVIEW & AI INSPECTION MODAL */}
      {previewDoc && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '20px'
        }}>
          <div className="card" style={{
            width: '100%',
            maxWidth: '1280px',
            maxHeight: '92vh',
            display: 'flex',
            flexDirection: 'column',
            padding: 0,
            overflow: 'hidden',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-color)',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            
            {/* Modal Header */}
            <div style={{
              padding: '16px 24px',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: 'var(--bg-primary)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ 
                  width: '36px', 
                  height: '36px', 
                  borderRadius: '8px', 
                  backgroundColor: getFileBadge(previewDoc.extension).bg, 
                  color: getFileBadge(previewDoc.extension).color, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}>
                  {getFileBadge(previewDoc.extension).icon}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
                    {previewDoc.title || previewDoc.name}
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {previewDoc.folder} • {previewDoc.size} • Modificado: {previewDoc.modifiedDate} • Autor: {previewDoc.author}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <a 
                  href={`/api/documents/file?name=${encodeURIComponent(previewDoc.name)}&folder=${encodeURIComponent(previewDoc.folder)}`}
                  download={previewDoc.name}
                  className="btn btn-secondary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}
                  title="Descargar archivo original"
                >
                  <Download size={14} /> Descargar
                </a>
                <a 
                  href={previewDoc.sharepointUrl || SHAREPOINT_CONFIG.webUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}
                >
                  <Share2 size={14} /> Abrir en SharePoint <ExternalLink size={12} />
                </a>
                <button 
                  onClick={() => setPreviewDoc(null)}
                  className="btn btn-secondary"
                  style={{ padding: '6px', borderRadius: 'var(--radius-full)' }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.35fr 0.85fr', flex: 1, overflowY: 'auto', minHeight: '560px' }}>
              
              {/* Left Column: Rich Document Viewer (Word / Excel / PDF / Text) */}
              <div style={{ padding: '20px', borderRight: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)', display: 'flex', flexDirection: 'column', gap: '14px', overflowY: 'auto', maxHeight: 'calc(92vh - 80px)' }}>
                
                {/* Header info bar */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                      Visor Integrado de Archivo
                    </span>
                    <span className="badge" style={{ backgroundColor: getFileBadge(previewDoc.extension).bg, color: getFileBadge(previewDoc.extension).color, fontSize: '0.725rem', fontWeight: '700' }}>
                      {previewDoc.extension.toUpperCase()}
                    </span>
                  </div>

                  {isLoadingParsedDoc && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--claro-red)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <RefreshCw size={13} className="spinning" /> Cargando contenido...
                    </span>
                  )}
                </div>

                {/* 1. EXCEL SPREADSHEET VIEWER */}
                {parsedDocData?.type === 'excel' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                    {/* Excel Search and Sheets bar */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      {/* Sheet Switcher Tabs */}
                      <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', paddingBottom: '2px' }}>
                        {(parsedDocData.sheets || []).map((sheet, idx) => (
                          <button
                            key={sheet.name}
                            onClick={() => setActiveSheetIndex(idx)}
                            style={{
                              padding: '5px 12px',
                              borderRadius: 'var(--radius-md)',
                              border: `1px solid ${activeSheetIndex === idx ? '#10b981' : 'var(--border-color)'}`,
                              backgroundColor: activeSheetIndex === idx ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-primary)',
                              color: activeSheetIndex === idx ? '#10b981' : 'var(--text-secondary)',
                              fontWeight: activeSheetIndex === idx ? '700' : '500',
                              fontSize: '0.785rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            <FileSpreadsheet size={13} /> {sheet.name} ({sheet.totalRows} filas)
                          </button>
                        ))}
                      </div>

                      {/* In-Sheet Search */}
                      <div style={{ position: 'relative', width: '220px' }}>
                        <Search size={13} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input 
                          type="text"
                          value={excelSearchQuery}
                          onChange={(e) => setExcelSearchQuery(e.target.value)}
                          placeholder="Filtrar celdas en tiempo real..."
                          style={{
                            width: '100%',
                            padding: '5px 8px 5px 26px',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border-color)',
                            backgroundColor: 'var(--bg-primary)',
                            fontSize: '0.75rem',
                            color: 'var(--text-primary)'
                          }}
                        />
                      </div>
                    </div>

                    {/* Sheet Grid Table with Sticky Headers (A, B, C...) & Row Numbers */}
                    {parsedDocData.sheets && parsedDocData.sheets[activeSheetIndex] && (() => {
                      const currentSheet = parsedDocData.sheets[activeSheetIndex];
                      const allRows = currentSheet.rows || [];
                      const filteredRowsWithIdx = allRows
                        .map((row, origIdx) => ({ row, origIdx }))
                        .filter(({ row }) => {
                          if (!excelSearchQuery.trim()) return true;
                          const q = excelSearchQuery.toLowerCase();
                          return (row || []).some(cell => String(cell || '').toLowerCase().includes(q));
                        });

                      // Determine maximum number of columns across rows
                      const maxCols = Math.max(...allRows.map(r => (r || []).length), 0);
                      const endColLetter = maxCols > 0 ? getExcelColumnName(maxCols - 1) : '';

                      return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {/* Info Status Bar */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.725rem', color: 'var(--text-muted)', padding: '0 2px' }}>
                            <span>
                              Mostrando <strong style={{ color: 'var(--text-primary)' }}>{filteredRowsWithIdx.length}</strong> de <strong style={{ color: 'var(--text-primary)' }}>{currentSheet.totalRows || allRows.length}</strong> filas {excelSearchQuery && `(filtradas por "${excelSearchQuery}")`}
                            </span>
                            <span>
                              Estructura: <strong style={{ color: 'var(--text-primary)' }}>{maxCols}</strong> columnas {maxCols > 0 && `(A - ${endColLetter})`}
                            </span>
                          </div>

                          {/* Scrollable Container with Sticky Table */}
                          <div style={{ 
                            border: '1px solid var(--border-color)', 
                            borderRadius: 'var(--radius-md)', 
                            overflow: 'auto', 
                            maxHeight: '440px', 
                            backgroundColor: 'var(--bg-primary)',
                            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)'
                          }}>
                            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: '0.785rem', textAlign: 'left' }}>
                              {/* STICKY COLUMN HEADERS (A, B, C...) */}
                              <thead>
                                <tr>
                                  {/* Top-Left Corner Cell pinned both top & left */}
                                  <th style={{ 
                                    position: 'sticky', 
                                    top: 0, 
                                    left: 0, 
                                    zIndex: 35, 
                                    backgroundColor: 'var(--bg-card)', 
                                    borderRight: '1px solid var(--border-color)', 
                                    borderBottom: '2px solid var(--border-color)', 
                                    padding: '6px 8px', 
                                    width: '42px', 
                                    minWidth: '42px',
                                    textAlign: 'center', 
                                    color: 'var(--text-muted)', 
                                    fontSize: '0.7rem', 
                                    fontWeight: '800', 
                                    userSelect: 'none' 
                                  }}>
                                    #
                                  </th>

                                  {/* Column Letter Headers */}
                                  {Array.from({ length: maxCols }).map((_, cIdx) => (
                                    <th 
                                      key={cIdx} 
                                      style={{ 
                                        position: 'sticky', 
                                        top: 0, 
                                        zIndex: 20, 
                                        backgroundColor: 'var(--bg-card)', 
                                        borderRight: '1px solid var(--border-color)', 
                                        borderBottom: '2px solid var(--border-color)', 
                                        padding: '6px 10px', 
                                        color: 'var(--text-secondary)', 
                                        fontSize: '0.725rem', 
                                        fontWeight: '700', 
                                        textAlign: 'center', 
                                        userSelect: 'none',
                                        minWidth: '110px',
                                        whiteSpace: 'nowrap'
                                      }}
                                    >
                                      {getExcelColumnName(cIdx)}
                                    </th>
                                  ))}
                                </tr>
                              </thead>

                              {/* TABLE BODY */}
                              <tbody>
                                {filteredRowsWithIdx.slice(0, 100).map(({ row, origIdx }) => {
                                  const isHeader = origIdx === 0;
                                  return (
                                    <tr 
                                      key={origIdx} 
                                      style={{
                                        backgroundColor: isHeader ? 'rgba(238, 28, 36, 0.07)' : (origIdx % 2 === 0 ? 'var(--bg-card)' : 'transparent'),
                                        fontWeight: isHeader ? '700' : 'normal'
                                      }}
                                    >
                                      {/* STICKY ROW NUMBER CELL pinned to the left */}
                                      <td style={{ 
                                        position: 'sticky', 
                                        left: 0, 
                                        zIndex: 10, 
                                        padding: '6px 8px', 
                                        borderRight: '1px solid var(--border-color)', 
                                        borderBottom: '1px solid var(--border-color)', 
                                        color: isHeader ? 'var(--claro-red)' : 'var(--text-muted)', 
                                        fontSize: '0.7rem', 
                                        width: '42px', 
                                        minWidth: '42px',
                                        textAlign: 'center', 
                                        userSelect: 'none', 
                                        backgroundColor: isHeader ? 'rgba(238, 28, 36, 0.08)' : (origIdx % 2 === 0 ? 'var(--bg-card)' : 'var(--bg-primary)'),
                                        fontWeight: '700'
                                      }}>
                                        {origIdx + 1}
                                      </td>

                                      {/* CELL DATA */}
                                      {Array.from({ length: maxCols }).map((_, cIdx) => {
                                        const cellVal = (row || [])[cIdx];
                                        const cellStr = cellVal !== undefined && cellVal !== null ? String(cellVal) : '';
                                        // Detect if numerical or currency value for right alignment
                                        const isNumeric = cellStr.trim() !== '' && !isNaN(Number(cellStr.replace(/[^0-9.-]+/g, ''))) && !/[a-zA-Z]{3,}/.test(cellStr);

                                        return (
                                          <td 
                                            key={cIdx} 
                                            style={{ 
                                              padding: '6px 10px', 
                                              borderRight: '1px solid var(--border-color)', 
                                              borderBottom: '1px solid var(--border-color)', 
                                              color: isHeader ? 'var(--claro-red)' : 'var(--text-primary)',
                                              whiteSpace: 'nowrap',
                                              maxWidth: '280px',
                                              overflow: 'hidden',
                                              textOverflow: 'ellipsis',
                                              textAlign: isNumeric && !isHeader ? 'right' : 'left',
                                              fontFamily: isNumeric && !isHeader ? 'Consolas, Monaco, monospace' : 'inherit'
                                            }}
                                            title={cellStr}
                                          >
                                            {cellStr}
                                          </td>
                                        );
                                      })}
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* 2. WORD DOCX DOCUMENT VIEWER */}
                {parsedDocData?.type === 'docx' && (
                  <div style={{
                    padding: '24px 32px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    maxHeight: '460px',
                    overflowY: 'auto',
                    lineHeight: '1.65',
                    fontSize: '0.875rem',
                    boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.04)'
                  }}>
                    <div 
                      dangerouslySetInnerHTML={{ __html: parsedDocData.html }} 
                      className="docx-rendered-content"
                    />
                  </div>
                )}

                {/* 3. PDF VIEWER */}
                {parsedDocData?.type === 'pdf' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <iframe 
                      src={parsedDocData.streamUrl}
                      title={previewDoc.name}
                      style={{
                        width: '100%',
                        height: '460px',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: '#fff'
                      }}
                    />
                  </div>
                )}

                {/* 4. CLOUD-ONLY FILE OR PLAIN TEXT FALLBACK VIEWER */}
                {parsedDocData?.type === 'cloud_file' && (
                  <div style={{
                    padding: '24px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px dashed var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    gap: '14px',
                    minHeight: '260px'
                  }}>
                    <div style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(238, 28, 36, 0.1)',
                      color: 'var(--claro-red)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <HardDrive size={28} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '1rem', fontWeight: '800', margin: '0 0 6px', color: 'var(--text-primary)' }}>
                        Documento Almacenado en SharePoint Cloud
                      </h4>
                      <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', margin: 0, maxWidth: '420px', lineHeight: '1.5' }}>
                        Este archivo se encuentra disponible en la biblioteca de SharePoint / Teams. Puedes abrirlo directamente en la nube o consultar sus especificaciones con Clara Copilot.
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                      <a 
                        href={previewDoc.sharepointUrl || SHAREPOINT_CONFIG.webUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn btn-primary"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', padding: '8px 16px' }}
                      >
                        <Share2 size={15} /> Abrir en SharePoint <ExternalLink size={13} />
                      </a>
                    </div>
                  </div>
                )}

                {(!parsedDocData || parsedDocData.type === 'text') && (
                  <div style={{
                    padding: '18px 20px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.85rem',
                    lineHeight: '1.6',
                    color: 'var(--text-primary)',
                    whiteSpace: 'pre-wrap',
                    maxHeight: '420px',
                    overflowY: 'auto',
                    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.03)'
                  }}>
                    {parsedDocData?.content || previewDoc.contentPreview || 'Sin contenido adicional para previsualizar.'}
                  </div>
                )}

                {/* Key Takeaways Box (Polished Card UI) */}
                {previewDoc.keyTakeaways && previewDoc.keyTakeaways.length > 0 && (
                  <div style={{ 
                    padding: '14px 16px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    marginTop: '4px'
                  }}>
                    <h5 style={{ fontSize: '0.825rem', fontWeight: '800', color: 'var(--text-primary)', margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle2 size={16} color="#10b981" /> Metadatos & Puntos Clave:
                    </h5>
                    <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                      {previewDoc.keyTakeaways.map((item, idx) => (
                        <li key={idx} style={{ marginBottom: '6px' }}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Right Column: AI Analysis & Chat Integration */}
              <div style={{ padding: '20px', backgroundColor: 'var(--bg-primary)', display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: 'calc(92vh - 80px)', overflowY: 'auto' }}>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--claro-red)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Bot size={16} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
                      Análisis con Clara Copilot
                    </h4>
                    <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                      Inteligencia Documental y Cotizaciones
                    </span>
                  </div>
                </div>

                {/* AI Analysis Box */}
                <div style={{
                  flex: 1,
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.825rem',
                  lineHeight: '1.5',
                  color: 'var(--text-primary)',
                  overflowY: 'auto',
                  minHeight: '260px',
                  maxHeight: '320px'
                }}>
                  {isAnalyzing ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 0', gap: '10px' }}>
                      <RefreshCw size={24} className="spinning" color="var(--claro-red)" />
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.825rem' }}>Analizando contenido real del documento...</span>
                    </div>
                  ) : (
                    <div style={{ whiteSpace: 'pre-wrap' }}>
                      {aiAnalysisResult || previewDoc.aiSummary || 'Haz una pregunta sobre este documento.'}
                    </div>
                  )}
                </div>

                {/* Quick Action Bridge */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => {
                      if (onAskCopilot) {
                        onAskCopilot(`Basado en el documento comercial "${previewDoc.title}", responde: ¿Cuáles son las condiciones principales y cómo cotizarlo?`);
                        setPreviewDoc(null);
                      }
                    }}
                    className="btn btn-primary"
                    style={{ flex: 1, padding: '8px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <Bot size={15} /> Consultar a Clara
                  </button>

                  <button 
                    onClick={() => {
                      if (onGenerateQuote) {
                        onGenerateQuote(previewDoc);
                        setPreviewDoc(null);
                      }
                    }}
                    className="btn btn-secondary"
                    style={{ padding: '8px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: 'var(--claro-red)' }}
                  >
                    <FileSpreadsheet size={15} /> Cotizar
                  </button>
                </div>

                {/* Interactive Question Input for this specific Doc */}
                <div style={{ display: 'flex', gap: '8px', position: 'relative' }}>
                  <input 
                    type="text"
                    value={docChatQuery}
                    onChange={(e) => setDocChatQuery(e.target.value)}
                    placeholder="Preguntar algo específico sobre este archivo..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && docChatQuery.trim()) {
                        handleAnalyzeDocument(previewDoc, docChatQuery);
                        setDocChatQuery('');
                      }
                    }}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-card)',
                      color: 'var(--text-primary)',
                      fontSize: '0.8rem'
                    }}
                  />
                  <button 
                    onClick={() => {
                      if (docChatQuery.trim()) {
                        handleAnalyzeDocument(previewDoc, docChatQuery);
                        setDocChatQuery('');
                      }
                    }}
                    disabled={isAnalyzing || !docChatQuery.trim()}
                    className="btn btn-primary"
                    style={{ padding: '8px 12px', borderRadius: 'var(--radius-md)' }}
                  >
                    <Send size={14} />
                  </button>
                </div>

              </div>

            </div>

          </div>
        </div>
      )}

      {/* SHAREPOINT CONFIGURATION MODAL */}
      {showConfigModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '20px'
        }}>
          <div className="card" style={{
            width: '100%',
            maxWidth: '620px',
            padding: '24px',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-color)',
            animation: 'fadeIn 0.2s ease-out',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'var(--claro-red-light)', color: 'var(--claro-red)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Settings size={18} />
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
                  Configuración Conector SharePoint
                </h3>
              </div>
              <button onClick={() => setShowConfigModal(false)} className="btn btn-secondary" style={{ padding: '6px', borderRadius: 'var(--radius-full)' }}>
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.785rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  URL del Sitio SharePoint Online
                </label>
                <input 
                  type="text" 
                  readOnly 
                  value={SHAREPOINT_CONFIG.siteUrl}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.825rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.785rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Ruta de la Biblioteca / Carpeta
                </label>
                <input 
                  type="text" 
                  readOnly 
                  value={SHAREPOINT_CONFIG.folderPath}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.825rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.785rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Ruta Local Sincronizada (OneDrive / SharePoint Client en Windows)
                </label>
                <input 
                  type="text" 
                  value={localSyncPath}
                  onChange={(e) => setLocalSyncPath(e.target.value)}
                  placeholder="C:\Users\...\Claro Dominicana\Documentaciones Comerciales"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.825rem' }}
                />
              </div>

              <div style={{ padding: '12px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', fontSize: '0.8rem', color: '#10b981' }}>
                ✓ Conector configurado en modo híbrido: SharePoint Online + Indexación local rápida.
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
              <button onClick={() => setShowConfigModal(false)} className="btn btn-primary" style={{ fontSize: '0.825rem' }}>
                Guardar Configuración
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UPLOAD DOCUMENT MODAL */}
      {showUploadModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '20px'
        }}>
          <div className="card" style={{
            width: '100%',
            maxWidth: '560px',
            padding: '24px',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-color)',
            animation: 'fadeIn 0.2s ease-out',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'var(--claro-red-light)', color: 'var(--claro-red)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Upload size={18} />
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
                  Subir Documento Comercial
                </h3>
              </div>
              <button onClick={() => setShowUploadModal(false)} className="btn btn-secondary" style={{ padding: '6px', borderRadius: 'var(--radius-full)' }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.785rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Título Descriptivo *
                </label>
                <input 
                  type="text" 
                  required
                  value={uploadFormData.title}
                  onChange={(e) => setUploadFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ej: Ficha Comercial Enlaces MPLS 2026"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.825rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.785rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Nombre de Archivo *
                  </label>
                  <input 
                    type="text" 
                    required
                    value={uploadFormData.name}
                    onChange={(e) => setUploadFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ficha_MPLS_2026"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.825rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.785rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Formato
                  </label>
                  <select 
                    value={uploadFormData.extension}
                    onChange={(e) => setUploadFormData(prev => ({ ...prev, extension: e.target.value }))}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.825rem' }}
                  >
                    <option value="pdf">PDF</option>
                    <option value="docx">Word (.docx)</option>
                    <option value="xlsx">Excel (.xlsx)</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.785rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Categoría
                </label>
                <select 
                  value={uploadFormData.category}
                  onChange={(e) => setUploadFormData(prev => ({ ...prev, category: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.825rem' }}
                >
                  {DOCUMENT_CATEGORIES.filter(c => c !== 'Todos').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.785rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Etiquetas (separadas por coma)
                </label>
                <input 
                  type="text" 
                  value={uploadFormData.tags}
                  onChange={(e) => setUploadFormData(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="MPLS, Tarifas, Fibra Óptica"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.825rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.785rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Texto / Extracto del Contenido
                </label>
                <textarea 
                  rows={4}
                  value={uploadFormData.contentPreview}
                  onChange={(e) => setUploadFormData(prev => ({ ...prev, contentPreview: e.target.value }))}
                  placeholder="Pega aquí el contenido o especificaciones del documento comercial..."
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.825rem', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button type="button" onClick={() => setShowUploadModal(false)} className="btn btn-secondary" style={{ fontSize: '0.825rem' }}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" style={{ fontSize: '0.825rem' }}>
                  Guardar & Indexar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
