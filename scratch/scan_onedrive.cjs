const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const ONEDRIVE_DIR = 'C:\\Users\\spawx\\OneDrive - Claro Dominicana';

function getAllFiles(dirPath, arrayOfFiles = []) {
  try {
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
      const fullPath = path.join(dirPath, file);
      try {
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          getAllFiles(fullPath, arrayOfFiles);
        } else {
          const ext = path.extname(file).toLowerCase().replace('.', '');
          if (['docx', 'doc', 'xlsx', 'xls', 'pdf', 'txt', 'pptx', 'ppt', 'vsd', 'vsdx', 'csv', 'msg', 'eml'].includes(ext)) {
            arrayOfFiles.push({
              name: file,
              fullPath: fullPath,
              ext: ext,
              size: stat.size,
              mtime: stat.mtime
            });
          }
        }
      } catch (err) {
        // Skip inaccessible files
      }
    }
  } catch (err) {
    // Skip inaccessible folders
  }
  return arrayOfFiles;
}

const foundFiles = getAllFiles(ONEDRIVE_DIR);
console.log(`Found ${foundFiles.length} document files in OneDrive - Claro Dominicana`);

// Display sample of found files
foundFiles.slice(0, 50).forEach((f, idx) => {
  console.log(`${idx + 1}. [${f.ext.toUpperCase()}] ${path.relative(ONEDRIVE_DIR, f.fullPath)} (${(f.size / 1024).toFixed(1)} KB)`);
});
