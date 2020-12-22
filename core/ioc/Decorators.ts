import RootApplicationContext from './RootApplicationContext';
import { inject, injectable } from 'tsyringe';
import ThreadLocal from '@core/lib/ThreadLocal';

/**
 * Class decorator factory that registers the decorated class under the name
 * {@link token} in the root ApplicationContext's IoC container.
 *
 * @param {string} token Name to register under
 */
export function provide(token: string): ClassDecorator {
    return function (klass) {
        RootApplicationContext.getInstance().register(token, klass as any);

        return klass;
    };
}

/**
 * Method decorator factory that registers the decorated method under the name
 * {@link token} in the root ApplicationContext's IoC container.
 * Use with static factory functions.
 *
 * @param token Token to register under
 */
export function provideFactory(token: string): MethodDecorator {
    return function (target: any, propertyKey: string | symbol): void {
        const func = target[propertyKey] as Function;

        if (func.length > 0)
            throw new Error(
                `Cannot decorate ${target.constructor.name}.${
                    propertyKey as string
                } with @provideFactory because it expects arguments.`
            );

        RootApplicationContext.getInstance().register(token, target[propertyKey]);
    };
}

/**
 * Parameterized class decorator that overwrites the static getInstance() function.
 *
 * The new imlpementation first tries to retrieve an existing instance
 * from the thread-local store under the key provided. If that fails,
 * it will create a new instance by either calling the constructor or by
 * using the optionally provided factory function.
 * The new instance is stored in the thread-local cache if in thread-local
 * mode.
 *
 * @param key Thread-local store key
 * @param factory Optional factory used to create instances instead of the classes constructor
 * @return Class decorator
 */
export function threadLocalFactory(key: string, factory?: () => object): Function {
    return function <T extends { new (...args: any[]): any }>(klass: T) {
        // Overwrite the existing static getInstance method
        Object.defineProperty(klass, 'getInstance', {
            value: function (): T {
                // Try to retrieve the value from the thread-local store
                const store = ThreadLocal.getStore() as Map<string, any>;

                if (store) {
                    const instance = store.get(key);

                    if (instance) {
                        return instance;
                    }
                }

                if (!factory) return new klass();

                return factory() as T;
            }
        });

        return klass;
    };
}

// Re-export decorators from tsyringe
export { inject, injectable };
