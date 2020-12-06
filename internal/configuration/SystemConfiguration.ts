import ConfigurationAdapter from './ConfigurationAdapter';
import Configuration, { InvalidConfigurationException } from './Configuration';
import Utils from '@internal/shared/Utils';

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
export default class SystemConfiguration extends Configuration {
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
}
