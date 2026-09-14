// Gateway a Cloudflare R2 (S3-compatible). Es lo ÚNICO que sabe hablar con R2:
// no conoce troqueles ni reglas de negocio. Encapsula el SDK de S3.
import { config } from "dotenv";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

config();

const BUCKET = process.env.R2_BUCKET;
const SIGNED_URL_TTL = Number(process.env.R2_SIGNED_URL_TTL || 3600); // seg

// Cliente S3 apuntando al endpoint de R2. Se crea una sola vez (singleton).
export const r2Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

// Sube un objeto y devuelve su key (fuente de verdad que se guarda en BD).
export const putObject = async ({ key, buffer, contentType }) => {
  await r2Client.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    }),
  );
  return { key };
};

export const deleteObject = (key) =>
  r2Client.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));

// Bucket privado: la URL para <img src> se firma temporalmente al leer.
export const getSignedReadUrl = (key, expiresIn = SIGNED_URL_TTL) =>
  getSignedUrl(
    r2Client,
    new GetObjectCommand({ Bucket: BUCKET, Key: key }),
    { expiresIn },
  );
