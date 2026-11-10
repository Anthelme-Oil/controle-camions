
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { User } from "@/models/User";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    // Protection obligatoire : définir un secret temporaire
    const secret = process.env.ADMIN_RESET_SECRET;
    const providedSecret = request.headers.get("x-reset-secret");

    if (!secret || providedSecret !== secret) {
      return NextResponse.json(
        { message: "Accès non autorisé" },
        { status: 401 }
      );
    }

    const email = "anthelme.kpodar@togosh.com";
    const newPassword = "password123";

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return NextResponse.json(
        { message: "Utilisateur introuvable" },
        { status: 404 }
      );
    }

    // Générer un nouveau hash et désactiver le hook
    // de hachage automatique pour éviter un double hachage.
    const hash = await bcrypt.hash(newPassword, 10);

    await user.update(
      { password: hash },
      { hooks: false }
    );

    const updatedUser = await User.findOne({ where: { email } });

    const valid = updatedUser
      ? await bcrypt.compare(
          newPassword,
          updatedUser.getDataValue("password")
        )
      : false;

    if (!valid) {
      return NextResponse.json(
        { message: "La vérification du mot de passe a échoué" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Mot de passe réinitialisé et vérifié avec succès",
    });
  } catch (error) {
    console.error("Erreur de réinitialisation :", error);

    return NextResponse.json(
      { message: "Erreur serveur" },
      { status: 500 }
    );
  }
}
