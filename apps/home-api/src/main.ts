import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app/app.module';

async function bootstrap() {  
    const app = await NestFactory.create<NestFastifyApplication>(
        AppModule,
        new FastifyAdapter() as any
    );

    await app.listen(3000, '0.0.0.0')
}
bootstrap();
