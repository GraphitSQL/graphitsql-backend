import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LogLevel } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  const logLevels: LogLevel[] = ['error', 'warn', 'log', 'verbose'];

  if (process.env.NODE_ENV === 'development') {
    logLevels.push('debug');
  }

  app.useLogger(logLevels);
  const configService = app.get<ConfigService>(ConfigService);
  const APP_PORT = configService.getOrThrow('service.appPort');

  await app.listen(APP_PORT);
}
bootstrap();
