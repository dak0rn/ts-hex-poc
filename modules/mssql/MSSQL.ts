import ApplicationConfiguration from '@core/configuration/ApplicationConfiguration';
import { TransactionManagerRegistry } from '@core/io/datastores/TransactionManagerRegistry';
import ApplicationContext from '@core/ioc/ApplicationContext';
import { injectable, inject, threadLocalSingleton } from '@core/ioc/Decorators';
import SystemLogger from '@core/log/SystemLogger';
import { ApplicationModuleLauncher } from '@core/module/Module';
import Knex from 'knex';
import knex from 'knex';
import { MSSQLTransactionManager } from './MSSQLTransactionManager';

export class DatabaseURLNotDefinedError extends Error {
    constructor() {
        super('No database URL is defined in mssql.url');
    }
}

@injectable()
export default class MSSQL implements ApplicationModuleLauncher {
    protected log: SystemLogger;
    protected ctx: ApplicationContext;
    protected isDEV: boolean;

    constructor(
        @inject('core.SystemLogger') log: SystemLogger,
        @inject('core.ApplicationContext') ac: ApplicationContext,
        @inject('core.DEV') isDEV: boolean
    ) {
        this.log = log.createChild('MSSQL');
        this.ctx = ac;
        this.isDEV = isDEV;
    }

    public async launch(): Promise<unknown> {
        this.log.info('Starting up');

        const conf = this.ctx.resolve('core.ApplicationConfiguration') as ApplicationConfiguration;
        let dbUrl: string;

        let connectionParams: Knex.StaticConnectionConfig;

        try {
            dbUrl = conf.get('mssql.url') as string;
        } catch (err) {
            throw new DatabaseURLNotDefinedError();
        }

        if (!dbUrl) {
            this.log.error('No database URL was configured');
            throw new DatabaseURLNotDefinedError();
        }

        try {
            const u = new URL(dbUrl);

            if (u.pathname.length <= 1) throw new Error('No database specified');

            connectionParams = {
                port: parseInt(u.port || '1433', 10),
                password: u.password,
                user: u.username,
                server: u.hostname,
                database: u.pathname.substr(1),
                options: {
                    enableArithAbort: true
                }
            };
        } catch (e) {
            throw e;
        }

        const connection = knex({
            client: 'mssql',
            connection: connectionParams,
            asyncStackTraces: this.isDEV
        });

        await this.verifyConnection(connection);

        this.ctx.registerValue('mssql.Connection', connection);

        return;
    }

    public prepare(): void {
        TransactionManagerRegistry.getInstance().register(new MSSQLTransactionManager());
    }

    protected async verifyConnection(connection: knex): Promise<void> {
        this.log.info('Verifying connection...');
        await connection.raw('SELECT 1');
        this.log.info('Success.');
    }
}
