'use server';

import {createClient} from '../supabase/server';

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
    // 1. Fetch Gifts Sent & Total Given (Outbound transactions)
    const {data: outTxs} = await supabase
      .from('transactions')
      .select('id, amount, status, created_at, description, type')
      .eq('user_id', user.id)
      .in('type', ['campaign_contribution', 'creator_support'])
      .order('created_at', {ascending: false});

    const giftsSentCount = (outTxs || []).filter(
      t => t.status === 'success',
    ).length;
    const totalGivenKobo = (outTxs || []).reduce((acc, t) => {
      if (t.status === 'success') return acc + Number(t.amount);
      return acc;
    }, 0);

    // 2. Fetch User's Campaigns Count & Inbound donations
    const {data: userCampaigns} = await supabase
      .from('campaigns')
      .select('id, title')
      .eq('user_id', user.id);

    const campaignIds = (userCampaigns || []).map(c => c.id);
    const campaignsCount = campaignIds.length;

    // 3. Fetch direct support received
    const {data: directSupport} = await supabase
      .from('creator_support')
      .select('id, amount, created_at, donor_name')
      .eq('user_id', user.id)
      .order('created_at', {ascending: false});

    const directRecent = (directSupport || []).slice(0, 5).map(s => ({
      id: s.id,
      name: `Gift from ${s.donor_name}`,
      date: new Date(s.created_at).toLocaleDateString(),
      status: 'success',
      type: 'direct',
    }));

    // 4. Fetch campaign donations to their campaigns
    let campaignRecent: any[] = [];
    let campaignCount = 0;
    if (campaignIds.length > 0) {
      const {data: inboundContribs} = await supabase
        .from('contributions')
        .select('id, amount, created_at, donor_name, campaigns(title)')
        .in('campaign_id', campaignIds)
        .order('created_at', {ascending: false});

      campaignCount = inboundContribs?.length || 0;
      campaignRecent = (inboundContribs || []).slice(0, 5).map(c => ({
        id: c.id,
        name: `Donor: ${c.donor_name}`,
        date: new Date(c.created_at).toLocaleDateString(),
        status: 'success',
        type: 'campaign',
        campaignTitle: (c.campaigns as any)?.title,
      }));
    }

    const giftsReceivedCount = (directSupport?.length || 0) + campaignCount;
    const recentReceived = [...directRecent, ...campaignRecent]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    const recentSent = (outTxs || []).slice(0, 5).map(t => ({
      id: t.id,
      name:
        t.description ||
        (t.type === 'campaign_contribution'
          ? 'Campaign Contribution'
          : 'Direct Gift'),
      date: new Date(t.created_at).toLocaleDateString(),
      status: t.status,
    }));

    return {
      success: true,
      data: {
        giftsSent: giftsSentCount,
        giftsReceived: giftsReceivedCount,
        totalGiven: totalGivenKobo / 100,
        campaignsCount: campaignsCount || 0,
        recentActivity: {
          sent: recentSent,
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
      .eq('type', 'campaign_contribution')
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
        campaigns ( id, title, profiles ( display_name ) )
      `,
      )
      .eq('user_id', user.id)
      .in('type', ['campaign_contribution', 'creator_support'])
      .order('created_at', {ascending: false})
      .range(from, to);

    if (!txs) return {success: true, data: []};

    const formatted = txs.map((t: any) => ({
      id: t.id,
      name: t.campaigns?.title || t.description || 'Personal Gift',
      recipient:
        t.campaigns?.profiles?.display_name ||
        t.description?.replace('Gift to ', '') ||
        'Creator',
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
    // 1. Fetch campaigns to get contributions
    const {data: campaigns} = await supabase
      .from('campaigns')
      .select('id, title')
      .eq('user_id', user.id);

    const campaignIds = (campaigns || []).map(c => c.id);

    // 2. Fetch direct support
    const {data: support} = await supabase
      .from('creator_support')
      .select(
        'id, amount, currency, created_at, donor_name, donor_email, is_anonymous, message, gift_name',
      )
      .eq('user_id', user.id)
      .order('created_at', {ascending: false})
      .range(from, to);

    // 3. Fetch campaign contributions
    let campaignContribs: any[] = [];
    if (campaignIds.length > 0) {
      const {data: contribs} = await supabase
        .from('contributions')
        .select(
          `
          id, amount, currency, created_at, donor_name, is_anonymous, message,
          campaigns ( title )
        `,
        )
        .in('campaign_id', campaignIds)
        .order('created_at', {ascending: false})
        .range(from, to);

      campaignContribs = (contribs || []).map((c: any) => ({
        id: 'contrib-' + c.id,
        name: 'Campaign Contribution',
        campaign: c.campaigns?.title || 'Unknown Campaign',
        sender: c.is_anonymous ? 'Anonymous' : c.donor_name || 'Guest Donor',
        date: new Date(c.created_at).toLocaleDateString(),
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
      amount: Number(s.amount),
      currency: s.currency || 'NGN',
      status: 'success',
      message: s.message,
    }));

    const combined = [...directFormatted, ...campaignContribs]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);

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

    // 2. Get user's campaigns
    const {data: userCampaigns} = await supabase
      .from('campaigns')
      .select('id, current_amount')
      .eq('user_id', creator.id);

    const campaignIds = (userCampaigns || []).map(c => c.id);
    const campaignTotal = (userCampaigns || []).reduce(
      (acc, c) => acc + (Number(c.current_amount) || 0),
      0,
    );

    // 3. Sum total received from direct gifts (new type)
    const {data: allReceipts} = await supabase
      .from('transactions')
      .select('amount')
      .eq('user_id', creator.id)
      .in('type', ['receipt', 'creator_support'])
      .eq('status', 'success');

    const totalReceivedDirect = (allReceipts || []).reduce(
      (acc, t) => acc + Number(t.amount) / 100,
      0,
    );

    // 4. Count total supporters
    const {count: receiptCount} = await supabase
      .from('creator_support')
      .select('id', {count: 'exact', head: true})
      .eq('user_id', creator.id);

    // For backward compatibility (legacy metadata-only gifts)
    const {count: legacyCount} = await supabase
      .from('transactions')
      .select('id', {count: 'exact', head: true})
      .eq('user_id', creator.id)
      .eq('type', 'receipt')
      .eq('status', 'success');

    let contribCount = 0;
    if (campaignIds.length > 0) {
      const {count} = await supabase
        .from('contributions')
        .select('id', {count: 'exact', head: true})
        .in('campaign_id', campaignIds);
      contribCount = count || 0;
    }

    // 5. Fetch paginated data — merge direct support + campaign contributions
    const {data: supportData} = await supabase
      .from('creator_support')
      .select('*')
      .eq('user_id', creator.id)
      .order('created_at', {ascending: false})
      .range(from, to);

    const supportFormatted = (supportData || []).map((s: any) => ({
      id: s.id,
      name: s.is_anonymous ? 'Anonymous' : s.donor_name || 'Supporter',
      amount: Number(s.amount),
      currency: s.currency || 'NGN',
      message: s.message || '',
      date: new Date(s.created_at).toLocaleDateString(),
      anonymous: s.is_anonymous,
      hideAmount: s.hide_amount,
      giftName: s.gift_name,
      source: 'Supporter' as const,
      campaignTitle: null,
    }));

    // Campaign contributions
    let campaignContribs: any[] = [];
    if (campaignIds.length > 0 && pageParam === 0) {
      const {data: contribs} = await supabase
        .from('contributions')
        .select(
          'id, amount, currency, donor_name, is_anonymous, message, created_at, hide_amount, campaigns(title)',
        )
        .in('campaign_id', campaignIds)
        .order('created_at', {ascending: false})
        .limit(10);

      campaignContribs = (contribs || []).map((c: any) => ({
        id: 'contrib-' + c.id,
        name: c.is_anonymous ? 'Anonymous' : c.donor_name || 'Guest Donor',
        amount: Number(c.amount),
        currency: c.currency || 'NGN',
        message: c.message || '',
        date: new Date(c.created_at).toLocaleDateString(),
        anonymous: c.is_anonymous,
        hideAmount: c.hide_amount,
        source: 'Donor' as const,
        campaignTitle: (c.campaigns as any)?.title || 'Campaign',
      }));
    }

    const combined = supportFormatted
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);

    return {
      success: true,
      data: combined,
      totalReceived: totalReceivedDirect, // STRICT: Excluding campaign total
      totalSupporters: (receiptCount || 0) + (legacyCount || 0), // STRICT: Excluding campaign contributors
      nextPage: supportFormatted.length === limit ? pageParam + 1 : undefined,
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
      .eq('slug', slug)
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
