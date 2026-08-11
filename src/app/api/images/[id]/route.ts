import { NextResponse } from "next/server";
import { getImage } from "@/lib/image-repo";

/**
 * Serves an uploaded image.
 *
 * Public — these are blog covers and author photos, and the URL is only
 * discoverable from a post that is itself public.
 *
 * Cached `immutable` because the URL is content-addressed: the id identifies one
 * stored blob that is never rewritten. Changing a post's image mints a new id, so
 * there is no stale-cache problem to guard against — and it means these bytes are
 * fetched once per visitor, not once per page view.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const image = await getImage(id);

  if (!image) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  return new NextResponse(image.data as unknown as BodyInit, {
    headers: {
      "Content-Type": image.contentType,
      "Content-Length": String(image.bytes),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
