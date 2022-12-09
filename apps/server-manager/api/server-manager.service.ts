import { Injectable } from '@nestjs/common';

@Injectable()
export class ServerManagerService {
  getHello(): string {
    return 'Hello World!';
  }
}
