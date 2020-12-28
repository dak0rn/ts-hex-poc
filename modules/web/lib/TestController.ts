import SystemLogger from '@core/log/SystemLogger';
import { inject, injectable } from '@core/ioc/Decorators';
import { BaseController } from './BaseController';
import { GET, middleware, routePrefix } from './Decorators';
import { JSONResponse } from './JSONResponse';
import { Middleware, NextHandler } from './Middleware';
import { Request } from './Request';
import { Response } from './Response';
import ApplicationContext from '@core/ioc/ApplicationContext';

@middleware(1)
@injectable()
export class SessionMiddleware extends Middleware {
    protected ctx: ApplicationContext;

    constructor(@inject('ApplicationContext') ctx: ApplicationContext) {
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
    protected something: number;

    constructor(@inject('something') something: number) {
        super();

        this.something = something;
    }

    @GET('/:message')
    public echoMessage(req: Request, res: Response): Response {
        const msg = req.params.get('message');

        return new JSONResponse(res).status(201).body({ msg, fingerprint: this.something });
    }
}
