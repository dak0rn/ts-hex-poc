import { CoreObject } from '@core/shared/CoreObject';
import { ApplicationConfiguration } from './ApplicationConfiguration';
import { SystemConfiguration } from './SystemConfiguration';

/**
 * An abstract adapter for configuration parsing
 */
export abstract class ConfigurationAdapter extends CoreObject {
    /**
     * URI if the resource to retrieve the configuration from
     */
    protected uri: string;

    /**
     * Creates a new {@link ConfigurationAdapter} with the given
     * resource locator.
     *
     * @param uri URI of the resource to use to retrieve the configuration
     */
    constructor(uri: string) {
        super();
        this.uri = uri;
    }

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
