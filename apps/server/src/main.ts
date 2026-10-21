import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { envSchema } from './config/env';

async function bootstrap(): Promise<void> {
  const env = envSchema.parse(process.env);
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors();
  await app.listen(env.PORT);
  Logger.log(`Listening on ${env.PORT}`, 'Bootstrap');
}

void bootstrap();
