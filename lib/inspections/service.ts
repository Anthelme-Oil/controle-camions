import { InspectionRepository } from "./repository";
import { GarageRepository, ConfigRepository } from "../garage/repository";
import { sendEmailWithPdf } from "@/lib/mailer";
import { CheckCategory, CheckStatesMap, VehicleInfo } from "@/types";
import { generateChecklistPDF } from "@/lib/pdf";
import catalog from "@/data/checks.json";
import { uploadMultipleImages ,fetchImageAsDataUrl,normalizeArray,getAbsolutePhotoUrl} from "../server/upload.util";

export class InspectionService {
  static async getAllInspections() {
    return InspectionRepository.findAll();
  }

  static async getInspectionById(id: string) {
    const inspection = await InspectionRepository.findById(id);
    if (!inspection) {
      throw new Error("INSPECTION_NOT_FOUND");
    }
    return inspection;
  }



  static async createInspection(payload: {
    info: {
      region?: string;
      garageId?: string;
      registration: string;
      inspector?: string;
      capacity?: string;
      product?: string;
      manufacturer?: string;
      serviceDate?: string;
      carrier?: string;
      driver?: string;
    };
    states: Record<string, { ok: boolean; observation?: string; photoUrls?: string[]; photo?: string }>;
    categories: Array<{
      title: string;
      items: Array<{ id: string; reference: string; text: string }>;
    }>;
    userId: string;
    status?: "DRAFT" | "VALIDATED" | "ARCHIVED";
  }) {
    if (!payload.info.registration) {
      throw new Error("REGISTRATION_REQUIRED");
    }

    if (!payload.userId) {
      throw new Error("USER_REQUIRED");
    }

    const inspectionData = {
      region: payload.info.region,
      garageId: payload.info.garageId || null,
      registration: payload.info.registration,
      inspectorName: payload.info.inspector,
      capacity: payload.info.capacity,
      product: payload.info.product,
      manufacturer: payload.info.manufacturer,
      serviceDate: payload.info.serviceDate ? new Date(payload.info.serviceDate) : null,
      carrier: payload.info.carrier,
      driver: payload.info.driver,
      status: payload.status || "VALIDATED",
      inspectorId: payload.userId,
    };

    

    // 1. Traitement de chaque check pour nettoyer et ne garder QUE les liens textuels (/uploads/...)
    const checksData = await Promise.all(
      payload.categories.flatMap((cat) =>
        cat.items.map(async (item) => {
          const state = payload.states[item.id];
          let finalPhotoUrls: string[] = [];

          if (state?.photoUrls && Array.isArray(state.photoUrls)) {
            for (const p of state.photoUrls) {
              // Si on reçoit du Base64 depuis le front, on le convertit/sauvegarde via l'utilitaire ou on nettoie
              if (p.startsWith("data:image")) {
                // Optionnel : si vous passez des fichiers binaires ou convertissez le base64 en buffer
                // Pour faire simple ici, si ce sont déjà des URLs ou des chemins, on les garde.
                // Si ce sont des data:image, assurez-vous de les traiter ou de les envoyer sous forme de File depuis le front.
              } else {
                finalPhotoUrls.push(p); // C'est déjà un lien /uploads/...
              }
            }
          }

          return {
            reference: item.reference,
            category: cat.title,
            itemText: item.text,
            isOk: state?.ok ?? true,
            observation: state?.observation || null,
            photoUrl: finalPhotoUrls[0] || null,
            photoUrls: JSON.stringify(finalPhotoUrls), // Converti en chaîne JSON propre pour MySQL
          };
        })
      )
    );

    return InspectionRepository.createWithChecks({
      inspectionData,
      checksData,
    });
  }

  static async archiveInspection(id: string) {
    const updated = await InspectionRepository.updateStatus(id, "ARCHIVED");
    if (!updated) throw new Error("INSPECTION_NOT_FOUND");
    return updated;
  }

  static async deleteInspection(id: string) {
    const success = await InspectionRepository.delete(id);
    if (!success) throw new Error("INSPECTION_NOT_FOUND");
    return true;
  }

  static async draftInspection(id: string) {
    const updated = await InspectionRepository.updateStatus(id, "DRAFT");
    if (!updated) throw new Error("INSPECTION_NOT_FOUND");
    return updated;
  }

  static async updateInspection(id: string, updatedData: any) {
    const { checks, ...inspectionData } = updatedData;

    const updated = await InspectionRepository.updateWithChecks(id, {
      inspectionData,
      checksData: checks ?? [],
    });

    if (!updated) {
      throw new Error("INSPECTION_NOT_FOUND");
    }

    return updated;
  }

  /**
   * Envoi du rapport couplé (Génération PDF + Envoi Microsoft Graph vers Garage & CC)
   */
  static async sendReportEmail(id: string, currentUserEmail: string, message?: string) {
    const inspection: any = await InspectionRepository.findById(id);
    if (!inspection) {
      throw new Error("INSPECTION_NOT_FOUND");
    }

    try {
      // 1. Reconstitution des informations du véhicule
      const info: VehicleInfo = {
        region: inspection.region || "",
        garage:inspection.garage || undefined,
        garageId: inspection.garageId || undefined,
        registration: inspection.registration,
        inspector: inspection.inspectorName || inspection.inspector?.name || "",
        date: inspection.createdAt
          ? new Date(inspection.createdAt).toISOString().slice(0, 10)
          : new Date().toISOString().slice(0, 10),
        capacity: inspection.capacity || "",
        product: inspection.product || "",
        manufacturer: inspection.manufacturer || "",
        serviceDate: inspection.serviceDate
          ? new Date(inspection.serviceDate).toISOString().slice(0, 10)
          : "",
        carrier: inspection.carrier || "",
        driver: inspection.driver || "",
      };

      const categories: CheckCategory[] = catalog.categories as CheckCategory[];
      const states: CheckStatesMap = {};
      
      const allItems = categories.flatMap((cat) => cat.items);
      allItems.forEach((item) => {
        states[item.id] = { ok: true, observation: "",photo: "", photoUrls: [] }; // Valeurs par défaut
      });

      const checks = inspection.checks || inspection.inspection_checks || [];
      // console.log("sendReportEmail - checks:", checks);
      if (Array.isArray(checks) && checks.length > 0) {
        checks.forEach((chk: any) => {
          if (chk.reference) {
            states[chk.reference] = {
              ok: Boolean(chk.isOk ?? chk.is_ok),
              observation: chk.observation || "",
              photo: chk.photoUrl || chk.photo_url || "",
              photoUrls: chk.photoUrls || chk.photo_urls || [], // Récupération des URLs multiples si disponibles
            };
          }
        });
      }

      // 2. Génération du PDF
      // Après avoir rempli `states`...
await Promise.all(
  Object.values(states).map(async (state) => {
    const urls = normalizeArray(state.photoUrls);
    const source = urls.length > 0 ? urls : state.photo ? [state.photo] : [];

    const dataUrls = await Promise.all(
      source.map((u) => fetchImageAsDataUrl(getAbsolutePhotoUrl(u) || u))
    );

    state.photoUrls = dataUrls.filter((d): d is string => !!d);
    state.photo = "";
  })
);

const doc = generateChecklistPDF(info, categories, states, false);
      const pdfArrayBuffer = doc.output("arraybuffer");
      const pdfBuffer = Buffer.from(pdfArrayBuffer);
      const filename = `fiche_rtgep_${info.registration}.pdf`;

   // 3. Récupération et normalisation des e-mails du Garage lié ou Fallback utilisateur courant
      let recipientEmails: string[] = [];
      if (inspection.garageId) {
        const garage: any = await GarageRepository.findById(inspection.garageId);
        if (garage && garage.emails) {
          // Sécurité : s'assure que l'on manipule bien un tableau, qu'il vienne sous forme de string JSON ou de tableau
          if (Array.isArray(garage.emails)) {
            recipientEmails = garage.emails;
          } else if (typeof garage.emails === "string") {
            try {
              recipientEmails = JSON.parse(garage.emails);
            } catch {
              recipientEmails = [garage.emails];
            }
          }
        }
      }

      if (recipientEmails.length === 0) {
        recipientEmails = [currentUserEmail];
      }

      // Sécurité finale : s'assure que c'est bien un tableau avant le .join()
      const recipientList = Array.isArray(recipientEmails) 
        ? recipientEmails 
        : [recipientEmails];

      // 4. Récupération des destinataires en copie (CC) globaux

// 4. Récupération et normalisation des e-mails en CC
const config: any = await ConfigRepository.getConfig();
const rawCcEmails = config?.ccEmails;

let ccList: string[] = [];

if (Array.isArray(rawCcEmails)) {
  ccList = rawCcEmails;
} else if (typeof rawCcEmails === "string" && rawCcEmails.trim()) {
  try {
    const parsed = JSON.parse(rawCcEmails);

    ccList = Array.isArray(parsed)
      ? parsed
      : [rawCcEmails];
  } catch {
    ccList = rawCcEmails.split(",");
  }
}

ccList = ccList
  .filter((email): email is string => typeof email === "string")
  .map((email) => email.trim())
  .filter(Boolean);




      // 5. Envoi via Microsoft Graph
      const subject = `Rapport de contrôle SafeRoute - ${info.garage?.name || info.registration} - ${info.date}`;
      const text =
        message ||
        `Veuillez trouver ci-joint le rapport de contrôle du véhicule ${info.registration}.`;

      await sendEmailWithPdf({
        to: recipientList,
        cc: ccList.length > 0 ? ccList : undefined,
        subject,
        text,
        pdfBuffer,
        filename,
      });

      // Journalisation sécurisée
      await InspectionRepository.logEmail({
        inspectionId: id,
        recipient: recipientList.join(", "),
        message,
        status: "SUCCESS",
      });

      return { success: true };
    } catch (err: any) {
      console.error("❌ Erreur lors de l'envoi de l'e-mail avec PDF :", err);

      await InspectionRepository.logEmail({
        inspectionId: id,
        recipient: currentUserEmail,
        message,
        status: "FAILED",
      });

      throw new Error(err?.message || "EMAIL_SEND_FAILED");
    }
  }
}