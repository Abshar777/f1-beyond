import { useId } from "react";
import SectionHeading from "@/components/ui/SectionHeading";
import ThemeButton from "@/components/ui/ThemeButton";
import Reveal from "@/components/ui/Reveal";

type Course = {
  id: string;
  image: string;
  rating: number;
  instructor: string;
  title: string;
  lessons: number;
  students: number;
  priceCurrent: string;
  priceOld?: string;
  discount?: string;
};

const COURSES: Course[] = [
  {
    id: "forex-foundations",
    image: "/assets/imgs/stock/trading-charts-1.jpg",
    rating: 4,
    instructor: "Marcus Reed",
    title: "Forex foundations bootcamp",
    lessons: 12,
    students: 80,
    priceCurrent: "$29.00",
    priceOld: "$56.00",
    discount: "50% off",
  },
  {
    id: "crypto-essentials",
    image: "/assets/imgs/stock/trading-laptop.jpg",
    rating: 3,
    instructor: "Olivia Chen",
    title: "Crypto trading essentials",
    lessons: 12,
    students: 16,
    priceCurrent: "$56.00",
  },
  {
    id: "technical-analysis",
    image: "/assets/imgs/stock/trading-screens.jpg",
    rating: 4.5,
    instructor: "Sophia Martinez",
    title: "Technical analysis mastery",
    lessons: 12,
    students: 36,
    priceCurrent: "$56.00",
  },
  {
    id: "risk-and-psychology",
    image: "/assets/imgs/stock/trading-chart-2.jpg",
    rating: 5,
    instructor: "Daniel Roberts",
    title: "Risk & trading psychology",
    lessons: 12,
    students: 40,
    priceCurrent: "$49.00",
    priceOld: "$99.00",
    discount: "50% off",
  },
];

type StarVariant = "full" | "half" | "empty";

const STAR_PATH_FULL =
  "M2.23125 11.0833L3.17917 6.98542L0 4.22917L4.2 3.86458L5.83333 0L7.46667 3.86458L11.6667 4.22917L8.4875 6.98542L9.43542 11.0833L5.83333 8.91042L2.23125 11.0833Z";
const STAR_PATH_HALF =
  "M7.67083 8.6625L7.18958 6.5625L8.80833 5.1625L6.67917 4.97292L5.83333 2.98958V7.53958L7.67083 8.6625ZM2.23125 11.0833L3.17917 6.98542L0 4.22917L4.2 3.86458L5.83333 0L7.46667 3.86458L11.6667 4.22917L8.4875 6.98542L9.43542 11.0833L5.83333 8.91042L2.23125 11.0833Z";
const STAR_PATH_EMPTY =
  "M3.28344 7.90183L5.12094 6.7935L6.95844 7.91642L6.47719 5.81642L8.09594 4.41642L5.96677 4.22683L5.12094 2.2435L4.2751 4.21225L2.14594 4.40183L3.76469 5.81642L3.28344 7.90183ZM1.95635 9.73146L2.79212 6.13273L0 3.71306L3.6839 3.3934L5.12094 0L6.55798 3.3934L10.2419 3.71306L7.44975 6.13273L8.28552 9.73146L5.12094 7.82221L1.95635 9.73146Z";

/** Single rating star, lifted from the source template's inline SVGs (full/half use a 12x12 solid path, empty uses an 11x10 outline path). */
function CourseStar({ variant }: { variant: StarVariant }) {
  if (variant === "empty") {
    return (
      <svg
        width="11"
        height="10"
        viewBox="0 0 11 10"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d={STAR_PATH_EMPTY} fill="#d4af37" />
      </svg>
    );
  }

  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d={variant === "half" ? STAR_PATH_HALF : STAR_PATH_FULL} fill="#d4af37" />
    </svg>
  );
}

/** Renders a 5-star row for a numeric rating, e.g. 4.5 -> 4 full + 1 half + 0 empty. */
function RatingStars({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5 ? 1 : 0;
  const empty = Math.max(0, 5 - full - half);

  return (
    <>
      {Array.from({ length: full }, (_, i) => (
        <CourseStar key={`full-${i}`} variant="full" />
      ))}
      {half === 1 && <CourseStar variant="half" />}
      {Array.from({ length: empty }, (_, i) => (
        <CourseStar key={`empty-${i}`} variant="empty" />
      ))}
    </>
  );
}

/** Lessons (book) icon. Uses useId for the clipPath id so repeated cards on the page never collide on the same DOM id. */
function LessonIcon() {
  const clipId = useId();
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
      <g clipPath={`url(#${clipId})`}>
        <path
          d="M11.198 1.1166C10.89 0.251268 9.936 -0.202066 9.06933 0.104601L8.442 0.327934C8.02267 0.477268 7.686 0.780601 7.49533 1.18193C7.396 1.38993 7.34267 1.61193 7.334 1.8346V1.66593C7.334 0.746601 6.586 -0.000732422 5.66733 -0.000732422H1.66667C0.748 -6.57552e-05 0 0.747268 0 1.6666V15.9999H7.33333V1.9666C7.34 2.1306 7.37133 2.2946 7.428 2.45327L12.098 16.0146L15.9953 14.6826L11.198 1.1166ZM6.66667 1.6666V3.33327H4V0.666601H5.66667C6.218 0.666601 6.66667 1.11527 6.66667 1.6666ZM4 3.99993H6.66667V11.9999H4V3.99993ZM3.33333 11.9999H0.666667V3.99993H3.33333V11.9999ZM1.66667 0.666601H3.33333V3.33327H0.666667V1.6666C0.666667 1.11527 1.11533 0.666601 1.66667 0.666601ZM0.666667 12.6666H3.33333V15.3333H0.666667V12.6666ZM4 15.3333V12.6666H6.66667V15.3333H4ZM14.0793 11.2633L11.4853 12.1853L8.85667 4.55193L11.388 3.6526L14.0793 11.2633ZM8.09667 1.4686C8.21133 1.22793 8.41333 1.04527 8.66533 0.955268L9.29267 0.732601C9.40333 0.692601 9.516 0.674601 9.62667 0.674601C10.038 0.674601 10.4247 0.930601 10.57 1.33927L11.166 3.0246L8.63933 3.92193L8.05733 2.2326C7.968 1.98127 7.982 1.70993 8.09667 1.4686ZM11.7027 12.8153L14.302 11.8913L15.1433 14.2699L12.5133 15.1686L11.7027 12.8159V12.8153Z"
          fill="currentColor"
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

/** Students (person-circle) icon. */
function StudentIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path
        d="M11.6047 12.3952L12.3953 11.6048L9.5625 8.772V5.25H8.4375V9.22781L11.6047 12.3952ZM9.00131 16.125C8.01581 16.125 7.0895 15.938 6.22237 15.564C5.35525 15.19 4.601 14.6824 3.95963 14.0413C3.31825 13.4002 2.81044 12.6462 2.43619 11.7795C2.06206 10.9128 1.875 9.98669 1.875 9.00131C1.875 8.01581 2.062 7.0895 2.436 6.22237C2.81 5.35525 3.31756 4.601 3.95869 3.95963C4.59981 3.31825 5.35375 2.81044 6.2205 2.43619C7.08725 2.06206 8.01331 1.875 8.99869 1.875C9.98419 1.875 10.9105 2.062 11.7776 2.436C12.6448 2.81 13.399 3.31756 14.0404 3.95869C14.6818 4.59981 15.1896 5.35375 15.5638 6.2205C15.9379 7.08725 16.125 8.01331 16.125 8.99869C16.125 9.98419 15.938 10.9105 15.564 11.7776C15.19 12.6448 14.6824 13.399 14.0413 14.0404C13.4002 14.6818 12.6462 15.1896 11.7795 15.5638C10.9128 15.9379 9.98669 16.125 9.00131 16.125ZM9 15C10.6625 15 12.0781 14.4156 13.2469 13.2469C14.4156 12.0781 15 10.6625 15 9C15 7.3375 14.4156 5.92188 13.2469 4.75313C12.0781 3.58438 10.6625 3 9 3C7.3375 3 5.92188 3.58438 4.75313 4.75313C3.58438 5.92188 3 7.3375 3 9C3 10.6625 3.58438 12.0781 4.75313 13.2469C5.92188 14.4156 7.3375 15 9 15Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** Arrow icon for the per-card circular CTA button (top-right pointing arrow, already baked into the path geometry). */
function ArrowIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M1.28333 11.9167L0 10.6333L8.8 1.83333H0.916667V0H11.9167V11H10.0833V3.11667L1.28333 11.9167Z"
        fill="currentColor"
      />
    </svg>
  );
}

function CourseCard({ course }: { course: Course }) {
  return (
    <div className="group flex h-full w-full flex-col overflow-hidden rounded-[10px] border-b border-border bg-white">
      {/* Thumbnail */}
      <div className="relative mx-[3px] mb-[1px] mt-[3px] aspect-[320/224] overflow-hidden rounded-t-[10px]">
        {course.discount && (
          <span className="absolute right-[30px] top-5 z-10 rounded-[4px] bg-white px-[10px] py-1 font-mona text-sm font-medium capitalize text-secondary">
            {course.discount}
          </span>
        )}
        <a href="#" className="block h-full w-full">
          <img
            src={course.image}
            alt={`${course.title} course thumbnail`}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </a>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col border-x border-border p-5">
        <div className="mb-2 flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-[5px] font-mona text-sm font-medium capitalize text-primary">
            {course.rating}/5
            <RatingStars rating={course.rating} />
          </span>
          <span className="inline-flex items-center gap-[10px] font-playfair text-sm italic text-text">
            <span aria-hidden className="h-1 w-1 shrink-0 rounded-full bg-[#d1d1d1]" />
            By{" "}
            <strong className="font-mona font-medium not-italic text-primary">
              {course.instructor}
            </strong>
          </span>
        </div>

        <h3 className="pb-4 font-mona text-lg font-medium leading-[120%] tracking-[-0.03em] text-primary lg:text-xl">
          <a href="#" className="transition-colors duration-300 hover:text-secondary">
            {course.title}
          </a>
        </h3>

        <div className="mt-auto flex flex-wrap items-center gap-3 border-t border-border pt-5 lg:gap-[18px]">
          <span className="flex items-center gap-[5px] font-mona text-sm font-medium capitalize text-primary">
            <LessonIcon />
            {course.lessons} Lessons
          </span>
          <span className="flex items-center gap-[5px] font-mona text-sm font-medium capitalize text-primary">
            <StudentIcon />
            {course.students} Students
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-x border-border px-5 pb-5">
        <div className="flex items-center gap-3">
          <span className="font-mona text-lg font-medium leading-[120%] tracking-[-0.03em] text-primary lg:text-xl">
            {course.priceCurrent}
          </span>
          {course.priceOld && (
            <span className="font-mona text-sm leading-[160%] text-[#ff4a4a] line-through">
              {course.priceOld}
            </span>
          )}
        </div>
        <a
          href="#"
          className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded border border-border text-secondary transition-all duration-300 hover:border-secondary hover:bg-secondary hover:text-white"
        >
          <ArrowIcon />
        </a>
      </div>
    </div>
  );
}

/**
 * "Top courses" section: eyebrow + heading, a responsive grid of course
 * cards (thumbnail, discount badge, rating, instructor, title, lesson /
 * student meta, price, arrow CTA), and a "view all course" button.
 *
 * The source markup (e-learning.html lines 1349-2129) has no category
 * filter tabs in this section, so no client-side state is needed here.
 */
export default function TopCourses() {
  return (
    <section id="programmes" className="bg-bg py-20 min-[1400px]:py-[90px] min-[1920px]:py-[130px]">
      <div className="mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Popular programmes"
          align="center"
          title={
            <>
              Pick a programme and start
              <br />
              trading with an <em>edge</em>
            </>
          }
        />

        <Reveal
          stagger
          className="grid grid-cols-1 gap-[10px] md:grid-cols-2 xl:grid-cols-4"
        >
          {COURSES.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </Reveal>

        <div className="mt-[50px] flex justify-center">
          <ThemeButton href="/courses" variant="white">
            View all programmes
          </ThemeButton>
        </div>
      </div>
    </section>
  );
}
