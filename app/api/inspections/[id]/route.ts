import { NextResponse } from "next/server";
import { InspectionService } from "@/lib/inspections/service";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const inspection = await InspectionService.getInspectionById(id);
    return NextResponse.json({ success: true, data: inspection });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Inspection introuvable" },
      { status: 404 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    if (body.action === "archive") {
      const archived = await InspectionService.archiveInspection(id);
      return NextResponse.json({ success: true, data: archived });
    }else if (body.action === "update") {
      const updated = await InspectionService.updateInspection(id, body.data);
      return NextResponse.json({ success: true, data: updated });
    }else if (body.action === "draft") {
      const drafted = await InspectionService.draftInspection(id);
      return NextResponse.json({ success: true, data: drafted });
    }
    return NextResponse.json({ success: false, error: "Action inconnue" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Échec de la mise à jour" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> } 
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const updated = await InspectionService.updateInspection(id, body);
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Échec de la mise à jour" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await InspectionService.deleteInspection(id);
    return NextResponse.json({ success: true, message: "Inspection supprimée" });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Impossible de supprimer l'inspection" },
      { status: 500 }
    );
  }
}