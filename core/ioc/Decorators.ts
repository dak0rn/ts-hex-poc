// import ApplicationContext from './ApplicationContext';
// We use inline-requires to prevent circular dependencies
import { inject, injectable } from 'tsyringe';
import { ThreadLocal } from '@core/lib/ThreadLocal';

/**
 * Class decorator factory that registers the decorated class under the name
 * {@link token} in the root ApplicationContext's IoC container.
 *
 * @param {string} token Name to register under
 */
export function provide(token: string): ClassDecorator {
    return function (klass) {
        require('./ApplicationContext')
            .ApplicationContext.getRootInstance()
            .register(token, klass as any);

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

        require('./ApplicationContext').ApplicationContext.getRootInstance().register(token, target[propertyKey]);
    };
}

/**
 * Decorator factory for static singleton factory functions.
 * The returned singleton is stored in the ThreadLocal store if running
 * in thread-local mode. Subsequent calls to this function will then return
 * the value from ThreadLocal without invoking the actual factory function,
 * however, outside of a thread-local call chain, every call will do that.
 *
 * Arguments on the factory function are not supported since it cannot be
 * guaranteed that `factory(X) === factory(Y)`, thus when invoked with another
 * argument, it had to be determined if the singleton needs to change and the
 * factory needs to be re-executed (paramterized singleton).
 *
 * The singleton is kept in thread-local storage with implies that once a thread-local
 * execution chain has been left, the instance will be garbage collected.
 *
 * @param token - The registration token for the thread-local {@link ApplicationContext}
 * @return Method decorator
 */
export function threadLocalSingleton(token: string): MethodDecorator {
    return function (
        target: any,
        propertyKey: string | symbol,
        descriptor: TypedPropertyDescriptor<any>
    ): TypedPropertyDescriptor<any> {
        const factory = target[propertyKey] as Function;

        descriptor.value = function (): any {
            if (!ThreadLocal.active()) {
                return factory();
            }

            // If in thread-local mode, return the instance that is in the thread-local store
            const stored = ThreadLocal.getStore().get(token);

            if (stored) return stored;

            // At this point, we are running in thread-local but we do not have a cached instance
            const instance = factory();
            ThreadLocal.getStore().set(token, instance);

            return instance;
        };

        return descriptor;
    };
}

// Re-export decorators from tsyringe
export { inject, injectable };
