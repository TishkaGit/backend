import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 🌍 CORS (фикс фронта)
  app.enableCors({
    origin: '*',
    credentials: true,
  });

  // ✅ Валидация (без крашей)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false, // 🔥 фикс 500
      transform: true,
    }),
  );

  // 💥 Глобальные ошибки
  app.useGlobalFilters(new AllExceptionsFilter());

  await app.listen(process.env.PORT || 3000);

  console.log(`🚀 Server running on port ${process.env.PORT || 3000}`);
}

bootstrap();
