export interface Client {
  id: string;
  name: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
  email: string;
  latitude: number;
  longitude: number;
  notes: string;
  equipmentCount: number;
  createdAt: string;
}

export interface CreateClient {
  name: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
  email: string;
  notes?: string;
}

export interface UpdateClient {
  name: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
  email: string;
  notes?: string;
}
