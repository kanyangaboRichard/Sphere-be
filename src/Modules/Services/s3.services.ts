import {S3Client,PutObjectCommand,DeleteObjectCommand,DeleteObjectsCommand,HeadBucketCommand,CreateBucketCommand,PutBucketPolicyCommand,} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

function makeClient(endpoint?: string) {
  return new S3Client({
    region: process.env.S3_REGION,
    endpoint: endpoint || undefined,
    forcePathStyle: !!endpoint,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID as string,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY as string,
    },
  });
}

export class S3Service {
  private bucket = process.env.S3_BUCKET as string;
  private publicBaseUrl = (process.env.S3_PUBLIC_BASE_URL || "").replace(/\/$/, "");

  private client = makeClient(process.env.S3_ENDPOINT);

  
  private signer = makeClient(process.env.S3_PUBLIC_ENDPOINT || process.env.S3_ENDPOINT);

  buildKey(originalFilename: string): string {
    const ext = originalFilename.split(".").pop();
    const datePrefix = new Date().toISOString().slice(0, 7);
    return `media/${datePrefix}/${randomUUID()}.${ext}`;
  }

  async getPresignedUploadUrl(key: string, contentType: string): Promise<string> {
    const command = new PutObjectCommand({ Bucket: this.bucket, Key: key, ContentType: contentType });
    return getSignedUrl(this.signer, command, { expiresIn: 300 });
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
  async ensurePublicBucket(): Promise<void> {
    const Bucket = this.bucket;
    try {
      await this.client.send(new HeadBucketCommand({ Bucket }));
    } catch {
      await this.client.send(new CreateBucketCommand({ Bucket }));
    }
    await this.client.send(
      new PutBucketPolicyCommand({
        Bucket,
        Policy: JSON.stringify({
          Version: "2012-10-17",
          Statement: [{
            Effect: "Allow",
            Principal: { AWS: ["*"] },
            Action: ["s3:GetObject"],
            Resource: [`arn:aws:s3:::${Bucket}/*`],
          }],
        }),
      })
    );
  }
}