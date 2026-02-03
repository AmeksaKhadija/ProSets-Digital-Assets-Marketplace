import { Controller, Get, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { Roles, UserRole } from '../../common/decorators';
import { RolesGuard } from '../../common/guards';
import { AssetStatus, UserRole as PrismaUserRole, OrderStatus } from '@prisma/client';

@Controller('admin')
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private adminService: AdminService) {}

  // Assets
  @Get('assets')
  async getAssets(
    @Query('status') status?: AssetStatus,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.adminService.getAllAssets({ status, page, limit });
  }

  @Patch('assets/:id/status')
  async updateAssetStatus(
    @Param('id') id: string,
    @Body('status') status: AssetStatus,
  ) {
    return this.adminService.updateAssetStatus(id, status);
  }

  // Users
  @Get('users')
  async getUsers(
    @Query('role') role?: PrismaUserRole,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.adminService.getAllUsers({ role, page, limit });
  }

  @Patch('users/:id/role')
  async updateUserRole(
    @Param('id') id: string,
    @Body('role') role: PrismaUserRole,
  ) {
    return this.adminService.updateUserRole(id, role);
  }

  // Orders
  @Get('orders')
  async getOrders(
    @Query('status') status?: OrderStatus,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.adminService.getAllOrders({ status, page, limit });
  }

  // Analytics
  @Get('analytics')
  async getAnalytics() {
    return this.adminService.getAnalytics();
  }
}
