import { NextResponse } from "next/server";
import { uploadMultipleImages } from "@/lib/server/upload.util";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const images = formData.getAll("images");

    const files = images.filter(
      (item): item is File => item instanceof File && item.size > 0
    );

    if (files.length === 0) {
      return NextResponse.json(
        { message: "Aucune image reçue." },
        { status: 400 }
      );
    }

    // À adapter à la signature exacte de ton utilitaire
    const urls = await uploadMultipleImages(files);

    return NextResponse.json({ urls });
  } catch (error) {
    console.error("Erreur upload images :", error);

    return NextResponse.json(
      { message: "Impossible d'enregistrer les images." },
      { status: 500 }
    );
  }
}