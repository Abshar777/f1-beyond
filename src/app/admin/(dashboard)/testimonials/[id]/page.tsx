import { notFound } from "next/navigation";
import TestimonialForm from "@/app/admin/TestimonialForm";
import { countTestimonials, getTestimonialById } from "@/lib/testimonial-repo";

/** The editor must always load the current record, never a cached one. */
export const dynamic = "force-dynamic";

export default async function EditTestimonialPage({
  params,
}: {
  // A Promise in this version of Next — it has to be awaited before use.
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [testimonial, total] = await Promise.all([
    getTestimonialById(id),
    countTestimonials(),
  ]);
  if (!testimonial) notFound();

  return <TestimonialForm testimonial={testimonial} total={total} />;
}
