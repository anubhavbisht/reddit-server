import { EntityManager, IDatabaseDriver, Connection } from "@mikro-orm/core";
import { SqlEntityManager, PostgreSqlDriver } from "@mikro-orm/postgresql";
import { Request, Response } from "express";
import { Session } from "express-session"; // Import the full Session interface

// Extend the Session interface to include your custom properties
declare module "express-session" {
    interface Session {
        userId?: number; // Define the custom properties you want
    }
}

export interface RequestWithSession extends Request {
    session: Session;  // Use the full Session interface
}

export type Context = {
    em: SqlEntityManager<PostgreSqlDriver> & EntityManager<IDatabaseDriver<Connection>>;
    req: RequestWithSession;  
    res: Response;
};
