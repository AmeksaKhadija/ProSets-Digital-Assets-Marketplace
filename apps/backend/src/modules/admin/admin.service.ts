import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AssetsService } from '../assets/assets.service';
import { UsersService } from '../users/users.service';
import { AssetStatus, UserRole, OrderStatus, Prisma } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private assetsService: AssetsService,
    private usersService: UsersService,
  ) {}

  // Assets Management
  async getAllAssets(query: {
    status?: AssetStatus;
    page?: number;
    limit?: number;
  }) {
    const { status, page = 1, limit = 20 } = query;

    const where: Prisma.AssetWhereInput = {};
    if (status) {
      where.status = status;
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.asset.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          seller: {
            select: {
              id: true,
              name: true,
              email: true,
              storeName: true,
            },
          },
        },
      }),
      this.prisma.asset.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateAssetStatus(assetId: string, status: AssetStatus) {
    return this.assetsService.updateStatus(assetId, status);
  }

  // Users Management
  async getAllUsers(query: {
    role?: UserRole;
    page?: number;
    limit?: number;
  }) {
    const { role, page = 1, limit = 20 } = query;

    const where: Prisma.UserWhereInput = {};
    if (role) {
      where.role = role;
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          _count: {
            select: {
              assets: true,
              orders: true,
            },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateUserRole(userId: string, role: UserRole) {
    return this.usersService.updateRole(userId, role);
  }

  // Orders Management
  async getAllOrders(query: {
    status?: OrderStatus;
    page?: number;
    limit?: number;
  }) {
    const { status, page = 1, limit = 20 } = query;

    const where: Prisma.OrderWhereInput = {};
    if (status) {
      where.status = status;
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          buyer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          items: {
            include: {
              asset: {
                select: {
                  id: true,
                  title: true,
                  slug: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Analytics
  async getAnalytics() {
    const [
      totalUsers,
      totalAssets,
      totalOrders,
      totalRevenue,
      usersByRole,
      assetsByStatus,
      ordersByStatus,
      recentOrders,
      topAssets,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.asset.count(),
      this.prisma.order.count({ where: { status: OrderStatus.PAID } }),
      this.prisma.order.aggregate({
        where: { status: OrderStatus.PAID },
        _sum: { total: true },
      }),
      this.prisma.user.groupBy({
        by: ['role'],
        _count: true,
      }),
      this.prisma.asset.groupBy({
        by: ['status'],
        _count: true,
      }),
      this.prisma.order.groupBy({
        by: ['status'],
        _count: true,
      }),
      this.prisma.order.findMany({
        where: { status: OrderStatus.PAID },
        orderBy: { paidAt: 'desc' },
        take: 5,
        include: {
          buyer: {
            select: { name: true, email: true },
          },
        },
      }),
      this.prisma.asset.findMany({
        orderBy: { salesCount: 'desc' },
        take: 5,
        select: {
          id: true,
          title: true,
          salesCount: true,
          seller: {
            select: { storeName: true },
          },
        },
      }),
    ]);

    return {
      overview: {
        totalUsers,
        totalAssets,
        totalOrders,
        totalRevenue: totalRevenue._sum.total || 0,
      },
      breakdown: {
        usersByRole: usersByRole.reduce((acc, item) => {
          acc[item.role] = item._count;
          return acc;
        }, {} as Record<string, number>),
        assetsByStatus: assetsByStatus.reduce((acc, item) => {
          acc[item.status] = item._count;
          return acc;
        }, {} as Record<string, number>),
        ordersByStatus: ordersByStatus.reduce((acc, item) => {
          acc[item.status] = item._count;
          return acc;
        }, {} as Record<string, number>),
      },
      recent: {
        orders: recentOrders,
        topAssets,
      },
    };
  }
}
