import { Module, Global } from '@nestjs/common';
import { PubsubService } from './pubsub.service';

@Module({
  providers: [PubsubService],
  exports: [PubsubService],
})
@Global()
export class PubsubModule {}
