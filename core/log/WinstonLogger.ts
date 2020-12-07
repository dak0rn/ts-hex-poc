import SystemConfiguration, { ExecutionEnvironment } from '@core/configuration/SystemConfiguration';
import winston from 'winston';
import { LogAdapter } from './SystemLogger';

export const defaultConfiguration = {
    level: 'debug',
    format: winston.format.simple(),
    transports: [new winston.transports.Console()]
};

export default class WinstonLogger implements LogAdapter {
    protected logger: winston.Logger;

    /**
     * Creates a new {@link WinstonLogger} with the configuration provided
     * in the given {@link SystemConfiguration}.
     *
     * If the configuration does not define a winstonConfigFile property, a
     * default configuration is used.
     *
     * @param {SystemConfiguration} config  Configuration to use
     * @param {Function} require Require function for the config file if provided, defaults to node's require
     */
    constructor(config: SystemConfiguration, require: Function = global.require) {
        let winstonConfig = Object.assign({}, defaultConfiguration);

        if (config.get('winstonConfigFile')) {
            winstonConfig = require(config.resolvePathForKey('winstonConfigFile'));
        } else {
            if (ExecutionEnvironment.Production === config.environment()) {
                winstonConfig.level = 'info';
            }
        }

        this.logger = winston.createLogger(winstonConfig);
    }

    info(message: string, ...meta: any[]): void {
        this.logger.info(message, ...meta);
    }
    debug(message: string, ...meta: any[]): void {
        this.logger.debug(message, ...meta);
    }
    error(message: string, ...meta: any[]): void {
        this.logger.error(message, ...meta);
    }
    warn(message: string, ...meta: any[]): void {
        this.logger.warn(message, ...meta);
    }
}
