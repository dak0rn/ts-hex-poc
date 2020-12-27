import { injectable, inject } from '@core/ioc/Decorators';
import SystemLogger from '@core/log/SystemLogger';
import { ApplicationModuleLauncher } from '@core/module/Module';

@injectable()
export default class WebServer implements ApplicationModuleLauncher {
    protected log: SystemLogger;

    constructor(@inject('SystemLogger') log: SystemLogger) {
        this.log = log;
    }

    public prepare(): void {}

    public launch(): Promise<unknown> {
        return new Promise(resolve => {
            this.log.info('Starting the web server...');

            setTimeout(() => {
                this.log.info('Tearing down web server...');
            }, 5000);
        });
    }
}
