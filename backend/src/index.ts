import "reflect-metadata"
import express from "express";
import { ApolloServer } from "apollo-server-express";
import dotenv from 'dotenv';
import { buildSchema } from "type-graphql";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import Redis from "ioredis";
import session from 'express-session'
import { __prod__, COOKIE_NAME, REDIS_AUTH_PREFIX } from "./constants";
import { RedisStore } from "connect-redis";
import { Context } from "./types";
import { RequestWithSession } from "./types";
import { Response } from "express";
import cors from 'cors'
import { AppDataSource } from "./database/orm.config";

dotenv.config();

const main = async () => {
    await AppDataSource.initialize()
    console.log(`🛢 Database is set up ⚡`)
    const redisClient = new Redis({
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
        password: process.env.REDIS_PASSWORD,
        db: 0,
        retryStrategy(times) {
            return Math.min(times * 50, 2000);
        },
    });

    redisClient.on('connect', () => {
        console.log('💾 Connected to Redis');
    });

    redisClient.on('error', (err) => {
        console.error('Redis error:', err);
    });

    // to do: remove any from express app
    const app = express() as any
    app.use(cors({
        origin: 'http://localhost:3000',
        credentials: true
    }))
    const redisStore = new RedisStore({ client: redisClient, prefix: REDIS_AUTH_PREFIX });
    app.use(
        session({
            name: COOKIE_NAME,
            store: redisStore,
            secret: process.env.SESSION_SECRET || 'session',
            resave: false,
            saveUninitialized: false,
            cookie: {
                maxAge: parseInt(process.env.SESSION_TTL || '80000', 10) * 1000,
                httpOnly: true,
                secure: __prod__,
                sameSite: "lax",
            },
        })
    );

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [PostResolver, UserResolver],
            validate: false
        }),
        context: ({ req, res }): Context => {
            return { req: req as unknown as RequestWithSession, res: res as unknown as Response, redis: redisClient };
        },
    })
    await apolloServer.start()
    apolloServer.applyMiddleware({ app, cors: false })

    app.listen(process.env.SERVER_PORT, () => {
        console.log(`🚀 Web server is running at port ${process.env.SERVER_PORT}`)
        console.log(`🚀 Graphql server is running at port http://localhost:${process.env.SERVER_PORT}/graphql`)
    })
}

main().catch((e) => {
    console.error(e)
})