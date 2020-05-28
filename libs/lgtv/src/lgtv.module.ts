import { Module } from '@nestjs/common';
import { LgtvService } from './lgtv.service';

@Module({
  providers: [LgtvService],
  exports: [LgtvService],
})
export class LgtvModule {

}
