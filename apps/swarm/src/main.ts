import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { SwarmModule } from './swarm.module';

async function bootstrap() {  
    const app = await NestFactory.create<NestFastifyApplication>(
        SwarmModule,
        new FastifyAdapter()
    );

    await app.init()
    // await app.listen(3001, '0.0.0.0')
}
bootstrap();
