export interface MapMarker {
  id: string;
  type: 'client' | 'intervention';
  lat: number;
  lng: number;
  title: string;
  subtitle?: string;
  status?: number;
  interventionType?: number;
  data: ClientMarkerData | InterventionMarkerData;
}

export interface ClientMarkerData {
  id: string;
  name: string;
  address: string;
  phone?: string;
  email?: string;
  interventionCount: number;
}

export interface InterventionMarkerData {
  id: string;
  clientName: string;
  clientAddress: string;
  technicianName: string | null;
  type: number;
  status: number;
  description: string;
  scheduledDate: string | null;
  scheduledStartTime: string | null;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export const DEFAULT_MAP_CENTER: [number, number] = [45.4765, -75.7013]; // Gatineau/Ottawa
export const DEFAULT_MAP_ZOOM = 7;

export const MARKER_COLORS: Record<number, string> = {
  0: '#f97316', // Pending - orange
  1: '#3b82f6', // Scheduled - blue
  2: '#8b5cf6', // In Progress - purple
  3: '#22c55e', // Completed - green
  4: '#ef4444', // Cancelled - red
};
