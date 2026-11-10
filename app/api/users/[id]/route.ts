import { NextResponse } from "next/server";
import { UserService } from "@/lib/users/service";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await UserService.getUserById(id);
    return NextResponse.json({ success: true, data: user });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Utilisateur introuvable" },
      { status: 404 }
    );
  }
}