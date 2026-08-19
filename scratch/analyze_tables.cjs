const fs = require('fs');
const content = fs.readFileSync('src/data/communications.js', 'utf8');

// Parse the module to get the actual data
// Use a simple approach: eval the export
const moduleContent = content.replace('export const initialCommunications =', 'const data =') + '\nmodule.exports = data;';
fs.writeFileSync('scratch/temp_data.cjs', moduleContent);
const data = require('./temp_data.cjs');

data.forEach((comm, i) => {
  const body = comm.body;
  const hasProperTables = (body.match(/\|.*\|.*\|/g) || []).length;
  const hasBadTabs = (body.match(/\t/g) || []).length;
  const hasShortLineGroups = (body.match(/\n\n[^\n#*|>]{1,30}\n\n[^\n#*|>]{1,30}\n\n/g) || []).length;
  
  if (hasBadTabs > 0 || hasShortLineGroups > 2) {
    console.log(`\n[${i+1}] ${comm.id} - ${comm.title.substring(0, 50)}...`);
    console.log(`   proper_table_rows: ${hasProperTables}`);
    console.log(`   tab_chars: ${hasBadTabs}`);
    console.log(`   short_line_groups: ${hasShortLineGroups}`);
    
    // Show the problematic sections
    const lines = body.split('\n');
    let suspicious = false;
    let suspiciousLines = [];
    lines.forEach((line, j) => {
      if (line.includes('\t') || (line.trim().length > 0 && line.trim().length < 20 && !line.startsWith('#') && !line.startsWith('*') && !line.startsWith('|') && !line.startsWith('>') && !line.startsWith('$') && !line.startsWith('!'))) {
        suspiciousLines.push(`  L${j+1}: "${line.substring(0, 60)}"`);
      }
    });
    if (suspiciousLines.length > 0 && suspiciousLines.length < 30) {
      console.log('  Suspicious lines:');
      suspiciousLines.slice(0, 15).forEach(l => console.log(l));
    }
  }
});

console.log('\nDone analysis.');
fs.unlinkSync('scratch/temp_data.cjs');
