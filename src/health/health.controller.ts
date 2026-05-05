import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private prisma: PrismaService) {}

  @Get('db')
  async checkDb() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;

      return {
        status: 'ok',
        db: 'connected',
      };
    } catch (e) {
      return {
        status: 'error',
        db: 'disconnected',
        error: e.message,
      };
    }
  }
}