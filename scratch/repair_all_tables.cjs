/**
 * repair_all_tables.cjs
 * Detects and converts tab/newline-separated "pseudo-tables" to Markdown tables
 * for ALL communications in communications.js
 */

const fs = require('fs');
let content = fs.readFileSync('src/data/communications.js', 'utf8');

const moduleContent = content.replace('export const initialCommunications =', 'const data =') + '\nmodule.exports = data;';
fs.writeFileSync('scratch/temp_repair.cjs', moduleContent);
const data = require('./temp_repair.cjs');
fs.unlinkSync('scratch/temp_repair.cjs');

// ============================================================
// Helper: Convert a flat array of cell values into a Markdown table
// given a number of columns
// ============================================================
function arrayToMarkdownTable(cells, numCols) {
  if (cells.length < numCols || numCols < 2) return null;
  
  const rows = [];
  for (let i = 0; i < cells.length; i += numCols) {
    rows.push(cells.slice(i, i + numCols));
  }
  
  if (rows.length < 2) return null; // Need at least header + 1 data row
  
  const header = rows[0];
  const separator = header.map(() => ':---');
  const dataRows = rows.slice(1);
  
  const lines = [
    '| ' + header.join(' | ') + ' |',
    '| ' + separator.join(' | ') + ' |',
    ...dataRows.map(r => '| ' + r.map(c => c.replace(/\|/g, '\\|')).join(' | ') + ' |')
  ];
  
  return lines.join('\n');
}

// ============================================================
// Strategy: detect sections where consecutive paragraphs 
// (separated by \n\n) look like table data
// A "table section" is: a block where we have N short paragraphs 
// that repeat in pattern (e.g., 4 columns repeating)
// ============================================================

function detectAndFixPseudoTables(body, commId) {
  // Split body into "blocks" at \n\n boundaries
  // A block can be a heading (starts with #), a list item (starts with *),
  // a blockquote (starts with >), a proper markdown table row (contains |), 
  // or a "pseudo-table cell" (just text)
  
  const blocks = body.split('\n\n');
  
  let result = [];
  let i = 0;
  let fixCount = 0;
  
  while (i < blocks.length) {
    const block = blocks[i].trim();
    
    // Skip headings, list sections, blockquotes, proper tables, blank blocks
    if (block.startsWith('#') || block.startsWith('*') || block.startsWith('>') || 
        block.includes('|') || block === '' || block === ' ') {
      result.push(blocks[i]);
      i++;
      continue;
    }
    
    // Check if this block could be a table HEADER (key identifiers)
    // Common header words for Claro comms:
    const tableHeaderPatterns = [
      /^Planes?$/i,
      /^Plan(es)?\s+de\s+Compromiso/i,
      /^Plan(es)?\s+de\s+Renta/i,
      /^Oferta\s+Anterior/i,
      /^Descuento\s+en\s+renta/i,
      /^Código\s+de\s+material/i,
      /^Equipo$/i,
      /^Escenario$/i,
      /^Tipo$/i,
      /^Servicio$/i,
      /^Canales?$/i,
    ];
    
    const isLikelyHeader = tableHeaderPatterns.some(p => p.test(block));
    
    // Also detect: if 4+ consecutive blocks are all short (< 60 chars) and plain text
    // collect them and try to figure out the column count
    if (isLikelyHeader || (block.length < 80 && !block.includes('\n') && i + 3 < blocks.length)) {
      // Look ahead: collect consecutive "plain text" short blocks
      let candidates = [];
      let j = i;
      
      while (j < blocks.length) {
        const b = blocks[j].trim();
        // Stop at heading, list, blockquote, proper table, long paragraph, or blank (after start)
        if (j > i && (b === '' || b === ' ')) { j++; continue; } // skip blank blocks inside
        if (b.startsWith('#') || b.startsWith('*') || b.startsWith('>') || b.includes('|')) break;
        if (b.length > 120 && j > i) break; // long paragraph = end of table section
        if (b.includes('\n') && !b.startsWith('\t')) break; // multi-line non-tab = end
        
        // Tab-indented blocks are column separators - strip them
        const cleanBlock = b.replace(/^\t+/, '').trim();
        if (cleanBlock.length > 0) {
          candidates.push(cleanBlock);
        }
        j++;
      }
      
      // Only process as table if we have enough candidates
      if (candidates.length >= 8) {
        // Try to determine column count by looking at the first few items
        // Common patterns: 4 columns (Planes, PrecioAnterior, PrecioNuevo, Variacion)
        // Try col counts: 2, 3, 4, 5
        
        let bestTable = null;
        let bestColCount = 0;
        
        for (const numCols of [4, 3, 5, 2]) {
          if (candidates.length >= numCols * 2) {
            const table = arrayToMarkdownTable(candidates, numCols);
            if (table) {
              bestTable = table;
              bestColCount = numCols;
              break;
            }
          }
        }
        
        if (bestTable) {
          console.log(`  [${commId}] Converted ${candidates.length} cells → ${bestColCount}-col table`);
          result.push(bestTable);
          i = j;
          fixCount++;
          continue;
        }
      }
    }
    
    result.push(blocks[i]);
    i++;
  }
  
  return { body: result.join('\n\n'), fixCount };
}

// ============================================================
// Process all communications
// ============================================================
let totalFixes = 0;

const fixedData = data.map(comm => {
  const { body, fixCount } = detectAndFixPseudoTables(comm.body, comm.id);
  totalFixes += fixCount;
  return { ...comm, body };
});

console.log(`\nTotal fixes applied: ${totalFixes}`);

// ============================================================
// Write back to JS file
// ============================================================
// We need to serialize back as JS. Use JSON.stringify for the array value.
const newContent = 'export const initialCommunications = ' + JSON.stringify(fixedData, null, 2) + ';\n';
fs.writeFileSync('src/data/communications.js', newContent);
console.log('✅ communications.js saved with', fixedData.length, 'communications');

// Verify
const verifyContent = fs.readFileSync('src/data/communications.js', 'utf8');
console.log('File size:', verifyContent.length, 'bytes');
const tableCount = (verifyContent.match(/\| :--- \|/g) || []).length;
console.log('Markdown table separators found:', tableCount);
