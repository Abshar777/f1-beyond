import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_UPLOAD_BYTES,
  imageUrl,
  looksLikeImage,
  saveImage,
} from "@/lib/image-repo";

/**
 * Upload endpoint for the admin image fields (cover and author photo).
 *
 * A route handler rather than a server action: actions cap their request body at
 * 1MB by default, which any real photograph blows straight through.
 *
 * It sits outside `/admin`, so `proxy.ts` does not match it — deliberately. The
 * proxy answers an unauthenticated request with a 307 to the login page, and a
 * `fetch` would then have to interpret an HTML redirect as an auth failure.
 * Checking the session here returns a clean 401 the client can act on, which
 * means this check IS the authorisation rather than a convenience.
 */
export async function POST(request: Request) {
  const store = await cookies();
  if (!(await verifySessionToken(store.get(SESSION_COOKIE)?.value))) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "That upload could not be read." },
      { status: 400 },
    );
  }

  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "No file was attached." }, { status: 400 });
  }

  // The browser's Content-Type is a hint, not proof. The magic-byte check below
  // is what actually decides.
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: `${file.type || "That file type"} is not an image we accept.` },
      { status: 415 },
    );
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    const limit = (MAX_UPLOAD_BYTES / 1024 / 1024).toFixed(0);
    const actual = (file.size / 1024 / 1024).toFixed(1);
    return NextResponse.json(
      { error: `That image is ${actual}MB — the limit is ${limit}MB.` },
      { status: 413 },
    );
  }

  const bytes = new Uint8Array(await file.arrayBuffer());

  if (!looksLikeImage(bytes)) {
    return NextResponse.json(
      { error: "That file is not a real image, whatever it is named." },
      { status: 415 },
    );
  }

  try {
    const id = await saveImage(bytes, file.type, file.name);
    return NextResponse.json({ url: imageUrl(id) }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed." },
      { status: 500 },
    );
  }
}
