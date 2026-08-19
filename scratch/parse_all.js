import fs from 'fs';
import path from 'path';
import MsgReader from 'msgreader';

const emailsDir = 'C:/Users/Spawx/.gemini/antigravity-ide/scratch/claro-comm-repo/emails';
const outputFilePath = 'C:/Users/Spawx/.gemini/antigravity-ide/scratch/claro-comm-repo/scratch/all_parsed.json';

try {
  const files = fs.readdirSync(emailsDir);
  const msgFiles = files.filter(f => f.toLowerCase().endsWith('.msg'));
  
  console.log(`Found ${msgFiles.length} msg files.`);
  
  const parsedEmails = [];
  
  for (const file of msgFiles) {
    const filePath = path.join(emailsDir, file);
    const fileBuffer = fs.readFileSync(filePath);
    const reader = new MsgReader.default(fileBuffer);
    const info = reader.getFileData();
    
    // Extract date from headers or default to current date
    let date = new Date().toISOString().split('T')[0];
    if (info.headers) {
      const dateHeader = info.headers.split('\n').find(h => h.toLowerCase().startsWith('date:'));
      if (dateHeader) {
        try {
          const parsedDate = new Date(dateHeader.substring(5).trim());
          if (!isNaN(parsedDate.getTime())) {
            date = parsedDate.toISOString().split('T')[0];
          }
        } catch (e) {
          // Keep current date
        }
      }
    }
    
    parsedEmails.push({
      fileName: file,
      subject: info.subject || 'Sin Asunto',
      senderName: info.senderName || 'Desconocido',
      senderEmail: info.senderEmail || '',
      body: info.body || '',
      date: date
    });
  }
  
  fs.writeFileSync(outputFilePath, JSON.stringify(parsedEmails, null, 2));
  console.log(`Successfully parsed and saved ${parsedEmails.length} emails to scratch/all_parsed.json.`);
  
} catch (e) {
  console.error("Failed to parse msg files:", e);
}
