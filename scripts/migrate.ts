
import dotenv from "dotenv";
dotenv.config(); // Charge le fichier .env situé dans le dossier courant
// ... la suite de votre code de migration
import sequelize from "@/lib/db/sequelize";
import "@/models"
import "@/models/Garage";
import "@/models/EmailConfig";
import "@/models/Inspection"; 
import "@/models/InspectionCheck"; // Importe le modèle InspectionCheck pour que Sequelize le reconnaisse
// Importe tous les modèles pour que Sequelize les enregistre

async function runMigration() {
  try {
    await sequelize.authenticate();
    console.log("🔌 Connexion à la base de données réussie.");

    // alter: true met à jour les tables existantes (ajoute les colonnes manquantes comme garageId)
    await sequelize.sync({ alter: true });
    console.log("✅ Migration / Synchronisation des tables (Garages, EmailConfigs, Inspections) effectuée avec succès !");

    process.exit(0);
  } catch (error) {
    console.error("❌ Erreur lors de la migration de la base de données :", error);
    process.exit(1);
  }
}

runMigration();