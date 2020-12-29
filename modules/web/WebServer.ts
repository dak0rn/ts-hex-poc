import { injectable, inject } from '@core/ioc/Decorators';
import { SystemLogger } from '@core/log/SystemLogger';
import { ApplicationModuleLauncher } from '@core/module/Module';
import express, { Express } from 'express';
import { FrontController } from './lib/FrontController';
import { MiddlewareRegistry, MultipleMiddlewaresWithSameOrderError } from './lib/MiddlewareRegistry';

@injectable()
export class WebServer implements ApplicationModuleLauncher {
    protected log: SystemLogger;
    protected server: Express | null;
    protected ctrl: FrontController;

    constructor(@inject('core.SystemLogger') log: SystemLogger, @inject('http.FrontController') ctrl: FrontController) {
        this.log = log.createChild('HTTP');
        this.server = null;
        this.ctrl = ctrl;
    }

    public prepare(): void {
        this.validateMiddlewares();
    }

    protected validateMiddlewares() {
        const table = new Map<number, string>();

        for (const mw of MiddlewareRegistry.getInstance().middlewares) {
            // Two middlewares with the same order will yield an error
            if (table.has(mw.order)) {
                throw new MultipleMiddlewaresWithSameOrderError(mw.class.name, table.get(mw.order) as string);
            }

            table.set(mw.order, mw.class.name);
        }
    }

    public async launch(): Promise<unknown> {
        this.log.info('Starting the web server...');

        this.server = express();

        this.ctrl.setup(this.server);
        this.server.listen(4000);

        return;
    }
}
