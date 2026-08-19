import fs from 'fs';
import MsgReader from 'msgreader';

try {
  const filePath = 'C:/Users/Spawx/.gemini/antigravity-ide/scratch/claro-comm-repo/emails/ANUNCIO NO_ 8677_ ¡IMPORTANTE! NUEVA REGLA PARA EL CAMBIO DE ONT POR AUMENTO DE VELOCIDAD O SOLUCIÓN DE AVERÍAS DE INTERNET FIJO EN FIBRA ÓPTICA.msg';
  const fileBuffer = fs.readFileSync(filePath);
  const testMsg = new MsgReader.default(fileBuffer);
  const info = testMsg.getFileData();
  
  console.log("=== ATTACHMENTS ===");
  if (info.attachments && info.attachments.length > 0) {
    info.attachments.forEach((att, idx) => {
      console.log(`Attachment ${idx}:`, Object.keys(att).reduce((acc, k) => {
        acc[k] = k === 'content' ? `Buffer (${att[k].length} bytes)` : att[k];
        return acc;
      }, {}));
    });
  } else {
    console.log("No attachments.");
  }
} catch (e) {
  console.error("Failed:", e);
}
