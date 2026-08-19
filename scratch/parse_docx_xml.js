import fs from 'fs';
import path from 'path';
import process from 'process';

function parseXmlFile(xmlPath, outPath) {
  try {
    const xmlContent = fs.readFileSync(xmlPath, 'utf8');
    
    // We search for <w:p> tags, and inside each <w:p>, we search for <w:t> tags.
    const pRegex = /<w:p\b[^>]*>([\s\S]*?)<\/w:p>/g;
    
    let paragraphs = [];
    let match;
    while ((match = pRegex.exec(xmlContent)) !== null) {
      let pContent = match[1];
      // Note: <w:t> can have attribute xml:space="preserve"
      const tRegex = /<w:t\b[^>]*>([\s\S]*?)<\/w:t>/g;
      let tMatch;
      let pText = '';
      while ((tMatch = tRegex.exec(pContent)) !== null) {
        // XML entity decode
        let text = tMatch[1]
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&apos;/g, "'");
        pText += text;
      }
      paragraphs.push(pText);
    }
    
    const output = paragraphs.join('\n');
    fs.writeFileSync(outPath, output, 'utf8');
    console.log(`Successfully parsed ${xmlPath} into ${outPath}`);
  } catch (err) {
    console.error(`Error parsing ${xmlPath}:`, err);
  }
}

const args = process.argv.slice(2);
if (args.length < 2) {
  console.log("Usage: node parse_docx_xml.js <xmlPath> <outPath>");
} else {
  parseXmlFile(args[0], args[1]);
}
