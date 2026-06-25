import {Entity,PrimaryGeneratedColumn,Column,CreateDateColumn,UpdateDateColumn,ManyToOne,JoinColumn,} from "typeorm";
import { Article } from "../Entities/Articles";

export enum VideoSource {
  YOUTUBE = "YOUTUBE",
  VIMEO = "VIMEO",
  UPLOAD = "UPLOAD",
  LIVE = "LIVE",
}

export enum VideoPlacement {
  HERO = "HERO",
  INLINE = "INLINE",
  GRID = "GRID",
  BACKGROUND = "BACKGROUND",
}

export enum VideoStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  PROCESSING = "PROCESSING",
}

@Entity("videos")
export class Video {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar" })
  title: string;

  @Column({ type: "text", nullable: true })
  caption: string;

  @Column({
    type: "enum",
    enum: VideoSource,
  })
  source: VideoSource;

  @Column({ type: "varchar", nullable: true })
  url: string;

  @Column({ type: "varchar", nullable: true })
  videoPublicId: string;

  @Column({ type: "varchar", nullable: true })
  thumbnailUrl: string;

  @Column({ type: "varchar", nullable: true })
  thumbnailPublicId: string;

  @Column({
    type: "enum",
    enum: VideoPlacement,
    default: VideoPlacement.INLINE,
  })
  placement: VideoPlacement;

  @Column({
    type: "enum",
    enum: VideoStatus,
    default: VideoStatus.ACTIVE,
  })
  status: VideoStatus;

  @Column({ type: "int", nullable: true })
  duration: number;

  @Column({ type: "boolean", default: false })
  autoplay: boolean;

  @Column({ type: "boolean", default: false })
  loop: boolean;

  @Column({ type: "boolean", default: true })
  showControls: boolean;

  @Column({ type: "boolean", default: true })
  showDuration: boolean;

  @Column({ type: "boolean", default: false })
  isLive: boolean;

  @Column({ type: "boolean", default: false })
  isFeatured: boolean;

  @Column({ type: "int", default: 0 })
  order: number;

  @Column({ type: "int", default: 0 })
  viewCount: number;

  @ManyToOne(() => Article, (article) => article.videos, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "articleId" })
  article: Article;

  @Column({ type: "varchar", nullable: true })
  articleId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}