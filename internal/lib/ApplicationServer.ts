import path from 'path';
import { config } from 'process';
import ConfigurationAdapter from '../configuration/ConfigurationAdapter';
import ConfigurationFactory from '../configuration/ConfigurationFactory';

// TODO: Replace with CLI options
const APPLICATION_DIR: string = path.resolve(__dirname, '..', '..');
const CONFIG_FILE: string = path.resolve(APPLICATION_DIR, 'conf', 'app.ini');

/**
 * The application server
 *
 * This class is a singleton.
 */
export default class ApplicationServer {
    private constructor() {}

    private static instance: ApplicationServer | null = null;

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

    public startup() {
        // TODO: Better logger
        console.log('Application server starting up');
        console.log('Using configuration file: ', CONFIG_FILE);

        const configAdapter = ConfigurationFactory.getInstance(CONFIG_FILE);
        configAdapter.system().applicationPath = APPLICATION_DIR;
    }
}
