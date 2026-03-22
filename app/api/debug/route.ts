import {createClient} from '@/lib/server/supabase/server';
import {NextResponse} from 'next/server';

export async function GET() {
  let output: any = {};
  try {
    const supabase = await createClient();

    // Check vendor_gifts
    const {data: gifts, error: giftErr} = await supabase
      .from('vendor_gifts')
      .select('id, vendor_id, name');
    output.gifts = gifts;
    output.giftErr = giftErr;

    if (gifts && gifts.length > 0) {
      const vendorIds = gifts.map(g => g.vendor_id);
      const {data: profiles, error: profErr} = await supabase
        .from('profiles')
        .select('id, shop_details')
        .in('id', vendorIds);
      output.profiles = profiles;
      output.profErr = profErr;
    }
  } catch (e: any) {
    output.error = e.message;
  }

  return NextResponse.json(output);
}
