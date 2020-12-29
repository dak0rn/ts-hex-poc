import { ConfigurationAdapter } from './ConfigurationAdapter';
import { Configuration } from './Configuration';
import { Utils } from '@core/shared/Utils';

export interface RawConfiguration {
    [key: string]: any;
}

/**
 * Provides access to non-system configuration items e.g. for
 * external modules
 */
export class ApplicationConfiguration extends Configuration {
    private config: RawConfiguration;

    constructor(config: RawConfiguration, sourceAdapter: ConfigurationAdapter) {
        super(sourceAdapter);
        this.config = config;
    }

    get(key: string): any {
        return Utils.getDeep(key, this.config);
    }

    validate(): void {
        // We do not make any assumptions about the application configuration
    }
}
