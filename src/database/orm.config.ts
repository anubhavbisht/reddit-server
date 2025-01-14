import { Post } from "./entities/Post";
import { defineConfig } from '@mikro-orm/postgresql';
import path from 'path';
import dotenv from 'dotenv';
import { __prod__ } from "../constants";

dotenv.config();

export default defineConfig({
    migrations: {
        path: path.join(__dirname, './migrations'),
        glob: '!(*.d).{js,ts}',
    },
    entities: [Post],
    port: Number(process.env.DB_PORT),
    host: process.env.DB_HOST,
    dbName: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    debug: !__prod__,
    forceEntityConstructor: true,
});
