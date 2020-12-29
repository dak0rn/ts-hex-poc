import { ApplicationContext } from '@core/ioc/ApplicationContext';
import { inject, injectable } from '@core/ioc/Decorators';
import { ApplicationModuleLauncher } from '@core/module/Module';
import { SessionBackend } from './SessionBackend';

@injectable()
export class SessionProvider implements ApplicationModuleLauncher {
    protected ctx: ApplicationContext;

    constructor(@inject('core.ApplicationContext') ctx: ApplicationContext) {
        this.ctx = ctx;
    }

    /* istanbul ignore next */
    public prepare(): void {}

    public async launch(): Promise<unknown> {
        // Instantiate the session backend singleton
        // This will throw if the module is configured incorrectly
        await SessionBackend.getInstance();

        return;
    }
}
