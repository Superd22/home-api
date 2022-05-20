import { Logger } from '@nestjs/common';
import { Command, CommandRunner, Option } from 'nest-commander';
import { SwarmApp } from '../swarm.service';
import { CommandYamlHelper } from './command-yaml.service';
import execSh from 'exec-sh';

export interface PruneOptions {
  path?: string;
  dryRun?: boolean;
  empty?: boolean;
}

@Command({
  name: 'prune',
  description: 'prune stacks that do not exist anymore',
})
export class PruneCommand implements CommandRunner {
  private readonly logger = new Logger();
  constructor(
    protected readonly app: SwarmApp,
    protected readonly helper: CommandYamlHelper,
  ) {}

  async run(passedParam: string[], options?: PruneOptions): Promise<void> {
    const yml = await this.helper.getYamlOfFolder({ path: options.path });
    const { stdout } = await execSh.promise(
      `docker --context freebox-remote stack ls | awk '(NR>1) {print $1}'`,
      true,
    );
    const currentStacks = stdout.split(/\r?\n/).filter((s) => !!s);
    this.logger.log(
      'Found current stacks and future stacks, diffing',
      currentStacks.sort(),
      yml.map(([path, name]) => name).sort(),
    );

    for (const current of currentStacks) {
      if (!yml.find(([_, name]) => name === current)) {
        this.logger.log('Pruning stack', current);

        const { stdout } = await execSh.promise(
          `docker --context freebox-remote stack rm ${current}`,
          true,
        );

        this.logger.debug(`Pruned ${current}`, stdout)
      }
    }

    this.logger.log('Done pruning');
  }

  @Option({
    flags: '-p, --path [string]',
    description: 'Where to output YMLs',
  })
  protected parsePath(val: string): string {
    return val;
  }

  @Option({
    flags: '-d, --dry-run [boolean]',
    description: 'Wether or not to dry run',
  })
  protected parseDryRun(val: string): boolean {
    if (val === 'true') return true;
    return false;
  }

  @Option({
    flags: '-e, --empty [boolean]',
    description: 'allow empty folders (= deletes everything)',
  })
  protected parseEmpty(val: string): boolean {
    if (val === 'true') return true;
    return false;
  }
}
