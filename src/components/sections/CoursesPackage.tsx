import Link from "next/link";
import SectionHeading from "@/components/ui/SectionHeading";
import ThemeButton from "@/components/ui/ThemeButton";
import Reveal from "@/components/ui/Reveal";

/**
 * Source note: the template's HTML comment calls this the "courses package
 * area", but the actual markup (e-learning.html lines 2196-2761) is a
 * 3-card course-listing grid (thumbnail, rating, instructor, lesson/course/
 * student counts, current+old price, arrow CTA) followed by a "view all
 * Package" button — not a SaaS-style pricing table with a feature
 * checklist or a monthly/yearly toggle. Neither exists in the source, so
 * this component reproduces the real content instead of inventing one.
 */
type CoursePackageItem = {
  id: string;
  href: string;
  thumbnail: string;
  thumbnailAlt: string;
  offerBadge?: string;
  rating: string;
  author: string;
  title: string;
  lessons: string;
  courses: string;
  students: string;
  priceCurrent: string;
  priceOld: string;
};

const COURSE_PACKAGES: CoursePackageItem[] = [
  {
    id: "starter-trader-pack",
    href: "/course-details-classic-v2",
    thumbnail: "/assets/imgs/stock/trading-desk.jpg",
    thumbnailAlt: "Course 1",
    rating: "4.9/5",
    author: "Laura Anderson",
    title: "Starter trader pack",
    lessons: "18 Lessons",
    courses: "3 Modules",
    students: "240 Traders",
    priceCurrent: "$156.00",
    priceOld: "$256.00",
  },
  {
    id: "pro-trader-accelerator",
    href: "/course-details-classic-v2",
    thumbnail: "/assets/imgs/stock/seminar-class.jpg",
    thumbnailAlt: "Course 1",
    offerBadge: "50% off",
    rating: "4.9/5",
    author: "Arlene McCoy",
    title: "Pro trader accelerator",
    lessons: "42 Lessons",
    courses: "6 Modules",
    students: "180 Traders",
    priceCurrent: "$156.00",
    priceOld: "$256.00",
  },
  {
    id: "institutional-strategy-pack",
    href: "/course-details-classic-v2",
    thumbnail: "/assets/imgs/stock/trading-chart-2.jpg",
    thumbnailAlt: "Course 1",
    rating: "4.9/5",
    author: "Jacob Jones",
    title: "Institutional strategy pack",
    lessons: "60 Lessons",
    courses: "8 Modules",
    students: "95 Traders",
    priceCurrent: "$156.00",
    priceOld: "$256.00",
  },
];

const FULL_STAR_PATH =
  "M2.23125 11.0833L3.17917 6.98542L0 4.22917L4.2 3.86458L5.83333 0L7.46667 3.86458L11.6667 4.22917L8.4875 6.98542L9.43542 11.0833L5.83333 8.91042L2.23125 11.0833Z";
const HALF_STAR_PATH =
  "M7.67083 8.6625L7.18958 6.5625L8.80833 5.1625L6.67917 4.97292L5.83333 2.98958V7.53958L7.67083 8.6625ZM2.23125 11.0833L3.17917 6.98542L0 4.22917L4.2 3.86458L5.83333 0L7.46667 3.86458L11.6667 4.22917L8.4875 6.98542L9.43542 11.0833L5.83333 8.91042L2.23125 11.0833Z";

/** 4 full stars + 1 half star, matching the "4.9/5" rating shown on every card in the source. */
function RatingStars() {
  return (
    <>
      {[FULL_STAR_PATH, FULL_STAR_PATH, FULL_STAR_PATH, FULL_STAR_PATH, HALF_STAR_PATH].map(
        (d, i) => (
          <svg
            key={i}
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d={d} fill="#d4af37" />
          </svg>
        ),
      )}
    </>
  );
}

/** clipId must be unique per card instance since this icon carries a <clipPath> id. */
function LessonsIcon({ clipId }: { clipId: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath={`url(#${clipId})`}>
        <path
          d="M11.198 1.1166C10.89 0.251268 9.936 -0.202066 9.06933 0.104601L8.442 0.327934C8.02267 0.477268 7.686 0.780601 7.49533 1.18193C7.396 1.38993 7.34267 1.61193 7.334 1.8346V1.66593C7.334 0.746601 6.586 -0.000732422 5.66733 -0.000732422H1.66667C0.748 -6.57552e-05 0 0.747268 0 1.6666V15.9999H7.33333V1.9666C7.34 2.1306 7.37133 2.2946 7.428 2.45327L12.098 16.0146L15.9953 14.6826L11.198 1.1166ZM6.66667 1.6666V3.33327H4V0.666601H5.66667C6.218 0.666601 6.66667 1.11527 6.66667 1.6666ZM4 3.99993H6.66667V11.9999H4V3.99993ZM3.33333 11.9999H0.666667V3.99993H3.33333V11.9999ZM1.66667 0.666601H3.33333V3.33327H0.666667V1.6666C0.666667 1.11527 1.11533 0.666601 1.66667 0.666601ZM0.666667 12.6666H3.33333V15.3333H0.666667V12.6666ZM4 15.3333V12.6666H6.66667V15.3333H4ZM14.0793 11.2633L11.4853 12.1853L8.85667 4.55193L11.388 3.6526L14.0793 11.2633ZM8.09667 1.4686C8.21133 1.22793 8.41333 1.04527 8.66533 0.955268L9.29267 0.732601C9.40333 0.692601 9.516 0.674601 9.62667 0.674601C10.038 0.674601 10.4247 0.930601 10.57 1.33927L11.166 3.0246L8.63933 3.92193L8.05733 2.2326C7.968 1.98127 7.982 1.70993 8.09667 1.4686ZM11.7027 12.8153L14.302 11.8913L15.1433 14.2699L12.5133 15.1686L11.7027 12.8159V12.8153Z"
          fill="#09090b"
        />
      </g>
      <defs>
        <clipPath id={clipId}>
          <rect width="16" height="16" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}

function CoursesIcon() {
  return (
    <svg
      width="14"
      height="16"
      viewBox="0 0 14 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10.3333 0H3C1.34667 0 0 1.34667 0 3V13.6667C0 14.9533 1.04667 16 2.33333 16H10.3333C11.9867 16 13.3333 14.6533 13.3333 13V3C13.3333 1.34667 11.9867 0 10.3333 0ZM12.6667 3V11.3333H3.33333V0.666667H10.3333C11.62 0.666667 12.6667 1.71333 12.6667 3ZM0.666667 3C0.666667 1.82667 1.54 0.853333 2.66667 0.693333V11.3333H2.33333C1.68 11.3333 1.09333 11.6 0.666667 12.0333V3ZM10.3333 15.3333H2.33333C1.41333 15.3333 0.666667 14.5867 0.666667 13.6667C0.666667 12.7467 1.41333 12 2.33333 12H12.6667V13C12.6667 14.2867 11.62 15.3333 10.3333 15.3333ZM5.28 9.31333C5.45333 9.37333 5.64667 9.28667 5.70667 9.11333L6.35333 7.33333H9.56L10.2067 9.11333C10.2533 9.24667 10.3867 9.33333 10.52 9.33333C10.56 9.33333 10.5933 9.33333 10.6333 9.31333C10.8067 9.25333 10.8933 9.06 10.8333 8.88667L8.78667 3.24667C8.66 2.89333 8.33333 2.66667 7.95333 2.66667C7.57333 2.66667 7.25333 2.89333 7.12667 3.24667L5.08 8.88667C5.02 9.06 5.10667 9.25333 5.28 9.31333ZM7.75333 3.47333C7.8 3.34667 7.91333 3.33333 7.95333 3.33333C7.99333 3.33333 8.11333 3.34667 8.16 3.47333L9.32 6.66667H6.6L7.76 3.47333H7.75333Z"
        fill="#09090b"
      />
    </svg>
  );
}

function StudentsIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8 8C8.79113 8 9.56448 7.76541 10.2223 7.32588C10.8801 6.88635 11.3928 6.26164 11.6955 5.53074C11.9983 4.79983 12.0775 3.99556 11.9231 3.21964C11.7688 2.44372 11.3878 1.73098 10.8284 1.17157C10.269 0.612165 9.55629 0.231202 8.78036 0.0768607C8.00444 -0.0774802 7.20017 0.00173314 6.46927 0.304484C5.73836 0.607234 5.11365 1.11992 4.67412 1.77772C4.2346 2.43552 4 3.20888 4 4C4.00106 5.06054 4.42283 6.07734 5.17274 6.82726C5.92266 7.57718 6.93946 7.99894 8 8ZM8 1.33334C8.52742 1.33334 9.04299 1.48973 9.48152 1.78275C9.92005 2.07577 10.2618 2.49224 10.4637 2.97951C10.6655 3.46678 10.7183 4.00296 10.6154 4.52024C10.5125 5.03753 10.2586 5.51268 9.88562 5.88562C9.51268 6.25856 9.03752 6.51254 8.52024 6.61543C8.00296 6.71832 7.46678 6.66551 6.97951 6.46368C6.49224 6.26185 6.07577 5.92005 5.78275 5.48152C5.48973 5.04299 5.33333 4.52742 5.33333 4C5.33333 3.29276 5.61428 2.61448 6.11438 2.11438C6.61448 1.61429 7.29276 1.33334 8 1.33334Z"
        fill="#09090b"
      />
      <path
        d="M8 9.33325C6.40924 9.33502 4.88414 9.96772 3.75931 11.0926C2.63447 12.2174 2.00176 13.7425 2 15.3333C2 15.5101 2.07024 15.6796 2.19526 15.8047C2.32029 15.9297 2.48986 15.9999 2.66667 15.9999C2.84348 15.9999 3.01305 15.9297 3.13807 15.8047C3.2631 15.6796 3.33333 15.5101 3.33333 15.3333C3.33333 14.0956 3.825 12.9086 4.70017 12.0334C5.57534 11.1583 6.76232 10.6666 8 10.6666C9.23768 10.6666 10.4247 11.1583 11.2998 12.0334C12.175 12.9086 12.6667 14.0956 12.6667 15.3333C12.6667 15.5101 12.7369 15.6796 12.8619 15.8047C12.987 15.9297 13.1565 15.9999 13.3333 15.9999C13.5101 15.9999 13.6797 15.9297 13.8047 15.8047C13.9298 15.6796 14 15.5101 14 15.3333C13.9982 13.7425 13.3655 12.2174 12.2407 11.0926C11.1159 9.96772 9.59076 9.33502 8 9.33325Z"
        fill="#09090b"
      />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1.28333 11.9167L0 10.6333L8.8 1.83333H0.916667V0H11.9167V11H10.0833V3.11667L1.28333 11.9167Z"
        fill="#d4af37"
      />
    </svg>
  );
}

function CoursePackageCard({ pkg }: { pkg: CoursePackageItem }) {
  const lessonsClipId = `courses-package-lessons-${pkg.id}`;

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-[10px] bg-white">
      {/* thumbnail */}
      <div className="relative m-[3px] mb-[1px] aspect-[320/224] overflow-hidden rounded-t-[10px] rounded-b-[6px]">
        {pkg.offerBadge && (
          <span className="absolute top-5 right-5 z-10 rounded px-2.5 py-1 font-mona text-sm font-medium text-secondary capitalize bg-white">
            {pkg.offerBadge}
          </span>
        )}
        <Link href={pkg.href} className="block h-full w-full">
          <img
            src={pkg.thumbnail}
            alt={pkg.thumbnailAlt}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </Link>
      </div>

      {/* content */}
      <div className="flex flex-col border-x border-border p-[15px] lg:p-[30px]">
        <div className="mb-2 flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-[5px] font-mona text-sm font-medium text-primary capitalize">
            {pkg.rating}
            <RatingStars />
          </span>
          <span className="relative ml-[10px] font-playfair text-sm font-medium text-text italic capitalize before:absolute before:-left-3 before:top-1/2 before:h-1 before:w-1 before:-translate-y-1/2 before:rounded-full before:bg-[#d1d1d1] before:content-['']">
            By{" "}
            <strong className="font-mona font-medium text-primary not-italic">
              {pkg.author}
            </strong>
          </span>
        </div>

        <h3 className="pb-4 font-mona text-lg leading-[120%] font-medium tracking-[-0.03em] text-primary xl:text-xl">
          <Link
            href={pkg.href}
            className="inline transition-colors duration-300 hover:text-secondary"
          >
            {pkg.title}
          </Link>
        </h3>

        <div className="mt-auto flex flex-wrap items-center gap-5 border-t border-border pt-5">
          <span className="flex items-center gap-[5px] font-mona text-sm font-medium text-primary capitalize">
            <LessonsIcon clipId={lessonsClipId} />
            {pkg.lessons}
          </span>
          <span className="flex items-center gap-[5px] font-mona text-sm font-medium text-primary capitalize">
            <CoursesIcon />
            {pkg.courses}
          </span>
          <span className="flex items-center gap-[5px] font-mona text-sm font-medium text-primary capitalize">
            <StudentsIcon />
            {pkg.students}
          </span>
        </div>
      </div>

      {/* footer */}
      <div className="flex items-center justify-between border-x border-b border-border px-[15px] pb-[15px] lg:px-[30px] lg:pb-[29px]">
        <div className="flex items-center gap-3">
          <span className="font-mona text-lg leading-[120%] font-medium tracking-[-0.03em] text-primary xl:text-xl">
            {pkg.priceCurrent}
          </span>
          <span className="font-mona text-sm leading-[160%] text-[#ff4a4a] line-through">
            {pkg.priceOld}
          </span>
        </div>
        <Link
          href={pkg.href}
          className="mt-[10px] flex h-[42px] w-[42px] items-center justify-center rounded border border-border text-secondary transition-all duration-300 [&>svg>path]:fill-secondary hover:border-secondary hover:bg-secondary hover:[&>svg>path]:fill-white"
        >
          <ArrowIcon />
        </Link>
      </div>
    </div>
  );
}

/**
 * "Courses package area" — course-listing grid (see source note above for
 * why this isn't a pricing-tier table). Static content, no client-side
 * interactivity, so this stays a Server Component.
 */
export default function CoursesPackage() {
  return (
    <section id="packages" className="relative overflow-hidden bg-bg py-20 lg:py-[90px] 2xl:py-[130px]">
      <div className="absolute inset-0 -z-10">
        <img
          src="/assets/imgs/home2/courses/courses1-bg.webp"
          alt="bg"
          className="h-full w-full object-cover"
        />
      </div>

      <div className="relative mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[880px]">
          <SectionHeading
            eyebrow="mentorship packages"
            align="center"
            title={
              <>
                Structured <em>packages</em> that take
                <br />
                you from first chart to live desk
              </>
            }
          />
        </div>

        <Reveal
          stagger
          className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3"
        >
          {COURSE_PACKAGES.map((pkg) => (
            <CoursePackageCard key={pkg.id} pkg={pkg} />
          ))}
        </Reveal>

        <div className="mt-[60px] flex justify-center">
          <ThemeButton href="/courses-v2" variant="outline">
            view all packages
          </ThemeButton>
        </div>
      </div>
    </section>
  );
}
