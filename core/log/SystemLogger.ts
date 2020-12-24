export interface LogAdapter {
    info(message: string, ...meta: any[]): void;
    debug(message: string, ...meta: any[]): void;
    error(message: string, ...meta: any[]): void;
    warn(message: string, ...meta: any[]): void;
}

/**
 * Logger class that use a provided {@link LogAdapter} to write
 * logs
 */
export default class SystemLogger {
    public adapter: LogAdapter;

    protected prefix: string | null = null;

    /**
     * Creates a new {@link SystemLogger} with the given {@link LogAdapter}
     *
     * @param adapter {@link LogAdapter} to use
     */
    constructor(adapter: LogAdapter) {
        this.adapter = adapter;
    }

    /**
     * Creates a new system logger that uses the prefix given for log messages
     * The prefix will be enclosed in `[ ]` and used in uppercase format.
     *
     * @param prefix Prefix
     * @return Child logger
     */
    public createChild(prefix: string): SystemLogger {
        const sl = new SystemLogger(this.adapter);
        sl.prefix = prefix.toUpperCase();

        return sl;
    }

    protected prepareMessage(message: string): string {
        if (!this.prefix) return message;

        return `[${this.prefix}] ${message}`;
    }

    /**
     * Write the given message with additional meta data to the logger
     * with severity=info
     *
     * @param message Message to log
     * @param meta Additional meta data
     */
    public info(message: string, ...meta: any[]): void {
        this.adapter.info(this.prepareMessage(message), ...meta);
    }

    /**
     * Write the given message with additional meta data to the logger
     * with severity=debug
     *
     * @param message Message to log
     * @param meta Additional meta data
     */
    public debug(message: string, ...meta: any[]): void {
        this.adapter.debug(this.prepareMessage(message), ...meta);
    }

    /**
     * Write the given message with additional meta data to the logger
     * with severity=erorr
     *
     * @param message Message to log
     * @param meta Additional meta data
     */
    public error(message: string, ...meta: any[]): void {
        this.adapter.error(this.prepareMessage(message), ...meta);
    }

    /**
     * Write the given message with additional meta data to the logger
     * with severity=warn
     *
     * @param message Message to log
     * @param meta Additional meta data
     */
    public warn(message: string, ...meta: any[]): void {
        this.adapter.warn(this.prepareMessage(message), ...meta);
    }
}
