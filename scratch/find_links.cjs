const fs = require('fs');

const content = fs.readFileSync('C:/Users/spawx/.gemini/antigravity-ide/brain/1ef8f26a-3b20-409c-a248-345edd089ab0/.system_generated/steps/716/content.md', 'utf8');

// Let's find all hrefs in the page
const hrefs = [];
const hrefRegex = /href="([^"]+)"/g;
let m;
while ((m = hrefRegex.exec(content)) !== null) {
  if (!m[1].startsWith('#') && !m[1].includes('.css') && !m[1].includes('.js') && !m[1].includes('.png') && !m[1].includes('.ico')) {
    hrefs.push(m[1]);
  }
}

console.log('Unique links in page:', [...new Set(hrefs)]);
