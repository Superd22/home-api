import { Controller, Get } from '@nestjs/common';
import { ServerManagerService } from './server-manager.service';

@Controller()
export class ServerManagerController {
  constructor(private readonly serverManagerService: ServerManagerService) {}

  @Get()
  getHello(): string {
    return this.serverManagerService.getHello();
  }
}
