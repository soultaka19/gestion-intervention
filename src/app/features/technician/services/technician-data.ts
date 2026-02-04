import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { Api } from '../../../core/services/api';
import { Technician, CreateTechnician, UpdateTechnician } from '../models/technician';

@Injectable({
  providedIn: 'root',
})
export class TechnicianData {
  private api = inject(Api);

  private techniciansSignal = signal<Technician[]>([]);
  private loadingSignal = signal(false);

  readonly technicians = this.techniciansSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();

  getAll(activeOnly: boolean = true): Observable<Technician[]> {
    this.loadingSignal.set(true);

    const endpoint = `/technicians?activeOnly=${activeOnly}`;

    return this.api.get<Technician[]>(endpoint).pipe(
      tap({
        next: technicians => {
          this.techniciansSignal.set(technicians);
          this.loadingSignal.set(false);
        },
        error: () => this.loadingSignal.set(false),
      })
    );
  }

  getById(id: string): Observable<Technician> {
    return this.api.get<Technician>(`/technicians/${id}`);
  }

  create(technician: CreateTechnician): Observable<Technician> {
    this.loadingSignal.set(true);

    return this.api.post<Technician>('/technicians', technician).pipe(
      tap({
        next: newTechnician => {
          this.techniciansSignal.update(list => [...list, newTechnician]);
          this.loadingSignal.set(false);
        },
        error: () => this.loadingSignal.set(false),
      })
    );
  }

  update(id: string, technician: UpdateTechnician): Observable<Technician> {
    this.loadingSignal.set(true);

    return this.api.put<Technician>(`/technicians/${id}`, technician).pipe(
      tap({
        next: updated => {
          this.techniciansSignal.update(list =>
            list.map(t => (t.id === id ? updated : t))
          );
          this.loadingSignal.set(false);
        },
        error: () => this.loadingSignal.set(false),
      })
    );
  }

  delete(id: string): Observable<void> {
    this.loadingSignal.set(true);

    return this.api.delete<void>(`/technicians/${id}`).pipe(
      tap({
        next: () => {
          this.techniciansSignal.update(list =>
            list.map(t => (t.id === id ? { ...t, isActive: false } : t))
          );
          this.loadingSignal.set(false);
        },
        error: () => this.loadingSignal.set(false),
      })
    );
  }
}
