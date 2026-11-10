import { NextResponse } from "next/server";
import { GarageService } from "@/lib/garage/service";

export async function GET() {
  try {
    const config = await GarageService.getEmailConfig();
    return NextResponse.json(config);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { ccEmails } = await request.json();
    const config = await GarageService.updateEmailConfig(ccEmails);
    return NextResponse.json(config);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}