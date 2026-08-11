import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);
    const isProduction =
        configService.getOrThrow<string>('NODE_ENV') === 'production';

    app.enableShutdownHooks();
    app.use(helmet());
    const apiPrefix = configService.getOrThrow<string>('API_PREFIX');
    app.setGlobalPrefix(apiPrefix);
    app.enableCors({
        origin: configService.getOrThrow<string>('CORS_ORIGINS').split(','),
        credentials: true,
    });
    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
            whitelist: true,
            forbidNonWhitelisted: true,
            disableErrorMessages: isProduction,
        }),
    );

    if (configService.getOrThrow<boolean>('SWAGGER_ENABLED')) {
        const swaggerConfig = new DocumentBuilder()
            .setTitle('Card Game API')
            .setDescription('REST API documentation')
            .setVersion('1.0')
            .build();
        const swaggerDocument = SwaggerModule.createDocument(
            app,
            swaggerConfig,
        );
        SwaggerModule.setup(`${apiPrefix}/docs`, app, swaggerDocument, {
            jsonDocumentUrl: `${apiPrefix}/docs-json`,
        });
    }

    const port = configService.getOrThrow<number>('PORT');
    await app.listen(port, '0.0.0.0');
    Logger.log(`Listening on port ${port}`, 'Bootstrap');
}
void bootstrap();
