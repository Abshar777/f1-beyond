"use client";

import { useEffect, useState } from "react";
import Odometer from "@/components/ui/Odometer";
import Reveal from "@/components/ui/Reveal";

const YOUTUBE_VIDEO_ID = "7e90gBu4pas";

const PLAY_ICON = (
  <svg
    width="66"
    height="66"
    viewBox="0 0 66 66"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="relative"
  >
    <path
      d="M27.5 44L44 33L27.5 22V44ZM33 60.5C29.1958 60.5 25.6208 59.7781 22.275 58.3344C18.9292 56.8906 16.0188 54.9313 13.5437 52.4562C11.0687 49.9813 9.10938 47.0708 7.66563 43.725C6.22188 40.3792 5.5 36.8042 5.5 33C5.5 31.0292 5.70625 29.0927 6.11875 27.1906C6.53125 25.2885 7.12708 23.4438 7.90625 21.6562L12.1688 25.9188C11.8021 27.1104 11.5156 28.2906 11.3094 29.4594C11.1031 30.6281 11 31.8083 11 33C11 39.1417 13.1313 44.3438 17.3938 48.6063C21.6562 52.8688 26.8583 55 33 55C39.1417 55 44.3438 52.8688 48.6063 48.6063C52.8688 44.3438 55 39.1417 55 33C55 26.8583 52.8688 21.6562 48.6063 17.3938C44.3438 13.1313 39.1417 11 33 11C31.7625 11 30.5594 11.1031 29.3906 11.3094C28.2219 11.5156 27.0646 11.8021 25.9188 12.1688L21.725 7.975C23.5583 7.15 25.3917 6.53125 27.225 6.11875C29.0583 5.70625 30.9833 5.5 33 5.5C36.8042 5.5 40.3792 6.22188 43.725 7.66563C47.0708 9.10938 49.9813 11.0687 52.4562 13.5437C54.9313 16.0188 56.8906 18.9292 58.3344 22.275C59.7781 25.6208 60.5 29.1958 60.5 33C60.5 36.8042 59.7781 40.3792 58.3344 43.725C56.8906 47.0708 54.9313 49.9813 52.4562 52.4562C49.9813 54.9313 47.0708 56.8906 43.725 58.3344C40.3792 59.7781 36.8042 60.5 33 60.5ZM15.125 19.25C13.9792 19.25 13.0052 18.849 12.2031 18.0469C11.401 17.2448 11 16.2708 11 15.125C11 13.9792 11.401 13.0052 12.2031 12.2031C13.0052 11.401 13.9792 11 15.125 11C16.2708 11 17.2448 11.401 18.0469 12.2031C18.849 13.0052 19.25 13.9792 19.25 15.125C19.25 16.2708 18.849 17.2448 18.0469 18.0469C17.2448 18.849 16.2708 19.25 15.125 19.25Z"
      fill="white"
    />
  </svg>
);

const CLOSE_ICON = (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M1 1L17 17M17 1L1 17"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const NUMBER_CLASSES =
  "flex items-baseline justify-start font-mona text-[clamp(30px,3vw,40px)] font-medium leading-[100%] tracking-[-0.03em] text-white lg:text-[clamp(32px,6vw,64px)]";
const LABEL_CLASSES =
  "block font-mona text-base font-medium capitalize leading-[120%] text-white/80";

/**
 * "Video2" banner: stat counters flanking a YouTube popup video thumbnail.
 * Matches the source template's .video2 section (dark green pill, 4 stats,
 * center video with pulsing play button).
 */
export default function Video2() {
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  // Close on Escape + lock background scroll while the popup is open.
  useEffect(() => {
    if (!isVideoOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsVideoOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isVideoOpen]);

  return (
    <section className="pb-20 lg:pb-[90px] 2xl:pb-[130px]">
      <div className="mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8">
        <Reveal
          stagger
          className="relative flex flex-col items-center gap-[10px] overflow-hidden rounded-[10px] border border-white/10 bg-primary p-[10px] lg:flex-row lg:justify-between min-[1400px]:mx-[50px]"
        >
          {/* Left Stats */}
          <div className="flex w-full flex-col justify-center rounded-[6px] bg-white/5 px-[10px] py-3 text-left lg:h-[400px] lg:w-[266px] lg:pt-10 lg:pr-10 lg:pb-[43px] lg:pl-[45px]">
            <div className="border-b border-white/10 pb-[10px] lg:pb-[60px]">
              <h3 className={`mb-2 ${NUMBER_CLASSES}`}>
                <Odometer value={500} />k
                <span className="text-secondary">+</span>
              </h3>
              <p className={LABEL_CLASSES}>Traders mentored</p>
            </div>
            <div className="pt-[10px] lg:pt-[50px]">
              <h3 className={`mb-2 ${NUMBER_CLASSES}`}>
                <Odometer value={100} />
                <span className="text-secondary">+</span>
              </h3>
              <p className={LABEL_CLASSES}>Countries reached</p>
            </div>
          </div>

          {/* Video Center */}
          <div className="flex w-full justify-center lg:w-auto lg:flex-1">
            <div className="group relative w-full max-w-[500px] max-h-[400px] overflow-hidden rounded-[6px] shadow-[0_30px_60px_rgba(0,0,0,0.4)] lg:max-w-[630px]">
              <img
                src="/assets/imgs/home2/video/video-thumb.webp"
                alt="Video Thumbnail"
                className="block h-auto w-full transition-transform duration-500 ease-in-out group-hover:scale-105"
              />
              <button
                type="button"
                onClick={() => setIsVideoOpen(true)}
                aria-haspopup="dialog"
                aria-label="Play video"
                className="absolute left-1/2 top-1/2 z-[2] flex h-[66px] w-[66px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-white transition-transform duration-300 ease-in-out hover:scale-110"
              >
                <span className="pointer-events-none absolute inset-0 rounded-full border border-white animate-ping" />
                {PLAY_ICON}
              </button>
            </div>
          </div>

          {/* Right Stats */}
          <div className="flex w-full flex-col justify-center rounded-[6px] bg-white/5 px-[10px] py-3 text-left lg:h-[400px] lg:w-[266px] lg:pt-10 lg:pr-10 lg:pb-[43px] lg:pl-[45px]">
            <div className="border-b border-white/10 pb-[10px] lg:pb-[60px]">
              <h3 className={`mb-3 lg:mb-[18px] ${NUMBER_CLASSES}`}>
                4.8/<span className="text-secondary">5</span>
              </h3>
              <p className={LABEL_CLASSES}>Mentor rating</p>
            </div>
            <div className="pt-[10px] lg:pt-[50px]">
              <h3 className={`mb-2 ${NUMBER_CLASSES}`}>
                <Odometer value={50} />
                <span className="text-secondary">+</span>
              </h3>
              <p className={LABEL_CLASSES}>Active mentors</p>
            </div>
          </div>
        </Reveal>
      </div>

      {isVideoOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Video player"
          onClick={() => setIsVideoOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 sm:p-8"
        >
          <button
            type="button"
            onClick={() => setIsVideoOpen(false)}
            aria-label="Close video"
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white transition-colors duration-300 hover:bg-white/10 sm:right-8 sm:top-8 md:h-12 md:w-12"
          >
            {CLOSE_ICON}
          </button>
          <div
            onClick={(event) => event.stopPropagation()}
            className="aspect-video w-full max-w-4xl overflow-hidden rounded-lg bg-black shadow-2xl"
          >
            <iframe
              className="h-full w-full"
              src={`https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?autoplay=1`}
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </section>
  );
}
