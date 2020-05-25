import { Module } from '@nestjs/common';
import { OvpnService } from './ovpn.service';

@Module({
  providers: [OvpnService],
  exports: [OvpnService],
})
export class OvpnModule {}
