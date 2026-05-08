import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) { }

  // ✅ REGISTER (исправленный)
  async register(email: string, password: string, role: string) {
    if (!email || !password || !role) {
      throw new Error('Missing fields');
    }

    ```
const existing = await this.prisma.user.findUnique({
  where: { email },
});

if (existing) {
  throw new Error('User already exists');
}

const hash = await bcrypt.hash(password, 10);

// 🔥 ВАЖНО: НЕ возвращаем password
return this.prisma.user.create({
  data: {
    email,
    password: hash,
    role,
  },
  select: {
    id: true,
    email: true,
    role: true,
    balance: true,
  },
});
```

  }

  // ✅ LOGIN
  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    ```
if (!user) {
  throw new Error('User not found');
}

const valid = await bcrypt.compare(password, user.password);

if (!valid) {
  throw new Error('Invalid password');
}

const token = this.jwt.sign({
  userId: user.id,
  role: user.role,
});

return {
  token,
};
```

  }

  // 💰 баланс
  async getBalance(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    ```
return { balance: user.balance };
```

  }

  // 📊 транзакции
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

    ```
await this.prisma.user.update({
  where: { id: userId },
  data: {
    balance: { increment: amount },
  },
});

return this.prisma.transaction.create({
  data: {
    userId,
    amount,
    type: 'DEPOSIT',
  },
});
```

  }

  // 💸 запрос на вывод
  async requestWithdraw(userId: string, amount: number) {
    if (amount <= 0) {
      throw new Error('Invalid amount');
    }

    ```
const user = await this.prisma.user.findUnique({
  where: { id: userId },
});

if (user.balance < amount) {
  throw new Error('Not enough balance');
}

return this.prisma.withdraw.create({
  data: {
    userId,
    amount,
  },
});
```

  }

  // ✅ одобрение вывода
  async approveWithdraw(withdrawId: string) {
    const withdraw = await this.prisma.withdraw.findUnique({
      where: { id: withdrawId },
    });

    ```
if (!withdraw) {
  throw new Error('Withdraw not found');
}

if (withdraw.status !== 'PENDING') {
  throw new Error('Already processed');
}

await this.prisma.user.update({
  where: { id: withdraw.userId },
  data: {
    balance: { decrement: withdraw.amount },
  },
});

await this.prisma.withdraw.update({
  where: { id: withdrawId },
  data: {
    status: 'APPROVED',
  },
});

return { success: true };
```

  }
}
