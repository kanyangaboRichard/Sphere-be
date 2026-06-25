import {Entity,PrimaryGeneratedColumn,Column,CreateDateColumn,UpdateDateColumn,OneToMany,} from "typeorm";
import { AuditLog } from "../Entities/Auditlog";

export enum UserRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN",
  AUTHOR = "AUTHOR",
}

export enum UserStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  ARCHIVED = "ARCHIVED",
}

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 100 })
  firstName: string;

  @Column({ type: "varchar", length: 100 })
  lastName: string;

  @Column({ type: "varchar", unique: true })
  email: string;

  @Column({ type: "varchar" })
  password: string;

  @Column({
    type: "enum",
    enum: UserRole,
    default: UserRole.AUTHOR,
  })
  role: UserRole;

  @Column({
    type: "enum",
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status: UserStatus;

  @Column({ type: "varchar", nullable: true })
  avatar: string;

  @Column({ type: "varchar", nullable: true })
  phone: string;

  @Column({ type: "varchar", nullable: true })
  bio: string;

  @Column({ type: "varchar", nullable: true })
  resetPasswordToken: string;

  @Column({ type: "timestamp", nullable: true })
  resetPasswordExpires: Date;

  @Column({ type: "timestamp", nullable: true })
  lastLoginAt: Date;

  @OneToMany(() => AuditLog, (auditLog) => auditLog.performedBy)
  auditLogs: AuditLog[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}