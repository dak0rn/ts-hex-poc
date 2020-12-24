import { injectable, inject, ApplicationContext } from '@core';
import { ApplicationModuleLauncher } from '@core/types/modules';
import SessionBackend from './SessionBackend';

@injectable()
export default class SessionProvider implements ApplicationModuleLauncher {
    protected ctx: ApplicationContext;

    constructor(@inject('ApplicationContext') ctx: ApplicationContext) {
        this.ctx = ctx;
    }

    launch(): Promise<unknown> {
        // Instantiate the session backend singleton
        // This will throw if the module is configured incorrectly
        SessionBackend.getInstance();

        return Promise.resolve();
    }
}
