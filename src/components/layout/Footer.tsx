"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import ThemeButton from "@/components/ui/ThemeButton";

type FooterLink = { label: string; href: string };

const quickLinks: FooterLink[] = [
  { label: "Markets", href: "#markets" },
  { label: "Programmes", href: "#programmes" },
  { label: "Packages", href: "#packages" },
  { label: "Mentors", href: "#mentors" },
  { label: "Market Notes", href: "#notes" },
];

const popularCategories: FooterLink[] = [
  { label: "Forex Trading", href: "#markets" },
  { label: "Crypto Trading", href: "#markets" },
  { label: "Commodities & Metals", href: "#markets" },
  { label: "Technical Analysis", href: "#markets" },
  { label: "Risk Management", href: "#markets" },
];

const supportLinks: FooterLink[] = [
  { label: "Trader stories", href: "#stories" },
  { label: "FAQ", href: "#" },
  { label: "Terms & conditions", href: "#" },
  { label: "Risk disclosure", href: "#" },
  { label: "Privacy policy", href: "#" },
];

const socialLinks: FooterLink[] = [
  { label: "Instagram", href: "#" },
  { label: "YouTube", href: "#" },
  { label: "Twitter/X", href: "#" },
  { label: "Telegram", href: "#" },
  { label: "LinkedIn", href: "#" },
];

const widgets: { title: string; links: FooterLink[] }[] = [
  { title: "Quick Links", links: quickLinks },
  { title: "Markets We Teach", links: popularCategories },
  { title: "Company", links: supportLinks },
  { title: "Follow", links: socialLinks },
];

function FooterWidget({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <div className="w-full sm:w-auto">
      <h3 className="mb-5 text-base leading-[120%] font-medium text-white capitalize xl:mb-[42px]">
        {title}
      </h3>
      <ul className="m-0 list-none p-0">
        {links.map((link) => {
          const linkClassName =
            "font-mona text-base leading-[160%] font-normal text-white/80 transition-colors duration-300 hover:text-secondary";
          return (
            <li key={link.label} className="mb-1.5 last:mb-0 xl:mb-3">
              {link.href === "/" ? (
                <Link href={link.href} className={linkClassName}>
                  {link.label}
                </Link>
              ) : (
                <a href={link.href} className={linkClassName}>
                  {link.label}
                </a>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function Footer() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // No backend yet.
  };

  return (
    <footer id="contact" className="relative z-[1] overflow-hidden bg-primary pt-[70px] text-white lg:pt-[100px]">
      {/* footer2__bg */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <img
          src="/assets/imgs/home2/footer/footer-bg2_1.webp"
          alt="Footer Bg"
          className="h-full w-full object-cover"
        />
      </div>

      <div className="mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8">
        {/* footer2__top */}
        <div className="relative z-[3] flex flex-col items-center gap-12 sm:items-stretch lg:flex-row lg:items-start lg:justify-between lg:gap-[60px]">
          {/* footer2__top-left */}
          <div className="flex w-full flex-wrap items-start justify-between gap-10 lg:w-auto lg:flex-nowrap xl:gap-[103px]">
            {widgets.map((widget) => (
              <FooterWidget key={widget.title} title={widget.title} links={widget.links} />
            ))}
          </div>

          {/* footer2__top-right */}
          <div className="flex w-full justify-end lg:w-auto">
            {/* footer2__newsletter */}
            <div className="relative w-full lg:before:absolute lg:before:top-0 lg:before:-left-[35px] lg:before:h-[190px] lg:before:w-px lg:before:bg-border-2 lg:before:content-[''] xl:before:-left-[103px] xl:before:h-[240px]">
              <h3 className="mb-5 text-base leading-[120%] font-medium text-white capitalize xl:mb-[35px]">
                Weekly market note
              </h3>
              <form
                onSubmit={handleSubmit}
                className="mt-5 flex max-w-[400px] flex-col gap-5 xl:mt-[45px] xl:max-w-none"
              >
                <div className="relative w-full">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email address"
                    className="w-full rounded-md border border-border-2 bg-transparent px-[15px] py-[13px] pr-[45px] font-mona text-base text-white outline-none transition-all duration-300 placeholder:text-white lg:w-[320px]"
                  />
                  <span className="pointer-events-none absolute top-1/2 right-[17.5px] -translate-y-1/2 text-white/40">
                    <svg
                      width="15"
                      height="12"
                      viewBox="0 0 15 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M1.34625 11.6667C0.962639 11.6667 0.642361 11.5382 0.385417 11.2812C0.128472 11.0243 0 10.704 0 10.3204V1.34625C0 0.962639 0.128472 0.642361 0.385417 0.385417C0.642361 0.128472 0.962639 0 1.34625 0H13.6538C14.0374 0 14.3576 0.128472 14.6146 0.385417C14.8715 0.642361 15 0.962639 15 1.34625V10.3204C15 10.704 14.8715 11.0243 14.6146 11.2812C14.3576 11.5382 14.0374 11.6667 13.6538 11.6667H1.34625ZM7.5 5.92958L0.833333 1.57042V10.3204C0.833333 10.47 0.881389 10.5929 0.9775 10.6892C1.07375 10.7853 1.19667 10.8333 1.34625 10.8333H13.6538C13.8033 10.8333 13.9263 10.7853 14.0225 10.6892C14.1186 10.5929 14.1667 10.47 14.1667 10.3204V1.57042L7.5 5.92958ZM7.5 5L13.9102 0.833333H1.08979L7.5 5ZM0.833333 1.57042V0.833333V10.3204C0.833333 10.47 0.881389 10.5929 0.9775 10.6892C1.07375 10.7853 1.19667 10.8333 1.34625 10.8333H0.833333V1.57042Z"
                        fill="#E3E3E3"
                      />
                    </svg>
                  </span>
                </div>

                <ThemeButton type="submit" variant="secondary">
                  Sign up
                </ThemeButton>
              </form>
            </div>
          </div>
        </div>

        {/* footer2__divider */}
        <div className="my-[50px] h-px w-full bg-border-2 xl:mt-[80px] xl:mb-[44px]" />

        {/* footer2__branding */}
        <div className="relative z-[3] flex flex-col items-center gap-4 py-[60px] lg:flex-row lg:items-center lg:justify-between">
          <div className="w-full lg:w-1/2 xl:w-2/3">
            {/* footer2__logo */}
            <Link href="/">
              {/* Capped by height rather than left at the SVG's intrinsic
                  524px, which rendered oversized — and keeps any replacement
                  logo of a different canvas size in proportion. */}
              <img
                src="/assets/imgs/logo/logo-light.png"
                alt="Beyondpips Trading Academy"
                className="h-auto max-h-[56px] w-auto max-w-[60%] lg:max-h-[64px]"
              />
            </Link>
          </div>
          <div className="w-full lg:w-1/3 xl:w-1/4">
            {/* footer2__info */}
            <div className="mt-4 lg:mt-0">
              <p className="mb-5 text-lg leading-[120%] font-medium tracking-[-0.03em] text-white xl:mb-[35px] xl:text-xl">
                We help traders build a real edge — live markets, real risk, real discipline.
              </p>
              <div className="flex flex-col gap-[7px]">
                <div className="flex items-center gap-1.5 font-mona text-sm leading-[160%] font-normal text-white">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M11.1981 12C9.93369 12 8.63756 11.6834 7.30969 11.0503C5.98181 10.4171 4.74813 9.52831 3.60862 8.38406C2.46925 7.23994 1.58294 6.00631 0.949687 4.68319C0.316562 3.36006 0 2.06631 0 0.801938C0 0.572813 0.075 0.381874 0.225 0.229124C0.375 0.0763745 0.5625 0 0.7875 0H2.64225C2.84613 0 3.024 0.0641879 3.17588 0.192563C3.32788 0.320938 3.43081 0.485625 3.48469 0.686625L3.85669 2.475C3.89131 2.68463 3.88506 2.86781 3.83794 3.02456C3.79081 3.18131 3.70763 3.30969 3.58838 3.40969L1.94288 4.94419C2.2505 5.50281 2.59063 6.02181 2.96325 6.50119C3.33588 6.98056 3.73325 7.43463 4.15538 7.86338C4.59088 8.299 5.05963 8.70406 5.56163 9.07856C6.0635 9.45306 6.61444 9.80669 7.21444 10.1394L8.81831 8.50669C8.94044 8.37494 9.07769 8.28819 9.23006 8.24644C9.38244 8.20456 9.55094 8.19613 9.73556 8.22113L11.3134 8.54419C11.5173 8.59419 11.6827 8.69688 11.8097 8.85225C11.9366 9.0075 12 9.18563 12 9.38663V11.2125C12 11.4375 11.9236 11.625 11.7709 11.775C11.6181 11.925 11.4272 12 11.1981 12ZM1.59094 4.24031L3.03038 2.91637C3.07838 2.87787 3.10963 2.825 3.12413 2.75775C3.1385 2.69038 3.13606 2.62788 3.11681 2.57025L2.78362 0.980812C2.76437 0.903812 2.73075 0.846125 2.68275 0.80775C2.63462 0.76925 2.57212 0.75 2.49525 0.75H0.95625C0.8985 0.75 0.850437 0.76925 0.812063 0.80775C0.773562 0.846125 0.754312 0.894188 0.754312 0.951938C0.768687 1.46444 0.849 1.9995 0.99525 2.55713C1.14138 3.11488 1.33994 3.67594 1.59094 4.24031ZM7.92844 10.4914C8.43506 10.7424 8.97519 10.9279 9.54881 11.0481C10.1223 11.1683 10.6221 11.2327 11.0481 11.2414C11.1058 11.2414 11.1539 11.2221 11.1923 11.1836C11.2308 11.1451 11.25 11.0971 11.25 11.0394V9.53363C11.25 9.45675 11.2308 9.39425 11.1923 9.34613C11.1539 9.29813 11.0962 9.2645 11.0192 9.24525L9.63169 8.961C9.57406 8.94175 9.52363 8.93938 9.48038 8.95388C9.437 8.96825 9.39131 8.9995 9.34331 9.04763L7.92844 10.4914Z"
                      fill="white"
                    />
                  </svg>
                  <a
                    href="tel:+14151234567"
                    className="transition-colors duration-300 hover:text-white"
                  >
                    +1 (415) 123-4567
                  </a>
                </div>
                <div className="flex items-center gap-1.5 font-mona text-sm leading-[160%] font-normal text-white">
                  <svg
                    width="14"
                    height="11"
                    viewBox="0 0 14 11"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M1.21162 10.5C0.866375 10.5 0.578125 10.3844 0.346875 10.1531C0.115625 9.92188 0 9.63363 0 9.28838V1.21162C0 0.866375 0.115625 0.578125 0.346875 0.346875C0.578125 0.115625 0.866375 0 1.21162 0H12.2884C12.6336 0 12.9219 0.115625 13.1531 0.346875C13.3844 0.578125 13.5 0.866375 13.5 1.21162V9.28838C13.5 9.63363 13.3844 9.92188 13.1531 10.1531C12.9219 10.3844 12.6336 10.5 12.2884 10.5H1.21162ZM6.75 5.33663L0.75 1.41338V9.28838C0.75 9.423 0.79325 9.53363 0.87975 9.62025C0.966375 9.70675 1.077 9.75 1.21162 9.75H12.2884C12.423 9.75 12.5336 9.70675 12.6203 9.62025C12.7068 9.53363 12.75 9.423 12.75 9.28838V1.41338L6.75 5.33663ZM6.75 4.5L12.5192 0.75H0.980812L6.75 4.5ZM0.75 1.41338V0.75V9.28838C0.75 9.423 0.79325 9.53363 0.87975 9.62025C0.966375 9.70675 1.077 9.75 1.21162 9.75H0.75V1.41338Z"
                      fill="white"
                    />
                  </svg>
                  <a
                    href="mailto:support@beyondpipsacademy.com"
                    className="transition-colors duration-300 hover:text-white"
                  >
                    support@beyondpipsacademy.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* footer2__bottom-divider */}
        <div className="mt-[43px] h-px w-full bg-border-2" />

        {/* footer2__bottom */}
        <div className="relative z-[3] pt-[18px] pb-[14px] text-center">
          <p className="m-0 font-mona text-base leading-[160%] font-normal text-white">
            ©2026{" "}
            <span className="text-sm font-medium text-secondary">
              Beyondpips Trading Academy.
            </span>{" "}
            All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
