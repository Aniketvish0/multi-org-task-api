import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';

let serverHandler: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  await app.init();
  return app.getHttpAdapter().getInstance();
}

export default async function handler(req: any, res: any) {
  if (!serverHandler) {
    serverHandler = await bootstrap();
  }
  return serverHandler(req, res);
}
