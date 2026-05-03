'use server';

import {revalidatePath} from 'next/cache';
import {serverFetch} from '../server-api';

export async function checkIsAdmin() {
  try {
    // Simply attempt an admin-only endpoint; the backend RolesGuard enforces access.
    await serverFetch('admin/stats');
    return true;
  } catch {
    return false;
  }
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
    const params = new URLSearchParams({
      page: (pageParam + 1).toString(),
      limit: limit.toString(),
    });
    if (search) params.set('search', search);
    if (role) params.set('role', role);

    const response = await serverFetch(`admin/users?${params.toString()}`);
    return {
      success: true,
      data: response.data || [],
      nextPage: (response.data?.length === limit || response.nextPage !== undefined) ? (response.nextPage ?? pageParam + 1) : undefined,
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
    const response = await serverFetch(`admin/users/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({roles, adminRole}),
    });
    return { success: true, data: response };
  } catch (error: any) {
    console.error('Error updating user role:', error);
    return {success: false, error: error.message};
  }
}

export async function fetchAdminDashboardStats(period: string = 'monthly') {
  try {
    const response = await serverFetch('admin/stats');
    return {
      success: true,
      data: response.data || response,
    };
  } catch (error: any) {
    console.error('Error fetching admin dashboard stats:', error);
    return {success: false, error: error.message};
  }
}

export async function fetchAdminSubscriptions({
  search,
  pageParam = 0,
}: {
  search?: string;
  pageParam?: number;
} = {}) {
  try {
    const limit = 20;
    const params = new URLSearchParams({
      page: (pageParam + 1).toString(),
      limit: limit.toString(),
    });
    if (search) params.set('search', search);

    const response = await serverFetch(`admin/subscriptions?${params.toString()}`);
    return {
      success: true,
      data: response.data || [],
      nextPage: response.nextPage,
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
    const params = new URLSearchParams({
      page: (pageParam + 1).toString(),
      limit: limit.toString(),
    });
    if (search) params.set('search', search);

    const response = await serverFetch(`admin/campaigns?${params.toString()}`);
    return {
      success: true,
      data: response.data || [],
      nextPage: response.nextPage,
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
    const params = new URLSearchParams({
      page: (pageParam + 1).toString(),
      limit: limit.toString(),
    });
    if (search) params.set('search', search);

    const response = await serverFetch(`admin/shop-gifts?${params.toString()}`);
    return {
      success: true,
      data: response.data || [],
      nextPage: response.nextPage,
    };
  } catch (error: any) {
    console.error('Error fetching admin shop gifts:', error);
    return {success: false, error: error.message};
  }
}

export async function updateCampaignAdmin(campaignId: string, updates: any) {
  try {
    const response = await serverFetch(`admin/campaigns/${campaignId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    return { success: true, data: response };
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
    const params = new URLSearchParams({
      page: (pageParam + 1).toString(),
      limit: limit.toString(),
    });
    if (search) params.set('search', search);

    const response = await serverFetch(`admin/transactions?${params.toString()}`);
    return {
      success: true,
      data: response.data || [],
      nextPage: response.nextPage,
    };
  } catch (error: any) {
    console.error('Error fetching admin transactions:', error);
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
    const params = new URLSearchParams({
      page: (pageParam + 1).toString(),
      limit: limit.toString(),
    });

    const response = await serverFetch(`admin/withdrawals?${params.toString()}`);
    return {
      success: true,
      data: response.data || [],
      nextPage: response.nextPage,
    };
  } catch (error: any) {
    return {success: false, error: error.message};
  }
}

export async function updateTransactionStatus(txId: string, status: string) {
  try {
    const response = await serverFetch(`admin/transactions/${txId}`, {
      method: 'PATCH',
      body: JSON.stringify({status}),
    });
    return { success: true, data: response };
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
    const params = new URLSearchParams({
      page: (pageParam + 1).toString(),
      limit: limit.toString(),
    });
    if (search) params.set('search', search);

    const response = await serverFetch(`admin/wallets?${params.toString()}`);
    return {
      success: true,
      data: response.data || [],
      nextPage: response.nextPage,
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
    const params = new URLSearchParams({
      page: (pageParam + 1).toString(),
      limit: limit.toString(),
    });
    if (search) params.set('search', search);

    const response = await serverFetch(`admin/creator-gifts?${params.toString()}`);
    return {
      success: true,
      data: response.data || [],
      nextPage: response.nextPage,
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
    const params = new URLSearchParams({
      page: (pageParam + 1).toString(),
      limit: limit.toString(),
    });
    if (search) params.set('search', search);

    const response = await serverFetch(`admin/vendors?${params.toString()}`);
    return {
      success: true,
      data: response.data || [],
      nextPage: response.nextPage,
    };
  } catch (error: any) {
    return {success: false, error: error.message};
  }
}

export async function createVendor({
  fullName,
  username,
  email,
  country,
  password,
}: {
  fullName: string;
  username: string;
  email: string;
  country: string;
  password?: string;
}) {
  try {
    const data = await serverFetch('/admin/vendors', {
      method: 'POST',
      body: JSON.stringify({fullName, username, email, country, password}),
    });
    revalidatePath('/admin');
    return {success: true, data};
  } catch (error: any) {
    return {success: false, error: error.message};
  }
}

export async function updateVendorStatus(id: string, status: string) {
  try {
    const response = await serverFetch(`admin/vendors/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({vendorStatus: status}),
    });
    return response;
  } catch (error: any) {
    return {success: false, error: error.message};
  }
}

export async function updateUserSystemStatus(
  id: string,
  updates: {status?: string; suspension_end?: string | null},
) {
  try {
    const response = await serverFetch(`admin/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({
        status: updates.status,
        suspensionEnd: updates.suspension_end,
      }),
    });
    return { success: true, data: response };
  } catch (error: any) {
    return {success: false, error: error.message};
  }
}

export async function updateWalletStatus(id: string, wallet_status: string) {
  try {
    const response = await serverFetch(`admin/wallets/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({status: wallet_status}),
    });
    return { success: true, data: response };
  } catch (error: any) {
    return {success: false, error: error.message};
  }
}

export async function updateVendorShopAdmin(
  userId: string,
  updates: {
    business_name?: string;
    business_description?: string;
    business_address?: string;
    business_slug?: string;
    business_logo_url?: string;
  },
) {
  try {
    const response = await serverFetch(`admin/vendors/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        businessName: updates.business_name,
        businessDescription: updates.business_description,
        businessSlug: updates.business_slug,
        businessLogoUrl: updates.business_logo_url,
      }),
    });
    return { success: true, data: response };
  } catch (error: any) {
    console.error('Error updating vendor shop admin:', error);
    return {success: false, error: error.message};
  }
}

export async function fetchAdminModerationQueue() {
  try {
    const response = await serverFetch('moderation/tickets');
    return {success: true, data: response.data || []};
  } catch (error: any) {
    return {success: false, error: error.message};
  }
}

export async function resolveModerationTicket(
  id: string,
  updates: {status: string; resolution_notes?: string},
) {
  try {
    const response = await serverFetch(`admin/reports/${id}/resolve`, {
      method: 'PATCH',
      body: JSON.stringify({
        status: updates.status,
        resolutionNotes: updates.resolution_notes,
      }),
    });
    return response;
  } catch (error: any) {
    return {success: false, error: error.message};
  }
}

export async function flagCreatorGift(id: string, reason: string) {
  try {
    const response = await serverFetch(`admin/gifts/${id}/flag`, {
      method: 'PATCH',
      body: JSON.stringify({reason, action: 'flag'}),
    });
    return response;
  } catch (error: any) {
    return {success: false, error: error.message};
  }
}

export async function createAdminLog(action: string) {
  try {
    const response = await serverFetch('admin/logs', {
      method: 'POST',
      body: JSON.stringify({action}),
    });
    return response;
  } catch (error: any) {
    console.error('Error creating admin log:', error);
    return {success: false, error: error.message};
  }
}

export async function fetchAdminLogs() {
  try {
    const response = await serverFetch('admin/logs?limit=200');
    return {success: true, data: response.data || []};
  } catch (error: any) {
    console.error('Error fetching admin logs:', error);
    return {success: false, error: error.message};
  }
}

export async function deleteAdminLog(logId: string) {
  try {
    const response = await serverFetch(`admin/logs/${logId}`, {
      method: 'DELETE',
    });
    return response;
  } catch (error: any) {
    console.error('Error deleting admin log:', error);
    return {success: false, error: error.message};
  }
}
