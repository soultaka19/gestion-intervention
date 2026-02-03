export type EquipmentType =
  | 'Chaudiere'
  | 'Radiateur'
  | 'Climatisation'
  | 'PompeAChaleur'
  | 'ChauffeEau'
  | 'Ventilation'
  | 'Autre';

export interface EquipmentTypeOption {
  value: number;
  name: EquipmentType;
}

export interface Equipment {
  id: string;
  clientId: string;
  clientName: string;
  type: EquipmentType;
  brand: string;
  model: string;
  serialNumber: string;
  installationDate: string | null;
  lastMaintenanceDate: string | null;
  warrantyEndDate: string | null;
  notes: string | null;
  createdAt: string;
}

export interface CreateEquipment {
  clientId: string;
  type: EquipmentType;
  brand: string;
  model: string;
  serialNumber: string;
  installationDate?: string | null;
  warrantyEndDate?: string | null;
  notes?: string | null;
}

export interface UpdateEquipment {
  type: EquipmentType;
  brand: string;
  model: string;
  serialNumber: string;
  installationDate?: string | null;
  lastMaintenanceDate?: string | null;
  warrantyEndDate?: string | null;
  notes?: string | null;
}
