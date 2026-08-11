import { Binary, ObjectId, type Collection } from "mongodb";
import { getDb } from "@/lib/mongodb";

/**
 * Uploaded images, stored in MongoDB.
 *
 * Not written to `public/` on purpose. That works in development and on a VPS,
 * but on a serverless host the filesystem is read-only and ephemeral, so an
 * upload would appear to succeed and then vanish on the next deploy. Keeping the
 * bytes in the database works everywhere, needs no third-party credentials, and
 * means a database restore brings the images back with the posts.
 *
 * Documents rather than GridFS: BSON caps a document at 16MB and uploads are
 * capped well below that, so GridFS's extra moving parts would buy nothing here.
 * Move to GridFS (or S3) if large media ever becomes a requirement.
 */
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
];

type ImageDoc = {
  _id?: ObjectId;
  data: Binary;
  contentType: string;
  filename: string;
  bytes: number;
  createdAt: Date;
};

async function collection(): Promise<Collection<ImageDoc> | null> {
  const db = await getDb();
  return db ? db.collection<ImageDoc>("images") : null;
}

/** Public URL for a stored image. Content-addressed by id, so it never changes. */
export function imageUrl(id: string) {
  return `/api/images/${id}`;
}

export async function saveImage(
  bytes: Uint8Array,
  contentType: string,
  filename: string,
): Promise<string> {
  const images = await collection();
  if (!images) {
    throw new Error(
      "MONGODB_URI is not set, so images cannot be uploaded. Add it to .env.local and restart the dev server.",
    );
  }

  const result = await images.insertOne({
    data: new Binary(bytes),
    contentType,
    filename,
    bytes: bytes.byteLength,
    createdAt: new Date(),
  });

  return result.insertedId.toHexString();
}

export async function getImage(id: string) {
  if (!ObjectId.isValid(id)) return null;

  const images = await collection();
  if (!images) return null;

  const doc = await images.findOne({ _id: new ObjectId(id) });
  if (!doc) return null;

  return {
    // `.buffer` is the raw bytes behind the BSON Binary wrapper.
    data: doc.data.buffer as Uint8Array,
    contentType: doc.contentType,
    bytes: doc.bytes,
  };
}

/**
 * Sniff the container signature.
 *
 * A renamed executable can carry `Content-Type: image/png`, and whatever is
 * stored gets served back out of `/api/images/[id]` later — so the declared type
 * is checked against what the file actually starts with rather than trusted.
 */
export function looksLikeImage(bytes: Uint8Array) {
  const starts = (...sig: number[]) => sig.every((byte, i) => bytes[i] === byte);

  if (starts(0xff, 0xd8, 0xff)) return true; // jpeg
  if (starts(0x89, 0x50, 0x4e, 0x47)) return true; // png
  if (starts(0x47, 0x49, 0x46, 0x38)) return true; // gif

  // webp and avif are RIFF / ISO-BMFF containers: the brand sits at byte 8.
  const brand = new TextDecoder().decode(bytes.slice(8, 12));
  if (starts(0x52, 0x49, 0x46, 0x46) && brand === "WEBP") return true;
  if (["avif", "avis", "mif1", "msf1"].includes(brand)) return true;

  return false;
}
