import fs from 'fs';

const repoPath = 'C:/Users/Spawx/.gemini/antigravity-ide/scratch/claro-comm-repo/src/components/CommunicationsRepo.jsx';

try {
  let content = fs.readFileSync(repoPath, 'utf8');
  
  // Replace long strings of underscores (e.g. 10 or more) with a shorter, safe divider
  const originalLength = content.length;
  content = content.replace(/_{10,}/g, '\n-----------------------------------\n');
  content = content.replace(/-{10,}/g, '\n-----------------------------------\n');
  
  fs.writeFileSync(repoPath, content);
  console.log(`Cleaned long underscores/dashes. Size reduced by ${originalLength - content.length} characters.`);
} catch (e) {
  console.error("Clean up failed:", e);
}
