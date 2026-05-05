import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 🌍 Включаем CORS (очень важно для фронта)
  app.enableCors();

  // ✅ Глобальная валидация DTO
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // убирает лишние поля
      forbidNonWhitelisted: true, // ошибка если лишние поля
      transform: true, // авто преобразование типов
    }),
  );

  // 💥 Глобальный обработчик ошибок
  app.useGlobalFilters(new AllExceptionsFilter());

  // 🚀 Запуск сервера
  await app.listen(process.env.PORT || 3000);

  console.log(`🚀 Server running on port ${process.env.PORT || 3000}`);
}

bootstrap();