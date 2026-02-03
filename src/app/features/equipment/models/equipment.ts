export enum EquipmentType {
  Chaudiere = 0,
  Radiateur = 1,
  Climatisation = 2,
  PompeAChaleur = 3,
  ChauffeEau = 4,
  Ventilation = 5,
  Autre = 99,
}

export interface EquipmentTypeOption {
  value: EquipmentType;
  name: string;
}

export const EQUIPMENT_TYPE_LABELS: Record<EquipmentType, string> = {
  [EquipmentType.Chaudiere]: 'Chaudière',
  [EquipmentType.Radiateur]: 'Radiateur',
  [EquipmentType.Climatisation]: 'Climatisation',
  [EquipmentType.PompeAChaleur]: 'Pompe à chaleur',
  [EquipmentType.ChauffeEau]: 'Chauffe-eau',
  [EquipmentType.Ventilation]: 'Ventilation',
  [EquipmentType.Autre]: 'Autre',
};

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
