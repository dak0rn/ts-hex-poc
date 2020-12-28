import { TransactionError } from '@core/io/datastores/TransactionError';
import { TransactionManager } from '@core/io/datastores/TransactionManager';
import ApplicationContext from '@core/ioc/ApplicationContext';
import Knex from 'knex';

/**
 * Transaction manager for MSSQL transactions
 */
export class MSSQLTransactionManager extends TransactionManager<Knex> {
    protected readonly contextKey: string = 'mssql.Connection';

    public get type(): string {
        return 'mssql';
    }

    public async begin(): Promise<Knex> {
        const ctx = ApplicationContext.getInstance();

        const db = ctx.resolve(this.contextKey) as Knex;
        const trx = await db.transaction();

        ctx.registerValue(this.contextKey, trx);

        return db;
    }

    protected reset(db: Knex): void {
        ApplicationContext.getInstance().registerValue(this.contextKey, db);
    }

    public async commit(db: Knex): Promise<void> {
        const trx = ApplicationContext.getInstance().resolve(this.contextKey) as Knex.Transaction;

        await trx.commit();

        this.reset(db);
    }

    public async rollback(error: TransactionError, db: Knex): Promise<void> {
        const trx = ApplicationContext.getInstance().resolve(this.contextKey) as Knex.Transaction;
        console.log('Rolling back here');
        
        await trx.rollback();

        this.reset(db);
    }
}
