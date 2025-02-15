import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ValidationPipe } from '@nestjs/common';
import { ParseIntIdPipe } from './app/common/pipes/parse-int-id.pipe';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: false,
    }),
    new ParseIntIdPipe(),
  );

  if (process.env.NODE_ENV === 'production') {
    app.use(helmet());
    app.enableCors({ origin: 'https://app.com.br' });
  }

  await app.listen(process.env.APP_PORT ?? 3000);
}
bootstrap();
