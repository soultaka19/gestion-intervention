export interface Technician {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: number;
  isActive: boolean;
  organizationId: string;
  createdAt: string;
}

export interface CreateTechnician {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface UpdateTechnician {
  firstName: string;
  lastName: string;
  role: number;
  isActive: boolean;
}

// Helper pour afficher le nom complet
export function getTechnicianFullName(technician: Technician): string {
  return `${technician.firstName} ${technician.lastName}`;
}
