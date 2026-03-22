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

export async function fetchAdminUsers(search?: string, role?: string) {
  try {
    const supabase = await createClient();
    const isAdmin = await checkIsAdmin(supabase);
    if (!isAdmin) return {success: false, error: 'Unauthorized'};

    let query = supabase
      .from('profiles')
      .select(
        'id, username, display_name, email, avatar_url, country, roles, admin_role, is_creator, updated_at, created_at, status',
      )
      .order('username', {ascending: true});

    if (role) {
      query = query.contains('roles', [role]);
    }

    if (search) {
      query = query.or(
        `username.ilike.%${search}%,display_name.ilike.%${search}%,email.ilike.%${search}%`,
      );
    }

    const {data, error} = await query.limit(100);
    if (error) throw error;

    return {success: true, data};
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

export async function fetchAdminDashboardStats() {
  try {
    const supabase = await createClient();
    const isAdmin = await checkIsAdmin(supabase);
    if (!isAdmin) return {success: false, error: 'Unauthorized'};

    const {count} = await supabase
      .from('profiles')
      .select('*', {count: 'exact', head: true});

    const {count: activeCamps} = await supabase
      .from('campaigns')
      .select('*', {count: 'exact', head: true});

    const {data: support} = await supabase
      .from('creator_support')
      .select('amount, created_at');
    const {data: campaigns} = await supabase
      .from('campaigns')
      .select('current_amount, created_at');

    let totalSupport = 0;

    const monthlyMap: Record<string, number> = {};
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const currentYear = new Date().getFullYear();
    for (const m of months) monthlyMap[m] = 0;

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
      .filter((_, i) => i <= new Date().getMonth()); // Show up to current month only

    return {
      success: true,
      data: {
        totalUsers: count || 0,
        totalCampaigns: activeCamps || 0,
        totalSupport,
        revenueData,
      },
    };
  } catch (error: any) {
    console.error('Error fetching admin dashboard stats:', error);
    return {success: false, error: error.message};
  }
}

export async function fetchAdminCampaigns(search?: string) {
  try {
    const supabase = await createClient();
    const isAdmin = await checkIsAdmin(supabase);
    if (!isAdmin) return {success: false, error: 'Unauthorized'};

    let query = supabase
      .from('campaigns')
      .select('*, profiles!campaigns_user_id_fkey(username, display_name)')
      .order('created_at', {ascending: false});

    if (search) {
      query = query.ilike('title', `%${search}%`);
    }

    const {data, error} = await query.limit(100);
    if (error) throw error;

    return {success: true, data};
  } catch (error: any) {
    console.error('Error fetching admin campaigns:', error);
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

export async function fetchAdminTransactions(search?: string) {
  try {
    const supabase = await createClient();
    const isAdmin = await checkIsAdmin(supabase);
    if (!isAdmin) return {success: false, error: 'Unauthorized'};

    let query = supabase
      .from('transactions')
      .select(
        '*, sender_profile:profiles!transactions_sender_id_fkey(username), recipient_profile:profiles!transactions_recipient_id_fkey(username)',
      )
      .order('created_at', {ascending: false});

    const {data, error} = await query.limit(300);
    if (error) throw error;
    return {success: true, data};
  } catch (error: any) {
    return {success: false, error: error.message};
  }
}

export async function fetchAdminWithdrawals(search?: string) {
  try {
    const supabase = await createClient();
    const isAdmin = await checkIsAdmin(supabase);
    if (!isAdmin) return {success: false, error: 'Unauthorized'};

    let query = supabase
      .from('transactions')
      .select(
        '*, recipient_profile:profiles!transactions_sender_id_fkey(username)',
      )
      .eq('type', 'withdrawal')
      .order('created_at', {ascending: false});

    const {data, error} = await query.limit(200);
    if (error) throw error;
    return {success: true, data};
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

export async function fetchAdminWallets(search?: string) {
  try {
    const supabase = await createClient();
    const isAdmin = await checkIsAdmin(supabase);
    if (!isAdmin) return {success: false, error: 'Unauthorized'};

    const {data: profiles} = await supabase
      .from('profiles')
      .select('id, username, country, wallet_status');

    const {data: txs} = await supabase
      .from('transactions')
      .select('recipient_id, sender_id, amount, status, type, currency');

    const wallets =
      profiles?.map(p => {
        const userTxs =
          txs?.filter(t => t.recipient_id === p.id || t.sender_id === p.id) ||
          [];
        let balance = 0;
        let earned = 0;
        let withdrawn = 0;
        let pending = 0;

        userTxs.forEach(t => {
          if (t.recipient_id === p.id && t.status === 'success') {
            if (
              t.type === 'campaign_contribution' ||
              t.type === 'creator_support'
            ) {
              earned += Number(t.amount || 0);
            }
          }
          if (t.sender_id === p.id && t.type === 'withdrawal') {
            if (t.status === 'success') withdrawn += Number(t.amount || 0);
            if (t.status === 'pending') pending += Number(t.amount || 0);
          }
        });

        balance = earned - withdrawn - pending;

        return {
          id: p.id,
          user: p.username,
          country: p.country,
          balance,
          earned,
          withdrawn,
          pending,
          status: p.wallet_status || 'active',
        };
      }) || [];

    return {success: true, data: wallets};
  } catch (error: any) {
    return {success: false, error: error.message};
  }
}

export async function fetchAdminGifts(search?: string) {
  try {
    const supabase = await createClient();
    const isAdmin = await checkIsAdmin(supabase);
    if (!isAdmin) return {success: false, error: 'Unauthorized'};

    let query = supabase
      .from('creator_support')
      .select(
        '*, recipient:profiles!creator_support_user_id_fkey(username), transactions(status)',
      )
      .order('created_at', {ascending: false});

    const {data, error} = await query.limit(300);
    if (error) throw error;
    return {success: true, data};
  } catch (error: any) {
    return {success: false, error: error.message};
  }
}

export async function fetchAdminGiftCodes(search?: string) {
  try {
    const supabase = await createClient();
    const isAdmin = await checkIsAdmin(supabase);
    if (!isAdmin) return {success: false, error: 'Unauthorized'};

    let query = supabase
      .from('campaigns')
      .select(
        'gift_code, title, recipient_email, status, profiles!campaigns_user_id_fkey(username)',
      )
      .eq('claimable_type', 'gift-card')
      .not('gift_code', 'is', null)
      .order('created_at', {ascending: false});

    const {data, error} = await query.limit(200);
    if (error) throw error;

    const formatted = data.map(d => ({
      code: d.gift_code,
      vendor:
        (Array.isArray(d.profiles)
          ? d.profiles[0]?.username
          : (d.profiles as any)?.username) || 'System',
      product: d.title,
      status: d.status === 'completed' ? 'redeemed' : 'active',
      redeemedBy: d.status === 'completed' ? d.recipient_email : null,
    }));
    return {success: true, data: formatted};
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
