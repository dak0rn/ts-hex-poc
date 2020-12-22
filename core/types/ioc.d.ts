export class ApplicationContext {
    /**
     * Creates a new application context with the given IoC container.
     *
     * @param container IoC container to use. If `null`, will use the root container.
     */
    constructor(container: DependencyContainer | null);

    /**
     * Returns the underlying ApplicationContext's
     * This property is read-only
     */
    get container(): DependencyContainer;

    /**
     * Creates a new {@link ApplicationContext} derived from this {@link ApplicationContext}.
     * The underlying IoC containers are connected, resolving tokens walks up the chain, so
     * the returned child context will resolve within this context, too.
     *
     * @return {ApplicationContext} Child context
     */
    createChildContext(): ApplicationContext;

    /**
     * Registers a class under the given name in the underlying IoC container
     *
     * @param name Token of the registered item
     * @param klass Class to register
     */
    register<T>(name: string, klass: constructor<T>): void;

    /**
     * Registers a static value under the given name in the underlying IoC container
     *
     * @param name Token of the registered item
     * @param value Value to register
     */
    registerValue(name: string, value: any): void;

    /**
     * Returns the value for the corresponding token.
     * Resolving walks up the context chain, so if a token has been registered
     * in a parent context, it be resolved there - if not shadowed within a child.
     *
     * @param {InjectionToken} token Token of the value/class
     * @return {unknown} The corresponding value / class
     */
    resolve(token: InjectionToken): unknown;
}
