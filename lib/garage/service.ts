import { GarageRepository, ConfigRepository } from "./repository";
import { sendEmailWithPdf } from "@/lib/mailer";
import {generateChecklistPDF} from "@/lib/pdf";

export const GarageService = {
  async getAllGarages() {
    return GarageRepository.findAll();
  },

  async createGarage(data: { name?: string; location?: string; emails: string[] }) {
    return GarageRepository.create(data);
  },

  async updateGarage(id: string, data: { name?: string; location?: string; emails: string[] }) {
    return GarageRepository.update(id, data);
  },

  async deleteGarage(id: string) {
    return GarageRepository.delete(id);
  },

  async getEmailConfig() {
    return ConfigRepository.getConfig();
  },

  async updateEmailConfig(ccEmails: string[]) {
    return ConfigRepository.updateConfig(ccEmails);
  },

  // Service d'envoi couplé au Garage et Microsoft Graph
  async sendInspectionEmail({
    garageId,
    currentUserEmail,
    subject,
    textContent,
    pdfBuffer,
    pdfFilename,
  }: {
    garageId?: string | null;
    currentUserEmail: string;
    subject: string;
    textContent: string;
    pdfBuffer: Buffer;
    pdfFilename: string;
  }) {
    let recipientEmails: string[] = [];

    // 1. Récupérer les e-mails du garage si renseigné
    if (garageId) {
      const garage = await GarageRepository.findById(garageId);
      if (garage && garage.emails && garage.emails.length > 0) {
        recipientEmails = garage.emails;
      }
    }

    // Fallback si aucun email sur le garage : on envoie à l'utilisateur courant
    if (recipientEmails.length === 0) {
      recipientEmails = [currentUserEmail];
    }

    // 2. Récupérer les configurations des e-mails en copie (CC)
    const config = await ConfigRepository.getConfig();
    const ccEmails = config?.ccEmails || [];

    // 3. Appel de la fonction Microsoft Graph améliorée
    return sendEmailWithPdf({
      to: recipientEmails,
      cc: ccEmails.length > 0 ? ccEmails : undefined,
      subject: subject,
      text: textContent,
      pdfBuffer: pdfBuffer,
      filename: pdfFilename,
      // Si Microsoft Graph exige que l'expéditeur soit la boîte mail technique configurée, 
      // on peut laisser la variable d'env ou l'adapter selon vos permissions Graph.
    });
  },
};