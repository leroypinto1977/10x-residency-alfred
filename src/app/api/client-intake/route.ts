import { NextResponse } from "next/server";
import { saveClientIntake, getAllClientIntakes } from "../../../service/client_intake_service";
import { getAgeCategory, calculateAge } from "@/lib/age";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

// Generous for a human filling in one application, including retries after a
// validation error. Tight enough that scripted submissions stop being free.
const SUBMIT_LIMIT_PER_MINUTE = 10;

// The export is guarded by a shared secret in the query string, so this is
// also the brute-force ceiling on guessing it.
const EXPORT_LIMIT_PER_MINUTE = 20;

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

export async function GET(request: Request) {
  const limit = await checkRateLimit(
    `intake:export:${getClientIp(request)}`,
    EXPORT_LIMIT_PER_MINUTE
  );
  if (!limit.allowed) return tooManyRequests(limit.retryAfter);

  const secret = process.env.ADMIN_EXPORT_SECRET;
  const key = new URL(request.url).searchParams.get("key");

  if (!secret || key !== secret) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const records = await getAllClientIntakes();

    const data = records.map((record) => ({
      ...record,
      age: calculateAge(record.dob),
      ageCategory: getAgeCategory(record.dob),
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}

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

    await saveClientIntake(body);

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
