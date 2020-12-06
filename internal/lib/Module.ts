import { ApplicationModule } from '@internal/types/modules';
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
     * Defaults to {@link global.require}
     */
    public loader: Function;

    /**
     * Path of the module folder, must not include the
     * module entry point file name
     */
    public modulePath: string | null;

    protected mod: ApplicationModule | null;

    constructor() {
        this.modulePath = null;
        this.loader = global.require;
        this.mod = null;
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
}
