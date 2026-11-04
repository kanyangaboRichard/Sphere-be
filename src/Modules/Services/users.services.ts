import { FindOptionsSelect, IsNull, Not } from "typeorm";
import { AppDataSource } from "../../Config/database";
import { User, UserRole } from "../../Entities/Users";
import { Article } from "../../Entities/Articles";
import { AuditLog } from "../../Entities/Auditlog";

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

// Fields safe to send to the frontend: no password or reset tokens
const PUBLIC_SELECT: FindOptionsSelect<User> = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  role: true,
  status: true,
  avatar: true,
  lastLoginAt: true,
  createdAt: true,
  deletedAt: true,
};

export class UserService {
  private repo = AppDataSource.getRepository(User);

  /** Active users. Trashed users are excluded automatically. */
  async list() {
    return this.repo.find({ select: PUBLIC_SELECT, order: { createdAt: "DESC" } });
  }

  /** Users currently in Trash. */
  async listTrash() {
    return this.repo.find({
      select: PUBLIC_SELECT,
      withDeleted: true,
      where: { deletedAt: Not(IsNull()) },
      order: { deletedAt: "DESC" },
    });
  }

  /** Loads the target user. Blocks changes to yourself or a super admin. */
  private async getTarget(id: string, actorId: string, withDeleted = false) {
    const user = await this.repo.findOne({ where: { id }, withDeleted });
    if (!user) throw new HttpError(404, "User not found");
    if (user.id === actorId) {
      throw new HttpError(400, "You can't change your own role or delete your own account");
    }
    if (user.role === UserRole.SUPER_ADMIN) {
      throw new HttpError(403, "Super admin accounts can't be changed here");
    }
    return user;
  }

  async setAdmin(id: string, makeAdmin: boolean, actorId: string) {
    const user = await this.getTarget(id, actorId);
    user.role = makeAdmin ? UserRole.ADMIN : UserRole.AUTHOR;
    await this.repo.save(user);
    return this.repo.findOne({ where: { id }, select: PUBLIC_SELECT });
  }

  async moveToTrash(id: string, actorId: string) {
    await this.getTarget(id, actorId);
    await this.repo.softDelete(id);
  }

  async restore(id: string, actorId: string) {
    const user = await this.getTarget(id, actorId, true);
    if (!user.deletedAt) throw new HttpError(400, "User is not in Trash");
    await this.repo.restore(id);
  }

  /**
   * Only for users already in Trash. Keeps their articles and audit logs,
   * clearing the link to the user first so the delete isn't blocked.
   */
  async deletePermanently(id: string, actorId: string) {
    const user = await this.getTarget(id, actorId, true);
    if (!user.deletedAt) throw new HttpError(400, "Move the user to Trash first");

    await AppDataSource.transaction(async (manager) => {
      await manager.update(Article, { createdById: id }, { createdById: null });
      await manager.update(AuditLog, { performedById: id }, { performedById: null });
      await manager.delete(User, id);
    });
  }
}