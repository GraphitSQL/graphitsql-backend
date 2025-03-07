import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LogLevel, ValidationError, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ValidationFailedError } from './common/errors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  const logLevels: LogLevel[] = ['error', 'warn', 'log', 'verbose'];

  if (process.env.NODE_ENV === 'development') {
    logLevels.push('debug');
  }

  app.useLogger(logLevels);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (validationErrors: ValidationError[] = []) => new ValidationFailedError(validationErrors),
    }),
  );

  const configService = app.get<ConfigService>(ConfigService);
  const APP_PORT = configService.getOrThrow('service.appPort');

  await app.listen(APP_PORT);
}
bootstrap();
