import fs from 'fs';

const parsedJsonPath = 'C:/Users/Spawx/.gemini/antigravity-ide/scratch/claro-comm-repo/scratch/all_parsed.json';
const repoPath = 'C:/Users/Spawx/.gemini/antigravity-ide/scratch/claro-comm-repo/src/components/CommunicationsRepo.jsx';

try {
  const parsedData = JSON.parse(fs.readFileSync(parsedJsonPath, 'utf8'));
  
  const getCategory = (subject) => {
    const text = subject.toLowerCase();
    if (text.includes('microsoft 365') || text.includes('cloud') || text.includes('servidor') || text.includes('vps')) {
      return 'Cloud';
    }
    if (text.includes('iot') || text.includes('smart connect') || text.includes('móvil') || text.includes('movil') || text.includes('futbol') || text.includes('claro video') || text.includes('renta para oferta')) {
      return 'Móvil';
    }
    if (text.includes('portabilidad') || text.includes('port out') || text.includes('telefon') || text.includes('hpbx') || text.includes('centralita')) {
      return 'Telefonía IP';
    }
    if (text.includes('videovigilancia') || text.includes('cámara') || text.includes('camara') || text.includes('seguridad')) {
      return 'Seguridad';
    }
    return 'Conectividad'; // default covers mesh, wifi, ont, fibra
  };

  const enrichToMarkdown = (bodyText, subject) => {
    if (!bodyText) return '';
    let text = bodyText
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/<mailto:[^>]+>/gi, '')
      .replace(/<http[^>]+>/gi, '')
      .trim();

    // 1. Bullet list conversion
    text = text.replace(/^\s*[*•-]\t*/gm, '* ');
    text = text.replace(/^\s*\t+[*•-]\t*/gm, '  * ');

    // 2. Banner conversion
    text = text.replace(/^¡*(IMPORTANTE|BUENAS NOTICIAS|NUEVO EQUIPO WI-FI MESH|NUEVAS LAPTOPS)!*$/gm, '> [!IMPORTANT]\n> **$1**');

    // 3. Section Headers
    const sections = [
      'Beneficios', 'Canales que aplican', 'Clientes que aplican', 'Clientes que aplica',
      'Condiciones', 'Planes y Precios', 'Ruta en Claro Ayuda', 'Pasos del Representante',
      'Restricciones', 'Importante', 'Especificaciones', 'Precios', 'Planes que aplica',
      'Distribución', 'Distribución inicial de los equipos', 'Condiciones Reglas de Navegación',
      'Plan de Compromiso Mensual con Renta Mensual', 'Plan de Renta Mensual con Compromiso Anual',
      'Condiciones Reglas de Navegación', 'Canales que aplican'
    ];
    sections.forEach(sec => {
      const regex = new RegExp(`^(${sec}):\\s*$`, 'gm');
      text = text.replace(regex, '### $1');
    });

    // 4. Case-based subheaders
    const lines = text.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line && line.length < 120 && line === line.toUpperCase() && /[A-Z]/.test(line) && !line.startsWith('#') && !line.startsWith('*') && !line.startsWith('>')) {
        if (!line.startsWith('FROM:') && !line.startsWith('SENT:') && !line.startsWith('SUBJECT:') && !line.startsWith('TO:')) {
          lines[i] = `### ${line}`;
        }
      }
    }
    text = lines.join('\n');

    // 5. Replace Specific Tables with Markdown
    const textLower = text.toLowerCase();

    // Table replacement: ONT Change Rule
    if (textLower.includes('ont inferior a hg8145v5')) {
      const ontTableRegex = /Regla\s*Condición del modelo ONT[\s\S]+?Enviar visita técnica para cambio de ONT/i;
      const ontMarkdownTable = `| Regla | Condición del modelo ONT que posee el cliente | Tipo de solicitud | Velocidad de Bajada | Acción automática del sistema |
| :--- | :--- | :--- | :---: | :--- |
| **Existente** | ONT inferior a HG8145v5 o HG8145x6 | Aumento de velocidad o avería Wi-Fi | ≥ 50 Mbps | Enviar visita técnica para cambio de ONT |
| **¡Nueva!** | ONT HG8145v5 | Aumento de velocidad o avería Wi-Fi | ≥ 300 Mbps | Enviar visita técnica para cambio de ONT |`;
      text = text.replace(ontTableRegex, ontMarkdownTable);
    }

    // Table replacement: Microsoft 365 Prices
    if (textLower.includes('microsoft 365 business basic') && textLower.includes('office 365 e3')) {
      const m365MonthlyRegex = /Plan de Compromiso Mensual con Renta Mensual:[\s\S]+?Plan de Renta Mensual con Compromiso Anual:/i;
      const m365MonthlyTable = `### Plan de Compromiso Mensual con Renta Mensual

| Planes | Precio Anterior US$ | Precio Nuevo US$ | Variación % |
| :--- | :---: | :---: | :---: |
| Microsoft 365 Business Basic (Con Teams) | $9.50 | $11.00 | 16% |
| Microsoft 365 Business Basic (no Teams) | $7.00 | $9.05 | 29% |
| Microsoft 365 Business Standard (Con Teams) | $20.20 | $22.60 | 12% |
| Microsoft 365 Business Standard (no Teams) | $19.70 | $22.00 | 12% |
| Office 365 E1 (Con Teams) | $13.99 | $13.99 | 0% |
| Office 365 E1 (no Teams) | $13.88 | $13.88 | 0% |
| Office 365 E3 (Con Teams) | $37.99 | $43.00 | 13% |
| Office 365 E3 (no Teams) | $31.84 | $36.40 | 14% |
| Microsoft 365 E3 (Con Teams) | $60.99 | $66.00 | 8% |
| Microsoft 365 E3 (no Teams) | $58.36 | $64.00 | 10% |
| Microsoft 365 E5 (Con Teams) | $98.99 | $104.00 | 5% |
| Microsoft 365 E5 (no Teams) | $78.99 | $84.00 | 6% |
| Microsoft 365 F1 (Con Teams) | $4.69 | $6.25 | 33% |
| Microsoft 365 F1 (no Teams) | $3.20 | $4.56 | 43% |
| Microsoft 365 F3 (Con Teams) | $14.90 | $18.60 | 25% |
| Microsoft 365 F3 (no Teams) | $13.80 | $17.80 | 29% |
| Microsoft 365 Apps | $29.49 | $35.50 | 20% |
| Microsoft 365 Apps for Business | $13.10 | $15.90 | 21% |
| Office 365 E5 (Con Teams) | $64.99 | $71.50 | 10% |
| Office 365 E5 (no Teams) | $52.63 | $57.00 | 8% |

### Plan de Renta Mensual con Compromiso Anual:`;
      text = text.replace(m365MonthlyRegex, m365MonthlyTable);

      const m365AnnualRegex = /Plan de Renta Mensual con Compromiso Anual:[\s\S]+?Ruta en Claro Ayuda:/i;
      const m365AnnualTable = `### Plan de Renta Mensual con Compromiso Anual

| Planes | Precio Anterior US$ | Precio Nuevo US$ | Variación % |
| :--- | :---: | :---: | :---: |
| Microsoft 365 Business Basic (Con Teams) | $7.89 | $9.15 | 16% |
| Microsoft 365 Business Basic (no Teams) | $7.79 | $8.60 | 10% |
| Microsoft 365 Business Standard (Con Teams) | $16.69 | $18.70 | 12% |
| Microsoft 365 Business Standard (no Teams) | $16.43 | $18.25 | 11% |
| Office 365 E3 (Con Teams) | $31.30 | $35.30 | 13% |
| Office 365 E3 (no Teams) | $26.59 | $30.40 | 14% |
| Microsoft 365 E3 (Con Teams) | $50.80 | $55.00 | 8% |
| Microsoft 365 E3 (no Teams) | $48.63 | $53.00 | 9% |
| Microsoft 365 E5 (Con Teams) | $82.10 | $86.00 | 5% |
| Microsoft 365 E5 (no Teams) | $66.44 | $70.50 | 6% |
| Microsoft 365 F1 (Con Teams) | $2.90 | $3.87 | 33% |
| Microsoft 365 F1 (no Teams) | $2.79 | $3.55 | 27% |
| Microsoft 365 F3 (Con Teams) | $12.20 | $15.20 | 25% |
| Microsoft 365 F3 (no Teams) | $11.20 | $14.50 | 29% |
| Microsoft 365 Apps | $24.59 | $29.50 | 20% |
| Microsoft 365 Apps for Business | $10.79 | $13.10 | 21% |
| Office 365 E5 (Con Teams) | $53.79 | $59.00 | 10% |
| Office 365 E5 (no Teams) | $43.85 | $47.50 | 8% |

### Ruta en Claro Ayuda:`;
      text = text.replace(m365AnnualRegex, m365AnnualTable);
    }

    // Table replacement: Videovigilancia
    if (textLower.includes('videovigilancia') && textLower.includes('licenv3')) {
      const videoTableRegex = /Tipo\s*Descripción\s*Código\s*Precio US\$[\s\S]+?Para más informacion acerca de Videovigilancia/i;
      const videoMarkdownTable = `| Tipo | Descripción | Código | Precio US$ Sin Impuestos | Precio US$ Con Impuestos |
| :--- | :--- | :---: | :---: | :---: |
| **Licencias** | Lic. Enterprise (1-24 camaras) | LICENV3 | $8.43 | $10.96 |
| | Lic. Enterprise (25-36 camaras) | LICENV1 | $7.73 | $10.05 |
| | Lic. Enterprise (Mayor a 37 camaras) | LICENV2 | $6.76 | $8.79 |
| | Lic. Reconocimiento de placas | LICRPL | $11.25 | $14.62 |
| | Lic. Analiticas de video | LICAV | $6.06 | $7.88 |
| | Lic. Drones | LICDR | $42.05 | $54.66 |
| **Cámaras (Renta)** | Rta Cam Domo VCA SD 2MP | RDVS2M | $8.08 | $9.54 |
| | Rta Camara AXIS Q3517-SLVE | RCAXSV | $173.25 | $204.44 |
| | Rta. Cam Domo POE 5MP | RDPO5 | $6.15 | $7.26 |
| | Rta. Cam HK 2MP Bullet | CH2MB | $2.55 | $3.01 |
| | Rta. Cam HK 2MP Domo | CH2MD | $2.55 | $3.01 |
| | Rta. Cam HK 4MP Bullet | CH4MB | $4.39 | $5.18 |
| | Rta. Cam HK 4MP Domo | CH4MD | $4.39 | $5.18 |
| | Rta. Cam MS Bullet 2MP | RCBU2MD | $2.90 | $3.42 |
| | Rta. Cam MS Bullet 5 Mp | RCMB5 | $6.41 | $7.57 |
| | Rta. Cam MS Bullet LPR 2 MP | CBLPRRD | $28.73 | $33.90 |
| | Rta. Cam MS Bullet VCA 2MP | DVCA2RD | $4.22 | $4.98 |
| | Rta. Cam MS Bullet VCA 5MP | VCA5RD | $9.05 | $10.68 |
| | Rta. Cam MS Domo 2MP | RCDO2MD | $2.90 | $3.42 |
| | Rta. Cam MS Domo VCA 2MP | VCA2RD | $7.38 | $8.71 |
| | Rta. Cam MS Domo VCA 5 MP | BVCA5RD | $9.58 | $11.30 |
| **Cámaras (Venta)** | Vta. Cam Bullet LPR Zoom 2MP | CBLPRZ | $765.32 | $903.08 |
| | Vta. Cam Domo VCA SD 2MP | VCDSD2 | $170.62 | $201.33 |
| | Vta. Cam HK 2MP Bullet | VH2MB | $81.36 | $96.00 |
| | Vta. Cam HK 2MP Domo | VH2MD | $81.36 | $96.00 |
| | Vta. Cam HK 4MP Bullet | VH4MB | $141.01 | $166.39 |
| | Vta. Cam HK 4MP Domo | VH4MD | $141.01 | $166.39 |
| | Vta. Cam MS Bullet 2 MP | VCMB2 | $70.90 | $83.66 |
| | Vta. Cam MS Bullet 5 Mp | VCMB5 | $158.14 | $186.61 |
| | Vta. Cam MS Domo 2 Mp | VCMD2 | $71.95 | $84.91 |
| | Vta. Cam MS Domo 5 Mp | VCMD5 | $163.33 | $192.72 |
| | Vta. Camara AXIS Q3517-SLVE | VCAXSV | $3,872.73 | $4,569.82 |
| | Vta. Camara Bullet VCA 2MP | VCBV2M | $93.74 | $110.62 |
| | Vta. Camara Bullet VCA 5MP | VCBV5M | $188.98 | $223.00 |
| | Vta. Camara Domo VCA 2MP | VCDV2M | $155.95 | $184.02 |
| | Vta. Camara Domo VCA 5 MP | VCDV5M | $192.58 | $227.25 |
| | Vta. Can MS B LPR 2 MP | VCMLD2 | $577.83 | $681.85 |
| | Vta. Domo POE 5MP | VDPO5 | $153.05 | $180.60 |
| **Almacenamiento** | Almac. 500 GB - Videovig | ALV500D | $8.61 | $10.16 |
| | Almac. 1TB - Videovigilancia | ALV1TBD | $17.13 | $20.22 |
| | Almac. 2TB - Videovigilancia | ALV2TBD | $32.68 | $38.57 |
| | Almac. 3TB - Videovigilancia | ALV3TBD | $51.57 | $60.85 |
| | Almac. 5TB - Videovigilancia | ALV5TBD | $87.33 | $103.05 |
| | Almac. 6TB - Videovigilancia | ALV6TBD | $97.70 | $115.28 |
| | Almac. 8TB - Videovigilancia | ALV8TBD | $130.29 | $153.74 |
| | Almac. 9TB - Videovigilancia | ALV9TBD | $138.90 | $163.90 |
| | Almac. 10TB - Videovigilancia | ALV10TD | $215.69 | $254.51 |
| | Almac. 15TB - Videovigilancia | ALV15TD | $338.69 | $399.65 |
| | Almac. 20TB - Videovigilancia | ALV20TD | $442.80 | $522.50 |
| | Almac. 25TB - Videovigilancia | ALV25TD | $539.44 | $636.54 |
| | Almac. 30TB - Videovigilancia | ALV30TD | $632.57 | $746.43 |
| | Almac. 35TB - Videovigilancia | ALV35TD | $718.67 | $848.03 |
| | Almac. 40TB - Videovigilancia | ALV40TD | $773.14 | $912.31 |
| | Almac. 45TB - Videovigilancia | ALV45TD | $832.88 | $982.80 |
| | Almac. 50TB - Videovigilancia | ALV50TD | $873.30 | $1,030.49 |
| | Almac. 75TB - Videovigilancia | ALV75TD | $1,156.20 | $1,364.31 |
| | Almac. 100TB - Videovigilancia | ALV100D | $1,414.50 | $1,669.11 |
| **Memorias SD** | Rta. Memoria Micro SD 32GB | RMM32 | $0.44 | $0.52 |
| | Rta. Memoria Micro SD64GB | RMM64 | $0.61 | $0.73 |
| | Rta. Memoria Micro SD 128GB | RMM128 | $1.67 | $1.97 |
| | Rta. Memoria Micro SD 256GB | RMM256 | $3.60 | $4.25 |
| | Vta. Memoria Micro SD 32GB | VMM32 | $7.03 | $8.29 |
| | Vta. Memoria Micro SD64GB | VMM64 | $10.19 | $12.03 |
| | Vta. Memoria Micro SD 128GB | VMM128 | $26.71 | $31.52 |
| | Vta. Memoria Micro SD 256GB | VMM256 | $56.67 | $66.87 |
| **Discos Duros** | Rta. Disco Duro Seagate 1TB | RDDS1TD | $5.62 | $6.63 |
| | Rta. Disco Duro Seagate 2TB | RDDS2TD | $5.36 | $6.32 |
| | Rta. Disco Duro Seagate 4TB | RDDS4TD | $13.53 | $15.97 |
| | Rta. Disco Duro Seagate 6TB | RDDS6TD | $14.41 | $17.00 |
| | Rta. Disco Duro Seagate 8TB | RDDS8TD | $22.58 | $26.64 |
| | Vta. Disco Duro Seagate 1TB | VDDS1T | $180.11 | $212.53 |
| | Vta. Disco Duro Seagate 2TB | VDDS2T | $171.58 | $202.47 |
| | Vta. Disco Duro Seagate 4TB | VDDS4T | $431.20 | $508.82 |
| | Vta. Disco Duro Seagate 6TB | VDDS6T | $459.32 | $541.99 |
| | Vta. Disco Duro Seagate 8TB | VDDS8T | $720.43 | $850.10 |
| **NVR** | Rta. NVR HV 128 CH/ No PoE | RNV128D | $486.02 | $573.51 |
| | Rta. NVR HV 16 CH / 16 P PoE | RNVR16D | $19.42 | $22.91 |
| | Rta. NVR HV 32 CH/ 16 P PoE | RNVR32D | $63.17 | $74.54 |
| | Rta. NVR HV 32 CH/ No PoE | RNV32ND | $42.43 | $50.07 |
| | Rta. NVR HV 64 CH/ No PoE | RNVR64D | $253.03 | $298.57 |
| | Rta. NVR HV 8 CH / 8 P PoE | RNVR8CD | $16.25 | $19.18 |
| | Vta. NVR HV 128 CH/ No PoE | VNV128 | $15,537.76 | $18,334.56 |
| | Vta. NVR HV 16 CH 16 P PoE | VNVR16 | $619.48 | $730.99 |
| | Vta. NVR HV 32 CH/ 16 P PoE | VNVR32 | $2,020.18 | $2,383.81 |
| | Vta. NVR HV 32 CH/ No PoE | VNV32N | $1,355.46 | $1,599.44 |
| | Vta. NVR HV 64 CH/ No PoE | VNVR64 | $8,087.58 | $9,543.35 |
| | Vta. NVR HV 8 CH / 8 P PoE | VNVR8C | $519.15 | $612.59 |
| **Switches** | Rta. Switch MS 4P | RSMS4PD | $1.93 | $2.28 |
| | Rta. Switch MS 8P | RSMS8PD | $3.34 | $3.94 |
| | Rta. Switch MS 16P | RSMS16D | $11.25 | $13.27 |
| | Rta. Switch MS 24P | RSMS24D | $14.23 | $16.79 |
| | Rta. Switch Signamax C-100 | SMCXS | $9.58 | $11.30 |
| | Vta. Switch MS 4P | VSMS4 | $48.32 | $57.02 |
| | Vta. Switch MS 8P | VSMS8 | $80.13 | $94.55 |
| | Vta. Switch MS 16P | VSMS16 | $277.36 | $327.29 |
| | Vta. Switch MS 24P | VSMS24 | $353.36 | $416.97 |
| **Instalación** | Inst. de 1 a 24 cámaras (Conectividad GPON) | INVV1 | $175.71 | $207.34 |
| | Inst. de 25 a 36 cámaras (Conectividad Broadband) | INVV2 | $1,308.45 | $1,543.97 |
| | Inst. mayor a 36 cámaras (Conectividad Broadband) | INVV3 | $864.51 | $1,020.12 |
| | Inst. de 1 a 10 cámaras (con materiales) | INVCM1 | $26.80 | $31.62 |
| | Inst. de 11 a 100 cámaras (con materiales) | INVCM2 | $25.04 | $29.55 |
| | Inst. de mayor a 100 cámaras (con materiales) | INVCM3 | $23.28 | $27.47 |
| | Inst. de 1 a 10 cámaras (sin materiales) | INVSM1 | $14.06 | $16.59 |
| | Inst. de 11 a 100 cámaras (sin materiales) | INVSM2 | $12.30 | $14.51 |
| | Inst. de mayor a 100 cámaras (sin materiales) | INVSM3 | $10.54 | $12.44 |

Para más informacion acerca de Videovigilancia`;
      text = text.replace(videoTableRegex, videoMarkdownTable);
    }

    // Table replacement: IoT Smart Connect Packages
    if (textLower.includes('iot smart connect regular') || textLower.includes('iotm2m1')) {
      const iotTableRegex = /Planes IoT Smart Connect[\s\S]+?Paquetes adicionales de Internet IoT Smart Connect/i;
      const iotMarkdownTable = `### Planes IoT Smart Connect

| Cartera | Price Plan | Descripción de Plan | Volumen Incluido | SMS | Renta sin imp | Renta con imp |
| :--- | :---: | :--- | :---: | :---: | :---: | :---: |
| IoT Smart Connect | IOTM2M1 | IoT Smart Connect 2MB | 2 MB | 500 | $35.00 | $45.50 |
| IoT Smart Connect | IOTM2M2 | IoT Smart Connect 5MB | 5 MB | 500 | $75.00 | $97.50 |
| IoT Smart Connect | IOTM2M3 | IoT Smart Connect 10MB | 10 MB | 500 | $125.00 | $162.50 |
| IoT Smart Connect | IOTM2M4 | IoT Smart Connect 25MB | 25 MB | 500 | $140.00 | $182.00 |
| IoT Smart Connect | IOTM2M5 | IoT Smart Connect 50MB | 50 MB | 500 | $150.00 | $195.00 |
| IoT Smart Connect | IOTM2M6 | IoT Smart Connect 100MB | 100 MB | 500 | $165.00 | $214.50 |
| IoT Smart Connect | IOTM2M7 | IoT Smart Connect 250MB | 250 MB | 500 | $195.00 | $253.50 |
| IoT Smart Connect | IOTM2M8 | IoT Smart Connect 500MB | 500 MB | 500 | $225.00 | $292.50 |
| IoT Smart Connect | IOTM2M9 | IoT Smart Connect 1GB (Bono 3GB) | 4 GB | 500 | $295.00 | $383.50 |
| IoT Smart Connect | IOTM2M10 | IoT Smart Connect 3GB (Bono 9GB) | 12 GB | 500 | $525.00 | $682.50 |
| IoT Smart Connect | IOTM2M11 | IoT Smart Connect 5GB (Bono 15GB) | 20 GB | 500 | $610.00 | $793.00 |
| IoT Smart Connect | IOTM2M12 | IoT Smart Connect 10GB (Bono 30GB) | 40 GB | 500 | $765.00 | $994.50 |
| IoT Smart Connect | IOTM2M13 | IoT Smart Connect 20GB (Bono 40GB) | 60 GB | 500 | $1,075.00 | $1,397.50 |
| IoT Smart Connect | IOTM2M14 | IoT Smart Connect 30GB (Bono 60GB) | 90 GB | 500 | $1,210.00 | $1,573.00 |

### Paquetes adicionales de Internet IoT Smart Connect`;
      text = text.replace(iotTableRegex, iotMarkdownTable);
    }

    // Table replacement: Huawei WiFi Mesh
    if (textLower.includes('huawei optixstar k562e-10') && textLower.includes('easymesh')) {
      const meshSpecsRegex = /Especificaciones[\s\S]+?Huawei Optixstar K562e-10\s*K562e/i;
      const meshSpecsTable = `### Especificaciones

| Componente | Huawei Optixstar K562e-10 |
| :--- | :--- |
| **CPU** | CPU integrada optimizada para Wi‑Fi 6 |
| **Memoria** | 256 MB RAM |
| **Memoria Flash** | 128 MB |
| **Frecuencia Wi‑Fi** | Doble banda: 2.4 GHz y 5 GHz (Wi‑Fi 6) |
| **Velocidad 2.4 GHz** | Hasta 574 Mbps |
| **Velocidad 5 GHz** | Hasta 2402 Mbps |
| **Color** | Blanco |
| **Interfaz** | 4 puertos Gigabit Ethernet + Wi‑Fi Mesh |

### Huawei Optixstar K562e-10`;
      text = text.replace(meshSpecsRegex, meshSpecsTable);

      const meshCoverageRegex = /Huawei Optixstar K562e-10\s*K562e[\s\S]+?Beneficios:/i;
      const meshCoverageTable = `| Cobertura y Capacidad | K562e‑10 Individual | K562e‑10 Dúo | K562e‑10 Trío |
| :--- | :--- | :--- | :--- |
| **Hogar estimado** | Apartamento o casa pequeña | Casa mediana | Casa grande |
| **Cobertura aproximada** | Hasta 140 m² | Hasta 280 m² | Hasta 420 m² |
| **Niveles recomendados** | 1 nivel | 1–2 niveles | 2 niveles o más |

### Beneficios:`;
      text = text.replace(meshCoverageRegex, meshCoverageTable);
    }

    // Table replacement: Laptops
    if (textLower.includes('asus vivobook go') && textLower.includes('7014328')) {
      const laptop1Regex = /Item ID\s*Características\s*Equipo\s*7014328[\s\S]+?Item ID/i;
      const laptop1Table = `| Modelo | Laptop ASUS Vivobook Go 15.6 |
| :--- | :--- |
| **ID de Material** | 7014328 |
| **Procesador** | Intel Core i3-N305 |
| **Pantalla** | 15.6" |
| **Memoria RAM** | 8GB |
| **Almacenamiento** | 256 GB SSD |
| **Bluetooth** | 5.3 |
| **HDMI** | 1.4b |
| **Sistema Operativo** | Windows 11 |

### Item ID`;
      text = text.replace(laptop1Regex, laptop1Table);

      const laptop2Regex = /Item ID\s*Características\s*Equipo\s*7014329[\s\S]+?Canales que aplican:/i;
      const laptop2Table = `| Modelo | Laptop ASUS Vivobook Go E1504FA R5 |
| :--- | :--- |
| **ID de Material** | 7014329 |
| **Procesador** | AMD Ryzen 5 7520U |
| **Pantalla** | 15.6" |
| **Memoria RAM** | 8GB |
| **Almacenamiento** | 512 GB SSD |
| **Bluetooth** | 5.3 |
| **HDMI** | 1.4b |
| **Sistema Operativo** | Windows 11 |

### Canales que aplican:`;
      text = text.replace(laptop2Regex, laptop2Table);
    }

    // Replace long lines of underscores and dashes
    text = text.replace(/_{10,}/g, '\n-----------------------------------\n');
    text = text.replace(/-{10,}/g, '\n-----------------------------------\n');
    return text;
  };

  const processed = parsedData.map((item, index) => {
    const category = getCategory(item.subject);
    
    let title = item.subject.replace(/^ANUNCIO\s+NO\.\s*\d+[-A-Z]*:\s*/i, '');
    title = title.replace(/^¡*(IMPORTANTE|BUENAS NOTICIAS|NUEVO EQUIPO WI-FI MESH|NUEVAS LAPTOPS)!*\s*/i, '');
    title = title.trim();
    title = title.charAt(0).toUpperCase() + title.slice(1);

    let isUpdate = false;
    let updatesId = null;
    let version = '1.0';

    if (item.subject.includes('8443-A')) {
      isUpdate = true;
      updatesId = 'comm-parsed-iot-base';
      version = '2.0';
    }
    
    const id = item.subject.includes('8443-A') ? 'comm-parsed-iot-update' : `comm-parsed-${index + 1}`;

    return {
      id,
      title,
      date: item.date,
      category,
      author: item.senderName,
      body: enrichToMarkdown(item.body, item.subject),
      version,
      updatesId,
      isUpdate
    };
  });

  // Base IoT message
  const baseIoT = {
    id: 'comm-parsed-iot-base',
    title: 'Nuevos Planes de Datos IoT Smart Connect para Dispositivos IoT',
    date: '2026-01-29',
    category: 'Móvil',
    author: 'Info-Canales (ClaroDom)',
    body: 'Disponibilidad de nuevos planes de datos para dispositivos IoT (anteriormente Conectividad M2M o LVS) diseñados para GPS, Medidores, Cámaras inalámbricas, etc. SMS incluidos y topes de navegación libre.',
    version: '1.0',
    updatesId: null,
    isUpdate: false
  };
  processed.push(baseIoT);

  // Add the sample cloud ones as well so the timeline demo works
  processed.push({
    id: 'comm-1',
    title: 'Mantenimiento Programado Servidores Cloud Santo Domingo',
    date: '2026-06-10',
    category: 'Cloud',
    author: 'Claro Cloud Support',
    body: 'Estimado cliente, le informamos que realizaremos un mantenimiento preventivo en nuestro Data Center de Santo Domingo para optimizar las capacidades de almacenamiento SSD de los nodos de Claro Cloud Server. Este mantenimiento durará 2 horas. No se estiman interrupciones completas, pero sí variaciones menores en la latencia.',
    version: '1.0',
    updatesId: null,
    isUpdate: false
  });
  processed.push({
    id: 'comm-3',
    title: 'Mantenimiento Programado Servidores Cloud Santo Domingo - EJECUCIÓN',
    date: '2026-06-15',
    category: 'Cloud',
    author: 'Claro Cloud Support',
    body: 'Seguimiento al comunicado del 10 de junio. Confirmamos que las labores de mantenimiento en las cabinas SSD se ejecutarán esta noche a partir de las 23:59. El tiempo estimado de la ventana de cambios es de 4 horas.',
    version: '2.0',
    updatesId: 'comm-1',
    isUpdate: true
  });
  processed.push({
    id: 'comm-5',
    title: 'Mantenimiento Programado Servidores Cloud Santo Domingo - FINALIZADO',
    date: '2026-06-16',
    category: 'Cloud',
    author: 'Claro Cloud Support',
    body: 'Confirmamos que las labores de optimización de almacenamiento SSD en el Data Center de Santo Domingo culminaron con total éxito a las 03:15 AM de hoy. Todos los servicios de Claro Cloud Server se encuentran estables y operando con mejoras en lecturas de disco de hasta 15%.',
    version: '3.0',
    updatesId: 'comm-3',
    isUpdate: true
  });

  // Read current repo file
  // Let's first restore the base file content in memory to avoid writing to a corrupted file
  const baseRepoFile = `import React, { useState } from 'react';
import { Search, Calendar, ChevronRight, Clock, RefreshCw, FileText, ArrowRight, CornerDownRight, Tag } from 'lucide-react';

export const initialCommunications = [];

export default function CommunicationsRepo({ communications, profileInterests }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [activeCommId, setActiveCommId] = useState(null);

  // Categories list
  const categories = ['Todos', 'Cloud', 'Móvil', 'Telefonía IP', 'Conectividad', 'Seguridad'];

  // Filter communications
  const filteredComms = communications.filter(comm => {
    // Filter by category selected in UI
    const matchesCategory = selectedCategory === 'Todos' || comm.category === selectedCategory;
    
    // Filter by user profile interests (if any profile interests are checked, show only matching categories)
    const matchesProfile = profileInterests.length === 0 || profileInterests.includes(comm.category);

    // Filter by text search
    const matchesSearch = comm.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          comm.body.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          comm.category.toLowerCase().includes(searchTerm.toLowerCase());
                          
    return matchesCategory && matchesProfile && matchesSearch;
  });

  // Sort by date desc
  const sortedComms = [...filteredComms].sort((a, b) => new Date(b.date) - new Date(a.date));

  // Get update timeline for a communication
  const getUpdateTimeline = (comm) => {
    let timeline = [comm];
    
    // Find parent communications (what does this update?)
    let current = comm;
    while (current && current.updatesId) {
      const parent = communications.find(c => c.id === current.updatesId);
      if (parent) {
        timeline.unshift(parent); // add to start of list (older first)
        current = parent;
      } else {
        break;
      }
    }

    // Find children communications (what updates this?)
    current = comm;
    let nextChild = communications.find(c => c.updatesId === current.id);
    while (nextChild) {
      timeline.push(nextChild); // add to end of list (newer last)
      current = nextChild;
      nextChild = communications.find(c => c.updatesId === current.id);
    }

    // Remove duplicates if any
    return Array.from(new Set(timeline));
  };

  const getCategoryColor = (cat) => {
    switch(cat) {
      case 'Cloud': return '#2563EB';
      case 'Móvil': return '#10B981';
      case 'Telefonía IP': return '#D97706';
      case 'Conectividad': return '#8B5CF6';
      case 'Seguridad': return '#EF4444';
      default: return 'var(--text-secondary)';
    }
  };

  const activeComm = communications.find(c => c.id === activeCommId);
  const activeTimeline = activeComm ? getUpdateTimeline(activeComm) : [];

  return (
    <div className="animate-fade-in comms-repo-grid">
      
      {/* Left panel: List of communications */}
      <div>
        <div style={{ marginBottom: '16px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '8px', fontFamily: 'var(--font-display)' }}>
            Repositorio de Comunicaciones
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Listado completo de boletines, comunicados y mantenimientos.
          </p>
        </div>

        {/* Filter bar and search */}
        <div className="glass-panel" style={{ padding: '16px', marginBottom: '16px' }}>
          <div style={{ position: 'relative', marginBottom: '12px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Buscar comunicados..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '40px', fontSize: '0.875rem' }}
            />
            <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          </div>

          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{ 
                  padding: '6px 12px', 
                  fontSize: '0.75rem', 
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: selectedCategory === cat ? 'var(--claro-red)' : 'var(--bg-secondary)',
                  color: selectedCategory === cat ? '#FFFFFF' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all var(--transition-fast)'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Communications List container */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '550px', overflowY: 'auto', paddingRight: '4px' }}>
          {sortedComms.length > 0 ? (
            sortedComms.map(comm => (
              <div 
                key={comm.id}
                onClick={() => setActiveCommId(comm.id)}
                className="glass-panel"
                style={{ 
                  padding: '16px', 
                  cursor: 'pointer',
                  borderLeft: \`4px solid \${getCategoryColor(comm.category)}\`,
                  borderColor: activeCommId === comm.id ? 'var(--claro-red)' : undefined,
                  backgroundColor: activeCommId === comm.id ? 'rgba(238, 28, 36, 0.03)' : undefined,
                  transform: activeCommId === comm.id ? 'translateX(4px)' : undefined,
                  transition: 'all var(--transition-fast)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <span style={{ 
                    fontSize: '0.7rem', 
                    fontWeight: '700', 
                    textTransform: 'uppercase', 
                    color: getCategoryColor(comm.category)
                  }}>
                    {comm.category}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                    <Calendar size={12} />
                    <span>{comm.date}</span>
                  </div>
                </div>

                <h4 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '6px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {comm.title}
                  {comm.isUpdate && (
                    <span style={{ 
                      backgroundColor: 'var(--claro-red-light)', 
                      color: 'var(--claro-red)', 
                      fontSize: '0.65rem', 
                      padding: '2px 6px', 
                      borderRadius: 'var(--radius-full)',
                      fontWeight: '700',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '2px'
                    }}>
                      <RefreshCw size={8} /> Act
                    </span>
                  )}
                </h4>

                <p style={{ 
                  color: 'var(--text-secondary)', 
                  fontSize: '0.825rem', 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis', 
                  display: '-webkit-box', 
                  WebkitLineClamp: 2, 
                  WebkitBoxOrient: 'vertical',
                  lineHeight: '1.4'
                }}>
                  {comm.body}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span>Versión: v{comm.version}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '2px', color: 'var(--claro-red)', fontWeight: '600' }}>
                    Leer más <ChevronRight size={12} />
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="glass-panel" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: '0.9rem' }}>No hay comunicados en base a tus filtros.</p>
              {profileInterests.length > 0 && (
                <p style={{ fontSize: '0.8rem', marginTop: '6px' }}>Tienes filtros de interés aplicados en tu perfil.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right panel: Details & update timeline */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {activeComm ? (
          <div className="glass-panel animate-slide-right" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', height: '100%', minHeight: '450px' }}>
            
            {/* Header detail */}
            <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ 
                  fontSize: '0.75rem', 
                  fontWeight: '700', 
                  textTransform: 'uppercase', 
                  color: '#FFFFFF',
                  backgroundColor: getCategoryColor(activeComm.category),
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-sm)'
                }}>
                  {activeComm.category}
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={14} /> Emitido el {activeComm.date}
                </span>
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>
                {activeComm.title}
              </h3>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', gap: '16px' }}>
                <span>Emitido por: <strong>{activeComm.author}</strong></span>
                <span>Versión actual: <strong>v{activeComm.version}</strong></span>
              </div>
            </div>

            {/* Document body */}
            <div style={{ flex: 1, color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>
              {activeComm.body}
            </div>

            {/* Document Updates Timeline */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px', marginTop: '20px' }}>
              <h4 style={{ fontSize: '0.875rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={14} /> Línea de Tiempo / Historial de Actualizaciones
              </h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative', paddingLeft: '20px' }}>
                {/* Timeline vertical bar */}
                <div style={{ 
                  position: 'absolute', 
                  left: '6px', 
                  top: '8px', 
                  bottom: '8px', 
                  width: '2px', 
                  backgroundColor: 'var(--border-color)' 
                }}/>

                {activeTimeline.map((tComm, index) => {
                  const isActive = tComm.id === activeComm.id;
                  return (
                    <div 
                      key={tComm.id} 
                      onClick={() => setActiveCommId(tComm.id)}
                      style={{ 
                        position: 'relative', 
                        cursor: 'pointer',
                        padding: '10px 14px',
                        backgroundColor: isActive ? 'var(--claro-red-light)' : 'var(--bg-primary)',
                        border: \`1px solid \${isActive ? 'var(--claro-red)' : 'var(--border-color)'}\`,
                        borderRadius: 'var(--radius-md)',
                        transition: 'all var(--transition-fast)'
                      }}
                    >
                      {/* Node point */}
                      <div style={{ 
                        position: 'absolute', 
                        left: '-18px', 
                        top: '16px', 
                        width: '10px', 
                        height: '10px', 
                        borderRadius: '99px', 
                        backgroundColor: isActive ? 'var(--claro-red)' : 'var(--text-muted)',
                        border: '2px solid var(--bg-secondary)',
                        boxShadow: isActive ? '0 0 8px var(--claro-red)' : undefined
                      }}/>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: '700', color: isActive ? 'var(--claro-red)' : 'var(--text-primary)' }}>
                          v{tComm.version} {index === 0 && '(Inicial)'} {index === activeTimeline.length - 1 && index !== 0 && '(Última)'}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{tComm.date}</span>
                      </div>
                      <p style={{ 
                        fontSize: '0.8rem', 
                        color: 'var(--text-secondary)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        fontWeight: isActive ? '600' : 'normal'
                      }}>
                        {tComm.title}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="glass-panel" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, minHeight: '450px' }}>
            <FileText size={48} strokeWidth={1.5} style={{ marginBottom: '16px', color: 'var(--text-muted)' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '6px' }}>Ningún comunicado seleccionado</h3>
            <p style={{ fontSize: '0.875rem', maxWidth: '300px' }}>Selecciona un comunicado del panel izquierdo para ver sus detalles y línea de actualizaciones.</p>
          </div>
        )}
      </div>

    </div>
  );
}
`;
  
  // Split the clean base template
  const parts = baseRepoFile.split('export const initialCommunications = [];');
  const newContent = parts[0] + 
                     'export const initialCommunications = ' + 
                     JSON.stringify(processed, null, 2) + 
                     ';' + 
                     parts[1];

  fs.writeFileSync(repoPath, newContent);
  console.log(`Successfully restored and safely merged ${processed.length} communications.`);

} catch (e) {
  console.error("Safe restore and merge failed:", e);
}
