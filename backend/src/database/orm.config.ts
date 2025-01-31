import "reflect-metadata";
import { DataSource } from "typeorm";
import { __prod__ } from "../constants";
import dotenv from 'dotenv';
import { User } from "./entities/User";
import { Post } from "./entities/Post";

dotenv.config();

export const AppDataSource = new DataSource({
    type: "postgres",
    port: Number(process.env.DB_PORT),
    host: process.env.DB_HOST,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: true,
    logging: !__prod__,
    entities: [User, Post],
});
