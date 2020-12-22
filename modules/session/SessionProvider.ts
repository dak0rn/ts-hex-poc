import { injectable, inject } from '@core';

@injectable()
export default class SessionProvider implements ApplicationModuleLauncher {
    protected ctx: ApplicationContext;

    constructor(@inject('ApplicationContext') ctx: ApplicationContext) {
        this.ctx = ctx;
    }

    launch(): Promise<unknown> {
        throw new Error('Method not implemented.');
    }
}
