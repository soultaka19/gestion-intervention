import { Injectable, inject, signal } from '@angular/core';
import { LocationData } from './location-data';
import { TechnicianLocation } from '../models/geolocation';

@Injectable({
  providedIn: 'root',
})
export class SimulationService {
  private locationData = inject(LocationData);

  readonly running = signal(false);
  readonly progress = signal(0); // 0-100%
  private intervalId: ReturnType<typeof setInterval> | null = null;

  /**
   * Start simulation along a list of route points.
   * The technician moves to the next point every `intervalMs` milliseconds.
   */
  startAlongRoute(
    technicianId: string,
    routePoints: [number, number][],
    intervalMs = 20000
  ): void {
    this.stop();

    if (routePoints.length < 2) return;

    let currentIndex = 0;
    this.running.set(true);
    this.progress.set(0);

    // Send initial position immediately
    const [lat, lng] = routePoints[0];
    this.updateAndBroadcast(technicianId, lat, lng, 0, 0);

    this.intervalId = setInterval(() => {
      currentIndex++;

      if (currentIndex >= routePoints.length) {
        this.stop();
        return;
      }

      const [lat, lng] = routePoints[currentIndex];
      const [prevLat, prevLng] = routePoints[currentIndex - 1];

      // Calculate heading from previous point
      const heading = Math.atan2(lng - prevLng, lat - prevLat) * (180 / Math.PI);
      // Estimate speed based on distance / interval
      const distKm = this.haversine(prevLat, prevLng, lat, lng);
      const speed = Math.min((distKm / (intervalMs / 1000)) * 3600, 80); // km/h

      this.updateAndBroadcast(technicianId, lat, lng, speed, heading);

      this.progress.set(Math.round((currentIndex / (routePoints.length - 1)) * 100));
    }, intervalMs);
  }

  stop(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.running.set(false);
    this.progress.set(0);
  }

  /**
   * Optimistically update the local locations signal AND send to backend.
   * This way the marker moves immediately without waiting for SignalR roundtrip.
   */
  private updateAndBroadcast(
    technicianId: string,
    lat: number,
    lng: number,
    speed: number,
    heading: number
  ): void {
    // Optimistic local update — marker moves immediately
    this.locationData.locations.update((prev) => {
      const existing = prev.find((l) => l.technicianId === technicianId);
      const updated: TechnicianLocation = {
        technicianId,
        technicianName: existing?.technicianName ?? 'Technicien',
        latitude: lat,
        longitude: lng,
        accuracy: null,
        speed,
        heading,
        timestamp: new Date().toISOString(),
        isOnline: true,
      };

      const idx = prev.findIndex((l) => l.technicianId === technicianId);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = updated;
        return copy;
      }
      return [...prev, updated];
    });

    // Also send to backend for persistence / other clients
    this.locationData.updateLocation({
      latitude: lat,
      longitude: lng,
      speed,
      heading,
      technicianId,
    }).subscribe({
      error: (err) => console.warn('[Simulation] Failed to send location to server:', err.status),
    });
  }

  private haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
}
