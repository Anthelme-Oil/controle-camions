
import { User } from "./User";
import { Inspection } from "./Inspection";
import { InspectionCheck } from "./InspectionCheck";
import { EmailLog } from "./EmailLog";

// Relations User ↔ Inspection
User.hasMany(Inspection, {
  foreignKey: "inspectorId",
  as: "inspections",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Inspection.belongsTo(User, {
  foreignKey: "inspectorId",
  as: "inspector",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

// Relations Inspection ↔ InspectionCheck
Inspection.hasMany(InspectionCheck, {
  foreignKey: "inspectionId",
  as: "checks",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

InspectionCheck.belongsTo(Inspection, {
  foreignKey: "inspectionId",
  as: "inspection",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

// Relations Inspection ↔ EmailLog
Inspection.hasMany(EmailLog, {
  foreignKey: "inspectionId",
  as: "emailLogs",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

EmailLog.belongsTo(Inspection, {
  foreignKey: "inspectionId",
  as: "inspection",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

export { User, Inspection, InspectionCheck, EmailLog };
