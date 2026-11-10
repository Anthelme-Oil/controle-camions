export interface GarageDTO {
  id: string;
  name?: string;
  location?: string;
  emails: string[];
}

export interface EmailConfigDTO {
  id: string;
  ccEmails: string[];
}

export const GarageClientService = {
  async getAll(): Promise<GarageDTO[]> {
    const res = await fetch("/api/garages");
    if (!res.ok) throw new Error("Erreur lors de la récupération des garages");
    return res.json();
  },

  async create(data: { name?: string; location?: string; emails: string[] }): Promise<GarageDTO> {
    const res = await fetch("/api/garages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Erreur lors de la création du garage");
    return res.json();
  },

  async update(id: string, data: { name?: string; location?: string; emails: string[] }): Promise<GarageDTO> {
    const res = await fetch(`/api/garages/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Erreur lors de la mise à jour du garage");
    return res.json();
  },

  async delete(id: string): Promise<void> {
    const res = await fetch(`/api/garages/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Erreur lors de la suppression du garage");
  },

  async getEmailConfig(): Promise<EmailConfigDTO> {
    const res = await fetch("/api/config/emails");
    if (!res.ok) throw new Error("Erreur de récupération de la configuration des e-mails");
    return res.json();
  },

  async updateEmailConfig(ccEmails: string[]): Promise<EmailConfigDTO> {
    const res = await fetch("/api/config/emails", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ccEmails }),
    });
    if (!res.ok) throw new Error("Erreur de mise à jour de la configuration des e-mails");
    return res.json();
  },
};