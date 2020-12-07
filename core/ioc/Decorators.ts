import RootApplicationContext from './RootApplicationContext';
import { inject, injectable } from 'tsyringe';

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

// Re-export decorators from tsyringe
export { inject, injectable };
