import { Garage } from "@/models/Garage";

export interface InspectionCheckDTO {
  id: string;
  reference: string;
  category: string;
  itemText: string;
  isOk: boolean;
  observation?: string;
  photoUrl?: string;
  photoUrls?: string[];
}

export interface GarageDTO {
  id?: string;
  name?: string;
  location?: string;
  emails: string[];
}

export interface InspectionDTO {
  id: string;
  region?: string;
  registration: string;
  inspectorName?: string;
  capacity?: string;
  product?: string;
  manufacturer?: string;
  serviceDate?: string;
  carrier?: string;
  driver?: string;
  status: "DRAFT" | "VALIDATED" | "ARCHIVED";
  createdAt: string;
  inspector?: {
    id: string;
    name: string;
    email: string;
  };
  garage?:GarageDTO
  checks?: InspectionCheckDTO[];
}

export class InspectionClientService {
  private static BASE_URL = "/api/inspections";

  static async getAll(): Promise<InspectionDTO[]> {
    const res = await fetch(this.BASE_URL);
    const result = await res.json();
    if (!result.success) throw new Error(result.error);
    return result.data;
  }

  static async getById(id: string): Promise<InspectionDTO> {
    const res = await fetch(`${this.BASE_URL}/${id}`);
    const result = await res.json();
    if (!result.success) throw new Error(result.error);
    return result.data;
  }


static async create(
  payload: any,
  photoFiles: Record<string, File[]> = {}
): Promise<InspectionDTO> {
  // Préparer une copie du payload pour ne pas modifier l'état React
  const finalPayload = {
    ...payload,
    states: { ...payload.states },
  };

  // Envoyer les images de chaque point de contrôle au serveur
  for (const [checkId, files] of Object.entries(photoFiles)) {
    if (!files.length) continue;

    const formData = new FormData();

    files.forEach((file) => {
      formData.append("images", file);
    });

    const uploadResponse = await fetch("/api/uploads/images/", {
      method: "POST",
      body: formData,
    });

    const uploadResult = await uploadResponse.json();

    if (!uploadResponse.ok) {
      throw new Error(
        uploadResult.message || uploadResult.error || "Échec de l'upload des images."
      );
    }

    const uploadedUrls: string[] = uploadResult.urls;

    if (
      !Array.isArray(uploadedUrls) ||
      uploadedUrls.length !== files.length ||
      uploadedUrls.some((url) => typeof url !== "string")
    ) {
      throw new Error("Réponse invalide du service d'upload.");
    }

    const previousUrls = finalPayload.states[checkId]?.photoUrls ?? [];

    finalPayload.states[checkId] = {
      ...finalPayload.states[checkId],
      photoUrls: [...previousUrls, ...uploadedUrls],
    };
  }

  // Envoyer ensuite l'inspection avec les URL, et non les fichiers
  const res = await fetch(this.BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(finalPayload),
  });

  const result = await res.json();

  if (!res.ok || !result.success) {
    throw new Error(result.error || "Erreur lors de la création du contrôle.");
  }

  return result.data;
}


  static async archive(id: string): Promise<InspectionDTO> {
    const res = await fetch(`${this.BASE_URL}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "archive" }),
    });
    const result = await res.json();
    if (!result.success) throw new Error(result.error);
    return result.data;
  }

  static async delete(id: string): Promise<boolean> {
    const res = await fetch(`${this.BASE_URL}/${id}`, {
      method: "DELETE",
    });
    const result = await res.json();
    if (!result.success) throw new Error(result.error);
    return true;
  }

  static async sendEmail(id: string, email: string, message?: string): Promise<boolean> {
    const res = await fetch(`${this.BASE_URL}/${id}/send-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, message }),
    });
    const result = await res.json();
    if (!result.success) throw new Error(result.error);
    return true;
  }

  static async update(id: string, payload: any): Promise<InspectionDTO> {
    
    const res = await fetch(`${this.BASE_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      
      body: JSON.stringify(payload),
    });
    const result = await res.json();
    if (!result.success) throw new Error(result.error);
    return result.data;
  }

  static async draft(id: string): Promise<InspectionDTO> {
    const res = await fetch(`${this.BASE_URL}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "draft" }),
    });
    const result = await res.json();
    if (!result.success) throw new Error(result.error);
    return result.data;
  }
}