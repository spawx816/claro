const fs = require('fs');

const content = fs.readFileSync('C:/Users/spawx/.gemini/antigravity-ide/brain/1ef8f26a-3b20-409c-a248-345edd089ab0/.system_generated/steps/716/content.md', 'utf8');

// Find all product names, cards, descriptions
const regex = /<h3[^>]*>(.*?)<\/h3>[\s\S]*?<p[^>]*>(.*?)<\/p>/gi;
let m;
const items = [];
while ((m = regex.exec(content)) !== null) {
  const title = m[1].replace(/<[^>]*>/g, '').trim();
  const desc = m[2].replace(/<[^>]*>/g, '').trim();
  if (title && desc && title.length < 80) {
    items.push({ title, desc });
  }
}

console.log('Items found from H3 + P:', JSON.stringify(items, null, 2));

// Let's also look for all specific product links and cards
const pRegex = /<div class="[^"]*card[^"]*"[^>]*>([\s\S]*?)<\/div>/gi;
const cardItems = [];
while ((m = pRegex.exec(content)) !== null) {
  cardItems.push(m[1].replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim());
}
console.log('Card items sample:', cardItems.slice(0, 15));
