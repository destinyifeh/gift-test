const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://gifthance:gifthance_dev_password@localhost:5434/gifthance'
});

async function updateFlexColor() {
  try {
    await client.connect();
    
    // Set exactly to tritone orange
    const res = await client.query("UPDATE gift_cards SET color_middle = '#e8771a' WHERE is_flex_card = true");
    console.log(`Updated ${res.rowCount} flex cards with colorMiddle!`);
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.end();
  }
}

updateFlexColor();
