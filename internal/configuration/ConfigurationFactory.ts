import ConfigurationAdapter from './ConfigurationAdapter';
import IniAdapter from './IniAdapter';

/**
 * An exception indicating that a given configuration resource cannot
 * be parsed because the corresponding adapter could not be found.
 */
export class MissingAdapterException extends Error {
    constructor(resource: string) {
        super(`No configuration adapter for the following configuration resource exists: ${resource}`);
    }
}

/**
 * Factory class for configuration adapters
 */
export default class ConfigurationFactory {
    private constructor() {}

    /**
     * Creates a new {@link ConfigurationAdapter} for the given configuration
     * resource.
     *
     * @throws {MissingAdapterException} If no adapter was found for the given resource.
     */
    static getInstance(uri: string): ConfigurationAdapter {
        if (uri.endsWith('.ini')) return new IniAdapter(uri);

        throw new MissingAdapterException(uri);
    }
}
