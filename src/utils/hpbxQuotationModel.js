/**
 * Modelador Oficial de Cotizaciones Claro Dominicana Hosted PBX (HPBX)
 * Modelos: PYMES y CORPORATIVO
 */

export const HPBX_TAX_RATES = {
  SERVICES_TELECOM: 0.30, // ITBIS (18%) + CDT (2%) + ISC (10%)
  EQUIPMENT_RENTAL: 0.18, // ITBIS (18%)
  EQUIPMENT_SALE: 0.18,   // ITBIS (18%)
  INSTALLATION: 0.18,     // ITBIS (18%)
};

export const HPBX_CATALOG_PYMES = {
  services: [
    { partNumber: 'HPBXPYME', description: 'Renta HPBX Plan Premium (Incluye: 3 estaciones base, 1500 minutos LDN y Conectividad MPLS)', price: 2775.00, category: 'CENTRAL HOSTEADA' },
    { partNumber: 'HPRECP', description: 'Funciones Recepcionista', price: 475.00, category: 'SERVICIOS ADICIONALES' },
    { partNumber: 'DIDIP1P', description: 'DID HPBX Pymes', price: 52.00, category: 'SERVICIOS ADICIONALES' },
    { partNumber: 'HPMUA1', description: 'Renta 1 Usuario Adicional (Plan Premium Pymes)', price: 305.00, category: 'USUARIOS ADICIONALES' },
    { partNumber: 'PMH500', description: 'Renta Paquete 500 Minutos', price: 485.00, category: 'MINUTOS ADICIONALES' },
    { partNumber: 'PMH1000', description: 'Renta Paquete 1000 Minutos', price: 965.00, category: 'MINUTOS ADICIONALES' },
    { partNumber: 'PMH2000', description: 'Renta Paquete 2000 Minutos', price: 1930.00, category: 'MINUTOS ADICIONALES' },
    { partNumber: 'PMH4000', description: 'Renta Paquete 4000 Minutos', price: 3865.00, category: 'MINUTOS ADICIONALES' },
    { partNumber: 'PMH5000', description: 'Renta Paquete 5000 Minutos', price: 4830.00, category: 'MINUTOS ADICIONALES' },
    { partNumber: 'PMHM100', description: 'Paquete 100 Minutos Celulares Claro', price: 375.00, category: 'MINUTOS ADICIONALES' },
  ],
  equipmentRental: [
    { partNumber: 'HPMRAU25', description: 'Renta Router Audiocodes 25 Usuarios', price: 2600.00, category: 'ROUTER/GATEWAY' },
    { partNumber: 'HPMSWC8', description: 'Renta Switch de 8 Puertos PoE', price: 515.00, category: 'SWITCHES CISCO PoE' },
    { partNumber: 'HPMSWC24', description: 'Renta Switch de 24 Puertos PoE', price: 1535.00, category: 'SWITCHES CISCO PoE' },
    { partNumber: 'HPMWBSP', description: 'Usuario Licencia Webex (Softphone)', price: 255.00, category: 'TERMINALES IP Y SERVICIOS' },
    { partNumber: 'HGXP1625', description: 'Renta Teléfono GXP 1625 (2 Líneas)', price: 137.00, category: 'TERMINALES IP Y SERVICIOS' },
    { partNumber: 'HGXP2130', description: 'Renta Teléfono GXP 2130 (3 Líneas)', price: 237.00, category: 'TERMINALES IP Y SERVICIOS' },
    { partNumber: 'HGXP2160', description: 'Renta Teléfono GXP 2160 (6 Líneas + Botonera)', price: 321.00, category: 'TERMINALES IP Y SERVICIOS' },
    { partNumber: 'HPMGB', description: 'Grabación de Llamadas', price: 1015.00, category: 'TERMINALES IP Y SERVICIOS' },
    { partNumber: 'HPMTR1', description: 'Tarificador Hosteado', price: 195.00, category: 'TERMINALES IP Y SERVICIOS' },
  ],
  equipmentSale: [
    { partNumber: 'VTSWC8', description: 'Venta Switch de 8 Puertos PoE', price: 14343.00 },
    { partNumber: 'VTGXP1', description: 'Venta Teléfono GXP 1625 (2 Líneas)', price: 2672.00 },
    { partNumber: 'VTGXP2', description: 'Venta Teléfono GXP 2130 (3 Líneas)', price: 5724.00 },
    { partNumber: 'VTGXP3', description: 'Venta Teléfono GXP 2160 (6 Líneas + Botonera)', price: 9167.00 },
    { partNumber: 'Miscelaneos CPE Datos', description: 'Venta Teléfono Grandstream GRP2602P', price: 4586.00 },
  ],
  installation: [
    { partNumber: 'INSHPM', description: 'Instalación Base Hosted PBX Pymes (3 estaciones)', price: 1575.00 },
    { partNumber: 'INHUS', description: 'Instalación Base de 1 usuario en Hosted PBX Pymes', price: 525.00 },
    { partNumber: 'SPHOBX', description: 'Sistema de Tierra HBPX', price: 4300.00 },
    { partNumber: 'RECSIS', description: 'Reconstrucción Sistema de Tierra', price: 9555.00 },
    { partNumber: 'INSHST', description: 'Sistema de Tierra HBPX (Completo)', price: 19295.00 },
    { partNumber: '1HPSR', description: 'Instalación 1 Salidas de Red', price: 1436.44 },
    { partNumber: '2HPSR', description: 'Instalación 2 Salidas de Red', price: 2500.00 },
    { partNumber: '3HPSR', description: 'Instalación 3 Salidas de Red', price: 3563.56 },
    { partNumber: '4HPSR', description: 'Instalación 4 Salidas de Red', price: 4631.36 },
    { partNumber: '5HPSR', description: 'Instalación 5 Salidas de Red', price: 5699.15 },
    { partNumber: '6HPSR', description: 'Instalación 6 Salidas de Red', price: 6766.95 },
    { partNumber: '7HPSR', description: 'Instalación 7 Salidas de Red', price: 7834.75 },
    { partNumber: 'TRLHPM', description: 'Traslado Local - Exterior', price: 1575.00 },
    { partNumber: 'COHPM', description: 'Configuración Miscelánea Hosted PBX', price: 1575.00 },
    { partNumber: 'COHSP', description: 'Configuración SoftPhone (Visita)', price: 1455.00 },
    { partNumber: 'CNHPT', description: 'Configuración Tarificador Hosteado', price: 195.00 },
    { partNumber: 'CNHPBX', description: 'Cambio de Número', price: 174.00 },
    { partNumber: 'HPMVT', description: 'Visita Técnica', price: 840.00 },
  ]
};

export const HPBX_CATALOG_CORP = {
  services: [
    { partNumber: 'IPHOSTPRM', description: 'Renta HPBX Plan Premium (Incluye: 8 usuarios base, 5000 minutos LDN y Conectividad MPLS)', price: 7385.00, category: 'CENTRAL HOSTEADA' },
    { partNumber: 'IPHOSTSTD', description: 'Renta HPBX Plan Estándar (Incluye: 8 usuarios base, 5000 minutos LDN y Conectividad MPLS)', price: 5995.00, category: 'CENTRAL HOSTEADA' },
    { partNumber: 'IPHPBXAA', description: 'Auto Attendant (mensaje de bienvenida 1 árbol)', price: 410.00, category: 'SERVICIOS AVANZADOS' },
    { partNumber: 'IPHPBXUM', description: 'Renta Mensajería Unificada (Buzón de voz 1 usuario integrable a email)', price: 95.00, category: 'SERVICIOS AVANZADOS' },
    { partNumber: 'HPBXDID', description: 'DID HPBX', price: 0.00, category: 'SERVICIOS AVANZADOS' },
    { partNumber: 'HPBPAD1', description: 'Renta 1 Usuario Adicional (Plan Premium)', price: 305.00, category: 'USUARIOS ACTIVOS' },
    { partNumber: 'HPBSAD1', description: 'Renta 1 Usuario Adicional (Plan Standar)', price: 242.00, category: 'USUARIOS ACTIVOS' },
    { partNumber: 'HPBPAD25', description: 'Renta 10 Usuarios Adicionales (Plan Premium)', price: 2895.00, category: 'USUARIOS ACTIVOS' },
    { partNumber: 'HPBPAD60', description: 'Renta 25 Usuarios Adicionales (Plan Premium)', price: 6855.00, category: 'USUARIOS ACTIVOS' },
    { partNumber: 'HPBPAD100', description: 'Renta 100 Usuarios Adicionales (Plan Premium)', price: 25885.00, category: 'USUARIOS ACTIVOS' },
    { partNumber: 'HPBX30N', description: 'Renta Paquete 30,000 Minutos LDN', price: 9995.00, category: 'MINUTOS LDN ADICIONALES' },
  ],
  equipmentRental: [
    { partNumber: 'HPRTAC25', description: 'Renta Router Audiocodes 25 Usuarios', price: 2600.00, category: 'ROUTER/GATEWAY' },
    { partNumber: 'HPRTAC50', description: 'Renta Router Audiocodes 50 Usuarios', price: 2835.00, category: 'ROUTER/GATEWAY' },
    { partNumber: 'HPRTAC100', description: 'Renta Router Audiocodes 100 Usuarios', price: 3075.00, category: 'ROUTER/GATEWAY' },
    { partNumber: 'HPRTAC250', description: 'Renta Router Audiocodes 250 Usuarios', price: 4020.00, category: 'ROUTER/GATEWAY' },
    { partNumber: 'HPRTAC500', description: 'Renta Router Audiocodes 500 Usuarios', price: 4725.00, category: 'ROUTER/GATEWAY' },
    { partNumber: 'HPCPESW1', description: 'Renta Switch de 8 Puertos PoE', price: 515.00, category: 'SWITCHES CISCO PoE' },
    { partNumber: 'HPCPESW2', description: 'Renta Switch de 24 Puertos PoE', price: 1535.00, category: 'SWITCHES CISCO PoE' },
    { partNumber: 'SOX0101', description: 'Usuario Licencia Softphone (Webex)', price: 255.00, category: 'ESTACIONES IP VIRTUAL WEBEX' },
    { partNumber: 'GSX162501', description: 'Renta Teléfono GXP 1625 (2 Líneas)', price: 137.00, category: 'ESTACIONES IP VIRTUAL WEBEX' },
    { partNumber: 'GSX213001', description: 'Renta Teléfono GXP 2130 (3 Líneas)', price: 237.00, category: 'ESTACIONES IP VIRTUAL WEBEX' },
    { partNumber: 'GSX216001', description: 'Renta Teléfono GXP 2160 (6 Líneas + Botonera)', price: 322.00, category: 'ESTACIONES IP VIRTUAL WEBEX' },
  ],
  installation: [
    { partNumber: 'INHPBX', description: 'Instalación Base Hosted PBX (8 Usuarios)', price: 4200.00 },
    { partNumber: 'HPBX01', description: 'Instalación Base de 1 usuario en Hosted PBX', price: 525.00 },
    { partNumber: 'HPBX10', description: 'Instalación Base de 10 usuario en Hosted PBX', price: 5250.00 },
    { partNumber: 'HPBX25', description: 'Instalación Base de 25 usuario en Hosted PBX', price: 13125.00 },
    { partNumber: 'HPB100', description: 'Instalación Base de 100 usuario en Hosted PBX', price: 50000.00 },
    { partNumber: 'SPHOBX', description: 'Sistema de Tierra HBPX', price: 4300.00 },
    { partNumber: 'RECSIS', description: 'Reconstrucción de Sistema de Tierra', price: 9555.00 },
  ]
};

/**
 * Calcula y genera el modelo completo de cotización
 */
export function calculateHPBXQuote({
  type = 'pymes', // 'pymes' | 'corporativo'
  customer = {},
  selectedServices = [],
  selectedEquipmentRental = [],
  selectedEquipmentSale = [],
  selectedInstallation = [],
  salesRep = 'Representante Claro'
}) {
  const isPymes = type.toLowerCase() === 'pymes';

  const filterNonZero = (items, taxRate) => {
    return items
      .filter(item => (item.qty || 0) > 0)
      .map(item => {
        const subTotal = (item.price || 0) * (item.qty || 0);
        const tax = subTotal * taxRate;
        return {
          ...item,
          subTotal,
          tax,
          total: subTotal + tax
        };
      });
  };

  const services = filterNonZero(selectedServices, HPBX_TAX_RATES.SERVICES_TELECOM);
  const equipmentRental = filterNonZero(selectedEquipmentRental, HPBX_TAX_RATES.EQUIPMENT_RENTAL);
  const equipmentSale = filterNonZero(selectedEquipmentSale, HPBX_TAX_RATES.EQUIPMENT_SALE);
  const installation = filterNonZero(selectedInstallation, HPBX_TAX_RATES.INSTALLATION);

  // Totales por sección
  const totalServicesNet = services.reduce((acc, i) => acc + i.subTotal, 0);
  const totalServicesTax = services.reduce((acc, i) => acc + i.tax, 0);
  const totalServices = totalServicesNet + totalServicesTax;

  const totalEqRentalNet = equipmentRental.reduce((acc, i) => acc + i.subTotal, 0);
  const totalEqRentalTax = equipmentRental.reduce((acc, i) => acc + i.tax, 0);
  const totalEqRental = totalEqRentalNet + totalEqRentalTax;

  const totalMonthlyNet = totalServicesNet + totalEqRentalNet;
  const totalMonthlyTax = totalServicesTax + totalEqRentalTax;
  const totalMonthlyWithTax = totalMonthlyNet + totalMonthlyTax;

  const totalEqSaleNet = equipmentSale.reduce((acc, i) => acc + i.subTotal, 0);
  const totalEqSaleTax = equipmentSale.reduce((acc, i) => acc + i.tax, 0);
  const totalEqSale = totalEqSaleNet + totalEqSaleTax;

  const totalInstNet = installation.reduce((acc, i) => acc + i.subTotal, 0);
  const totalInstTax = installation.reduce((acc, i) => acc + i.tax, 0);
  const totalInst = totalInstNet + totalInstTax;

  const grandTotal = totalMonthlyWithTax + totalEqSale + totalInst;

  return {
    type: isPymes ? 'PYMES' : 'CORPORATIVO',
    customer: {
      name: customer.name || 'CLIENTE',
      rnc: customer.rnc || 'N/A',
      address: customer.address || 'N/A',
      phone: customer.phone || 'N/A',
      contact: customer.contact || 'N/A',
      locations: customer.locations || 1,
      activeUsers: customer.activeUsers || (isPymes ? 3 : 8),
      ipPhones: customer.ipPhones || (isPymes ? 3 : 8),
      switchesPoE: customer.switchesPoE || 0,
      quoteNo: customer.quoteNo || `COT-HPBX-${Date.now().toString().slice(-6)}`,
      date: customer.date || new Date().toLocaleDateString('es-DO'),
      validity: '30 Días'
    },
    services,
    equipmentRental,
    equipmentSale,
    installation,
    summary: {
      totalServicesNet,
      totalServicesTax,
      totalServices,
      totalEqRentalNet,
      totalEqRentalTax,
      totalEqRental,
      totalMonthlyNet,
      totalMonthlyTax,
      totalMonthlyWithTax,
      totalEqSaleNet,
      totalEqSaleTax,
      totalEqSale,
      totalInstNet,
      totalInstTax,
      totalInst,
      grandTotal
    },
    salesRep
  };
}

export function formatQuoteToMarkdown(quote) {
  const f = (val) => Number(val || 0).toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const isPymes = quote.type === 'PYMES';

  let md = `# Propuesta Comercial - Hosted PBX (${quote.type})\n`;
  md += `**Compañía Dominicana de Teléfonos, S.A. | RNC: 10100157-7**\n\n`;

  md += `### Datos del Cliente\n`;
  md += `| Campo | Detalle | Campo | Detalle |\n`;
  md += `| :--- | :--- | :--- | :--- |\n`;
  md += `| **Cliente:** | ${quote.customer.name} | **Cotización No:** | ${quote.customer.quoteNo} |\n`;
  md += `| **RNC:** | ${quote.customer.rnc} | **Fecha:** | ${quote.customer.date} |\n`;
  md += `| **Dirección:** | ${quote.customer.address} | **Validez:** | ${quote.customer.validity} |\n`;
  md += `| **Contacto:** | ${quote.customer.contact} | **Localidades:** | ${quote.customer.locations} |\n`;
  md += `| **Teléfono:** | ${quote.customer.phone} | **Usuarios / Teléfonos IP:** | ${quote.customer.activeUsers} / ${quote.customer.ipPhones} |\n\n`;

  // Servicios
  if (quote.services.length > 0) {
    md += `### 1. HOSTED PBX - SERVICIOS RENTA\n`;
    md += `*Impuestos aplicables: 30% (ITBIS 18% + CDT 2% + ISC 10%)*\n\n`;
    md += `| No. Parte | Descripción | Precio RD$ | Cant | Sub-Total RD$ | IMP. (30%) RD$ | Total RD$ |\n`;
    md += `| :--- | :--- | :---: | :---: | :---: | :---: | :---: |\n`;
    quote.services.forEach(i => {
      md += `| \`${i.partNumber}\` | ${i.description} | $${f(i.price)} | ${i.qty} | $${f(i.subTotal)} | $${f(i.tax)} | $${f(i.total)} |\n`;
    });
    md += `| **SUBTOTAL SERVICIOS** | | | | **$${f(quote.summary.totalServicesNet)}** | **$${f(quote.summary.totalServicesTax)}** | **$${f(quote.summary.totalServices)}** |\n\n`;
  }

  // Equipos Renta
  if (quote.equipmentRental.length > 0) {
    md += `### 2. HOSTED PBX: EQUIPOS ACCESO & TERMINALES (RENTA)\n`;
    md += `*Impuestos aplicables: 18% (ITBIS)*\n\n`;
    md += `| No. Parte | Descripción | Precio RD$ | Cant | Sub-Total RD$ | ITBIS (18%) RD$ | Total RD$ |\n`;
    md += `| :--- | :--- | :---: | :---: | :---: | :---: | :---: |\n`;
    quote.equipmentRental.forEach(i => {
      md += `| \`${i.partNumber}\` | ${i.description} | $${f(i.price)} | ${i.qty} | $${f(i.subTotal)} | $${f(i.tax)} | $${f(i.total)} |\n`;
    });
    md += `| **SUBTOTAL EQUIPOS RENTA** | | | | **$${f(quote.summary.totalEqRentalNet)}** | **$${f(quote.summary.totalEqRentalTax)}** | **$${f(quote.summary.totalEqRental)}** |\n\n`;
  }

  // Venta Equipos (si aplica)
  if (quote.equipmentSale.length > 0) {
    md += `### 3. VENTA DE EQUIPOS\n`;
    md += `*Impuestos aplicables: 18% (ITBIS)*\n\n`;
    md += `| No. Parte | Descripción | Precio RD$ | Cant | Sub-Total RD$ | ITBIS (18%) RD$ | Total RD$ |\n`;
    md += `| :--- | :--- | :---: | :---: | :---: | :---: | :---: |\n`;
    quote.equipmentSale.forEach(i => {
      md += `| \`${i.partNumber}\` | ${i.description} | $${f(i.price)} | ${i.qty} | $${f(i.subTotal)} | $${f(i.tax)} | $${f(i.total)} |\n`;
    });
    md += `| **SUBTOTAL VENTA EQUIPOS** | | | | **$${f(quote.summary.totalEqSaleNet)}** | **$${f(quote.summary.totalEqSaleTax)}** | **$${f(quote.summary.totalEqSale)}** |\n\n`;
  }

  // Instalación
  if (quote.installation.length > 0) {
    md += `### ${quote.equipmentSale.length > 0 ? '4' : '3'}. INSTALACIÓN Y CONFIGURACIÓN\n`;
    md += `*Impuestos aplicables: 18% (ITBIS)*\n\n`;
    md += `| No. Parte | Descripción | Precio RD$ | Cant | Sub-Total RD$ | ITBIS (18%) RD$ | Total RD$ |\n`;
    md += `| :--- | :--- | :---: | :---: | :---: | :---: | :---: |\n`;
    quote.installation.forEach(i => {
      md += `| \`${i.partNumber}\` | ${i.description} | $${f(i.price)} | ${i.qty} | $${f(i.subTotal)} | $${f(i.tax)} | $${f(i.total)} |\n`;
    });
    md += `| **SUBTOTAL INSTALACIÓN** | | | | **$${f(quote.summary.totalInstNet)}** | **$${f(quote.summary.totalInstTax)}** | **$${f(quote.summary.totalInst)}** |\n\n`;
  }

  // Resumen Financiero
  md += `### RESUMEN FINANCIERO\n`;
  md += `| Concepto | Monto Neto RD$ | Con Impuestos RD$ |\n`;
  md += `| :--- | :---: | :---: |\n`;
  md += `| **Renta Servicios HPBX** | $${f(quote.summary.totalServicesNet)} | $${f(quote.summary.totalServices)} |\n`;
  md += `| **Renta Equipos HPBX** | $${f(quote.summary.totalEqRentalNet)} | $${f(quote.summary.totalEqRental)} |\n`;
  md += `| **Total Renta Mensual** | **$${f(quote.summary.totalMonthlyNet)}** | **$${f(quote.summary.totalMonthlyWithTax)}** |\n`;
  if (quote.summary.totalEqSaleNet > 0) {
    md += `| **Venta de Equipos** | $${f(quote.summary.totalEqSaleNet)} | $${f(quote.summary.totalEqSale)} |\n`;
  }
  md += `| **Total Instalación** | $${f(quote.summary.totalInstNet)} | $${f(quote.summary.totalInst)} |\n`;
  md += `| 🏆 **GRAND TOTAL (Primer Pago)** | — | **$${f(quote.summary.grandTotal)} RD$** |\n\n`;

  // Términos y Condiciones
  md += `### Términos y Condiciones\n`;
  md += `- **Validez:** Oferta comercial válida por 30 días calendario.\n`;
  md += `- **Tiempo de entrega:** Sujeto a cronograma de proyecto tras suscripción del contrato.\n`;
  md += `- **Equipos y Energía:** El cliente debe proveer UPS/Inversor y puesta a tierra adecuada según norma técnica Claro Dominicana.\n`;
  md += `- **Régimen Fiscal:** Servicios de voz/telecomunicaciones gravados con 30% (ITBIS 18% + CDT 2% + ISC 10%). Equipos e instalación gravados con 18% ITBIS.\n\n`;

  md += `**Representante Claro:** ${quote.salesRep}  \n`;
  md += `**Aprobación Cliente:** ${quote.customer.contact || quote.customer.name}\n`;

  return md;
}

/**
 * Parsea lenguaje natural y genera una cotización completa de HPBX
 */
export function parseAndGenerateHPBXFromText(text, salesRep = 'Brian Quiroz (Claro Negocios)') {
  const lower = (text || '').toLowerCase();
  
  // 1. Model detection
  const isExplicitCorp = lower.includes('corp') || lower.includes('corporativ');
  const isExplicitPymes = lower.includes('pyme') || lower.includes('pymes');
  
  // 2. Customer name
  let clientName = 'Cliente Solicitante';
  const clientMatch = text.match(/(?:cliente|para(?:\sel)?\s(?:cliente)?)\s+([A-ZÁÉÍÓÚÑa-záéíóúñ0-9\.\-_ ]+?)(?:,|\.|\n|con|\d+\s*usuario|$)/i);
  if (clientMatch && clientMatch[1]) {
    const candidate = clientMatch[1].trim();
    if (candidate.length > 1 && !candidate.toLowerCase().startsWith('una hpbx') && !candidate.toLowerCase().startsWith('hpbx')) {
      clientName = candidate;
    }
  }

  // 3. User count
  let userCount = 0;
  const userMatch = lower.match(/(\d+)\s*(?:usuarios?|estaciones?|users?|licencias?|extensiones?)/i);
  if (userMatch) {
    userCount = parseInt(userMatch[1]);
  } else {
    const numbers = text.match(/\b\d+\b/g);
    if (numbers && numbers.length > 0) {
      userCount = parseInt(numbers[0]);
    }
  }

  const isPymes = isExplicitPymes ? true : (isExplicitCorp ? false : (userCount > 0 && userCount <= 7 ? true : false));
  const baseUsers = isPymes ? 3 : 8;
  if (!userCount || userCount < baseUsers) {
    userCount = baseUsers;
  }

  // 4. Equipment - Switches
  let sw8Qty = 0;
  let sw24Qty = 0;
  const sw8Match = lower.match(/(\d+)?\s*switch(?:es)?\s*(?:cisco\s*)?(?:poe\s*)?(?:de\s*)?8\s*(?:puertos?|pto)?/i) ||
                   lower.match(/switch(?:es)?\s*(?:cisco\s*)?(?:poe\s*)?(?:de\s*)?8\s*(?:puertos?|pto)?/i);
  if (sw8Match) {
    sw8Qty = sw8Match[1] ? parseInt(sw8Match[1]) : 1;
  }

  const sw24Match = lower.match(/(\d+)?\s*switch(?:es)?\s*(?:cisco\s*)?(?:poe\s*)?(?:de\s*)?24\s*(?:puertos?|pto)?/i);
  if (sw24Match) {
    sw24Qty = sw24Match[1] ? parseInt(sw24Match[1]) : 1;
  }

  // 5. Equipment - IP Phones
  let gxp1625Qty = 0;
  let gxp2130Qty = 0;
  let gxp2160Qty = 0;
  let softphonesQty = 0;

  const p1625Match = lower.match(/(\d+)\s*(?:tel[ée]fonos?|terminales?|equipos?)?\s*(?:gxp)?\s*1625/i);
  if (p1625Match) gxp1625Qty = parseInt(p1625Match[1]);

  const p2130Match = lower.match(/(\d+)\s*(?:tel[ée]fonos?|terminales?|equipos?)?\s*(?:gxp)?\s*2130/i);
  if (p2130Match) gxp2130Qty = parseInt(p2130Match[1]);

  const p2160Match = lower.match(/(\d+)\s*(?:tel[ée]fonos?|terminales?|equipos?)?\s*(?:gxp)?\s*2160/i);
  if (p2160Match) gxp2160Qty = parseInt(p2160Match[1]);

  const softMatch = lower.match(/(\d+)\s*(?:softphones?|licencias?\s*webex|webex)/i);
  if (softMatch) softphonesQty = parseInt(softMatch[1]);

  // If no phones mentioned, allocate userCount to GXP 1625 standard phones
  const totalSpecifiedPhones = gxp1625Qty + gxp2130Qty + gxp2160Qty + softphonesQty;
  if (totalSpecifiedPhones === 0) {
    gxp1625Qty = userCount;
  }

  const totalIpPhones = gxp1625Qty + gxp2130Qty + gxp2160Qty;

  // 6. Detect Optional & Advanced Services
  const hasGroundSystem = lower.includes('tierra') || lower.includes('sistema de tierra') || lower.includes('puesta a tierra') || lower.includes('ground');
  const isGroundReconstruction = lower.includes('reconstruc') || lower.includes('recsis');
  const isGroundComplete = lower.includes('completo') || lower.includes('inhst');

  const hasAA = lower.includes('auto attendant') || lower.includes('autoattendant') || lower.includes('bienvenida') || lower.includes('arbol') || lower.includes('árbol') || lower.includes('ivr');
  const hasUM = lower.includes('mensajeria unificada') || lower.includes('mensajería unificada') || lower.includes('buzon de voz') || lower.includes('buzón de voz');
  const hasRecording = lower.includes('grabacion') || lower.includes('grabación');
  const hasBilling = lower.includes('tarificador');
  const didMatch = lower.match(/(\d+)\s*dids?/i);

  // 7. Build item lists
  const additionalUsers = Math.max(0, userCount - baseUsers);
  const selectedServices = [];
  const selectedEquipmentRental = [];
  const selectedInstallation = [];

  if (isPymes) {
    // Base Central
    selectedServices.push({ partNumber: 'HPBXPYME', description: 'Renta HPBX Plan Premium (3 estaciones base, 1500 min LDN, MPLS)', price: 2775.00, qty: 1 });
    if (additionalUsers > 0) {
      selectedServices.push({ partNumber: 'HPMUA1', description: 'Renta 1 Usuario Adicional (Plan Premium Pymes)', price: 305.00, qty: additionalUsers });
    }
    if (hasAA) {
      selectedServices.push({ partNumber: 'AAHPPM', description: 'Auto Attendant (mensaje de bienvenida 1 árbol)', price: 410.00, qty: 1 });
    }
    if (didMatch) {
      selectedServices.push({ partNumber: 'DIDIP1P', description: 'DID HPBX Pymes', price: 52.00, qty: parseInt(didMatch[1]) || 1 });
    }

    // Equipment
    if (sw8Qty > 0) {
      selectedEquipmentRental.push({ partNumber: 'HPMSWC8', description: 'Renta Switch de 8 Puertos PoE', price: 515.00, qty: sw8Qty });
    }
    if (sw24Qty > 0) {
      selectedEquipmentRental.push({ partNumber: 'HPMSWC24', description: 'Renta Switch de 24 Puertos PoE', price: 1535.00, qty: sw24Qty });
    }
    if (gxp1625Qty > 0) {
      selectedEquipmentRental.push({ partNumber: 'HGXP1625', description: 'Renta Teléfono GXP 1625 (2 Líneas)', price: 137.00, qty: gxp1625Qty });
    }
    if (gxp2130Qty > 0) {
      selectedEquipmentRental.push({ partNumber: 'HGXP2130', description: 'Renta Teléfono GXP 2130 (3 Líneas)', price: 237.00, qty: gxp2130Qty });
    }
    if (gxp2160Qty > 0) {
      selectedEquipmentRental.push({ partNumber: 'HGXP2160', description: 'Renta Teléfono GXP 2160 (6 Líneas + Botonera)', price: 321.00, qty: gxp2160Qty });
    }
    if (softphonesQty > 0) {
      selectedEquipmentRental.push({ partNumber: 'HPMWBSP', description: 'Usuario Licencia Webex (Softphone)', price: 255.00, qty: softphonesQty });
    }
    if (hasRecording) {
      selectedEquipmentRental.push({ partNumber: 'HPMGB', description: 'Grabación de Llamadas', price: 1015.00, qty: 1 });
    }
    if (hasBilling) {
      selectedEquipmentRental.push({ partNumber: 'HPMTR1', description: 'Tarificador Hosteado', price: 195.00, qty: 1 });
    }

    // Installation
    selectedInstallation.push({ partNumber: 'INSHPM', description: 'Instalación Base Hosted PBX Pymes (3 estaciones)', price: 1575.00, qty: 1 });
    if (additionalUsers > 0) {
      selectedInstallation.push({ partNumber: 'INHUS', description: 'Instalación Base de 1 usuario en Hosted PBX Pymes', price: 525.00, qty: additionalUsers });
    }
    if (hasGroundSystem) {
      if (isGroundReconstruction) {
        selectedInstallation.push({ partNumber: 'RECSIS', description: 'Reconstrucción Sistema de Tierra', price: 9555.00, qty: 1 });
      } else if (isGroundComplete) {
        selectedInstallation.push({ partNumber: 'INSHST', description: 'Sistema de Tierra HBPX (Completo)', price: 19295.00, qty: 1 });
      } else {
        selectedInstallation.push({ partNumber: 'SPHOBX', description: 'Sistema de Tierra HBPX', price: 4300.00, qty: 1 });
      }
    }
  } else {
    // Corporativo Base
    selectedServices.push({ partNumber: 'IPHOSTPRM', description: 'Renta HPBX Plan Premium (8 usuarios base, 5000 min LDN, MPLS)', price: 7385.00, qty: 1 });
    if (additionalUsers > 0) {
      selectedServices.push({ partNumber: 'HPBPAD1', description: 'Renta 1 Usuario Adicional (Plan Premium)', price: 305.00, qty: additionalUsers });
    }
    if (hasAA) {
      selectedServices.push({ partNumber: 'IPHPBXAA', description: 'Auto Attendant (mensaje de bienvenida 1 árbol)', price: 410.00, qty: 1 });
    }
    if (hasUM) {
      selectedServices.push({ partNumber: 'IPHPBXUM', description: 'Renta Mensajería Unificada (Buzón de voz a email)', price: 95.00, qty: 1 });
    }
    if (didMatch) {
      selectedServices.push({ partNumber: 'HPBXDID', description: 'DID HPBX', price: 0.00, qty: parseInt(didMatch[1]) || 1 });
    }

    // Router Audiocodes based on users
    const routerPart = userCount <= 25 ? 'HPRTAC25' : (userCount <= 50 ? 'HPRTAC50' : 'HPRTAC100');
    const routerPrice = userCount <= 25 ? 2600.00 : (userCount <= 50 ? 2835.00 : 3075.00);
    const routerDesc = userCount <= 25 ? 'Renta Router Audiocodes 25 Usuarios' : (userCount <= 50 ? 'Renta Router Audiocodes 50 Usuarios' : 'Renta Router Audiocodes 100 Usuarios');
    selectedEquipmentRental.push({ partNumber: routerPart, description: routerDesc, price: routerPrice, qty: 1 });

    if (sw8Qty > 0) {
      selectedEquipmentRental.push({ partNumber: 'HPCPESW1', description: 'Renta Switch de 8 Puertos PoE', price: 515.00, qty: sw8Qty });
    }
    if (sw24Qty > 0) {
      selectedEquipmentRental.push({ partNumber: 'HPCPESW2', description: 'Renta Switch de 24 Puertos PoE', price: 1535.00, qty: sw24Qty });
    }
    if (gxp1625Qty > 0) {
      selectedEquipmentRental.push({ partNumber: 'GSX162501', description: 'Renta Teléfono GXP 1625 (2 Líneas)', price: 137.00, qty: gxp1625Qty });
    }
    if (gxp2130Qty > 0) {
      selectedEquipmentRental.push({ partNumber: 'GSX213001', description: 'Renta Teléfono GXP 2130 (3 Líneas)', price: 237.00, qty: gxp2130Qty });
    }
    if (gxp2160Qty > 0) {
      selectedEquipmentRental.push({ partNumber: 'GSX216001', description: 'Renta Teléfono GXP 2160 (6 Líneas + Botonera)', price: 322.00, qty: gxp2160Qty });
    }
    if (softphonesQty > 0) {
      selectedEquipmentRental.push({ partNumber: 'SOX0101', description: 'Usuario Licencia Softphone (Webex)', price: 255.00, qty: softphonesQty });
    }

    // Installation
    selectedInstallation.push({ partNumber: 'INHPBX', description: 'Instalación Base Hosted PBX (8 Usuarios)', price: 4200.00, qty: 1 });
    if (additionalUsers > 0) {
      selectedInstallation.push({ partNumber: 'HPBX01', description: 'Instalación Base de 1 usuario en Hosted PBX', price: 525.00, qty: additionalUsers });
    }
    if (hasGroundSystem) {
      if (isGroundReconstruction) {
        selectedInstallation.push({ partNumber: 'RECSIS', description: 'Reconstrucción de Sistema de Tierra', price: 9555.00, qty: 1 });
      } else {
        selectedInstallation.push({ partNumber: 'SPHOBX', description: 'Sistema de Tierra HBPX', price: 4300.00, qty: 1 });
      }
    }
  }

  const quote = calculateHPBXQuote({
    type: isPymes ? 'pymes' : 'corporativo',
    customer: {
      name: clientName,
      activeUsers: userCount,
      ipPhones: totalIpPhones,
      switchesPoE: sw8Qty + sw24Qty,
      locations: 1
    },
    selectedServices,
    selectedEquipmentRental,
    selectedInstallation,
    salesRep
  });

  const markdown = formatQuoteToMarkdown(quote);

  const quoteData = {
    productId: 'hpbx',
    productName: `Hosted PBX Claro Negocios (Plan ${isPymes ? 'Pymes' : 'Corporativo'})`,
    quantity: userCount,
    unitPrice: `$${(quote.summary.totalMonthlyNet / userCount).toFixed(2)} RD$/usr neto`,
    monthlyTotal: `$${quote.summary.totalMonthlyWithTax.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} RD$ (con imp.)`,
    setupFee: `$${quote.summary.totalInst.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} RD$ (con imp.)`
  };

  return { quote, markdown, quoteData };
}

