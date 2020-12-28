import CoreObject from '@core/shared/CoreObject';
import { Request } from './Request';
import { Response } from './Response';

export type NextHandler = () => Promise<Response>;

/**
 * Instances of {@link Middleware} qualify to be used as middlewares
 * handling incoming requests. Use the {@link middleware} decorator to
 * register it in the registry.
 */
export abstract class Middleware extends CoreObject {
    /**
     * Middleware handler
     * Invoke `next` to let the execution chain proceed to the next middleware
     * or controller. Return a {@link Response} without calling `next` to abort
     * the request.
     *
     * @param req Incoming request
     * @param res Outgoing response
     * @param next Next middleware handler
     */
    public abstract serve(req: Request, res: Response, next: NextHandler): Promise<Response>;
}
