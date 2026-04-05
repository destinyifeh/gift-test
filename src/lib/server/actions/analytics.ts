'use server';

import {getCurrencyByCountry} from '@/lib/constants/currencies';
import {createAdminClient} from '../supabase/admin';
import {createClient} from '@/lib/server/supabase/server';
import {TX_CAMPAIGN_CONTRIBUTION, TX_CREATOR_SUPPORT} from './constants';

export async function fetchDashboardAnalytics() {
  const supabase = await createClient();
  const {
    data: {user},
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      error: 'Not authenticated',
      data: null,
    };
  }

  try {
    // 1. Fetch Gifts Sent & Total Given (Outbound activities including redemptions)
    const {data: outTxs} = await supabase
      .from('transactions')
      .select(
        'id, amount, status, created_at, description, type, user_id, campaigns(category, claimable_type)',
      )
      .eq('user_id', user.id)
      .in('type', [
        TX_CAMPAIGN_CONTRIBUTION,
        'gift_redemption',
        'flex_card_redemption'
      ])
      .order('created_at', {ascending: false})
      .limit(10);

    const giftsSentCount = (outTxs || []).filter(
      t => t.status === 'success' && t.type === TX_CAMPAIGN_CONTRIBUTION,
    ).length;
    
    const totalGivenKobo = (outTxs || []).reduce((acc, t) => {
      if (t.status === 'success' && t.type === TX_CAMPAIGN_CONTRIBUTION) return acc + Number(t.amount);
      return acc;
    }, 0);

    // 2. Fetch User's Campaigns Count & Inbound donations (exclude gift-card entries)
    const {data: userCampaigns} = await supabase
      .from('campaigns')
      .select('id, title')
      .eq('user_id', user.id)
      .is('gift_code', null);

    const campaignIds = (userCampaigns || []).map(c => c.id);
    const campaignsCount = campaignIds.length;

    // 3. Fetch direct support received (creator_support table)
    const {data: directSupport} = await supabase
      .from('creator_support')
      .select('id, amount, created_at, donor_name, gift_name')
      .eq('user_id', user.id)
      .order('created_at', {ascending: false})
      .limit(5);

    const directRecent = (directSupport || []).slice(0, 5).map(s => ({
      id: s.id,
      name: s.gift_name
        ? `🎁 ${s.gift_name} from ${s.donor_name}`
        : `Gift from ${s.donor_name}`,
      date: new Date(s.created_at).toLocaleDateString(),
      status: 'success',
      type: 'direct',
    }));

    // 4. Fetch vendor gift cards received (campaigns with gift_code)
    // ONLY include claimed or redeemed gifts in the analytics stats
    const {data: vendorGiftCampaigns} = await supabase
      .from('campaigns')
      .select('id, title, created_at, sender_name, gift_code, status')
      .eq('user_id', user.id)
      .not('gift_code', 'is', null)
      .neq('status', 'active') // Exclude unclaimed gifts
      .order('created_at', {ascending: false})
      .limit(5);

    const vendorGiftRecent = (vendorGiftCampaigns || []).map(c => ({
      id: 'vgift-' + c.id,
      name: `🎁 ${c.title} from ${c.sender_name || 'Someone'}`,
      date: new Date(c.created_at).toLocaleDateString(),
      status:
        c.status === 'redeemed'
          ? 'redeemed'
          : c.status === 'claimed'
            ? 'claimed'
            : 'pending claim',
      type: 'vendor-gift',
    }));

    // 5. Fetch campaign donations to their campaigns
    let campaignRecent: any[] = [];
    let campaignTotalCount = 0;
    if (campaignIds.length > 0) {
      const {data: inboundContribs} = await supabase
        .from('contributions')
        .select('id, amount, created_at, donor_name, campaigns(title)')
        .in('campaign_id', campaignIds)
        .order('created_at', {ascending: false})
        .limit(5);

      campaignTotalCount = inboundContribs?.length || 0;
      campaignRecent = (inboundContribs || []).slice(0, 5).map(c => ({
        id: c.id,
        name: `Donor: ${c.donor_name}`,
        date: new Date(c.created_at).toLocaleDateString(),
        status: 'success',
        type: 'campaign',
        campaignTitle: (c.campaigns as any)?.title,
      }));
    }

    const giftsReceivedCount =
      (directSupport?.length || 0) +
      (vendorGiftCampaigns?.length || 0) +
      campaignTotalCount;

    const recentReceived = [
      ...directRecent,
      ...vendorGiftRecent,
      ...campaignRecent,
    ]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    const recentSent = (outTxs || []).map(t => {
      let label = t.description;
      if (!label) {
        if (t.type === TX_CAMPAIGN_CONTRIBUTION) label = 'Campaign Contribution';
        else if (t.type === 'gift_redemption') label = 'Gift Redeemed';
        else if (t.type === 'flex_card_redemption') label = 'Flex Card Spent';
        else label = 'Direct Gift';
      }
      
      return {
        id: t.id,
        name: label,
        date: new Date(t.created_at).toLocaleDateString(),
        status: t.status,
        type: t.type as any,
        timestamp: new Date(t.created_at).getTime()
      };
    });

    // 6. Merge Flex Card Transactions (for cards owned by this user)
    const {data: cards} = await supabase
      .from('flex_cards')
      .select('id, code')
      .or(`user_id.eq.${user.id},sender_id.eq.${user.id}`);
    
    const cardIds = (cards || []).map(c => c.id);
    const cardMap = new Map((cards || []).map(c => [c.id, c.code]));

    if (cardIds.length > 0) {
      const {data: flexCardTxs} = await supabase
        .from('flex_card_transactions')
        .select('*, vendor:profiles!flex_card_transactions_vendor_id_fkey(shop_name, display_name)')
        .in('flex_card_id', cardIds)
        .order('created_at', {ascending: false})
        .limit(5);

      (flexCardTxs || []).forEach(ftx => {
        const cardCode = cardMap.get(ftx.flex_card_id);
        // Avoid duplicates if already in outTxs
        const exists = recentSent.some(t => t.type === 'flex_card_redemption' && t.id.toString().includes(ftx.id.toString()));
        if (!exists) {
          recentSent.push({
            id: `fc-tx-${ftx.id}`,
            name: ftx.description || `Spent with Flex Card ${cardCode || ''}`,
            date: new Date(ftx.created_at).toLocaleDateString(),
            status: 'success',
            type: 'flex_card_redemption' as any,
            timestamp: new Date(ftx.created_at).getTime()
          });
        }
      });
    }

    // Final sort and slice for sent/recent activities
    recentSent.sort((a, b) => b.timestamp - a.timestamp);
    const finalSent = recentSent.slice(0, 5);

    return {
      success: true,
      data: {
        giftsSent: giftsSentCount,
        giftsReceived: giftsReceivedCount,
        totalGiven: totalGivenKobo / 100,
        campaignsCount: campaignsCount || 0,
        recentActivity: {
          sent: finalSent,
          received: recentReceived,
        },
      },
    };
  } catch (err: any) {
    console.error('Analytics Error:', err);
    return {
      success: false,
      error: err.message || 'Failed to fetch analytics',
      data: null,
    };
  }
}

export async function fetchMyContributions({
  pageParam = 0,
}: {pageParam?: number} = {}) {
  const limit = 10;
  const supabase = await createClient();
  const {
    data: {user},
  } = await supabase.auth.getUser();

  if (!user) return {success: false, data: []};

  try {
    const {data: txs} = await supabase
      .from('transactions')
      .select(
        `
        id, amount, currency, created_at,
        campaign_id,
        campaigns (
          id, title, current_amount, goal_amount, currency
        )
      `,
      )
      .eq('user_id', user.id)
      .eq('type', TX_CAMPAIGN_CONTRIBUTION)
      .eq('status', 'success')
      .order('created_at', {ascending: false});

    if (!txs || txs.length === 0) return {success: true, data: []};

    // Count contributors for those campaigns
    const campaignIds = [
      ...new Set(txs.map((t: any) => t.campaign_id).filter(Boolean)),
    ];
    let contributorCounts: Record<string, number> = {};

    if (campaignIds.length > 0) {
      const {data: contribs} = await supabase
        .from('contributions')
        .select('campaign_id')
        .in('campaign_id', campaignIds);

      (contribs || []).forEach(c => {
        if (c.campaign_id) {
          contributorCounts[c.campaign_id] =
            (contributorCounts[c.campaign_id] || 0) + 1;
        }
      });
    }

    // Group multiple donations the user made to the same campaign
    const grouped: Record<string, any> = {};

    txs.forEach((t: any) => {
      const camp = t.campaigns;
      if (!camp) return;
      const campId = camp.id;

      if (!grouped[campId]) {
        const goal = Number(camp.goal_amount) || 0;
        const current = Number(camp.current_amount) || 0;
        const progress = goal > 0 ? (current / goal) * 100 : 0;

        grouped[campId] = {
          id: campId,
          campaign: camp.title,
          contributors: contributorCounts[campId] || 0,
          progress,
          contributed: 0,
          goal,
          current_amount: current,
          currency: camp.currency || t.currency || 'USD',
        };
      }
      grouped[campId].contributed += Number(t.amount) / 100;
    });

    const groupedArray = Object.values(grouped);
    const start = pageParam * limit;
    const paginated = groupedArray.slice(start, start + limit);

    return {
      success: true,
      data: paginated,
      nextPage: start + limit < groupedArray.length ? pageParam + 1 : undefined,
    };
  } catch (err: any) {
    console.error('fetchMyContributions Error:', err);
    return {success: false, error: err.message, data: []};
  }
}

export async function fetchSentGiftsList({
  pageParam = 0,
}: {pageParam?: number} = {}) {
  const limit = 10;
  const from = pageParam * limit;
  const to = from + limit - 1;
  const supabase = await createClient();
  const {
    data: {user},
  } = await supabase.auth.getUser();

  if (!user) return {success: false, data: []};

  try {
    const {data: txs} = await supabase
      .from('transactions')
      .select(
        `
        id, amount, currency, created_at, status, description, type,
        campaigns ( id, title, category, claimable_type, profiles!campaigns_user_id_fkey ( display_name ) )
      `,
      )
      .eq('user_id', user.id)
      .in('type', [TX_CAMPAIGN_CONTRIBUTION])
      .order('created_at', {ascending: false})
      .range(from, to);

    if (!txs) return {success: true, data: []};

    const formatted = txs.map((t: any) => ({
      id: t.id,
      name:
        t.campaigns?.title ||
        (t.description?.startsWith('Gift:')
          ? t.description
              .split(':')[1]
              .split(' to ')[0]
              .split(' for ')[0]
              .trim()
          : t.description) ||
        'Personal Gift',
      recipient: t.description?.startsWith('Gift')
        ? t.description.includes(' to ')
          ? t.description.split(' to ')[1]
          : t.description.includes(' for ')
            ? t.description.split(' for ')[1]
            : t.campaigns?.profiles?.display_name || 'Creator'
        : t.campaigns?.profiles?.display_name || t.description || 'Creator',
      giftType: t.campaigns
        ? t.campaigns.claimable_type === 'gift-card'
          ? 'Prepaid Gift Card'
          : t.campaigns.category === 'claimable' ||
              t.campaigns.category === 'gift-received'
            ? 'Claimable Cash Gift'
            : 'Campaign Contribution'
        : 'Direct Support',
      date: new Date(t.created_at).toLocaleDateString(),
      amount: Number(t.amount) / 100,
      currency: t.currency || 'USD',
      status: t.status,
    }));

    return {
      success: true,
      data: formatted,
      nextPage: formatted.length === limit ? pageParam + 1 : undefined,
    };
  } catch (err: any) {
    console.error('fetchSentGiftsList Error:', err);
    return {success: false, error: err.message, data: []};
  }
}

export async function fetchMyGiftsList({
  pageParam = 0,
}: {pageParam?: number} = {}) {
  const limit = 10;
  const from = pageParam * limit;
  const to = from + limit - 1;
  const supabase = await createClient();
  const {
    data: {user},
  } = await supabase.auth.getUser();

  if (!user) return {success: false, data: []};

  try {
    // Fetch campaigns with basic fields first
    const {data: allCampaigns, error: campaignsError} = await supabase
      .from('campaigns')
      .select(
        'id, title, goal_amount, currency, created_at, gift_code, sender_name, status, vendor_rating, claimable_gift_id, recipient_email, user_id, claimable_type, message'
      )
      .or(`user_id.eq.${user.id},recipient_email.eq.${user.email}`);

    const campaigns = allCampaigns || [];

    // Get unique claimable_gift_ids to fetch vendor info
    const giftIds = campaigns
      .map(c => c.claimable_gift_id)
      .filter((id): id is number => id !== null && id !== undefined && Number(id) > 0)
      .map(id => Number(id));

    // Fetch vendor gift info with profiles
    const vendorMap: Record<number, any> = {};
    if (giftIds.length > 0) {
      const {data: vendorGifts, error: vendorError} = await supabase
        .from('vendor_gifts')
        .select(`
          id, name, image_url, vendor_id,
          profiles!vendor_gifts_vendor_id_fkey(
            shop_name, shop_slug, shop_address, shop_logo_url, display_name, username
          )
        `)
        .in('id', giftIds);

      if (vendorGifts) {
        vendorGifts.forEach((vg: any) => {
          const profile = Array.isArray(vg.profiles) ? vg.profiles[0] : vg.profiles;
          vendorMap[Number(vg.id)] = {
            name: vg.name,
            imageUrl: vg.image_url,
            vendorId: vg.vendor_id,
            shopName: profile?.shop_name || profile?.display_name || profile?.username,
            shopSlug: profile?.shop_slug || profile?.username,
            shopAddress: profile?.shop_address,
            shopLogo: profile?.shop_logo_url,
          };
        });
      }
    }

    const voucherGifts = (campaigns || [])
      .filter(c => {
        // Include unclaimed/pending gifts too so they show up in "My Gifts"
        if (c.gift_code === null) return false;

        // Ensure user is the intended recipient if not yet claimed
        if (c.status === 'active' && c.recipient_email !== user.email && c.user_id !== user.id) return false;

        return true;
      })
      .map((c: any) => {
        // Get vendor info from vendorMap using claimable_gift_id
        const vendorInfo = c.claimable_gift_id ? vendorMap[Number(c.claimable_gift_id)] : null;

        return {
          id: 'gift-' + c.id,
          name: c.title || vendorInfo?.name || (c.claimable_type === 'money' ? 'Cash Gift' : 'Gift Card'),
          sender: c.sender_name || 'A Friend',
          date: new Date(c.created_at).toLocaleDateString(),
          timestamp: new Date(c.created_at).getTime(),
          amount: Number(c.goal_amount),
          currency: c.currency || 'NGN',
          status:
            c.status === 'redeemed'
              ? 'redeemed'
              : c.status === 'claimed'
                ? 'claimed'
                : c.status === 'active'
                  ? 'pending-claim'
                  : 'unclaimed',
          code: c.gift_code,
          rating: c.vendor_rating || 0,
          type: 'gift',
          claimable_type: c.claimable_type,
          claimable_gift_id: c.claimable_gift_id,
          gift_code: c.gift_code,
          imageUrl: vendorInfo?.imageUrl,
          vendorId: vendorInfo?.vendorId,
          vendorShopName: vendorInfo?.shopName,
          vendorShopSlug: vendorInfo?.shopSlug,
          vendorAddress: vendorInfo?.shopAddress,
          vendorLogo: vendorInfo?.shopLogo,
          vendorSlug: vendorInfo?.shopSlug,
          message: c.message,
        };
      });

    const paginated = voucherGifts
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(from, from + limit);

    return {
      success: true,
      data: paginated,
      nextPage: paginated.length === limit ? pageParam + 1 : undefined,
    };
  } catch (err: any) {
    console.error('fetchMyGiftsList Error:', err);
    return {success: false, error: err.message, data: []};
  }
}

export async function fetchReceivedGiftsList({
  pageParam = 0,
}: {pageParam?: number} = {}) {
  const limit = 10;
  const from = pageParam * limit;
  const to = from + limit - 1;
  const supabase = await createClient();
  const {
    data: {user},
  } = await supabase.auth.getUser();

  if (!user) return {success: false, data: []};

  try {
    const {data: allCampaigns} = await supabase
      .from('campaigns')
      .select('id, user_id, gift_code')
      .eq('user_id', user.id);
      
    const crowdfundingCampaignIds = (allCampaigns || [])
      .filter(c => c.gift_code === null)
      .map(c => c.id);

    const {data: support} = await supabase
      .from('creator_support')
      .select(
        'id, amount, currency, created_at, donor_name, donor_email, is_anonymous, message, gift_name, vendor_rating',
      )
      .eq('user_id', user.id)
      .order('created_at', {ascending: false}); // We'll combine and paginate after

    let campaignContribs: any[] = [];
    if (crowdfundingCampaignIds.length > 0) {
      const {data: contribs} = await supabase
        .from('contributions')
        .select(
          `id, amount, currency, created_at, donor_name, is_anonymous, message, campaigns ( title )`,
        )
        .in('campaign_id', crowdfundingCampaignIds)
        .order('created_at', {ascending: false});

      campaignContribs = (contribs || []).map((c: any) => ({
        id: 'contrib-' + c.id,
        name: 'Campaign Contribution',
        campaign: c.campaigns?.title || 'Unknown Campaign',
        sender: c.is_anonymous ? 'Anonymous' : c.donor_name || 'Guest Donor',
        date: new Date(c.created_at).toLocaleDateString(),
        timestamp: new Date(c.created_at).getTime(),
        amount: Number(c.amount),
        currency: c.currency || 'USD',
        status: 'success',
        message: c.message,
      }));
    }

    const directFormatted = (support || []).map((s: any) => ({
      id: s.id,
      name: s.gift_name ? `Gift: ${s.gift_name}` : 'Personal Support',
      sender: s.is_anonymous ? 'Anonymous' : s.donor_name || 'Supporter',
      date: new Date(s.created_at).toLocaleDateString(),
      timestamp: new Date(s.created_at).getTime(),
      amount: Number(s.amount),
      currency: s.currency || 'NGN',
      status: 'success',
      message: s.message,
      rating: s.vendor_rating || 0,
      claimable_type: 'money',
    }));

    const combined = campaignContribs
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(from, from + limit);

    return {
      success: true,
      data: combined,
      nextPage: combined.length === limit ? pageParam + 1 : undefined,
    };
  } catch (err: any) {
    console.error('fetchReceivedGiftsList Error:', err);
    return {success: false, error: err.message, data: []};
  }
}

/**
 * Fetch supporters (inbound gifts/receipts) for a given creator username.
 * Used by the public creator page (/u/[username]) and dashboard SupportersTab.
 */
export async function fetchCreatorSupporters({
  username,
  pageParam = 0,
}: {
  username: string;
  pageParam?: number;
}) {
  const limit = 10;
  const from = pageParam * limit;
  const to = from + limit - 1;
  const supabase = await createClient();

  try {
    // 1. Get the creator's profile ID
    const {data: creator} = await supabase
      .from('profiles')
      .select('id')
      .ilike('username', username)
      .single();

    if (!creator) {
      return {success: true, data: [], totalReceived: 0, totalSupporters: 0};
    }

    // 2. Primary source: transactions table (type=creator_support) — this is where
    // recordCreatorGift stores the actual gift data for the creator's page.
    const {data: allDirectTxs} = await supabase
      .from('transactions')
      .select('id, amount, created_at, metadata, description, currency')
      .eq('user_id', creator.id)
      .eq('type', TX_CREATOR_SUPPORT)
      .eq('status', 'success')
      .order('created_at', {ascending: false});

    // Filter out claimed monetary gifts (these are self-claims via the claim flow)
    const filteredTxs = (allDirectTxs || []).filter(t => {
      const desc = t.description || '';
      return !desc.startsWith('Claimed');
    });

    // Fetch ALL creator_support metadata for this creator to get real amounts
    // (gift card txs have amount=0 in transactions, real amount is in creator_support)
    const txIdsAll = filteredTxs.map(t => t.id);
    const {data: allSupportMeta} =
      txIdsAll.length > 0
        ? await supabase
            .from('creator_support')
            .select(
              'transaction_id, amount, donor_name, donor_email, message, is_anonymous, hide_amount, gift_name',
            )
            .in('transaction_id', txIdsAll)
        : {data: []};

    const allMetaMap = new Map(
      (allSupportMeta || []).map(m => [m.transaction_id, m]),
    );

    // Helper: get the real amount for a transaction (prefer creator_support amount)
    const getRealAmount = (t: any) => {
      const meta = allMetaMap.get(t.id);
      if (meta && Number(meta.amount) > 0) return Number(meta.amount);
      return Number(t.amount) / 100;
    };

    // 3. Calculate total received using real amounts
    const totalReceived = filteredTxs.reduce(
      (acc, t) => acc + getRealAmount(t),
      0,
    );
    const totalSupporters = filteredTxs.length;

    // 4. Paginate and format the list
    const paginatedTxs = filteredTxs.slice(from, from + limit);

    const formatted = paginatedTxs.map((t: any) => {
      const meta = allMetaMap.get(t.id);
      const isAnon = meta?.is_anonymous || t.metadata?.is_anonymous || false;
      const donorName =
        meta?.donor_name ||
        t.metadata?.donor_name ||
        t.description
          ?.replace('Direct support from ', '')
          ?.replace('Message from ', '') ||
        'Supporter';

      return {
        id: t.id,
        name: isAnon ? 'Anonymous' : donorName,
        amount: getRealAmount(t),
        currency: t.currency || 'NGN',
        message: meta?.message || t.metadata?.message || '',
        date: new Date(t.created_at).toLocaleDateString(),
        anonymous: isAnon,
        hideAmount: meta?.hide_amount || t.metadata?.hide_amount || false,
        giftName: meta?.gift_name || t.metadata?.gift_name || null,
        source: 'Supporter' as const,
        campaignTitle: null,
      };
    });

    return {
      success: true,
      data: formatted,
      totalReceived,
      totalSupporters,
      nextPage: paginatedTxs.length === limit ? pageParam + 1 : undefined,
    };
  } catch (err: any) {
    console.error('fetchCreatorSupporters Error:', err);
    return {
      success: false,
      error: err.message,
      data: [],
      totalReceived: 0,
      totalSupporters: 0,
    };
  }
}

/**
 * Fetch paginated contributions for a specific campaign (by slug).
 * Used by the campaign detail page.
 */
export async function fetchCampaignContributions({
  slug,
  pageParam = 0,
}: {
  slug: string;
  pageParam?: number;
}) {
  const limit = 10;
  const from = pageParam * limit;
  const to = from + limit - 1;
  const supabase = await createClient();

  try {
    const {data: campaign} = await supabase
      .from('campaigns')
      .select('id, currency')
      .eq('campaign_short_id', slug)
      .single();

    if (!campaign) {
      return {success: true, data: []};
    }

    const {data: contribs} = await supabase
      .from('contributions')
      .select(
        'id, amount, currency, donor_name, is_anonymous, message, created_at, hide_amount',
      )
      .eq('campaign_id', campaign.id)
      .order('created_at', {ascending: false})
      .range(from, to);

    const formatted = (contribs || []).map((c: any) => ({
      id: c.id,
      donor_name: c.is_anonymous ? 'Anonymous' : c.donor_name || 'Guest',
      is_anonymous: c.is_anonymous,
      amount: Number(c.amount),
      currency: c.currency || campaign.currency || 'NGN',
      message: c.message || '',
      hide_amount: c.hide_amount,
      created_at: c.created_at,
    }));

    return {
      success: true,
      data: formatted,
      nextPage: formatted.length === limit ? pageParam + 1 : undefined,
    };
  } catch (err: any) {
    console.error('fetchCampaignContributions Error:', err);
    return {success: false, error: err.message, data: []};
  }
}
export async function fetchCreatorAnalytics({username}: {username: string}) {
  const supabase = await createClient();

  try {
    // 1. Get creator profile
    const {data: creator} = await supabase
      .from('profiles')
      .select('id, country')
      .ilike('username', username)
      .single();

    if (!creator) {
      return {success: false, error: 'Creator not found'};
    }

    // 2. Get total received and supporters (Reuse logic or call)
    const supportersRes = await fetchCreatorSupporters({username});
    if (!supportersRes.success) return supportersRes;

    // 3. Fetch last 7 days of successful inbound transactions
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Get campaigns first to find inbound contributions
    const {data: userCampaigns} = await supabase
      .from('campaigns')
      .select('id')
      .eq('user_id', creator.id);

    const campaignIds = (userCampaigns || []).map(c => c.id);

    const [{data: directTxs}, {data: campaignContribs}] = await Promise.all([
      // Direct gifts
      supabase
        .from('transactions')
        .select('amount, created_at')
        .eq('user_id', creator.id)
        .eq('type', TX_CREATOR_SUPPORT)
        .eq('status', 'success')
        .gte('created_at', sevenDaysAgo.toISOString()),
      // Campaign contributions
      campaignIds.length > 0
        ? supabase
            .from('contributions')
            .select('amount, created_at')
            .in('campaign_id', campaignIds)
            .gte('created_at', sevenDaysAgo.toISOString())
        : Promise.resolve({data: []}),
    ]);

    // 4. Group by date for the chart
    const dailyData: Record<string, {date: string; gifts: number}> = {};

    // Initialize last 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      dailyData[dateStr] = {date: dateStr, gifts: 0};
    }

    // Sum direct gifts
    (directTxs || []).forEach(tx => {
      const dateStr = new Date(tx.created_at).toISOString().split('T')[0];
      if (dailyData[dateStr]) {
        dailyData[dateStr].gifts += 1;
      }
    });

    // Sum campaign contributions
    (campaignContribs || []).forEach(c => {
      const dateStr = new Date(c.created_at).toISOString().split('T')[0];
      if (dailyData[dateStr]) {
        dailyData[dateStr].gifts += 1;
      }
    });

    return {
      success: true,
      data: {
        totalReceived: supportersRes.totalReceived,
        totalSupporters: supportersRes.totalSupporters,
        chartData: Object.values(dailyData),
        currency: getCurrencyByCountry(creator.country),
      },
    };
  } catch (err: any) {
    console.error('Analytics Error:', err);
    return {success: false, error: err.message};
  }
}

/**
 * Fetches gifts sent to the user's email that haven't been claimed yet.
 * Uses the admin client to bypass RLS for email-based discovery.
 * Includes both regular gifts (from campaigns) and Flex Cards.
 */
export async function fetchUnclaimedGifts() {
  const supabase = await createClient();
  const {
    data: {user},
  } = await supabase.auth.getUser();

  if (!user?.email) return {success: false, data: [], flexCards: []};

  try {
    const admin = createAdminClient();

    // Fetch unclaimed regular gifts (money or vendor gift cards)
    const {data: unclaimed, error} = await admin
      .from('campaigns')
      .select('id, title, gift_code, sender_name, status, claimable_type, goal_amount, currency')
      .ilike('recipient_email', user.email.trim())
      .not('gift_code', 'is', null)
      .eq('status', 'active');

    // Fetch unclaimed Flex Cards
    const {data: unclaimedFlexCards, error: flexError} = await admin
      .from('flex_cards')
      .select('id, code, claim_token, initial_amount, currency, sender_name, status')
      .ilike('recipient_email', user.email.trim())
      .is('user_id', null) // Not yet claimed
      .eq('status', 'active');

    if (flexError) {
      console.error('Error fetching unclaimed flex cards:', flexError);
    }

    return {
      success: true,
      data: unclaimed || [],
      flexCards: unclaimedFlexCards || [],
    };
  } catch (err: any) {
    console.error('fetchUnclaimedGifts Error:', err);
    return {success: false, error: err.message, data: [], flexCards: []};
  }
}
