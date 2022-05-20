import { Logger } from '@nestjs/common';
import { CommandFactory } from 'nest-commander';
import { SwarmModule } from './swarm.module';

async function bootstrap() {
  await CommandFactory.run(SwarmModule, new Logger());
}

bootstrap();