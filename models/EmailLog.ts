
import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "@/lib/db/sequelize";

interface EmailLogAttributes {
  id: string;
  inspectionId: string;
  recipient: string;
  message?: string;
  status: "SUCCESS" | "FAILED";
}

interface EmailLogCreationAttributes
  extends Optional<EmailLogAttributes, "id"> {}

export class EmailLog
  extends Model<EmailLogAttributes, EmailLogCreationAttributes>
  implements EmailLogAttributes
{
  declare id: string;
  declare inspectionId: string;
  declare recipient: string;
  declare message?: string;
  declare status: "SUCCESS" | "FAILED";

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

EmailLog.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    inspectionId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    recipient: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    message: DataTypes.TEXT,
    status: {
      type: DataTypes.ENUM("SUCCESS", "FAILED"),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "email_logs",
    timestamps: true,
    underscored: true,
  }
);
