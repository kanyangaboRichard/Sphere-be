import {Entity,PrimaryGeneratedColumn,Column,CreateDateColumn,UpdateDateColumn,ManyToOne,OneToMany,JoinColumn,} from "typeorm";
import { Category } from "../Entities/Categories";
import { Author } from "../Entities/Authors";
import { Video } from "../Entities/Videos";
import { User } from "../Entities/Users";

export enum ArticleStatus {
  DRAFT = "DRAFT",
  IN_REVIEW = "IN_REVIEW",
  PUBLISHED = "PUBLISHED",
  SCHEDULED = "SCHEDULED",
  ARCHIVED = "ARCHIVED",
}

export enum ArticleLayout {
  HERO_BOTTOM = "HERO_BOTTOM",
  SPLIT = "SPLIT",
  MINIMAL = "MINIMAL",
}

export enum ArticleThemePreset {
  TECH_DARK = "TECH_DARK",
  EDITORIAL = "EDITORIAL",
  BREAKING = "BREAKING",
  CYBER = "CYBER",
}

@Entity("articles")
export class Article {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar" })
  title: string;

  @Column({ type: "varchar", unique: true })
  slug: string;

  @Column({ type: "text", nullable: true })
  excerpt: string;

  @Column({ type: "text", nullable: true })
  body: string;

  @Column({ type: "varchar", nullable: true })
  coverImage: string;

  @Column({ type: "varchar", nullable: true })
  coverImagePublicId: string;

  @Column({
    type: "enum",
    enum: ArticleStatus,
    default: ArticleStatus.DRAFT,
  })
  status: ArticleStatus;

  @Column({
    type: "enum",
    enum: ArticleLayout,
    default: ArticleLayout.HERO_BOTTOM,
  })
  layout: ArticleLayout;

  // ── Theme ──
  @Column({
    type: "enum",
    enum: ArticleThemePreset,
    default: ArticleThemePreset.TECH_DARK,
  })
  themePreset: ArticleThemePreset;

  @Column({ type: "varchar", nullable: true })
  themeHeroBg: string;

  @Column({ type: "varchar", nullable: true })
  themeAccentColor: string;

  @Column({ type: "varchar", nullable: true })
  themeTitleFont: string;

  @Column({ type: "boolean", default: false })
  themeDarkBody: boolean;

  @Column({ type: "boolean", default: true })
  themeShowPullQuote: boolean;

  @Column({ type: "boolean", default: true })
  themeGridOverlay: boolean;

  @Column({ type: "varchar", nullable: true })
  pullQuote: string;

  // ── Meta ──
  @Column({ type: "int", default: 0 })
  readTime: number;

  @Column({ type: "boolean", default: false })
  isFeatured: boolean;

  @Column({ type: "boolean", default: false })
  isBreaking: boolean;

  @Column({ type: "simple-array", nullable: true })
  tags: string[];

  @Column({ type: "timestamp", nullable: true })
  publishedAt: Date;

  @Column({ type: "timestamp", nullable: true })
  scheduledAt: Date;

  @Column({ type: "int", default: 0 })
  viewCount: number;

  // ── Relations ──
  @ManyToOne(() => Category, (category) => category.articles, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "categoryId" })
  category: Category;

  @Column({ type: "varchar", nullable: true })
  categoryId: string;

  @ManyToOne(() => Author, (author) => author.articles, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "authorId" })
  author: Author;

  @Column({ type: "varchar", nullable: true })
  authorId: string;

  @ManyToOne(() => User, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "createdById" })
  createdBy: User;

  @Column({ type: "varchar", nullable: true })
  createdById: string;

  @OneToMany(() => Video, (video) => video.article)
  videos: Video[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}