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

    // Hachage du mot de passe
    const hashedPassword = await bcrypt.hash("password123", 10);

    // Utilisateurs par défaut
    const defaultUsers = [
      {
        email: "admin@saferoute.com",
        name: "Marcel Kouassi",
        password: hashedPassword,
        role: "ADMIN" as const,
      },
      // {
      //   email: "inspecteur@saferoute.com",
      //   name: "Jean Dupont",
      //   password: hashedPassword,
      //   role: "INSPECTOR" as const,
      // },
    ];

    for (const userData of defaultUsers) {
      const [user, created] = await User.findOrCreate({
        where: { email: userData.email },
        defaults: userData,
      });

      if (created) {
        console.log(`✅ Utilisateur créé : ${user.email} (${user.role})`);
      } else {
        console.log(`ℹ️ L'utilisateur ${user.email} existe déjà.`);
      }
    }

    console.log("\n🎉 Seeding terminé avec succès !");
    process.exit(0);
  } catch (error) {
    console.error("❌ Erreur lors de la synchronisation/seeding :", error);
    process.exit(1);
  }
}

seed();