import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { Api } from '../../../core/services/api';
import { Client, CreateClient, UpdateClient } from '../models/client';

@Injectable({
  providedIn: 'root',
})
export class ClientData {
  private api = inject(Api);

  private clientsSignal = signal<Client[]>([]);
  private loadingSignal = signal(false);
  private selectedClientSignal = signal<Client | null>(null);

  readonly clients = this.clientsSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly selectedClient = this.selectedClientSignal.asReadonly();

  readonly clientCount = computed(() => this.clientsSignal().length);

  getAll(search?: string): Observable<Client[]> {
    this.loadingSignal.set(true);
    const endpoint = search ? `/clients?search=${encodeURIComponent(search)}` : '/clients';

    return this.api.get<Client[]>(endpoint).pipe(
      tap({
        next: clients => {
          this.clientsSignal.set(clients);
          this.loadingSignal.set(false);
        },
        error: () => this.loadingSignal.set(false),
      })
    );
  }

  getById(id: string): Observable<Client> {
    this.loadingSignal.set(true);

    return this.api.get<Client>(`/clients/${id}`).pipe(
      tap({
        next: client => {
          this.selectedClientSignal.set(client);
          this.loadingSignal.set(false);
        },
        error: () => this.loadingSignal.set(false),
      })
    );
  }

  create(client: CreateClient): Observable<Client> {
    this.loadingSignal.set(true);

    return this.api.post<Client>('/clients', client).pipe(
      tap({
        next: newClient => {
          this.clientsSignal.update(clients => [...clients, newClient]);
          this.loadingSignal.set(false);
        },
        error: () => this.loadingSignal.set(false),
      })
    );
  }

  update(id: string, client: UpdateClient): Observable<Client> {
    this.loadingSignal.set(true);

    return this.api.put<Client>(`/clients/${id}`, client).pipe(
      tap({
        next: updatedClient => {
          this.clientsSignal.update(clients =>
            clients.map(c => (c.id === id ? updatedClient : c))
          );
          this.selectedClientSignal.set(updatedClient);
          this.loadingSignal.set(false);
        },
        error: () => this.loadingSignal.set(false),
      })
    );
  }

  delete(id: string): Observable<void> {
    this.loadingSignal.set(true);

    return this.api.delete<void>(`/clients/${id}`).pipe(
      tap({
        next: () => {
          this.clientsSignal.update(clients => clients.filter(c => c.id !== id));
          if (this.selectedClientSignal()?.id === id) {
            this.selectedClientSignal.set(null);
          }
          this.loadingSignal.set(false);
        },
        error: () => this.loadingSignal.set(false),
      })
    );
  }

  clearSelection(): void {
    this.selectedClientSignal.set(null);
  }
}
