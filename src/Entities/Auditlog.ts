import {Entity,PrimaryGeneratedColumn,Column,CreateDateColumn,ManyToOne,JoinColumn,} from "typeorm";
import { User } from "../Entities/Users";

export enum AuditAction {
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
  PUBLISH = "PUBLISH",
  UNPUBLISH = "UNPUBLISH",
  ARCHIVE = "ARCHIVE",
  RESTORE = "RESTORE",
  LOGIN = "LOGIN",
  LOGOUT = "LOGOUT",
  PASSWORD_RESET = "PASSWORD_RESET",
}

export enum AuditEntity {
  ARTICLE = "ARTICLE",
  CATEGORY = "CATEGORY",
  AUTHOR = "AUTHOR",
  VIDEO = "VIDEO",
  USER = "USER",
  SITE_SETTINGS = "SITE_SETTINGS",
  SHOP_CATEGORY = "SHOP_CATEGORY",
  SHOP_PRODUCT = "SHOP_PRODUCT",
}

@Entity("audit_logs")
export class AuditLog {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({
    type: "enum",
    enum: AuditAction,
  })
  action: AuditAction;

  @Column({
    type: "enum",
    enum: AuditEntity,
  })
  entity: AuditEntity;

  @Column({ type: "varchar", nullable: true })
  entityId: string;

  @Column({ type: "jsonb", nullable: true })
  previousValue: object;

  @Column({ type: "jsonb", nullable: true })
  newValue: object;

  @Column({ type: "varchar", nullable: true })
  ipAddress: string;

  @Column({ type: "varchar", nullable: true })
  userAgent: string;

  @Column({ type: "text", nullable: true })
  notes: string;

  @ManyToOne(() => User, (user) => user.auditLogs, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "performedById" })
  performedBy: User;

  @Column({ type: "varchar", nullable: true })
  performedById: string;

  @CreateDateColumn()
  createdAt: Date;
}