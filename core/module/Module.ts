import ApplicationContext from '@core/ioc/ApplicationContext';

/**
 * Interface of entry point for modules
 */
export interface ApplicationModule {
    /**
     * Return the class of the module
     * The return class will be instantiated through the IoC container and is
     * expected to implement {@link ApplicationModuleLauncher}.
     *
     * @return Class
     */
    getClass(): { new (...args: any[]): any };
}

/**
 * Module launcher that is used to configure and start a module
 */
export interface ApplicationModuleLauncher {
    /**
     * Launches the module operation
     * This method can block
     */
    launch(): Promise<unknown>;

    /**
     * Prepares the module startup
     * This method is not supposed to block and is usually used to instrument
     * stateful resources (IoC, registries, ...) in the core
     */
    prepare(): void;
}

export default class Module implements ApplicationModule {
    /**
     * Underlying module definition
     */
    protected mod: ApplicationModule | null;

    /**
     * Underlying instance of the module
     */
    protected instance: ApplicationModuleLauncher | null;

    constructor(mod: ApplicationModule) {
        this.mod = mod;
        this.instance = null;
    }

    /**
     * Returns the module's class
     *
     * @return Module class
     */
    public getClass(): { new (...args: any[]): any } {
        return this.mod!.getClass();
    }

    /**
     * Launches the module
     */
    public async launch(): Promise<unknown> {
        return await this.instance!.launch();
    }

    /**
     * Prepares the module launch
     * Instantiates the module using the given {@link ApplicationContext}
     *
     * @param ctx {@link ApplicationContext} to instantiate the module with
     */
    public prepare(ctx: ApplicationContext): void {
        const klass = this.getClass();

        this.instance = ctx.resolve(klass) as ApplicationModuleLauncher;
        this.instance.prepare();
    }

    /**
     * Returns the underlying ApplicationModule
     *
     * @return Underlying module
     */
    public getApplicationModule(): ApplicationModule | null {
        return this.mod;
    }
}
