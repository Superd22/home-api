import { Injectable, Logger } from "@nestjs/common";
import { readdir } from "fs/promises";

@Injectable()
/**
 * Helper to manipulate yaml files
 */
export class CommandYamlHelper {

  private readonly logger = new Logger();
  
  public async getYamlOfFolder(options: {path?:string, allowEmpty?: boolean} = {}): Promise<(readonly [path: string, stackName: string])[]> {
    const path = options.path || "./"
    const files = await readdir(path)
    const yml = files
      .filter(fileName => /docker-compose\..*\.yml$/.test(fileName))
      .map(fileName => [path + fileName, /docker-compose\.(.*)\.yml$/.exec(fileName)[1]] as const)

    if (!yml.length && !options.allowEmpty) {
      this.logger.error("Could not find any YAML files. Ensure format is docker-compose.*.yml.")
      throw new Error("No YAML")
    }

    return yml
  }

}