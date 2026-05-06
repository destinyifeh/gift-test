const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://gifthance:gifthance_dev_password@localhost:5434/gifthance'
});

async function check() {
  await client.connect();
  const res = await client.query('SELECT name, "is_flex_card", color_from, color_middle, color_to FROM gift_cards WHERE is_flex_card = true');
  console.log(res.rows);
  await client.end();
}
check();
