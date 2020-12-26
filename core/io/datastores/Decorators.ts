import { TransactionError } from './TransactionError';
import { TransactionManager } from './TransactionManager';
import { TransactionManagerRegistry } from './TransactionManagerRegistry';

/**
 * Wraps the annotated method into a transaction
 * Uses the {@link TransactionManager} with the given name or the default as
 * configured in the application configuration
 *
 * In case of an error, the {@link TransactionManager}'s {@link TransactionManager#rollback} is
 * invoked with the wrapper error {@link TransactionError} and the original error is re-thrown.
 * Errors occuring in {@link TransactionManager#rollback} are not trapped, thus, a `throw` in
 * {@link TransactionManager#rollback} will bubble up and prevent the original error from being thrown.
 *
 * @param manager Optional name of the manager to use
 */
export function transactional(manager?: string): MethodDecorator {
    return function (target: any, propertyKey: string | symbol, desc: PropertyDescriptor): PropertyDescriptor {
        const func = desc.value as Function;

        desc.value = async function (...args: any[]): Promise<any> {
            const tmr = TransactionManagerRegistry.getInstance();
            let mgr: TransactionManager<any>;

            if (manager) {
                mgr = tmr.forName(manager);
            } else {
                mgr = tmr.default;
            }

            const state: any = await mgr.begin();
            let returnValue: any;

            try {
                returnValue = await func.apply(this, args);
                await mgr.commit(state);
            } catch (err) {
                await mgr.rollback(new TransactionError(err), state);
                throw err;
            }

            return returnValue;
        };

        return desc;
    };
}
