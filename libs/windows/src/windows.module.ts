import { Module } from '@nestjs/common';
import { WindowsResolver } from './windows.resolver';
import { WindowsService } from './windows.service';

@Module({
  providers: [WindowsService, WindowsResolver],
  exports: [WindowsService],
})
export class WindowsModule {}
