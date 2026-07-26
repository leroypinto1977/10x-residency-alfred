import { NextResponse } from "next/server";
import { saveClientIntake, getAllClientIntakes } from "../../../service/client_intake_service";
import { getAgeCategory, calculateAge } from "@/lib/age";

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
