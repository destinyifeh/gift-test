import { Controller, Post, Get, Patch, Delete, Body, Req, Param, Query, UseGuards } from '@nestjs/common';
import { ModerationService } from './moderation.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('moderation')
export class ModerationController {
  constructor(private readonly moderationService: ModerationService) {}

  @Post('report')
  async createReport(
    @Req() req: any,
    @Body() body: { targetId: string; targetType: string; reason: string; targetName: string }
  ) {
    const reporterId = req.user?.id;
    const reporterUsername = req.user?.username;

    const report = await this.moderationService.createReport({
      ...body,
      reporterId,
      reporterUsername,
    });

    return { success: true, data: report };
  }

  @Get('reports')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  async getModerationReports(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('targetType') targetType?: string,
  ) {
    const result = await this.moderationService.fetchModerationReports(
      Number(page) || 1,
      Number(limit) || 20,
      { status, targetType },
    );
    return { ...result, success: true };
  }

  @Get('tickets')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  async getModerationTickets(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('targetType') targetType?: string,
    @Query('search') search?: string,
  ) {
    const result = await this.moderationService.fetchModerationTickets(
      Number(page) || 1,
      Number(limit) || 20,
      { status, targetType, search },
    );
    return { ...result, success: true };
  }

  @Get('reports/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  async getModerationReport(@Param('id') id: string) {
    const report = await this.moderationService.getModerationReport(Number(id));
    return { success: true, data: report };
  }

  @Patch('reports/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  async updateModerationStatus(
    @Param('id') id: string,
    @Body() body: { status: string; adminNotes?: string },
  ) {
    const report = await this.moderationService.updateModerationStatus(
      Number(id),
      body.status,
      body.adminNotes,
    );
    return { success: true, data: report };
  }

  @Delete('reports/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  async deleteModerationReport(@Param('id') id: string) {
    await this.moderationService.deleteModerationReport(Number(id));
    return { success: true };
  }
}
