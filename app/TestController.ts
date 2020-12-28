import SystemLogger from '@core/log/SystemLogger';
import { inject, injectable } from '@core/ioc/Decorators';
import { BaseController } from '../modules/web/lib/BaseController';
import { GET, middleware, routePrefix } from '../modules/web/lib/Decorators';
import { JSONResponse } from '../modules/web/lib/JSONResponse';
import { Middleware, NextHandler } from '../modules/web/lib/Middleware';
import { Request } from '../modules/web/lib/Request';
import { Response } from '../modules/web/lib/Response';
import ApplicationContext from '@core/ioc/ApplicationContext';

@middleware(1)
@injectable()
export class SessionMiddleware extends Middleware {
    protected ctx: ApplicationContext;

    constructor(@inject('core.ApplicationContext') ctx: ApplicationContext) {
        super();

        this.ctx = ctx;
    }

    public async serve(req: Request, res: Response, next: NextHandler): Promise<Response> {
        if (req.path.endsWith('password')) {
            return new JSONResponse(res).body({ blocked: true, reason: 'password' });
        }

        this.ctx.registerValue('something', Math.random());

        const resp = await next();

        return resp;
    }
}

@middleware(0)
@injectable()
export class LogMiddleware extends Middleware {
    protected log: SystemLogger;

    constructor(@inject('http.Logger') log: SystemLogger) {
        super();

        this.log = log;
    }

    public async serve(req: Request, res: Response, next: NextHandler): Promise<Response> {
        const then = Date.now();

        const resp = await next();

        const now = Date.now();
        const duration = now - then;
        this.log.info(`${req.method} ${req.path}: ${res.statusCode} took ${duration}ms`);

        return resp;
    }
}

@routePrefix('/echo')
@injectable()
export class TestController extends BaseController {
    @GET('/:message')
    public async echoMessage(req: Request, res: Response): Promise<Response> {
        const msg = req.params.get('message');

        return new JSONResponse(res).status(201).body({ msg });
    }
}
