import { Injectable, inject, signal } from '@angular/core';
import { LocationData } from './location-data';

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
    this.locationData.updateLocation({
      latitude: lat,
      longitude: lng,
      speed: 0,
      heading: 0,
      technicianId,
    }).subscribe();

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
      const speed = (distKm / (intervalMs / 1000)) * 3600; // km/h

      this.locationData.updateLocation({
        latitude: lat,
        longitude: lng,
        speed: Math.min(speed, 80),
        heading,
        technicianId,
      }).subscribe();

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
