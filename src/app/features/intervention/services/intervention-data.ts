import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { Api } from '../../../core/services/api';
import {
  Intervention,
  CreateIntervention,
  UpdateIntervention,
  AssignTechnician,
  CompleteIntervention,
  CancelIntervention,
  InterventionFilters,
  PlanningResponse,
} from '../models/intervention';

@Injectable({
  providedIn: 'root',
})
export class InterventionData {
  private api = inject(Api);

  private interventionsSignal = signal<Intervention[]>([]);
  private loadingSignal = signal(false);
  private selectedInterventionSignal = signal<Intervention | null>(null);

  readonly interventions = this.interventionsSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly selectedIntervention = this.selectedInterventionSignal.asReadonly();

  getAll(filters?: InterventionFilters): Observable<Intervention[]> {
    this.loadingSignal.set(true);

    const params = new URLSearchParams();
    if (filters?.status !== undefined && filters?.status !== null) {
      params.append('status', filters.status.toString());
    }
    if (filters?.technicianId) params.append('technicianId', filters.technicianId);
    if (filters?.clientId) params.append('clientId', filters.clientId);
    if (filters?.fromDate) params.append('fromDate', filters.fromDate);
    if (filters?.toDate) params.append('toDate', filters.toDate);

    const queryString = params.toString();
    const endpoint = queryString ? `/interventions?${queryString}` : '/interventions';

    return this.api.get<Intervention[]>(endpoint).pipe(
      tap({
        next: interventions => {
          this.interventionsSignal.set(interventions);
          this.loadingSignal.set(false);
        },
        error: () => this.loadingSignal.set(false),
      })
    );
  }

  getById(id: string): Observable<Intervention> {
    this.loadingSignal.set(true);

    return this.api.get<Intervention>(`/interventions/${id}`).pipe(
      tap({
        next: intervention => {
          this.selectedInterventionSignal.set(intervention);
          this.loadingSignal.set(false);
        },
        error: () => this.loadingSignal.set(false),
      })
    );
  }

  create(intervention: CreateIntervention): Observable<Intervention> {
    this.loadingSignal.set(true);

    return this.api.post<Intervention>('/interventions', intervention).pipe(
      tap({
        next: newIntervention => {
          this.interventionsSignal.update(list => [...list, newIntervention]);
          this.loadingSignal.set(false);
        },
        error: () => this.loadingSignal.set(false),
      })
    );
  }

  update(id: string, intervention: UpdateIntervention): Observable<Intervention> {
    this.loadingSignal.set(true);

    return this.api.put<Intervention>(`/interventions/${id}`, intervention).pipe(
      tap({
        next: updated => {
          this.interventionsSignal.update(list =>
            list.map(i => (i.id === id ? updated : i))
          );
          this.selectedInterventionSignal.set(updated);
          this.loadingSignal.set(false);
        },
        error: () => this.loadingSignal.set(false),
      })
    );
  }

  delete(id: string): Observable<void> {
    this.loadingSignal.set(true);

    return this.api.delete<void>(`/interventions/${id}`).pipe(
      tap({
        next: () => {
          this.interventionsSignal.update(list => list.filter(i => i.id !== id));
          if (this.selectedInterventionSignal()?.id === id) {
            this.selectedInterventionSignal.set(null);
          }
          this.loadingSignal.set(false);
        },
        error: () => this.loadingSignal.set(false),
      })
    );
  }

  assign(id: string, data: AssignTechnician): Observable<Intervention> {
    this.loadingSignal.set(true);

    return this.api.post<Intervention>(`/interventions/${id}/assign`, data).pipe(
      tap({
        next: updated => {
          this.interventionsSignal.update(list =>
            list.map(i => (i.id === id ? updated : i))
          );
          this.selectedInterventionSignal.set(updated);
          this.loadingSignal.set(false);
        },
        error: () => this.loadingSignal.set(false),
      })
    );
  }

  start(id: string): Observable<Intervention> {
    this.loadingSignal.set(true);

    return this.api.post<Intervention>(`/interventions/${id}/start`, {}).pipe(
      tap({
        next: updated => {
          this.interventionsSignal.update(list =>
            list.map(i => (i.id === id ? updated : i))
          );
          this.selectedInterventionSignal.set(updated);
          this.loadingSignal.set(false);
        },
        error: () => this.loadingSignal.set(false),
      })
    );
  }

  complete(id: string, data: CompleteIntervention): Observable<Intervention> {
    this.loadingSignal.set(true);

    return this.api.post<Intervention>(`/interventions/${id}/complete`, data).pipe(
      tap({
        next: updated => {
          this.interventionsSignal.update(list =>
            list.map(i => (i.id === id ? updated : i))
          );
          this.selectedInterventionSignal.set(updated);
          this.loadingSignal.set(false);
        },
        error: () => this.loadingSignal.set(false),
      })
    );
  }

  cancel(id: string, data?: CancelIntervention): Observable<Intervention> {
    this.loadingSignal.set(true);

    return this.api.post<Intervention>(`/interventions/${id}/cancel`, data || {}).pipe(
      tap({
        next: updated => {
          this.interventionsSignal.update(list =>
            list.map(i => (i.id === id ? updated : i))
          );
          this.selectedInterventionSignal.set(updated);
          this.loadingSignal.set(false);
        },
        error: () => this.loadingSignal.set(false),
      })
    );
  }

  getPlanning(startDate: string, endDate: string, technicianId?: string): Observable<PlanningResponse> {
    const params = new URLSearchParams();
    params.append('startDate', startDate);
    params.append('endDate', endDate);
    if (technicianId) params.append('technicianId', technicianId);

    return this.api.get<PlanningResponse>(`/interventions/planning?${params.toString()}`);
  }

  getMyInterventions(date?: string, status?: number): Observable<Intervention[]> {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    if (status !== undefined && status !== null) params.append('status', status.toString());

    const queryString = params.toString();
    const endpoint = queryString
      ? `/interventions/my-interventions?${queryString}`
      : '/interventions/my-interventions';

    return this.api.get<Intervention[]>(endpoint);
  }

  clearSelection(): void {
    this.selectedInterventionSignal.set(null);
  }
}
