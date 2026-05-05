import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CampaignsService {
  constructor(private prisma: PrismaService) { }

  // 🏢 создание кампании (company)
  async create(body: any, userId: string) {
    console.log('CREATE CAMPAIGN:', body, 'USER:', userId);

    if (!body.name) {
      throw new Error('Name is required');
    }

    if (!body.price) {
      throw new Error('Price is required');
    }

    const campaign = await this.prisma.campaign.create({
      data: {
        name: body.name,
        description: body.description || null,
        price: Number(body.price), // 👈 обязательно
        companyId: userId,
      },
    });

    console.log('CAMPAIGN CREATED:', campaign);

    return campaign;
  }

  // 📋 все кампании
  async findAll() {
    return this.prisma.campaign.findMany({
      include: {
        company: true,
      },
    });
  }

  // 🏢 кампании конкретной компании
  async myCampaigns(userId: string) {
    return this.prisma.campaign.findMany({
      where: {
        companyId: userId,
      },
    });
  }

  // 🔍 получить одну кампанию
  async findOne(id: string) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id },
      include: {
        company: true,
      },
    });

    if (!campaign) {
      throw new Error('Campaign not found');
    }

    return campaign;
  }
}