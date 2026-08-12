import TestimonialForm from "@/app/admin/TestimonialForm";
import { countTestimonials } from "@/lib/testimonial-repo";

/** The position field needs the live count, so this cannot be prerendered. */
export const dynamic = "force-dynamic";

export default async function NewTestimonialPage() {
  return <TestimonialForm total={await countTestimonials()} />;
}
