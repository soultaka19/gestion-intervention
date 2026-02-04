// Statuts d'intervention
export const INTERVENTION_STATUSES = [
  { value: 0, name: 'Pending', label: 'En attente' },
  { value: 1, name: 'Scheduled', label: 'Planifiée' },
  { value: 2, name: 'InProgress', label: 'En cours' },
  { value: 3, name: 'Completed', label: 'Terminée' },
  { value: 4, name: 'Cancelled', label: 'Annulée' },
];

export const INTERVENTION_STATUS_LABELS: Record<number, string> = {
  0: 'En attente',
  1: 'Planifiée',
  2: 'En cours',
  3: 'Terminée',
  4: 'Annulée',
};

// Types d'intervention
export const INTERVENTION_TYPES = [
  { value: 0, label: 'Maintenance' },
  { value: 1, label: 'Réparation' },
  { value: 2, label: 'Installation' },
  { value: 3, label: 'Inspection' },
  { value: 4, label: 'Urgence' },
];

export const INTERVENTION_TYPE_LABELS: Record<number, string> = {
  0: 'Maintenance',
  1: 'Réparation',
  2: 'Installation',
  3: 'Inspection',
  4: 'Urgence',
};

export interface Intervention {
  id: string;
  clientId: string;
  clientName: string;
  clientAddress: string;
  clientPhone?: string;
  clientLatitude?: number;
  clientLongitude?: number;
  equipmentId: string | null;
  equipmentInfo: string | null;
  equipmentType?: number;
  equipmentBrand?: string;
  equipmentModel?: string;
  technicianId: string | null;
  technicianName: string | null;
  technicianEmail?: string;
  type: number;
  status: number;
  description: string;
  scheduledDate: string | null;
  scheduledStartTime: string | null;
  scheduledEndTime: string | null;
  estimatedDurationMinutes: number | null;
  startedAt: string | null;
  completedAt: string | null;
  notes: string | null;
  technicianNotes?: string | null;
  report?: InterventionReport | null;
  createdAt: string;
  updatedAt?: string | null;
}

export interface InterventionReport {
  checklist?: ChecklistItem[];
  photos?: Photo[];
  clientSignature?: ClientSignature;
  partsUsed?: PartUsed[];
  measurements?: Record<string, string>;
  technicianComments?: string;
  recommendations?: string;
}

export interface ChecklistItem {
  item: string;
  checked: boolean;
  notes?: string;
}

export interface Photo {
  url: string;
  description?: string;
  takenAt?: string;
}

export interface ClientSignature {
  signatureData: string;
  signedAt: string;
  signerName: string;
}

export interface PartUsed {
  partNumber: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateIntervention {
  clientId: string;
  equipmentId?: string | null;
  type: number;
  description: string;
  notes?: string | null;
}

export interface UpdateIntervention {
  equipmentId?: string | null;
  type: number;
  description: string;
  estimatedDurationMinutes?: number | null;
  notes?: string | null;
}

export interface AssignTechnician {
  technicianId: string;
  scheduledDate: string;
  scheduledStartTime: string;
  scheduledEndTime: string;
}

export interface CompleteIntervention {
  technicianNotes?: string;
  report?: InterventionReport;
}

export interface CancelIntervention {
  reason?: string;
}

export interface InterventionFilters {
  status?: number;
  technicianId?: string;
  clientId?: string;
  fromDate?: string;
  toDate?: string;
}

export interface PlanningResponse {
  startDate: string;
  endDate: string;
  interventions: Intervention[];
  totalCount: number;
}
