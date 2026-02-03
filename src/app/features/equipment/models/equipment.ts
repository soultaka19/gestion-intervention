export type EquipmentTypeName =
  | 'Chaudiere'
  | 'Radiateur'
  | 'Climatisation'
  | 'PompeAChaleur'
  | 'ChauffeEau'
  | 'Ventilation'
  | 'Autre';

export interface EquipmentTypeOption {
  value: EquipmentTypeName;
  label: string;
}

export const EQUIPMENT_TYPES: EquipmentTypeOption[] = [
  { value: 'Chaudiere', label: 'Chaudière' },
  { value: 'Radiateur', label: 'Radiateur' },
  { value: 'Climatisation', label: 'Climatisation' },
  { value: 'PompeAChaleur', label: 'Pompe à chaleur' },
  { value: 'ChauffeEau', label: 'Chauffe-eau' },
  { value: 'Ventilation', label: 'Ventilation' },
  { value: 'Autre', label: 'Autre' },
];

export const EQUIPMENT_TYPE_LABELS: Record<EquipmentTypeName, string> = {
  Chaudiere: 'Chaudière',
  Radiateur: 'Radiateur',
  Climatisation: 'Climatisation',
  PompeAChaleur: 'Pompe à chaleur',
  ChauffeEau: 'Chauffe-eau',
  Ventilation: 'Ventilation',
  Autre: 'Autre',
};

export interface Equipment {
  id: string;
  clientId: string;
  clientName: string;
  type: EquipmentTypeName;
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
  type: EquipmentTypeName;
  brand: string;
  model: string;
  serialNumber: string;
  installationDate?: string | null;
  warrantyEndDate?: string | null;
  notes?: string | null;
}

export interface UpdateEquipment {
  type: EquipmentTypeName;
  brand: string;
  model: string;
  serialNumber: string;
  installationDate?: string | null;
  lastMaintenanceDate?: string | null;
  warrantyEndDate?: string | null;
  notes?: string | null;
}
