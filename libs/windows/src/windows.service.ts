import { Injectable, Logger } from '@nestjs/common';
import SSH2Promise from 'ssh2-promise';

@Injectable()
export class WindowsService {

    protected readonly windowsMachine: string = '127.0.0.1'

    protected readonly ssh: SSH2Promise

    protected readonly logger: Logger = new Logger(WindowsService.name)

    constructor(
    ) {
        const sshConfig = {
            host: this.windowsMachine,
            username: 'david',
            // port: 2222,
            identity: `${__dirname}/../../../.ssh/id_rsa`,
        }

        this.ssh = new SSH2Promise(sshConfig)
        this.logger.debug(`Connected to SSH windows.`)
    }

    public async turnOffMonitors(): Promise<void> {
        await this.execSsh('/mnt/c/Windows/System32/scrnsave.scr -s')
    }

    protected async execSsh(cmd: string): Promise<string> {
        this.logger.debug(`ssh ${cmd}`)
        const buff = await this.ssh.exec(cmd)
        let output = ""
        if (buff instanceof Buffer) {
            output = buff.toString('utf-8')
        } else output = buff
        this.logger.debug(`[SSH] ${output}`)
        return output;
    }

}
