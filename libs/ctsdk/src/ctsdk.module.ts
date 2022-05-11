import { Module } from '@nestjs/common';
import { CtsdkService } from './ctsdk.service';

@Module({
  providers: [CtsdkService],
  exports: [CtsdkService],
})
export class CtsdkModule {}
