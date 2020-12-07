import ApplicationContext from '@internal/ioc/ApplicationContext';
import { ApplicationModule, ApplicationModuleLauncher } from '@internal/types/modules';
import path from 'path';

const MODULE_ENTRYPOINT = 'index.ts';

export class MissingModulePathException extends Error {
    constructor() {
        super('No modulePath set');
    }
}

export class MissingModuleException extends Error {
    constructor(modulePath: string) {
        super(`Cannot file module at ${modulePath}`);
    }
}

export default class Module implements ApplicationModule {
    /**
     * Function to load the module
     * Defaults to {@link require}
     */
    public loader: Function;

    /**
     * Path of the module folder, must not include the
     * module entry point file name
     */
    public modulePath: string | null;

    /**
     * Underlying module definition
     */
    protected mod: ApplicationModule | null;

    /**
     * Underlying instance of the module
     */
    protected instance: ApplicationModuleLauncher | null;

    constructor() {
        this.modulePath = null;
        this.loader = require;
        this.mod = null;
        this.instance = null;
    }

    /**
     * Load loads the module
     *
     * This method needs to be called in order to use any other module
     * related ones.
     *
     * Subsequent calls to this method will not have any effects.
     */
    load() {
        if (this.mod !== null) {
            return this.mod;
        }

        if (null === this.modulePath || '' === this.modulePath) {
            throw new MissingModulePathException();
        }

        const target = path.resolve(this.modulePath, MODULE_ENTRYPOINT);

        try {
            this.mod = this.loader(target) as ApplicationModule;
        } catch (err: any) {
            throw new MissingModuleException(target);
        }
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
}
