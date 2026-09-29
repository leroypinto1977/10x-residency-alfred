import Image from "next/image";
import { Plus_Jakarta_Sans } from "next/font/google";

// Self-contained: loads its own font rather than assuming a consuming app
// already has Plus Jakarta Sans on the page, since this is meant to be a
// portable, reusable component.
const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export interface ProfileCardProps {
  name: string;
  role: string;
  subtitle: string;
  followers: string;
  imageSrc: string;
  imageAlt?: string;
}

const GOLD = "#AF874A";

function InstagramGlyph() {
  return (
    <svg viewBox="0 0 34 34" width={34} height={34} aria-hidden="true">
      <defs>
        <linearGradient id="profileCardInstagramGradient" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#F9A13B" />
          <stop offset="50%" stopColor="#E8345A" />
          <stop offset="100%" stopColor="#7B3AD8" />
        </linearGradient>
      </defs>
      <rect
        x="3"
        y="3"
        width="28"
        height="28"
        rx="8"
        fill="url(#profileCardInstagramGradient)"
        stroke="#FFFFFF"
        strokeWidth="1.6"
      />
      <circle
        cx="17"
        cy="17"
        r="6.5"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="1.8"
      />
      <circle cx="24.2" cy="9.8" r="1.5" fill="#FFFFFF" />
    </svg>
  );
}

/** A scalloped seal with a ribbon tail — no icon library carries this shape. */
function AwardGlyph() {
  return (
    <svg viewBox="0 0 46 46" width={46} height={46} aria-hidden="true">
      <path d="M15.5,31 L20.5,33.3 L17.8,42.5 L13.2,40 Z" fill={GOLD} />
      <path d="M30.5,31 L25.5,33.3 L28.2,42.5 L32.8,40 Z" fill={GOLD} />
      <path
        d="M23,2.7 L26.8,6.1 L31.9,5.2 L33.4,10.1 L38.1,12.1 L37.1,17.2 L40.3,21.3
           L37.1,25.4 L38.1,30.5 L33.4,32.5 L31.9,37.4 L26.8,36.5 L23,39.9
           L19.2,36.5 L14.1,37.4 L12.6,32.5 L7.9,30.5 L8.9,25.4 L5.7,21.3
           L8.9,17.2 L7.9,12.1 L12.6,10.1 L14.1,5.2 L19.2,6.1 Z"
        fill={GOLD}
      />
      <circle cx="23" cy="21.3" r="7.3" fill="none" stroke="#FFF6E8" strokeOpacity="0.7" strokeWidth="1.1" />
    </svg>
  );
}

/**
 * Fixed 812×831 design, absolutely positioned throughout. The gold ring
 * behind the photo is deliberately not a CSS border: it's a solid disc
 * sized/offset so the photo (positioned 8px right and 3px down from it)
 * covers most of it, leaving a ring that's thin at the top and thicker on
 * the sides and bottom — a uniform border can't produce that asymmetry.
 */
export default function ProfileCard({
  name,
  role,
  subtitle,
  followers,
  imageSrc,
  imageAlt,
}: ProfileCardProps) {
  return (
    <div
      style={{ containerType: "inline-size" }}
      className="mx-auto w-full max-w-[812px]"
    >
      <div className="relative w-full" style={{ aspectRatio: "812 / 831" }}>
        <div
          className={`${plusJakartaSans.className} absolute left-0 top-0 h-[831px] w-[812px] origin-top-left`}
          style={{ transform: "scale(calc(100cqw / 812px))" }}
        >
          {/* Background */}
          <div
            className="absolute inset-0 rounded-[28px] bg-[#F2EEE5]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 100% 8%, #E6D8BF 0%, #EFE7DA 28%, #F2EEE5 55%)",
            }}
          />

          {/* Gold disc behind the photo — not a border. */}
          <div
            className="absolute left-[97px] top-[64px] h-[604px] w-[604px] rounded-full"
            style={{
              background: GOLD,
              boxShadow: "0 24px 60px rgba(120,88,40,0.14)",
            }}
          />

          {/* Photo */}
          <div className="absolute left-[105px] top-[67px] h-[588px] w-[588px] overflow-hidden rounded-full bg-[#0A0A0A]">
            <Image
              src={imageSrc}
              alt={imageAlt ?? name}
              fill
              sizes="588px"
              priority
              className="object-cover"
            />
          </div>

          {/* Instagram pill */}
          <div
            className="absolute left-[493px] top-[138px] flex h-[100px] w-[245px] items-center gap-4 rounded-[50px] bg-[#F4F0E8] pl-4"
            style={{
              border: `1.5px solid ${GOLD}`,
              boxShadow: "0 12px 32px rgba(120,88,40,0.12)",
            }}
          >
            <span
              className="flex h-[66px] w-[66px] shrink-0 items-center justify-center rounded-full"
              style={{
                background:
                  "radial-gradient(circle, #FBE7EE 0%, #EFC6E3 100%)",
              }}
            >
              <InstagramGlyph />
            </span>
            <span className="flex flex-col leading-none">
              <span
                className="text-[36px] font-bold text-[#141413]"
                style={{ letterSpacing: "-0.5px" }}
              >
                {followers}
              </span>
              <span className="mt-1 text-[18px] font-normal text-[#6B665E]">
                Followers
              </span>
            </span>
          </div>

          {/* Award badge */}
          <div
            className="absolute left-[54px] top-[300px] flex h-[100px] w-[100px] items-center justify-center rounded-full"
            style={{
              background:
                "radial-gradient(circle, #FFF6E8 0%, #FBE9CF 55%, #F5DCB4 100%)",
              border: "1.5px solid #E2C89D",
              boxShadow: "0 10px 26px rgba(120,88,40,0.18)",
            }}
          >
            <AwardGlyph />
          </div>

          {/* Role pill */}
          <div
            className="absolute left-1/2 top-[623px] flex h-16 -translate-x-1/2 items-center rounded-full bg-[#F4F0E8] px-[22px]"
            style={{
              border: `1.5px solid ${GOLD}`,
              boxShadow: "0 10px 28px rgba(120,88,40,0.10)",
            }}
          >
            <span className="whitespace-nowrap text-[22px] font-medium text-[#141413]">
              {role}
            </span>
          </div>

          {/* Name + subtitle */}
          <div className="absolute left-1/2 top-[704px] flex w-full -translate-x-1/2 flex-col items-center gap-3 text-center">
            <p
              className="text-[36px] font-bold"
              style={{ color: GOLD, letterSpacing: "-0.4px" }}
            >
              {name}
            </p>
            <p className="text-[20px] font-normal text-[#55514A]">{subtitle}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
