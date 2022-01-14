import { Injectable } from '@nestjs/common';

@Injectable()
export class HomeAssistantService {
  getHello(): string {
    return 'Hello World!';
  }
}
