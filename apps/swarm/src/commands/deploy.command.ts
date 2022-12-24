import { Logger } from '@nestjs/common';
import { Command, CommandRunner, Option } from 'nest-commander';
import { SwarmApp } from '../swarm.service';
import { readdir } from 'fs/promises'
import { summary } from '@actions/core';
import execSh from 'exec-sh';
import { SummaryTableRow } from '@actions/core/lib/summary';
import { CommandYamlHelper } from './command-yaml.service';
 
export interface DeployOptions {
  path?: string;
  dryRun?: boolean;
  context?: string;
}

@Command({ name: 'deploy', description: 'Deploy YAML to docker' })
export class DeployCommand implements CommandRunner {
  private readonly logger = new Logger();
  constructor(
    protected readonly app: SwarmApp,
    protected readonly helper: CommandYamlHelper,
  ) {}

  async run(passedParam: string[], options?: DeployOptions): Promise<void> {
    const ymlOfFolder = await this.helper.getYamlOfFolder({ path: options.path })
    const yml = passedParam.length > 0 ? ymlOfFolder.filter(([path, stack]) => passedParam.includes(stack)) : ymlOfFolder

    summary.addHeading('Deployments')
    this.logger.debug('Found YAMLs to deploy', [yml.length])
    const deploySummary: SummaryTableRow[] = [
      [  { header: true, data: 'stack' }, { header: true, data: 'status', } ]
    ]
    
    let hadError = false
    for (const [file, stackName] of yml) {
      this.logger.debug(`Deploying stack ${stackName}`)
      try {
        const { stdout } = await execSh.promise(`${options.dryRun ? 'echo [dry-run]: ' : ''}docker --context ${options.context} stack deploy --compose-file ${file} ${stackName}`, true)
        this.logger.log(`Deployed ${stackName}.`)
        if (stdout) {
          this.logger.debug(stdout)
        }

        deploySummary.push([stackName, 'Deployed ✅'])
      } catch(e) {
        this.logger.error(`Could not deploy ${stackName}`, e.stderr)
        hadError = true
        deploySummary.push([stackName, 'Failed ❌'])
      }
    }

    summary.addTable(deploySummary)

    try {
      await summary.write()
    } catch(e) {
      console.error("e")
    }

    this.logger.log('Done deploying')
    if (hadError) throw new Error("Deploy did not succeed")
  }

  @Option({
    flags: '-p, --path [string]',
    description: 'Where to output YMLs',
  })
  protected parsePath(val: string): string {
    return val;
  }


  @Option({
    flags: '-c, --context [string]',
    description: 'context to use',
    defaultValue: 'freebox-remote'
  })
  protected parseContext(val: string): string {
    return val
  }

  @Option({
    flags: '-d, --dry-run [string]',
    description: 'Wether or not to dry run',
  })
  protected parseDryRun(val: string): boolean {
    if (val === 'true') return true
    return false
  }
}
