import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SECRET_KEY;

const supabase = createClient(supabaseUrl!, supabaseKey!);

async function checkData() {
  const { data: gifts } = await supabase.from('vendor_gifts').select('id, name, vendor_id').limit(5);
  console.log('--- VENDOR GIFTS ---');
  console.log(gifts);

  if (gifts && gifts.length > 0) {
    const { data: profiles } = await supabase.from('profiles').select('id, shop_name, shop_address').in('id', gifts.map(g => g.vendor_id));
    console.log('--- PROFILES ---');
    console.log(profiles);
  }
}

checkData();
