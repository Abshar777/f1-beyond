import type { ReactNode } from "react";
import Reveal from "./Reveal";
import TextReveal from "./TextReveal";

type SectionHeadingProps = {
  eyebrow: string;
  title: ReactNode;
  align?: "left" | "center";
  className?: string;
  dark?: boolean;
};

/**
 * Shared "eyebrow pill + big heading" pattern used at the top of almost
 * every section. Wrap the accented words of `title` in <em> to get the
 * Playfair-italic secondary-color treatment (e.g. title={<>Build <em>skills</em></>}).
 */
export default function SectionHeading({
  eyebrow,
  title,
  align = "center",
  className = "",
  dark = false,
}: SectionHeadingProps) {
  return (
    <div
      className={`mb-10 lg:mb-14 ${align === "center" ? "mx-auto text-center" : "text-left"} ${className}`}
    >
      <Reveal y={24}>
        <span
          className={`mb-3 inline-flex items-center gap-[5px] rounded-full border px-[9px] py-[6px] font-mona text-sm font-medium capitalize ${
            dark
              ? "border-white/10 text-white"
              : "border-primary/10 text-primary"
          }`}
        >
          <svg
            width="4"
            height="4"
            viewBox="0 0 4 4"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="2" cy="2" r="2" fill="#d4af37" />
          </svg>
          {eyebrow}
        </span>
      </Reveal>
      <TextReveal delay={0.08}>
        <h2
          className={`font-mona text-[32px] font-medium leading-[110%] tracking-[-0.03em] sm:text-[36px] lg:text-[40px] xl:text-[48px] [&_em]:font-playfair [&_em]:italic [&_em]:font-normal [&_em]:tracking-[-0.04em] [&_em]:text-secondary ${
            dark ? "text-white" : "text-primary"
          }`}
        >
          {title}
        </h2>
      </TextReveal>
    </div>
  );
}
