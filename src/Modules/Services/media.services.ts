import { AppDataSource } from "../../Config/database";
import { Media, MediaType } from "../../Entities/Media";
import { S3Service } from "./s3.services";
import { In } from "typeorm";

const mediaRepo = () => AppDataSource.getRepository(Media);
const s3 = new S3Service();

export class MediaService {

  // ── Step 1: ask for a presigned upload URL ──
  async presignUpload(data: { filename: string; contentType: string; sizeKb: number }) {
    const key = s3.buildKey(data.filename);
    const uploadUrl = await s3.getPresignedUploadUrl(key, data.contentType);
    return { uploadUrl, key };
  }

  // ── Step 2: confirm the upload actually landed, save the DB row ──
  async confirmUpload(
    data: { key: string; filename: string; contentType: string; sizeKb: number },
    uploadedById?: string
  ) {
    const type = data.contentType.startsWith("video") ? MediaType.VIDEO : MediaType.IMAGE;

    const media = mediaRepo().create({
      filename: data.filename,
      key: data.key,
      url: s3.publicUrl(data.key),
      mimeType: data.contentType,
      type,
      sizeKb: data.sizeKb,
      uploadedBy: uploadedById ? { id: uploadedById } as any : undefined,
    });

    await mediaRepo().save(media);
    return media;
  }

  // ── Get all (with search/type/sort, matching GalleryPage's needs) ──
  async getAll(query: { search?: string; type?: "image" | "video"; sort?: string }) {
    const qb = mediaRepo()
      .createQueryBuilder("media")
      .leftJoinAndSelect("media.articles", "article")
      .leftJoinAndSelect("media.uploadedBy", "uploadedBy");

    if (query.search) {
      qb.andWhere("media.filename ILIKE :search", { search: `%${query.search}%` });
    }
    if (query.type) {
      qb.andWhere("media.type = :type", { type: query.type });
    }

    switch (query.sort) {
      case "oldest":
        qb.orderBy("media.createdAt", "ASC");
        break;
      case "largest":
        qb.orderBy("media.sizeKb", "DESC");
        break;
      case "smallest":
        qb.orderBy("media.sizeKb", "ASC");
        break;
      default:
        qb.orderBy("media.createdAt", "DESC");
    }

    return qb.getMany();
  }

  // ── Delete one ──
  async delete(id: string) {
    const media = await mediaRepo().findOne({ where: { id } });
    if (!media) throw new Error("Media not found");
    await s3.deleteObject(media.key);
    await mediaRepo().remove(media);
    return { message: "Media deleted successfully" };
  }

  // ── Delete many ──
  async deleteBulk(ids: string[]) {
    const items = await mediaRepo().findBy({ id: In(ids) });
    if (items.length === 0) return { message: "Nothing to delete" };
    await s3.deleteObjects(items.map(m => m.key));
    await mediaRepo().remove(items);
    return { message: `${items.length} media deleted successfully` };
  }
}