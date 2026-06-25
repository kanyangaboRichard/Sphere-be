import { AppDataSource } from "../../Config/database";
import { User, UserRole, UserStatus } from "../../Entities/Users";
import { AuditLog, AuditAction, AuditEntity } from "../../Entities/Auditlog";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const userRepo = () => AppDataSource.getRepository(User);
const auditRepo = () => AppDataSource.getRepository(AuditLog);

export class AuthService {

  // ── Register ──
  async register(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role?: UserRole;
  }) {
    const existing = await userRepo().findOne({ where: { email: data.email } });
    if (existing) throw new Error("Email already exists");

    const hashed = await bcrypt.hash(data.password, 12);

    const user = userRepo().create({
      ...data,
      password: hashed,
      role: data.role || UserRole.AUTHOR,
      status: UserStatus.ACTIVE,
    });

    await userRepo().save(user);

    await auditRepo().save(
      auditRepo().create({
        action: AuditAction.CREATE,
        entity: AuditEntity.USER,
        entityId: user.id,
        newValue: { email: user.email, role: user.role },
      })
    );

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  // ── Login ──
  async login(email: string, password: string, ipAddress?: string) {
    const user = await userRepo().findOne({ where: { email } });
    if (!user) throw new Error("Invalid credentials");
    if (user.status !== UserStatus.ACTIVE) throw new Error("Account is inactive");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Invalid credentials");

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" } as any
    );

    // Update last login
    await userRepo().update(user.id, { lastLoginAt: new Date() });

    await auditRepo().save(
      auditRepo().create({
        action: AuditAction.LOGIN,
        entity: AuditEntity.USER,
        entityId: user.id,
        performedById: user.id,
        ipAddress,
      })
    );

    const { password: _, ...userWithoutPassword } = user;
    return { token, user: userWithoutPassword };
  }

  // ── Get current user ──
  async getMe(userId: string) {
    const user = await userRepo().findOne({ where: { id: userId } });
    if (!user) throw new Error("User not found");
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  // ── Forgot password ──
  async forgotPassword(email: string) {
    const user = await userRepo().findOne({ where: { email } });
    if (!user) throw new Error("No account found with that email");

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await userRepo().update(user.id, {
      resetPasswordToken: token,
      resetPasswordExpires: expires,
    });

    return { token, user };
  }

  // ── Reset password ──
  async resetPassword(token: string, newPassword: string) {
    const user = await userRepo().findOne({
      where: { resetPasswordToken: token },
    });

    if (!user) throw new Error("Invalid or expired reset token");
    if (user.resetPasswordExpires < new Date()) throw new Error("Reset token has expired");

    const hashed = await bcrypt.hash(newPassword, 12);

    await userRepo().update(user.id, {
      password: hashed,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    });

    await auditRepo().save(
      auditRepo().create({
        action: AuditAction.PASSWORD_RESET,
        entity: AuditEntity.USER,
        entityId: user.id,
        performedById: user.id,
      })
    );

    return { message: "Password reset successfully" };
  }

  // ── Change password ──
  async changePassword(userId: string, oldPassword: string, newPassword: string) {
    const user = await userRepo().findOne({ where: { id: userId } });
    if (!user) throw new Error("User not found");

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) throw new Error("Current password is incorrect");

    const hashed = await bcrypt.hash(newPassword, 12);
    await userRepo().update(userId, { password: hashed });

    return { message: "Password changed successfully" };
  }
}