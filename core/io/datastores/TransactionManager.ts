import CoreObject from '@core/shared/CoreObject';
import { TransactionError } from './TransactionError';

/**
 * Defines the interface and common functionality for transaction managers.
 * A transaction manager is responsible for managing transactions in methods
 * annotated with `@transactional`.
 *
 * The transaction manager is supposed to maintain a Unit of Work (UoW) keeping track
 * of transaction-relevant operations. That is usually done by providing a UoW object
 * to the {@link ApplicationContext}, shadowing or replacing an existing and restoring
 * it after the transaction has completed.
 */
export abstract class TransactionManager<T> extends CoreObject {
    /**
     * Returns the type for this {@link TransactionManager}.
     * This is essentially the type of underlying data store, e.g. "postgresql".
     * The type can be freely chosen, however, has to be unique across modules used
     * in an application.
     */
    public abstract get type(): string;

    /**
     * Starts a transaction in the data store
     * The {@link TransactionManager} is responsible for providing the database transaction
     * through the {@link ApplicationContext}, usually in a thread-local fashion. Thus, it is
     * better to use {@link ApplicationContext#getInstance} than injecting it into the constructor
     * because the instance will be different.
     *
     * The return value is passed to {@link #commit} and {@link #rollback} allowing to keep state
     * between transaction executions without the need to pollute some global/thread-local storage.
     *
     * @returns State object
     */
    public abstract begin(): Promise<T>;

    /**
     * Performs a commit of the transaction
     * If this method throws, {@link #rollback} will be invoked with a {@link TransactionError}
     * wrapping the thrown error.
     */
    public abstract commit(state: T): Promise<void>;

    /**
     * Performs a rollback of the transaction
     * The error given wraps the error thrown during {@link #commit} or the execution during the
     * transaction.
     *
     * @param error The error aborting the transaction
     */
    public abstract rollback(error: TransactionError, state: T): Promise<void>;
}
