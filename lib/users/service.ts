import { UserRepository } from "./repository";

export class UserService {
  static async getAllUsers() {
    return UserRepository.findAll();
  }

  static async getUserById(id: string) {
    const user = await UserRepository.findById(id);
    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }
    return user;
  }

 static async createUser(data: {
    email: string;
    name: string;
    password?: string;
    role?: "INSPECTOR" | "ADMIN";
  }) {
    if (!data.email || !data.name) {
      throw new Error("MISSING_FIELDS");
    }

    // Sécurisation : mot de passe requis pour la création
    const password = data.password || "password123";

    const user = await UserRepository.create({
      email: data.email,
      name: data.name,
      password,
      role: data.role || "INSPECTOR",
    });

    return user;
  }

  static async updateUser(
    id: string,
    data: { email?: string; name?: string; role?: "INSPECTOR" | "ADMIN"; password?: string }
  ) {
    const updatedUser = await UserRepository.update(id, data);
    if (!updatedUser) {
      throw new Error("USER_NOT_FOUND");
    }

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role,
    };
  }

  static async deleteUser(id: string) {
    const success = await UserRepository.delete(id);
    if (!success) {
      throw new Error("USER_NOT_FOUND");
    }
    return true;
  }

  static async authenticate(email: string, password?: string) {
    if (!email || !password) {
      throw new Error("MISSING_CREDENTIALS");
    }

    const user = await UserRepository.findByEmail(email);
    if (!user) {
      throw new Error("INVALID_CREDENTIALS");
    }

    const isValid = await user.validatePassword(password);
    console.log(user,"isValid", isValid, "user.password", user.password, "password", password);
    if (!isValid) {
      throw new Error("INVALID_CREDENTIALS");
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }
}