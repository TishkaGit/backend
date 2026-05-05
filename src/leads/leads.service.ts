import {
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LeadsService {
  constructor(private prisma: PrismaService) {}

  // 📞 создание лида (company)
  async create(body: any, userId: string) {
    console.log('CREATE LEAD BODY:', body);

    const campaign = await this.prisma.campaign.findUnique({
      where: { id: body.campaignId },
    });

    console.log('FOUND CAMPAIGN:', campaign);

    if (!campaign) {
      throw new Error('Campaign not found');
    }

    if (campaign.companyId !== userId) {
      throw new ForbiddenException('Not your campaign');
    }

    const lead = await this.prisma.lead.create({
      data: {
        name: body.name,
        phone: body.phone,
        email: body.email,
        price: body.price,
        campaignId: body.campaignId,
        status: 'NEW',
      },
    });

    console.log('LEAD CREATED:', lead);

    return lead;
  }

  // 📊 список доступных лидов (buyer)
  async findAll() {
    return this.prisma.lead.findMany({
      where: { status: 'NEW' },
      include: {
        campaign: true,
      },
    });
  }

  // 🛒 взять лид
  async takeLead(leadId: string, userId: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead) throw new Error('Lead not found');

    if (lead.status !== 'NEW') {
      throw new Error('Lead already taken');
    }

    const updated = await this.prisma.lead.update({
      where: { id: leadId },
      data: {
        status: 'IN_PROGRESS',
        userId,
      },
    });

    console.log('LEAD TAKEN:', updated);

    return updated;
  }

  // ✅ закрыть лид + 💰 деньги
  async closeLead(leadId: string, userId: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id: leadId },
      include: { campaign: true },
    });

    if (!lead) throw new Error('Lead not found');

    if (lead.userId !== userId) {
      throw new ForbiddenException('Not your lead');
    }

    if (lead.status !== 'IN_PROGRESS') {
      throw new Error('Wrong status');
    }

    const buyer = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    const company = await this.prisma.user.findUnique({
      where: { id: lead.campaign.companyId },
    });

    if (!buyer || !company) {
      throw new Error('Users not found');
    }

    if (buyer.balance < lead.price) {
      throw new Error('Not enough balance');
    }

    console.log('💰 START TRANSACTION');

    return this.prisma.$transaction(async (tx) => {
      // ➖ списываем у buyer
      await tx.user.update({
        where: { id: buyer.id },
        data: {
          balance: {
            decrement: lead.price,
          },
        },
      });

      // ➕ начисляем компании
      await tx.user.update({
        where: { id: company.id },
        data: {
          balance: {
            increment: lead.price,
          },
        },
      });

      // ✅ закрываем лид
      const updatedLead = await tx.lead.update({
        where: { id: leadId },
        data: {
          status: 'DONE',
        },
      });

      // 🧾 транзакция buyer
      await tx.transaction.create({
        data: {
          userId: buyer.id,
          amount: -lead.price,
          type: 'BUY_LEAD',
        },
      });

      // 🧾 транзакция company
      await tx.transaction.create({
        data: {
          userId: company.id,
          amount: lead.price,
          type: 'SELL_LEAD',
        },
      });

      console.log('💰 TRANSACTION SUCCESS');

      return updatedLead;
    });
  }

  // 📌 мои лиды (buyer)
  async myLeads(userId: string) {
    return this.prisma.lead.findMany({
      where: { userId },
    });
  }
}