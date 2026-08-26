import { NextResponse } from "next/server";
import { saveClientIntake } from "../../../service/client_intake_service";
import { getAgeCategory, calculateAge } from "@/lib/age";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { sendMetaEvent, splitName, fbcFromClickId } from "@founder10x/meta";

// Generous for a human filling in one application, including retries after a
// validation error. Tight enough that scripted submissions stop being free.
const SUBMIT_LIMIT_PER_MINUTE = 10;

// The pixel drops _fbp and _fbc on the browser; forwarding them is the
// strongest match signal we can give Meta short of an email address.
function readCookie(cookieHeader: string, name: string): string | undefined {
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

/**
 * The click id Meta appends to the landing URL, if it is still on the page
 * the form was submitted from.
 *
 * Only consulted when there is no _fbc cookie, which means the pixel never
 * ran — an ad blocker, most often. That is exactly when the click is most at
 * risk of going unattributed, so it is worth rebuilding by hand.
 */
function clickIdFrom(referer: string | null): string | undefined {
  if (!referer) return undefined;
  try {
    return new URL(referer).searchParams.get("fbclid") ?? undefined;
  } catch {
    return undefined;
  }
}

function tooManyRequests(retryAfter: number) {
  return NextResponse.json(
    { success: false, message: "Too many requests. Please try again shortly." },
    { status: 429, headers: { "Retry-After": String(retryAfter) } }
  );
}

const REQUIRED_FIELDS = [
  "name",
  "email",
  "dob",
  "phone",
  "businessType",
  "industryDuration",
  "incomeLevel",
  "incomeTarget",
  "meetingTargets",
  "websiteDetails",
  "socialLinks",
  "investmentReady",
] as const;

export async function POST(request: Request) {
  // Checked before parsing the body so malformed spam is cheap to reject.
  const limit = await checkRateLimit(
    `intake:submit:${getClientIp(request)}`,
    SUBMIT_LIMIT_PER_MINUTE
  );
  if (!limit.allowed) return tooManyRequests(limit.retryAfter);

  try {
    const body = await request.json();

    const missingField = REQUIRED_FIELDS.some((field) => !body[field]);
    const missingChoices = !Array.isArray(body.foundUs) || body.foundUs.length === 0;
    const missingOtherDetail = Array.isArray(body.foundUs) && body.foundUs.includes("Others") && !body.foundUsOther;

    if (missingField || missingChoices || missingOtherDetail) {
      return NextResponse.json(
        {
          success: false,
          message: "Please fill all required fields.",
        },
        {
          status: 400,
        }
      );
    }

    // Resolved before the row is written, because these are stored on the
    // lead as well as sent: every CRM stage the panel reports later has to be
    // matched back to this same person, and by then the cookies are long gone.
    const cookies = request.headers.get("cookie") ?? "";
    const referer = request.headers.get("referer");
    const clickId = clickIdFrom(referer);
    const fbp = readCookie(cookies, "_fbp");
    const fbc = readCookie(cookies, "_fbc") ?? (clickId ? fbcFromClickId(clickId) : undefined);
    const metaEventId = String(body.metaEventId ?? crypto.randomUUID());

    await saveClientIntake({ ...body, fbp, fbc, metaEventId });

    // Report the lead to Meta from here as well as from the browser. The two
    // copies share eventId, so Meta counts one conversion; the server copy is
    // what survives when an ad blocker stops the pixel. Awaited so the request
    // stays alive until Meta answers — sendMetaEvent swallows its own errors,
    // so a bad token can never cost us a saved application.
    const { firstName, lastName } = splitName(String(body.name ?? ""));
    await sendMetaEvent({
      eventName: "Lead",
      eventId: metaEventId,
      actionSource: "website",
      eventSourceUrl: referer ?? undefined,
      email: body.email,
      phone: body.phone,
      firstName,
      lastName,
      clientIp: getClientIp(request),
      clientUserAgent: request.headers.get("user-agent") ?? undefined,
      fbp,
      fbc,
      customData: { content_name: "Founder 10X application" },
    });

    return NextResponse.json({
      success: true,
      message: "Application submitted successfully.",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
}
