import { Controller, Get } from '@nestjs/common';
import { HomeAssistantService } from './home-assistant.service';

@Controller()
export class HomeAssistantController {
  constructor(private readonly homeAssistantService: HomeAssistantService) {}

  @Get()
  getHello(): string {
    return this.homeAssistantService.getHello();
  }
}
