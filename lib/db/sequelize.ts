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

// Pendant le build Next.js, on évite de bloquer si les variables ne sont pas encore injectées
const dbUser = process.env.DB_USER || (process.env.NODE_ENV === "production" ? "toiladmin" : "root");
const dbPassword = process.env.DB_PASSWORD ?? "T@gosh2026";
const dbName = process.env.DB_NAME || "saferoute";

const sequelize =
  globalForSequelize.sequelize ||
  new Sequelize(
    dbName,
    dbUser,
    dbPassword,
    {
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT || 3306),
      dialect: "mysql",
      dialectModule: mysql2, // Injection directe du pilote MySQL
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