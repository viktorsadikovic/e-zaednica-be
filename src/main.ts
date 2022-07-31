import { RequestMethod, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/httpException.filter';
import { morganMiddleware } from './config/morganMiddleware';
import { WinstonLogger } from './config/winstonLogger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
    bodyParser: true,
    logger: WinstonLogger,
  });

  const configService = app.get(ConfigService);

  app.setGlobalPrefix(
    `${configService.get('API_PREFIX')}/${configService.get('API_VERSION')}`,
    {
      exclude: [{ path: '/', method: RequestMethod.GET }],
    },
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle(`${configService.get('APP_NAME')} API documentation`)
    .setDescription(
      `All available API requests for the ${configService.get(
        'APP_NAME',
      )} project will be described here.`,
    )
    .setExternalDoc(
      'Swagger JSON file',
      `/${configService.get('API_PREFIX')}/${configService.get(
        'API_VERSION',
      )}/${configService.get('SWAGGER_PATH')}-json`,
    )
    .setVersion(configService.get('API_VERSION'))
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'accessToken',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(
    `${configService.get('API_PREFIX')}/${configService.get(
      'API_VERSION',
    )}/${configService.get('SWAGGER_PATH')}`,
    app,
    document,
    {
      swaggerOptions: { defaultModelsExpandDepth: -1 },
    },
  );

  app.use(morganMiddleware);
  app.useGlobalFilters(new HttpExceptionFilter());
  await app.listen(3000);
}
bootstrap();
