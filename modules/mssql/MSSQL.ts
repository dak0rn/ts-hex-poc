import ApplicationConfiguration from '@core/configuration/ApplicationConfiguration';
import ApplicationContext from '@core/ioc/ApplicationContext';
import { injectable, inject, threadLocalSingleton } from '@core/ioc/Decorators';
import SystemLogger from '@core/log/SystemLogger';
import { ApplicationModuleLauncher } from '@core/types/modules';
import knex from 'knex';

export class DatabaseURLNotDefinedError extends Error {
    constructor() {
        super('No database URL is defined in mssql.url');
    }
}

@injectable()
export default class MSSQL implements ApplicationModuleLauncher {
    protected log: SystemLogger;
    protected ctx: ApplicationContext;

    constructor(@inject('SystemLogger') log: SystemLogger, @inject('ApplicationContext') ac: ApplicationContext) {
        this.log = log.createChild('MSSQL');
        this.ctx = ac;
    }

    public async launch(): Promise<unknown> {
        this.log.info('Starting up');

        const conf = this.ctx.resolve('ApplicationConfiguration') as ApplicationConfiguration;
        let dbUrl: string;

        try {
            dbUrl = conf.get('mssql.url') as string;
        } catch (err) {
            throw new DatabaseURLNotDefinedError();
        }

        if (!dbUrl) {
            this.log.error('No database URL was configured');
            throw new DatabaseURLNotDefinedError();
        }

        const connection = knex({
            client: 'mssql',
            connection: dbUrl
        });

        await this.verifyConnection(connection);

        this.ctx.registerValue('MSSQLConnection', connection);

        return;
    }

    protected async verifyConnection(connection: knex): Promise<void> {
        this.log.info('Verifying connection...');
        await connection.raw('SELECT 1');
        this.log.info('Success.');
    }
}
