import { CoreObject } from '@core/shared/CoreObject';

export class MultipleMiddlewaresWithSameOrderError extends Error {
    constructor(firstName: string, secondName: string) {
        super(`Two middleware classes (${firstName}, ${secondName}) have the same order assigned`);
    }
}

/**
 * Declaration for entries in the {@link MiddlewareRegistry}
 */
export interface MiddlewareDeclaration {
    /**
     * Controller class constructor
     * Must extend {@link BaseController}
     */
    class: Function;

    /**
     * Order of the middleware
     */
    order: number;
}

/**
 * Registry for middlewares
 * The registry is filled by the decorators provided
 */
export class MiddlewareRegistry extends CoreObject {
    /**
     * List of registered middlewares
     */
    protected _middlewares: MiddlewareDeclaration[];

    /* istanbul ignore next */
    protected constructor() {
        super();

        this._middlewares = [];
    }

    /**
     * The middlewares registered in the registry
     */
    public get middlewares(): MiddlewareDeclaration[] {
        return this._middlewares;
    }

    /**
     * Registers the given declration in the registry
     *
     * @param decl Declaration to register
     */
    public register(decl: MiddlewareDeclaration): void {
        this._middlewares.push(decl);
    }

    /**
     * The singleton instance
     */
    protected static _instance: MiddlewareRegistry | null = null;

    /**
     * Returns the {@link MiddlewareRegistry} instance
     *
     * @return The instance
     */
    public static getInstance(): MiddlewareRegistry {
        if (!MiddlewareRegistry._instance) {
            MiddlewareRegistry._instance = new MiddlewareRegistry();
        }

        return MiddlewareRegistry._instance;
    }
}
