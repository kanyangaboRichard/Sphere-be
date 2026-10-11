import {S3Client,PutObjectCommand,DeleteObjectCommand,DeleteObjectsCommand,} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

export class S3Service {
  private client: S3Client;
  private bucket = process.env.S3_BUCKET as string;
  private publicBaseUrl = process.env.S3_PUBLIC_BASE_URL as string;

  constructor() {
    this.client = new S3Client({
      region: process.env.S3_REGION,
      // Leave S3_ENDPOINT unset for real AWS S3; set it for R2/Spaces/MinIO
      endpoint: process.env.S3_ENDPOINT || undefined,
      forcePathStyle: !!process.env.S3_ENDPOINT,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY as string,
      },
    });
  }

  buildKey(originalFilename: string): string {
    const ext = originalFilename.split(".").pop();
    const datePrefix = new Date().toISOString().slice(0, 7);
    return `media/${datePrefix}/${randomUUID()}.${ext}`;
  }

  async getPresignedUploadUrl(key: string, contentType: string): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });
    return getSignedUrl(this.client, command, { expiresIn: 300 });
  }

  publicUrl(key: string): string {
    return `${this.publicBaseUrl}/${key}`;
  }

  async deleteObject(key: string): Promise<void> {
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
  }

  async deleteObjects(keys: string[]): Promise<void> {
    if (keys.length === 0) return;
    await this.client.send(
      new DeleteObjectsCommand({
        Bucket: this.bucket,
        Delete: { Objects: keys.map(Key => ({ Key })) },
      })
    );
  }
}