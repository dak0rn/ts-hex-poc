import { MiddlewareDeclaration, MiddlewareRegistry } from './MiddlewareRegistry';
import { HttpVerb, RouteDeclaration, RouteRegistry } from './RouteRegistry';

const ROUTE_PREFIX_METADATA_KEY = 'http_route_ctrl_prefix';

/**
 * Returns the route prefix attached to the given prototype object
 * Returns an empty string if no path was set.
 *
 * @param ctrlProto Class prototype
 * @return Prefix or empty string
 */
export function getRoutePrefix(ctrlProto: object): string {
    return Reflect.getMetadata(ROUTE_PREFIX_METADATA_KEY, ctrlProto) || '';
}

/**
 * Uses the given path a prefix for any route referenced using a route
 * decorator in the class
 *
 * @param path Path to prepend
 * @return Decorator
 */
export function routePrefix(path: string): ClassDecorator {
    return function (klass: Function): void {
        Reflect.defineMetadata(ROUTE_PREFIX_METADATA_KEY, path, klass.prototype);
    };
}

/**
 * Registers an entry in the {@link RouteRegistry}
 *
 * @param verb HTTP verb
 * @param path Path to register under
 * @param klass Constructor of a class implementing BaseController
 * @param method Name of the method to invoke for that route
 */
function registerRoute(verb: HttpVerb, path: string, klass: Function, method: string | symbol): void {
    const decl: RouteDeclaration = {
        verb,
        path,
        class: klass,
        method: method as string
    };

    RouteRegistry.getInstance().register(decl);
}

/**
 * Registers an entry in the {@link RouteRegistry}
 *
 * @param klass Constructor of a class implementing BaseController
 * @param order Order of the middleware
 */
function registerMiddleware(klass: Function, order: number): void {
    const decl: MiddlewareDeclaration = {
        class: klass,
        order
    };

    MiddlewareRegistry.getInstance().register(decl);
}

/**
 * Class decorator that registers the decorated class as middleware
 * It will be instantiated on a per-request basis and can use dependency injection.
 * Has to extend {@link Middleware}.
 *
 * Middlewares are executed in the order specified by `order`. `order` has to be unique
 * across all middlewares. Will throw upon startup if multiple middleware classes have
 * the same order assigned.
 *
 * @param order Order of the middleware
 * @return Decorator
 */
export function middleware(order: number): ClassDecorator {
    return function (target: Function) {
        registerMiddleware(target, order);
    };
}

/**
 * Method decorator that registers the decorated method under the given path
 * in the HTTP router for GET requests.
 * If the class has a `@routePrefix` defined, will be relative to that prefix.
 * The given URL supports `express` named route arguments.
 *
 * @example
 * Decorating a handler
 *
 * ```typescript
 * @GET('/list')
 * public listSomething(r: Request): Response {
 * }
 * ```
 *
 * @param path Request path
 * @return Decorator
 */
export function GET(path: string): MethodDecorator {
    return function (target: object, method: string | symbol): void {
        registerRoute('get', path, target.constructor, method as string);
    };
}

/**
 * Method decorator that registers the decorated method under the given path
 * in the HTTP router for POST requests.
 * If the class has a `@routePrefix` defined, will be relative to that prefix.
 * The given URL supports `express` named route arguments.
 *
 * @example
 * Decorating a handler
 *
 * ```typescript
 * @POST('/list/create')
 * public createNewEntry(r: Request): Response {
 * }
 * ```
 *
 * @param path Request path
 * @return Decorator
 */
export function POST(path: string): MethodDecorator {
    return function (target: object, method: string | symbol): void {
        registerRoute('post', path, target.constructor, method as string);
    };
}

/**
 * Method decorator that registers the decorated method under the given path
 * in the HTTP router for PUT requests.
 * If the class has a `@routePrefix` defined, will be relative to that prefix.
 * The given URL supports `express` named route arguments.
 *
 * @example
 * Decorating a handler
 *
 * ```typescript
 * @PUT('/list/create/:id')
 * public updateEntry(r: Request): Response {
 * }
 * ```
 *
 * @param path Request path
 * @return Decorator
 */
export function PUT(path: string): MethodDecorator {
    return function (target: object, method: string | symbol): void {
        registerRoute('put', path, target.constructor, method as string);
    };
}

/**
 * Method decorator that registers the decorated method under the given path
 * in the HTTP router for DELETE requests.
 * If the class has a `@routePrefix` defined, will be relative to that prefix.
 * The given URL supports `express` named route arguments.
 *
 * @example
 * Decorating a handler
 *
 * ```typescript
 * @DELETE('/list/create/:id')
 * public deleteEntry(r: Request): Response {
 * }
 * ```
 *
 * @param path Request path
 * @return Decorator
 */
export function DELETE(path: string): MethodDecorator {
    return function (target: object, method: string | symbol): void {
        registerRoute('delete', path, target.constructor, method as string);
    };
}

/**
 * Method decorator that registers the decorated method under the given path
 * in the HTTP router for HEAD requests.
 * If the class has a `@routePrefix` defined, will be relative to that prefix.
 * The given URL supports `express` named route arguments.
 *
 * @example
 * Decorating a handler
 *
 * ```typescript
 * @HEAD('/list/create/:id')
 * public getHeaders(r: Request): Response {
 * }
 * ```
 *
 * @param path Request path
 * @return Decorator
 */
export function HEAD(path: string): MethodDecorator {
    return function (target: object, method: string | symbol): void {
        registerRoute('head', path, target.constructor, method as string);
    };
}

/**
 * Method decorator that registers the decorated method under the given path
 * in the HTTP router for OPTIONS requests.
 * If the class has a `@routePrefix` defined, will be relative to that prefix.
 * The given URL supports `express` named route arguments.
 *
 * @example
 * Decorating a handler
 *
 * ```typescript
 * @OPTIONS('/list/create/:id')
 * public supportedOptions(r: Request): Response {
 * }
 * ```
 *
 * @param path Request path
 * @return Decorator
 */
export function OPTIONS(path: string): MethodDecorator {
    return function (target: object, method: string | symbol): void {
        registerRoute('options', path, target.constructor, method as string);
    };
}
