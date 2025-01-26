import { EntityManager, IDatabaseDriver, Connection } from "@mikro-orm/core";
import { SqlEntityManager, PostgreSqlDriver } from "@mikro-orm/postgresql";
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
    em: SqlEntityManager<PostgreSqlDriver> & EntityManager<IDatabaseDriver<Connection>>;
    req: RequestWithSession;
    res: Response;
    redis: Redis;
};
