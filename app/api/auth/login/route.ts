import { NextResponse } from "next/server";
import { User } from "@/models";
import bcrypt from "bcryptjs";
import { UserService } from "@/lib/users/service";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Veuillez fournir l'email et le mot de passe" },
        { status: 400 }
      );
    }

 

    // 1. Recherche de l'utilisateur par email
    const user = await UserService.authenticate(email,password);
    // const user = await User.findOne({ where: { email } });
    


    // 2. Vérification directe du mot de passe avec bcrypt (évite les erreurs sur validatePassword)
  

    // 3. Réponse en cas de succès
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error: any) {
    // Regardez ce message dans la console de votre terminal Node.js !
    console.error("❌ ERREUR API LOGIN SERVEUR :", error);

    return NextResponse.json(
      { success: false, error: error?.message || "Erreur serveur lors de la connexion" },
      { status: 500 }
    );
  }
}