import { NextResponse } from "next/server";
import { UserService } from "@/lib/users/service";

export async function GET() {
  try {
    const users = await UserService.getAllUsers();
    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Erreur lors de la récupération" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const user = await UserService.createUser(body);
    return NextResponse.json({ success: true, data: user }, { status: 201 });
  } catch (error: any) {
    if (error.message === "EMAIL_ALREADY_EXISTS") {
      return NextResponse.json({ success: false, error: "Cet email est déjà utilisé" }, { status: 409 });
    }
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}