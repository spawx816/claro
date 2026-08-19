/**
 * fix_tab_tables.js
 * Fixes the tab-separated "pseudo-tables" in communications.js 
 * by replacing them with proper Markdown table format.
 */

const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../src/data/communications.js');
let content = fs.readFileSync(dataPath, 'utf8');

// Extract the module exports to work with the actual JS object
// We'll use eval-like approach by extracting the JSON-like string
// Actually let's just do targeted string replacements on the raw body strings

// ============================================================
// FIX 1: IoT Smart Connect - second table (Paquetes adicionales con reglas)
// ============================================================
const iotBadTable = `\\n\\n\\tPaquetes adicionales de Internet IoT Smart Connect con Reglas de Navegación\\n\\nTipo\\n\\nOffer Id\\n\\nDescripción\\n\\nPrecios\\ncon impuestos (RD$)\\n\\n\\tTipo\\n\\nOffer Id\\n\\nDescripción\\n\\nPrecios\\ncon impuestos (RD$)\\n\\nNav. Días\\n\\n11016\\n\\n1GB - 30 días\\n\\n$195.00 \\n\\n\\tNav. Días\\n\\n10659\\n\\n100MB - 30 días\\n\\n$33.00 \\n\\n11017\\n\\n3GB - 30 días\\n\\n$553.00 \\n\\n\\t10661\\n\\n500MB - 30 días\\n\\n$124.00 \\n\\n11018\\n\\n5GB - 30 días\\n\\n$904.00 \\n\\n\\t10624\\n\\n1GB - 30 días\\n\\n$195.00 \\n* No aplica Turbo Carga\\n\\n\\t\\t\\t10625\\n\\n3GB - 30 días\\n\\n$553.00 \\n\\n\\t\\t\\t\\t\\t10626\\n\\n5GB - 30 días\\n\\n$904.00 \\n* No aplica Turbo Carga\\n\\n\\t\\t`;

const iotGoodTable = `\\n\\n| Tipo | Offer Id | Descripción | Precio c/imp (RD$) |\\n| :--- | :---: | :--- | :---: |\\n| Nav. Días | 11016 | 1GB - 30 días | $195.00 |\\n| Nav. Días | 10659 | 100MB - 30 días | $33.00 |\\n| | 11017 | 3GB - 30 días | $553.00 |\\n| | 10661 | 500MB - 30 días | $124.00 |\\n| | 11018 | 5GB - 30 días | $904.00 |\\n| | 10624 | 1GB - 30 días | $195.00 \\\\* |\\n| | 10625 | 3GB - 30 días | $553.00 |\\n| | 10626 | 5GB - 30 días | $904.00 \\\\* |\\n\\n*\\\\* No aplica Turbo Carga*\\n`;

if (content.includes(iotBadTable)) {
  content = content.replace(iotBadTable, iotGoodTable);
  console.log('✅ Fixed IoT Smart Connect second table');
} else {
  console.log('⚠️  IoT bad table string not found, trying partial match...');
  // Try partial match
  if (content.includes('\\tPaquetes adicionales de Internet IoT Smart Connect con Reglas')) {
    console.log('  Found partial match - manual inspection needed');
  }
}

// ============================================================
// FIX 2: Fix any generic tab-separated "pseudo-tables" in ALL bodies
// This is a regex approach to detect and convert common patterns
// ============================================================

// Pattern: sequences where we have short words/prices on separate lines with tabs
// This is tricky to do generically, so let's look for specific patterns in each comm

// Look for other bodies with similar tab patterns
const tabPattern = /\\\\t[^"]{1,100}\\\\n\\\\n/g;
const matches = content.match(tabPattern);
if (matches) {
  console.log('\nFound', matches.length, 'potential tab-separated sections:');
  matches.slice(0, 10).forEach((m, i) => console.log(`  ${i+1}: ${m.substring(0, 60)}...`));
}

// ============================================================
// Save fixed content
// ============================================================
fs.writeFileSync(dataPath, content);
console.log('\n✅ communications.js updated successfully');

// Also verify the fix was applied
const verifyContent = fs.readFileSync(dataPath, 'utf8');
if (verifyContent.includes('Nav. Días | 11016')) {
  console.log('✅ Verification passed - markdown table is present');
} else {
  console.log('❌ Verification FAILED - table may not have been fixed');
}
