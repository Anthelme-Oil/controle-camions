// scripts/seed.ts
import dotenv from "dotenv";
dotenv.config({ path: ".env" });

import sequelize from "../lib/db/sequelize";
import { User, Inspection, InspectionCheck, EmailLog } from "../models";
import bcrypt from "bcryptjs";

async function seed() {
  try {
    console.log("⏳ Connexion à MySQL et création/synchronisation des tables...");

    // Synchronisation explicite de tous les modèles
    await sequelize.sync({ alter: true });
    console.log("✅ Tables (users, inspections, inspection_checks, email_logs) synchronisées !");

    // Hachage des mots de passe
    const hashedPassword1 = await bcrypt.hash("AV_pass@#2026", 10);
    const hashedPassword2 = await bcrypt.hash("password123", 10);

    // Utilisateurs par défaut avec leurs mots de passe hachés respectifs
    const defaultUsers = [
      {
        email: "anthelme.kpodar@togosh.com",
        name: "Anthelme Kpodar",
        password: hashedPassword2,
        role: "ADMIN" as const,
      },
      {
        email: "yawovi.avowlanou@togosh.com",
        name: "Yawovi Avowlanou",
        password: hashedPassword1,
        role: "ADMIN" as const,
      },
    ];

    for (const userData of defaultUsers) {
      // Utilisation de upsert pour forcer la mise à jour si l'utilisateur existe déjà
      const [user, created] = await User.upsert(userData, {
        returning: true,
      });

      console.log(`✅ Utilisateur synchronisé avec succès : ${userData.email} (${userData.role})`);
    }

    console.log("\n🎉 Seeding et mise à jour des mots de passe terminés avec succès !");
    process.exit(0);
  } catch (error) {
    console.error("❌ Erreur lors de la synchronisation/seeding :", error);
    process.exit(1);
  }
}

seed();