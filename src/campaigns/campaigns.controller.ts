import { Controller, Post, Get, Body, UseGuards, Req } from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { JwtGuard } from '../auth/jwt/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';

@Controller('campaigns')
export class CampaignsController {
    constructor(private campaigns: CampaignsService) { }

    @Post()
    @UseGuards(JwtGuard, new RolesGuard(['company']))
    create(@Body() body: any, @Req() req: any) {
        return this.campaigns.create(body, req.user.userId);
    }

    @Get()
    findAll() {
        return this.campaigns.findAll();
    }

    @Get('my')
    @UseGuards(JwtGuard, new RolesGuard(['company']))
    my(@Req() req: any) {
        return this.campaigns.myCampaigns(req.user.userId);
    }
}