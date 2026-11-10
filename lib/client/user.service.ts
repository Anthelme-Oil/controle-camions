export interface UserDTO {
  id: string;
  email: string;
  name: string;
  role: "INSPECTOR" | "ADMIN";
}

export class UserClientService {
  private static BASE_URL = "/api/users";

  static async getAll(): Promise<UserDTO[]> {
    const res = await fetch(this.BASE_URL);
    const result = await res.json();
    if (!result.success) throw new Error(result.error);
    return result.data;
  }

  static async getById(id: string): Promise<UserDTO> {
    const res = await fetch(`${this.BASE_URL}/${id}`);
    const result = await res.json();
    if (!result.success) throw new Error(result.error);
    return result.data;
  }

  static async create(payload: {
    email: string;
    name: string;
    password?: string;
    role?: "INSPECTOR" | "ADMIN";
  }): Promise<UserDTO> {
    const res = await fetch(this.BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await res.json();
    if (!result.success) throw new Error(result.error);
    return result.data;
  }

  static async update(
    id: string,
    payload: { email?: string; name?: string; role?: "INSPECTOR" | "ADMIN"; password?: string }
  ): Promise<UserDTO> {
    const res = await fetch(`${this.BASE_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
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

 // lib/client/user.service.ts

static async login(credentials: { email: string; password?: string }): Promise<UserDTO> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  // 1. Lire le texte brut de la réponse
  const text = await res.text();
  
  // 2. Tenter de parser le JSON seulement si du texte est présent
  let result;
  try {
    result = text ? JSON.parse(text) : {};
  } catch (err) {
    throw new Error(`Réponse serveur invalide (Statut ${res.status}): ${text.slice(0, 100)}`);
  }

  // 3. Vérifier la réussite de la requête
  if (!res.ok || !result.success) {
    throw new Error(result.error || `Erreur lors de la connexion (Statut ${res.status})`);
  }

  return result.user;
}
}