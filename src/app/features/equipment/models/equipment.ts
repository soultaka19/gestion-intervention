export interface EquipmentTypeOption {
  value: number;
  label: string;
}

export const EQUIPMENT_TYPES: EquipmentTypeOption[] = [
  { value: 0, label: 'Chaudière' },
  { value: 1, label: 'Radiateur' },
  { value: 2, label: 'Climatisation' },
  { value: 3, label: 'Pompe à chaleur' },
  { value: 4, label: 'Chauffe-eau' },
  { value: 5, label: 'Ventilation' },
  { value: 99, label: 'Autre' },
];

export const EQUIPMENT_TYPE_LABELS: Record<number, string> = {
  0: 'Chaudière',
  1: 'Radiateur',
  2: 'Climatisation',
  3: 'Pompe à chaleur',
  4: 'Chauffe-eau',
  5: 'Ventilation',
  99: 'Autre',
};

export interface Equipment {
  id: string;
  clientId: string;
  clientName: string;
  type: number;
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
  type: number;
  brand: string;
  model: string;
  serialNumber: string;
  installationDate?: string | null;
  warrantyEndDate?: string | null;
  notes?: string | null;
}

export interface UpdateEquipment {
  type: number;
  brand: string;
  model: string;
  serialNumber: string;
  installationDate?: string | null;
  lastMaintenanceDate?: string | null;
  warrantyEndDate?: string | null;
  notes?: string | null;
}
