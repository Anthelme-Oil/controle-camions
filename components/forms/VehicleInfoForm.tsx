"use client";

import { useEffect, useState } from "react";
import { VehicleInfo } from "@/types";
import { GarageClientService, GarageDTO } from "@/lib/client/garage.service";
import { Building2 } from "lucide-react";

interface VehicleInfoFormProps {
  info: VehicleInfo ;
  onChange: (key: keyof VehicleInfo, value: string) => void;
}

export function VehicleInfoForm({ info, onChange }: VehicleInfoFormProps) {
  const [garages, setGarages] = useState<GarageDTO[]>([]);

  useEffect(() => {
    GarageClientService.getAll().then(setGarages).catch(console.error);
  }, []);

  const handleGarageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    const selectedGarage = garages.find((g) => g.id === selectedId);

    // On met à jour le garageId et on enregistre proprement le nom du garage (ou sa localité)
    onChange("garageId", selectedId);
    onChange("region", selectedGarage ? selectedGarage.name || selectedGarage.location || "Garage" : "");
  };

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {/* Sélection du Garage (Remplace la Région) */}
      <label className="flex flex-col gap-2 text-sm font-bold text-slate-700">
        <span className="flex items-center gap-2">
          <Building2 className="size-4 text-orange-500" />
          Garage d'inspection <span className="text-orange-500">*</span>
        </span>
        <select
          value={(info as any).garageId || ""}
          onChange={handleGarageChange}
          className="h-12 rounded-xl border border-slate-200 bg-white px-4 font-normal outline-none focus:border-[#2670bb] focus:ring-4 focus:ring-blue-500/10"
        >
          <option value="">-- Sélectionner un garage --</option>
          {garages.map((garage) => (
            <option key={garage.id} value={garage.id}>
              {garage.name ? `${garage.name} (${garage.location || "Lieu non spécifié"})` : `Garage (${garage.emails[0] || garage.id})`}
            </option>
          ))}
        </select>
      </label>

      {/* Immatriculation véhicule */}
      <label className="flex flex-col gap-2 text-sm font-bold text-slate-700">
        Immatriculation véhicule
        <input
          type="text"
          value={info.registration}
          onChange={(e) => onChange("registration", e.target.value)}
          placeholder="Ex: 199578BK-22"
          className="h-12 rounded-xl border border-slate-200 px-4 font-normal outline-none focus:border-[#2670bb] focus:ring-4 focus:ring-blue-500/10"
        />
      </label>

      {/* Date du contrôle */}
      <label className="flex flex-col gap-2 text-sm font-bold text-slate-700">
        Date du contrôle
        <input
          type="date"
          value={info.date}
          onChange={(e) => onChange("date", e.target.value)}
          className="h-12 rounded-xl border border-slate-200 px-4 font-normal outline-none focus:border-[#2670bb] focus:ring-4 focus:ring-blue-500/10"
        />
      </label>

      {/* Capacité citerne */}
      <label className="flex flex-col gap-2 text-sm font-bold text-slate-700">
        Capacité citerne (L)
        <input
          type="text"
          value={info.capacity}
          onChange={(e) => onChange("capacity", e.target.value)}
          placeholder="Ex: 38000"
          className="h-12 rounded-xl border border-slate-200 px-4 font-normal outline-none focus:border-[#2670bb] focus:ring-4 focus:ring-blue-500/10"
        />
      </label>

      {/* Produit transporté */}
      <label className="flex flex-col gap-2 text-sm font-bold text-slate-700">
        Produit transporté
        <input
          type="text"
          value={info.product}
          onChange={(e) => onChange("product", e.target.value)}
          placeholder="Ex: Super / Gasoil"
          className="h-12 rounded-xl border border-slate-200 px-4 font-normal outline-none focus:border-[#2670bb] focus:ring-4 focus:ring-blue-500/10"
        />
      </label>

      {/* Date de première mise en service */}
      <label className="flex flex-col gap-2 text-sm font-bold text-slate-700">
        Date de première mise en service
        <input
          type="date"
          value={info.serviceDate}
          onChange={(e) => onChange("serviceDate", e.target.value)}
          className="h-12 rounded-xl border border-slate-200 px-4 font-normal outline-none focus:border-[#2670bb] focus:ring-4 focus:ring-blue-500/10"
        />
      </label>
    </div>
  );
}