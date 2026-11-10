
// models/User.ts

import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "@/lib/db/sequelize";
import bcrypt from "bcryptjs";

interface UserAttributes {
  id: string;
  email: string;
  name: string;
  password: string;
  role: "INSPECTOR" | "ADMIN";
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserCreationAttributes
  extends Optional<UserAttributes, "id"> {}

export class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  declare id: string;
  declare email: string;
  declare name: string;
  declare password: string;
  declare role: "INSPECTOR" | "ADMIN";
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  // Vérification du mot de passe
  public async validatePassword(password: string): Promise<boolean> {
    const hashedPassword = this.getDataValue("password");

    if (!hashedPassword) {
      return false;
    }

    return bcrypt.compare(password, hashedPassword);
  }
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("INSPECTOR", "ADMIN"),
      allowNull: false,
      defaultValue: "INSPECTOR",
    },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "users",
    timestamps: true,
    underscored: true,
    hooks: {
      // Hachage avant la création
      beforeCreate: async (user) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      },

      // Hachage avant la mise à jour
      beforeUpdate: async (user) => {
        if (user.changed("password") && user.password) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      },
    },
  }
);
export default User;