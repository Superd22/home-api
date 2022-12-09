import { Module } from '@nestjs/common';
import { ServerManagerController } from './server-manager.controller';
import { ServerManagerService } from './server-manager.service';

@Module({
  imports: [],
  controllers: [ServerManagerController],
  providers: [ServerManagerService],
})
export class ServerManagerModule {}
