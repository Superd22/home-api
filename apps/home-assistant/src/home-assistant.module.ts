import { Module } from '@nestjs/common';
import { HomeAssistantController } from './home-assistant.controller';
import { HomeAssistantService } from './home-assistant.service';

@Module({
  imports: [],
  controllers: [HomeAssistantController],
  providers: [HomeAssistantService],
})
export class HomeAssistantModule {}
