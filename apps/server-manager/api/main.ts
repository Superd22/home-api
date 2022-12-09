import { NestFactory } from '@nestjs/core';
import { ServerManagerModule } from './server-manager.module';

async function bootstrap() {
  const app = await NestFactory.create(ServerManagerModule);
  await app.listen(3001);
}
bootstrap();
