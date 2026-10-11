import { DataSource } from "typeorm";
import dotenv from "dotenv";
import { User } from "../Entities/Users";
import { Article } from "../Entities/Articles";
import { Author } from "../Entities/Authors";
import { SiteSettings } from "../Entities/SiteSettings";
import { AuditLog } from "../Entities/Auditlog";
import { Media } from "../Entities/Media";
import { Categories } from "../Entities/Categories";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  
  synchronize: false,
  logging: false,
  entities: [User, Article, Author, SiteSettings, AuditLog, Media, Categories],
  migrations: ["src/migrations/*.ts"],
  subscribers: [],
});