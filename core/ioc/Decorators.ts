import RootApplicationContext from './RootApplicationContext';
import { inject, injectable } from 'tsyringe';
import ThreadLocal from '@core/lib/ThreadLocal';

/**
 * Class decorator that registers the decorated class under the name
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
 * @hasContextFactory('banana')
 * class Apple {
 *
 *     public static getContextInstance(): Apple {}
 * }
 *
 * hasContextFactory then implements getContextInstance() with checking for
 * an existing instance under 'banana' in the ThreadLocal store.
 * If there is no store or there is no entry, it returns new Apple()
 */

/*
 POC:

 function threadLocalFactory(key: string) {
	return function<T extends { new(...args:  any[]): any }>(klass: T) {
		
        Object.defineProperty(klass, 'getInstance', {
            value: function(): T {
                console.log('x)');
                return new klass();
            }
        })

        return klass;
	};
}

//// 2:

function threadLocalFactory(key: string, factory?: () => object) {
	return function<T extends { new(...args:  any[]): any }>(klass: T) {
		
        Object.defineProperty(klass, 'getInstance', {
            value: function(): T {
                if('app' !== key || !factory)
                return new klass();

                return factory() as T;
            }
        })

        return klass;
	};
}
*/

export function threadLocalFactory(key: string, factory?: () => object) {
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
