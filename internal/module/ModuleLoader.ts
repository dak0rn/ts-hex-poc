import SystemConfiguration from '@internal/configuration/SystemConfiguration';
import Module from './Module';
import path from 'path';

const ENTRYPOINT_FILE = 'index.ts';

export class ModuleLoadingFailedException extends Error {
    constructor(reason: string) {
        super(reason);
    }
}

/**
 * A simple module loader that loads modules referenced by 'moduleFolder'
 * and 'modules[]' in the {@link SystemConfiguration}.
 */
export default class ModuleLoader {
    /**
     * The module loader function
     * Defaults to global.require
     */
    public loader: Function = global.require;

    protected config: SystemConfiguration;

    constructor(config: SystemConfiguration) {
        this.config = config;
    }

    /**
     * Loads the modules referenced in the configuration and
     * returns them
     *
     * @return Loaded modules
     */
    load(): Module[] {
        const base = this.config.resolvePathForKey('moduleFolder');
        const modules = this.config.modules();
        const loaded: Module[] = [];

        for (const moduleName of modules) {
            const modulePath = path.resolve(base, moduleName, ENTRYPOINT_FILE);
            try {
                const mod = this.loader(modulePath) as Module;
                loaded.push(mod);
            } catch (err: any) {
                if (err.hasOwnProperty('message'))
                    throw new ModuleLoadingFailedException(
                        `Failed to load module ${moduleName} due to: ${err.message}`
                    );

                throw new ModuleLoadingFailedException(`Failed to load module ${moduleName} for unknown reason`);
            }
        }

        return loaded;
    }
}
