import SystemConfiguration from '@core/configuration/SystemConfiguration';
import ApplicationContext from '@core/ioc/ApplicationContext';
import SystemLogger from '@core/log/SystemLogger';
import SystemLoggerFactory from '@core/log/SystemLoggerFactory';
import ModuleLoader from '@core/module/ModuleLoader';
import path from 'path';
import ConfigurationFactory from '../configuration/ConfigurationFactory';

// TODO: Replace with CLI options
/* istanbul ignore next */
export const APPLICATION_DIR: string = path.resolve(__dirname, '..', '..');
/* istanbul ignore next */
export const CONFIG_FILE: string = path.resolve(APPLICATION_DIR, 'conf', 'app.ini');

/**
 * The application server
 *
 * This class is a singleton.
 */
export default class ApplicationServer {
    protected static instance: ApplicationServer | null = null;

    protected ctx: ApplicationContext | null;

    /* istanbul ignore next */
    protected constructor() {
        this.ctx = null;
    }

    /**
     * Returns an instance of {@link ApplicationServer}. Creates a new
     * instance if it does not exist already and returns that instance
     * on subsequent calls.
     *
     * @return {ApplicationServer} {@link ApplicationServer} instance
     */
    public static getInstance(): ApplicationServer {
        if (null === ApplicationServer.instance) {
            ApplicationServer.instance = new ApplicationServer();
        }

        return ApplicationServer.instance;
    }

    /**
     * Assembles the {@link ApplicationContext} for the server
     * based on the configuration file given.
     *
     * @param configFile Path to the configuration file
     */
    protected assembleContext(configFile: string): void {
        const configAdapter = ConfigurationFactory.getInstance(configFile);
        const sc = configAdapter.system();
        const ac = configAdapter.application();
        sc.applicationPath = APPLICATION_DIR;

        const log = SystemLoggerFactory.createInstance(sc);

        log.info('Configuration successfully parsed.');
        log.info('Setting up the IoC environment...');

        // Create the application context that is housing the
        // IoC container
        this.ctx = ApplicationContext.getRootInstance();

        this.ctx.registerValue('SystemConfiguration', sc);
        this.ctx.registerValue('ApplicationConfiguration', ac);
        this.ctx.registerValue('SystemLogger', log);

        // The context is registered within itself under ApplicationContext automatically
    }

    /**
     * Loads and launches the configured modules
     */
    protected launchModules(loader: ModuleLoader | null = null): Promise<unknown> {
        if (null === loader) {
            const config = this.ctx!.resolve('SystemConfiguration') as SystemConfiguration;
            loader = new ModuleLoader(config);
        }

        const modules = loader.load();
        const promises: Promise<unknown>[] = [];

        for (const mod of modules) {
            promises.push(mod.launch(this.ctx!));
        }

        return Promise.all(promises);
    }

    /**
     * Starts the application server and eventually also the application using it
     */
    public async startup(): Promise<unknown> {
        console.log('Application server starting up');
        console.log('Using configuration file: ', CONFIG_FILE);

        this.assembleContext(CONFIG_FILE);
        const log = this.ctx!.resolve('SystemLogger') as SystemLogger;

        log.debug('Resolving modules...');

        return await this.launchModules();
    }
}
