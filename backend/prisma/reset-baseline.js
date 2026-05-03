const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://gifthance:gifthance_dev_password@localhost:5434/gifthance'
});

async function main() {
  const migrationName = '0_init';
  console.log(`Deleting migration record: ${migrationName}`);
  
  try {
    await client.connect();
    const res = await client.query('DELETE FROM "_prisma_migrations" WHERE "migration_name" = $1', [migrationName]);
    console.log(`Successfully deleted ${res.rowCount} record(s).`);
  } catch (err) {
    console.error('Error deleting migration record:', err);
  } finally {
    await client.end();
  }
}

main();
