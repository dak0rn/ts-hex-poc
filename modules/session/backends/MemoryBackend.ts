import BaseSession from '../BaseSession';
import SessionBackend from '../SessionBackend';

/**
 * Session backend that stores sessions in memory
 */
export default class MemoryBackend extends SessionBackend {
    protected store: Map<string, string>;

    constructor() {
        super();

        this.store = new Map<string, string>();
    }

    public put(session: BaseSession): void {
        this.store.set(session.surrogateKey, session.serialize());
    }

    public fetch<T extends BaseSession>(key: string, obj: T): boolean {
        const session = this.store.get(key);

        if (!session) {
            return false;
        }

        obj.deserialize(session);
        return true;
    }
}
