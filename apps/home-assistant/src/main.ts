import { NestFactory } from '@nestjs/core';
import { HomeAssistantModule } from './home-assistant.module';

async function bootstrap() {
  const app = await NestFactory.create(HomeAssistantModule);
  await app.listen(3000);
}
bootstrap();
