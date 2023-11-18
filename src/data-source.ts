import { DataSource } from "typeorm";
import { User } from "./models/user";
import 'dotenv/config'

export const AppDataSource = new DataSource({
    type: "mysql",
    host: process.env.MYSQL_HOST,
    port: 3306,
    username: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: "dwebiii",
    synchronize: true,
    logging: true,
    entities: [User],
    subscribers: [],
    migrations: [],
})