
import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "@/lib/db/sequelize";

interface InspectionCheckAttributes {
  id: string;
  inspectionId: string;
  reference: string;
  category: string;
  itemText: string;
  isOk: boolean;
  observation?: string;
  photoUrl?: string;
  photoUrls?: string[]; // Ajout du champ photoUrls pour stocker plusieurs URLs de photos
}

interface InspectionCheckCreationAttributes
  extends Optional<InspectionCheckAttributes, "id" | "isOk"> {}

export class InspectionCheck
  extends Model<InspectionCheckAttributes, InspectionCheckCreationAttributes>
  implements InspectionCheckAttributes
{
  declare id: string;
  declare inspectionId: string;
  declare reference: string;
  declare category: string;
  declare itemText: string;
  declare isOk: boolean;
  declare observation?: string;
  declare photoUrl?: string;
  declare photoUrls?: string[]; // Ajout du champ photoUrls pour stocker plusieurs URLs de photos

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

InspectionCheck.init(
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
    reference: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    itemText: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    isOk: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    observation: DataTypes.TEXT,
    photoUrl: DataTypes.TEXT,
    // Dans votre modèle InspectionCheck
photoUrls: {
  type: DataTypes.JSON,
  allowNull: false,
  defaultValue: [],
},
  },
  {
    sequelize,
    tableName: "inspection_checks",
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ["inspection_id", "reference"],
      },
    ],
  }
);
