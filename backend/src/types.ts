import { Request, Response } from "express";
import { Session } from "express-session";
import Redis from "ioredis";
import { ObjectType, Field } from "type-graphql";
import { userDataLoader } from "../src/resolvers/dataloaders/userDataLoader";
import { voteStatusLoader } from "./resolvers/dataloaders/voteStatusLoader";

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
    userLoader: ReturnType<typeof userDataLoader>
    userVoteLoader: ReturnType<typeof voteStatusLoader>
};

@ObjectType()
export class FieldError {
    @Field()
    field: string
    @Field()
    message: string
}