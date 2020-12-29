import { SystemConfiguration } from '@core/configuration/SystemConfiguration';
import { ApplicationContext } from '@core/ioc/ApplicationContext';
import { CoreObject } from '@core/shared/CoreObject';
import { inject, injectable } from 'tsyringe';
import { TransactionManager } from './TransactionManager';

/**
 * A {@link TransactionManager} was registered under a name already provided
 */
export class DuplicateTransactionManagerError extends Error {
    /**
     * Creates a new {@link DuplicateTransactionManagerError} with the given name
     *
     * @param name The duplicate key
     */
    constructor(name: string) {
        super(`Duplicate transaction manager registration for name "${name}"`);
    }
}

/**
 * A default {@link TransactionManager} was configured but does not exist at runtime
 */
export class DefaultTransactionManagerDoesNotExistError extends Error {
    /**
     * Creates a new {@link DefaultTransactionManagerDoesNotExistError}
     *
     * @param name Name of the default
     */
    constructor(name: string) {
        super(`The default transaction manager "${name}" does not exist`);
    }
}

/**
 * A {@link TransactionManager} was referenced but does not exist
 */
export class TransactionManagerDoesNotExistError extends Error {
    /**
     * Creates a new {@link TransactionManagerDoesNotExistError}
     *
     * @param name Name of the default
     */
    constructor(name: string) {
        super(`The transaction manager "${name}" does not exist`);
    }
}

/**
 * Registry singleton managing available {@link TransactionManager}s.
 */
@injectable()
export class TransactionManagerRegistry extends CoreObject {
    protected registry: Map<string, TransactionManager<any>>;
    protected defaultManager: string;

    constructor(@inject('core.SystemConfiguration') sc: SystemConfiguration) {
        super();

        this.registry = new Map<string, TransactionManager<any>>();
        this.defaultManager = sc.defaultTransactionManager();
    }

    /**
     * Registers the given {@link TransactionManager} under its key.
     *
     * @throws {@link DuplicateTransactionManagerError}
     * Thrown in case of duplicate manager keys
     *
     * @param manager Manager to register
     */
    public register(manager: TransactionManager<any>): void {
        const key = manager.type;

        if (this.registry.has(key)) {
            throw new DuplicateTransactionManagerError(key);
        }

        this.registry.set(key, manager);
    }

    /**
     * Returns the defaut {@link TransactionManager}
     *
     * @throws {@link DefaultTransactionManagerDoesNotExistError}
     * Thrown if the configured default does not exist
     *
     * @return Default {@link TransactionManager}
     */
    public get default(): TransactionManager<any> {
        const tm = this.registry.get(this.defaultManager);

        if (!tm) {
            throw new DefaultTransactionManagerDoesNotExistError(this.defaultManager);
        }

        return tm;
    }

    /**
     * Returns the {@link TransactionManager} for the given name
     *
     * @param name Name of the {@link TransactionManager}
     * @return The {@link TransactionManager}
     */
    public forName(name: string): TransactionManager<any> {
        const tm = this.registry.get(name);

        if (!tm) {
            throw new TransactionManagerDoesNotExistError(name);
        }

        return tm;
    }

    /**
     * The singleton
     */
    protected static instance: TransactionManagerRegistry | null = null;

    /**
     * Returns the singleton instance of {@link TransactionManagerRegistry}
     *
     * @return The instance
     */
    public static getInstance(): TransactionManagerRegistry {
        if (TransactionManagerRegistry.instance === null) {
            TransactionManagerRegistry.instance = ApplicationContext.getRootInstance().resolve(
                TransactionManagerRegistry
            ) as TransactionManagerRegistry;
        }

        return TransactionManagerRegistry.instance;
    }
}
