
import { NextResponse } from "next/server";
import { GarageService } from "@/lib/garage/service";

interface RouteContext {
  params: Promise<{ id: string }>;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Une erreur inattendue est survenue.";
}

export async function PUT(
  request: Request,
  { params }: RouteContext
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "L'identifiant du garage est obligatoire." },
        { status: 400 }
      );
    }

    const updated = await GarageService.updateGarage(id, body);

    return NextResponse.json(updated, { status: 200 });
  } catch (error: unknown) {
    console.error("[PUT /api/garages/[id]]", error);

    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: RouteContext
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "L'identifiant du garage est obligatoire." },
        { status: 400 }
      );
    }

    await GarageService.deleteGarage(id);

    return NextResponse.json(
      { success: true, message: "Garage supprimé avec succès." },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("[DELETE /api/garages/[id]]", error);

    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}
