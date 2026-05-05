import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  // 🧾 регистрация
  async register(email: string, password: string, role: string) {
    console.log('REGISTER INPUT:', { email, password, role });

    const existing = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      throw new Error('User already exists');
    }

    const hash = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        email,
        password: hash,
        role,
        balance: 0,
      },
    });

    console.log('REGISTER SUCCESS:', user);

    return user;
  }

  // 🔐 логин
  async login(email: string, password: string) {
    console.log('LOGIN INPUT:', { email, password });

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    console.log('USER FROM DB:', user);

    if (!user) {
      throw new Error('User not found');
    }

    const valid = await bcrypt.compare(password, user.password);

    console.log('PASSWORD VALID:', valid);

    if (!valid) {
      throw new Error('Wrong password');
    }

    const token = this.jwt.sign({
      userId: user.id,
      role: user.role,
    });

    console.log('LOGIN SUCCESS, TOKEN CREATED');

    return { token };
  }

  // 💰 баланс
  async getBalance(userId: string) {
    console.log('GET BALANCE:', userId);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    return { balance: user?.balance || 0 };
  }

  // 🧾 транзакции
  async getTransactions(userId: string) {
    return this.prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // 💳 пополнение
  async deposit(userId: string, amount: number) {
    if (amount <= 0) {
      throw new Error('Invalid amount');
    }

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id: userId },
        data: {
          balance: {
            increment: amount,
          },
        },
      });

      await tx.transaction.create({
        data: {
          userId,
          amount,
          type: 'DEPOSIT',
        },
      });

      console.log('💰 DEPOSIT SUCCESS:', { userId, amount });

      return user;
    });
  }

  // 💸 запрос на вывод
  async requestWithdraw(userId: string, amount: number) {
    if (amount <= 0) {
      throw new Error('Invalid amount');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.balance < amount) {
      throw new Error('Not enough balance');
    }

    return this.prisma.withdraw.create({
      data: {
        userId,
        amount,
        status: 'PENDING',
      },
    });
  }

  // 👑 подтверждение вывода (admin)
  async approveWithdraw(withdrawId: string) {
    const withdraw = await this.prisma.withdraw.findUnique({
      where: { id: withdrawId },
    });

    if (!withdraw) {
      throw new Error('Withdraw not found');
    }

    if (withdraw.status !== 'PENDING') {
      throw new Error('Already processed');
    }

    return this.prisma.$transaction(async (tx) => {
      // списываем деньги
      await tx.user.update({
        where: { id: withdraw.userId },
        data: {
          balance: {
            decrement: withdraw.amount,
          },
        },
      });

      // обновляем статус
      const updated = await tx.withdraw.update({
        where: { id: withdrawId },
        data: { status: 'APPROVED' },
      });

      // транзакция
      await tx.transaction.create({
        data: {
          userId: withdraw.userId,
          amount: -withdraw.amount,
          type: 'WITHDRAW',
        },
      });

      return updated;
    });
  }
}