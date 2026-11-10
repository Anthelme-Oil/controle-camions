import { User, UserCreationAttributes } from "@/models/User";

export class UserRepository {
  static async findAll() {
    return User.findAll({
      attributes: { exclude: ["password"] },
      order: [["createdAt", "DESC"]],
    });
  }

  static async findById(id: string) {
    return User.findByPk(id, {
      attributes: { exclude: ["password"] },
    });
  }

  static async findByEmail(email: string) {
    return User.findOne({ where: { email } });
  }

  static async create(data: UserCreationAttributes) {
    return User.create(data);
  }

  static async update(
    id: string,
    data: Partial<UserCreationAttributes>
  ) {
    const user = await User.findByPk(id);
    if (!user) return null;

    if (data.email) user.email = data.email;
    if (data.name) user.name = data.name;
    if (data.role) user.role = data.role;
    if (data.password) user.password = data.password;

    await user.save();
    return user;
  }

  static async delete(id: string) {
    const user = await User.findByPk(id);
    if (!user) return false;
    await user.destroy();
    return true;
  }
}