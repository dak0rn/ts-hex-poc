import { Serializable } from '@core/io/Serializable';

/**
 * Base class for all sessions
 */
export abstract class BaseSession implements Serializable<string> {
    public abstract deserialize(input: string): void;
    public abstract serialize(): string;

    /**
     * Returns the surrogate key for the session
     * The surrogate key represents the identity of the session and allows
     * to uniquely identify it. It will be used in the {@link SessionBackend}
     * to store and retrieve the session from the persistence layer.
     *
     * @return
     */
    public abstract get surrogateKey(): string;
}
