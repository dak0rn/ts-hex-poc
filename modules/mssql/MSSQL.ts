import { injectable, inject } from '@core/ioc/Decorators';
import SystemLogger from '@core/log/SystemLogger';

@injectable()
export default class MSSQL implements ApplicationModuleLauncher {
    protected log: SystemLogger;

    constructor(@inject('SystemLogger') log: SystemLogger) {
        this.log = log;
    }

    launch(): Promise<unknown> {
        return new Promise(resolve => {
            this.log.info('Starting the MSSQL connector...');

            setTimeout(resolve, 10000);
        });
    }
}
