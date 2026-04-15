import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Basic Logging
  const logger = new Logger('Bootstrap');
  
  // Enable CORS
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Global prefixes and versioning could be added here
  app.setGlobalPrefix('api/v1');

  // Global Pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Global Interceptors
  app.useGlobalInterceptors(new TransformInterceptor());

  // Global Filters
  app.useGlobalFilters(new AllExceptionsFilter());

  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('Gatherly Gifts API')
    .setDescription('The Gatherly Gifts API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // Define port
  const port = process.env.PORT || 4000;
  await app.listen(port);
  
  logger.log(`Application successfully started on port ${port}`);
}
bootstrap();
