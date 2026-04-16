'use server';

import { revalidatePath } from 'next/cache';
import { serverFetch } from '../server-api';

export async function createReport({
  targetId,
  targetType,
  reason,
  targetName,
  reporterUsername
}: {
  targetId: string;
  targetType: 'campaign' | 'user' | 'vendor' | 'gift';
  reason: string;
  targetName: string;
  reporterUsername: string;
}) {
  try {
    const response = await serverFetch('moderation/report', {
      method: 'POST',
      body: JSON.stringify({
        targetId,
        targetType,
        reason,
        targetName,
      }),
    });
    return response;
  } catch (err: any) {
    console.error('Error creating report:', err);
    return { success: false, error: err.message };
  }
}

export async function fetchReports() {
  try {
    const response = await serverFetch('moderation/reports');
    return { success: true, data: response.data || [] };
  } catch (err: any) {
    console.error('Error fetching reports:', err);
    return { success: false, error: err.message };
  }
}

export async function updateReportStatus(reportId: string, status: string, notes?: string) {
  try {
    const response = await serverFetch(`moderation/reports/${reportId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, adminNotes: notes }),
    });
    revalidatePath('/admin');
    return response;
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function fetchReportDetails(targetId: string, targetType: string) {
  try {
    const response = await serverFetch(`moderation/reports/${targetId}`);
    return { success: true, data: response.data };
  } catch (err: any) {
    console.error('Error fetching report details:', err);
    return { success: false, error: err.message };
  }
}
