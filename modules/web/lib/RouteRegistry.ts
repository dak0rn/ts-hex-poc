import CoreObject from '@core/shared/CoreObject';
import { Router } from 'express';

// TODO: Comment
export interface RouteDeclaration {
    verb: string;
    path: string;
    class: { new (...args: any[]): any };
    method: string;
}

/**
 * Registry for routes
 * The mapping is filled by the decorators provided
 */
export class RouteRegistry extends CoreObject {
    // TODO: *List* of routes

    /* istanbul ignore next */
    protected constructor() {
        super();
    }

    public compile(): Router {
        const router = Router();

        // TODO: Register handler function that uses the list of endpoints to create the controllers

        return router;
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
