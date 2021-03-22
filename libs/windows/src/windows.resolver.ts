import { WindowsService } from './windows.service';
import { Mutation, Resolver } from '@nestjs/graphql';

@Resolver()
export class WindowsResolver {

    constructor(
        protected readonly windowsService: WindowsService
    ) { }

    @Mutation(() => Boolean, { description: `Turn off the monitors of the main windows machine` })
    public async turnOffMonitors() {
        await this.windowsService.turnOffMonitors()
        return true
    }

}
