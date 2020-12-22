declare abstract class Configuration {
    constructor(sourceAdapter: ConfigurationAdapter);

    abstract get(key: string): any;
    abstract validate(): void;
}

declare class SystemConfiguration extends Configuration {
    public applicationPath: string;

    constructor(config: RawConfiguration, sourceAdapter: ConfigurationAdapter);

    get(key: string): any;
    validate(): void;
    moduleFolder(): string;
    modules(): string[];
}

declare interface RawConfiguration {
    [key: string]: any;
}

declare class ApplicationConfiguration extends Configuration {
    constructor(config: RawConfiguration, sourceAdapter: ConfigurationAdapter);

    get(key: string): any;
    validate(): void;
}
