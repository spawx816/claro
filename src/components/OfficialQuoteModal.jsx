import React from 'react';
import { createPortal } from 'react-dom';
import { Printer, Download, X, FileSpreadsheet, CheckCircle2 } from 'lucide-react';
import { exportQuoteToExcel } from '../utils/exportQuoteToExcel';

export default function OfficialQuoteModal({ quote, onClose, isEmbedded = false }) {
  if (!quote) return null;

  const f = (val) => Number(val || 0).toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const isPymes = quote.type === 'PYMES';

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadExcel = () => {
    exportQuoteToExcel(quote);
  };

  const panelContent = (
    <div className="official-quote-modal-panel" style={{ maxWidth: '850px', margin: isEmbedded ? '0 auto' : undefined, padding: '0', borderRadius: '16px', overflow: 'hidden', border: isEmbedded ? '1px solid var(--border-color)' : undefined }}>
      
      {/* Top Control Bar (Hidden on Print) */}
      {!isEmbedded && (
        <div className="no-print" style={{ 
          backgroundColor: 'var(--bg-secondary)', 
          borderBottom: '1px solid var(--border-color)', 
          padding: '14px 20px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src="/claro-logo.png" alt="Claro" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
                Plantilla Oficial de Cotización Claro HPBX ({quote.type})
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Formato corporativo oficial de Compañía Dominicana de Teléfonos, S.A.
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button 
              onClick={handleDownloadExcel} 
              className="btn btn-secondary" 
              style={{ fontSize: '0.8rem', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}
              title="Descargar en formato Excel (.xlsx)"
            >
              <FileSpreadsheet size={15} color="#10B981" /> Descargar Excel
            </button>

            <button 
              onClick={handlePrint} 
              className="btn btn-primary" 
              style={{ fontSize: '0.8rem', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}
              title="Imprimir o Guardar en PDF"
            >
              <Printer size={15} /> Imprimir / PDF
            </button>

            <button 
              onClick={onClose} 
              className="btn btn-secondary" 
              style={{ padding: '6px 10px', fontSize: '0.9rem' }}
              title="Cerrar ventana"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

        {/* ============================================================ */}
        {/* OFFICIAL CLARO QUOTATION DOCUMENT SHEET (Printable Area) */}
        {/* ============================================================ */}
        <div id="official-claro-quote" style={{ 
          backgroundColor: '#FFFFFF', 
          color: '#111827', 
          padding: '24px 28px', 
          fontFamily: "'AMX', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          fontSize: '11px',
          lineHeight: '1.4'
        }}>

          {/* Header Banner */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #EE1C24', paddingBottom: '12px', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <img src="/claro-logo.png" alt="Claro" style={{ width: '56px', height: '56px', objectFit: 'contain' }} />
              <div>
                <h1 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#EE1C24', margin: 0, textTransform: 'uppercase', letterSpacing: '-0.02em' }}>
                  Compañía Dominicana de Teléfonos, S.A.
                </h1>
                <p style={{ margin: '2px 0 0 0', fontWeight: '700', color: '#4B5563', fontSize: '0.85rem' }}>
                  RNC: 10100157-7 | Claro Negocios República Dominicana
                </p>
                <span style={{ display: 'inline-block', marginTop: '3px', backgroundColor: '#FEE2E2', color: '#991B1B', padding: '1px 8px', borderRadius: '4px', fontWeight: '800', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  Propuesta Comercial Hosted PBX ({quote.type})
                </span>
              </div>
            </div>

            {/* Metadata Box */}
            <div style={{ textAlign: 'right', backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', padding: '8px 12px', borderRadius: '6px', minWidth: '190px' }}>
              <div style={{ marginBottom: '2px' }}>
                <span style={{ color: '#6B7280', fontWeight: '600' }}>Cotización No: </span>
                <strong style={{ color: '#111827' }}>{quote.customer?.quoteNo || 'COT-HPBX'}</strong>
              </div>
              <div style={{ marginBottom: '2px' }}>
                <span style={{ color: '#6B7280', fontWeight: '600' }}>Fecha: </span>
                <strong style={{ color: '#111827' }}>{quote.customer?.date || new Date().toLocaleDateString('es-DO')}</strong>
              </div>
              <div>
                <span style={{ color: '#6B7280', fontWeight: '600' }}>Validez: </span>
                <strong style={{ color: '#059669' }}>30 Días Calendario</strong>
              </div>
            </div>
          </div>

          {/* Customer Information Block */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1.3fr 1fr', 
            gap: '10px', 
            backgroundColor: '#F8FAFC', 
            border: '1px solid #CBD5E1', 
            borderRadius: '6px', 
            padding: '10px 14px', 
            marginBottom: '14px' 
          }}>
            <div>
              <div style={{ display: 'flex', marginBottom: '3px' }}>
                <span style={{ width: '75px', fontWeight: '700', color: '#475569' }}>Cliente:</span>
                <strong style={{ color: '#0F172A', textTransform: 'uppercase' }}>{quote.customer?.name}</strong>
              </div>
              <div style={{ display: 'flex', marginBottom: '3px' }}>
                <span style={{ width: '75px', fontWeight: '700', color: '#475569' }}>RNC:</span>
                <span style={{ color: '#334155' }}>{quote.customer?.rnc || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', marginBottom: '3px' }}>
                <span style={{ width: '75px', fontWeight: '700', color: '#475569' }}>Dirección:</span>
                <span style={{ color: '#334155' }}>{quote.customer?.address || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex' }}>
                <span style={{ width: '75px', fontWeight: '700', color: '#475569' }}>Contacto:</span>
                <span style={{ color: '#334155' }}>{quote.customer?.contact || quote.customer?.name}</span>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                <span style={{ fontWeight: '700', color: '#475569' }}>Localidades:</span>
                <span style={{ fontWeight: '600' }}>{quote.customer?.locations || 1}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                <span style={{ fontWeight: '700', color: '#475569' }}>Usuarios Activos:</span>
                <span style={{ fontWeight: '700', color: '#EE1C24' }}>{quote.customer?.activeUsers || 0}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                <span style={{ fontWeight: '700', color: '#475569' }}>Teléfonos IP:</span>
                <span style={{ fontWeight: '700' }}>{quote.customer?.ipPhones || 0}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: '700', color: '#475569' }}>Switches PoE:</span>
                <span style={{ fontWeight: '600' }}>{quote.customer?.switchesPoE || 0}</span>
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* SECTION 1: SERVICIOS RENTA */}
          {/* ============================================================ */}
          {quote.services && quote.services.length > 0 && (
            <div style={{ marginBottom: '14px' }}>
              <div style={{ backgroundColor: '#EE1C24', color: '#FFFFFF', padding: '5px 10px', fontWeight: '800', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between' }}>
                <span>HOSTED PBX - SERVICIOS RENTA</span>
                <span style={{ fontSize: '0.7rem', fontWeight: '600' }}>Impuestos: 30% (ITBIS 18% + CDT 2% + ISC 10%)</span>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem', border: '1px solid #E2E8F0' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F1F5F9', color: '#334155', borderBottom: '1px solid #CBD5E1' }}>
                    <th style={{ padding: '4px 6px', textAlign: 'left', width: '14%' }}>No. Parte</th>
                    <th style={{ padding: '4px 6px', textAlign: 'left', width: '42%' }}>Descripción</th>
                    <th style={{ padding: '4px 6px', textAlign: 'right', width: '12%' }}>Precio RD$</th>
                    <th style={{ padding: '4px 6px', textAlign: 'center', width: '8%' }}>Cant</th>
                    <th style={{ padding: '4px 6px', textAlign: 'right', width: '12%' }}>Sub-Total RD$</th>
                    <th style={{ padding: '4px 6px', textAlign: 'right', width: '12%' }}>IMP. (30%) RD$</th>
                  </tr>
                </thead>
                <tbody>
                  {quote.services.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9', backgroundColor: idx % 2 === 1 ? '#FAFAFA' : '#FFFFFF' }}>
                      <td style={{ padding: '4px 6px', fontWeight: '700', color: '#991B1B', fontFamily: 'monospace' }}>{item.partNumber}</td>
                      <td style={{ padding: '4px 6px', color: '#1F2937' }}>{item.description}</td>
                      <td style={{ padding: '4px 6px', textAlign: 'right' }}>${f(item.price)}</td>
                      <td style={{ padding: '4px 6px', textAlign: 'center', fontWeight: '700' }}>{item.qty}</td>
                      <td style={{ padding: '4px 6px', textAlign: 'right', fontWeight: '600' }}>${f(item.subTotal)}</td>
                      <td style={{ padding: '4px 6px', textAlign: 'right', color: '#64748B' }}>${f(item.tax)}</td>
                    </tr>
                  ))}
                  <tr style={{ backgroundColor: '#FFF1F2', borderTop: '2px solid #FECDD3', fontWeight: '800' }}>
                    <td colSpan={4} style={{ padding: '5px 8px', textAlign: 'right', color: '#991B1B' }}>SUBTOTAL SERVICIOS:</td>
                    <td style={{ padding: '5px 8px', textAlign: 'right', color: '#991B1B' }}>${f(quote.summary?.totalServicesNet)}</td>
                    <td style={{ padding: '5px 8px', textAlign: 'right', color: '#991B1B' }}>${f(quote.summary?.totalServicesTax)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* ============================================================ */}
          {/* SECTION 2: EQUIPOS ACCESO & TERMINALES RENTA */}
          {/* ============================================================ */}
          {quote.equipmentRental && quote.equipmentRental.length > 0 && (
            <div style={{ marginBottom: '14px' }}>
              <div style={{ backgroundColor: '#1E293B', color: '#FFFFFF', padding: '5px 10px', fontWeight: '800', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between' }}>
                <span>HOSTED PBX: EQUIPOS ACCESO & TERMINALES RENTA</span>
                <span style={{ fontSize: '0.7rem', fontWeight: '600' }}>Impuestos: 18% (ITBIS)</span>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem', border: '1px solid #E2E8F0' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F1F5F9', color: '#334155', borderBottom: '1px solid #CBD5E1' }}>
                    <th style={{ padding: '4px 6px', textAlign: 'left', width: '14%' }}>No. Parte</th>
                    <th style={{ padding: '4px 6px', textAlign: 'left', width: '42%' }}>Descripción</th>
                    <th style={{ padding: '4px 6px', textAlign: 'right', width: '12%' }}>Precio RD$</th>
                    <th style={{ padding: '4px 6px', textAlign: 'center', width: '8%' }}>Cant</th>
                    <th style={{ padding: '4px 6px', textAlign: 'right', width: '12%' }}>Sub-Total RD$</th>
                    <th style={{ padding: '4px 6px', textAlign: 'right', width: '12%' }}>ITBIS (18%) RD$</th>
                  </tr>
                </thead>
                <tbody>
                  {quote.equipmentRental.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9', backgroundColor: idx % 2 === 1 ? '#FAFAFA' : '#FFFFFF' }}>
                      <td style={{ padding: '4px 6px', fontWeight: '700', color: '#0F172A', fontFamily: 'monospace' }}>{item.partNumber}</td>
                      <td style={{ padding: '4px 6px', color: '#1F2937' }}>{item.description}</td>
                      <td style={{ padding: '4px 6px', textAlign: 'right' }}>${f(item.price)}</td>
                      <td style={{ padding: '4px 6px', textAlign: 'center', fontWeight: '700' }}>{item.qty}</td>
                      <td style={{ padding: '4px 6px', textAlign: 'right', fontWeight: '600' }}>${f(item.subTotal)}</td>
                      <td style={{ padding: '4px 6px', textAlign: 'right', color: '#64748B' }}>${f(item.tax)}</td>
                    </tr>
                  ))}
                  <tr style={{ backgroundColor: '#F8FAFC', borderTop: '2px solid #E2E8F0', fontWeight: '800' }}>
                    <td colSpan={4} style={{ padding: '5px 8px', textAlign: 'right', color: '#0F172A' }}>SUBTOTAL EQUIPOS RENTA:</td>
                    <td style={{ padding: '5px 8px', textAlign: 'right', color: '#0F172A' }}>${f(quote.summary?.totalEqRentalNet)}</td>
                    <td style={{ padding: '5px 8px', textAlign: 'right', color: '#0F172A' }}>${f(quote.summary?.totalEqRentalTax)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* ============================================================ */}
          {/* SECTION 3: VENTA DE EQUIPOS (SI APLICA) */}
          {/* ============================================================ */}
          {quote.equipmentSale && quote.equipmentSale.length > 0 && (
            <div style={{ marginBottom: '14px' }}>
              <div style={{ backgroundColor: '#334155', color: '#FFFFFF', padding: '5px 10px', fontWeight: '800', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between' }}>
                <span>VENTA DE EQUIPOS</span>
                <span style={{ fontSize: '0.7rem', fontWeight: '600' }}>Impuestos: 18% (ITBIS)</span>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem', border: '1px solid #E2E8F0' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F1F5F9', color: '#334155', borderBottom: '1px solid #CBD5E1' }}>
                    <th style={{ padding: '4px 6px', textAlign: 'left', width: '14%' }}>No. Parte</th>
                    <th style={{ padding: '4px 6px', textAlign: 'left', width: '42%' }}>Descripción</th>
                    <th style={{ padding: '4px 6px', textAlign: 'right', width: '12%' }}>Precio RD$</th>
                    <th style={{ padding: '4px 6px', textAlign: 'center', width: '8%' }}>Cant</th>
                    <th style={{ padding: '4px 6px', textAlign: 'right', width: '12%' }}>Sub-Total RD$</th>
                    <th style={{ padding: '4px 6px', textAlign: 'right', width: '12%' }}>ITBIS (18%) RD$</th>
                  </tr>
                </thead>
                <tbody>
                  {quote.equipmentSale.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '4px 6px', fontWeight: '700', fontFamily: 'monospace' }}>{item.partNumber}</td>
                      <td style={{ padding: '4px 6px' }}>{item.description}</td>
                      <td style={{ padding: '4px 6px', textAlign: 'right' }}>${f(item.price)}</td>
                      <td style={{ padding: '4px 6px', textAlign: 'center', fontWeight: '700' }}>{item.qty}</td>
                      <td style={{ padding: '4px 6px', textAlign: 'right', fontWeight: '600' }}>${f(item.subTotal)}</td>
                      <td style={{ padding: '4px 6px', textAlign: 'right' }}>${f(item.tax)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ============================================================ */}
          {/* SECTION 4: INSTALACION */}
          {/* ============================================================ */}
          {quote.installation && quote.installation.length > 0 && (
            <div style={{ marginBottom: '14px' }}>
              <div style={{ backgroundColor: '#0284C7', color: '#FFFFFF', padding: '5px 10px', fontWeight: '800', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between' }}>
                <span>INSTALACIÓN Y APROVISIONAMIENTO</span>
                <span style={{ fontSize: '0.7rem', fontWeight: '600' }}>Impuestos: 18% (ITBIS)</span>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem', border: '1px solid #E2E8F0' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F1F5F9', color: '#334155', borderBottom: '1px solid #CBD5E1' }}>
                    <th style={{ padding: '4px 6px', textAlign: 'left', width: '14%' }}>No. Parte</th>
                    <th style={{ padding: '4px 6px', textAlign: 'left', width: '42%' }}>Descripción</th>
                    <th style={{ padding: '4px 6px', textAlign: 'right', width: '12%' }}>Precio RD$</th>
                    <th style={{ padding: '4px 6px', textAlign: 'center', width: '8%' }}>Cant</th>
                    <th style={{ padding: '4px 6px', textAlign: 'right', width: '12%' }}>Sub-Total RD$</th>
                    <th style={{ padding: '4px 6px', textAlign: 'right', width: '12%' }}>ITBIS (18%) RD$</th>
                  </tr>
                </thead>
                <tbody>
                  {quote.installation.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9', backgroundColor: idx % 2 === 1 ? '#FAFAFA' : '#FFFFFF' }}>
                      <td style={{ padding: '4px 6px', fontWeight: '700', color: '#0369A1', fontFamily: 'monospace' }}>{item.partNumber}</td>
                      <td style={{ padding: '4px 6px', color: '#1F2937' }}>{item.description}</td>
                      <td style={{ padding: '4px 6px', textAlign: 'right' }}>${f(item.price)}</td>
                      <td style={{ padding: '4px 6px', textAlign: 'center', fontWeight: '700' }}>{item.qty}</td>
                      <td style={{ padding: '4px 6px', textAlign: 'right', fontWeight: '600' }}>${f(item.subTotal)}</td>
                      <td style={{ padding: '4px 6px', textAlign: 'right', color: '#64748B' }}>${f(item.tax)}</td>
                    </tr>
                  ))}
                  <tr style={{ backgroundColor: '#F0F9FF', borderTop: '2px solid #BAE6FD', fontWeight: '800' }}>
                    <td colSpan={4} style={{ padding: '5px 8px', textAlign: 'right', color: '#0369A1' }}>SUBTOTAL INSTALACIÓN:</td>
                    <td style={{ padding: '5px 8px', textAlign: 'right', color: '#0369A1' }}>${f(quote.summary?.totalInstNet)}</td>
                    <td style={{ padding: '5px 8px', textAlign: 'right', color: '#0369A1' }}>${f(quote.summary?.totalInstTax)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* ============================================================ */}
          {/* CONSOLIDATED FINANCIAL SUMMARY */}
          {/* ============================================================ */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1.1fr 1.3fr', 
            gap: '12px', 
            backgroundColor: '#F8FAFC', 
            border: '2px solid #E2E8F0', 
            borderRadius: '8px', 
            padding: '12px 16px', 
            marginBottom: '14px' 
          }}>
            {/* Terms Summary */}
            <div style={{ borderRight: '1px solid #CBD5E1', paddingRight: '12px' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0F172A', marginBottom: '8px', textTransform: 'uppercase' }}>
                TÉRMINOS COMERCIALES
              </h4>
              <div style={{ fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '4px', color: '#475569' }}>
                <div>• <strong>Validez de Oferta:</strong> 30 Días calendario</div>
                <div>• <strong>Tiempo de entrega:</strong> Por proyecto tras suscripción</div>
                <div>• <strong>Soporte Técnico:</strong> Mesa de Ayuda Corporativa 24/7</div>
                <div>• <strong>Moneda:</strong> Pesos Dominicanos (RD$)</div>
              </div>
            </div>

            {/* Financial Totals */}
            <div>
              <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: '#EE1C24', marginBottom: '8px', textTransform: 'uppercase' }}>
                RESUMEN FINANCIERO CONSOLIDADO
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.78rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B' }}>Renta Servicios HPBX RD$:</span>
                  <span style={{ fontWeight: '600' }}>${f(quote.summary?.totalServicesNet)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B' }}>Renta Equipos HPBX RD$:</span>
                  <span style={{ fontWeight: '600' }}>${f(quote.summary?.totalEqRentalNet)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed #CBD5E1', paddingTop: '3px' }}>
                  <strong style={{ color: '#0F172A' }}>Total Renta Mensual Neta RD$:</strong>
                  <strong style={{ color: '#0F172A' }}>${f(quote.summary?.totalMonthlyNet)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: '#FEE2E2', padding: '3px 6px', borderRadius: '4px' }}>
                  <strong style={{ color: '#991B1B' }}>Renta Mensual + Impuestos RD$:</strong>
                  <strong style={{ color: '#991B1B' }}>${f(quote.summary?.totalMonthlyWithTax)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B' }}>Total Instalación Neta RD$:</span>
                  <span style={{ fontWeight: '600' }}>${f(quote.summary?.totalInstNet)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B' }}>Instalación + Impuestos (18%) RD$:</span>
                  <span style={{ fontWeight: '600' }}>${f(quote.summary?.totalInst)}</span>
                </div>

                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  backgroundColor: '#EE1C24', 
                  color: '#FFFFFF', 
                  padding: '6px 10px', 
                  borderRadius: '6px', 
                  marginTop: '4px',
                  fontSize: '0.9rem',
                  fontWeight: '900'
                }}>
                  <span>GRAND TOTAL (Primer Pago) RD$:</span>
                  <span>${f(quote.summary?.grandTotal)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Legal Notes */}
          <div style={{ fontSize: '0.68rem', color: '#64748B', lineHeight: '1.35', marginBottom: '16px', borderTop: '1px solid #E2E8F0', paddingTop: '8px' }}>
            <p style={{ margin: '2px 0' }}>* El cliente debe proveer el sistema de protección de energía UPS/Inversor para los equipos activos (router, switches) del sistema telefónico.</p>
            <p style={{ margin: '2px 0' }}>* El cliente debe proveer un sistema de tierra que cumpla con los estándares de Claro Dominicana (120V, voltaje de retorno ≤ 1.5V, resistencia ≤ 5 Ohmios).</p>
            <p style={{ margin: '2px 0' }}>* En adición al ITBIS, aplican sobre los servicios de telecomunicaciones un 10% del Impuesto Selectivo a las Telecomunicaciones (ISC) y un 2% de CDT.</p>
            <p style={{ margin: '2px 0' }}>* La oferta tiene una vigencia de 30 días calendario y se rige bajo los términos del Contrato de Servicios Claro Negocios.</p>
          </div>

          {/* Signatures */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginTop: '18px', paddingTop: '12px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ borderBottom: '1px solid #1F2937', marginBottom: '6px', height: '24px' }}></div>
              <strong style={{ fontSize: '0.8rem', color: '#111827', display: 'block' }}>{quote.salesRep || 'BRIAN QUIROZ'}</strong>
              <span style={{ fontSize: '0.7rem', color: '#6B7280', fontWeight: '600' }}>REPRESENTANTE DE VENTAS CLARO</span>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ borderBottom: '1px solid #1F2937', marginBottom: '6px', height: '24px' }}></div>
              <strong style={{ fontSize: '0.8rem', color: '#111827', display: 'block' }}>{quote.customer?.contact || quote.customer?.name || 'CLIENTE AUTORIZADO'}</strong>
              <span style={{ fontSize: '0.7rem', color: '#6B7280', fontWeight: '600' }}>FIRMA CLIENTE / AUTORIZACIÓN</span>
            </div>
          </div>

        </div>

      </div>
  );

  if (isEmbedded) {
    return panelContent;
  }

  const modalContent = (
    <div className="modal-backdrop official-quote-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      {panelContent}
    </div>
  );

  return createPortal(modalContent, document.body);
}
