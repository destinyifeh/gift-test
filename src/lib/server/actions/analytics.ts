'use server';

import {serverFetch} from '../server-api';

export async function fetchDashboardAnalytics() {
  try {
    const response = await serverFetch('analytics/dashboard');
    return {
      success: true,
      data: response.data || response,
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
  try {
    const limit = 10;
    const response = await serverFetch(`analytics/contributions?page=${pageParam + 1}&limit=${limit}`);
    return {
      success: true,
      data: response.data || [],
      nextPage: response.nextPage ?? (response.data?.length === limit ? pageParam + 1 : undefined),
    };
  } catch (err: any) {
    console.error('fetchMyContributions Error:', err);
    return {success: false, error: err.message, data: []};
  }
}

export async function fetchSentGiftsList({
  pageParam = 0,
}: {pageParam?: number} = {}) {
  try {
    const limit = 10;
    const response = await serverFetch(`analytics/gifts-sent?page=${pageParam + 1}&limit=${limit}`);
    return {
      success: true,
      data: response.data || [],
      nextPage: response.nextPage ?? (response.data?.length === limit ? pageParam + 1 : undefined),
    };
  } catch (err: any) {
    console.error('fetchSentGiftsList Error:', err);
    return {success: false, error: err.message, data: []};
  }
}

export async function fetchMyGiftsList({
  pageParam = 0,
}: {pageParam?: number} = {}) {
  try {
    const limit = 10;
    const response = await serverFetch(`analytics/gifts-received?page=${pageParam + 1}&limit=${limit}`);
    return {
      success: true,
      data: response.data || [],
      nextPage: response.nextPage ?? (response.data?.length === limit ? pageParam + 1 : undefined),
    };
  } catch (err: any) {
    console.error('fetchMyGiftsList Error:', err);
    return {success: false, error: err.message, data: []};
  }
}

export async function fetchReceivedGiftsList({
  pageParam = 0,
}: {pageParam?: number} = {}) {
  try {
    const limit = 10;
    const response = await serverFetch(`analytics/received-gifts?page=${pageParam + 1}&limit=${limit}`);
    return {
      success: true,
      data: response.data || [],
      nextPage: response.nextPage ?? (response.data?.length === limit ? pageParam + 1 : undefined),
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
  try {
    const limit = 10;
    const response = await serverFetch(`analytics/supporters?username=${encodeURIComponent(username)}&page=${pageParam + 1}&limit=${limit}`);
    return {
      success: true,
      data: response.data || [],
      totalReceived: response.totalReceived || 0,
      totalSupporters: response.totalSupporters || 0,
      nextPage: response.nextPage ?? (response.data?.length === limit ? pageParam + 1 : undefined),
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
  try {
    const limit = 10;
    const response = await serverFetch(`analytics/campaign-contributions?slug=${encodeURIComponent(slug)}&page=${pageParam + 1}&limit=${limit}`);
    return {
      success: true,
      data: response.data || [],
      nextPage: response.nextPage ?? (response.data?.length === limit ? pageParam + 1 : undefined),
    };
  } catch (err: any) {
    console.error('fetchCampaignContributions Error:', err);
    return {success: false, error: err.message, data: []};
  }
}

export async function fetchCreatorAnalytics({username}: {username: string}) {
  try {
    const response = await serverFetch(`analytics/creator-analytics?username=${encodeURIComponent(username)}`);
    return {
      success: true,
      data: response.data || response,
    };
  } catch (err: any) {
    console.error('Analytics Error:', err);
    return {success: false, error: err.message};
  }
}

/**
 * Fetches gifts sent to the user's email that haven't been claimed yet.
 * Includes both regular gifts (from campaigns) and Flex Cards.
 */
export async function fetchUnclaimedGifts() {
  try {
    const response = await serverFetch('analytics/unclaimed');
    return {
      success: true,
      data: response.data?.data || response.data || [],
      flexCards: response.data?.flexCards || [],
    };
  } catch (err: any) {
    console.error('fetchUnclaimedGifts Error:', err);
    return {success: false, error: err.message, data: [], flexCards: []};
  }
}
