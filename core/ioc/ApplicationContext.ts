import 'reflect-metadata';
import { container as rootContainer, DependencyContainer, InjectionToken } from 'tsyringe';
import { constructor } from 'tsyringe/dist/typings/types';
import ThreadLocal from '@core/lib/ThreadLocal';
import { threadLocalSingleton } from './Decorators';
import CoreObject from '@core/shared/CoreObject';

/**
 * Inversion of Control container for dependency injection
 */
export default class ApplicationContext extends CoreObject {
    protected iocContainer: DependencyContainer;

    /**
     * Creates a new application context with the given IoC container.
     * Registers this {@link ApplicationContext} instance under the name
     * `ApplicationContext` within the IoC container.
     *
     * @param container IoC container to use. If `null`, will use the root container.
     */
    constructor(container: DependencyContainer | null) {
        super();

        if (null === container) {
            this.iocContainer = rootContainer;
        } else {
            this.iocContainer = container;
        }

        this.registerValue('ApplicationContext', this);
    }

    /**
     * Returns the underlying ApplicationContext's
     * This property is read-only
     */
    get container(): DependencyContainer {
        return this.iocContainer;
    }

    /**
     * Creates a new {@link ApplicationContext} derived from this {@link ApplicationContext}.
     * The underlying IoC containers are connected, resolving tokens walks up the chain, so
     * the returned child context will resolve within this context, too.
     *
     * @return {ApplicationContext} Child context
     */
    createChildContext(): ApplicationContext {
        return new ApplicationContext(this.iocContainer.createChildContainer());
    }

    /**
     * Registers a class under the given name in the underlying IoC container
     *
     * @param name Token of the registered item
     * @param klass Class to register
     */
    register<T>(name: string, klass: constructor<T>): void {
        this.container.register(name, { useClass: klass });
    }

    /**
     * Registers a static value under the given name in the underlying IoC container
     *
     * @param name Token of the registered item
     * @param value Value to register
     */
    registerValue(name: string, value: any): void {
        this.container.register(name, { useValue: value });
    }

    /**
     * Returns the value for the corresponding token.
     * Resolving walks up the context chain, so if a token has been registered
     * in a parent context, it be resolved there - if not shadowed within a child.
     *
     * @param {InjectionToken} token Token of the value/class
     * @return {unknown} The corresponding value / class
     */
    resolve(token: InjectionToken): unknown {
        return this.container.resolve(token);
    }

    /**
     * Returns a singleton of {@link ApplicationContext} respecting thread-local.
     * If not running in thread-local, will return the root instance. If in thread-local,
     * will return the singleton instance from the thread-local store. If no such
     * instance exists, creates a new instance as a child of the root context, stores
     * and returns that one.
     *
     * @return Thread-local aware singleton
     */
    @threadLocalSingleton('ApplicationContext')
    public static getInstance(): ApplicationContext {
        // The instance caching is done by @threadLocalSingleton

        const root = ApplicationContext.getRootInstance();

        if (ThreadLocal.active()) {
            return root.createChildContext();
        }

        return root;
    }

    private static rootInstance: ApplicationContext | null = null;

    /**
     * Provides access to the root {@link ApplicationContext} instance.
     * Will be lazily created if not already existing.
     *
     * The root {@link ApplicationContext} is a singleton kept outside any thread-local
     * execution contexts. It is usually better to use {@link ApplicationContext#getInstance}
     * instead.
     *
     * @return Root {@link ApplicationContext}
     */
    public static getRootInstance(): ApplicationContext {
        if (null === ApplicationContext.rootInstance) {
            ApplicationContext.rootInstance = new ApplicationContext(null);
        }

        return ApplicationContext.rootInstance;
    }
}
