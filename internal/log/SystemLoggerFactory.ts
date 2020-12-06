import SystemConfiguration from '@internal/configuration/SystemConfiguration';
import SystemLogger from './SystemLogger';
import WinstonLogger from './WinstonLogger';

/**
 * Indicates that the log type set in the configuration is unknown
 */
export class UnknownLoggerException extends Error {
    constructor(logType: string) {
        super(`Unknown log type: ${logType}`);
    }
}

/**
 * Factory class for {@link SystemLogger} creation
 */
export default class SystemLoggerFactory {
    /* istanbul ignore next */
    private constructor() {}

    public static createInstance(config: SystemConfiguration): SystemLogger {
        const logType = config.log();

        if ('winston' === logType) {
            return new SystemLogger(new WinstonLogger(config));
        }

        throw new UnknownLoggerException(logType);
    }
}
