"use client";

import { Swiper as SwiperCore } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import Reveal from "@/components/ui/Reveal";

// Swiper 14's React bindings dropped the per-instance `modules` prop (it no
// longer exists on SwiperProps) — optional modules are now enabled by
// registering them once on the shared core class, exactly like plain
// (non-React) Swiper usage. This must run before any <Swiper> mounts.
// (Not a React Hook — eslint-plugin-react-hooks flags any `.use(...)` call
// by name alone, which false-positives on Swiper's own static `use` API.)
// eslint-disable-next-line react-hooks/rules-of-hooks
SwiperCore.use([Autoplay]);

type InstagramSlide = {
  id: number;
  image: string;
  href: string;
};

// 9 slides in the source markup, built from 6 unique tiles (1–3 repeat once
// more at the end to give the loop enough slides to fill slidesPerView: 6).
const slides: InstagramSlide[] = [
  { id: 1, image: "/assets/imgs/stock/sq-1.jpg", href: "#" },
  { id: 2, image: "/assets/imgs/stock/sq-2.jpg", href: "#" },
  { id: 3, image: "/assets/imgs/stock/sq-3.jpg", href: "#" },
  { id: 4, image: "/assets/imgs/stock/sq-4.jpg", href: "#" },
  { id: 5, image: "/assets/imgs/stock/sq-5.jpg", href: "#" },
  { id: 6, image: "/assets/imgs/stock/sq-6.jpg", href: "#" },
  { id: 7, image: "/assets/imgs/stock/sq-1.jpg", href: "#" },
  { id: 8, image: "/assets/imgs/stock/sq-2.jpg", href: "#" },
  { id: 9, image: "/assets/imgs/stock/sq-3.jpg", href: "#" },
];

/** Instagram glyph shown on hover over each tile (source: instagram area SVG). */
function InstagramGlyph() {
  return (
    <svg
      width="21"
      height="21"
      viewBox="0 0 21 21"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10.1579 4.94699C7.28059 4.93793 4.94246 7.26699 4.9334 10.1443C4.92434 13.0217 7.2534 15.3598 10.1307 15.3689C13.0081 15.3779 15.3462 13.0489 15.3553 10.1715C15.3643 7.29418 13.0353 4.95605 10.1579 4.94699ZM10.1307 6.77762C11.9976 6.76855 13.5156 8.27746 13.5246 10.1443C13.5337 12.0112 12.0248 13.5292 10.1579 13.5382C8.29105 13.5473 6.77309 12.0384 6.76402 10.1715C6.75496 8.30465 8.26387 6.78668 10.1307 6.77762ZM14.3629 4.73402C14.3629 4.0634 14.9067 3.51965 15.5773 3.51965C16.2479 3.51965 16.7917 4.0634 16.7917 4.73402C16.7917 5.40465 16.2479 5.9484 15.5773 5.9484C14.9067 5.9484 14.3629 5.40465 14.3629 4.73402ZM20.24 5.96652C20.1629 4.3398 19.7914 2.89887 18.5996 1.71168C17.4125 0.524492 15.9715 0.15293 14.3448 0.0713672C12.6682 -0.0237891 7.64309 -0.0237891 5.96652 0.0713672C4.34434 0.148398 2.9034 0.519961 1.71168 1.70715C0.519961 2.89434 0.15293 4.33527 0.0713672 5.96199C-0.0237891 7.63855 -0.0237891 12.6637 0.0713672 14.3403C0.148398 15.967 0.519961 17.4079 1.71168 18.5951C2.9034 19.7823 4.33981 20.1539 5.96652 20.2354C7.64309 20.3306 12.6682 20.3306 14.3448 20.2354C15.9715 20.1584 17.4125 19.7868 18.5996 18.5951C19.7868 17.4079 20.1584 15.967 20.24 14.3403C20.3351 12.6637 20.3351 7.64309 20.24 5.96652ZM18.074 16.1392C17.7206 17.0273 17.0364 17.7115 16.1437 18.0695C14.807 18.5996 11.6351 18.4773 10.1579 18.4773C8.68074 18.4773 5.50434 18.5951 4.17215 18.0695C3.28402 17.7161 2.59981 17.0318 2.24184 16.1392C1.71168 14.8025 1.83402 11.6306 1.83402 10.1534C1.83402 8.67621 1.71621 5.4998 2.24184 4.16762C2.59527 3.27949 3.27949 2.59527 4.17215 2.2373C5.50887 1.70715 8.68074 1.82949 10.1579 1.82949C11.6351 1.82949 14.8115 1.71168 16.1437 2.2373C17.0318 2.59074 17.7161 3.27496 18.074 4.16762C18.6042 5.50434 18.4818 8.67621 18.4818 10.1534C18.4818 11.6306 18.6042 14.807 18.074 16.1392Z"
        fill="white"
      />
    </svg>
  );
}

export default function Instagram() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8">
        <Reveal className="border-t border-border py-20 lg:py-[90px] 2xl:py-[130px]">
          <div className="mb-8 text-center lg:mb-10">
            <span className="inline-block font-mona text-sm font-medium capitalize text-primary">
              @beyondpips
            </span>
          </div>

          <Swiper
            loop
            centeredSlides={false}
            autoplay
            slidesPerView={1}
            spaceBetween={20}
            speed={1000}
            breakpoints={{
              576: { slidesPerView: 2, spaceBetween: 20 },
              768: { slidesPerView: 3, spaceBetween: 20 },
              992: { slidesPerView: 4, spaceBetween: 20 },
              1200: { slidesPerView: 6, spaceBetween: 20 },
            }}
          >
            {slides.map((slide) => (
              <SwiperSlide key={slide.id}>
                <div className="group relative aspect-square w-full cursor-pointer overflow-hidden rounded-[10px]">
                  <a href={slide.href} className="block h-full w-full">
                    <img
                      src={slide.image}
                      alt="Instagram"
                      className="h-full w-full rounded-[10px] object-cover transition-transform duration-500 ease-out group-hover:scale-[1.15]"
                    />
                    <span className="pointer-events-none absolute inset-0 z-[1] bg-border opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100" />
                    <span className="pointer-events-none absolute left-1/2 top-1/2 z-[2] -translate-x-1/2 -translate-y-1/2 scale-[0.8] text-white opacity-0 transition-all duration-500 ease-out group-hover:scale-100 group-hover:opacity-100">
                      <InstagramGlyph />
                    </span>
                  </a>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </Reveal>
      </div>
    </section>
  );
}
