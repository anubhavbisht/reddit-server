import { Request, Response } from "express";
import { Session } from "express-session";
import Redis from "ioredis";

declare module "express-session" {
    interface Session {
        userId?: number;
    }
}

export interface RequestWithSession extends Request {
    session: Session;
}

export type Context = {
    req: RequestWithSession;
    res: Response;
    redis: Redis;
};
