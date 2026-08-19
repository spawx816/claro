const fs = require('fs');
const path = require('path');

const content = fs.readFileSync('C:/Users/spawx/.gemini/antigravity-ide/brain/1ef8f26a-3b20-409c-a248-345edd089ab0/.system_generated/steps/716/content.md', 'utf8');

// Search for product sections and titles
const titleRegex = /<h[2-5][^>]*>(.*?)<\/h[2-5]>/gi;
let m;
const titles = [];
while ((m = titleRegex.exec(content)) !== null) {
  const clean = m[1].replace(/<[^>]*>/g, '').trim();
  if (clean && !titles.includes(clean)) titles.push(clean);
}

console.log('All titles found:', titles);

// Look for specific product cards or links
const prods = [];
const lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes('/productos/') || line.includes('cld/productos/')) {
    const matchHref = line.match(/href="([^"]+)"/);
    if (matchHref) {
      prods.push(matchHref[1]);
    }
  }
}

const uniqueHrefs = [...new Set(prods)];
console.log('Product Hrefs:', uniqueHrefs);
