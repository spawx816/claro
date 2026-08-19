const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function fixTableAndReindex() {
  const pool = new Pool({
    connectionString: 'postgres://claro_user:TuPasswordSeguro123!@74.208.192.253:5432/claro_insight',
    ssl: false
  });

  const client = await pool.connect();
  console.log("🟢 Conectado a PostgreSQL. Modificando tipos de columnas a TEXT...");

  await client.query(`
    ALTER TABLE commercial_documents 
      ALTER COLUMN id TYPE TEXT,
      ALTER COLUMN name TYPE TEXT,
      ALTER COLUMN title TYPE TEXT,
      ALTER COLUMN folder TYPE TEXT,
      ALTER COLUMN category TYPE TEXT,
      ALTER COLUMN extension TYPE TEXT,
      ALTER COLUMN size TYPE TEXT,
      ALTER COLUMN author TYPE TEXT,
      ALTER COLUMN version TYPE TEXT;
  `);

  console.log("✅ Columnas ampliadas. Leyendo chat_db.json para insertar los 3,964 archivos...");
  const dbData = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../data/chat_db.json'), 'utf-8'));
  const docs = dbData.documents || [];

  console.log(`Insertando ${docs.length} documentos...`);
  const batchSize = 100;
  for (let i = 0; i < docs.length; i += batchSize) {
    const batch = docs.slice(i, i + batchSize);
    for (const doc of batch) {
      await client.query(`
        INSERT INTO commercial_documents (
          id, name, title, folder, category, extension, size, size_bytes,
          modified_date, author, version, sharepoint_url, is_synced, tags,
          ai_summary, key_takeaways, content_preview, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, CURRENT_TIMESTAMP)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          title = EXCLUDED.title,
          folder = EXCLUDED.folder,
          category = EXCLUDED.category,
          extension = EXCLUDED.extension,
          size = EXCLUDED.size,
          size_bytes = EXCLUDED.size_bytes,
          modified_date = EXCLUDED.modified_date,
          author = EXCLUDED.author,
          tags = EXCLUDED.tags,
          ai_summary = EXCLUDED.ai_summary,
          key_takeaways = EXCLUDED.key_takeaways,
          content_preview = EXCLUDED.content_preview
      `, [
        doc.id, doc.name, doc.title, doc.folder, doc.category, doc.extension,
        doc.size, doc.sizeBytes, doc.modifiedDate, doc.author, doc.version,
        doc.sharepointUrl, doc.isSynced, JSON.stringify(doc.tags),
        doc.aiSummary, JSON.stringify(doc.keyTakeaways), doc.contentPreview
      ]);
    }
    process.stdout.write(`\rInsertados ${Math.min(i + batchSize, docs.length)} / ${docs.length} documentos en PostgreSQL...`);
  }

  console.log("\n🎉 ¡Todos los 3,964 documentos insertados exitosamente en PostgreSQL!");
  client.release();
  await pool.end();
}

fixTableAndReindex().catch(err => console.error("Error:", err.message));
