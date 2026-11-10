import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "@/lib/db/sequelize";

interface EmailConfigAttributes {
  id: string;
  ccEmails: string[];
}

interface EmailConfigCreationAttributes extends Optional<EmailConfigAttributes, "id"> {}

export class EmailConfig
  extends Model<EmailConfigAttributes, EmailConfigCreationAttributes>
  implements EmailConfigAttributes
{
  declare id: string;
  declare ccEmails: string[];
  declare readonly updatedAt: Date;
}

EmailConfig.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    ccEmails: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
  },
  {
    sequelize,
    tableName: "email_configs",
    timestamps: true,
    underscored: true,
  }
);