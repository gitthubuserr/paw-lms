
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for Next.js
  app.enableCors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  });

  // API prefix
  app.setGlobalPrefix('api');

  await app.listen(process.env.PORT ?? 3001);

  console.log('Backend running on http://localhost:3001');
}

bootstrap();
