import { inject, injectable, provide } from '@core/ioc/Decorators';
import { CoreObject } from '@core/shared/CoreObject';
import { Express, Request as ExpressRequest, Response as ExpressResponse } from 'express';
import { RouteDeclaration, RouteRegistry } from './RouteRegistry';
import { getRoutePrefix } from './Decorators';
import { SystemLogger } from '@core/log/SystemLogger';
import { ApplicationContext } from '@core/ioc/ApplicationContext';
import { BaseController } from './BaseController';
import { ThreadLocal } from '@core/lib/ThreadLocal';
import { Request } from './Request';
import { Response } from './Response';
import { MiddlewareRegistry } from './MiddlewareRegistry';
import { Middleware, NextHandler } from './Middleware';
import { JSONResponse } from './JSONResponse';

/**
 * The front controller handling all incoming HTTP requests
 * Uses the {@link RouteRegistry} to find the correct handler and applies
 * middlewares registered in {@link MiddlewareRegistry}.
 */
@provide('http.FrontController')
@injectable()
export class FrontController extends CoreObject {
    protected ctx: ApplicationContext;
    protected log: SystemLogger;
    protected middlewares: Function[];

    constructor(
        @inject('core.SystemLogger') log: SystemLogger,
        @inject('core.ApplicationContext') ctx: ApplicationContext
    ) {
        super();

        this.log = log.createChild('HTTP');
        this.ctx = ctx;
        this.middlewares = [];
    }

    /**
     * Sets up the given server with routes registered in the application
     *
     * @param server Server to setup
     */
    public setup(server: Express): void {
        const routes = RouteRegistry.getInstance().routes;

        for (const routeDecl of routes) {
            const fullPath = getRoutePrefix(routeDecl.class.prototype) + routeDecl.path;

            // Middleware that provides the name of the controller class to instantiate and execute
            // to {@link #handle}
            server.use(fullPath, function (req: ExpressRequest, res: ExpressResponse, next: Function): void {
                // @ts-ignore
                req.__http_handler = routeDecl;

                next();
            });

            // Register the route pointing to {@link #handle}
            server[routeDecl.verb](fullPath, this.handle.bind(this));
        }

        // This must come after all routes and middlewares
        server.use(this.handle404.bind(this));

        // Sort and prepare the registered middlewares
        this.middlewares = MiddlewareRegistry.getInstance()
            .middlewares.sort((a, b) => {
                if (a.order < b.order) return -1;
                if (b.order > a.order) return 1;
                return 0;
            })
            .map(mw => mw.class);

        // The logger with a prefix is provided to other classes
        this.ctx.registerValue('http.Logger', this.log);
    }

    /**
     * Express middleware to handle 404s
     *
     * @param req Request
     * @param res Response
     * @param next Next handler
     */
    public async handle404(req: ExpressRequest, res: ExpressResponse, next: Function): Promise<void> {
        res.status(400).json({ error: 'not found' }).end();
    }

    /**
     * Express request handler
     * Will parse the request and invoke the correct controller
     *
     * @param req Incoming request
     * @param res Outgoing response
     */
    public async handle(req: ExpressRequest, res: ExpressResponse): Promise<void> {
        // @ts-ignore
        const handler: RouteDeclaration = req.__http_handler;
        let ctrl: BaseController;

        // In that case, a route has been registered for a class that suddenly is no
        // longer in the registry
        // That should not be possible
        if (!handler) {
            this.log.error(`No handler for route ${req.path} even though registered initially`);

            // TODO: Add configurable error handling
            new JSONResponse(res).status(500).body({ error: 'invariant' });

            return;
        }

        const tl = new ThreadLocal(new Map<string, any>());

        tl.run(async () => {
            const request = new Request(req);
            let response = new Response(res);

            // Use an application context that is running in thread-local
            const ctx = ApplicationContext.getInstance();

            try {
                response = await this.executeMiddlewares(
                    request,
                    response,
                    async (): Promise<Response> => {
                        // The controller must be instantiated after the middlewares have run
                        // because they might register something in the ApplicationContext
                        ctrl = ctx.resolve(handler.class as any) as BaseController;
                        return await ctrl.serve(request, response, handler);
                    }
                );
            } catch (err) {
                this.log.error(`Failed to serve request ${request.toString()}: ${err}`);

                response = new JSONResponse(response).status(500).body({ error: 'unknown' });
            }

            response.finalizeAndSend();
        });
    }

    /**
     * Executes the middlewares in order and executes `callback` afterwards.
     *
     * @param req Incoming request
     * @param res Outgoing response
     * @param callback Next handler after execution
     * @return Response to return to the client
     */
    protected async executeMiddlewares(req: Request, res: Response, callback: NextHandler): Promise<Response> {
        /**
         * Instantiates and executes the middleware at `index` and provides it
         * `next` as follow-up callback
         *
         * @param index Index of the middleware in `this.middlewares`
         * @param next Next handler
         */
        const runMiddleware = async (index: number, next: NextHandler): Promise<Response> => {
            // The middleware to execute
            const nextMiddleware = this.middlewares[index];

            // Create an instance of the middleware using the application context
            // so that it can use the IoC container
            const instance = this.ctx.resolve(nextMiddleware as any) as Middleware;

            return await instance.serve(req, res, next);
        };

        /**
         * Creates a callback that will execute the middleware at `index`
         * and will provide it either another callback from this function as follow-up
         * or `callback` as next one.
         *
         * @param index Index of the next middleware to execute
         */
        const createNext = (index: number) => {
            return async (): Promise<Response> => {
                // The next follow up function is either another one created by `createNext` as another
                // middleware execution chain function or the callback once all middlewares are processed
                const next = index === this.middlewares.length - 1 ? callback : createNext(index + 1);

                return await runMiddleware(index, next);
            };
        };

        let result: Response;

        if (this.middlewares.length === 0) {
            result = await callback();
        } else if (this.middlewares.length === 1) {
            result = await runMiddleware(0, callback);
        } else {
            result = await runMiddleware(0, createNext(1));
        }

        return result;
    }
}
