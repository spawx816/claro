const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');
const XLSX = require('xlsx');

const ONEDRIVE_DIR = 'C:\\Users\\spawx\\OneDrive - Claro Dominicana';

async function testParse() {
  // Test DOCX
  const sampleDocx = path.join(ONEDRIVE_DIR, 'Archivos de chat de Microsoft Teams\\Documento de alcance - HOTEL GREEN EARTH INVESTMENT.docx');
  if (fs.existsSync(sampleDocx)) {
    console.log("Found DOCX:", sampleDocx);
    const result = await mammoth.convertToHtml({ path: sampleDocx });
    console.log("DOCX HTML Preview (first 300 chars):", result.value.substring(0, 300));
  } else {
    console.log("DOCX not found at path:", sampleDocx);
  }

  // Test XLSX
  const sampleXlsx = path.join(ONEDRIVE_DIR, 'Planes de flota expirados\\Flota Actualizado.xlsx');
  if (fs.existsSync(sampleXlsx)) {
    console.log("Found XLSX:", sampleXlsx);
    const wb = XLSX.readFile(sampleXlsx);
    console.log("Sheet names:", wb.SheetNames);
    const firstSheet = wb.Sheets[wb.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
    console.log("Rows count:", data.length, "First row:", data[0]);
  }
}

testParse();
