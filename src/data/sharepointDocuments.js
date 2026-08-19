/**
 * Documentos Oficiales de la Biblioteca SharePoint de Claro Dominicana
 * Sitio: https://clarocomdo.sharepoint.com/sites/gevc/indiso
 * Carpeta: Shared Documents1/Documentaciones Comerciales
 */

export const SHAREPOINT_CONFIG = {
  tenantName: 'clarocomdo',
  siteUrl: 'https://clarocomdo.sharepoint.com/sites/gevc/indiso',
  libraryName: 'Shared Documents1',
  folderPath: '/sites/gevc/indiso/Shared Documents1/Documentaciones Comerciales',
  webUrl: 'https://clarocomdo.sharepoint.com/sites/gevc/indiso/Shared%20Documents1/Forms/AllItems.aspx?id=%2Fsites%2Fgevc%2Findiso%2FShared%20Documents1%2FDocumentaciones%20Comerciales'
};

export const DOCUMENT_CATEGORIES = [
  'Todos',
  'HPBX y Telefonía IP',
  'Conectividad & MPLS',
  'Cloud & Data Center',
  'Ciberseguridad & SOC',
  'Móvil Corporativo',
  'Plantillas & Propuestas',
  'Tarifarios Oficiales'
];

export const initialSharePointDocuments = [
  // ==========================================================
  // HPBX Y TELEFONÍA IP
  // ==========================================================
  {
    id: 'doc-hpbx-01',
    name: 'Ficha_Tecnica_Comercial_HPBX_Pymes_2026.pdf',
    title: 'Ficha Técnica y Comercial - Hosted PBX Pymes (Plan Premium)',
    folder: 'HPBX y Telefonía IP',
    category: 'HPBX y Telefonía IP',
    extension: 'pdf',
    size: '2.4 MB',
    sizeBytes: 2516582,
    modifiedDate: '2026-06-18',
    author: 'Ing. Carlos Valdez (Gerencia Soluciones Voz)',
    version: '3.2',
    sharepointUrl: 'https://clarocomdo.sharepoint.com/sites/gevc/indiso/Shared%20Documents1/Documentaciones%20Comerciales/HPBX%20y%20Telefon%C3%ADa%20IP/Ficha_Tecnica_Comercial_HPBX_Pymes_2026.pdf',
    isSynced: true,
    tags: ['HPBX', 'Pymes', 'Telefonía IP', 'AudioCodes', 'Grandstream', 'Webex', 'Tarifas'],
    aiSummary: 'Documento técnico-comercial que detalla la oferta Hosted PBX para pequeñas y medianas empresas. Incluye paquete base de 3 extensiones, 1,500 minutos LDN, enrutador AudioCodes MP-124/25U, opciones de conmutadores PoE y compatibilidad con softphone Webex.',
    keyTakeaways: [
      'Cuota mensual base: RD$ 2,775.00/mes (incluye 3 puestos base y 1,500 min LDN).',
      'Estación adicional: RD$ 305.00/mes por usuario.',
      'Aplica 30% de impuestos en servicios (ITBIS 18% + ISC 10% + CDT 2%) y 18% en equipos/instalación.',
      'Soporte de terminales Grandstream GXP-1625, GXP-2130 y GXP-2160.'
    ],
    contentPreview: `CLARO DOMINICANA - SOLUCIONES EMPRESARIALES
FICHA TÉCNICA Y CONDICIONES COMERCIALES: HOSTED PBX PYMES (HPBX)

1. DESCRIPCIÓN DEL SERVICIO:
La solución Hosted PBX Pymes permite a las empresas disponer de una central telefónica IP virtualizada en la nube de Claro, eliminando la necesidad de adquirir y mantener hardware de conmutación físico en sus instalaciones.

2. ESPECIFICACIONES DEL PAQUETE BASE (HPBXPYME):
- Código de Producto: HPBXPYME
- Precio Base Mensual: RD$ 2,775.00 + Impuestos
- Incluye: 3 estaciones / usuarios simultáneos.
- Bolsa de Minutos: 1,500 minutos a Líneas Fijas Nacionales (LDN).
- Conectividad: Enlace dedicado MPLS gestionado con QoS para priorización de voz.
- Funcionalidades estándar: Desvío de llamadas, transferencia ciega/atendida, música en espera, buzón de voz y portal web de autogestión.

3. ADICIONALES Y TERMINALES:
- Usuario adicional: RD$ 305.00/mes (Código: HPMUA1)
- Funciones Recepcionista: RD$ 475.00/mes (Código: HPRECP)
- Softphone Webex: RD$ 255.00/mes por licencia (Código: HPMWBSP)
- Teléfono IP Grandstream GXP-1625 (2 Líneas): RD$ 137.00/mes
- Teléfono IP Grandstream GXP-2130 (3 Líneas): RD$ 237.00/mes
- Teléfono IP Grandstream GXP-2160 (6 Líneas + Botonera): RD$ 321.00/mes
- Switch PoE 8 Puertos: RD$ 515.00/mes | 24 Puertos: RD$ 1,535.00/mes
- Router AudioCodes 25U: RD$ 2,600.00/mes

4. ESQUEMA IMPOSITIVO Y CONDICIONES:
- Servicios de Renta: 30% (ITBIS 18% + ISC 10% + CDT 2%).
- Renta de Equipos e Instalación: 18% ITBIS.
- Vigencia de la oferta: 30 días calendario.`
  },
  {
    id: 'doc-hpbx-02',
    name: 'Especificaciones_HPBX_Corporativo_MultiSite_v4.docx',
    title: 'Especificaciones de Arquitectura HPBX Corporativo Multi-Site',
    folder: 'HPBX y Telefonía IP',
    category: 'HPBX y Telefonía IP',
    extension: 'docx',
    size: '1.8 MB',
    sizeBytes: 1887436,
    modifiedDate: '2026-06-25',
    author: 'Dirección Corporativa de Ingeniería y Preventa',
    version: '4.1',
    sharepointUrl: 'https://clarocomdo.sharepoint.com/sites/gevc/indiso/Shared%20Documents1/Documentaciones%20Comerciales/HPBX%20y%20Telefon%C3%ADa%20IP/Especificaciones_HPBX_Corporativo_MultiSite_v4.docx',
    isSynced: true,
    tags: ['HPBX', 'Corporativo', 'Multi-Site', 'SBC', 'MPLS', 'AudioCodes', 'Troncal SIP'],
    aiSummary: 'Guía de arquitectura y dimensionamiento para implementaciones corporativas de Hosted PBX con 8 a 500+ extensiones distribuidas en múltiples sucursales con interconexión MPLS redundante.',
    keyTakeaways: [
      'Plan Base Premium: 8 usuarios y 5,000 min LDN por RD$ 7,385.00/mes.',
      'Plan Base Estándar: 8 usuarios y 5,000 min LDN por RD$ 5,995.00/mes.',
      'Soporte de Session Border Controllers (SBC) dedicados AudioCodes Mediant 500/1000/2500.',
      'Disponibilidad garantizada (SLA) del 99.95% con conmutación por falla de enlace.'
    ],
    contentPreview: `ARQUITECTURA HOSTED PBX CORPORATIVO MULTI-SITE
COMPAÑÍA DOMINICANA DE TELÉFONOS (CLARO)

1. MODELO DE DESPLIEGUE CORPORATIVO:
Diseñado para organizaciones con requerimientos de alta densidad de usuarios, múltiples sedes geográficas e integración con CRM/ERP y Microsoft Teams.

2. OPCIONES DE PLAN BASE:
a) Plan Premium (IPHOSTPRM): RD$ 7,385.00/mes - Incluye 8 usuarios, 5,000 min LDN, Auto Attendant multinivel y cola de espera básica.
b) Plan Estándar (IPHOSTSTD): RD$ 5,995.00/mes - Incluye 8 usuarios, 5,000 min LDN.

3. ESCALABILIDAD EN BLOQUES DE USUARIOS:
- Bloque 10 Usuarios (HPBPAD25): RD$ 2,895.00/mes
- Bloque 25 Usuarios (HPBPAD60): RD$ 6,855.00/mes
- Bloque 100 Usuarios (HPBPAD100): RD$ 25,885.00/mes
- Paquete 30,000 Minutos LDN adicionales: RD$ 9,995.00/mes

4. ROUTERS SBC AUDIOCODES RECOMENDADOS:
- Router AudioCodes 25U: RD$ 2,600.00/mes
- Router AudioCodes 50U: RD$ 2,835.00/mes
- Router AudioCodes 100U: RD$ 3,075.00/mes
- Router AudioCodes 250U: RD$ 4,020.00/mes
- Router AudioCodes 500U: RD$ 4,725.00/mes`
  },
  {
    id: 'doc-hpbx-03',
    name: 'Manual_Homologacion_Terminales_Grandstream_Yealink.pdf',
    title: 'Manual de Homologación de Terminales IP (Grandstream & Yealink)',
    folder: 'HPBX y Telefonía IP',
    category: 'HPBX y Telefonía IP',
    extension: 'pdf',
    size: '4.1 MB',
    sizeBytes: 4300120,
    modifiedDate: '2026-05-14',
    author: 'Laboratorio de Homologación de Equipos Claro',
    version: '2.0',
    sharepointUrl: 'https://clarocomdo.sharepoint.com/sites/gevc/indiso/Shared%20Documents1/Documentaciones%20Comerciales/HPBX%20y%20Telefon%C3%ADa%20IP/Manual_Homologacion_Terminales_Grandstream_Yealink.pdf',
    isSynced: true,
    tags: ['Terminales', 'Grandstream', 'Yealink', 'GXP1625', 'GXP2130', 'GXP2160', 'Firmware'],
    aiSummary: 'Manual que certifica los modelos y versiones de firmware compatibles con la red NGN/IMS de Claro para terminales IP de escritorio, diademas inalámbricas y módulos de expansión.',
    keyTakeaways: [
      'GXP-1625: Ideal para puestos estándar y áreas comunes.',
      'GXP-2130: Recomendado para ejecutivos medios con pantalla color.',
      'GXP-2160: Diseñado para recepcionistas y asistentes de gerencia (soporta botonera LCD lateral).',
      'Configuración Zero-Touch Provisioning mediante TR-069 y DHCP Option 66.'
    ],
    contentPreview: `LABORATORIO DE REDES CLARO DOMINICANA
GUÍA DE DISPOSITIVOS HOMOLOGADOS PARA HOSTED PBX

Modelos Certificados:
- Grandstream GXP-1625: Firmware homologado 1.0.7.23+ (Códecs G.711u/a, G.729A/B).
- Grandstream GXP-2130: Firmware 1.0.11.64+ (3 teclas de línea, audio HD).
- Grandstream GXP-2160: Firmware 1.0.11.64+ (6 líneas, 24 teclas BLF programables).
- Yealink SIP-T33G & T46U: Firmware Claro SIP-Build 86.85.0.20.`
  },

  // ==========================================================
  // CONECTIVIDAD & MPLS
  // ==========================================================
  {
    id: 'doc-mpls-01',
    name: 'Guia_Diseno_Redes_Privadas_MPLS_SDWAN_2026.pdf',
    title: 'Guía de Diseño de Redes Privadas MPLS y SD-WAN Gestionadas',
    folder: 'Conectividad & MPLS',
    category: 'Conectividad & MPLS',
    extension: 'pdf',
    size: '5.2 MB',
    sizeBytes: 5452595,
    modifiedDate: '2026-07-02',
    author: 'Ing. Patricia Jiménez (Preventa Conectividad)',
    version: '5.0',
    sharepointUrl: 'https://clarocomdo.sharepoint.com/sites/gevc/indiso/Shared%20Documents1/Documentaciones%20Comerciales/Conectividad%20%26%20MPLS/Guia_Diseno_Redes_Privadas_MPLS_SDWAN_2026.pdf',
    isSynced: true,
    tags: ['MPLS', 'SD-WAN', 'Fibra Óptica', 'Enlaces Dedicados', 'QoS', 'SLA', 'Cisco', 'Fortinet'],
    aiSummary: 'Documentación para la formulación de propuestas de interconexión corporativa sobre la red de Fibra Óptica troncal nacional de Claro, integrando SD-WAN con políticas de seguridad y priorización de tráfico.',
    keyTakeaways: [
      'Disponibilidad del backbone nacional: 99.98%.',
      'Clases de servicio (CoS): Voz (Realtime), Video (Interactive), Datos Críticos y Best-Effort.',
      'Soporte de túneles híbridos (MPLS + Internet Directo + Backup 5G Móvil).',
      'Monitoreo proactivo 24x7 desde el NOC Central de Claro en Santo Domingo.'
    ],
    contentPreview: `CLARO EMPRESAS - CONECTIVIDAD AVANZADA
REDES PRIVADAS IP/MPLS Y CLARO SD-WAN

1. VENTAJAS DE LA INFRAESTRUCTURA CLARO:
- Red de fibra óptica subterránea y autosoportada con más de 18,000 km en República Dominicana.
- Conectividad directa a cables submarinos Arcos-1, Antillas-1 y AMX-1.
- Módulos CPE Cisco ISR / Catalyst y Fortinet Secure SD-WAN incluidos en modalidad administrada.`
  },
  {
    id: 'doc-mpls-02',
    name: 'Tarifario_Enlaces_Internet_Dedicado_DIA_2026.xlsx',
    title: 'Matriz de Tarifas Oficiales: Internet Dedicado Corporativo (DIA)',
    folder: 'Conectividad & MPLS',
    category: 'Conectividad & MPLS',
    extension: 'xlsx',
    size: '840 KB',
    sizeBytes: 860160,
    modifiedDate: '2026-06-30',
    author: 'Gerencia de Pricing y Productos B2B',
    version: '2026.2',
    sharepointUrl: 'https://clarocomdo.sharepoint.com/sites/gevc/indiso/Shared%20Documents1/Documentaciones%20Comerciales/Conectividad%20%26%20MPLS/Tarifario_Enlaces_Internet_Dedicado_DIA_2026.xlsx',
    isSynced: true,
    tags: ['Internet Dedicado', 'DIA', 'Tarifas', 'Fibra Óptica', 'Bandwidth', 'IP Fija', 'Simétrico'],
    aiSummary: 'Matriz confidencial de tarifas comerciales para enlaces de Internet Dedicado simétrico (1:1) desde 20 Mbps hasta 10 Gbps con asignación de bloques IPv4/IPv6 y SLA comercial.',
    keyTakeaways: [
      'Velocidades simétricas garantizadas 1:1 sin sobre-suscripción.',
      'Incluye bloque de 8 direcciones IPv4 públicas (/29).',
      'Tiempo medio de reparación (MTTR) menor a 4 horas.',
      'Descuentos por plazo contractual a 24 y 36 meses.'
    ],
    contentPreview: `TARIFARIO CORPORATIVO - INTERNET DEDICADO CLARO (DIA 2026)
Velocidad (Mbps) | Renta Mensual (USD) | Renta Mensual (DOP Aprox) | Plazo
20 Mbps Simétrico | $280.00 USD | RD$ 16,800.00 | 24 meses
50 Mbps Simétrico | $450.00 USD | RD$ 27,000.00 | 24 meses
100 Mbps Simétrico | $690.00 USD | RD$ 41,400.00 | 36 meses
200 Mbps Simétrico | $1,100.00 USD | RD$ 66,000.00 | 36 meses
500 Mbps Simétrico | $2,200.00 USD | RD$ 132,000.00 | 36 meses
1 Gbps Simétrico | $3,500.00 USD | RD$ 210,000.00 | 36 meses`
  },

  // ==========================================================
  // CLOUD & DATA CENTER
  // ==========================================================
  {
    id: 'doc-cloud-01',
    name: 'Catalogo_Soluciones_Claro_Cloud_Empresarial.pdf',
    title: 'Catálogo de Soluciones Claro Cloud Empresarial & IaaS',
    folder: 'Cloud & Data Center',
    category: 'Cloud & Data Center',
    extension: 'pdf',
    size: '3.6 MB',
    sizeBytes: 3774873,
    modifiedDate: '2026-06-11',
    author: 'Equipo Producto Claro Cloud Dominicana',
    version: '3.0',
    sharepointUrl: 'https://clarocomdo.sharepoint.com/sites/gevc/indiso/Shared%20Documents1/Documentaciones%20Comerciales/Cloud%20%26%20Data%20Center/Catalogo_Soluciones_Claro_Cloud_Empresarial.pdf',
    isSynced: true,
    tags: ['Cloud', 'IaaS', 'Data Center', 'Servidores Virtuales', 'Backup', 'Soberanía de Datos'],
    aiSummary: 'Brochure y especificaciones completas de los servicios de infraestructura en la nube alojados en el Data Center certificado de Claro en Santo Domingo. Cubre servidores virtuales, almacenamiento NVMe, recuperación ante desastres (DRaaS) y nube híbrida.',
    keyTakeaways: [
      'Soberanía de datos 100% en territorio nacional de República Dominicana.',
      'Latencia ultrabaja (< 5ms en la red nacional).',
      'Facturación unificada en pesos dominicanos o USD.',
      'Soporte directo nivel 3 en español 24/7/365.'
    ],
    contentPreview: `CLARO CLOUD EMPRESARIAL - DATA CENTER SANTO DOMINGO
INFRAESTRUCTURA DE MISIÓN CRÍTICA

1. Nube Local con Estándares Internacionales:
Data Center Tier III certificado con redundancia eléctrica N+1, sistemas de extinción de incendios por gas limpio FM-200 y climatización de precisión.

2. Paquetes IaaS Populares:
- Servidor Cloud Small: 2 vCPU, 4 GB RAM, 100 GB SSD NVMe -> $45.00 USD/mes
- Servidor Cloud Medium: 4 vCPU, 16 GB RAM, 250 GB SSD NVMe -> $120.00 USD/mes
- Servidor Cloud Large: 8 vCPU, 32 GB RAM, 500 GB SSD NVMe -> $240.00 USD/mes
- Servidor Cloud Enterprise: 16 vCPU, 64 GB RAM, 1 TB SSD NVMe -> $480.00 USD/mes`
  },
  {
    id: 'doc-cloud-02',
    name: 'SLA_Acuerdo_Nivel_Servicio_DataCenter_Claro.docx',
    title: 'Acuerdo de Nivel de Servicio (SLA) Data Center & Cloud',
    folder: 'Cloud & Data Center',
    category: 'Cloud & Data Center',
    extension: 'docx',
    size: '1.2 MB',
    sizeBytes: 1258291,
    modifiedDate: '2026-05-20',
    author: 'Gerencia Legal y Regulatoria Claro',
    version: '2.5',
    sharepointUrl: 'https://clarocomdo.sharepoint.com/sites/gevc/indiso/Shared%20Documents1/Documentaciones%20Comerciales/Cloud%20%26%20Data%20Center/SLA_Acuerdo_Nivel_Servicio_DataCenter_Claro.docx',
    isSynced: true,
    tags: ['SLA', 'Contrato', 'Garantía', 'Data Center', 'Legal', 'Penalidades', 'Disponibilidad'],
    aiSummary: 'Términos contractuales y compromisos formales de disponibilidad del servicio, tiempos máximos de respuesta, créditos por indisponibilidad y políticas de seguridad física y lógica en centros de datos.',
    keyTakeaways: [
      'Disponibilidad anual garantizada: 99.95% para Cloud Empresarial.',
      'Ventana de mantenimiento programado: Notificación previa con 72 horas hábiles.',
      'Crédito en factura de hasta el 25% mensual por incumplimiento de métricas SLA.',
      'Cumplimiento de estándares ISO 27001 e ISO 9001.'
    ],
    contentPreview: `ACUERDO DE NIVEL DE SERVICIO (SLA) - COMPAÑÍA DOMINICANA DE TELÉFONOS
SERVICIOS DE ALOJAMIENTO, NUBE Y DATA CENTER

1. OBJETO Y ALCANCE:
El presente documento regula los compromisos de calidad, confiabilidad y tiempos de respuesta brindados por CLARO a sus clientes corporativos para servicios de Hosting, Servidores Virtuales y Colocation.

2. TIEMPOS DE ATENCIÓN DE INCIDENTES (MTTR):
- Severidad 1 (Crítica / Caída Total): Respuesta en < 15 min | Resolución en < 2 horas.
- Severidad 2 (Alta / Degradación Mayor): Respuesta en < 30 min | Resolución en < 4 horas.
- Severidad 3 (Media / Menor impacto): Respuesta en < 2 horas | Resolución en < 8 horas.`
  },

  // ==========================================================
  // CIBERSEGURIDAD & SOC
  // ==========================================================
  {
    id: 'doc-sec-01',
    name: 'Propuesta_Base_Servicios_SOC_Gestionado_EDR.pdf',
    title: 'Propuesta Comercial Base: SOC Gestionado & Endpoint Protection (EDR)',
    folder: 'Ciberseguridad & SOC',
    category: 'Ciberseguridad & SOC',
    extension: 'pdf',
    size: '3.1 MB',
    sizeBytes: 3250585,
    modifiedDate: '2026-06-28',
    author: 'Centro de Operaciones de Ciberseguridad (SOC Claro)',
    version: '3.1',
    sharepointUrl: 'https://clarocomdo.sharepoint.com/sites/gevc/indiso/Shared%20Documents1/Documentaciones%20Comerciales/Ciberseguridad%20%26%20SOC/Propuesta_Base_Servicios_SOC_Gestionado_EDR.pdf',
    isSynced: true,
    tags: ['Ciberseguridad', 'SOC', 'EDR', 'SIEM', 'Fortinet', 'CrowdStrike', 'Monitoreo 24/7'],
    aiSummary: 'Propuesta técnica y económica para la contratación de monitoreo proactivo de amenazas cibernéticas, detección de incidentes en tiempo real y protección de terminales con agentes EDR administrados por analistas certificados.',
    keyTakeaways: [
      'Monitoreo continuo 24/7/365 con analistas Tier 1, Tier 2 y Tier 3.',
      'Protección contra Ransomware, malware de día cero y amenazas persistentes avanzadas (APT).',
      'Integración con plataformas FortiSIEM, Microsoft Sentinel y CrowdStrike Falcon.',
      'Reportes ejecutivos mensuales de postura de seguridad y cumplimiento normativo.'
    ],
    contentPreview: `CLARO CIBERSEGURIDAD - SECURITY OPERATIONS CENTER (SOC)
PROPUESTA COMERCIAL INTEGRAL

1. SERVICIOS DEL SOC CLARO:
- Detección y Contención Automática de Amenazas.
- Análisis Forense Digital y Respuesta a Incidentes (DFIR).
- Gestión de Vulnerabilidades Periódicas en Servidores y Redes.
- Ciberinteligencia de Amenazas (Threat Intelligence Feed para Rep. Dominicana y Caribe).`
  },

  // ==========================================================
  // MÓVIL CORPORATIVO
  // ==========================================================
  {
    id: 'doc-mov-01',
    name: 'Planes_Flotas_Moviles_Corporativas_Claro_5G.pdf',
    title: 'Planes y Condiciones Flotas Móviles Corporativas 5G Claro',
    folder: 'Móvil Corporativo',
    category: 'Móvil Corporativo',
    extension: 'pdf',
    size: '2.8 MB',
    sizeBytes: 2936012,
    modifiedDate: '2026-07-05',
    author: 'Gerencia Comercial Cuentas Corporativas Móviles',
    version: '6.0',
    sharepointUrl: 'https://clarocomdo.sharepoint.com/sites/gevc/indiso/Shared%20Documents1/Documentaciones%20Comerciales/M%C3%B3vil%20Corporativo/Planes_Flotas_Moviles_Corporativas_Claro_5G.pdf',
    isSynced: true,
    tags: ['Móvil', '5G', 'Flotas', 'Roaming', 'Planes Libres', 'Control', 'Smartphones'],
    aiSummary: 'Guía comercial de planes corporativos de telefonía celular 5G. Incluye paquetes de datos ilimitados, llamadas entre flotas a RD$0.00, bolsas de roaming para América y financiamiento de terminales de alta gama.',
    keyTakeaways: [
      'Cobertura 5G líder en todo el territorio de la República Dominicana.',
      'Llamadas ilimitadas sin costo entre todas las líneas de la misma flota empresarial.',
      'Roaming Claro Sin Fronteras incluido en planes seleccionados.',
      'Portal Corporativo de Autogestión de Datos y Asignación de Límites.'
    ],
    contentPreview: `CLARO NEGOCIOS - FLOTAS MÓVILES CORPORATIVAS 5G
TARIFAS Y BENEFICIOS EXCLUSIVOS

Planes Flota Inteligente:
- Plan Flota Control 15GB: RD$ 895.00/mes + Impuestos (Minutos ilimitados a la flota + 300 min otras redes).
- Plan Flota Ilimitado 40GB: RD$ 1,495.00/mes + Impuestos (Incluye Roaming América).
- Plan Flota Ultra 5G Ilimitado: RD$ 2,295.00/mes + Impuestos (Datos libres en alta velocidad + Roaming Global).`
  },

  // ==========================================================
  // PLANTILLAS & TARIFARIOS
  // ==========================================================
  {
    id: 'doc-plant-01',
    name: 'Plantilla_Oficial_Cotizacion_HPBX_Pymes_Corp.xlsx',
    title: 'Plantilla Oficial de Cotizaciones Claro HPBX (Pymes & Corporativo)',
    folder: 'Plantillas & Propuestas',
    category: 'Plantillas & Propuestas',
    extension: 'xlsx',
    size: '1.5 MB',
    sizeBytes: 1572864,
    modifiedDate: '2026-07-10',
    author: 'Gerencia de Procesos Comerciales y Ventas B2B',
    version: '2026.3',
    sharepointUrl: 'https://clarocomdo.sharepoint.com/sites/gevc/indiso/Shared%20Documents1/Documentaciones%20Comerciales/Plantillas%20%26%20Propuestas/Plantilla_Oficial_Cotizacion_HPBX_Pymes_Corp.xlsx',
    isSynced: true,
    tags: ['Plantilla', 'Excel', 'Cotizador', 'HPBX', 'Pymes', 'Corporativo', 'Fórmulas', 'Impuestos'],
    aiSummary: 'Plantilla oficial estandarizada en formato Excel con fórmulas automatizadas para el cálculo de cotizaciones comerciales de Hosted PBX bajo las regulaciones impositivas dominicanas (ITBIS 18%, ISC 10%, CDT 2%).',
    keyTakeaways: [
      'Desglose automatizado en 4 secciones: Renta Servicios, Renta Equipos, Venta e Instalación.',
      'Cálculo exacto del 30% impositivo en telecomunicaciones y 18% en hardware.',
      'Cumple estrictamente con el formato corporativo de Claro Dominicana.'
    ],
    contentPreview: `FORMATO ESTANDARIZADO DE COTIZACIÓN COMERCIAL CLARO HPBX
COMPAÑÍA DOMINICANA DE TELÉFONOS, S.A. (RNC: 10100157-7)

Estructura de la Hoja de Trabajo:
- Tab 'HPBX Pymes': Base 3 estaciones + Adicionales (HPBXPYME, HPRECP, DIDIP1P, HPMUA1).
- Tab 'HPBX Corporativo': Base 8 estaciones + Routers SBC (IPHOSTPRM, IPHOSTSTD, HPRTAC25 a 500).
- Tab 'Resumen Financiero': Cálculo consolidado de Renta Neta, Impuestos, Instalación y Grand Total.`
  },
  {
    id: 'doc-plant-02',
    name: 'Terminos_Condiciones_Generales_Servicios_Claro_B2B.pdf',
    title: 'Términos y Condiciones Generales de Contratación B2B Claro',
    folder: 'Plantillas & Propuestas',
    category: 'Plantillas & Propuestas',
    extension: 'pdf',
    size: '1.9 MB',
    sizeBytes: 1992294,
    modifiedDate: '2026-04-10',
    author: 'Consultoría Jurídica Claro Dominicana',
    version: '1.8',
    sharepointUrl: 'https://clarocomdo.sharepoint.com/sites/gevc/indiso/Shared%20Documents1/Documentaciones%20Comerciales/Plantillas%20%26%20Propuestas/Terminos_Condiciones_Generales_Servicios_Claro_B2B.pdf',
    isSynced: true,
    tags: ['Términos', 'Condiciones', 'Contrato', 'Legal', 'Indotel', 'Regulación', 'Cancelaciones'],
    aiSummary: 'Cláusulas legales y condiciones regulatorias estándar aplicables a todos los contratos corporativos de telecomunicaciones, enlaces de datos y servicios en la nube de Claro Dominicana conforme a las resoluciones del INDOTEL.',
    keyTakeaways: [
      'Marco regulatorio conforme a las directrices vigentes del INDOTEL.',
      'Condiciones de terminación anticipada y plazos de permanencia mínima.',
      'Requisitos técnicos de puesta a tierra y protección eléctrica por parte del cliente.'
    ],
    contentPreview: `COMPAÑÍA DOMINICANA DE TELÉFONOS, S.A.
CONDICIONES GENERALES DE CONTRATACIÓN DE SERVICIOS EMPRESARIALES

1. Validez de ofertas comerciales: 30 días calendario contados a partir de su emisión.
2. Infraestructura en sitio del cliente: El cliente debe proveer suministro eléctrico ininterrumpido (UPS) y sistema de puesta a tierra con resistencia menor a 5 Ohms.
3. Impuestos aplicables: Conforme a la legislación tributaria dominicana (Ley 11-92 y modificaciones), los servicios de telecomunicaciones están gravados con 18% ITBIS, 10% ISC y 2% CDT.`
  }
];

export const FOLDER_TREE = [
  {
    name: 'Documentaciones Comerciales',
    path: '/sites/gevc/indiso/Shared Documents1/Documentaciones Comerciales',
    icon: 'Folder',
    subfolders: [
      { name: 'HPBX y Telefonía IP', count: 3, path: '/HPBX y Telefonía IP' },
      { name: 'Conectividad & MPLS', count: 2, path: '/Conectividad & MPLS' },
      { name: 'Cloud & Data Center', count: 2, path: '/Cloud & Data Center' },
      { name: 'Ciberseguridad & SOC', count: 1, path: '/Ciberseguridad & SOC' },
      { name: 'Móvil Corporativo', count: 1, path: '/Móvil Corporativo' },
      { name: 'Plantillas & Propuestas', count: 2, path: '/Plantillas & Propuestas' }
    ]
  }
];
