import fs from 'fs';
import MsgReader from 'msgreader';

try {
  const filePath = 'C:/Users/Spawx/.gemini/antigravity-ide/scratch/claro-comm-repo/emails/ANUNCIO NO_ 8678_ ¡IMPORTANTE! CAMBIO DE PRECIOS EN MICROSOFT 365 SOLUCIONES A NEGOCIOS.msg';
  const fileBuffer = fs.readFileSync(filePath);
  const testMsg = new MsgReader.default(fileBuffer); // msgreader package exports MsgReader as default or named. Let's check MsgReader.default or MsgReader
  const info = testMsg.getFileData();
  
  console.log("=== PARSING SUCCESS ===");
  console.log("Keys available:", Object.keys(info));
  console.log("Body exists:", !!info.body);
} catch (e) {
  console.error("Parsing failed:", e);
}
