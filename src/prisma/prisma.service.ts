import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit
{
  async onModuleInit() {
    let retries = 5;

    while (retries) {
      try {
        await this.$connect();
        console.log('✅ DB connected');
        break;
      } catch (e) {
        console.log('❌ DB connect failed, retry...', retries);
        retries--;
        await new Promise(res => setTimeout(res, 3000));
      }
    }

    if (!retries) {
      console.error('💀 Failed to connect to DB after retries');
    }
  }
}