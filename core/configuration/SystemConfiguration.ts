import { ConfigurationAdapter } from './ConfigurationAdapter';
import { Configuration, InvalidConfigurationException } from './Configuration';
import { Utils } from '@core/shared/Utils';
import path from 'path';

export interface RawConfiguration {
    [key: string]: any;
}

export const enum ExecutionEnvironment {
    Production = 'production',
    Development = 'development'
}

const validEnvironments = [ExecutionEnvironment.Production, ExecutionEnvironment.Development];

/**
 * Provides access to the configuration for the application server
 */
export class SystemConfiguration extends Configuration {
    private config: RawConfiguration;

    /**
     * Absolute path to the directory housing the application
     */
    public applicationPath: string;

    constructor(config: RawConfiguration, sourceAdapter: ConfigurationAdapter) {
        super(sourceAdapter);

        this.config = config;
        this.applicationPath = '';
    }

    get(key: string): any {
        return Utils.getDeep(key, this.config);
    }

    validate(): void {
        const c = this.config;

        if (!c.hasOwnProperty('moduleFolder') || 0 === c.moduleFolder.length) {
            throw new InvalidConfigurationException('Configuration does not have `moduleFolder` set');
        }

        if (!c.hasOwnProperty('log') || 0 === c.log.length) {
            throw new InvalidConfigurationException('Configuration does not have `log` set');
        }

        if (!c.hasOwnProperty('environment') || !validEnvironments.includes(c.environment)) {
            throw new InvalidConfigurationException(`Invalid value for system.environment: ${c.environment}`);
        }

        if (c.hasOwnProperty('modules') && !Array.isArray(c.modules)) {
            throw new InvalidConfigurationException(
                'Configuration has declared modules but that key is not an array of strings'
            );
        }

        if (!c.hasOwnProperty('defaultTransactionManager') || 0 === c.defaultTransactionManager.length) {
            throw new InvalidConfigurationException('No system.defaultTransactionManager declared');
        }

        if (!c.hasOwnProperty('scan') || !Array.isArray(c.scan) || 0 === c.scan.length) {
            throw new InvalidConfigurationException('No application folders declared in system.scan');
        }
    }

    /**
     * Returns the name of the module folder from the configuration
     *
     * @return {string} Name of the module folder
     */
    moduleFolder(): string {
        return this.config.moduleFolder;
    }

    /**
     * Returns the configured modules from the configuration
     *
     * @return {string[]} List of modules
     */
    modules(): string[] {
        return this.config.modules;
    }

    /**
     * Returns the environment the application is running in
     *
     * @return {string} Environment
     */
    environment(): ExecutionEnvironment {
        return this.config.environment;
    }

    /**
     * Returns the name of the logger from the configuration
     *
     * @return {string} Name of the logger
     */
    log(): string {
        return this.config.log;
    }

    /**
     * Returns the default transaction manager to be used when using `@transactional`
     *
     * @return Default transaction manager
     */
    defaultTransactionManager(): string {
        return this.config.defaultTransactionManager;
    }

    /**
     * Returns the folders to be scanned by a {@link ProjectScanner}
     * Each folder is an absolute path.
     *
     * @return List of folders
     */
    projectFolders(): string[] {
        return this.config.scan.map((folder: string) => this.resolvePath(folder));
    }

    /**
     * Resolves the value for the given key relative to {@link applicationPath}.
     * Respects absolute paths.
     *
     * Does not check for types from values return, so it will break for non-strings.
     *
     * @param key Path as used with {@link Configuration#get}
     */
    resolvePathForKey(key: string): string {
        return this.resolvePath(this.get(key));
    }

    /**
     * Resolves the given path relative to the {@link #applicationPath}
     *
     * @param value Path to resolve
     */
    public resolvePath(value: string): string {
        if (path.isAbsolute(value)) return value;

        return path.resolve(this.applicationPath, value);
    }
}
