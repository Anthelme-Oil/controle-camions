// lib/db/sequelize.ts
import { Sequelize } from "sequelize";
import mysql2 from "mysql2"; // Force le bundling de mysql2

try {
  if (typeof window === "undefined" && process.env.NODE_ENV !== "test") {
    require("server-only");
  }
} catch {
  // Ignoré dans les scripts CLI
}

const globalForSequelize = globalThis as unknown as { sequelize: Sequelize };

const sequelize =
  globalForSequelize.sequelize ||
  new Sequelize(
    process.env.DB_NAME || "saferoute",
    process.env.DB_USER || (() => { throw new Error("DB_USER non défini dans l'environnement"); })(),
    process.env.DB_PASSWORD ?? "",
    {
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT || 3306),
      dialect: "mysql",
      dialectModule: mysql2,
      logging: false,
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    }
  );

if (process.env.NODE_ENV !== "production") globalForSequelize.sequelize = sequelize;

export default sequelize;