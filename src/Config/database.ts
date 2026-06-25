import { DataSource } from "typeorm";
import dotenv from "dotenv";
import { User } from "../Entities/Users";
import { Article } from "../Entities/Articles";
import { Category } from "../Entities/Categories";
import { Author } from "../Entities/Authors";
import { Video } from "../Entities/Videos";
import { SiteSettings } from "../Entities/SiteSettings";
import { AuditLog } from "../Entities/Auditlog";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  
  synchronize: true,
  logging: false,
  entities: [User, Article, Category, Author, Video, SiteSettings, AuditLog],
  migrations: [],
  subscribers: [],
});