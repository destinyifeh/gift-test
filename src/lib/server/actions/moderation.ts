'use server';

import { createClient } from '../supabase/server';
import { createAdminClient } from '../supabase/admin';
import { revalidatePath } from 'next/cache';

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
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Use admin client to bypass RLS for inserting reports if needed, 
    // or just standard client if reports are public-writable (not recommended)
    const admin = createAdminClient();

    const { error } = await admin.from('moderation_reports').insert({
      target_id: targetId,
      target_type: targetType,
      target_name: targetName,
      reporter_id: user?.id || null,
      reporter_username: reporterUsername || 'anonymous',
      reason: reason,
      status: 'pending'
    });

    if (error) throw error;

    return { success: true };
  } catch (err: any) {
    console.error('Error creating report:', err);
    return { success: false, error: err.message };
  }
}

export async function fetchReports() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from('moderation_reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { success: true, data: data || [] };
  } catch (err: any) {
    console.error('Error fetching reports:', err);
    return { success: false, error: err.message };
  }
}

export async function updateReportStatus(reportId: string, status: string) {
  try {
    const admin = createAdminClient();
    const { error } = await admin
      .from('moderation_reports')
      .update({ status })
      .eq('id', reportId);

    if (error) throw error;
    revalidatePath('/v2/admin');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
