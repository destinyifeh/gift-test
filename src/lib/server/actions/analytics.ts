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
      .eq('type', 'campaign_contribution')
      .order('created_at', {ascending: false});

    const giftsSentCount = (outTxs || []).filter(
      t => t.status === 'success',
    ).length;
    const totalGivenKobo = (outTxs || []).reduce((acc, t) => {
      if (t.status === 'success') return acc + Number(t.amount);
      return acc;
    }, 0);

    // 2. Fetch User's Campaigns to get Gifts Received
    const {data: userCampaigns} = await supabase
      .from('campaigns')
      .select('id, title')
      .eq('user_id', user.id);

    const campaignIds = (userCampaigns || []).map(c => c.id);
    const campaignsCount = campaignIds.length;

    let giftsReceivedCount = 0;
    let recentReceived: any[] = [];

    if (campaignIds.length > 0) {
      // Get contributions to these campaigns
      const {data: inboundContribs} = await supabase
        .from('contributions')
        .select('id, amount, created_at, donor_name')
        .in('campaign_id', campaignIds)
        .order('created_at', {ascending: false});

      giftsReceivedCount = inboundContribs?.length || 0;

      recentReceived = (inboundContribs || []).slice(0, 5).map(c => ({
        id: c.id,
        name: `From ${c.donor_name}`,
        date: new Date(c.created_at).toLocaleDateString(),
        status: 'success',
      }));
    }

    const recentSent = (outTxs || []).slice(0, 5).map(t => ({
      id: t.id,
      name: t.description || 'Campaign Contribution',
      date: new Date(t.created_at).toLocaleDateString(),
      status: t.status,
    }));

    return {
      success: true,
      data: {
        giftsSent: giftsSentCount,
        giftsReceived: giftsReceivedCount,
        totalGiven: totalGivenKobo / 100,
        campaignsCount,
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
        id, amount, currency, created_at, status, description,
        campaigns ( id, title, profiles ( display_name ) )
      `,
      )
      .eq('user_id', user.id)
      .eq('type', 'campaign_contribution')
      .order('created_at', {ascending: false})
      .range(from, to);

    if (!txs) return {success: true, data: []};

    const formatted = txs.map((t: any) => ({
      id: t.id,
      name: t.campaigns?.title || t.description || 'Campaign Contribution',
      recipient: t.campaigns?.profiles?.display_name || 'Campaign Creator',
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
    const {data: campaigns} = await supabase
      .from('campaigns')
      .select('id, title')
      .eq('user_id', user.id);

    const campaignIds = (campaigns || []).map(c => c.id);

    if (campaignIds.length === 0) return {success: true, data: []};

    const {data: contribs} = await supabase
      .from('contributions')
      .select(
        `
        id, amount, currency, created_at, donor_name, is_anonymous,
        campaigns ( title ),
        transactions ( status )
      `,
      )
      .in('campaign_id', campaignIds)
      .order('created_at', {ascending: false})
      .range(from, to);

    if (!contribs) return {success: true, data: []};

    const formatted = contribs.map((c: any) => ({
      id: c.id,
      name: 'Contribution',
      campaign: c.campaigns?.title || 'Unknown Campaign',
      sender: c.is_anonymous ? 'Anonymous' : c.donor_name || 'Guest Donor',
      date: new Date(c.created_at).toLocaleDateString(),
      amount: Number(c.amount),
      currency: c.currency || 'USD',
      status: c.transactions?.status || 'success',
    }));

    return {
      success: true,
      data: formatted,
      nextPage: formatted.length === limit ? pageParam + 1 : undefined,
    };
  } catch (err: any) {
    console.error('fetchReceivedGiftsList Error:', err);
    return {success: false, error: err.message, data: []};
  }
}
