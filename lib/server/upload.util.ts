import "server-only";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";

export async function uploadMultipleImages(files: File[]): Promise<string[]> {
  if (!files || files.length === 0) return [];

  const uploadDir = path.join(process.cwd(), "public", "uploads");

  // Création du dossier s'il n'existe pas
  try {
    await mkdir(uploadDir, { recursive: true });
  } catch (err) {
    console.error("Erreur création dossier uploads:", err);
  }

  const urls: string[] = [];

  for (const file of files) {
    try {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Génération d'un nom de fichier unique et sécurisé
      const ext = path.extname(file.name) || ".jpg";
      const uniqueName = `${crypto.randomUUID()}${ext}`;
      const filePath = path.join(uploadDir, uniqueName);

      await writeFile(filePath, buffer);

      // Retourne le lien URL public accessible
      urls.push(`/uploads/${uniqueName}`);
    } catch (error) {
      console.error(`Erreur d'upload pour le fichier ${file.name}:`, error);
    }
  }

  return urls;
}



export async function fetchImageAsDataUrl(
  url: string,
  maxSize = 800,
  quality = 70
): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`Image inaccessible (${res.status}) :`, url);
      return null;
    }

    const input = Buffer.from(await res.arrayBuffer());

    const output = await sharp(input)
      .rotate() // respecte l'orientation EXIF des photos de téléphone
      .resize({
        width: maxSize,
        height: maxSize,
        fit: "inside",
        withoutEnlargement: true,
      })
      .flatten({ background: "#ffffff" }) // évite un fond noir sur les PNG transparents
      .jpeg({ quality, mozjpeg: true })
      .toBuffer();

    return `data:image/jpeg;base64,${output.toString("base64")}`;
  } catch (e) {
    console.error("Impossible de charger/compresser l'image :", url, e);
    return null;
  }
}

export function normalizeArray(value: unknown): string[] {
  if (Array.isArray(value)) return value;

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);

      if (Array.isArray(parsed)) return parsed;

      // Gère les chaînes JSON encodées plusieurs fois
      if (typeof parsed === "string") {
        return normalizeArray(parsed);
      }
    } catch {
      return [];
    }
  }

  return [];
}
const APP_URL = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || null;
export function getAbsolutePhotoUrl(photoUrl:string | undefined): string | null {
  if (!photoUrl) return null;

  // Conserver les URL déjà absolues
  if (/^https?:\/\//i.test(photoUrl)) {
    return photoUrl;
  }

  if (!APP_URL) {
    throw new Error("APP_URL n'est pas configurée dans le .env");
  }

  // Transformer /uploads/photo.jpg en URL absolue
  return new URL(
    photoUrl.startsWith("/") ? photoUrl : `/${photoUrl}`,
    APP_URL
  ).href;
}