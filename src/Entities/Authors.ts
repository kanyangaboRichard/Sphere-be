import {Entity,PrimaryGeneratedColumn,Column,CreateDateColumn,UpdateDateColumn,OneToMany,ManyToOne,JoinColumn,} from "typeorm";
import { Article } from "../Entities/Articles";
import { User } from "../Entities/Users";

export enum AuthorStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

@Entity("authors")
export class Author {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 100 })
  firstName: string;

  @Column({ type: "varchar", length: 100 })
  lastName: string;

  @Column({ type: "varchar", unique: true })
  email: string;

  @Column({ type: "varchar", nullable: true })
  avatar: string;

  @Column({ type: "varchar", nullable: true })
  avatarPublicId: string;

  @Column({ type: "text", nullable: true })
  bio: string;

  @Column({ type: "varchar", nullable: true })
  title: string;

  @Column({ type: "varchar", nullable: true })
  twitter: string;

  @Column({ type: "varchar", nullable: true })
  linkedin: string;

  @Column({ type: "varchar", nullable: true })
  website: string;

  @Column({ type: "boolean", default: false })
  isColumnist: boolean;

  @Column({ type: "varchar", nullable: true })
  columnName: string;

  @Column({ type: "varchar", nullable: true })
  columnCategory: string;

  @Column({
    type: "enum",
    enum: AuthorStatus,
    default: AuthorStatus.ACTIVE,
  })
  status: AuthorStatus;

  @Column({ type: "int", default: 0 })
  articleCount: number;

  @ManyToOne(() => User, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "userId" })
  user: User;

  @Column({ type: "varchar", nullable: true })
  userId: string;

  @OneToMany(() => Article, (article) => article.author)
  articles: Article[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}