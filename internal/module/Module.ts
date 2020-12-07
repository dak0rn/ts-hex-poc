import ApplicationContext from '@internal/ioc/ApplicationContext';
import { ApplicationModule, ApplicationModuleLauncher } from '@internal/types/modules';

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
    getClass(): { new (...args: any[]): any } {
        return this.mod!.getClass();
    }

    /**
     * Launches the module using the provided {@link ApplicationContext}
     *
     * @param ctx {@link ApplicationContext} to launch the module with
     */
    launch(ctx: ApplicationContext): void {
        const klass = this.getClass();

        this.instance = ctx.resolve(klass) as ApplicationModuleLauncher;

        this.instance.launch();
    }

    /**
     * Returns the underlying ApplicationModule
     *
     * @return Underlying module
     */
    getApplicationModule(): ApplicationModule | null {
        return this.mod;
    }
}
