import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  ManyToMany,
} from "typeorm";
import { User } from "./Users";
import { Article } from "./Articles";

export enum MediaType {
  IMAGE = "image",
  VIDEO = "video",
}

@Entity()
export class Media {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  filename: string;

  @Column()
  key: string;

  @Column()
  url: string;

  @Column()
  mimeType: string;

  @Column({ type: "enum", enum: MediaType })
  type: MediaType;

  @Column()
  sizeKb: number;

  @ManyToMany(() => Article, (article) => article.media)
  articles: Article[];

  @ManyToOne(() => User, { eager: true, nullable: true })
  uploadedBy: User;

  @CreateDateColumn()
  createdAt: Date;
}