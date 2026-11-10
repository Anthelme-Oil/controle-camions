import { NextResponse } from "next/server";
import { GarageService } from "@/lib/garage/service";

export async function GET() {
  try {
    const garages = await GarageService.getAllGarages();
    return NextResponse.json(garages);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const garage = await GarageService.createGarage(body);
    return NextResponse.json(garage, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}