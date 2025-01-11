import { MikroORM } from "@mikro-orm/postgresql"
import mikroOrmConfig from "./database/orm.config";
import { Post } from "./database/entities/Post";

const main = async () => {
    const orm = await MikroORM.init(mikroOrmConfig)
    await orm.getMigrator().up()
    // const emFork = orm.em.fork()
    // const post = emFork.create(Post, { title: 'My first post' } as Post)
    // await emFork.persistAndFlush(post);
    // console.log('Post created:', post);
}
main()