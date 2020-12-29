import { ApplicationContext } from '@core/ioc/ApplicationContext';
import { SystemLogger } from '@core/log/SystemLogger';
import { CoreObject } from '@core/shared/CoreObject';
import { Request } from './Request';
import { Response } from './Response';
import { RouteDeclaration } from './RouteRegistry';

/**
 * A handler method was not found
 */
export class HandlerMethodNotDefinedError extends Error {
    constructor(methodName: string, className: string) {
        super(`The handler method ${className}.${methodName} does not exist`);
    }
}

/**
 * Base class for all HTTP controllers
 * Provides common functionality and generic request handling
 *
 * Annotate methods and extending classes with appropriate decorators
 */
export abstract class BaseController extends CoreObject {
    /**
     * Logger instance configured for HTTP (e.g. with "[HTTP]" prefix)
     * accessible for all controllers
     */
    protected log: SystemLogger;

    constructor() {
        super();

        // Resolving inline reduces boilerplate in the controllers
        this.log = ApplicationContext.getInstance().resolve('http.Logger') as SystemLogger;
    }

    public async serve(req: Request, res: Response, decl: RouteDeclaration): Promise<Response> {
        // @ts-ignore
        const method: Function | undefined = this[decl.method];

        if ('function' !== typeof method) {
            throw new HandlerMethodNotDefinedError(decl.method, this.constructor.name);
        }

        // Invoke the referenced method
        return await method.call(this, req, res);
    }
}
