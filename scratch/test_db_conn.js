import pkg from 'pg';
const { Client } = pkg;

async function testConnection(user, password, database) {
  console.log(`Testing connection to 74.208.192.253:5432 with user: ${user}, db: ${database}...`);
  const client = new Client({
    host: '74.208.192.253',
    port: 5432,
    user: user,
    password: password,
    database: database,
    connectionTimeoutMillis: 5000
  });

  try {
    await client.connect();
    console.log(`✅ SUCCESS! Connected to PostgreSQL on 74.208.192.253 as ${user}!`);
    const res = await client.query('SELECT current_database(), current_user, version()');
    console.log("Database info:", res.rows[0]);
    await client.end();
    return true;
  } catch (err) {
    console.error(`❌ Connection failed for ${user}:`, err.message);
    return false;
  }
}

async function run() {
  const passwordsToTest = [
    'TuPasswordSeguro123!',
    'postgres',
    'root',
    'claro123'
  ];

  let success = false;
  for (const pass of passwordsToTest) {
    success = await testConnection('claro_user', pass, 'claro_insight');
    if (success) break;
    success = await testConnection('postgres', pass, 'claro_insight');
    if (success) break;
    success = await testConnection('postgres', pass, 'postgres');
    if (success) break;
  }

  if (!success) {
    console.log("Could not authenticate with standard passwords.");
  }
}

run();
