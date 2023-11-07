import { NestExpressApplication } from '@nestjs/platform-express';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors();
  app.useStaticAssets('static', { prefix: '/pages' });
  app.useGlobalPipes(new ValidationPipe());
  const configServer = app.get(ConfigService);
  await app.listen(configServer.get('nest_server_port'));
}
bootstrap();
