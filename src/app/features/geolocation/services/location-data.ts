import { Injectable, inject, signal, OnDestroy } from '@angular/core';
import { Api } from '../../../core/services/api';
import { SignalR } from '../../../core/services/signalr';
import {
  TechnicianLocation,
  UpdateLocationDto,
  RouteOptimizationRequest,
  RouteOptimizationResult,
} from '../models/geolocation';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LocationData implements OnDestroy {
  private api = inject(Api);
  private signalR = inject(SignalR);

  readonly locations = signal<TechnicianLocation[]>([]);
  private connected = false;

  async connect(): Promise<void> {
    if (this.connected) return;

    await this.signalR.start();
    this.connected = true;

    this.signalR.on<TechnicianLocation>('LocationUpdated', (location) => {
      this.locations.update((prev) => {
        const idx = prev.findIndex(
          (l) => l.technicianId === location.technicianId
        );
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = location;
          return updated;
        }
        return [...prev, location];
      });
    });

    this.signalR.on<string>('TechnicianOffline', (technicianId) => {
      this.locations.update((prev) =>
        prev.map((l) =>
          l.technicianId === technicianId ? { ...l, isOnline: false } : l
        )
      );
    });

    this.signalR.on<TechnicianLocation[]>('AllLocations', (allLocations) => {
      this.locations.set(allLocations);
    });
  }

  async disconnect(): Promise<void> {
    if (!this.connected) return;
    this.signalR.off('LocationUpdated');
    this.signalR.off('TechnicianOffline');
    this.signalR.off('AllLocations');
    await this.signalR.stop();
    this.connected = false;
  }

  getAllLocations(): Observable<TechnicianLocation[]> {
    return this.api.get<TechnicianLocation[]>('/location/technicians');
  }

  updateLocation(dto: UpdateLocationDto): Observable<{ message: string }> {
    return this.api.post<{ message: string }>('/location/update', dto);
  }

  getRoute(request: RouteOptimizationRequest): Observable<RouteOptimizationResult> {
    return this.api.post<RouteOptimizationResult>('/location/optimize-route', request);
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
