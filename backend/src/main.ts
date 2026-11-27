import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { ACCESS_COOKIE } from './common/constants';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);

  // Di belakang Nginx: percaya header X-Forwarded-For agar rate limit menghitung IP klien asli.
  if (config.get('TRUST_PROXY') === 'true') app.set('trust proxy', 1);

  app.setGlobalPrefix('api');
  app.use(helmet());
  app.use(cookieParser());
  app.enableCors({ origin: config.get('FRONTEND_ORIGIN') ?? 'http://localhost:3000', credentials: true });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // buang field yang tidak ada di DTO
      forbidNonWhitelisted: true, // dan tolak request yang mencoba mengirimnya
      transform: true, // ubah payload/query jadi instance DTO bertipe
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.enableShutdownHooks();

  if (config.get('NODE_ENV') !== 'production') {
    const doc = new DocumentBuilder()
      .setTitle('LMS Mini API')
      .setDescription('Kontrak API bersama tim. Login lewat POST /api/auth/login.')
      .setVersion('1.0')
      .addBearerAuth()
      .addCookieAuth(ACCESS_COOKIE)
      .build();
    SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, doc));
  }

  const port = Number(config.get('PORT') ?? 4000);
  await app.listen(port);
  new Logger('Bootstrap').log(`API berjalan di http://localhost:${port}/api (docs: /api/docs)`);
}
bootstrap();
