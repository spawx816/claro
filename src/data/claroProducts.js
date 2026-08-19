/**
 * Catálogo Oficial de Productos y Soluciones Claro Cloud República Dominicana
 * Fuente oficial: https://www.clarocloud.com.do/portal/cloud-do/cld/productos/
 */

export const CLARO_CLOUD_CATEGORIES = [
  'Todos',
  'Telefonía IP & HPBX',
  'Infraestructura',
  'Seguridad',
  'Colaboración',
  'Presencia Web',
  'Servicios Administrados',
  'Servicios Profesionales'
];

export const productsData = [
  // ==========================================
  // 0. TELEFONÍA IP & HOSTED PBX (HPBX)
  // ==========================================
  {
    id: 'hpbx-pymes',
    name: 'Hosted PBX Claro PYMES (Grandstream GRP Series)',
    category: 'Telefonía IP & HPBX',
    portalUrl: 'https://www.claro.com.do/negocios/telefonia/hosted-pbx/',
    shortDescription: 'Central telefónica virtual en la nube para PYMES (Base 3 usuarios, 1,500 min LDN, MPLS) con teléfonos Grandstream GRP.',
    price: 'Desde RD$ 2,775.00 / mes (Neto)',
    badge: 'Grandstream GRP',
    details: {
      minUsers: '3 Estaciones Base',
      setupFee: 'RD$ 1,575.00 Base',
      features: [
        'Incluye 3 estaciones base y 1,500 minutos de Larga Distancia Nacional (LDN)',
        'Teléfonos IP Grandstream GRP2602 ($190/mes), GRP2603 ($220/mes), GRP2612 ($320/mes), GRP2616 ($795/mes)',
        'Solución Inalámbrica DECT: Base Grandstream DP752 ($270/mes) y Handset DP722 ($285/mes)',
        'Botoneras de expansión: Grandstream GBX20 ($895/mes) y GXP2200 EXT ($765/mes)',
        'Conectividad privada MPLS, Auto Attendant IVR, Recepcionista y DID IP'
      ]
    },
    longDescription: 'Centralita telefónica en la nube de Claro Dominicana para pequeñas y medianas empresas. Elimina la inversión en PBX físicas y moderniza tus extensiones con la serie Grandstream GRP.'
  },
  {
    id: 'hpbx-corporativo',
    name: 'Hosted PBX Claro Corporativo (Grandstream GRP Series)',
    category: 'Telefonía IP & HPBX',
    portalUrl: 'https://www.claro.com.do/negocios/telefonia/hosted-pbx/',
    shortDescription: 'Central IP de alto rendimiento para corporaciones (Base 8 usuarios, 5,000 min LDN, Router AudioCodes y Grandstream GRP).',
    price: 'Desde RD$ 7,385.00 / mes (Neto)',
    badge: 'Corporativo Premium',
    details: {
      minUsers: '8 Estaciones Base',
      setupFee: 'RD$ 4,200.00 Base',
      features: [
        'Incluye 8 usuarios base, 5,000 minutos LDN, MPLS corporativo y Router AudioCodes',
        'Modelos ejecutivos Grandstream GRP2614 ($460/mes), GRP2615 ($1,275/mes), GRP2616 ($795/mes) y GXP2140 ($830/mes)',
        'Escalabilidad en paquetes de 5, 25 y 100 teléfonos con tarifas preferenciales',
        'Mensajería Unificada (correo de voz a email) y Licencias Softphone Webex',
        'Garantía SLA de disponibilidad y soporte empresarial 24/7'
      ]
    },
    longDescription: 'Solución empresarial de comunicaciones unificadas con redundancia de red, enrutamiento inteligente AudioCodes y la nueva gama de teléfonos Grandstream GRP de alta definición acústica.'
  },
  // ==========================================
  // 1. INFRAESTRUCTURA
  // ==========================================
  {
    id: 'claro-cloud-empresarial',
    name: 'Claro Cloud Empresarial',
    category: 'Infraestructura',
    portalUrl: 'https://www.clarocloud.com.do/portal/cloud-do/cld/productos/infraestructura/claro-cloud-empresarial/',
    shortDescription: 'Servidores virtuales privados (IaaS) y Data Center Virtual de alta disponibilidad en República Dominicana.',
    price: 'Desde $29.00 USD / mes',
    badge: 'Local RD',
    details: {
      minUsers: 'N/A',
      setupFee: '$0.00 USD (Aprovisionamiento inmediato)',
      features: [
        'Infraestructura alojada en Data Center certificado Claro Dominicana (baja latencia)',
        'Escalabilidad en caliente de vCPU, memoria RAM y almacenamiento SSD/NVMe',
        'Backups automatizados programables con retención personalizada',
        'Dirección IP pública fija y conectividad privada MPLS/VPN',
        'Soporte técnico especializado 24/7/365 en español'
      ]
    },
    longDescription: 'Claro Cloud Empresarial ofrece infraestructura como servicio (IaaS) flexible y segura. Permite desplegar servidores virtuales y centros de datos definidos por software cumpliendo con las regulaciones locales de soberanía de datos en República Dominicana.'
  },
  {
    id: 'azure',
    name: 'Microsoft Azure',
    category: 'Infraestructura',
    portalUrl: 'https://www.clarocloud.com.do/portal/cloud-do/cld/productos/infraestructura/azure/',
    shortDescription: 'Servicios de nube híbrida y pública de Microsoft con soporte local y facturación Claro.',
    price: 'Bajo consumo / suscripción',
    badge: 'Partner Gold',
    details: {
      minUsers: 'N/A',
      setupFee: 'Consultoría de migración disponible',
      features: [
        'Más de 200 servicios cloud (IA, analítica, bases de datos SQL gestionadas)',
        'Integración nativa con Microsoft 365 y Active Directory empresarial',
        'Facturación en pesos dominicanos (DOP) o USD en tu factura Claro mensual',
        'Arquitectura de nube híbrida con ExpressRoute y VPN dedicada',
        'Acompañamiento y soporte por ingenieros certificados de Claro'
      ]
    },
    longDescription: 'Aproveche la potencia de la nube de Microsoft con la asesoría, conectividad y facturación unificada de Claro Dominicana. Diseñe ambientes híbridos y resilientes para sus aplicaciones críticas.'
  },
  {
    id: 'amazon-web-services',
    name: 'Amazon Web Services (AWS)',
    category: 'Infraestructura',
    portalUrl: 'https://www.clarocloud.com.do/portal/cloud-do/cld/productos/infraestructura/amazon-web-services/',
    shortDescription: 'Plataforma elástica global de computación en la nube integrada con conectividad directa Claro.',
    price: 'Bajo consumo / catálogo AWS',
    badge: 'Multi-Cloud',
    details: {
      minUsers: 'N/A',
      setupFee: 'Evaluación técnica inicial sin costo',
      features: [
        'Servicios elásticos de cómputo EC2, S3, RDS, contenedores EKS y Serverless',
        'Conexión privada de alta velocidad y baja latencia mediante AWS Direct Connect',
        'Consolidación de cuentas y optimización de costos FinOps',
        'Facturación corporativa unificada en tu estado de cuenta Claro',
        'Servicios profesionales de migración y modernización de arquitecturas'
      ]
    },
    longDescription: 'Despliegue arquitecturas escalables y tolerantes a fallos en la nube líder mundial AWS con la gestión, conectividad y soporte local de Claro Dominicana.'
  },
  {
    id: 'backup-empresarial',
    name: 'Backup Empresarial',
    category: 'Infraestructura',
    portalUrl: 'https://www.clarocloud.com.do/portal/cloud-do/cld/productos/infraestructura/backup-empresarial/',
    shortDescription: 'Respaldo robusto y recuperación ante desastres (DRaaS) para servidores y máquinas virtuales.',
    price: 'Desde $45.00 USD / mes',
    badge: 'Disaster Recovery',
    details: {
      minUsers: '1 Servidor',
      setupFee: 'Instalación asistida incluida',
      features: [
        'Respaldo de servidores físicos, VMware, Hyper-V y entornos cloud',
        'Cifrado AES de 256 bits en tránsito y en reposo',
        'Ransomware Protection con detección de comportamientos anómalos',
        'Recuperación granular de archivos, bases de datos o máquinas completas',
        'Replicación continua en Data Center secundario Claro'
      ]
    },
    longDescription: 'Garantice la continuidad operativa de su empresa ante incidentes, fallas de hardware o ataques cibernéticos con la plataforma de Backup Empresarial de Claro.'
  },
  {
    id: 'almacenamiento-como-servicio',
    name: 'Almacenamiento como Servicio (STaaS)',
    category: 'Infraestructura',
    portalUrl: 'https://www.clarocloud.com.do/portal/cloud-do/cld/productos/infraestructura/almacenamiento-como-servicio/',
    shortDescription: 'Almacenamiento de objetos masivo y escalable bajo demanda para datos no estructurados.',
    price: 'Desde $19.00 USD / TB al mes',
    badge: 'Object Storage',
    details: {
      minUsers: 'N/A',
      setupFee: '$0.00 USD',
      features: [
        'Compatibilidad nativa con API S3 para integración inmediata',
        'Durabilidad de datos del 99.999999999% (11 nueves)',
        'Escalabilidad elástica sin necesidad de aprovisionamiento previo',
        'Políticas automáticas de ciclo de vida y archivado histórico',
        'Conexión local directa de alto rendimiento sin costo excesivo de egress'
      ]
    },
    longDescription: 'Almacene repositorios masivos de datos, archivos de video, respaldos y registros históricos de forma segura, económica y con acceso de alta velocidad desde cualquier ubicación.'
  },
  {
    id: 'collocation',
    name: 'Colocation (Colocación en Data Center)',
    category: 'Infraestructura',
    portalUrl: 'https://www.clarocloud.com.do/portal/cloud-do/cld/productos/infraestructura/collocation/',
    shortDescription: 'Espacio físico en racks certificados con energía redundante, climatización y seguridad de nivel bancario.',
    price: 'Bajo cotización por rack / unidad',
    badge: 'Tier III / ICREA',
    details: {
      minUsers: '1/2 Rack o Rack Completo',
      setupFee: 'Sujeto a ingeniería de instalación',
      features: [
        'Data Center con certificación de clase mundial y redundancia eléctrica N+1 / 2N',
        'Sistemas de climatización de precisión y extinción de incendios por gas limpio',
        'Acceso biométrico, circuito cerrado de TV y vigilancia armada 24/7',
        'Interconexión directa con el backbone de fibra óptica nacional e internacional de Claro',
        'Servicios de manos remotas especializadas (Remote Hands)'
      ]
    },
    longDescription: 'Aloje sus servidores y equipos propios en las instalaciones de Data Center más seguras y confiables del país, reduciendo costos de mantenimiento físico y garantizando máxima disponibilidad.'
  },

  // ==========================================
  // 2. SEGURIDAD / CIBERSEGURIDAD
  // ==========================================
  {
    id: 'claro-backup',
    name: 'Claro Backup',
    category: 'Seguridad',
    portalUrl: 'https://www.clarocloud.com.do/portal/cloud-do/cld/productos/seguridad/claro-backup/',
    shortDescription: 'Respaldo automático y continuo para computadoras, laptops y dispositivos de trabajo.',
    price: 'Desde $3.50 USD / dispositivo al mes',
    badge: 'Protección Endpoint',
    details: {
      minUsers: '1 Equipo',
      setupFee: '$0.00 USD',
      features: [
        'Respaldo silencioso y programado en segundo plano sin interrumpir al usuario',
        'Historial de versiones para revertir cambios accidentales o daños por virus',
        'Acceso seguro a los archivos respaldados desde portal web o aplicación móvil',
        'Cifrado de grado militar antes de salir del dispositivo del usuario',
        'Panel de administración centralizado para supervisar toda la flota de PCs'
      ]
    },
    longDescription: 'Proteja la información de sus colaboradores contra pérdida de laptops, daños de disco duro o secuestro de datos por ransomware con copias automáticas en la nube de Claro.'
  },
  {
    id: 'seguridad-negocios',
    name: 'Seguridad Empresas / Negocios',
    category: 'Seguridad',
    portalUrl: 'https://www.clarocloud.com.do/portal/cloud-do/cld/productos/seguridad/seguridad-negocios/',
    shortDescription: 'Protección de última generación contra virus, malware, phishing y ransomware en endpoints.',
    price: 'Desde $2.95 USD / usuario al mes',
    badge: 'Endpoint Security',
    details: {
      minUsers: '5 Licencias',
      setupFee: '$0.00 USD',
      features: [
        'Motor antivirus y antimalware basado en inteligencia artificial y machine learning',
        'Protección de navegación web, bloqueo de sitios maliciosos y control de descargas',
        'Firewall de host y prevención de intrusiones en tiempo real',
        'Consola cloud centralizada para auditoría, políticas e informes de seguridad',
        'Compatibilidad multiplataforma: Windows, macOS, Linux, iOS y Android'
      ]
    },
    longDescription: 'Blindaje completo para todos los dispositivos de su empresa. Bloquee amenazas avanzadas antes de que comprometan la red corporativa o filtren información confidencial.'
  },
  {
    id: 'videovigilancia',
    name: 'Videovigilancia Cloud',
    category: 'Seguridad',
    portalUrl: 'https://www.clarocloud.com.do/portal/cloud-do/cld/productos/seguridad/videovigilancia/',
    shortDescription: 'Monitoreo y grabación de video en la nube para sucursales, oficinas y almacenes.',
    price: 'Desde $12.00 USD / cámara al mes',
    badge: 'CCTV Cloud',
    details: {
      minUsers: '1 Cámara',
      setupFee: 'Opción de financiamiento de cámaras IP',
      features: [
        'Visualización en vivo y reproducción de grabaciones desde smartphone o PC',
        'Almacenamiento seguro en la nube de Claro (sin riesgo de robo de grabador local)',
        'Alertas inteligentes por detección de movimiento o intrusión en horarios no laborales',
        'Gestión multisucursal unificada en una sola pantalla',
        'Grabación en alta definición HD/Full HD con retención de 7, 15 o 30 días'
      ]
    },
    longDescription: 'Supervise las operaciones y la seguridad de sus locales comerciales y oficinas en tiempo real desde cualquier lugar, con respaldo de video inviolable en los servidores seguros de Claro.'
  },
  {
    id: 'ddos-protector',
    name: 'DDoS Protector',
    category: 'Seguridad',
    portalUrl: 'https://www.clarocloud.com.do/portal/cloud-do/cld/productos/seguridad/ddos-protector/',
    shortDescription: 'Mitigación y defensa en tiempo real contra ataques distribuidos de denegación de servicio.',
    price: 'Bajo cotización de ancho de banda',
    badge: 'Anti-DDoS',
    details: {
      minUsers: 'N/A',
      setupFee: 'Configuración en backbone Claro',
      features: [
        'Detección y mitigación automática en el núcleo de la red Claro (Cloud Scrubbing)',
        'Protección contra ataques volumétricos, de protocolo y de capa de aplicación (L7)',
        'Disponibilidad ininterrumpida de sus sitios web, portales de clientes y APIs',
        'Monitoreo continuo 24/7 por el Centro de Operaciones de Seguridad (SOC)',
        'Reportes detallados de incidentes y tráfico anómalo neutralizado'
      ]
    },
    longDescription: 'Proteja sus plataformas web y servicios públicos contra ataques maliciosos diseñados para saturar su ancho de banda y dejar inoperativa su presencia digital.'
  },
  {
    id: 'siem',
    name: 'SIEM como Servicio',
    category: 'Seguridad',
    portalUrl: 'https://www.clarocloud.com.do/portal/cloud-do/cld/productos/seguridad/siem/',
    shortDescription: 'Plataforma de correlación y gestión de eventos e incidentes de seguridad con monitoreo SOC.',
    price: 'Bajo cotización por volumen de logs (EPS)',
    badge: 'SOC 24/7',
    details: {
      minUsers: 'Empresarial',
      setupFee: 'Integración y homologación de fuentes',
      features: [
        'Recolección centralizada y correlación de logs de servidores, firewalls y redes',
        'Detección temprana de intrusiones, movimientos laterales y fugas de información',
        'Gestión de incidentes respaldada por analistas de ciberseguridad certificados',
        'Cumplimiento con normativas y estándares internacionales de auditoría',
        'Tableros ejecutivos en tiempo real con métricas de postura de seguridad'
      ]
    },
    longDescription: 'Eleve la madurez de ciberseguridad de su organización con visibilidad total de los eventos de red y respuesta coordinada ante incidentes críticos.'
  },
  {
    id: 'spa-sdwan',
    name: 'Seguridad Perimetral Administrada - SD-WAN',
    category: 'Seguridad',
    portalUrl: 'https://www.clarocloud.com.do/portal/cloud-do/cld/productos/seguridad/spa-sdwan/',
    shortDescription: 'Red WAN definida por software con Next-Generation Firewall (NGFW) gestionado.',
    price: 'Bajo cotización por sucursal',
    badge: 'NGFW + SD-WAN',
    details: {
      minUsers: 'Mínimo 2 nodos',
      setupFee: 'Instalación y configuración llave en mano',
      features: [
        'Enrutamiento inteligente dinámico según calidad de enlace (latencia, jitter, pérdida)',
        'Firewall de nueva generación con IPS, filtrado web, antivirus perimetral y control de apps',
        'Optimización transparente para aplicaciones críticas como SAP, Microsoft 365 y VoIP',
        'Portal de gestión centralizado con analítica completa de tráfico y amenazas',
        'Soporte y administración integral por ingenieros especialistas de Claro'
      ]
    },
    longDescription: 'Interconecte sus sucursales de forma eficiente y segura, combinando enlaces de fibra, inalámbricos y LTE con seguridad perimetral de nivel corporativo gestionada extremo a extremo.'
  },
  {
    id: 'sase',
    name: 'SASE (Secure Access Service Edge)',
    category: 'Seguridad',
    portalUrl: 'https://www.clarocloud.com.do/portal/cloud-do/cld/productos/seguridad/sase/',
    shortDescription: 'Arquitectura convergente de red y seguridad en la nube para trabajo híbrido y usuarios móviles.',
    price: 'Bajo cotización por usuario',
    badge: 'Zero Trust',
    details: {
      minUsers: '10 Usuarios',
      setupFee: 'Despliegue y configuración inicial',
      features: [
        'Acceso de red Zero Trust (ZTNA) para conectar usuarios a aplicaciones privadas',
        'Secure Web Gateway (SWG) y Cloud Access Security Broker (CASB) integrados',
        'Protección idéntica para colaboradores dentro de la oficina o trabajando en remoto',
        'Inspección profunda de tráfico SSL/TLS sin degradar la experiencia de usuario',
        'Políticas de seguridad unificadas y basadas en identidad de usuario y dispositivo'
      ]
    },
    longDescription: 'Adopte el modelo de seguridad moderno para empresas ágiles. Permita que sus colaboradores accedan a los recursos corporativos y en la nube desde cualquier lugar con máxima protección.'
  },
  {
    id: 'pruebas-forenses',
    name: 'Pruebas Forenses',
    category: 'Seguridad',
    portalUrl: 'https://www.clarocloud.com.do/portal/cloud-do/cld/productos/seguridad/pruebas-forenses/',
    shortDescription: 'Servicio pericial de investigación digital y análisis de incidentes de seguridad.',
    price: 'Por proyecto / caso',
    badge: 'Peritaje Digital',
    details: {
      minUsers: 'Por incidente',
      setupFee: 'Evaluación preliminar de alcance',
      features: [
        'Preservación de evidencia digital bajo estricta cadena de custodia legal',
        'Análisis de causa raíz de intrusiones, fraudes o fugas de información interna',
        'Recuperación y análisis de artefactos digitales, memoria y registros borrados',
        'Dictámenes e informes técnicos válidos para procesos legales o regulatorios',
        'Recomendaciones correctivas para cerrar las brechas explotadas'
      ]
    },
    longDescription: 'Servicio pericial especializado para esclarecer incidentes de seguridad de la información, determinar el impacto real y brindar soporte técnico y legal ante contingencias.'
  },
  {
    id: 'analisis-de-vulnerabilidad',
    name: 'Análisis de Vulnerabilidad',
    category: 'Seguridad',
    portalUrl: 'https://www.clarocloud.com.do/portal/cloud-do/cld/productos/seguridad/analisis-de-vulnerabilidad/',
    shortDescription: 'Evaluación técnica, escaneo de seguridad y pruebas de penetración (Ethical Hacking).',
    price: 'Por evaluación / recurrente',
    badge: 'Pentesting',
    details: {
      minUsers: 'Por alcance de IPs/Apps',
      setupFee: 'Kickoff de proyecto',
      features: [
        'Escaneo exhaustivo de vulnerabilidades en infraestructura interna y perimetral',
        'Pruebas de penetración (pentesting) en aplicaciones web, móviles y APIs',
        'Clasificación de hallazgos según nivel de criticidad (CVSS) y riesgo de negocio',
        'Informe ejecutivo y reporte técnico detallado con pasos de remediación',
        'Re-test posterior para validar la correcta aplicación de los parches de seguridad'
      ]
    },
    longDescription: 'Identifique y corrija las fallas de seguridad en sus sistemas antes de que sean descubiertas y explotadas por atacantes cibernéticos.'
  },
  {
    id: 'capacitacion-concienciacion-seguridad',
    name: 'Capacitación en Concienciación sobre Seguridad',
    category: 'Seguridad',
    portalUrl: 'https://www.clarocloud.com.do/portal/cloud-do/cld/productos/seguridad/capacitacion-concienciacion-seguridad/',
    shortDescription: 'Plataforma educativa con simulaciones de phishing para entrenar a los colaboradores.',
    price: 'Desde $1.75 USD / usuario al mes',
    badge: 'Awareness',
    details: {
      minUsers: '15 Usuarios',
      setupFee: '$0.00 USD',
      features: [
        'Campañas automatizadas de simulación de ataques de phishing y smishing',
        'Módulos interactivos breves y dinámicos sobre buenas prácticas de ciberseguridad',
        'Medición del índice de riesgo humano y progreso del personal a lo largo del tiempo',
        'Entrenamiento correctivo automático para usuarios que caigan en simulaciones',
        'Reportes de cumplimiento para auditorías y certificaciones de calidad (ISO 27001)'
      ]
    },
    longDescription: 'Fortalezca el eslabón más vulnerable de la seguridad empresarial: las personas. Cree una cultura de prevención y alerta temprana frente a fraudes y engaños digitales.'
  },

  // ==========================================
  // 3. COLABORACIÓN
  // ==========================================
  {
    id: 'claro-drive-negocio',
    name: 'Claro drive Negocio',
    category: 'Colaboración',
    portalUrl: 'https://www.clarocloud.com.do/portal/cloud-do/cld/productos/colaboracion/claro-drive-negocio/',
    shortDescription: 'Almacenamiento corporativo en la nube para sincronizar y compartir archivos de forma segura.',
    price: 'Desde $4.00 USD / mes (100 GB)',
    badge: 'Cloud Storage',
    details: {
      minUsers: '1 Usuario',
      setupFee: '$0.00 USD',
      features: [
        'Acceso a los documentos de la empresa desde computadora, tablet o smartphone',
        'Carpetas compartidas con permisos configurables (solo lectura, edición, enlaces temporales)',
        'Sincronización automática de carpetas locales en Windows y macOS',
        'Visualización y edición básica de archivos en línea',
        'Infraestructura local con transferencia ilimitada en la red Claro'
      ]
    },
    longDescription: 'Facilite el trabajo colaborativo entre sus colaboradores con un espacio centralizado y seguro para almacenar y transferir documentos empresariales.'
  },
  {
    id: 'microsoft-365',
    name: 'Microsoft 365',
    category: 'Colaboración',
    portalUrl: 'https://www.clarocloud.com.do/portal/cloud-do/cld/productos/colaboracion/microsoft-365/',
    shortDescription: 'La suite de productividad líder: Word, Excel, Teams, Outlook, Exchange y OneDrive.',
    price: 'Desde $6.00 USD / usuario al mes',
    badge: 'Más Popular',
    details: {
      minUsers: '1 Licencia',
      setupFee: '$0.00 USD (Migración asistida disponible)',
      features: [
        'Correo corporativo profesional con dominio propio (50 GB de buzón Exchange)',
        'Aplicaciones de Office web y de escritorio instalables hasta en 5 dispositivos por usuario',
        '1 TB de almacenamiento en la nube por usuario en OneDrive for Business',
        'Microsoft Teams para videollamadas, chat corporativo y reuniones virtuales',
        'Seguridad integrada contra spam, suplantación y malware en el correo'
      ]
    },
    longDescription: 'Transforme la productividad de su equipo con las herramientas estándar de la industria, manteniendo sus comunicaciones centralizadas, seguras y actualizadas en todo momento.'
  },
  {
    id: 'google-workspace',
    name: 'Google Workspace',
    category: 'Colaboración',
    portalUrl: 'https://www.clarocloud.com.do/portal/cloud-do/cld/productos/colaboracion/google-workspace/',
    shortDescription: 'Correo empresarial Gmail, Google Drive, Meet, Documentos, Hojas de Cálculo y Calendario.',
    price: 'Desde $6.00 USD / usuario al mes',
    badge: 'Cloud Native',
    details: {
      minUsers: '1 Licencia',
      setupFee: '$0.00 USD',
      features: [
        'Correo corporativo impulsado por Gmail con dominio empresarial personalizado',
        'Videoconferencias en alta definición con Google Meet y cancelación de ruido',
        'Colaboración en tiempo real simultánea en Docs, Sheets y Slides',
        'Almacenamiento en Google Drive desde 30 GB hasta ilimitado por usuario',
        'Consola de administración avanzada con controles de seguridad e inicio de sesión único (SSO)'
      ]
    },
    longDescription: 'Todo lo que su empresa necesita para crear, comunicarse y colaborar en la nube de Google con la facturación y el respaldo local de Claro Dominicana.'
  },

  // ==========================================
  // 4. PRESENCIA WEB
  // ==========================================
  {
    id: 'pagina-web',
    name: 'Página Web & Hosting',
    category: 'Presencia Web',
    portalUrl: 'https://www.clarocloud.com.do/portal/cloud-do/cld/productos/presencia-web/pagina-web/',
    shortDescription: 'Alojamiento web confiable, registro de dominio y constructor de sitios intuitivo.',
    price: 'Desde $5.50 USD / mes',
    badge: 'Presencia Digital',
    details: {
      minUsers: 'N/A',
      setupFee: '$0.00 USD',
      features: [
        'Dominio web personalizado (.com, .net, .com.do sujeto a plan) incluido',
        'Constructor visual tipo arrastrar y soltar (drag & drop) sin requerir programación',
        'Plantillas modernas responsivas adaptadas para teléfonos inteligentes y tablets',
        'Certificado de seguridad SSL gratis para navegación segura HTTPS',
        'Cuentas de correo electrónico corporativo con webmail integrado'
      ]
    },
    longDescription: 'Dé a conocer su negocio en Internet con una presencia web profesional, rápida y disponible 24/7 en los servidores de Claro Cloud.'
  },
  {
    id: 'diseno-pagina-web',
    name: 'Diseño de Página Web Profesional',
    category: 'Presencia Web',
    portalUrl: 'https://www.clarocloud.com.do/portal/cloud-do/cld/productos/presencia-web/diseno-pagina-web/',
    shortDescription: 'Creación y diseño personalizado de sitios web y tiendas virtuales por diseñadores expertos.',
    price: 'Desde $199.00 USD (Pago único / financiado)',
    badge: 'Llave en Mano',
    details: {
      minUsers: 'N/A',
      setupFee: 'Entrega por proyecto',
      features: [
        'Diseño gráfico exclusivo adaptado a la identidad visual y marca de su empresa',
        'Optimización básica para motores de búsqueda (SEO) para aparecer en Google',
        'Integración con redes sociales, WhatsApp Business y formularios de contacto',
        'Opción de módulo de comercio electrónico (E-commerce) con pasarela de pagos',
        'Mantenimiento y actualizaciones técnicas continuas incluidas según plan'
      ]
    },
    longDescription: 'Deje la imagen digital de su empresa en manos de profesionales. Obtenemos un sitio web de alto impacto listo para captar nuevos clientes y generar ventas.'
  },

  // ==========================================
  // 5. SERVICIOS ADMINISTRADOS Y SOLUCIONES DE NEGOCIO
  // ==========================================
  {
    id: 'hpbx',
    name: 'Hosted PBX (Central Telefónica en la Nube)',
    category: 'Servicios Administrados',
    portalUrl: 'https://www.clarocloud.com.do/portal/cloud-do/cld/soluciones/servicios-administrados/pbx-hosteada/',
    shortDescription: 'Centralita telefónica IP empresarial (Pymes y Corporativo) con MPLS, IVR, minutos y teléfonos IP.',
    price: 'Pymes desde RD$ 2,775.00 / mes | Corp desde RD$ 7,385.00 / mes',
    badge: 'Telefonía Oficial Claro',
    details: {
      minUsers: '3 usuarios (Pymes) / 8 usuarios (Corporativo)',
      setupFee: 'Instalación certificada Claro',
      features: [
        'Conectividad MPLS dedicada que garantiza calidad de voz y cero interrupciones',
        'Bolsa de minutos LDN incluida (1,500 min Pymes / 5,000 min Corporativo)',
        'Operadora automática IVR (Auto Attendant) y desvío inteligente de llamadas',
        'Teléfonos IP Grandstream (GXP 1625, 2130, 2160) y Switches PoE Cisco en renta',
        'Softphones Webex en smartphones y computadoras para movilidad total'
      ]
    },
    longDescription: 'La solución líder en telecomunicaciones empresariales de Claro Dominicana. Elimine la inversión en plantas físicas y obtenga una centralita de voz de alta fidelidad con soporte corporativo integral.'
  },
  {
    id: 'facturacion-electronica-claro-cloud',
    name: 'Facturación Electrónica Claro Cloud',
    category: 'Servicios Administrados',
    portalUrl: 'https://www.clarocloud.com.do/portal/cloud-do/cld/soluciones/servicios-administrados/facturacion-electronica-claro-cloud/',
    shortDescription: 'Emisión y recepción de comprobantes fiscales electrónicos (e-CF) en cumplimiento con la Ley 32-23 de la DGII.',
    price: 'Planes escalables según volumen de e-CF emitidos',
    badge: 'Ley 32-23 DGII',
    details: {
      minUsers: '1 Empresa',
      setupFee: 'Homologación ante DGII y firma digital',
      features: [
        'Cumplimiento 100% certificado con la normativa y formatos e-CF de la DGII',
        'Firma digital automática y validación de comprobantes en tiempo real',
        'Integración transparente mediante APIs y conectores con su ERP actual o uso web',
        'Almacenamiento seguro y trazabilidad de facturas por el tiempo legal requerido',
        'Portal para que sus clientes consulten y descarguen sus facturas electrónicas'
      ]
    },
    longDescription: 'Modernice su facturación y cumpla con la Ley 32-23 de la DGII de manera rápida, segura y sin complicaciones técnicas con el respaldo tecnológico de Claro Cloud.'
  },
  {
    id: 'gestion-negocios-erp',
    name: 'Gestión de Negocios ERP',
    category: 'Servicios Administrados',
    portalUrl: 'https://www.clarocloud.com.do/portal/cloud-do/cld/soluciones/servicios-administrados/gestion-negocios/gestion-negocios-erp/',
    shortDescription: 'Sistema ERP integral en la nube para control de inventarios, compras, ventas, contabilidad y finanzas.',
    price: 'Desde $39.00 USD / mes',
    badge: 'ERP Cloud',
    details: {
      minUsers: '2 Usuarios',
      setupFee: 'Capacitación y parametrización inicial',
      features: [
        'Módulos unificados: Facturación, Cuentas por Cobrar/Pagar, Inventario y Bancos',
        'Generación automática de reportes fiscales para la DGII (606, 607, 608, IT-1)',
        'Acceso 100% web desde cualquier lugar sin necesidad de servidores locales',
        'Control de múltiples almacenes, sucursales y listas de precios diferenciadas',
        'Copias de seguridad diarias y mantenimiento del sistema incluido'
      ]
    },
    longDescription: 'Administre todas las áreas de su empresa en una sola plataforma en la nube, optimizando costos operativos y obteniendo reportes financieros en tiempo real.'
  },
  {
    id: 'punto-de-venta',
    name: 'Punto de Venta (POS Cloud)',
    category: 'Servicios Administrados',
    portalUrl: 'https://www.clarocloud.com.do/portal/cloud-do/cld/soluciones/servicios-administrados/punto-de-venta/',
    shortDescription: 'Solución digital para facturación rápida en caja, control de turnos y gestión de comercios.',
    price: 'Desde $25.00 USD / caja al mes',
    badge: 'Retail & POS',
    details: {
      minUsers: '1 Caja',
      setupFee: 'Configuración de impresoras térmicas y lectores',
      features: [
        'Cobro ágil con código de barras, tarjetas, efectivo y transferencias',
        'Control de aperturas, cortes de caja y arqueos por cajero y turno',
        'Actualización automática del inventario con cada venta realizada',
        'Operación en modo offline con sincronización automática al volver la conexión',
        'Reportes de productos más vendidos y rendimiento por sucursal en tiempo real'
      ]
    },
    longDescription: 'Agilice el cobro en sus tiendas, restaurantes o comercios con un sistema de punto de venta intuitivo, rápido y conectado en tiempo real con su inventario central.'
  },
  {
    id: 'bots-como-servicio',
    name: 'Bots como Servicio (RPA & Asistentes IA)',
    category: 'Servicios Administrados',
    portalUrl: 'https://www.clarocloud.com.do/portal/cloud-do/cld/soluciones/servicios-administrados/bots-como-servicio/',
    shortDescription: 'Automatización Robótica de Procesos (RPA) y chatbots inteligentes para atención al cliente.',
    price: 'Bajo alcance de automatización / flujo',
    badge: 'IA & RPA',
    details: {
      minUsers: 'Empresarial',
      setupFee: 'Desarrollo del flujo de automatización',
      features: [
        'Robots de software (RPA) para tareas repetitivas de digitación, conciliación y reportes',
        'Chatbots inteligentes con Inteligencia Artificial para WhatsApp, web y redes sociales',
        'Atención 24/7 a clientes con respuestas inmediatas y escalamiento a agentes humanos',
        'Integración con sistemas ERP, CRM y bases de datos existentes',
        'Reducción drástica de tiempos operativos y eliminación de errores manuales'
      ]
    },
    longDescription: 'Aumente la eficiencia de su organización delegando procesos rutinarios a robots de software y ofreciendo atención al cliente automatizada e inteligente las 24 horas del día.'
  },
  {
    id: 'gestion-salud',
    name: 'Gestión Salud',
    category: 'Servicios Administrados',
    portalUrl: 'https://www.clarocloud.com.do/portal/cloud-do/cld/soluciones/servicios-administrados/gestion-salud/',
    shortDescription: 'Plataforma médica para expedientes clínicos electrónicos, citas, recetas y agenda médica.',
    price: 'Desde $35.00 USD / médico al mes',
    badge: 'Sector Salud',
    details: {
      minUsers: '1 Profesional de la salud',
      setupFee: '$0.00 USD',
      features: [
        'Expediente clínico electrónico estandarizado, seguro y accesible desde cualquier dispositivo',
        'Agenda médica digital con recordatorios automáticos de citas por WhatsApp/correo',
        'Módulo de prescripción electrónica de medicamentos y órdenes de laboratorio',
        'Facturación médica y conciliación con Administradoras de Riesgos de Salud (ARS)',
        'Cumplimiento con normativas de confidencialidad y protección de datos de pacientes'
      ]
    },
    longDescription: 'Conecte el ecosistema de salud con una solución digital integral diseñada para médicos independientes, policlínicas y centros de salud en República Dominicana.'
  },
  {
    id: 'gestion-de-imagenes-medicas',
    name: 'Gestión de Imágenes Médicas (PACS Cloud)',
    category: 'Servicios Administrados',
    portalUrl: 'https://www.clarocloud.com.do/portal/cloud-do/cld/soluciones/servicios-administrados/gestion-de-imagenes-medicas/',
    shortDescription: 'Visualización, archivo seguro y diagnóstico radiológico DICOM en alta resolución en la nube.',
    price: 'Planes por volumen de estudios anuales',
    badge: 'PACS / RIS',
    details: {
      minUsers: 'Centros de Diagnóstico / Clínicas',
      setupFee: 'Integración con modalidades (Rayos X, Resonancia, Tomografía)',
      features: [
        'Visor DICOM web certificado de alta precisión accesible desde navegadores',
        'Almacenamiento a largo plazo y redundante de estudios radiológicos en Data Center Claro',
        'Portal para que pacientes y médicos remitentes consulten resultados y placas en línea',
        'Herramientas avanzadas de medición, reconstrucción 3D y tele-radiología remota',
        'Ahorro significativo en costos de impresión de películas radiográficas tradicionales'
      ]
    },
    longDescription: 'Modernice su centro de diagnóstico o clínica con un sistema PACS/RIS en la nube que agiliza la entrega de resultados y mejora la precisión diagnóstica de los especialistas.'
  },
  {
    id: 'comunicacion-unificada',
    name: 'Comunicación Unificada (Webex)',
    category: 'Servicios Administrados',
    portalUrl: 'https://www.clarocloud.com.do/portal/cloud-do/cld/soluciones/servicios-administrados/comunicacion-unificada/',
    shortDescription: 'Voz empresarial, videollamadas HD, mensajería de equipo y salas de reunión con Cisco Webex.',
    price: 'Desde $11.50 USD / usuario al mes',
    badge: 'Cisco Webex',
    details: {
      minUsers: '5 Licencias',
      setupFee: '$0.00 USD',
      features: [
        'Llamadas telefónicas empresariales directas con numeración dominicana desde la app Webex',
        'Reuniones de video en ultra alta definición con transcripción y traducción en tiempo real',
        'Espacios de mensajería persistente para proyectos y colaboración en equipo',
        'Integración fluida con Microsoft 365, Google Workspace y calendarios corporativos',
        'Compatibilidad con dispositivos de sala de videoconferencia Cisco'
      ]
    },
    longDescription: 'Unifique todas las comunicaciones de su empresa en una única plataforma de clase mundial, permitiendo que sus colaboradores colaboren sin límites desde cualquier lugar.'
  },
  {
    id: 'wi-fi-administrado',
    name: 'Wi-Fi Administrado',
    category: 'Servicios Administrados',
    portalUrl: 'https://www.clarocloud.com.do/portal/cloud-do/cld/soluciones/servicios-administrados/wi-fi-administrado/',
    shortDescription: 'Red inalámbrica corporativa de alta densidad con portal cautivo, analítica y seguridad gestionada.',
    price: 'Desde $35.00 USD / Access Point al mes',
    badge: 'Wi-Fi Gestionado',
    details: {
      minUsers: '1 Access Point Empresarial',
      setupFee: 'Instalación y cableado estructurado',
      features: [
        'Access Points Wi-Fi 6 de grado empresarial con cobertura uniforme y alta concurrencia',
        'Portal cautivo personalizable con logo para acceso de clientes mediante redes sociales',
        'Analítica de visitantes: tiempos de permanencia, frecuencia de visitas y mapas de calor',
        'Separación estricta de tráfico entre red corporativa interna y red de invitados',
        'Monitoreo, mantenimiento y reemplazo de hardware administrado por Claro'
      ]
    },
    longDescription: 'Ofrezca una experiencia Wi-Fi impecable y segura a sus clientes y colaboradores, convirtiendo su red inalámbrica en una herramienta de analítica y marketing para su negocio.'
  },

  // ==========================================
  // 6. SERVICIOS PROFESIONALES
  // ==========================================
  {
    id: 'servicios-profesionales-devops',
    name: 'Servicios Profesionales DevOps',
    category: 'Servicios Profesionales',
    portalUrl: 'https://www.clarocloud.com.do/portal/cloud-do/cld/soluciones/servicios-profesionales/servicios-profesionales-devops/',
    shortDescription: 'Consultoría e implementación de pipelines CI/CD, infraestructura como código y microservicios.',
    price: 'Por bolsa de horas / proyecto',
    badge: 'DevOps / CI-CD',
    details: {
      minUsers: 'Por proyecto',
      setupFee: 'Diagnóstico de arquitectura inicial',
      features: [
        'Automatización de despliegues continuos mediante pipelines CI/CD (GitLab, GitHub, Azure DevOps)',
        'Aprovisionamiento de infraestructura como código con Terraform y Ansible',
        'Orquestación de contenedores en Kubernetes (EKS, AKS, OpenShift)',
        'Monitoreo de observabilidad y rendimiento de aplicaciones (APM)',
        'Aceleración del ciclo de vida de desarrollo de software con prácticas DevSecOps'
      ]
    },
    longDescription: 'Acelere el tiempo de llegada al mercado de sus productos digitales adoptando metodologías DevOps guiadas por ingenieros expertos de Claro Cloud.'
  },
  {
    id: 'servicios-profesionales-iaas',
    name: 'Servicios Profesionales IaaS',
    category: 'Servicios Profesionales',
    portalUrl: 'https://www.clarocloud.com.do/portal/cloud-do/cld/soluciones/servicios-profesionales/servicios-profesionales-iaas/',
    shortDescription: 'Diseño de arquitectura, migración de servidores y optimización de entornos multi-cloud.',
    price: 'Por proyecto de migración / consultoría',
    badge: 'Arquitectura Cloud',
    details: {
      minUsers: 'Por proyecto',
      setupFee: 'Assessment de infraestructura',
      features: [
        'Evaluación de cargas de trabajo (workload assessment) y dimensionamiento óptimo',
        'Migración segura sin tiempo de inactividad de servidores físicos y virtuales hacia la nube',
        'Diseño de arquitecturas tolerantes a fallas, alta disponibilidad y recuperación ante desastres',
        'Optimización de costos y rendimiento continuo (Cloud Cost Optimization)',
        'Transferencia de conocimientos y capacitación técnica para el equipo de TI interno'
      ]
    },
    longDescription: 'Migre a la nube con total tranquilidad y bajo las mejores prácticas de la industria con el acompañamiento de nuestros arquitectos de soluciones certificados.'
  },
  {
    id: 'servicios-profesionales-power-platform',
    name: 'Servicios Profesionales Power Platform',
    category: 'Servicios Profesionales',
    portalUrl: 'https://www.clarocloud.com.do/portal/cloud-do/cld/soluciones/servicios-profesionales/servicios-profesionales-power-platform/',
    shortDescription: 'Desarrollo de aplicaciones empresariales Power Apps, flujos Power Automate y dashboards Power BI.',
    price: 'Por proyecto / horas de desarrollo',
    badge: 'Microsoft Power Platform',
    details: {
      minUsers: 'Por requerimiento',
      setupFee: 'Levantamiento de procesos',
      features: [
        'Desarrollo ágil de aplicaciones móviles y web empresariales a la medida con Power Apps',
        'Automatización de flujos de trabajo y aprobaciones complejas con Power Automate',
        'Construcción de tableros de control interactivos y analítica de datos con Power BI',
        'Integración con bases de datos SQL, SharePoint, ERPs y servicios externos mediante conectores',
        'Capacitación a usuarios clave y gobernanza de la plataforma en la organización'
      ]
    },
    longDescription: 'Digitalice y automatice los procesos manuales de su empresa de forma rápida y costo-eficiente aprovechando el ecosistema de Microsoft Power Platform con el equipo especialista de Claro.'
  }
];
