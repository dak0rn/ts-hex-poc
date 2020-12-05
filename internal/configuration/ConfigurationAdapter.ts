import ApplicationConfiguration from './ApplicationConfiguration';
import SystemConfiguration from './SystemConfiguration';

/**
 * An abstract adapter for configuration parsing
 */
export default abstract class ConfigurationAdapter {
    /**
     * Creates a new {@link ConfigurationAdapter} with the given
     * resource locator.
     *
     * @param uri URI of the resource to use to retrieve the configuration
     */

    constructor(protected uri: string) {}

    /**
     * Returns the {@link SystemConfiguration} retrieved through the implemented
     * adapter.
     *
     * @returns {SystemConfiguration} The {@link SystemConfiguration}
     */
    abstract system(): SystemConfiguration;

    /**
     * Returns the {@link ApplicationConfiguration} retrieved through the implemented
     * adapter.
     *
     * @returns {ApplicationConfiguration} The {@link ApplicationConfiguration}
     */
    abstract application(): ApplicationConfiguration;
}
