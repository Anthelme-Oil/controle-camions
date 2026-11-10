// app/api/inspections/[id]/send-email/route.ts
import { NextResponse } from "next/server";
import { InspectionService } from "@/lib/inspections/service";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { email, message } = await req.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Adresse e-mail requise." },
        { status: 400 }
      );
    }

    await InspectionService.sendReportEmail(id, email, message);

    return NextResponse.json({
      success: true,
      message: "Rapport envoyé par email avec succès.",
    });
  } catch (error: any) {
    console.error("Erreur API Send Email :", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Impossible d'envoyer l'e-mail. Vérifiez la configuration SMTP dans .env.local",
      },
      { status: 500 }
    );
  }
}