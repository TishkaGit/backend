import {
  Body,
  Controller,
  Post,
  Get,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtGuard } from './jwt/jwt.guard';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('register')
  register(@Body() body: RegisterDto) {
    return this.auth.register(
      body.email,
      body.password,
      body.role,
    );
  }

  @Post('login')
  login(@Body() body: LoginDto) {
    return this.auth.login(body.email, body.password);
  }

  @Get('me')
  @UseGuards(JwtGuard)
  me(@Req() req: any) {
    return req.user;
  }

  @Get('balance')
  @UseGuards(JwtGuard)
  balance(@Req() req: any) {
    return this.auth.getBalance(req.user.userId);
  }

  @Get('transactions')
  @UseGuards(JwtGuard)
  transactions(@Req() req: any) {
    return this.auth.getTransactions(req.user.userId);
  }

  @Post('deposit')
  @UseGuards(JwtGuard)
  deposit(@Body() body: any, @Req() req: any) {
    return this.auth.deposit(req.user.userId, body.amount);
  }

  @Post('withdraw')
  @UseGuards(JwtGuard)
  withdraw(@Body() body: any, @Req() req: any) {
    return this.auth.requestWithdraw(
      req.user.userId,
      body.amount,
    );
  }

  @Post('withdraw/approve')
  @UseGuards(JwtGuard)
  approve(@Body() body: any) {
    return this.auth.approveWithdraw(body.withdrawId);
  }
}