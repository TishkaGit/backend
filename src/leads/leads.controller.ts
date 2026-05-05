import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Req,
} from '@nestjs/common';
import { LeadsService } from './leads.service';
import { JwtGuard } from '../auth/jwt/jwt.guard';

@Controller('leads')
export class LeadsController {
  constructor(private leads: LeadsService) { }

  // 📞 создать лид (company)
  @Post()
  @UseGuards(JwtGuard)
  create(@Body() body: any, @Req() req: any) {
    return this.leads.create(body, req.user.userId);
  }

  // 📊 получить все лиды (buyer)
  @Get()
  @UseGuards(JwtGuard)
  findAll() {
    return this.leads.findAll();
  }

  // 🛒 взять лид
  @Post('take')
  @UseGuards(JwtGuard)
  take(@Body() body: any, @Req() req: any) {
    return this.leads.takeLead(body.leadId, req.user.userId);
  }

  // ✅ закрыть лид
  @Post('close')
  @UseGuards(JwtGuard)
  close(@Body() body: any, @Req() req: any) {
    return this.leads.closeLead(body.leadId, req.user.userId);
  }

  // 📌 мои лиды
  @Get('my')
  @UseGuards(JwtGuard)
  my(@Req() req: any) {
    return this.leads.myLeads(req.user.userId);
  }
}