import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { Api } from '../../../core/services/api';
import {
  Equipment,
  CreateEquipment,
  UpdateEquipment,
  EquipmentTypeOption,
  EquipmentTypeName,
} from '../models/equipment';

export interface EquipmentFilters {
  clientId?: string;
  type?: EquipmentTypeName;
  search?: string;
}

@Injectable({
  providedIn: 'root',
})
export class EquipmentData {
  private api = inject(Api);

  private equipmentsSignal = signal<Equipment[]>([]);
  private loadingSignal = signal(false);
  private selectedEquipmentSignal = signal<Equipment | null>(null);
  private typesSignal = signal<EquipmentTypeOption[]>([]);

  readonly equipments = this.equipmentsSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly selectedEquipment = this.selectedEquipmentSignal.asReadonly();
  readonly types = this.typesSignal.asReadonly();

  readonly equipmentCount = computed(() => this.equipmentsSignal().length);

  getAll(filters?: EquipmentFilters): Observable<Equipment[]> {
    this.loadingSignal.set(true);

    const params = new URLSearchParams();
    if (filters?.clientId) params.append('clientId', filters.clientId);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.search) params.append('search', filters.search);

    const queryString = params.toString();
    const endpoint = queryString ? `/equipments?${queryString}` : '/equipments';

    return this.api.get<Equipment[]>(endpoint).pipe(
      tap({
        next: equipments => {
          this.equipmentsSignal.set(equipments);
          this.loadingSignal.set(false);
        },
        error: () => this.loadingSignal.set(false),
      })
    );
  }

  getById(id: string): Observable<Equipment> {
    this.loadingSignal.set(true);

    return this.api.get<Equipment>(`/equipments/${id}`).pipe(
      tap({
        next: equipment => {
          this.selectedEquipmentSignal.set(equipment);
          this.loadingSignal.set(false);
        },
        error: () => this.loadingSignal.set(false),
      })
    );
  }

  getByClientId(clientId: string): Observable<Equipment[]> {
    this.loadingSignal.set(true);

    return this.api.get<Equipment[]>(`/clients/${clientId}/equipments`).pipe(
      tap({
        next: equipments => {
          this.equipmentsSignal.set(equipments);
          this.loadingSignal.set(false);
        },
        error: () => this.loadingSignal.set(false),
      })
    );
  }

  create(equipment: CreateEquipment): Observable<Equipment> {
    this.loadingSignal.set(true);

    return this.api.post<Equipment>('/equipments', equipment).pipe(
      tap({
        next: newEquipment => {
          this.equipmentsSignal.update(equipments => [...equipments, newEquipment]);
          this.loadingSignal.set(false);
        },
        error: () => this.loadingSignal.set(false),
      })
    );
  }

  update(id: string, equipment: UpdateEquipment): Observable<Equipment> {
    this.loadingSignal.set(true);

    return this.api.put<Equipment>(`/equipments/${id}`, equipment).pipe(
      tap({
        next: updatedEquipment => {
          this.equipmentsSignal.update(equipments =>
            equipments.map(e => (e.id === id ? updatedEquipment : e))
          );
          this.selectedEquipmentSignal.set(updatedEquipment);
          this.loadingSignal.set(false);
        },
        error: () => this.loadingSignal.set(false),
      })
    );
  }

  delete(id: string): Observable<void> {
    this.loadingSignal.set(true);

    return this.api.delete<void>(`/equipments/${id}`).pipe(
      tap({
        next: () => {
          this.equipmentsSignal.update(equipments => equipments.filter(e => e.id !== id));
          if (this.selectedEquipmentSignal()?.id === id) {
            this.selectedEquipmentSignal.set(null);
          }
          this.loadingSignal.set(false);
        },
        error: () => this.loadingSignal.set(false),
      })
    );
  }

  markAsMaintained(id: string): Observable<Equipment> {
    this.loadingSignal.set(true);

    return this.api.patch<Equipment>(`/equipments/${id}/maintenance`).pipe(
      tap({
        next: updatedEquipment => {
          this.equipmentsSignal.update(equipments =>
            equipments.map(e => (e.id === id ? updatedEquipment : e))
          );
          this.selectedEquipmentSignal.set(updatedEquipment);
          this.loadingSignal.set(false);
        },
        error: () => this.loadingSignal.set(false),
      })
    );
  }

  getTypes(): Observable<EquipmentTypeOption[]> {
    return this.api.get<EquipmentTypeOption[]>('/equipments/types').pipe(
      tap(types => this.typesSignal.set(types))
    );
  }

  getWarrantyExpiring(daysAhead: number = 30): Observable<Equipment[]> {
    return this.api.get<Equipment[]>(`/equipments/warranty-expiring?daysAhead=${daysAhead}`);
  }

  getMaintenanceDue(monthsSinceLastMaintenance: number = 12): Observable<Equipment[]> {
    return this.api.get<Equipment[]>(
      `/equipments/maintenance-due?monthsSinceLastMaintenance=${monthsSinceLastMaintenance}`
    );
  }

  clearSelection(): void {
    this.selectedEquipmentSignal.set(null);
  }
}
