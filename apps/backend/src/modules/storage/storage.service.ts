import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

export interface UploadResult {
  key: string;
  url: string;
  bucket: string;
}

@Injectable()
export class StorageService {
  private s3Client: S3Client;
  private privateBucket: string;
  private publicBucket: string;
  private region: string;

  constructor(private configService: ConfigService) {
    this.region = this.configService.get<string>('AWS_REGION') || 'eu-west-3';
    this.privateBucket = this.configService.get<string>('AWS_S3_PRIVATE_BUCKET') || 'prosets-private';
    this.publicBucket = this.configService.get<string>('AWS_S3_PUBLIC_BUCKET') || 'prosets-public';

    this.s3Client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID') || '',
        secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY') || '',
      },
    });
  }

  private generateKey(folder: string, filename: string): string {
    const ext = filename.split('.').pop();
    const uniqueId = uuidv4();
    return `${folder}/${uniqueId}.${ext}`;
  }

  async uploadPrivateFile(
    buffer: Buffer,
    filename: string,
    contentType: string,
    folder: string = 'assets',
  ): Promise<UploadResult> {
    const key = this.generateKey(folder, filename);

    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.privateBucket,
          Key: key,
          Body: buffer,
          ContentType: contentType,
        }),
      );

      return {
        key,
        url: `s3://${this.privateBucket}/${key}`,
        bucket: this.privateBucket,
      };
    } catch (error) {
      console.error('Failed to upload private file:', error);
      throw new InternalServerErrorException('Failed to upload file');
    }
  }

  async uploadPublicFile(
    buffer: Buffer,
    filename: string,
    contentType: string,
    folder: string = 'previews',
  ): Promise<UploadResult> {
    const key = this.generateKey(folder, filename);

    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.publicBucket,
          Key: key,
          Body: buffer,
          ContentType: contentType,
          ACL: 'public-read',
        }),
      );

      const url = `https://${this.publicBucket}.s3.${this.region}.amazonaws.com/${key}`;

      return {
        key,
        url,
        bucket: this.publicBucket,
      };
    } catch (error) {
      console.error('Failed to upload public file:', error);
      throw new InternalServerErrorException('Failed to upload file');
    }
  }

  async generatePresignedDownloadUrl(
    key: string,
    expiresInSeconds: number = 300,
  ): Promise<{ url: string; expiresAt: Date }> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.privateBucket,
        Key: key,
      });

      const url = await getSignedUrl(this.s3Client, command, {
        expiresIn: expiresInSeconds,
      });

      const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);

      return { url, expiresAt };
    } catch (error) {
      console.error('Failed to generate presigned URL:', error);
      throw new InternalServerErrorException('Failed to generate download URL');
    }
  }

  async deleteFile(bucket: 'private' | 'public', key: string): Promise<void> {
    const bucketName = bucket === 'private' ? this.privateBucket : this.publicBucket;

    try {
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: bucketName,
          Key: key,
        }),
      );
    } catch (error) {
      console.error('Failed to delete file:', error);
      throw new InternalServerErrorException('Failed to delete file');
    }
  }

  async deleteMultipleFiles(
    bucket: 'private' | 'public',
    keys: string[],
  ): Promise<void> {
    await Promise.all(keys.map((key) => this.deleteFile(bucket, key)));
  }

  getPublicUrl(key: string): string {
    return `https://${this.publicBucket}.s3.${this.region}.amazonaws.com/${key}`;
  }
}
