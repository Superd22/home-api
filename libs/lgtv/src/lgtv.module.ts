import { Module } from '@nestjs/common';
import { LgtvService } from './lgtv.service';
import { PubsubModule } from '@homeapi/pubsub';

@Module({
  imports: [PubsubModule],
  providers: [LgtvService],
  exports: [LgtvService],
})
export class LgtvModule {

}
