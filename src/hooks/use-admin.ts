import api from '@/lib/api-client';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// ── Dashboard & Analytics ──────────

export function useAdminDashboardStats() {
  return useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: async () => {
      const res = await api.get('/admin/stats');
      return res.data;
    },
  });
}

export function useAdminSystemAnalytics() {
  return useQuery({
    queryKey: ['admin-system-analytics'],
    queryFn: async () => {
      const res = await api.get('/admin/system-analytics');
      return res.data;
    },
  });
}

export function useAdminSystemHealth() {
  return useQuery({
    queryKey: ['admin-system-health'],
    queryFn: async () => {
      const res = await api.get('/admin/health');
      return res.data;
    },
    refetchInterval: 60000, // Refresh every minute
  });
}

// ── User Management ───────────

export function useAdminUsers(
  options: { search?: string; role?: string; page?: number; limit?: number } = {},
  queryOptions: any = {}
) {
  const { search, role, limit = 20 } = options;
  
  return useInfiniteQuery({
    queryKey: ['admin-users', search, role, limit],
    ...queryOptions,
    initialPageParam: 1,
    queryFn: async ({ pageParam = 1 }) => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (role) params.append('role', role);
      params.append('page', String(pageParam));
      params.append('limit', String(limit));

      const res = await api.get(`/admin/users?${params.toString()}`);
      
      const mappedData = res.data.data.map((u: any) => ({
        ...u,
        display_name: u.displayName,
        avatar_url: u.avatarUrl,
        admin_role: u.adminRole,
        is_creator: u.isCreator,
        created_at: u.createdAt,
        updated_at: u.updatedAt,
      }));

      return {
        ...res.data,
        data: mappedData,
      };
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination?.hasMore) {
        return (lastPage.pagination?.page || 1) + 1;
      }
      return undefined;
    },
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      userId,
      roles,
      adminRole,
      username,
      fullName,
      country,
    }: {
      userId: string;
      roles: string[];
      adminRole?: string | null;
      username?: string;
      fullName?: string;
      country?: string;
    }) => {
      const res = await api.patch(`/admin/users/${userId}/role`, {
        roles,
        adminRole: adminRole || null,
        username,
        fullName,
        country,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-vendors'] });
    },
  });
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, status, suspensionEnd }: { userId: string; status: string; suspensionEnd?: string }) => {
      const res = await api.patch(`/admin/users/${userId}/status`, { status, suspensionEnd });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-vendors'] });
      queryClient.invalidateQueries({ queryKey: ['admin-all-users'] });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const res = await api.delete(`/admin/users/${userId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-vendors'] });
      toast.success('User permanently deleted');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    },
  });
}

// ── Vendor Management ───────────

export function useAdminVendors(
  options: { search?: string; status?: string; page?: number; limit?: number } = {},
  queryOptions: any = {}
) {
  const { search, status, limit = 20 } = options;
  
  return useInfiniteQuery({
    queryKey: ['admin-vendors', search, status, limit],
    ...queryOptions,
    initialPageParam: 1,
    queryFn: async ({ pageParam = 1 }) => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (status) params.append('status', status);
      params.append('page', String(pageParam));
      params.append('limit', String(limit));

      const res = await api.get(`/admin/vendors?${params.toString()}`);
      
      const mappedData = res.data.data.map((v: any) => ({
        ...v,
        display_name: v.displayName,
        avatar_url: v.avatarUrl,
        shop_name: v.shopName,
        shop_slug: v.shopSlug,
        shop_description: v.shopDescription,
        is_verified_vendor: v.isVerifiedVendor,
        vendor_status: v.vendorStatus,
        vendor_categories: v.vendorCategories,
        created_at: v.createdAt,
        gifts_count: v._count?.vendorGifts || 0,
      }));

      return {
        ...res.data,
        data: mappedData,
      };
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination?.hasMore) {
        return (lastPage.pagination?.page || 1) + 1;
      }
      return undefined;
    },
  });
}

export function useUpdateVendorStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await api.patch(`/admin/vendors/${id}/status`, { vendorStatus: status });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-vendors'] });
    },
  });
}

export function useVerifyVendor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, isVerified }: { id: string; isVerified: boolean }) => {
      const res = await api.patch(`/admin/vendors/${id}/verify`, { isVerified });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-vendors'] });
    },
  });
}

export function useCreateVendor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      fullName: string;
      username: string;
      email: string;
      country: string;
      password?: string;
    }) => {
      const res = await api.post('/admin/vendors', data);
      return res.data;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['admin-vendors'] });
      if (data.created) {
        toast.success(`Vendor account created successfully`);
      } else if (data.upgraded) {
        toast.success(`User upgraded to vendor role`);
      } else {
        toast.success('Vendor added successfully');
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create vendor');
    },
  });
}

// ── Admin Logs ─────────────

export function useAdminLogs(options: { page?: number; limit?: number; search?: string } = {}) {
  const { limit = 20, search } = options;

  return useInfiniteQuery({
    queryKey: ['admin-logs', search, limit],
    initialPageParam: 1,
    queryFn: async ({ pageParam = 1 }) => {
      const params = new URLSearchParams();
      params.append('page', String(pageParam));
      params.append('limit', String(limit));
      if (search) params.append('search', search);

      const res = await api.get(`/admin/logs?${params.toString()}`);
      
      const mappedData = res.data.data.map((l: any) => ({
        ...l,
        created_at: l.createdAt,
        admin: l.admin ? {
          ...l.admin,
          display_name: l.admin.displayName,
          avatar_url: l.admin.avatarUrl,
        } : null,
      }));

      return {
        ...res.data,
        data: mappedData,
      };
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination?.hasMore) {
        return (lastPage.pagination?.page || 1) + 1;
      }
      return undefined;
    },
  });
}

export function useDeleteAdminLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await api.delete(`/admin/logs/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-logs'] });
    },
  });
}

// ── Moderation ─────────────

export function useAdminReports(options: { page?: number; limit?: number; status?: string } = {}) {
  const { page = 1, limit = 20, status } = options;

  return useQuery({
    queryKey: ['admin-reports', page, limit, status],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('page', String(page));
      params.append('limit', String(limit));
      if (status) params.append('status', status);

      const res = await api.get(`/admin/reports?${params.toString()}`);
      
      const mappedData = res.data.data.map((r: any) => ({
        ...r,
        target_id: r.targetId,
        target_type: r.targetType,
        target_name: r.targetName,
        reporter_id: r.reporterId,
        reporter_username: r.reporter?.username,
        resolution_notes: r.resolutionNotes,
        resolved_at: r.resolvedAt,
        resolved_by: r.resolvedBy,
        created_at: r.createdAt,
      }));

      return {
        ...res.data,
        data: mappedData,
      };
    },
  });
}

export function useResolveReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, resolutionNotes, status }: { id: string; resolutionNotes: string; status: string }) => {
      const res = await api.patch(`/admin/reports/${id}/resolve`, { resolutionNotes, status });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reports'] });
    },
  });
}

// ── Subscription Management ──
export function useAdminSubscriptions(options: { search?: string; page?: number; limit?: number } = {}, queryOptions: any = {}) {
  const { search, limit = 20 } = options;
  return useInfiniteQuery({
    queryKey: ['admin-subscriptions', search, limit],
    ...queryOptions,
    initialPageParam: 1,
    queryFn: async ({ pageParam = 1 }) => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      params.append('page', String(pageParam));
      params.append('limit', String(limit));
      const res = await api.get(`/admin/subscriptions?${params.toString()}`);
      return {
        ...res.data,
        data: res.data.data.map((s: any) => ({
          ...s,
          created_at: s.createdAt,
          updated_at: s.updatedAt,
          user: s.user ? { ...s.user, display_name: s.user.displayName } : null,
        })),
      };
    },
    getNextPageParam: (lastPage) => lastPage.pagination?.hasMore ? (lastPage.pagination?.page || 1) + 1 : undefined,
  });
}

export function useCancelSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const res = await api.patch(`/admin/subscriptions/${id}/cancel`, { reason });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-subscriptions'] });
      toast.success('Subscription cancelled');
    },
  });
}

export function useExtendSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, days }: { id: string; days: number }) => {
      const res = await api.patch(`/admin/subscriptions/${id}/extend`, { days });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-subscriptions'] });
      toast.success('Subscription extended');
    },
  });
}

// ── Campaign Management ──
export function useAdminCampaigns(options: { search?: string; page?: number; limit?: number } = {}, queryOptions: any = {}) {
  const { search, limit = 20 } = options;
  return useInfiniteQuery({
    queryKey: ['admin-campaigns', search, limit],
    ...queryOptions,
    initialPageParam: 1,
    queryFn: async ({ pageParam = 1 }) => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      params.append('page', String(pageParam));
      params.append('limit', String(limit));
      const res = await api.get(`/admin/campaigns?${params.toString()}`);
      return {
        ...res.data,
        data: res.data.data.map((c: any) => ({
          ...c,
          created_at: c.createdAt,
          updated_at: c.updatedAt,
          creator: c.creator ? { ...c.creator, display_name: c.creator.displayName } : null,
        })),
      };
    },
    getNextPageParam: (lastPage) => lastPage.pagination?.hasMore ? (lastPage.pagination?.page || 1) + 1 : undefined,
  });
}

export const useAdminUpdateCampaign = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { id: string; [key: string]: any }) => {
      const { id, ...updates } = data;
      return api.patch(`/admin/campaigns/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-campaigns'] });
      toast.success('Campaign updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update campaign');
    },
  });
};

export const useAdminSettings = () => {
  return useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      const response = await api.get('/admin/settings');
      return response.data;
    },
  });
};

export const useUpdateAdminSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (settings: any) => api.patch('/admin/settings', settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
      toast.success('Platform settings updated');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update settings');
    },
  });
};

export const useAdminUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (updates: { display_name?: string; bio?: string }) => 
      api.patch('/profile', updates), // Most backends handle profile at /profile
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Profile updated');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update profile');
    },
  });
};

export function useToggleCampaignFeatured() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.post(`/admin/campaigns/${id}/toggle-featured`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-campaigns'] });
    },
  });
}

export function useUpdateCampaignStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, reason }: { id: string; status: string; reason?: string }) => {
      const res = await api.patch(`/admin/campaigns/${id}/status`, { status, reason });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-campaigns'] });
    },
  });
}

// ── Transaction & Wallet Management ──
export function useAdminTransactions(options: { search?: string; page?: number; limit?: number } = {}, queryOptions: any = {}) {
  const { search, limit = 30 } = options;
  return useInfiniteQuery({
    queryKey: ['admin-transactions', search, limit],
    ...queryOptions,
    initialPageParam: 1,
    queryFn: async ({ pageParam = 1 }) => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      params.append('page', String(pageParam));
      params.append('limit', String(limit));
      const res = await api.get(`/admin/transactions?${params.toString()}`);
      return {
        ...res.data,
        data: res.data.data.map((t: any) => ({
          ...t,
          created_at: t.createdAt,
          user: t.user ? { ...t.user, display_name: t.user.displayName } : null,
        })),
      };
    },
    getNextPageParam: (lastPage) => lastPage.pagination?.hasMore ? (lastPage.pagination?.page || 1) + 1 : undefined,
  });
}

export function useAdminWithdrawals(options: { page?: number; limit?: number } = {}, queryOptions: any = {}) {
  const { limit = 20 } = options;
  return useInfiniteQuery({
    queryKey: ['admin-withdrawals', limit],
    ...queryOptions,
    initialPageParam: 1,
    queryFn: async ({ pageParam = 1 }) => {
      const params = new URLSearchParams();
      params.append('page', String(pageParam));
      params.append('limit', String(limit));
      const res = await api.get(`/admin/withdrawals?${params.toString()}`);
      return {
        ...res.data,
        data: res.data.data.map((w: any) => ({
          ...w,
          created_at: w.createdAt,
          processed_at: w.processedAt,
          user: w.user ? { ...w.user, display_name: w.user.displayName } : null,
        })),
      };
    },
    getNextPageParam: (lastPage) => lastPage.pagination?.hasMore ? (lastPage.pagination?.page || 1) + 1 : undefined,
  });
}

export function useProcessWithdrawal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, action, rejectionReason }: { id: number; action: 'approve' | 'reject', rejectionReason?: string }) => {
      const res = await api.patch(`/admin/withdrawals/${id}/process`, { action, rejectionReason });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-withdrawals'] });
    },
  });
}

export function useAdminWallets(options: { search?: string; page?: number; limit?: number } = {}, queryOptions: any = {}) {
  const { search, limit = 20 } = options;
  return useInfiniteQuery({
    queryKey: ['admin-wallets', search, limit],
    ...queryOptions,
    initialPageParam: 1,
    queryFn: async ({ pageParam = 1 }) => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      params.append('page', String(pageParam));
      params.append('limit', String(limit));
      const res = await api.get(`/admin/wallets?${params.toString()}`);
      return {
        ...res.data,
        data: res.data.data.map((w: any) => ({
          ...w,
          created_at: w.createdAt,
          updated_at: w.updatedAt,
          // If user is already a string (username), keep it. If it's an object, map it.
          user: typeof w.user === 'object' && w.user !== null 
            ? (w.user.username || w.user.displayName || 'Unknown')
            : (w.user || 'Unknown'),
        })),
      };
    },
    getNextPageParam: (lastPage) => lastPage.pagination?.hasMore ? (lastPage.pagination?.page || 1) + 1 : undefined,
  });
}

export function useUpdateWalletStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await api.patch(`/admin/wallets/${id}/status`, { status });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-wallets'] });
    },
  });
}

// ── Creator Gifts & Flagging ──
export function useAdminCreatorGifts(options: { search?: string; page?: number; limit?: number } = {}, queryOptions: any = {}) {
  const { search, limit = 20 } = options;
  return useInfiniteQuery({
    queryKey: ['admin-creator-gifts', search, limit],
    ...queryOptions,
    initialPageParam: 1,
    queryFn: async ({ pageParam = 1 }) => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      params.append('page', String(pageParam));
      params.append('limit', String(limit));
      const res = await api.get(`/admin/creator-gifts?${params.toString()}`);
      return {
        ...res.data,
        data: res.data.data.map((g: any) => ({
          ...g,
          created_at: g.createdAt,
          is_flagged: g.isFlagged,
          flag_reason: g.flagReason,
          creator: g.creator ? { ...g.creator, display_name: g.creator.displayName } : null,
        })),
      };
    },
    getNextPageParam: (lastPage) => lastPage.pagination?.hasMore ? (lastPage.pagination?.page || 1) + 1 : undefined,
  });
}

export function useFlagCreatorGift() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason, action }: { id: string; reason: string; action: 'flag' | 'unflag' }) => {
      const res = await api.patch(`/admin/gifts/${id}/flag`, { reason, action });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-creator-gifts'] });
    },
  });
}

// ── FlexCard Management ──
export function useAdminFlexCards(options: { search?: string; status?: string; page?: number; limit?: number } = {}, queryOptions: any = {}) {
  const { search, status, limit = 20 } = options;
  return useInfiniteQuery({
    queryKey: ['admin-flex-cards', search, status, limit],
    ...queryOptions,
    initialPageParam: 1,
    queryFn: async ({ pageParam = 1 }) => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (status) params.append('status', status);
      params.append('page', String(pageParam));
      params.append('limit', String(limit));
      const res = await api.get(`/admin/flex-cards?${params.toString()}`);
      return {
        ...res.data,
        data: res.data.data.map((f: any) => ({
          ...f,
          created_at: f.createdAt,
          user: f.user ? { ...f.user, display_name: f.user.displayName } : null,
        })),
      };
    },
    getNextPageParam: (lastPage) => lastPage.pagination?.hasMore ? (lastPage.pagination?.page || 1) + 1 : undefined,
  });
}
export function useAdminChangePassword() {
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/admin/change-password', data);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Password updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update password');
    },
  });
}
export function useAdminShopGifts(options: { search?: string; page?: number; limit?: number } = {}, queryOptions: any = {}) {
  const { search, limit = 20 } = options;
  return useInfiniteQuery({
    queryKey: ['admin-shop-gifts', search, limit],
    ...queryOptions,
    initialPageParam: 1,
    queryFn: async ({ pageParam = 1 }) => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      params.append('page', String(pageParam));
      params.append('limit', String(limit));
      const res = await api.get(`/admin/shop-gifts?${params.toString()}`);
      return {
        ...res.data,
        data: res.data.data.map((g: any) => ({
          ...g,
          created_at: g.createdAt,
          current_amount: g.currentAmount,
          gift_code: g.giftCode,
          profiles: g.user ? {
            ...g.user,
            display_name: g.user.displayName,
            shop_name: g.user.shopName,
            shop_address: g.user.shopAddress,
          } : null,
        })),
      };
    },
    getNextPageParam: (lastPage) => lastPage.pagination?.hasMore ? (lastPage.pagination?.page || 1) + 1 : undefined,
  });
}

export function useInvalidateShopGift() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const res = await api.patch(`/admin/shop-gifts/${id}/invalidate`, { reason });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-shop-gifts'] });
      toast.success('Gift code invalidated');
    },
  });
}
