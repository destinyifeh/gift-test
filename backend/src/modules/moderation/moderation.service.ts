import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { paginate, getPaginationOptions } from '../../common/utils/pagination.util';

@Injectable()
export class ModerationService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new moderation report.
   * Mirrors frontend: moderation.ts → createModerationReport
   */
  async createReport(data: {
    targetId: string;
    targetType: string;
    reason: string;
    targetName: string;
    reporterId?: string;
    reporterUsername?: string;
  }) {
    try {
      const report = await (this.prisma as any).moderationReport.create({
        data: {
          targetId: data.targetId,
          targetType: data.targetType,
          targetName: data.targetName,
          reporterId: data.reporterId || null,
          reporterUsername: data.reporterUsername || 'anonymous',
          reason: data.reason,
          status: 'pending',
        },
      });

      return report;
    } catch (err: any) {
      throw new InternalServerErrorException(err.message);
    }
  }

  /**
   * Fetch all moderation reports (admin only).
   * Mirrors frontend: moderation.ts → fetchModerationReports
   */
  async fetchModerationReports(
    page: number = 1,
    limit: number = 20,
    filters?: { status?: string; targetType?: string },
  ) {
    const { skip, take } = getPaginationOptions(page, limit);

    const where: any = {};
    if (filters?.status && filters.status !== 'all') {
      where.status = filters.status;
    }
    if (filters?.targetType && filters.targetType !== 'all') {
      where.targetType = filters.targetType;
    }

    const [reports, total] = await Promise.all([
      (this.prisma as any).moderationReport.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      (this.prisma as any).moderationReport.count({ where }),
    ]);

    return paginate(reports, total, page, limit);
  }

  /**
   * Update the status of a moderation report (admin only).
   * Mirrors frontend: moderation.ts → updateModerationStatus
   */
  async updateModerationStatus(reportId: number, status: string, adminNotes?: string) {
    const report = await (this.prisma as any).moderationReport.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      throw new NotFoundException('Moderation report not found');
    }

    const updateData: any = {
      status,
      resolvedAt: ['resolved', 'dismissed'].includes(status) ? new Date() : null,
    };

    if (adminNotes !== undefined) {
      updateData.adminNotes = adminNotes;
    }

    const updated = await (this.prisma as any).moderationReport.update({
      where: { id: reportId },
      data: updateData,
    });

    return updated;
  }

  /**
   * Fetch moderation tickets/reports with more detail (admin only).
   * Mirrors frontend: moderation.ts → fetchModerationTickets
   */
  async fetchModerationTickets(
    page: number = 1,
    limit: number = 20,
    filters?: { status?: string; targetType?: string; search?: string },
  ) {
    const { skip, take } = getPaginationOptions(page, limit);

    const where: any = {};
    if (filters?.status && filters.status !== 'all') {
      where.status = filters.status;
    }
    if (filters?.targetType && filters.targetType !== 'all') {
      where.targetType = filters.targetType;
    }
    if (filters?.search) {
      where.OR = [
        { targetName: { contains: filters.search, mode: 'insensitive' } },
        { reporterUsername: { contains: filters.search, mode: 'insensitive' } },
        { reason: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [tickets, total] = await Promise.all([
      (this.prisma as any).moderationReport.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      (this.prisma as any).moderationReport.count({ where }),
    ]);

    // Enrich tickets with target details
    const enrichedTickets = await Promise.all(
      tickets.map(async (ticket: any) => {
        let targetDetails = null;

        try {
          if (ticket.targetType === 'vendor' || ticket.targetType === 'user') {
            targetDetails = await (this.prisma as any).user.findUnique({
              where: { id: ticket.targetId },
              select: {
                displayName: true,
                email: true,
                avatarUrl: true,
                creator: { select: { username: true } },
                vendor: { select: { businessName: true } },
              },
            });
            if (targetDetails) {
              (targetDetails as any).username = targetDetails.creator?.username || null;
            }
            if (targetDetails?.vendor) {
              (targetDetails as any).businessName = targetDetails.vendor.businessName;
            }
          } else if (ticket.targetType === 'campaign') {
            targetDetails = await (this.prisma as any).campaign.findUnique({
              where: { id: ticket.targetId },
              select: {
                title: true,
                description: true,
                user: { select: { displayName: true, creator: { select: { username: true } } } },
              },
            });
          }
        } catch {
          // Target may have been deleted
          targetDetails = null;
        }

        return {
          ...ticket,
          targetDetails,
        };
      }),
    );

    return paginate(enrichedTickets, total, page, limit);
  }

  /**
   * Get a single moderation report by ID (admin only).
   */
  async getModerationReport(reportId: number) {
    const report = await (this.prisma as any).moderationReport.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      throw new NotFoundException('Moderation report not found');
    }

    return report;
  }

  /**
   * Delete a moderation report (admin only).
   */
  async deleteModerationReport(reportId: number) {
    const report = await (this.prisma as any).moderationReport.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      throw new NotFoundException('Moderation report not found');
    }

    await (this.prisma as any).moderationReport.delete({
      where: { id: reportId },
    });

    return { success: true };
  }
}
