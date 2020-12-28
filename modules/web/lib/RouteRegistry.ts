import CoreObject from '@core/shared/CoreObject';

export type HttpVerb = 'get' | 'put' | 'post' | 'delete' | 'head' | 'options';

/**
 * Declaration for entries in the {@link RouteRegistry}
 */
export interface RouteDeclaration {
    /**
     * HTTP verb to use
     * This matches the registration function names in express.Router
     */
    verb: HttpVerb;

    /**
     * Request path to match
     */
    path: string;

    /**
     * Controller class constructor
     * Must extend {@link BaseController}
     */
    class: Function;

    /**
     * Name of the method to use on the instance
     */
    method: string;
}

/**
 * Registry for routes
 * The registry is filled by the decorators provided
 */
export class RouteRegistry extends CoreObject {
    /**
     * List of registered routes
     */
    protected _routes: RouteDeclaration[];

    /* istanbul ignore next */
    protected constructor() {
        super();

        this._routes = [];
    }

    /**
     * The routes registered in the registry
     */
    public get routes(): RouteDeclaration[] {
        return this._routes;
    }

    /**
     * Registers the given declration in the registry
     *
     * @param decl Declaration to register
     */
    public register(decl: RouteDeclaration): void {
        this._routes.push(decl);
    }

    /**
     * The singleton instance
     */
    protected static _instance: RouteRegistry | null = null;

    /**
     * Returns the {@link RouteRegistry} instance
     *
     * @return The instance
     */
    public static getInstance(): RouteRegistry {
        if (!RouteRegistry._instance) {
            RouteRegistry._instance = new RouteRegistry();
        }

        return RouteRegistry._instance;
    }
}
