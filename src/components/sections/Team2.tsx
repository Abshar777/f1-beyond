import Link from "next/link";
import SectionHeading from "@/components/ui/SectionHeading";
import ThemeButton from "@/components/ui/ThemeButton";
import Reveal from "@/components/ui/Reveal";

type SocialLink = {
  label: string;
  width: number;
  height: number;
  viewBox: string;
  path: string;
};

// Same two social icons repeat on every card in the source markup, so they're
// factored out once here instead of being duplicated per team member.
const SOCIAL_LINKS: SocialLink[] = [
  {
    label: "Twitter",
    width: 15,
    height: 13,
    viewBox: "0 0 15 13",
    path: "M11.325 0H13.5312L8.7125 5.50625L14.3813 13H9.94375L6.46563 8.45625L2.49062 13H0.28125L5.43438 7.10938L0 0H4.55L7.69062 4.15313L11.325 0ZM10.55 11.6813H11.7719L3.88438 1.25H2.57188L10.55 11.6813Z",
  },
  {
    label: "LinkedIn",
    width: 14,
    height: 14,
    viewBox: "0 0 14 14",
    path: "M13 0H0.996875C0.446875 0 0 0.453125 0 1.00938V12.9906C0 13.5469 0.446875 14 0.996875 14H13C13.55 14 14 13.5469 14 12.9906V1.00938C14 0.453125 13.55 0 13 0ZM4.23125 12H2.15625V5.31875H4.23438V12H4.23125ZM3.19375 2C3.85938 2 4.39687 2.5375 4.39687 3.20312C4.39687 3.86875 3.85938 4.40625 3.19375 4.40625C2.52812 4.40625 1.99062 3.86875 1.99062 3.20312C1.99062 2.5375 2.52812 2 3.19375 2ZM12.0094 12H9.93437V8.75C9.93437 7.975 9.91875 6.97812 8.85625 6.97812C7.775 6.97812 7.60938 7.82188 7.60938 8.69375V12H5.53438V5.31875H7.525V6.23125H7.55313C7.83125 5.70625 8.50938 5.15312 9.51875 5.15312C11.6187 5.15312 12.0094 6.5375 12.0094 8.3375V12Z",
  },
];

type TeamMember = {
  name: string;
  title: string;
  image: string;
  href: string;
};

// Real names/roles/photos taken from the "team2 area" markup in e-learning.html.
const TEAM_MEMBERS: TeamMember[] = [
  {
    name: "Kristin K. Watson",
    title: "Head of Trading",
    image: "/assets/imgs/home2/team/team-thumb2_1.webp",
    href: "/instructor-details",
  },
  {
    name: "Esther E. Howard",
    title: "Senior Market Analyst",
    image: "/assets/imgs/home2/team/team-thumb2_2.webp",
    href: "/instructor-details",
  },
  {
    name: "Ralph R. Edwards",
    title: "Risk & Strategy Lead",
    image: "/assets/imgs/home2/team/team-thumb2_3.webp",
    href: "/instructor-details",
  },
  {
    name: "Sophia S. Martinez",
    title: "Crypto Desk Mentor",
    image: "/assets/imgs/home2/team/team-thumb2_4.webp",
    href: "/instructor-details",
  },
];

/**
 * "team2 area" from e-learning.html — instructor/team member card grid.
 * Ratings are static "4.5" for every card in the source (no per-member data).
 */
export default function Team2() {
  return (
    <section id="mentors" className="bg-bg py-20 min-[1400px]:py-[90px] min-[1920px]:py-[130px]">
      <div className="mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col items-start gap-6 md:flex-row md:items-end md:justify-between lg:mb-14">
          <SectionHeading
            eyebrow="Mentors"
            align="left"
            className="!mb-0"
            title={
              <>
                Learn beside traders who <br />are still in the <em>market</em>
              </>
            }
          />
          <ThemeButton href="/team" variant="white">
            Meet all mentors
          </ThemeButton>
        </div>

        <Reveal stagger className="grid grid-cols-2 gap-5 lg:grid-cols-4">
          {TEAM_MEMBERS.map((member) => (
            <div
              key={member.name}
              className="group h-full rounded-[10px] border border-border bg-white px-5 pt-5 pb-7 text-center transition-colors duration-300 hover:bg-primary"
            >
              <div className="flex items-start justify-between">
                <span className="inline-flex items-center gap-1 rounded bg-secondary px-[8.1px] py-[7px] text-sm font-semibold text-white">
                  4.5
                  <svg
                    width="14"
                    height="13"
                    viewBox="0 0 14 13"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M2.55 12.6667L3.63333 7.98333L0 4.83333L4.8 4.41667L6.66667 0L8.53333 4.41667L13.3333 4.83333L9.7 7.98333L10.7833 12.6667L6.66667 10.1833L2.55 12.6667Z"
                      fill="white"
                    />
                  </svg>
                </span>
                <div className="flex gap-[15px]">
                  {SOCIAL_LINKS.map((social) => (
                    <a key={social.label} href="#" aria-label={social.label}>
                      <svg
                        width={social.width}
                        height={social.height}
                        viewBox={social.viewBox}
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d={social.path}
                          className="fill-primary opacity-[0.14] transition-[fill,opacity] duration-300 group-hover:fill-white [a:hover_&]:opacity-100"
                        />
                      </svg>
                    </a>
                  ))}
                </div>
              </div>

              <div className="mt-[72px] mb-[47px] flex justify-center">
                <img
                  src={member.image}
                  alt={member.name}
                  className="h-[140px] w-[140px] rounded-full bg-[#f1f1f1] object-contain transition-transform duration-500 group-hover:scale-110"
                />
              </div>

              <div>
                <h3 className="mb-[7px]">
                  <Link
                    href={member.href}
                    className="text-[18px] leading-[120%] font-medium tracking-[-0.03em] text-primary no-underline transition-colors duration-300 group-hover:text-white md:text-[20px]"
                  >
                    {member.name}
                  </Link>
                </h3>
                <p className="text-sm font-medium text-text capitalize transition-colors duration-300 group-hover:text-white/80">
                  {member.title}
                </p>
              </div>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
