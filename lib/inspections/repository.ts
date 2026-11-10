import { Inspection, InspectionCheck, EmailLog, User } from "@/models";
import sequelize  from "@/lib/db/sequelize";
import { Garage } from "@/models/Garage";

export class InspectionRepository {
  /**
   * Récupère la liste de toutes les inspections avec l'inspecteur
   */
  static async findAll() {
    return Inspection.findAll({
      order: [["createdAt", "DESC"]],
      include: [
        { model: User, as: "inspector", attributes: ["id", "name", "email"] },
        { model: InspectionCheck, as: "checks" },
        { model: Garage, as: "garage" , required: false,},
      ],
    });
  }

  /**
   * Récupère une inspection par son ID avec ses contrôles et logs
   */
  static async findById(id: string) {
    return Inspection.findByPk(id, {
      include: [
        { model: User, as: "inspector", attributes: ["id", "name", "email"] },
        { model: InspectionCheck, as: "checks" },
        { model: EmailLog, as: "emailLogs" },
        { model: Garage, as: "garage" , required: false,},
      ],
    });
  }

  /**
   * Crée une inspection complète (avec tous ses checks) au sein d'une transaction
   */
static async createWithChecks(data: {
    inspectionData: any;
    checksData: any[];
  }) {
    // 1. Création de l'inspection principale
    const inspection = await Inspection.create(data.inspectionData);

    const checksToInsert = data.checksData.map((check) => ({
      ...check,
      inspectionId: inspection.id,
    }));

    // 2. Insertion par lots (ex: par paquet de 10) pour éliminer tout risque de dépassement de paquet réseau
    const batchSize = 10;
    for (let i = 0; i < checksToInsert.length; i += batchSize) {
      const batch = checksToInsert.slice(i, i + batchSize);
      await InspectionCheck.bulkCreate(batch);
    }

    return inspection;
  }


  

  /**
   * Met à jour le statut d'une inspection (ex: ARCHIVED, VALIDATED, DRAFT)
   */
  static async updateStatus(id: string, status: "DRAFT" | "VALIDATED" | "ARCHIVED") {
    const inspection = await Inspection.findByPk(id);
    if (!inspection) return null;

    inspection.status = status;
    await inspection.save();
    return inspection;
  }

  /**
   * Supprime une inspection (les checks et logs sont supprimés en cascade)
   */
  static async delete(id: string) {
    const inspection = await Inspection.findByPk(id);
    if (!inspection) return false;

    await inspection.destroy();
    return true;
  }


  //an update of inpection with its checks and logs, within a transaction
  static async updateWithChecks(id: string, data: {
    inspectionData: any;
    checksData: any[];
  }) {
    const transaction = await sequelize.transaction();  

    try {
      const inspection = await Inspection.findByPk(id, { transaction });
      if (!inspection) {
        await transaction.rollback();
        return null;
      }

      await inspection.update(data.inspectionData, { transaction });

      // Delete existing checks
      await InspectionCheck.destroy({ where: { inspectionId: id }, transaction });
      // Insert new checks
      const checksToInsert = data.checksData.map((check) => ({
        ...check,
        inspectionId: id,
      }));
      await InspectionCheck.bulkCreate(checksToInsert, { transaction });
      await transaction.commit();
      return inspection;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
  
  static async update(id: string, updatedData: any) {
    const inspection = await Inspection.findByPk(id);
    if (!inspection) return null;
    await inspection.update(updatedData);
    return inspection;
  }

  /**
   * Ajoute un journal d'envoi d'email
   */
  static async logEmail(data: {
    inspectionId: string;
    recipient: string;
    message?: string;
    status: "SUCCESS" | "FAILED";
  }) {
    return EmailLog.create(data);
  }
}