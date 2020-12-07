import ConfigurationAdapter from './ConfigurationAdapter';
import ApplicationConfiguration from './ApplicationConfiguration';
import SystemConfiguration from './SystemConfiguration';
import fs from 'fs';
import ini from 'ini';

interface IniValues {
    [key: string]: any;
}

export default class IniAdapter extends ConfigurationAdapter {
    private parsed: IniValues | null = null;

    /**
     * Creates a new {@link IniAdapter} with the given file path
     *
     * @param path Path of the .ini file to parse
     */
    constructor(path: string) {
        super(path);
    }

    /**
     * Parses the .ini file and stores the parsed values in {@link parsed}.
     */
    private parse() {
        const contents = fs.readFileSync(this.uri, { encoding: 'utf-8' });
        this.parsed = ini.parse(contents);
    }

    system(): SystemConfiguration {
        if (null === this.parsed) {
            this.parse();
        }

        return new SystemConfiguration(this.parsed!.system, this);
    }

    application(): ApplicationConfiguration {
        if (null === this.parsed) {
            this.parse();
        }

        const copy = Object.assign({}, this.parsed!);
        delete copy.system;

        return new ApplicationConfiguration(copy, this);
    }
}
