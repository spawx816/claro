import fs from 'fs';
import MsgReader from 'msgreader';

const filePath = 'C:/Users/Spawx/.gemini/antigravity-ide/scratch/claro-comm-repo/emails/ANUNCIO NO_ 8669_ ¡IMPORTANTE! CAMBIO DE PRECIOS DEL SERVICIO VIDEOVIGILANCIA SOLUCIONES A NEGOCIOS.msg';
const fileBuffer = fs.readFileSync(filePath);
const testMsg = new MsgReader.default(fileBuffer);
const info = testMsg.getFileData();

let text = info.body
  .replace(/\r\n/g, '\n')
  .replace(/\r/g, '\n')
  .replace(/\n{3,}/g, '\n\n')
  .trim();

const textLower = text.toLowerCase();
console.log("textLower contains 'videovigilancia'?", textLower.includes('videovigilancia'));
console.log("textLower contains 'licenv3'?", textLower.includes('licenv3'));

const videoTableRegex = /Tipo\s*Descripción\s*Código\s*Precio US\$[\s\S]+?Para más informacion acerca de Videovigilancia/i;
const matched = videoTableRegex.test(text);
console.log("Regex matches?", matched);

if (!matched) {
  // Let's print around 'Tipo' and 'Código'
  const index = text.indexOf("Planes y Precios:");
  if (index !== -1) {
    console.log("Snippet around Planes y Precios:", text.substring(index, index + 300));
  } else {
    console.log("Planes y Precios not found!");
  }
}
