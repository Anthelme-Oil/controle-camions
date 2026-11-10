import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "@/lib/db/sequelize";

interface GarageAttributes {
  id: string;
  name?: string;
  location?: string;
  emails: string[]; // Stocké sous forme de tableau JSON en BDD
}

interface GarageCreationAttributes extends Optional<GarageAttributes, "id"> {}

export class Garage
  extends Model<GarageAttributes, GarageCreationAttributes>
  implements GarageAttributes
{
  declare id: string;
  declare name?: string;
  declare location?: string;
  declare emails: string[];

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Garage.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: DataTypes.STRING(255),
    location: DataTypes.STRING(255),
    emails: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
  },
  {
    sequelize,
    tableName: "garages",
    timestamps: true,
    underscored: true,
  }
);