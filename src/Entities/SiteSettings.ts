import {Entity,PrimaryGeneratedColumn,Column,CreateDateColumn,UpdateDateColumn,ManyToOne,JoinColumn,} from "typeorm";
import { User } from "../Entities/Users";

export enum ThemePreset {
  DARK_NAVY = "DARK_NAVY",
  MIDNIGHT = "MIDNIGHT",
  EDITORIAL = "EDITORIAL",
  LIGHT = "LIGHT",
}

export enum DisplayFont {
  BARLOW_CONDENSED = "BARLOW_CONDENSED",
  OSWALD = "OSWALD",
  PLAYFAIR_DISPLAY = "PLAYFAIR_DISPLAY",
  ANTON = "ANTON",
}

@Entity("site_settings")
export class SiteSettings {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  // ── Site Identity ──
  @Column({ type: "varchar", default: "Sphere Tech Group" })
  siteName: string;

  @Column({ type: "varchar", nullable: true })
  siteTagline: string;

  @Column({ type: "varchar", nullable: true })
  siteLogo: string;

  @Column({ type: "varchar", nullable: true })
  siteLogoPublicId: string;

  @Column({ type: "varchar", nullable: true })
  favicon: string;

  @Column({ type: "varchar", nullable: true })
  siteEmail: string;

  @Column({ type: "varchar", nullable: true })
  sitePhone: string;

  @Column({ type: "varchar", nullable: true })
  siteAddress: string;

  // ── Theme ──
  @Column({
    type: "enum",
    enum: ThemePreset,
    default: ThemePreset.DARK_NAVY,
  })
  themePreset: ThemePreset;

  @Column({ type: "varchar", default: "#00C8E0" })
  accentColor: string;

  @Column({ type: "varchar", default: "#15202e" })
  navBackground: string;

  @Column({
    type: "enum",
    enum: DisplayFont,
    default: DisplayFont.BARLOW_CONDENSED,
  })
  displayFont: DisplayFont;

  // ── Features ──
  @Column({ type: "boolean", default: true })
  showTicker: boolean;

  @Column({ type: "boolean", default: true })
  showHeroGrid: boolean;

  @Column({ type: "boolean", default: true })
  showVideoSection: boolean;

  @Column({ type: "boolean", default: true })
  showNewsletter: boolean;

  @Column({ type: "boolean", default: true })
  showDefenseColumn: boolean;

  @Column({ type: "boolean", default: true })
  showTrendingSidebar: boolean;

  @Column({ type: "boolean", default: true })
  showBreakingBadge: boolean;

  // ── Homepage Layout ──
  @Column({ type: "int", default: 3 })
  heroArticleCount: number;

  @Column({ type: "int", default: 10 })
  feedArticleCount: number;

  @Column({ type: "int", default: 4 })
  videoGridCount: number;

  @Column({ type: "int", default: 5 })
  trendingCount: number;

  // ── Social Links ──
  @Column({ type: "varchar", nullable: true })
  twitter: string;

  @Column({ type: "varchar", nullable: true })
  linkedin: string;

  @Column({ type: "varchar", nullable: true })
  facebook: string;

  @Column({ type: "varchar", nullable: true })
  instagram: string;

  @Column({ type: "varchar", nullable: true })
  youtube: string;

  // ── SEO ──
  @Column({ type: "varchar", nullable: true })
  metaTitle: string;

  @Column({ type: "text", nullable: true })
  metaDescription: string;

  @Column({ type: "varchar", nullable: true })
  metaImage: string;

  @Column({ type: "varchar", nullable: true })
  googleAnalyticsId: string;

  // ── Newsletter ──
  @Column({ type: "varchar", nullable: true })
  newsletterTitle: string;

  @Column({ type: "text", nullable: true })
  newsletterSubtitle: string;

  @Column({ type: "boolean", default: true })
  newsletterEnabled: boolean;

  // ── Footer ──
  @Column({ type: "text", nullable: true })
  footerText: string;

  @Column({ type: "jsonb", nullable: true })
  footerLinks: object;

  // ── Tracking ──
  @Column({ type: "boolean", default: true })
  isActive: boolean;

  @ManyToOne(() => User, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "updatedById" })
  updatedBy: User;

  @Column({ type: "varchar", nullable: true })
  updatedById: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}