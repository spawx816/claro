# 📋 Modelo Estandarizado de Cotización Claro Dominicana - Hosted PBX (HPBX)

Este documento define la estructura y reglas de negocio para modelar cotizaciones de Hosted PBX (HPBX) en Claro Dominicana, tanto para el segmento **PYMES** como para el segmento **CORPORATIVO**.

---

## 📌 Reglas de Estructura y Cálculo

1. **Campos Condicionales / Ocultamiento**:
   - Solo se muestran los ítems con **cantidad > 0**.
   - Filas no aplicables o con valor 0 quedan ocultas para garantizar limpieza y claridad.
   - Si no hay venta de equipos, la sección de Venta de Equipos se oculta.

2. **Régimen de Impuestos de República Dominicana**:
   - **Servicios de Telecomunicaciones (Voz/Cloud PBX)**: Gravados al **30%** (ITBIS 18% + ISC 10% + CDT 2%).
   - **Renta de Equipos (Routers, Switches, Teléfonos)**: Gravados al **18% ITBIS**.
   - **Venta de Equipos**: Gravados al **18% ITBIS**.
   - **Instalación y Configuración**: Gravados al **18% ITBIS**.

3. **Resumen Financiero**:
   - Total Renta Mensual Neta (Servicios + Equipos Renta).
   - Total Renta Mensual con Impuestos (Servicios + 30% e Equipos + 18%).
   - Total Instalación Neta y con Impuestos (18%).
   - **Grand Total (Primer Desembolso)** = Renta Mensual con Impuestos + Instalación con Impuestos + Venta de Equipos con Impuestos.

---

## 🏢 Catálogos de Referencia

### 1. Modelo PYMES (Base: 3 Estaciones / 1,500 Minutos LDN)

#### Servicios Renta (30% Impuestos)
| No. Parte | Descripción | Precio Unitario RD$ |
| :--- | :--- | :---: |
| `HPBXPYME` | Renta HPBX Plan Premium (3 estaciones base, 1500 min LDN, MPLS) | $2,775.00 |
| `HPRECP` | Funciones Recepcionista | $475.00 |
| `DIDIP1P` | DID HPBX Pymes | $52.00 |
| `HPMUA1` | Renta 1 Usuario Adicional (Plan Premium Pymes) | $305.00 |
| `PMH500` | Renta Paquete 500 Minutos | $485.00 |
| `PMH1000` | Renta Paquete 1000 Minutos | $965.00 |
| `PMH2000` | Renta Paquete 2000 Minutos | $1,930.00 |
| `PMH4000` | Renta Paquete 4000 Minutos | $3,865.00 |
| `PMH5000` | Renta Paquete 5000 Minutos | $4,830.00 |
| `PMHM100` | Paquete 100 Minutos Celulares Claro | $375.00 |

#### Equipos Renta (18% ITBIS)
| No. Parte | Descripción | Precio Unitario RD$ |
| :--- | :--- | :---: |
| `HPMRAU25` | Renta Router Audiocodes 25 Usuarios | $2,600.00 |
| `HPMSWC8` | Renta Switch de 8 Puertos PoE | $515.00 |
| `HPMSWC24` | Renta Switch de 24 Puertos PoE | $1,535.00 |
| `HPMWBSP` | Usuario Licencia Webex (Softphone) | $255.00 |
| `HGXP1625` | Renta Teléfono GXP 1625 (2 Líneas) | $137.00 |
| `HGXP2130` | Renta Teléfono GXP 2130 (3 Líneas) | $237.00 |
| `HGXP2160` | Renta Teléfono GXP 2160 (6 Líneas + Botonera) | $321.00 |
| `HPMGB` | Grabación de Llamadas | $1,015.00 |
| `HPMTR1` | Tarificador Hosteado | $195.00 |

#### Instalación (18% ITBIS)
| No. Parte | Descripción | Precio Unitario RD$ |
| :--- | :--- | :---: |
| `INSHPM` | Instalación Base Hosted PBX Pymes (3 estaciones) | $1,575.00 |
| `INHUS` | Instalación Base de 1 usuario en Hosted PBX Pymes | $525.00 |
| `SPHOBX` | Sistema de Tierra HBPX | $4,300.00 |
| `RECSIS` | Reconstrucción Sistema de Tierra | $9,555.00 |
| `INSHST` | Sistema de Tierra HBPX (Completo) | $19,295.00 |
| `1HPSR` - `7HPSR` | Salidas de Red (1 a 7 salidas) | $1,436.44 - $7,834.75 |
| `TRLHPM` | Traslado Local - Exterior | $1,575.00 |
| `COHPM` | Configuración Miscelánea Hosted PBX | $1,575.00 |
| `COHSP` | Configuración SoftPhone (Visita) | $1,455.00 |
| `CNHPT` | Configuración Tarificador Hosteado | $195.00 |
| `CNHPBX` | Cambio de Número | $174.00 |
| `HPMVT` | Visita Técnica | $840.00 |

---

### 2. Modelo CORPORATIVO (Base: 8 Usuarios / 5,000 Minutos LDN)

#### Servicios Renta (30% Impuestos)
| No. Parte | Descripción | Precio Unitario RD$ |
| :--- | :--- | :---: |
| `IPHOSTPRM` | Renta HPBX Plan Premium (8 usuarios base, 5000 min LDN, MPLS) | $7,385.00 |
| `IPHOSTSTD` | Renta HPBX Plan Estándar (8 usuarios base, 5000 min LDN, MPLS) | $5,995.00 |
| `IPHPBXAA` | Auto Attendant (mensaje de bienvenida 1 árbol) | $410.00 |
| `IPHPBXUM` | Renta Mensajería Unificada (Buzón de voz a email) | $95.00 |
| `HPBXDID` | DID HPBX | $0.00 |
| `HPBPAD1` | Renta 1 Usuario Adicional (Plan Premium) | $305.00 |
| `HPBSAD1` | Renta 1 Usuario Adicional (Plan Standar) | $242.00 |
| `HPBPAD25` | Renta 10 Usuarios Adicionales (Plan Premium) | $2,895.00 |
| `HPBPAD60` | Renta 25 Usuarios Adicionales (Plan Premium) | $6,855.00 |
| `HPBPAD100` | Renta 100 Usuarios Adicionales (Plan Premium) | $25,885.00 |
| `HPBX30N` | Renta Paquete 30,000 Minutos LDN | $9,995.00 |

#### Equipos Renta (18% ITBIS)
| No. Parte | Descripción | Precio Unitario RD$ |
| :--- | :--- | :---: |
| `HPRTAC25` | Renta Router Audiocodes 25 Usuarios | $2,600.00 |
| `HPRTAC50` | Renta Router Audiocodes 50 Usuarios | $2,835.00 |
| `HPRTAC100` | Renta Router Audiocodes 100 Usuarios | $3,075.00 |
| `HPRTAC250` | Renta Router Audiocodes 250 Usuarios | $4,020.00 |
| `HPRTAC500` | Renta Router Audiocodes 500 Usuarios | $4,725.00 |
| `HPCPESW1` | Renta Switch de 8 Puertos PoE | $515.00 |
| `HPCPESW2` | Renta Switch de 24 Puertos PoE | $1,535.00 |
| `SOX0101` | Usuario Licencia Softphone (Webex) | $255.00 |
| `GSX162501` | Renta Teléfono GXP 1625 (2 Líneas) | $137.00 |
| `GSX213001` | Renta Teléfono GXP 2130 (3 Líneas) | $237.00 |
| `GSX216001` | Renta Teléfono GXP 2160 (6 Líneas + Botonera) | $322.00 |

#### Instalación (18% ITBIS)
| No. Parte | Descripción | Precio Unitario RD$ |
| :--- | :--- | :---: |
| `INHPBX` | Instalación Base Hosted PBX (8 Usuarios) | $4,200.00 |
| `HPBX01` | Instalación Base de 1 usuario en Hosted PBX | $525.00 |
| `HPBX10` | Instalación Base de 10 usuarios en Hosted PBX | $5,250.00 |
| `HPBX25` | Instalación Base de 25 usuarios en Hosted PBX | $13,125.00 |
| `HPB100` | Instalación Base de 100 usuarios en Hosted PBX | $50,000.00 |
| `SPHOBX` | Sistema de Tierra HBPX | $4,300.00 |
| `RECSIS` | Reconstrucción Sistema de Tierra | $9,555.00 |

---

## 📑 Ejemplo de Formato Renderizado

```markdown
# Propuesta Comercial - Hosted PBX (PYMES / CORPORATIVO)
**Compañía Dominicana de Teléfonos, S.A. | RNC: 10100157-7**

### Datos del Cliente
| Campo | Detalle | Campo | Detalle |
| :--- | :--- | :--- | :--- |
| **Cliente:** | [NOMBRE CLIENTE] | **Cotización No:** | COT-HPBX-[NUMERO] |
| **RNC:** | [RNC] | **Fecha:** | [FECHA] |
| **Dirección:** | [DIRECCIÓN] | **Validez:** | 30 Días |
| **Contacto:** | [CONTACTO] | **Localidades:** | [LOCALIDADES] |
| **Teléfono:** | [TELÉFONO] | **Usuarios / Teléfonos IP:** | [USUARIOS] / [TELÉFONOS] |

### 1. HOSTED PBX - SERVICIOS RENTA
*Impuestos aplicables: 30% (ITBIS 18% + CDT 2% + ISC 10%)*

| No. Parte | Descripción | Precio RD$ | Cant | Sub-Total RD$ | IMP. (30%) RD$ | Total RD$ |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| `[PARTE]` | [DESCRIPCION] | $0.00 | 1 | $0.00 | $0.00 | $0.00 |
| **SUBTOTAL SERVICIOS** | | | | **$0.00** | **$0.00** | **$0.00** |

### 2. HOSTED PBX: EQUIPOS ACCESO & TERMINALES (RENTA)
*Impuestos aplicables: 18% (ITBIS)*

| No. Parte | Descripción | Precio RD$ | Cant | Sub-Total RD$ | ITBIS (18%) RD$ | Total RD$ |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| `[PARTE]` | [DESCRIPCION] | $0.00 | 1 | $0.00 | $0.00 | $0.00 |
| **SUBTOTAL EQUIPOS RENTA** | | | | **$0.00** | **$0.00** | **$0.00** |

### 3. INSTALACIÓN Y CONFIGURACIÓN
*Impuestos aplicables: 18% (ITBIS)*

| No. Parte | Descripción | Precio RD$ | Cant | Sub-Total RD$ | ITBIS (18%) RD$ | Total RD$ |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| `[PARTE]` | [DESCRIPCION] | $0.00 | 1 | $0.00 | $0.00 | $0.00 |
| **SUBTOTAL INSTALACIÓN** | | | | **$0.00** | **$0.00** | **$0.00** |

### RESUMEN FINANCIERO
| Concepto | Monto Neto RD$ | Con Impuestos RD$ |
| :--- | :---: | :---: |
| **Renta Servicios HPBX** | $0.00 | $0.00 |
| **Renta Equipos HPBX** | $0.00 | $0.00 |
| **Total Renta Mensual** | **$0.00** | **$0.00** |
| **Total Instalación** | $0.00 | $0.00 |
| 🏆 **GRAND TOTAL (Primer Pago)** | — | **$0.00 RD$** |

### Términos y Condiciones
- **Validez:** Oferta comercial válida por 30 días calendario.
- **Tiempo de entrega:** Sujeto a cronograma de proyecto tras suscripción del contrato.
- **Equipos y Energía:** El cliente debe proveer UPS/Inversor y puesta a tierra según norma técnica Claro Dominicana.
- **Régimen Fiscal:** Servicios de voz/telecomunicaciones gravados con 30% (ITBIS 18% + CDT 2% + ISC 10%). Equipos e instalación gravados con 18% ITBIS.

**Representante Claro:** [REPRESENTANTE]  
**Aprobación Cliente:** [FIRMA CLIENTE]
```
