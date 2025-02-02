import { AppDataSource } from "../orm.config";
import { QueryRunner } from "typeorm";
import { seedPosts } from "./postData";

const seedDatabase = async () => {
    try {
        const dataSource = await AppDataSource.initialize()
        const queryRunner: QueryRunner = dataSource.createQueryRunner()
        await queryRunner.connect()

        await seedPosts(queryRunner)

        await queryRunner.release()
        await dataSource.destroy()
    } catch (e) {
        console.error(e, 'Error in database seeder')
    }
}

seedDatabase()