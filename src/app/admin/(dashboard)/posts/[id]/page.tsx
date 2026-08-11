import { notFound } from "next/navigation";
import PostForm from "@/app/admin/PostForm";
import { getPostById } from "@/lib/blog-repo";

/** The editor must always load the current record, never a cached one. */
export const dynamic = "force-dynamic";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getPostById(id);
  if (!post) notFound();

  return <PostForm post={post} />;
}
