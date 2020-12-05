import ConfigurationAdapter from './ConfigurationAdapter';

export class InvalidConfigurationException extends Error {
    constructor(message: string) {
        super(message);
    }
}

/**
 * Base class for the configuration stores
 */
export default abstract class Configuration {
    /**
     * The {@link ConfigurationAdapter} that retrieved the values for
     * this {@link Configuration}.
     */
    protected sourceAdapter: ConfigurationAdapter;

    constructor(sourceAdapter: ConfigurationAdapter) {
        this.sourceAdapter = sourceAdapter;
    }

    /**
     * Returns the value for the given key from the application configuration.
     * Does not check for existence of the key nor perform any type checks / conversions.
     *
     * @param key The key of the value to retrieve. Can be hierarchical by using dots
     * @return The value for {@link key}
     */
    abstract get(key: string): any;

    /**
     * Validates the configuration and throws an {@link InvalidConfigurationException}
     * if the configuration provided is not valid.
     *
     * @throws {InvalidConfigurationException} If configuration is not valid
     */
    abstract validate(): void;
}
