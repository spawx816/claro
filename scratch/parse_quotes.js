import * as XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';

const pymesPath = 'src/components/fuentes/cotizaciones/Cotización para HPBX PYMES - PREMEDICA SRL.xls';
const corpPath = 'src/components/fuentes/cotizaciones/Cotización para HPBX Coporativo.xls';

function parseFile(filePath, name) {
  const buf = fs.readFileSync(filePath);
  const wb = XLSX.read(buf, { type: 'buffer' });
  const result = { fileName: path.basename(filePath), sheets: {} };
  
  for (const sheetName of wb.SheetNames) {
    const ws = wb.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
    result.sheets[sheetName] = data;
  }
  
  fs.writeFileSync(`scratch/${name}.json`, JSON.stringify(result, null, 2));
  console.log(`Parsed ${name}: ${wb.SheetNames.join(', ')}`);
}

parseFile(pymesPath, 'pymes_parsed');
parseFile(corpPath, 'corp_parsed');
