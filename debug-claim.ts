import {createAdminClient} from './src/lib/server/supabase/admin';

async function debugClaim(code: string) {
  const supabase = createAdminClient();

  console.log('--- DEBUGGING CLAIM FOR CODE:', code, '---');

  const {data: campaign, error: cError} = await supabase
    .from('campaigns')
    .select('*')
    .eq('gift_code', code.trim())
    .maybeSingle();

  if (cError) {
    console.error('Campaign Error:', cError);
  } else if (!campaign) {
    console.log('Campaign NOT FOUND for code:', code);
  } else {
    console.log('Campaign Found:');
    console.log('  ID:', campaign.id);
    console.log('  User ID (Owner):', campaign.user_id);
    console.log('  Status:', campaign.status);
    console.log('  Category:', campaign.category);
    console.log('  Created At:', campaign.created_at);

    const {data: txs, error: tError} = await supabase
      .from('transactions')
      .select('*')
      .eq('reference', `claim-${code}`) // or similar
      .or(`description.ilike.%${code}%`);

    if (tError) {
      console.error('Transaction Error:', tError);
    } else {
      console.log('Transactions Found:', txs.length);
      txs.forEach(t => {
        console.log(
          `  - TX: ${t.type}, Amount: ${t.amount}, User: ${t.user_id}, Status: ${t.status}`,
        );
      });
    }
  }
}

const codeToDebug = process.argv[2] || 'GFT-SAN0O';
debugClaim(codeToDebug);
