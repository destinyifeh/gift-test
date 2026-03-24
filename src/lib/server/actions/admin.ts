'use server';

import {createAdminClient} from '../supabase/admin';
import {createClient} from '../supabase/server';

export async function checkIsAdmin(supabase: any) {
  const {
    data: {user},
  } = await supabase.auth.getUser();
  if (!user) return false;

  const {data: profile} = await supabase
    .from('profiles')
    .select('roles')
    .eq('id', user.id)
    .single();

  return profile?.roles?.includes('admin') || false;
}

export async function fetchAdminUsers({
  search,
  role,
  pageParam = 0,
}: {
  search?: string;
  role?: string;
  pageParam?: number;
} = {}) {
  try {
    const limit = 20;
    const from = pageParam * limit;
    const to = from + limit - 1;

    const supabase = await createClient();
    const isAdmin = await checkIsAdmin(supabase);
    if (!isAdmin) return {success: false, error: 'Unauthorized'};

    let query = supabase
      .from('profiles')
      .select(
        'id, username, display_name, email, avatar_url, country, roles, admin_role, is_creator, updated_at, created_at, status',
      )
      .order('created_at', {ascending: false})
      .range(from, to);

    if (role) {
      query = query.contains('roles', [role]);
    }

    if (search) {
      query = query.or(
        `username.ilike.%${search}%,display_name.ilike.%${search}%,email.ilike.%${search}%`,
      );
    }

    const {data, error} = await query;
    if (error) throw error;

    return {
      success: true,
      data,
      nextPage: data?.length === limit ? pageParam + 1 : undefined,
    };
  } catch (error: any) {
    console.error('Error fetching admin users:', error);
    return {success: false, error: error.message};
  }
}

export async function updateUserRole({
  userId,
  roles,
  adminRole,
}: {
  userId: string;
  roles: string[];
  adminRole: string | null;
}) {
  try {
    const supabase = await createClient();
    const isAdmin = await checkIsAdmin(supabase);
    if (!isAdmin) return {success: false, error: 'Unauthorized'};

    const adminDb = createAdminClient();

    // users must always retain the base 'user' role
    const finalRoles = [...new Set([...roles, 'user'])];

    const {error} = await adminDb
      .from('profiles')
      .update({
        roles: finalRoles,
        admin_role: finalRoles.includes('admin') ? adminRole : null,
      })
      .eq('id', userId);

    if (error) throw error;

    return {success: true};
  } catch (error: any) {
    console.error('Error updating user role:', error);
    return {success: false, error: error.message};
  }
}

export async function fetchAdminDashboardStats(period: string = 'monthly') {
  try {
    const supabase = await createClient();
    const isAdmin = await checkIsAdmin(supabase);
    if (!isAdmin) return {success: false, error: 'Unauthorized'};

    const adminDb = createAdminClient();

    // Basic counts
    const {count: userCount} = await adminDb
      .from('profiles')
      .select('*', {count: 'exact', head: true});

    const {count: campaignCount} = await supabase
      .from('campaigns')
      .select('*', {count: 'exact', head: true})
      .is('gift_code', null);

    // Revenue/Activity data
    const {data: support} = await supabase
      .from('creator_support')
      .select('amount, created_at');
    
    const {data: campaigns} = await supabase
      .from('campaigns')
      .select('current_amount, created_at')
      .is('gift_code', null);

    let totalSupport = 0;
    const monthlyMap: Record<string, number> = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    months.forEach(m => (monthlyMap[m] = 0));

    if (support) {
      support.forEach(s => {
        const amt = parseFloat(s.amount || '0');
        totalSupport += amt;
        if (s.created_at) {
          const date = new Date(s.created_at);
          if (date.getFullYear() === currentYear) {
            monthlyMap[months[date.getMonth()]] += amt;
          }
        }
      });
    }

    if (campaigns) {
      campaigns.forEach(c => {
        const amt = parseFloat(c.current_amount || '0');
        totalSupport += amt;
        if (c.created_at) {
          const date = new Date(c.created_at);
          if (date.getFullYear() === currentYear) {
            monthlyMap[months[date.getMonth()]] += amt;
          }
        }
      });
    }

    const revenueData = months
      .map(month => ({
        month,
        revenue: monthlyMap[month],
      }))
      .filter((_, i) => i <= new Date().getMonth());

    // Top Creators (based on earned amount in creator_support)
    const {data: topCreatorsData} = await supabase
      .from('creator_support')
      .select('user_id, amount')
      .order('amount', {ascending: false});

    const creatorTotals: Record<string, number> = {};
    topCreatorsData?.forEach(s => {
      creatorTotals[s.user_id] = (creatorTotals[s.user_id] || 0) + parseFloat(s.amount || '0');
    });

    const sortedCreators = Object.entries(creatorTotals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    const {data: creatorProfiles} = await supabase
      .from('profiles')
      .select('id, username, display_name')
      .in('id', sortedCreators.map(([id]) => id));

    const topCreators = sortedCreators.map(([id, total]) => {
      const p = creatorProfiles?.find(cp => cp.id === id);
      return {
        id,
        name: p?.display_name || p?.username || 'Unknown',
        total,
      };
    });

    // Top Donors (based on successful transactions of type campaign_contribution/creator_support)
    const {data: donorData} = await supabase
      .from('transactions')
      .select('sender_id, amount')
      .in('type', ['campaign_contribution', 'creator_support'])
      .eq('status', 'success');

    const donorTotals: Record<string, number> = {};
    donorData?.forEach(tx => {
       if (tx.sender_id) {
         donorTotals[tx.sender_id] = (donorTotals[tx.sender_id] || 0) + parseFloat(tx.amount || '0');
       }
    });

    const sortedDonors = Object.entries(donorTotals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    const {data: donorProfiles} = await supabase
      .from('profiles')
      .select('id, username, display_name')
      .in('id', sortedDonors.map(([id]) => id));

    const topDonors = sortedDonors.map(([id, total]) => {
       const p = donorProfiles?.find(dp => dp.id === id);
       return {
         id,
         name: p?.display_name || p?.username || 'Anonymous',
         total,
       };
    });

    // Top Campaigns (based on current_amount)
    const {data: topCampaignsData} = await supabase
      .from('campaigns')
      .select('id, title, current_amount, campaign_short_id, campaign_slug')
      .is('gift_code', null)
      .order('current_amount', {ascending: false})
      .limit(5);

    const topCampaigns = topCampaignsData?.map(c => ({
       id: c.id,
       title: c.title,
       total: parseFloat(c.current_amount || '0'),
       slug: `/campaign/${c.campaign_short_id}/${c.campaign_slug}`,
    })) || [];

    return {
      success: true,
      data: {
        totalUsers: userCount || 0,
        totalCampaigns: campaignCount || 0,
        totalSupport,
        revenueData,
        topCreators,
        topDonors,
        topCampaigns,
      },
    };
  } catch (error: any) {
    console.error('Error fetching admin dashboard stats:', error);
    return {success: false, error: error.message};
  }
}

// Consolidating: version at the bottom is more complete or we prefer a single source.
// I will move the detailed subscription version here and remove the one at the end.
export async function fetchAdminSubscriptions({
  search,
  pageParam = 0,
}: {
  search?: string;
  pageParam?: number;
} = {}) {
  try {
    const limit = 20;
    const from = pageParam * limit;
    const to = from + limit - 1;

    const supabase = await createClient();
    const isAdmin = await checkIsAdmin(supabase);
    if (!isAdmin) return {success: false, error: 'Unauthorized'};

    const adminDb = createAdminClient();

    let query = adminDb
      .from('profiles')
      .select('*')
      .filter('theme_settings->>plan', 'eq', 'pro')
      .order('updated_at', {ascending: false})
      .range(from, to);

    if (search) {
      query = query.or(`username.ilike.%${search}%,display_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const {data, error} = await query;
    if (error) throw error;

    const formattedData = data?.map(d => ({
      ...d,
      plan: 'Pro',
      price: '$8/mo',
      status: 'active',
      started: new Date(d.created_at).toLocaleDateString(),
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    }));

    return {
      success: true,
      data: formattedData,
      nextPage: data?.length === limit ? pageParam + 1 : undefined,
    };
  } catch (error: any) {
    console.error('Error fetching admin subscriptions:', error);
    return {success: false, error: error.message};
  }
}

export async function fetchAdminCampaigns({
  search,
  pageParam = 0,
}: {
  search?: string;
  pageParam?: number;
} = {}) {
  try {
    const limit = 20;
    const from = pageParam * limit;
    const to = from + limit - 1;

    const supabase = await createClient();
    const isAdmin = await checkIsAdmin(supabase);
    if (!isAdmin) return {success: false, error: 'Unauthorized'};

    const adminDb = createAdminClient();

    let query = adminDb
      .from('campaigns')
      .select('*, vendor:profiles!user_id(username, display_name, country, shop_name, shop_address)')
      .is('gift_code', null) // Only show real campaigns, not shop gifts
      .order('created_at', {ascending: false})
      .range(from, to);

    if (search) {
      query = query.ilike('title', `%${search}%`);
    }

    const {data, error} = await query;
    if (error) throw error;

    return {
      success: true,
      data,
      nextPage: data?.length === limit ? pageParam + 1 : undefined,
    };
  } catch (error: any) {
    console.error('Error fetching admin campaigns:', error);
    return {success: false, error: error.message};
  }
}

export async function fetchAdminShopGifts({
  search,
  pageParam = 0,
}: {
  search?: string;
  pageParam?: number;
} = {}) {
  try {
    const limit = 20;
    const from = pageParam * limit;
    const to = from + limit - 1;

    const supabase = await createClient();
    const isAdmin = await checkIsAdmin(supabase);
    if (!isAdmin) return {success: false, error: 'Unauthorized'};

    let query = supabase
      .from('campaigns')
      .select('*, profiles!campaigns_user_id_fkey(username, display_name, country)')
      .not('gift_code', 'is', null) // Only show shop gifts (gift cards, prepaid items)
      .order('created_at', {ascending: false})
      .range(from, to);

    if (search) {
      query = query.ilike('title', `%${search}%`);
    }

    const {data, error} = await query;
    if (error) throw error;

    return {
      success: true,
      data,
      nextPage: data?.length === limit ? pageParam + 1 : undefined,
    };
  } catch (error: any) {
    console.error('Error fetching admin shop gifts:', error);
    return {success: false, error: error.message};
  }
}

export async function updateCampaignAdmin(campaignId: string, updates: any) {
  try {
    const supabase = await createClient();
    const isAdmin = await checkIsAdmin(supabase);
    if (!isAdmin) return {success: false, error: 'Unauthorized'};

    const adminDb = createAdminClient();

    const {error} = await adminDb
      .from('campaigns')
      .update(updates)
      .eq('id', campaignId);

    if (error) throw error;
    return {success: true};
  } catch (error: any) {
    console.error('Error updating campaign admin:', error);
    return {success: false, error: error.message};
  }
}

export async function fetchAdminTransactions({
  search,
  pageParam = 0,
}: {
  search?: string;
  pageParam?: number;
} = {}) {
  try {
    const limit = 30;
    const from = pageParam * limit;
    const to = from + limit - 1;

    const supabase = await createClient();
    const isAdmin = await checkIsAdmin(supabase);
    if (!isAdmin) return {success: false, error: 'Unauthorized'};

    const adminDb = createAdminClient();

    let query = adminDb
      .from('transactions')
      .select(
        '*, sender_profile:profiles!transactions_sender_id_fkey(username), recipient_profile:profiles!transactions_recipient_id_fkey(username)',
      )
      .order('created_at', {ascending: false})
      .range(from, to);

    const {data, error} = await query;
    if (error) throw error;

    return {
      success: true,
      data,
      nextPage: data?.length === limit ? pageParam + 1 : undefined,
    };
  } catch (error: any) {
    return {success: false, error: error.message};
  }
}

export async function fetchAdminWithdrawals({
  search,
  pageParam = 0,
}: {
  search?: string;
  pageParam?: number;
} = {}) {
  try {
    const limit = 20;
    const from = pageParam * limit;
    const to = from + limit - 1;

    const supabase = await createClient();
    const isAdmin = await checkIsAdmin(supabase);
    if (!isAdmin) return {success: false, error: 'Unauthorized'};

    let query = supabase
      .from('transactions')
      .select(
        '*, recipient_profile:profiles!transactions_sender_id_fkey(username)',
      )
      .eq('type', 'withdrawal')
      .order('created_at', {ascending: false})
      .range(from, to);

    const {data, error} = await query;
    if (error) throw error;

    return {
      success: true,
      data,
      nextPage: data?.length === limit ? pageParam + 1 : undefined,
    };
  } catch (error: any) {
    return {success: false, error: error.message};
  }
}

export async function updateTransactionStatus(txId: string, status: string) {
  try {
    const supabase = await createClient();
    const isAdmin = await checkIsAdmin(supabase);
    if (!isAdmin) return {success: false, error: 'Unauthorized'};

    const adminDb = createAdminClient();

    const {error} = await adminDb
      .from('transactions')
      .update({status})
      .eq('id', txId);

    if (error) throw error;
    return {success: true};
  } catch (error: any) {
    return {success: false, error: error.message};
  }
}

export async function fetchAdminWallets({
  search,
  pageParam = 0,
}: {
  search?: string;
  pageParam?: number;
} = {}) {
  try {
    const limit = 20;
    const from = pageParam * limit;
    const to = from + limit - 1;

    const supabase = await createClient();
    const isAdmin = await checkIsAdmin(supabase);
    if (!isAdmin) return {success: false, error: 'Unauthorized'};

    const adminDb = createAdminClient();

    // 1. Fetch paginated profiles (without potentially missing wallet_status)
    let profileQuery = adminDb
      .from('profiles')
      .select('id, username, country')
      .order('username', {ascending: true})
      .range(from, to);

    if (search) {
      profileQuery = profileQuery.ilike('username', `%${search}%`);
    }

    const {data: profiles, error: pError} = await profileQuery;
    if (pError) throw pError;

    if (!profiles || profiles.length === 0) {
      return {success: true, data: [], nextPage: undefined};
    }

    const profileIds = profiles.map(p => p.id);

    // 2. Fetch all relevant money movements for these profiles
    // Creator Support (direct tips)
    const {data: supportData} = await adminDb
      .from('creator_support')
      .select('recipient_id, sender_id, amount')
      .or(`recipient_id.in.(${profileIds.join(',')}),sender_id.in.(${profileIds.join(',')})`)
      .eq('status', 'success');

    // General Transactions (campaign contributions, withdrawals, etc.)
    const {data: txData} = await adminDb
      .from('transactions')
      .select('user_id, amount, type')
      .in('user_id', profileIds)
      .eq('status', 'success');
    const stats = profiles.map((p: any) => {
      // Direct Support
      const receivedSupport = supportData
        ?.filter(s => s.recipient_id === p.id)
        .reduce((acc, s) => acc + parseFloat(s.amount || '0'), 0) || 0;
      const sentSupport = supportData
        ?.filter(s => s.sender_id === p.id)
        .reduce((acc, s) => acc + parseFloat(s.amount || '0'), 0) || 0;

      // Transactions
      const txs = txData?.filter(t => t.user_id === p.id) || [];
      const receiptSum = txs
        .filter(t => t.type === 'receipt')
        .reduce((acc, t) => acc + parseFloat(t.amount || '0'), 0);
      const withdrawalSum = txs
        .filter(t => t.type === 'withdrawal')
        .reduce((acc, t) => acc + parseFloat(t.amount || '0'), 0);
      const contributionSum = txs
        .filter(t => t.type === 'campaign_contribution')
        .reduce((acc, t) => acc + parseFloat(t.amount || '0'), 0);

      // Simple Balance Calculation for display
      const earned = receivedSupport + receiptSum;
      const withdrawn = withdrawalSum + sentSupport + contributionSum;
      const pending = 0; // Simplified for now
      const balance = earned - withdrawn;

      return {
        id: p.id,
        user: p.username,
        country: p.country,
        balance,
        earned,
        withdrawn,
        pending,
        status: (p as any).wallet_status || 'active',
      };
    });

    return {
      success: true,
      data: stats,
      nextPage: profiles.length === limit ? pageParam + 1 : undefined,
    };
  } catch (error: any) {
    console.error('Error fetching admin wallets:', error);
    return {success: false, error: error.message};
  }
}

export async function fetchAdminCreatorGifts({
  search,
  pageParam = 0,
}: {
  search?: string;
  pageParam?: number;
} = {}) {
  try {
    const limit = 20;
    const from = pageParam * limit;
    const to = from + limit - 1;

    const supabase = await createClient();
    const isAdmin = await checkIsAdmin(supabase);
    if (!isAdmin) return {success: false, error: 'Unauthorized'};

    const adminDb = createAdminClient();

    let query = adminDb
      .from('creator_support')
      .select('*, recipient:profiles!recipient_id(*), sender:profiles!sender_id(*)')
      .order('created_at', {ascending: false})
      .range(from, to);

    // If search is provided, we might need a more complex query or filter in JS
    // Since creator_support doesn't have a direct 'title', we'll search by recipient username or donor name
    if (search) {
      query = query.or(`donor_name.ilike.%${search}%`);
    }

    const {data, error} = await query;
    if (error) throw error;

    return {
      success: true,
      data,
      nextPage: data?.length === limit ? pageParam + 1 : undefined,
    };
  } catch (error: any) {
    console.error('Error fetching admin creator gifts:', error);
    return {success: false, error: error.message};
  }
}



export async function fetchAdminVendors({
  search,
  pageParam = 0,
}: {
  search?: string;
  pageParam?: number;
} = {}) {
  try {
    const limit = 20;
    const from = pageParam * limit;
    const to = from + limit - 1;

    const supabase = await createClient();
    const isAdmin = await checkIsAdmin(supabase);
    if (!isAdmin) return {success: false, error: 'Unauthorized'};

    const adminDb = createAdminClient();

    let query = adminDb
      .from('profiles')
      .select('*, campaigns!user_id(current_amount)')
      .contains('roles', ['vendor'])
      .order('created_at', {ascending: false})
      .range(from, to);

    if (search) {
      query = query.or(`username.ilike.%${search}%,display_name.ilike.%${search}%`);
    }

    const {data, error} = await query;
    if (error) throw error;

    const formatted = data.map((v: any) => {
      const campaigns = v.campaigns || [];
      const orders_count = campaigns.length;
      const sales_volume = campaigns.reduce(
        (acc: number, c: any) => acc + parseFloat(c.current_amount || '0'),
        0,
      );
      return {
        ...v,
        orders_count,
        sales_volume,
      };
    });

    return {
      success: true,
      data: formatted,
      nextPage: data?.length === limit ? pageParam + 1 : undefined,
    };
  } catch (error: any) {
    return {success: false, error: error.message};
  }
}

export async function updateVendorStatus(id: string, status: string) {
  try {
    const supabase = await createClient();
    const isAdmin = await checkIsAdmin(supabase);
    if (!isAdmin) return {success: false, error: 'Unauthorized'};

    const adminDb = createAdminClient();
    const {error} = await adminDb.from('profiles').update({status}).eq('id', id);
    if (error) throw error;
    return {success: true};
  } catch (error: any) {
    return {success: false, error: error.message};
  }
}

export async function updateUserSystemStatus(
  id: string,
  updates: {status?: string; suspension_end?: string | null},
) {
  try {
    const supabase = await createClient();
    const isAdmin = await checkIsAdmin(supabase);
    if (!isAdmin) return {success: false, error: 'Unauthorized'};

    const adminDb = createAdminClient();

    const {error} = await adminDb.from('profiles').update(updates).eq('id', id);
    if (error) throw error;

    return {success: true};
  } catch (error: any) {
    return {success: false, error: error.message};
  }
}

export async function updateWalletStatus(id: string, wallet_status: string) {
  try {
    const supabase = await createClient();
    const isAdmin = await checkIsAdmin(supabase);
    if (!isAdmin) return {success: false, error: 'Unauthorized'};

    const adminDb = createAdminClient();
    const {error} = await adminDb
      .from('profiles')
      .update({wallet_status})
      .eq('id', id);

    if (error) throw error;

    return {success: true};
  } catch (error: any) {
    return {success: false, error: error.message};
  }
}



export async function updateVendorShopAdmin(
  userId: string,
  updates: {
    shop_name?: string;
    shop_description?: string;
    shop_address?: string;
    shop_slug?: string;
    shop_logo_url?: string;
  },
) {
  try {
    const supabase = await createClient();
    const isAdmin = await checkIsAdmin(supabase);
    if (!isAdmin) return {success: false, error: 'Unauthorized'};

    const adminDb = createAdminClient();

    // If shop_slug is being updated, check if it's already taken
    if (updates.shop_slug) {
      const {data: existingShop} = await adminDb
        .from('profiles')
        .select('id')
        .eq('shop_slug', updates.shop_slug.toLowerCase())
        .neq('id', userId)
        .maybeSingle();

      if (existingShop) {
        return {success: false, error: 'Shop URL identifier is already taken'};
      }
      updates.shop_slug = updates.shop_slug.toLowerCase();
    }

    const {error} = await adminDb
      .from('profiles')
      .update(updates)
      .eq('id', userId);

    if (error) throw error;

    return {success: true};
  } catch (error: any) {
    console.error('Error updating vendor shop admin:', error);
    return {success: false, error: error.message};
  }
}

export async function fetchAdminModerationQueue() {
  try {
    const supabase = await createClient();
    const isAdmin = await checkIsAdmin(supabase);
    if (!isAdmin) return {success: false, error: 'Unauthorized'};

    const {data, error} = await supabase
      .from('moderation_tickets')
      .select(
        '*, reporter_profile:profiles!moderation_tickets_reporter_id_fkey(username)',
      )
      .order('created_at', {ascending: false});

    if (error) throw error;

    return {success: true, data: data || []};
  } catch (error: any) {
    return {success: false, error: error.message};
  }
}

export async function resolveModerationTicket(
  id: string,
  updates: {status: string; resolution_notes?: string},
) {
  try {
    const supabase = await createClient();
    const isAdmin = await checkIsAdmin(supabase);
    if (!isAdmin) return {success: false, error: 'Unauthorized'};

    const adminDb = createAdminClient();

    const {error} = await adminDb
      .from('moderation_tickets')
      .update(updates)
      .eq('id', id);
    if (error) throw error;

    return {success: true};
  } catch (error: any) {
    return {success: false, error: error.message};
  }
}

export async function flagCreatorGift(id: string, reason: string) {
  try {
    const supabase = await createClient();
    const isAdmin = await checkIsAdmin(supabase);
    if (!isAdmin) return {success: false, error: 'Unauthorized'};

    const adminDb = createAdminClient();

    const {error} = await adminDb
      .from('creator_support')
      .update({is_flagged: true, flag_reason: reason})
      .eq('id', id);

    if (error) throw error;

    return {success: true};
  } catch (error: any) {
    return {success: false, error: error.message};
  }
}

export async function createAdminLog(action: string) {
  try {
    const supabase = await createClient();
    const {
      data: {user},
    } = await supabase.auth.getUser();
    if (!user) return {success: false, error: 'Not authenticated'};

    const adminDb = createAdminClient();

    const {error} = await adminDb.from('admin_logs').insert({
      admin_id: user.id,
      action,
    });

    if (error) throw error;
    return {success: true};
  } catch (error: any) {
    console.error('Error creating admin log:', error);
    return {success: false, error: error.message};
  }
}

export async function fetchAdminLogs() {
  try {
    const supabase = await createClient();
    const isAdmin = await checkIsAdmin(supabase);
    if (!isAdmin) return {success: false, error: 'Unauthorized'};

    const adminDb = createAdminClient();

    const {data, error} = await adminDb
      .from('admin_logs')
      .select(
        '*, admin:profiles!admin_logs_admin_id_fkey(username, display_name)',
      )
      .order('created_at', {ascending: false})
      .limit(200);

    if (error) throw error;

    return {success: true, data: data || []};
  } catch (error: any) {
    console.error('Error fetching admin logs:', error);
    return {success: false, error: error.message};
  }
}

export async function deleteAdminLog(logId: string) {
  try {
    const supabase = await createClient();
    const isAdmin = await checkIsAdmin(supabase);
    if (!isAdmin) return {success: false, error: 'Unauthorized'};

    const adminDb = createAdminClient();

    const {error} = await adminDb.from('admin_logs').delete().eq('id', logId);

    if (error) throw error;
    return {success: true};
  } catch (error: any) {
    console.error('Error deleting admin log:', error);
    return {success: false, error: error.message};
  }
}
