import { EntityManager, IDatabaseDriver, Connection } from "@mikro-orm/core"
import { SqlEntityManager, PostgreSqlDriver } from "@mikro-orm/postgresql"

export type OrmContext = {
    em: SqlEntityManager<PostgreSqlDriver> & EntityManager<IDatabaseDriver<Connection>>
}