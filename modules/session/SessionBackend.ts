import { ApplicationConfiguration } from '@core/configuration/ApplicationConfiguration';
import { ApplicationContext } from '@core/ioc/ApplicationContext';
import { BaseSession } from './BaseSession';

/**
 * Error indicating that no session backend was configured in the application configuration
 */
export class SessionBackendNotConfiguredError extends Error {
    /* istanbul ignore next */
    constructor() {
        super('No session backend has been configured in session.backend');
    }
}

/**
 * Error indicating that the configured session backend does not exist
 */
export class SessionBackendNotSupportedError extends Error {
    /* istanbul ignore next */
    constructor(backend: string) {
        super(`The configured session backend "${backend}" is not supported`);
    }
}

/**
 * Lookup type for available backends
 * The key is the unique identifier to be used in the configuration file
 * The value for each key is a function that lazily requires the desired backend
 */
export interface AvailableBackends {
    [key: string]: () => { new (...args: any[]): any };
}

/**
 * Lookup table for available session backends
 */
/* istanbul ignore next */
export const availableBackends: AvailableBackends = {
    memory: () => require('./backends/MemoryBackend').MemoryBackend,
    redis: () => require('./backends/RedisBackend').RedisBackend
};

/**
 * Base class for all session backends and factory class to
 * create the backend configured in the {@link ApplicationConfiguration}.
 */
export abstract class SessionBackend {
    protected static _instance: SessionBackend | null = null;

    /**
     * Persists the given {@link BaseSession} under its surrogate key
     * in the session backend.
     *
     * @param session Session to persist
     */
    public abstract put(session: BaseSession): Promise<void>;

    /**
     * Retrieves a {@link BaseSession} identified by the given key
     * from the session backend and uses the given object to deserialize
     * the value found. The return value indicates success; `false` is returned
     * if no entity was found.
     *
     * @param key Surrogate key of the session
     * @param obj Session object to deserialize into
     */
    public abstract fetch<T extends BaseSession>(key: string, obj: T): Promise<boolean>;

    /**
     * Sets up the session backend
     * Overwrite if the backend has to perform stateful, async operations (e.g. connecting to a database)
     */
    protected async setup(): Promise<void> {}

    /**
     * Returns the {@link SessionBackend} that is configured in the application configuration
     * Set the key `session.backend` to the name of a supported backend as listed in {@link availableBackends}.
     * The backend is a singleton.
     *
     * @return Session backend
     */
    public static async getInstance(): Promise<SessionBackend> {
        if (!SessionBackend._instance) {
            const ac = ApplicationContext.getInstance();
            const conf = ac.resolve('core.ApplicationConfiguration') as ApplicationConfiguration;

            let configuredBackend: string;

            try {
                configuredBackend = conf.get('session.backend');
            } catch (err) {
                throw new SessionBackendNotConfiguredError();
            }

            if (!configuredBackend) {
                throw new SessionBackendNotConfiguredError();
            }

            const load = availableBackends[configuredBackend];

            if (!load) {
                throw new SessionBackendNotSupportedError(configuredBackend);
            }

            const klass = load();

            SessionBackend._instance = ac.resolve(klass) as SessionBackend;
            await SessionBackend._instance.setup();
        }

        return SessionBackend._instance;
    }
}
