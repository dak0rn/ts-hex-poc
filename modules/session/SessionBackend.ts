import { ApplicationContext } from '@core';
import ApplicationConfiguration from '@core/configuration/ApplicationConfiguration';
import BaseSession from './BaseSession';

/**
 * Error indicating that no session backend was configured in the application configuration
 */
export class SessionBackendNotConfiguredError extends Error {
    constructor() {
        super('No session backend has been configured in session.backend');
    }
}

/**
 * Error indicating that the configured session backend does not exist
 */
export class SessionBackendNotSupportedError extends Error {
    constructor(backend: string) {
        super(`The configured session backend "${backend}" is not supported`);
    }
}

/**
 * Lookup type for available backends
 */
export interface AvailableBackends {
    [key: string]: { new (...args: any[]): any };
}

/**
 * Lookup table for available session backends
 */
export const availableBackends: AvailableBackends = {};

/**
 * Base class for all session backends and factory class to
 * create the backend configured in the {@link ApplicationConfiguration}.
 */
export default abstract class SessionBackend {
    protected static _instance: SessionBackend | null = null;

    /**
     * Persists the given {@link BaseSession} under its surrogate key
     * in the session backend.
     *
     * @param session Session to persist
     */
    public abstract put(session: BaseSession): void;

    /**
     * Retrieves a {@link BaseSession} identified by the given key
     * from the session backend and uses the given object to deserialize
     * the value found. The return value indicates success; `false` is returned
     * if no entity was found.
     *
     * @param key Surrogate key of the session
     * @param obj Session object to deserialize into
     */
    public abstract fetch<T extends BaseSession>(key: string, obj: T): boolean;

    /**
     * Returns the {@link SessionBackend} that is configured in the application configuration
     * Set the key `session.backend` to the name of a supported backend as listed in {@link availableBackends}.
     * The backend is a singleton.
     *
     * @return Session backend
     */
    public static getInstance(): SessionBackend {
        if (!SessionBackend._instance) {
            const ac = ApplicationContext.getInstance();
            const conf = ac.resolve('ApplicationConfiguration') as ApplicationConfiguration;

            let configuredBackend: string;

            try {
                configuredBackend = conf.get('session.backend');
            } catch (err) {
                throw new SessionBackendNotConfiguredError();
            }

            if (!configuredBackend) {
                throw new SessionBackendNotConfiguredError();
            }

            const klass = availableBackends[configuredBackend];

            if (!klass) {
                throw new SessionBackendNotSupportedError(configuredBackend);
            }

            SessionBackend._instance = ac.resolve(klass) as SessionBackend;
        }

        return SessionBackend._instance;
    }
}
