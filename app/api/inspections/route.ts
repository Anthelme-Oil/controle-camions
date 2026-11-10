import { NextResponse } from "next/server";
import { InspectionService } from "@/lib/inspections/service";

export async function GET() {
  try {
    const inspections = await InspectionService.getAllInspections();
    return NextResponse.json({ success: true, data: inspections });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Erreur lors de la récupération des inspections" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const inspection = await InspectionService.createInspection(body);

    return NextResponse.json({ success: true, data: inspection }, { status: 201 });
  } catch (error: any) {
    console.error("Erreur POST Inspection:", error);
    if (error.message === "REGISTRATION_REQUIRED") {
      return NextResponse.json(
        { success: false, error: "L'immatriculation est obligatoire." },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Erreur lors de la création de l'inspection" },
      { status: 500 }
    );
  }
}