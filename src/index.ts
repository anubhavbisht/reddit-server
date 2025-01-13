import { MikroORM } from "@mikro-orm/postgresql"
import mikroOrmConfig from "./database/orm.config";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import dotenv from 'dotenv';
import { buildSchema } from "type-graphql";
import { TestResolver } from "./resolvers/test";

dotenv.config();

const main = async () => {
    const orm = await MikroORM.init(mikroOrmConfig)
    await orm.getMigrator().up()
    const app = express() as any
    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [TestResolver],
            validate: false
        })
    })
    await apolloServer.start()
    apolloServer.applyMiddleware({ app })
    app.listen(process.env.SERVER_PORT, () => {
        console.log(`🚀 Web server is running at port ${process.env.SERVER_PORT}`)
        console.log(`🚀 Graphql server is running at port http://localhost:${process.env.SERVER_PORT}/graphql`)
    })

}

main().catch((e) => {
    console.error(e)
})