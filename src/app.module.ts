import { Module } from '@nestjs/common';

// ✅ Prisma
import { PrismaService } from './prisma/prisma.service';

// ✅ Health
import { HealthController } from './health/health.controller';

// (если у тебя уже есть модули — оставь их)
import { AuthModule } from './auth/auth.module';
import { LeadsModule } from './leads/leads.module';
import { CampaignsModule } from './campaigns/campaigns.module';

@Module({
  imports: [
    AuthModule,
    LeadsModule,
    CampaignsModule,
  ],
  controllers: [
    HealthController, // 👈 наш endpoint /health/db
  ],
  providers: [
    PrismaService, // 👈 обязательно
  ],
})
export class AppModule {}