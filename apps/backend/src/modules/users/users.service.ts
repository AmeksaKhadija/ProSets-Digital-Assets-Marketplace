import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserRole } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { BecomeSellerDto } from './dto/become-seller.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ auth0Id: dto.auth0Id }, { email: dto.email }],
      },
    });

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    return this.prisma.user.create({
      data: {
        auth0Id: dto.auth0Id,
        email: dto.email,
        name: dto.name,
        avatar: dto.avatar,
      },
    });
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByAuth0Id(auth0Id: string) {
    return this.prisma.user.findUnique({
      where: { auth0Id },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.findById(id);

    return this.prisma.user.update({
      where: { id },
      data: dto,
    });
  }

  async becomeSeller(id: string, dto: BecomeSellerDto) {
    const user = await this.findById(id);

    if (user.role === UserRole.SELLER) {
      throw new ConflictException('User is already a seller');
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        role: UserRole.SELLER,
        storeName: dto.storeName,
        storeDescription: dto.storeDescription,
      },
    });
  }

  async updateRole(id: string, role: UserRole) {
    await this.findById(id);

    return this.prisma.user.update({
      where: { id },
      data: { role },
    });
  }

  async getSellerStats(sellerId: string) {
    const [assetCount, totalSales, totalRevenue] = await Promise.all([
      this.prisma.asset.count({
        where: { sellerId },
      }),
      this.prisma.orderItem.count({
        where: { sellerId },
      }),
      this.prisma.orderItem.aggregate({
        where: { sellerId },
        _sum: { sellerAmount: true },
      }),
    ]);

    return {
      assetCount,
      totalSales,
      totalRevenue: totalRevenue._sum.sellerAmount || 0,
    };
  }
}
