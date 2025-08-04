'use server';

import {S3Client, HeadObjectCommand} from "@aws-sdk/client-s3";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { v4 as uuidv4 } from 'uuid'

export async function createPresignedPostNext(contentType) {
    const client = new S3Client({ region: process.env.AWS_REGION })
    return await createPresignedPost(client, {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: uuidv4(),
      Conditions: [
        ['content-length-range', 0, 10485760], // up to 10 MB
        ['starts-with', '$Content-Type', contentType],
      ],
      Fields: {
        acl: 'public-read',
        'Content-Type': contentType,
      },
      Expires: 600, // Seconds before the presigned post expires. 3600 by default.
    })
}

export async function existS3Object(objectKey) {
  try {
    const client = new S3Client({ region: process.env.AWS_REGION })
  
    const input = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: objectKey,
  };

    const command = new HeadObjectCommand(input);
    await client.send(command);

    return objectKey;

  } catch (error) {
    console.log(error.name)
    return false;
  }
}