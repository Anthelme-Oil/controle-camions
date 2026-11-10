import { NextResponse } from "next/server";
import { GarageService } from "@/lib/garage/service";

export async function GET() {
  try {
    const garages = await GarageService.getAllGarages();
    return NextResponse.json(garages);
  } catch (error: any) {
    console.error("❌ Erreur API GET /api/garages :", error);
    return NextResponse.json(
      { 
        error: "Erreur lors de la récupération des garages", 
        message: error.message, 
        stack: error.stack 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const garage = await GarageService.createGarage(body);
    return NextResponse.json(garage, { status: 201 });
  } catch (error: any) {
    console.error("❌ Erreur API POST /api/garages :", error);
    return NextResponse.json(
      { 
        error: error.message, 
        stack: error.stack 
      }, 
      { status: 500 }
    );
  }
}