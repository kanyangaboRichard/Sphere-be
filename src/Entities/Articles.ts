import {Entity,PrimaryGeneratedColumn,Column,CreateDateColumn,UpdateDateColumn,ManyToOne,ManyToMany,JoinColumn,JoinTable,} from "typeorm";
import { Author } from "../Entities/Authors";
import { User } from "../Entities/Users";
import { Media } from "../Entities/Media";

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

export enum ArticleType {
  ARTICLE = "ARTICLE",
  VIDEO = "VIDEO",
  NEWS = "NEWS",
}

@Entity("articles")
export class Article {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({
    type: "enum",
    enum: ArticleType,
    default: ArticleType.ARTICLE,
  })
  type: ArticleType;

  @Column({ type: "varchar" })
  title: string;

  @Column({ type: "varchar", unique: true })
  slug: string;

  @Column({ type: "text", nullable: true })
  excerpt: string | null;

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
  pullQuote: string | null;

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
  publishedAt: Date | null;

  @Column({ type: "timestamp", nullable: true })
  scheduledAt: Date;

  @Column({ type: "int", default: 0 })
  viewCount: number;

  // ── Relations ──
  @Column({ type: "varchar", nullable: true })
  categoryId: string | null;

  @ManyToOne(() => Author, (author) => author.articles, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "authorId" })
  author: Author;

  @Column({ type: "uuid", nullable: true })
  authorId: string | null;

  @ManyToOne(() => User, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "createdById" })
  createdBy: User;

  @Column({ type: "uuid", nullable: true })
  createdById: string | null;

  @ManyToMany(() => Media, (media) => media.articles)
  @JoinTable()
  media: Media[];

  @Column({ type: "uuid", nullable: true })
  coverMediaId: string | null;

  @ManyToOne(() => Media, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "coverMediaId" })
  coverMedia: Media;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}