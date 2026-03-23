'use server';

import {getCurrencyByCountry} from '@/lib/constants/currencies';
import {sendThankYouEmail} from '@/lib/server/actions/email';
import {generateGiftCode} from '@/lib/utils/gift-codes';
import {revalidatePath} from 'next/cache';
import {createAdminClient} from '../supabase/admin';
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

  // Fetch accounts, transactions, and user's campaigns
  const [{data: accounts}, {data: txs}, {data: userCampaigns}] =
    await Promise.all([
      supabase.from('bank_accounts').select('*').eq('user_id', user.id),
      supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .in('type', [
          'campaign_contribution',
          'creator_support',
          'creator_support_sent',
          'receipt',
        ])
        .order('created_at', {ascending: false}),
      supabase
        .from('campaigns')
        .select('current_amount')
        .eq('user_id', user.id)
        .is('gift_code', null),
    ]);

  // Total Inflow: Campaigns + Direct Gifts
  const totalCampaignInflowKobo = (userCampaigns || []).reduce(
    (acc, c) => acc + (Number(c.current_amount) || 0) * 100,
    0,
  );

  const totalDirectInflowKobo = (txs || []).reduce((acc, t) => {
    if (
      (t.type === 'creator_support' || t.type === 'receipt') &&
      t.status === 'success'
    ) {
      return acc + Number(t.amount);
    }
    return acc;
  }, 0);

  const totalInflowKobo = totalCampaignInflowKobo + totalDirectInflowKobo;

  // Total Withdrawn (settled)
  const totalWithdrawnKobo = (txs || []).reduce((acc, t) => {
    if (t.type === 'withdrawal' && t.status === 'success') {
      return acc + Number(t.amount);
    }
    if (t.type === 'fee' && t.status === 'success') {
      return acc + Number(t.amount);
    }
    return acc;
  }, 0);

  // Pending Payouts
  const pendingPayoutsKobo = (txs || []).reduce((acc, t) => {
    if (t.type === 'withdrawal' && t.status === 'pending') {
      return acc + Number(t.amount);
    }
    return acc;
  }, 0);

  const balanceKobo = totalInflowKobo - totalWithdrawnKobo - pendingPayoutsKobo;

  return {
    success: true,
    data: {
      balance: balanceKobo / 100, // Convert to major currency unit
      totalInflow: totalInflowKobo / 100,
      pendingPayouts: pendingPayoutsKobo / 100,
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
    // 1. Get bank account recipient_code, currency and user's expected currency
    const [{data: account}, {data: profile}] = await Promise.all([
      supabase
        .from('bank_accounts')
        .select('recipient_code, bank_name, currency')
        .eq('id', bankAccountId)
        .single(),
      supabase.from('profiles').select('country').eq('id', user.id).single(),
    ]);

    if (!account) {
      return {success: false, error: 'Bank account not found'};
    }

    const userCurrency = getCurrencyByCountry(profile?.country);

    // Cross-Border Check: Block if bank account currency doesn't match wallet currency
    if (account.currency !== userCurrency) {
      return {
        success: false,
        error:
          'Payout not supported. Please select a supported payout account.',
      };
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

    // 5. Update campaign total (Use admin client to bypass RLS for non-owners/guests)
    const admin = createAdminClient();
    await admin
      .from('campaigns')
      .update({current_amount: Number(campaign.current_amount) + paidAmount})
      .eq('id', campaign.id);

    revalidatePath(`/campaign/${campaignSlug}`);
    return {success: true};
  } catch (err: any) {
    return {success: false, error: err.message || 'Processing error'};
  }
}

export async function recordCreatorGift({
  reference,
  creatorUsername,
  donorName,
  donorEmail,
  message,
  isAnonymous,
  hideAmount,
  expectedAmount,
  currency,
  giftId,
  giftName,
}: {
  reference: string;
  creatorUsername: string;
  donorName: string;
  donorEmail: string;
  message?: string;
  isAnonymous: boolean;
  hideAmount: boolean;
  expectedAmount: number;
  currency: string;
  giftId?: number | null;
  giftName?: string | null;
}) {
  const supabase = await createClient();

  // 1. Get creator profile ID
  const {data: creator} = await supabase
    .from('profiles')
    .select('id, display_name, email, theme_settings')
    .ilike('username', creatorUsername)
    .single();

  if (!creator) {
    return {success: false, error: 'Creator not found'};
  }

  const metadata = {
    is_direct_gift: true,
    donor_name: donorName,
    donor_email: donorEmail,
    message,
    is_anonymous: isAnonymous,
    hide_amount: hideAmount,
    gift_id: giftId || null,
    gift_name: giftName || null,
  };

  // 1.5. If it's a vendor gift, generate a code and create a campaign
  let giftCode = null;
  if (giftId) {
    const prefix =
      giftName?.split(' ')[1]?.substring(0, 3).toUpperCase() || 'GFT';
    giftCode = `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Create the campaign record for the vendor gift (Use admin client)
    const admin = createAdminClient();
    const {error: campaignError} = await admin.from('campaigns').insert({
      user_id: null, // Unclaimed
      title: giftName || 'Gift Card',
      slug: `${creatorUsername}-gift-${Date.now()}`,
      status: 'active',
      goal_amount: expectedAmount,
      current_amount: expectedAmount, // fully funded
      claimable_type: 'gift-card',
      claimable_gift_id: giftId,
      gift_code: giftCode,
      currency: currency,
      category: 'other',
      visibility: 'private',
      sender_name: isAnonymous ? 'Anonymous' : donorName,
      recipient_email: creator.email,
      message: message,
    });

    if (campaignError) {
      console.error('Error creating campaign for creator gift:', campaignError);
      // We continue anyway, but the vendor flow might be broken for this specific gift
    }
  }

  try {
    // Message-only gift (no payment) — skip Paystack verification
    if (expectedAmount <= 0) {
      const {data: tx, error: txError} = await supabase
        .from('transactions')
        .insert({
          user_id: creator.id,
          amount: 0,
          currency: currency,
          type: 'creator_support',
          status: 'success',
          reference,
          description: giftCode
            ? `Gift: ${giftName} (Code: ${giftCode})`
            : `Message from ${isAnonymous ? 'Anonymous' : donorName}`,
          metadata: {...metadata, gift_code: giftCode},
        })
        .select()
        .single();

      if (txError) {
        if (txError.code === '23505') {
          return {success: false, error: 'Already processed'};
        }
        throw txError;
      }

      // Insert into creator_support metadata table
      const {error: supportError} = await supabase
        .from('creator_support')
        .insert({
          user_id: creator.id,
          transaction_id: tx.id,
          amount: 0,
          currency: currency,
          donor_name: donorName,
          donor_email: donorEmail,
          message,
          is_anonymous: isAnonymous,
          hide_amount: hideAmount,
          gift_id: giftId || null,
          gift_name: giftName || null,
        });

      if (supportError) {
        console.error('Error recording creator support message:', supportError);
        return {
          success: true,
          warning: 'Gift card processed but message could not be saved.',
        };
      }

      // If donor is logged in, record the outbound transaction too
      const {
        data: {user: donor},
      } = await supabase.auth.getUser();
      if (donor) {
        await supabase.from('transactions').insert({
          user_id: donor.id,
          amount: 0,
          currency: currency,
          type: 'creator_support_sent',
          status: 'success',
          reference: `${reference}-out`,
          description: `Gift to ${creatorUsername}`,
          metadata: {...metadata, is_outbound: true},
        });
      }

      revalidatePath(`/u/${creatorUsername}`);
      revalidatePath(`/dashboard`);

      // Send thank-you email if creator is pro and has a custom message
      const creatorPlan = (creator as any)?.theme_settings?.plan;
      const thankYouMsg = (creator as any)?.theme_settings?.proThankYou;
      if (creatorPlan === 'pro' && thankYouMsg && donorEmail) {
        sendThankYouEmail({
          to: donorEmail,
          donorName: isAnonymous ? 'Supporter' : donorName,
          creatorName: (creator as any)?.display_name || creatorUsername,
          creatorUsername,
          thankYouMessage: thankYouMsg,
          giftName: giftName || null,
          amount: 0,
          currency,
        }).catch(e => console.error('Thank-you email failed:', e));
      }

      return {success: true};
    }

    // 2. Verify with Paystack for paid gifts
    const secretKey = process.env.NEXT_PUBLIC_PAYSTACK_SECRET_KEY;
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

    // Verify amount
    const paidAmount = body.data.amount / 100;
    if (paidAmount < expectedAmount) {
      return {success: false, error: 'Incomplete payment amount'};
    }

    // 3. Try inserting transaction and creator support record
    const {data: tx, error: txError} = await supabase
      .from('transactions')
      .insert({
        user_id: creator.id, // The recipient owns the transaction
        amount: body.data.amount,
        currency: body.data.currency || currency,
        type: 'creator_support',
        status: 'success',
        reference,
        description: giftCode
          ? `Gift: ${giftName} (Code: ${giftCode})`
          : `Direct support from ${isAnonymous ? 'Anonymous' : donorName}`,
        metadata: {...metadata, gift_code: giftCode},
      })
      .select()
      .single();

    if (txError) {
      if (txError.code === '23505') {
        return {success: false, error: 'Payment already processed'};
      }
      throw txError;
    }

    // 4. Insert into creator_support metadata table
    const {error: supportError} = await supabase
      .from('creator_support')
      .insert({
        user_id: creator.id,
        transaction_id: tx.id,
        amount: paidAmount,
        currency: body.data.currency || currency,
        donor_name: donorName,
        donor_email: donorEmail,
        message,
        is_anonymous: isAnonymous,
        hide_amount: hideAmount,
        gift_id: giftId || null,
        gift_name: giftName || null,
      });

    if (supportError) {
      console.error('Error recording creator support:', supportError);
      return {
        success: true,
        warning: 'Payment successful but donor details could not be saved.',
      };
    }

    // 5. If donor is logged in, record the outbound transaction too
    const {
      data: {user: donor},
    } = await supabase.auth.getUser();
    if (donor) {
      await supabase.from('transactions').insert({
        user_id: donor.id,
        amount: body.data.amount,
        currency: body.data.currency || currency,
        type: 'creator_support_sent',
        status: 'success',
        reference: `${reference}-out`,
        description: `Gift to ${creatorUsername}`,
        metadata: {...metadata, is_outbound: true},
      });
    }

    revalidatePath(`/u/${creatorUsername}`);
    revalidatePath(`/dashboard`);

    // Send thank-you email if creator is pro and has a custom message
    const creatorPlan = (creator as any)?.theme_settings?.plan;
    const thankYouMsg = (creator as any)?.theme_settings?.proThankYou;
    if (creatorPlan === 'pro' && thankYouMsg && donorEmail) {
      sendThankYouEmail({
        to: donorEmail,
        donorName: isAnonymous ? 'Supporter' : donorName,
        creatorName: (creator as any)?.display_name || creatorUsername,
        creatorUsername,
        thankYouMessage: thankYouMsg,
        giftName: giftName || null,
        amount: paidAmount,
        currency: body.data.currency || currency,
      }).catch(e => console.error('Thank-you email failed:', e));
    }

    return {success: true};
  } catch (err: any) {
    return {success: false, error: err.message || 'Processing error'};
  }
}

export async function recordShopGiftPurchase({
  reference,
  recipientEmail,
  senderName,
  message,
  giftId,
  giftName,
  expectedAmount,
  currency,
}: {
  reference: string;
  recipientEmail: string;
  senderName: string;
  message?: string;
  giftId: number;
  giftName: string;
  expectedAmount: number;
  currency: string;
}) {
  const supabase = await createClient();

  // 1. Verify with Paystack
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

    // Verify amount
    const paidAmount = body.data.amount / 100;
    if (paidAmount < expectedAmount) {
      return {success: false, error: 'Incomplete payment amount'};
    }

    // 2. Get Vendor ID from Gift
    const {data: gift} = await supabase
      .from('vendor_gifts')
      .select('vendor_id, image_url')
      .eq('id', giftId)
      .single();

    if (!gift) return {success: false, error: 'Gift product not found'};

    // Fetch vendor shop name for the email
    const {data: vendorProfile} = await supabase
      .from('profiles')
      .select('shop_name, display_name')
      .eq('id', gift.vendor_id)
      .single();
    const vendorShopName =
      vendorProfile?.shop_name ||
      vendorProfile?.display_name ||
      'Gifthance Partner';

    // 3. Generate a Unique Gift Code
    let giftCode = generateGiftCode();
    let isUnique = false;

    // Safety loop to ensure the code is absolutely unique
    while (!isUnique) {
      const {data: existing} = await supabase
        .from('campaigns')
        .select('id')
        .eq('gift_code', giftCode)
        .maybeSingle();

      if (!existing) {
        isUnique = true;
      } else {
        // Generate a new one if it somehow collided
        giftCode = generateGiftCode();
      }
    }
    // We are setting user_id to vendor_id so they can see it as "Pending Claim"
    // Use admin client to bypass RLS for guest/non-owner purchases
    const admin = createAdminClient();
    const {error: campaignError} = await admin.from('campaigns').insert({
      user_id: gift.vendor_id,
      title: giftName,
      slug: `gift-${giftCode.toLowerCase()}-${Date.now()}`,
      status: 'active',
      goal_amount: expectedAmount,
      current_amount: expectedAmount,
      claimable_type: 'gift-card',
      claimable_gift_id: giftId,
      gift_code: giftCode,
      currency: currency,
      category: 'other',
      visibility: 'private',
      recipient_email: recipientEmail,
      sender_name: senderName,
      message: message,
    });

    if (campaignError) throw campaignError;

    // 5. Record Transaction for Buyer (if logged in)
    const {
      data: {user: buyer},
    } = await supabase.auth.getUser();
    await supabase.from('transactions').insert({
      user_id: buyer?.id || null, // Buyer's ID or null for guests
      amount: body.data.amount,
      currency: body.data.currency || currency,
      type: 'creator_support_sent', // Existing type used for sent gifts
      status: 'success',
      reference,
      description: `Gift: ${giftName} for ${recipientEmail}`,
      metadata: {
        gift_code: giftCode,
        recipient_email: recipientEmail,
        sender_name: senderName,
        message,
        gift_id: giftId,
      },
    });

    // 6. Send Email!
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const claimUrl = `${siteUrl}/claim/${giftCode}`;

    // Import the sendGiftEmail action dynamically to avoid circular or early execution if needed
    // or just import it at top.
    const {sendGiftEmail} = await import('./email');

    console.log('Sending gift email for:', giftName);

    await sendGiftEmail({
      to: recipientEmail,
      senderName,
      vendorShopName,
      giftName,
      giftAmount: expectedAmount,
      message,
      claimUrl,
    });

    return {success: true, giftCode};
  } catch (err: any) {
    console.error('Error recording shop gift:', err);
    return {success: false, error: err.message};
  }
}
