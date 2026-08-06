import type { ReactNode } from "react";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";

type Testimonial = {
  id: string;
  photo: string;
  photoAlt: string;
  logoOverlay: ReactNode;
  quote: string;
  authorPhoto: string;
  authorName: string;
  authorTitle: string;
  brandLogo: ReactNode;
  statNumber: string;
  statLabel: string;
};

const STAR_FULL_PATH =
  "M2.55 12.6667L3.63333 7.98333L0 4.83333L4.8 4.41667L6.66667 0L8.53333 4.41667L13.3333 4.83333L9.7 7.98333L10.7833 12.6667L6.66667 10.1833L2.55 12.6667Z";
const STAR_PARTIAL_PATH =
  "M8.76667 9.9L8.21667 7.5L10.0667 5.9L7.63333 5.68333L6.66667 3.41667V8.61667L8.76667 9.9ZM2.55 12.6667L3.63333 7.98333L0 4.83333L4.8 4.41667L6.66667 0L8.53333 4.41667L13.3333 4.83333L9.7 7.98333L10.7833 12.6667L6.66667 10.1833L2.55 12.6667Z";

function StarIcon({ d }: { d: string }) {
  return (
    <svg
      width="14"
      height="13"
      viewBox="0 0 14 13"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d={d} fill="#d4af37" />
    </svg>
  );
}

/** "4.9/5" rating pill — identical markup on every card in the source. */
function RatingBadge() {
  return (
    <div className="mb-[25px] inline-flex w-fit items-center gap-[5.33px] rounded-[6px] border border-border px-[13.3px] py-[12.2px]">
      <span className="font-mona text-sm font-medium capitalize leading-none text-secondary">
        4.9/5
      </span>
      <div className="flex items-center gap-[3.33px]">
        <StarIcon d={STAR_FULL_PATH} />
        <StarIcon d={STAR_FULL_PATH} />
        <StarIcon d={STAR_FULL_PATH} />
        <StarIcon d={STAR_FULL_PATH} />
        <StarIcon d={STAR_PARTIAL_PATH} />
      </div>
    </div>
  );
}

/** Large faint quote-mark watermark behind the quote text — identical on every card. */
function QuoteBgIcon() {
  return (
    <svg
      className="pointer-events-none absolute right-[30px] top-[30px] z-[1] h-auto w-[70px] opacity-5 lg:w-[127px]"
      width="128"
      height="108"
      viewBox="0 0 128 108"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M121.846 0H72C68.9461 0 66.4615 2.48455 66.4615 5.53846V55.3846C66.4615 58.4385 68.9461 60.9231 72 60.9231H101.093L81.8241 101.872C81.7372 102.056 81.6923 102.258 81.6923 102.462C81.6923 105.515 84.1769 108 87.2308 108H99.6923C102.707 108 104.708 103.92 105.101 103.046C105.353 102.526 110.797 91.265 116.173 79.9967C127.385 56.4937 127.385 55.9044 127.385 55.3846V5.53846C127.385 2.48455 124.9 0 121.846 0ZM124.615 55.2212C123.764 57.803 111.054 84.3796 102.6 101.859C102.594 101.87 102.588 101.883 102.583 101.894C101.871 103.472 100.509 105.231 99.6923 105.231H87.2308C85.7982 105.231 84.6163 104.137 84.4757 102.741L104.528 60.128C104.73 59.6991 104.698 59.197 104.444 58.7966C104.19 58.3962 103.749 58.1539 103.275 58.1539H72C70.473 58.1539 69.2308 56.9116 69.2308 55.3846V5.53846C69.2308 4.01151 70.473 2.76923 72 2.76923H121.846C123.373 2.76923 124.615 4.01151 124.615 5.53846V55.2212ZM55.3846 0H5.53846C2.48455 0 0 2.48455 0 5.53846V55.3846C0 58.4385 2.48455 60.9231 5.53846 60.9231H34.6328L15.3626 101.872C15.2759 102.056 15.2308 102.258 15.2308 102.462C15.2308 105.515 17.7153 108 20.7692 108H33.2308C36.2456 108 38.2464 103.92 38.6396 103.046C38.8911 102.527 44.3354 91.2655 49.711 79.9967C60.9231 56.4937 60.9231 55.9044 60.9231 55.3846V5.53846C60.9231 2.48455 58.4385 0 55.3846 0ZM58.1538 55.2212C57.3018 57.803 44.5921 84.3796 36.1382 101.859C36.1326 101.87 36.1265 101.883 36.1216 101.894C35.4099 103.472 34.0474 105.231 33.2308 105.231H20.7692C19.3367 105.231 18.1548 104.137 18.0141 102.741L38.0675 60.128C38.2694 59.6991 38.2378 59.197 37.9839 58.7966C37.7299 58.3962 37.2888 58.1539 36.8147 58.1539H5.53846C4.01151 58.1539 2.76923 56.9116 2.76923 55.3846V5.53846C2.76923 4.01151 4.01151 2.76923 5.53846 2.76923H55.3846C56.9116 2.76923 58.1538 4.01151 58.1538 5.53846V55.2212Z"
        fill="#18181b"
      />
    </svg>
  );
}

/** "18,000+ traders mentored" avatar stack — identical on every card. */
function AvatarsRow() {
  const avatarClass =
    "-ml-6 h-[50px] w-[50px] rounded-full border border-bg object-cover first:ml-0 lg:-ml-3";
  return (
    <div className="flex flex-wrap items-center gap-[10px] border-b border-border pb-[30px] lg:flex-nowrap lg:gap-0">
      <img
        src="/assets/imgs/home2/testimonial/testimonial-thumb-user2_2.webp"
        alt="User"
        className={avatarClass}
      />
      <img
        src="/assets/imgs/home2/testimonial/testimonial-thumb-user2_3.webp"
        alt="User"
        className={avatarClass}
      />
      <img
        src="/assets/imgs/home2/testimonial/testimonial-thumb-user2_4.webp"
        alt="User"
        className={avatarClass}
      />
      <span className="ml-[7px] font-mona text-base font-medium capitalize leading-[120%] text-primary">
        18,000+ traders mentored
      </span>
    </div>
  );
}

const LOGO_OVERLAY_CLASS =
  "absolute left-1/2 top-1/2 h-auto w-[120px] -translate-x-1/2 -translate-y-1/2 opacity-80 brightness-0 invert";

const testimonials: Testimonial[] = [
  {
    id: "emily-e-carter",
    photo: "/assets/imgs/home2/testimonial/testimonial-thumb2_1.webp",
    photoAlt: "Testimonial",
    logoOverlay: (
      <svg
        className={LOGO_OVERLAY_CLASS}
        width="130"
        height="30"
        viewBox="0 0 130 30"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g clipPath="url(#clip0_186_625)">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M11.0795 21C10.1001 21 9.16068 20.6049 8.46807 19.9016C7.77547 19.1984 7.38636 18.2446 7.38636 17.25V0H0V17.25C0 23.463 4.96068 28.5 11.0795 28.5H19.2045V21H11.0795ZM33.2386 7.5C32.3656 7.5 31.5012 7.67459 30.6947 8.01381C29.8881 8.35303 29.1553 8.85023 28.538 9.47703C27.9207 10.1038 27.431 10.8479 27.0969 11.6669C26.7629 12.4858 26.5909 13.3636 26.5909 14.25C26.5909 15.1364 26.7629 16.0142 27.0969 16.8331C27.431 17.6521 27.9207 18.3962 28.538 19.023C29.1553 19.6498 29.8881 20.147 30.6947 20.4862C31.5012 20.8254 32.3656 21 33.2386 21C35.0017 21 36.6926 20.2888 37.9393 19.023C39.186 17.7571 39.8864 16.0402 39.8864 14.25C39.8864 12.4598 39.186 10.7429 37.9393 9.47703C36.6926 8.21116 35.0017 7.5 33.2386 7.5ZM19.2045 14.25C19.2045 6.38025 25.4881 0 33.2386 0C40.9891 0 47.2727 6.38025 47.2727 14.25C47.2727 22.1198 40.9891 28.5 33.2386 28.5C25.4881 28.5 19.2045 22.1198 19.2045 14.25ZM113.011 7.5C111.248 7.5 109.557 8.21116 108.311 9.47703C107.064 10.7429 106.364 12.4598 106.364 14.25C106.364 16.0402 107.064 17.7571 108.311 19.023C109.557 20.2888 111.248 21 113.011 21C114.774 21 116.465 20.2888 117.712 19.023C118.959 17.7571 119.659 16.0402 119.659 14.25C119.659 12.4598 118.959 10.7429 117.712 9.47703C116.465 8.21116 114.774 7.5 113.011 7.5ZM98.9773 14.25C98.9773 6.38025 105.261 0 113.011 0C120.762 0 127.045 6.38025 127.045 14.25C127.045 22.1198 120.762 28.5 113.011 28.5C105.261 28.5 98.9773 22.1198 98.9773 14.25ZM62.7841 0C55.0336 0 48.75 6.38025 48.75 14.25C48.75 22.1198 55.0336 28.5 62.7841 28.5H83.4659C84.9203 28.5 86.323 28.275 87.6422 27.858L91.5909 30L95.8514 21.897C96.9336 19.8343 97.4998 17.533 97.5 15.1957V14.25C97.5 6.38025 91.2164 0 83.4659 0H62.7841ZM90.1136 14.25C90.1136 12.4598 89.4133 10.7429 88.1666 9.47703C86.9199 8.21116 85.229 7.5 83.4659 7.5H62.7841C61.9111 7.5 61.0467 7.67459 60.2401 8.01381C59.4336 8.35303 58.7007 8.85023 58.0834 9.47703C57.4661 10.1038 56.9765 10.8479 56.6424 11.6669C56.3083 12.4858 56.1364 13.3636 56.1364 14.25C56.1364 15.1364 56.3083 16.0142 56.6424 16.8331C56.9765 17.6521 57.4661 18.3962 58.0834 19.023C58.7007 19.6498 59.4336 20.147 60.2401 20.4862C61.0467 20.8254 61.9111 21 62.7841 21H83.4659C85.2201 21.0001 86.9032 20.2961 88.1484 19.0416C89.3936 17.787 90.1 16.0836 90.1136 14.3025V14.25Z"
            fill="white"
          />
          <path
            d="M130 1.875C130 2.37228 129.806 2.84919 129.459 3.20083C129.113 3.55246 128.643 3.75 128.153 3.75C127.664 3.75 127.194 3.55246 126.848 3.20083C126.501 2.84919 126.307 2.37228 126.307 1.875C126.307 1.37772 126.501 0.900805 126.848 0.549175C127.194 0.197544 127.664 0 128.153 0C128.643 0 129.113 0.197544 129.459 0.549175C129.806 0.900805 130 1.37772 130 1.875Z"
            fill="white"
          />
        </g>
        <defs>
          <clipPath id="clip0_186_625">
            <rect width="130" height="30" fill="white" />
          </clipPath>
        </defs>
      </svg>
    ),
    quote:
      "“ I could read a candle and nothing else when I started. The risk rules alone changed how I size every trade — I stopped blowing up accounts by month two. ”",
    authorPhoto: "/assets/imgs/home2/testimonial/testimonial-thumb-user2_1.webp",
    authorName: "Emily E. Carter",
    authorTitle: "Forex, 2 yrs",
    brandLogo: (
      <svg
        width="88"
        height="20"
        viewBox="0 0 88 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g clipPath="url(#clip0_186_610)">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M7.5 14C6.83696 14 6.20107 13.7366 5.73223 13.2678C5.26339 12.7989 5 12.163 5 11.5V0H0V11.5C0 15.642 3.358 19 7.5 19H13V14H7.5ZM22.5 5C21.9091 5 21.3239 5.1164 20.7779 5.34254C20.232 5.56869 19.7359 5.90016 19.318 6.31802C18.9002 6.73588 18.5687 7.23196 18.3425 7.77792C18.1164 8.32389 18 8.90905 18 9.5C18 10.0909 18.1164 10.6761 18.3425 11.2221C18.5687 11.768 18.9002 12.2641 19.318 12.682C19.7359 13.0998 20.232 13.4313 20.7779 13.6575C21.3239 13.8836 21.9091 14 22.5 14C23.6935 14 24.8381 13.5259 25.682 12.682C26.5259 11.8381 27 10.6935 27 9.5C27 8.30653 26.5259 7.16193 25.682 6.31802C24.8381 5.47411 23.6935 5 22.5 5ZM13 9.5C13 4.2535 17.2535 0 22.5 0C27.7465 0 32 4.2535 32 9.5C32 14.7465 27.7465 19 22.5 19C17.2535 19 13 14.7465 13 9.5ZM76.5 5C75.3065 5 74.1619 5.47411 73.318 6.31802C72.4741 7.16193 72 8.30653 72 9.5C72 10.6935 72.4741 11.8381 73.318 12.682C74.1619 13.5259 75.3065 14 76.5 14C77.6935 14 78.8381 13.5259 79.682 12.682C80.5259 11.8381 81 10.6935 81 9.5C81 8.30653 80.5259 7.16193 79.682 6.31802C78.8381 5.47411 77.6935 5 76.5 5ZM67 9.5C67 4.2535 71.2535 0 76.5 0C81.7465 0 86 4.2535 86 9.5C86 14.7465 81.7465 19 76.5 19C71.2535 19 67 14.7465 67 9.5ZM42.5 0C37.2535 0 33 4.2535 33 9.5C33 14.7465 37.2535 19 42.5 19H56.5C57.4845 19 58.434 18.85 59.327 18.572L62 20L64.884 14.598C65.6166 13.2228 65.9999 11.6886 66 10.1305V9.5C66 4.2535 61.7465 0 56.5 0H42.5ZM61 9.5C61 8.30653 60.5259 7.16193 59.682 6.31802C58.8381 5.47411 57.6935 5 56.5 5H42.5C41.909 5 41.3239 5.1164 40.7779 5.34254C40.232 5.56869 39.7359 5.90016 39.318 6.31802C38.9002 6.73588 38.5687 7.23196 38.3425 7.77792C38.1164 8.32389 38 8.90905 38 9.5C38 10.0909 38.1164 10.6761 38.3425 11.2221C38.5687 11.768 38.9002 12.2641 39.318 12.682C39.7359 13.0998 40.232 13.4313 40.7779 13.6575C41.3239 13.8836 41.909 14 42.5 14H56.5C57.6874 14 58.8268 13.5307 59.6697 12.6944C60.5126 11.858 60.9908 10.7224 61 9.535V9.5Z"
            fill="#18181b"
          />
          <path
            d="M88 1.25C88 1.58152 87.8683 1.89946 87.6339 2.13388C87.3995 2.3683 87.0815 2.5 86.75 2.5C86.4185 2.5 86.1005 2.3683 85.8661 2.13388C85.6317 1.89946 85.5 1.58152 85.5 1.25C85.5 0.918479 85.6317 0.600537 85.8661 0.366117C86.1005 0.131696 86.4185 0 86.75 0C87.0815 0 87.3995 0.131696 87.6339 0.366117C87.8683 0.600537 88 0.918479 88 1.25Z"
            fill="#18181b"
          />
        </g>
        <defs>
          <clipPath id="clip0_186_610">
            <rect width="88" height="20" fill="white" />
          </clipPath>
        </defs>
      </svg>
    ),
    statNumber: "18k+",
    statLabel: "Traders mentored",
  },
  {
    id: "eleanor-e-pena",
    photo: "/assets/imgs/home2/testimonial/testimonial-thumb2_2.webp",
    photoAlt: "Testimonial",
    logoOverlay: (
      <svg
        className={LOGO_OVERLAY_CLASS}
        width="104"
        height="40"
        viewBox="0 0 104 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g clipPath="url(#clip0_186_633)">
          <path
            d="M24.6863 0C20.6248 0 16.7297 1.6134 13.8579 4.48528L4.48528 13.8579C1.6134 16.7297 0 20.6248 0 24.6863C0 33.1439 6.85619 40 15.3137 40C19.3752 40 23.2703 38.3865 26.1421 35.5147L32.6252 29.0316C32.6252 29.0315 32.6253 29.0317 32.6252 29.0316L51.5147 10.1421C52.8863 8.77055 54.7465 8 56.6863 8C59.9337 8 62.6869 10.1165 63.6415 13.0454L69.6029 7.08395C66.8833 2.82445 62.1147 0 56.6863 0C52.6248 0 48.7297 1.6134 45.8579 4.48528L20.4853 29.8579C19.1137 31.2295 17.2535 32 15.3137 32C11.2745 32 8 28.7256 8 24.6863C8 22.7465 8.77055 20.8863 10.1421 19.5147L19.5147 10.1421C20.8863 8.77055 22.7465 8 24.6863 8C27.9339 8 30.6869 10.1166 31.6415 13.0456L37.6031 7.08409C34.8835 2.82453 30.1148 0 24.6863 0Z"
            fill="white"
          />
          <path
            d="M52.4854 29.8579C51.1138 31.2295 49.2536 32 47.3138 32C44.0668 32 41.3138 29.884 40.359 26.9556L34.3977 32.9169C37.1174 37.1759 41.8858 40 47.3138 40C51.3753 40 55.2704 38.3865 58.1422 35.5147L83.5148 10.1421C84.8864 8.77055 86.7466 8 88.6864 8C92.7257 8 96.0001 11.2745 96.0001 15.3137C96.0001 17.2535 95.2296 19.1137 93.858 20.4853L84.4854 29.8579C83.1138 31.2295 81.2536 32 79.3138 32C76.0665 32 73.3134 29.8836 72.3588 26.9549L66.3974 32.9164C69.117 37.1757 73.8856 40 79.3138 40C83.3753 40 87.2704 38.3865 90.1422 35.5147L99.5148 26.1421C102.387 23.2703 104 19.3752 104 15.3137C104 6.85619 97.144 0 88.6864 0C84.6249 0 80.7298 1.6134 77.858 4.48528L52.4854 29.8579Z"
            fill="white"
          />
        </g>
        <defs>
          <clipPath id="clip0_186_633">
            <rect width="104" height="40" fill="white" />
          </clipPath>
        </defs>
      </svg>
    ),
    quote:
      "“ The live sessions are the difference. Watching a mentor talk through an entry in real time, on a real chart, beats any recorded course I have bought. ”",
    authorPhoto: "/assets/imgs/home2/testimonial/testimonial-thumb-user2_4.webp",
    authorName: "Eleanor E. Pena",
    authorTitle: "Crypto, 1 yr",
    brandLogo: (
      <svg
        width="78"
        height="30"
        viewBox="0 0 78 30"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g clipPath="url(#clip0_186_640)">
          <path
            d="M18.5147 0C15.4686 0 12.5473 1.21005 10.3934 3.36396L3.36396 10.3934C1.21005 12.5473 0 15.4686 0 18.5147C0 24.8579 5.14214 30 11.4853 30C14.5314 30 17.4527 28.7899 19.6066 26.636L24.4689 21.7737C24.4689 21.7736 24.469 21.7738 24.4689 21.7737L38.636 7.6066C39.6647 6.57791 41.0599 6 42.5147 6C44.9503 6 47.0152 7.58741 47.7311 9.78407L52.2022 5.31296C50.1625 2.11834 46.586 0 42.5147 0C39.4686 0 36.5473 1.21005 34.3934 3.36396L15.364 22.3934C14.3353 23.4221 12.9401 24 11.4853 24C8.45584 24 6 21.5442 6 18.5147C6 17.0599 6.57791 15.6647 7.6066 14.636L14.636 7.6066C15.6647 6.57791 17.0599 6 18.5147 6C20.9504 6 23.0152 7.58748 23.7311 9.78421L28.2023 5.31307C26.1626 2.1184 22.5861 0 18.5147 0Z"
            fill="#18181b"
          />
          <path
            d="M39.3639 22.3934C38.3352 23.4221 36.94 24 35.4852 24C33.0499 24 30.9852 22.413 30.2691 20.2167L25.7981 24.6877C27.8379 27.8819 31.4142 30 35.4852 30C38.5313 30 41.4526 28.7899 43.6065 26.636L62.6359 7.6066C63.6646 6.57791 65.0598 6 66.5146 6C69.5441 6 71.9999 8.45584 71.9999 11.4853C71.9999 12.9401 71.422 14.3353 70.3933 15.364L63.3639 22.3934C62.3352 23.4221 60.94 24 59.4852 24C57.0497 24 54.9849 22.4127 54.2689 20.2162L49.7979 24.6873C51.8376 27.8818 55.414 30 59.4852 30C62.5313 30 65.4526 28.7899 67.6065 26.636L74.6359 19.6066C76.7898 17.4527 77.9999 14.5314 77.9999 11.4853C77.9999 5.14214 72.8578 0 66.5146 0C63.4685 0 60.5472 1.21005 58.3933 3.36396L39.3639 22.3934Z"
            fill="#18181b"
          />
        </g>
        <defs>
          <clipPath id="clip0_186_640">
            <rect width="78" height="30" fill="white" />
          </clipPath>
        </defs>
      </svg>
    ),
    statNumber: "95%",
    statLabel: "Stick to their plan",
  },
];

export default function Testimonial2() {
  return (
    <section id="stories" className="relative z-[1] bg-bg py-20 xl:py-[90px] 2xl:py-[130px]">
      <div className="mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Trader stories"
          align="center"
          title={
            <>
              What traders say after <br />
              their first <em>quarter</em>
            </>
          }
        />

        <Reveal stagger className="flex flex-col gap-[30px]">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="group flex flex-col overflow-hidden rounded-[10px] border border-border p-[9px] lg:flex-row"
            >
              {/* thumb */}
              <div className="relative max-h-[380px] w-full overflow-hidden rounded-[6px] lg:w-1/3 xl:w-[28.3%]">
                <img
                  src={t.photo}
                  alt={t.photoAlt}
                  className="h-[380px] w-full rounded-[6px] object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                />
                {t.logoOverlay}
              </div>

              {/* content */}
              <div className="relative flex w-full flex-col justify-between px-0 pb-0 pt-[10px] lg:w-5/12 lg:px-[10px] xl:w-[45%]">
                <div className="p-[5px] xl:p-5">
                  <QuoteBgIcon />
                  <RatingBadge />
                  <h3 className="relative z-[2] mb-10 font-mona text-xl font-medium leading-[120%] tracking-[-0.03em] text-primary xl:text-2xl">
                    {t.quote}
                  </h3>
                </div>

                <div className="mt-auto flex items-center justify-between gap-3 rounded-[6px] bg-bg p-[5px] sm:p-[10px] xl:p-[15px]">
                  <div className="flex items-center gap-2">
                    <img
                      src={t.authorPhoto}
                      alt="Author"
                      className="h-[50px] w-[50px] rounded-full object-cover"
                    />
                    <div>
                      <div className="mb-[3px] font-mona text-base font-medium capitalize leading-[120%] text-primary">
                        {t.authorName}
                      </div>
                      <p className="font-mona text-sm font-medium capitalize leading-none text-text">
                        {t.authorTitle}
                      </p>
                    </div>
                  </div>
                  {t.brandLogo}
                </div>
              </div>

              {/* stats */}
              <div className="flex w-full flex-col justify-between gap-5 rounded-[6px] border border-border p-5 lg:w-1/4 lg:gap-0 xl:w-[27%] xl:px-[30px] xl:pb-[30px] xl:pt-10">
                <AvatarsRow />
                <div>
                  <h2 className="mb-[10px] font-mona text-[48px] font-medium leading-none tracking-[-0.04em] text-primary xl:text-[80px]">
                    {t.statNumber}
                  </h2>
                  <p className="font-mona text-base font-medium capitalize leading-[120%] text-primary">
                    {t.statLabel}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
