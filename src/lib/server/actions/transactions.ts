'use server';

import {revalidatePath} from 'next/cache';
import {createClient} from '../supabase/server';

export async function verifyPaymentAndUpgrade(reference: string) {
  const supabase = await createClient();
  const {
    data: {user},
  } = await supabase.auth.getUser();

  if (!user) {
    return {success: false, error: 'Not authenticated'};
  }

  // 1. Verify payment with Paystack
  const secretKey = process.env.NEXT_PUBLIC_PAYSTACK_SECRET_KEY;
  try {
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${secretKey}`,
        },
      },
    );

    const body = await response.json();
    if (!body.status || body.data.status !== 'success') {
      return {success: false, error: 'Payment verification failed'};
    }

    // 2. Update user plan
    const {data: profile} = await supabase
      .from('profiles')
      .select('theme_settings, username')
      .eq('id', user.id)
      .single();

    const theme_settings = profile?.theme_settings || {};

    const {error} = await supabase
      .from('profiles')
      .update({
        is_creator: true,
        theme_settings: {
          ...theme_settings,
          plan: 'pro',
        },
      })
      .eq('id', user.id);

    if (error) {
      return {success: false, error: error.message};
    }

    revalidatePath('/dashboard');
    if (profile?.username) {
      revalidatePath(`/u/${profile.username}`);
    }

    return {success: true};
  } catch (err: any) {
    return {success: false, error: err.message || 'Verification error'};
  }
}

export async function resetPlan() {
  const supabase = await createClient();
  const {
    data: {user},
  } = await supabase.auth.getUser();

  if (!user) {
    return {success: false, error: 'Not authenticated'};
  }

  const {data: profile} = await supabase
    .from('profiles')
    .select('theme_settings')
    .eq('id', user.id)
    .single();

  const theme_settings = profile?.theme_settings || {};

  const {error} = await supabase
    .from('profiles')
    .update({
      theme_settings: {
        ...theme_settings,
        plan: 'free',
      },
    })
    .eq('id', user.id);

  if (error) {
    return {success: false, error: error.message};
  }

  revalidatePath('/dashboard');
  return {success: true};
}
export async function getPaystackBanks(country = 'nigeria') {
  const secretKey = process.env.NEXT_PUBLIC_PAYSTACK_SECRET_KEY;
  try {
    const response = await fetch(
      `https://api.paystack.co/bank?country=${country.toLowerCase()}`,
      {
        headers: {
          Authorization: `Bearer ${secretKey}`,
        },
      },
    );

    const body = await response.json();
    if (!body.status) {
      return {success: false, error: body.message || 'Failed to fetch banks'};
    }

    return {success: true, data: body.data};
  } catch (err: any) {
    return {success: false, error: err.message || 'Fetch error'};
  }
}

export async function resolvePaystackAccount(
  accountNumber: string,
  bankCode: string,
) {
  const secretKey = process.env.NEXT_PUBLIC_PAYSTACK_SECRET_KEY;
  try {
    const response = await fetch(
      `https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
      {
        headers: {
          Authorization: `Bearer ${secretKey}`,
        },
      },
    );

    const body = await response.json();
    if (!body.status) {
      return {
        success: false,
        error: body.message || 'Account resolution failed',
      };
    }

    return {success: true, data: body.data};
  } catch (err: any) {
    return {success: false, error: err.message || 'Resolution error'};
  }
}

export async function addPaystackBankAccount(
  bankName: string,
  bankCode: string,
  accountNumber: string,
  accountName: string,
  country = 'Nigeria',
  currency = 'NGN',
) {
  const supabase = await createClient();
  const {
    data: {user},
  } = await supabase.auth.getUser();

  if (!user) {
    return {success: false, error: 'Not authenticated'};
  }

  const secretKey = process.env.NEXT_PUBLIC_PAYSTACK_SECRET_KEY;
  try {
    // 1. Create Transfer Recipient
    const recipientResponse = await fetch(
      'https://api.paystack.co/transferrecipient',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${secretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'nuban',
          name: accountName,
          account_number: accountNumber,
          bank_code: bankCode,
          currency: currency,
        }),
      },
    );

    const recipientBody = await recipientResponse.json();
    if (!recipientBody.status) {
      return {
        success: false,
        error: recipientBody.message || 'Failed to create recipient',
      };
    }

    const recipientCode = recipientBody.data.recipient_code;

    // 2. Save to database
    const {error} = await supabase.from('bank_accounts').insert({
      user_id: user.id,
      bank_name: bankName,
      bank_code: bankCode,
      account_number: accountNumber,
      account_name: accountName,
      recipient_code: recipientCode,
      country,
      currency,
      is_primary: true, // For now, make new one primary
    });

    if (error) {
      return {success: false, error: error.message};
    }

    revalidatePath('/dashboard');
    return {success: true};
  } catch (err: any) {
    return {success: false, error: err.message || 'Account addition error'};
  }
}

export async function fetchWalletProfile() {
  const supabase = await createClient();
  const {
    data: {user},
  } = await supabase.auth.getUser();

  if (!user) {
    return {success: false, error: 'Not authenticated'};
  }

  // Fetch accounts and transactions
  const [{data: accounts}, {data: txs}] = await Promise.all([
    supabase.from('bank_accounts').select('*').eq('user_id', user.id),
    supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', {ascending: false}),
  ]);

  // Calculate balance (crude version: inflows - outflows)
  const balance = (txs || []).reduce((acc, t) => {
    if (t.status !== 'success') return acc;
    if (t.type === 'receipt') return acc + Number(t.amount);
    if (t.type === 'withdrawal' || t.type === 'fee')
      return acc - Number(t.amount);
    return acc;
  }, 0);

  return {
    success: true,
    data: {
      balance: balance / 100, // Convert to major currency unit
      accounts: accounts || [],
      transactions: txs || [],
    },
  };
}

export async function initiateWithdrawal(
  amount: number,
  bankAccountId: string,
) {
  const supabase = await createClient();
  const {
    data: {user},
  } = await supabase.auth.getUser();

  if (!user) {
    return {success: false, error: 'Not authenticated'};
  }

  const secretKey = process.env.NEXT_PUBLIC_PAYSTACK_SECRET_KEY;
  try {
    // 1. Get bank account recipient_code
    const {data: account} = await supabase
      .from('bank_accounts')
      .select('recipient_code, bank_name')
      .eq('id', bankAccountId)
      .single();

    if (!account) {
      return {success: false, error: 'Bank account not found'};
    }

    // 2. Initiate Transfer in Paystack
    const transferResponse = await fetch('https://api.paystack.co/transfer', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source: 'balance',
        amount: Math.round(amount * 100), // Convert to kobo
        recipient: account.recipient_code,
        reason: 'Wallet withdrawal',
      }),
    });

    const transferBody = await transferResponse.json();
    if (!transferBody.status) {
      return {
        success: false,
        error: transferBody.message || 'Transfer initiation failed',
      };
    }

    // 3. Record transaction in database
    const {error} = await supabase.from('transactions').insert({
      user_id: user.id,
      amount: Math.round(amount * 100),
      type: 'withdrawal',
      status: 'pending', // Paystack transfers are usually async
      reference: transferBody.data.reference,
      description: `Withdrawal to ${account.bank_name}`,
    });

    if (error) {
      return {success: false, error: error.message};
    }

    revalidatePath('/dashboard');
    return {success: true};
  } catch (err: any) {
    return {success: false, error: err.message || 'Withdrawal error'};
  }
}

export async function deleteBankAccount(id: string) {
  const supabase = await createClient();
  const {
    data: {user},
  } = await supabase.auth.getUser();

  if (!user) {
    return {success: false, error: 'Not authenticated'};
  }

  const {error} = await supabase
    .from('bank_accounts')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    return {success: false, error: error.message};
  }

  revalidatePath('/dashboard');
  return {success: true};
}

export async function recordCampaignContribution({
  reference,
  campaignSlug,
  donorName,
  donorEmail,
  message,
  isAnonymous,
  hideAmount,
  expectedAmount,
  currency,
}: {
  reference: string;
  campaignSlug: string;
  donorName: string;
  donorEmail: string;
  message?: string;
  isAnonymous: boolean;
  hideAmount: boolean;
  expectedAmount: number;
  currency: string;
}) {
  const supabase = await createClient();

  // 1. Get campaign ID
  const {data: campaign} = await supabase
    .from('campaigns')
    .select('id, current_amount')
    .eq('slug', campaignSlug)
    .single();

  if (!campaign) {
    return {success: false, error: 'Campaign not found'};
  }

  // 2. Verify with Paystack
  const secretKey = process.env.NEXT_PUBLIC_PAYSTACK_SECRET_KEY;
  try {
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {Authorization: `Bearer ${secretKey}`},
      },
    );

    const body = await response.json();
    if (!body.status || body.data.status !== 'success') {
      return {success: false, error: 'Payment verification failed'};
    }

    // Verify amount (Paystack returns in smallest currency unit, e.g., kobo/cents)
    const paidAmount = body.data.amount / 100;
    if (paidAmount < expectedAmount) {
      return {success: false, error: 'Incomplete payment amount'};
    }

    // 3. Try inserting transaction (fails if reference already exists due to unique constraint)
    const {
      data: {user},
    } = await supabase.auth.getUser();
    const userId = user?.id || null; // Null for guests

    const {data: tx, error: txError} = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        campaign_id: campaign.id,
        amount: body.data.amount, // Store in smallest unit
        currency: body.data.currency || currency,
        type: 'campaign_contribution',
        status: 'success',
        reference,
        description: `Contribution to campaign: ${campaignSlug}`,
      })
      .select()
      .single();

    if (txError) {
      if (txError.code === '23505') {
        return {success: false, error: 'Payment already processed'};
      }
      throw txError;
    }

    // 4. Record contribution metadata
    const {error: contribError} = await supabase.from('contributions').insert({
      campaign_id: campaign.id,
      transaction_id: tx.id,
      amount: paidAmount, // Store in main unit for display ease
      currency: body.data.currency || currency,
      donor_name: donorName,
      donor_email: donorEmail,
      message,
      is_anonymous: isAnonymous,
      hide_amount: hideAmount,
    });

    if (contribError) {
      console.error('Failed to log contribution metadata:', contribError);
      // Don't fail the whole process if just metadata insert fails, payment is secured
    }

    // 5. Update campaign total
    await supabase
      .from('campaigns')
      .update({current_amount: Number(campaign.current_amount) + paidAmount})
      .eq('id', campaign.id);

    revalidatePath(`/campaign/${campaignSlug}`);
    return {success: true};
  } catch (err: any) {
    return {success: false, error: err.message || 'Processing error'};
  }
}
