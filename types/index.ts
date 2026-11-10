export interface Garage {
  id:string;
  name?: string;
  location?: string;
  emails: string[]; // Stocké sous forme de tableau JSON en BDD

}
export interface CheckSubItem {
  id: string;
  reference: string;
  text: string;
}

export interface CheckCategory {
  title: string;
  items: CheckSubItem[];
}

export interface CheckState {
  ok: boolean;
  observation: string;
  photo?: string;
  photoUrls?: string[]; // Ajout du champ photoUrls pour stocker plusieurs URLs de photos
}

export type CheckStatesMap = Record<string, CheckState>;

export interface VehicleInfo {
  region: string;
  registration: string;
  inspector: string;
  date: string;
  capacity: string;
  product: string;
  manufacturer: string;
  serviceDate: string;
  carrier: string;
  driver: string;
  garageId?: string;
  garage?:Garage;
}


export interface InspectionCheckData {
  id?: string;
  inspectionId?: string;
  reference: string;
  category: string;
  itemText: string;
  isOk: boolean;
  observation?: string;
  photoUrl?: string;
}

export interface InspectionData {
  id: string;
  region?: string;
  registration: string;
  inspectorName?: string;
  capacity?: string;
  product?: string;
  manufacturer?: string;
  serviceDate?: string;
  carrier?: string;
  driver?: string;
  status: "VALIDATED" | "DRAFT" | "ARCHIVED";
  inspectorId?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  inspector?: {
    id: string;
    name: string;
    email: string;
  };
  checks?: InspectionCheckData[]; // <-- Ajout de la relation
}