import * as XLSX from 'xlsx';

/**
 * Exporta una cotización estructurada de HPBX inyectando los valores directamente
 * en la plantilla oficial original de Excel de Claro Dominicana (.xls).
 * 
 * Modifica:
 * - Datos del Cliente (B8: Cliente, B9: RNC, B10: Dirección, B11: Teléfono, B12: Contacto)
 * - Metadatos (G2: Cotización No, G8: Localidades, G10: Usuarios, G11: Teléfonos IP, G12: Switch PoE)
 * - Cantidades en Columna D para cada Número de Parte (A)
 * Conservando al 100% el diseño original, fórmulas, colores y formato corporativo.
 */
export async function exportQuoteToExcel(quote, filename = null) {
  const isPymes = quote.type === 'PYMES';
  const templatePath = isPymes ? '/templates/Cotizacion_HPBX_PYMES.xls' : '/templates/Cotizacion_HPBX_Corporativo.xls';
  const outFilename = filename || `Cotizacion_Claro_${quote.type}_${(quote.customer?.name || 'Cliente').replace(/[^a-zA-Z0-9]/g, '_')}_${quote.customer?.quoteNo || 'COT'}.xls`;

  // Build quantity lookup map
  const qtyMap = {};
  if (quote.quantities) {
    Object.assign(qtyMap, quote.quantities);
  }
  const allSections = [
    ...(quote.services || []),
    ...(quote.equipmentRental || []),
    ...(quote.equipmentSale || []),
    ...(quote.installation || [])
  ];
  allSections.forEach(item => {
    if (item.partNumber) {
      qtyMap[item.partNumber.trim()] = item.qty;
    }
  });

  try {
    // 1. Fetch authentic Claro Excel template
    const response = await fetch(templatePath);
    if (!response.ok) {
      throw new Error(`No se pudo cargar la plantilla: ${templatePath}`);
    }
    const arrayBuffer = await response.arrayBuffer();

    // 2. Read workbook preserving formulas and styles
    const wb = XLSX.read(new Uint8Array(arrayBuffer), {
      type: 'array',
      cellStyles: true,
      cellFormulas: true,
      cellNF: true
    });

    const sheetName = wb.SheetNames[0];
    const ws = wb.Sheets[sheetName];

    // 3. Update customer & quote metadata
    if (quote.customer) {
      if (quote.customer.name) ws['B8'] = { t: 's', v: quote.customer.name };
      if (quote.customer.rnc && quote.customer.rnc !== 'N/A') ws['B9'] = { t: 's', v: quote.customer.rnc };
      if (quote.customer.address && quote.customer.address !== 'N/A') ws['B10'] = { t: 's', v: quote.customer.address };
      if (quote.customer.phone && quote.customer.phone !== 'N/A') ws['B11'] = { t: 's', v: quote.customer.phone };
      if (quote.customer.contact && quote.customer.contact !== 'N/A') ws['B12'] = { t: 's', v: quote.customer.contact };

      if (quote.customer.quoteNo) ws['G2'] = { t: 's', v: quote.customer.quoteNo };
      if (quote.customer.locations !== undefined) ws['G8'] = { t: 'n', v: Number(quote.customer.locations) || 1 };
      if (quote.customer.activeUsers !== undefined) ws['G10'] = { t: 'n', v: Number(quote.customer.activeUsers) || 0 };
      if (quote.customer.ipPhones !== undefined) ws['G11'] = { t: 'n', v: Number(quote.customer.ipPhones) || 0 };
      if (quote.customer.switchesPoE !== undefined) ws['G12'] = { t: 'n', v: Number(quote.customer.switchesPoE) || 0 };
    }

    // 4. Update item quantities in column D by scanning part numbers in column A
    const range = XLSX.utils.decode_range(ws['!ref']);
    for (let r = range.s.r; r <= range.e.r; r++) {
      const partCell = ws['A' + (r + 1)];
      if (partCell && partCell.v) {
        const pNum = String(partCell.v).trim();
        // If it's a part number row, set its quantity (or 0 if not quoted)
        if (qtyMap[pNum] !== undefined) {
          ws['D' + (r + 1)] = { t: 'n', v: qtyMap[pNum] };
        } else if (pNum.length >= 4 && !pNum.includes(' ') && !pNum.includes('No.')) {
          // Reset other item quantities in this section to 0 so template formulas compute accurately
          ws['D' + (r + 1)] = { t: 'n', v: 0 };
        }
      }
    }

    // 5. Download the modified official workbook
    XLSX.writeFile(wb, outFilename);
    return true;

  } catch (err) {
    console.warn("Fallo al inyectar en plantilla original, usando generador alternativo:", err);
    return fallbackExport(quote, outFilename);
  }
}

function fallbackExport(quote, outFilename) {
  const isPymes = quote.type === 'PYMES';
  const sheetName = isPymes ? 'HPBX Pymes' : 'HPBX Corporativo';

  const rows = [];
  rows.push(['', '', '', '', '', 'Referencia:', '']);
  rows.push(['', 'Compañía Dominicana de Teléfonos, S.A.', '', '', '', 'Cotización No:', quote.customer?.quoteNo || 'COT-HPBX']);
  rows.push(['', 'RNC: 10100157-7', '', '', '', 'Fecha de Cotización:', quote.customer?.date || new Date().toLocaleDateString('es-DO')]);
  rows.push(['', '', '', '', '', 'Fecha de Expiración:', '30 Días']);
  rows.push([]);
  rows.push([]);

  rows.push(['Cliente:', quote.customer?.name || 'CLIENTE', '', '', '', 'Localidades:', quote.customer?.locations || 1]);
  rows.push(['RNC:', quote.customer?.rnc || '', '', '', '', 'Usuarios Activos:', quote.customer?.activeUsers || 0]);
  rows.push(['Dirección:', quote.customer?.address || '', '', '', '', 'Teléfonos IP:', quote.customer?.ipPhones || 0]);
  rows.push(['Teléfono:', quote.customer?.phone || '', '', '', '', 'Switch PoE:', quote.customer?.switchesPoE || 0]);
  rows.push(['Contacto:', quote.customer?.contact || '', '', '', '', '', '']);
  rows.push([]);

  rows.push(['HOSTED PBX - SERVICIOS RENTA']);
  rows.push(['No. Parte', 'Descripción', 'Precio RD$', 'Cant', 'Desc.', 'Sub-Total RD$', 'IMP. (30%) RD$']);
  (quote.services || []).forEach(item => {
    rows.push([item.partNumber, item.description, item.price, item.qty, item.discount || '', item.subTotal, item.tax]);
  });
  rows.push(['', '', '', 'Monto RD$', '', quote.summary?.totalServicesNet || 0, '']);
  rows.push(['', '', '', 'IMPUESTOS (30%) RD$', '', quote.summary?.totalServicesTax || 0, '']);
  rows.push(['', '', '', 'Total RD$', '', quote.summary?.totalServices || 0, '']);
  rows.push([]);

  rows.push(['HOSTED PBX: EQUIPOS ACCESO & TERMINALES RENTA']);
  rows.push(['No. Parte', 'Descripción', 'Precio RD$', 'Cant', 'Desc.', 'Sub-Total RD$', 'ITBIS (18%) RD$']);
  (quote.equipmentRental || []).forEach(item => {
    rows.push([item.partNumber, item.description, item.price, item.qty, item.discount || '', item.subTotal, item.tax]);
  });
  rows.push(['', '', '', 'Monto RD$', '', quote.summary?.totalEqRentalNet || 0, '']);
  rows.push(['', '', '', 'ITBIS RD$', '', quote.summary?.totalEqRentalTax || 0, '']);
  rows.push(['', '', '', 'Total RD$', '', quote.summary?.totalEqRental || 0, '']);
  rows.push([]);

  rows.push(['INSTALACION']);
  rows.push(['No. Parte', 'Descripción', 'Precio RD$', 'Cant', 'Desc.', 'Sub-Total RD$', 'ITBIS (18%) RD$']);
  (quote.installation || []).forEach(item => {
    rows.push([item.partNumber, item.description, item.price, item.qty, item.discount || '', item.subTotal, item.tax]);
  });
  rows.push(['', '', '', 'Monto RD$', '', quote.summary?.totalInstNet || 0, '']);
  rows.push(['', '', '', 'ITBIS RD$', '', quote.summary?.totalInstTax || 0, '']);
  rows.push(['', '', '', 'Total RD$', '', quote.summary?.totalInst || 0, '']);
  rows.push([]);

  rows.push(['', '', 'RESUMEN FINANCIERO']);
  rows.push(['TERMINOS Y CONDICIONES', '', 'Renta Servicios HPBX RD$', '', '', quote.summary?.totalServicesNet || 0]);
  rows.push(['Tiempo de entrega : Proyecto', '', 'Renta Equipos HPBX RD$', '', '', quote.summary?.totalEqRentalNet || 0]);
  rows.push(['Validez de Oferta: 30 Dias', '', 'Total Renta Mensual Neta RD$', '', '', quote.summary?.totalMonthlyNet || 0]);
  rows.push(['', '', 'Renta mensual + Imp. RD$', '', '', quote.summary?.totalMonthlyWithTax || 0]);
  rows.push(['', '', 'Total Instalación Neta RD$', '', '', quote.summary?.totalInstNet || 0]);
  rows.push(['', '', 'Instalación + Imp. RD$', '', '', quote.summary?.totalInst || 0]);
  rows.push(['', '', 'GRAND TOTAL RD$', '', '', quote.summary?.grandTotal || 0]);

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [{ wch: 18 }, { wch: 56 }, { wch: 16 }, { wch: 10 }, { wch: 8 }, { wch: 20 }, { wch: 20 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, outFilename);
  return true;
}
