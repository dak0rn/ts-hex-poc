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

    /**
     * Creates a new {@link SystemLogger} with the given {@link LogAdapter}
     *
     * @param adapter {@link LogAdapter} to use
     */
    constructor(adapter: LogAdapter) {
        this.adapter = adapter;
    }

    /**
     * Write the given message with additional meta data to the logger
     * with severity=info
     *
     * @param message Message to log
     * @param meta Additional meta data
     */
    info(message: string, ...meta: any[]): void {
        this.adapter.info(message, ...meta);
    }

    /**
     * Write the given message with additional meta data to the logger
     * with severity=debug
     *
     * @param message Message to log
     * @param meta Additional meta data
     */
    debug(message: string, ...meta: any[]): void {
        this.adapter.debug(message, ...meta);
    }

    /**
     * Write the given message with additional meta data to the logger
     * with severity=erorr
     *
     * @param message Message to log
     * @param meta Additional meta data
     */
    error(message: string, ...meta: any[]): void {
        this.adapter.error(message, ...meta);
    }

    /**
     * Write the given message with additional meta data to the logger
     * with severity=warn
     *
     * @param message Message to log
     * @param meta Additional meta data
     */
    warn(message: string, ...meta: any[]): void {
        this.adapter.warn(message, ...meta);
    }
}
