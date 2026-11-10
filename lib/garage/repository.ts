import { Garage } from "@/models/Garage";
import { EmailConfig } from "@/models/EmailConfig"

export const GarageRepository = {
  async findAll() {
    return Garage.findAll({ order: [["createdAt", "DESC"]] });
  },

  async findById(id: string) {
    return Garage.findByPk(id);
  },

  async create(data: { name?: string; location?: string; emails: string[] }) {
    return Garage.create(data);
  },

  async update(id: string, data: { name?: string; location?: string; emails: string[] }) {
    const garage = await Garage.findByPk(id);
    if (!garage) throw new Error("Garage non trouvé");
    return garage.update(data);
  },

  async delete(id: string) {
    const garage = await Garage.findByPk(id);
    if (!garage) throw new Error("Garage non trouvé");
    return garage.destroy();
  },
};

export const ConfigRepository = {
  async getConfig() {
    let config = await EmailConfig.findOne();
    if (!config) {
      config = await EmailConfig.create({ ccEmails: [] });
    }
    return config;
  },

  async updateConfig(ccEmails: string[]) {
    let config = await EmailConfig.findOne();
    if (!config) {
      return EmailConfig.create({ ccEmails });
    }
    return config.update({ ccEmails });
  },
};