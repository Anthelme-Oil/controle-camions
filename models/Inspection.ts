
import { DataTypes, Model, Optional } from "sequelize";
import { Garage } from "./Garage";
import { InspectionCheck } from "./InspectionCheck";
import sequelize from "@/lib/db/sequelize";

interface InspectionAttributes {
  id: string;
  region?: string;
  garageId?: string; // <-- Ajout de l'ID du garage
  registration: string;
  inspectorName?: string;
  capacity?: string;
  product?: string;
  manufacturer?: string;
  serviceDate?: Date;
  carrier?: string;
  driver?: string;
  status: "DRAFT" | "VALIDATED" | "ARCHIVED";
  inspectorId: string;
}

interface InspectionCreationAttributes
  extends Optional<InspectionAttributes, "id" | "status"> {}

export class Inspection
  extends Model<InspectionAttributes, InspectionCreationAttributes>
  implements InspectionAttributes
{
  declare id: string;
  declare region?: string;
  declare garageId?: string; // <-- Ajout de l'ID du garage
  declare registration: string;
  declare inspectorName?: string;
  declare capacity?: string;
  declare product?: string;
  declare manufacturer?: string;
  declare serviceDate?: Date;
  declare carrier?: string;
  declare driver?: string;
  declare status: "DRAFT" | "VALIDATED" | "ARCHIVED";
  declare inspectorId: string;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Inspection.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    region: DataTypes.STRING(100),
    garageId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: Garage,
        key: "id",
      },
      onDelete: "SET NULL",
    },
    registration: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    inspectorName: DataTypes.STRING(255),
    capacity: DataTypes.STRING(100),
    product: DataTypes.STRING(100),
    manufacturer: DataTypes.STRING(100),
    serviceDate: DataTypes.DATEONLY,
    carrier: DataTypes.STRING(255),
    driver: DataTypes.STRING(255),
    status: {
      type: DataTypes.ENUM("DRAFT", "VALIDATED", "ARCHIVED"),
      defaultValue: "VALIDATED",
    },
    inspectorId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "inspections",
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ["registration"] },
      { fields: ["inspector_id"] },
    ],
  }
);
Inspection.belongsTo(Garage, { foreignKey: "garageId", as: "garage" });
Garage.hasMany(Inspection, { foreignKey: "garageId", as: "inspections" });

//suppression de l'inspection cascade sur les checks et logs
// Inspection.hasMany(InspectionCheck, { foreignKey: "inspectionId", as: "checks", onDelete: "CASCADE" });
// InspectionCheck.belongsTo(Inspection, { foreignKey: "inspectionId", as: "inspection" });
