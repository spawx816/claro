const fs = require('fs');
const content = fs.readFileSync('src/data/communications.js', 'utf8');
const moduleContent = content.replace('export const initialCommunications =', 'const data =') + '\nmodule.exports = data;';
fs.writeFileSync('scratch/temp_data2.cjs', moduleContent);
const data = require('./temp_data2.cjs');

// Show the body of comm-parsed-5 (Microsoft 365 - no proper tables)
const ms365 = data.find(c => c.id === 'comm-parsed-5');
console.log('=== MICROSOFT 365 BODY (first 3000 chars) ===');
console.log(ms365.body.substring(0, 3000));

console.log('\n\n=== COMM-8 (Portabilidad) BODY (first 2000 chars) ===');
const port = data.find(c => c.id === 'comm-parsed-8');
console.log(port.body.substring(0, 2000));

fs.unlinkSync('scratch/temp_data2.cjs');
