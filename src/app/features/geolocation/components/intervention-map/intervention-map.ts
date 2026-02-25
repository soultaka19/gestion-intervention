import {
  Component,
  inject,
  OnInit,
  OnDestroy,
  signal,
  computed,
  effect,
  ElementRef,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import * as L from 'leaflet';
import { InterventionData } from '../../../intervention/services/intervention-data';
import { ClientData } from '../../../client/services/client-data';
import { TechnicianData } from '../../../technician/services/technician-data';
import { LocationData } from '../../services/location-data';
import { SimulationService } from '../../services/simulation';
import {
  Intervention,
  INTERVENTION_STATUSES,
  INTERVENTION_STATUS_LABELS,
  INTERVENTION_TYPE_LABELS,
} from '../../../intervention/models/intervention';
import { Client } from '../../../client/models/client';
import { Technician } from '../../../technician/models/technician';
import {
  MapMarker,
  TechnicianLocation,
  DEFAULT_MAP_CENTER,
  DEFAULT_MAP_ZOOM,
  MARKER_COLORS,
} from '../../models/geolocation';

// Fix Leaflet default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

@Component({
  selector: 'app-intervention-map',
  standalone: true,
  imports: [
    FormsModule,
    ButtonModule,
    SelectModule,
    CheckboxModule,
    TagModule,
    ToastModule,
  ],
  providers: [MessageService],
  template: `
    <p-toast />

    <div class="p-4 h-full flex flex-col">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Carte des interventions</h1>
          <p class="text-gray-500 mt-1">Visualisez les interventions et techniciens en temps réel</p>
        </div>

        <div class="flex items-center gap-2">
          <p-button
            icon="pi pi-refresh"
            [rounded]="true"
            severity="secondary"
            [outlined]="true"
            pTooltip="Actualiser"
            (onClick)="loadData()"
          />
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
        <div class="flex flex-wrap items-center gap-4">
          <!-- Status filter -->
          <div class="w-48">
            <p-select
              [options]="statusOptions"
              [(ngModel)]="selectedStatus"
              placeholder="Tous les statuts"
              optionLabel="label"
              optionValue="value"
              [showClear]="true"
              styleClass="w-full"
              (onChange)="applyFilters()"
            />
          </div>

          <!-- Show clients toggle -->
          <div class="flex items-center gap-2">
            <p-checkbox
              [(ngModel)]="showClients"
              [binary]="true"
              inputId="showClients"
              (onChange)="applyFilters()"
            />
            <label for="showClients" class="text-sm text-gray-700 cursor-pointer">
              Clients
            </label>
          </div>

          <!-- Show interventions toggle -->
          <div class="flex items-center gap-2">
            <p-checkbox
              [(ngModel)]="showInterventions"
              [binary]="true"
              inputId="showInterventions"
              (onChange)="applyFilters()"
            />
            <label for="showInterventions" class="text-sm text-gray-700 cursor-pointer">
              Interventions
            </label>
          </div>

          <!-- Show technicians toggle -->
          <div class="flex items-center gap-2">
            <p-checkbox
              [(ngModel)]="showTechnicians"
              [binary]="true"
              inputId="showTechnicians"
              (onChange)="toggleTechnicianLayer()"
            />
            <label for="showTechnicians" class="text-sm text-gray-700 cursor-pointer">
              Techniciens en direct
            </label>
          </div>

          <!-- Stats -->
          <div class="ml-auto flex items-center gap-4 text-sm text-gray-600">
            <span>
              <i class="pi pi-map-marker text-blue-500 mr-1"></i>
              {{ visibleMarkers().length }} marqueurs
            </span>
            @if (showTechnicians) {
              <span>
                <i class="pi pi-user text-green-500 mr-1"></i>
                {{ locationData.locations().length }} technicien(s)
              </span>
            }
          </div>
        </div>
      </div>

      <!-- Simulation controls -->
      @if (showTechnicians) {
        <div class="bg-amber-50 rounded-lg shadow-sm border border-amber-200 p-4 mb-4">
          <div class="flex flex-wrap items-center gap-4">
            <span class="text-sm font-medium text-amber-800">
              <i class="pi pi-bolt mr-1"></i> Simulation
            </span>

            <div class="w-56">
              <p-select
                [options]="technicianOptions()"
                [(ngModel)]="selectedTechnicianId"
                placeholder="Choisir un technicien"
                optionLabel="label"
                optionValue="value"
                [showClear]="true"
                styleClass="w-full"
              />
            </div>

            @if (!simulation.running()) {
              <p-button
                icon="pi pi-play"
                label="Simuler"
                severity="warn"
                size="small"
                [disabled]="!selectedTechnicianId || loadingRoute"
                (onClick)="startSimulation()"
              />
              @if (loadingRoute) {
                <span class="text-sm text-amber-700 animate-pulse">
                  <i class="pi pi-spin pi-spinner mr-1"></i> Calcul de l'itinéraire...
                </span>
              }
            } @else {
              <p-button
                icon="pi pi-stop"
                label="Arrêter"
                severity="danger"
                size="small"
                (onClick)="stopSimulation()"
              />
              <span class="text-sm text-amber-700 animate-pulse">
                <i class="pi pi-spin pi-spinner mr-1"></i>
                En route... {{ simulation.progress() }}%
              </span>
            }
          </div>
        </div>
      }

      <!-- Map container -->
      <div class="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden" style="min-height: 70vh;">
        <div #mapContainer class="w-full h-full"></div>
      </div>

      <!-- Legend -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mt-4">
        <h3 class="text-sm font-medium text-gray-700 mb-3">Légende</h3>
        <div class="flex flex-wrap gap-4">
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full bg-orange-500"></div>
            <span class="text-sm text-gray-600">En attente</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full bg-blue-500"></div>
            <span class="text-sm text-gray-600">Planifiée</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full bg-purple-500"></div>
            <span class="text-sm text-gray-600">En cours</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full bg-green-500"></div>
            <span class="text-sm text-gray-600">Terminée</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 bg-gray-400 rounded-sm"></div>
            <span class="text-sm text-gray-600">Client</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full bg-teal-500 border-2 border-white shadow"></div>
            <span class="text-sm text-gray-600">Technicien (temps réel)</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: calc(100vh - 64px);
    }
  `],
})
export class InterventionMap implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapContainer') mapContainer!: ElementRef<HTMLDivElement>;

  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private interventionData = inject(InterventionData);
  private clientData = inject(ClientData);
  private technicianData = inject(TechnicianData);
  private messageService = inject(MessageService);

  locationData = inject(LocationData);
  simulation = inject(SimulationService);

  private map: L.Map | null = null;
  private markersLayer: L.LayerGroup | null = null;
  private technicianMarkersLayer: L.LayerGroup | null = null;
  private routePolyline: L.Polyline | null = null;

  interventions = signal<Intervention[]>([]);
  clients = signal<Client[]>([]);
  technicians = signal<Technician[]>([]);
  loading = signal(false);

  selectedStatus: number | null = null;
  showClients = true;
  showInterventions = true;
  showTechnicians = false;
  selectedTechnicianId: string | null = null;
  loadingRoute = false;

  statusOptions = INTERVENTION_STATUSES;

  technicianOptions = computed(() =>
    this.technicians().map(t => ({
      label: `${t.firstName} ${t.lastName}`,
      value: t.id,
    }))
  );

  allMarkers = computed<MapMarker[]>(() => {
    const markers: MapMarker[] = [];

    // Add client markers
    if (this.showClients) {
      this.clients().forEach(client => {
        if (client.latitude && client.longitude) {
          markers.push({
            id: `client-${client.id}`,
            type: 'client',
            lat: client.latitude,
            lng: client.longitude,
            title: client.name,
            subtitle: client.address,
            data: {
              id: client.id,
              name: client.name,
              address: client.address,
              phone: client.phone,
              email: client.email,
              interventionCount: this.interventions().filter(i => i.clientId === client.id).length,
            },
          });
        }
      });
    }

    // Add intervention markers
    if (this.showInterventions) {
      this.interventions().forEach(intervention => {
        if (intervention.clientLatitude && intervention.clientLongitude) {
          markers.push({
            id: `intervention-${intervention.id}`,
            type: 'intervention',
            lat: intervention.clientLatitude,
            lng: intervention.clientLongitude,
            title: INTERVENTION_TYPE_LABELS[intervention.type],
            subtitle: intervention.clientName,
            status: intervention.status,
            interventionType: intervention.type,
            data: {
              id: intervention.id,
              clientName: intervention.clientName,
              clientAddress: intervention.clientAddress,
              technicianName: intervention.technicianName,
              type: intervention.type,
              status: intervention.status,
              description: intervention.description,
              scheduledDate: intervention.scheduledDate,
              scheduledStartTime: intervention.scheduledStartTime,
            },
          });
        }
      });
    }

    return markers;
  });

  visibleMarkers = computed<MapMarker[]>(() => {
    let markers = this.allMarkers();

    // Filter by status if selected
    if (this.selectedStatus !== null) {
      markers = markers.filter(
        m => m.type === 'client' || m.status === this.selectedStatus
      );
    }

    return markers;
  });

  // Effect to update technician markers when locations change
  private technicianEffect = effect(() => {
    const locations = this.locationData.locations();
    if (this.showTechnicians && this.technicianMarkersLayer && this.map) {
      this.renderTechnicianMarkers(locations);
    }
  });

  constructor() {
    // Listen for navigation events from popup
    if (typeof window !== 'undefined') {
      window.addEventListener('viewClient', ((e: CustomEvent) => {
        this.router.navigate(['/home/clients', e.detail]);
      }) as EventListener);

      window.addEventListener('viewIntervention', ((e: CustomEvent) => {
        this.router.navigate(['/home/interventions', e.detail]);
      }) as EventListener);
    }
  }

  ngOnInit(): void {
    this.loadData();
  }

  ngAfterViewInit(): void {
    this.initMap();
    this.checkQueryParams();
  }

  /**
   * If navigated from intervention detail with query params,
   * auto-enable technician layer and start simulation to that intervention.
   */
  private checkQueryParams(): void {
    const params = this.activatedRoute.snapshot.queryParams;
    const { technicianId, lat, lng, clientName } = params;

    if (technicianId && lat && lng) {
      const destLat = parseFloat(lat);
      const destLng = parseFloat(lng);

      // Enable technician layer + connect SignalR
      this.showTechnicians = true;
      this.toggleTechnicianLayer().then(() => {
        // Wait for data to load, then auto-start simulation
        setTimeout(() => {
          this.selectedTechnicianId = technicianId;
          this.autoStartRoute(technicianId, destLat, destLng, clientName || 'Client');
        }, 1500);
      });
    }
  }

  private autoStartRoute(technicianId: string, destLat: number, destLng: number, clientName: string): void {
    const startLat = destLat + (Math.random() > 0.5 ? 1 : -1) * (0.015 + Math.random() * 0.01);
    const startLng = destLng + (Math.random() > 0.5 ? 1 : -1) * (0.015 + Math.random() * 0.01);

    this.loadingRoute = true;
    this.fetchOsrmRoute([startLat, startLng], [destLat, destLng])
      .then(routePoints => {
        this.loadingRoute = false;
        this.drawRoute(routePoints);

        const sampled = this.samplePoints(routePoints, 30);

        this.simulation.startAlongRoute(technicianId, sampled, 4000);

        if (this.map && routePoints.length > 0) {
          const bounds = L.latLngBounds(routePoints);
          this.map.fitBounds(bounds, { padding: [60, 60] });
        }

        this.messageService.add({
          severity: 'info',
          summary: 'Simulation lancée',
          detail: `Itinéraire vers ${clientName}`,
          life: 5000,
        });
      })
      .catch(() => {
        this.loadingRoute = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de calculer l\'itinéraire.',
        });
      });
  }

  ngOnDestroy(): void {
    this.stopSimulation();
    this.locationData.disconnect();
    if (this.map) {
      this.map.remove();
    }
  }

  private initMap(): void {
    if (!this.mapContainer?.nativeElement) return;

    this.map = L.map(this.mapContainer.nativeElement, {
      center: DEFAULT_MAP_CENTER,
      zoom: DEFAULT_MAP_ZOOM,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(this.map);

    this.markersLayer = L.layerGroup().addTo(this.map);
    this.technicianMarkersLayer = L.layerGroup().addTo(this.map);

    // Initial render
    setTimeout(() => {
      this.map?.invalidateSize();
      this.renderMarkers();
    }, 100);
  }

  loadData(): void {
    this.loading.set(true);

    this.clientData.getAll().subscribe({
      next: clients => this.clients.set(clients),
    });

    this.technicianData.getAll().subscribe({
      next: techs => this.technicians.set(techs),
    });

    this.interventionData.getAll().subscribe({
      next: interventions => {
        this.interventions.set(interventions);
        this.loading.set(false);
        this.renderMarkers();
      },
      error: err => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: err.message || 'Impossible de charger les données',
        });
        this.loading.set(false);
      },
    });
  }

  applyFilters(): void {
    this.renderMarkers();
  }

  async toggleTechnicianLayer(): Promise<void> {
    if (this.showTechnicians) {
      try {
        await this.locationData.connect();
        // Also load initial positions via REST
        this.locationData.getAllLocations().subscribe({
          next: locs => this.locationData.locations.set(locs),
        });
      } catch {
        this.messageService.add({
          severity: 'warn',
          summary: 'Connexion',
          detail: 'Connexion temps réel indisponible, positions chargées via REST',
        });
        this.locationData.getAllLocations().subscribe({
          next: locs => this.locationData.locations.set(locs),
        });
      }
    } else {
      this.stopSimulation();
      await this.locationData.disconnect();
      this.technicianMarkersLayer?.clearLayers();
    }
  }

  startSimulation(): void {
    if (!this.selectedTechnicianId) return;

    // Find planned (1) or in-progress (2) interventions assigned to this technician
    const techInterventions = this.interventions().filter(
      i => i.technicianId === this.selectedTechnicianId &&
           (i.status === 1 || i.status === 2) &&
           i.clientLatitude && i.clientLongitude
    );

    if (techInterventions.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Aucune intervention',
        detail: 'Ce technicien n\'a aucune intervention planifiée ou en cours avec des coordonnées.',
      });
      return;
    }

    const dest = techInterventions[0];
    const endLat = dest.clientLatitude!;
    const endLng = dest.clientLongitude!;

    // Start position: realistic offset (~2km) from the client location
    const startLat = endLat + (Math.random() > 0.5 ? 1 : -1) * (0.015 + Math.random() * 0.01);
    const startLng = endLng + (Math.random() > 0.5 ? 1 : -1) * (0.015 + Math.random() * 0.01);

    // Fetch route via OSRM then start simulation along route points
    this.loadingRoute = true;
    this.fetchOsrmRoute([startLat, startLng], [endLat, endLng])
      .then(routePoints => {
        this.loadingRoute = false;
        this.drawRoute(routePoints);

        // Sample ~30 points for the simulation (one position every 20s)
        const sampled = this.samplePoints(routePoints, 30);

        this.simulation.startAlongRoute(
          this.selectedTechnicianId!,
          sampled,
          4000
        );

        // Zoom to fit route
        if (this.map && routePoints.length > 0) {
          const bounds = L.latLngBounds(routePoints);
          this.map.fitBounds(bounds, { padding: [60, 60] });
        }
      })
      .catch(() => {
        this.loadingRoute = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de calculer l\'itinéraire.',
        });
      });
  }

  stopSimulation(): void {
    this.simulation.stop();
    this.clearRoute();
  }

  /**
   * Fetch route geometry from OSRM (free, no API key needed).
   * Returns array of [lat, lng] points along the road.
   */
  private async fetchOsrmRoute(
    start: [number, number],
    end: [number, number]
  ): Promise<[number, number][]> {
    const url = `https://router.project-osrm.org/route/v1/driving/` +
      `${start[1]},${start[0]};${end[1]},${end[0]}` +
      `?overview=full&geometries=geojson`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.code !== 'Ok' || !data.routes?.length) {
      // Fallback: straight line with intermediate points
      return this.interpolateLine(start, end, 30);
    }

    // GeoJSON coordinates are [lng, lat], convert to [lat, lng]
    const coords: [number, number][] = data.routes[0].geometry.coordinates.map(
      (c: [number, number]) => [c[1], c[0]] as [number, number]
    );

    return coords;
  }

  /**
   * Sample N evenly-spaced points from a larger array.
   */
  private samplePoints(points: [number, number][], n: number): [number, number][] {
    if (points.length <= n) return points;

    const sampled: [number, number][] = [];
    for (let i = 0; i < n; i++) {
      const idx = Math.round((i / (n - 1)) * (points.length - 1));
      sampled.push(points[idx]);
    }
    return sampled;
  }

  /**
   * Simple straight-line interpolation fallback.
   */
  private interpolateLine(
    start: [number, number],
    end: [number, number],
    steps: number
  ): [number, number][] {
    const points: [number, number][] = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      points.push([
        start[0] + (end[0] - start[0]) * t,
        start[1] + (end[1] - start[1]) * t,
      ]);
    }
    return points;
  }

  private drawRoute(points: [number, number][]): void {
    this.clearRoute();
    if (!this.map) return;

    this.routePolyline = L.polyline(
      points,
      {
        color: '#0d9488',
        weight: 4,
        opacity: 0.7,
        dashArray: '10, 8',
      }
    ).addTo(this.map);
  }

  private clearRoute(): void {
    if (this.routePolyline && this.map) {
      this.map.removeLayer(this.routePolyline);
      this.routePolyline = null;
    }
  }

  private renderTechnicianMarkers(locations: TechnicianLocation[]): void {
    if (!this.technicianMarkersLayer) return;

    this.technicianMarkersLayer.clearLayers();

    locations.forEach(loc => {
      const icon = L.divIcon({
        html: `<div style="
          background-color: #0d9488;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
        </div>`,
        className: 'technician-marker',
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([loc.latitude, loc.longitude], { icon });

      const popup = `
        <div class="p-2">
          <h3 class="font-semibold text-gray-900 mb-1">
            <i class="pi pi-user mr-1" style="color: #0d9488;"></i>${loc.technicianName}
          </h3>
          <p class="text-sm text-gray-600 mb-1">
            ${loc.isOnline ? '<span style="color: #22c55e;">● En ligne</span>' : '<span style="color: #9ca3af;">● Hors ligne</span>'}
          </p>
          ${loc.speed ? `<p class="text-sm text-gray-600">${Math.round(loc.speed)} km/h</p>` : ''}
          <p class="text-xs text-gray-400 mt-1">${new Date(loc.timestamp).toLocaleTimeString('fr-FR')}</p>
        </div>
      `;

      marker.bindPopup(popup, { maxWidth: 250 });
      this.technicianMarkersLayer!.addLayer(marker);
    });
  }

  private renderMarkers(): void {
    if (!this.map || !this.markersLayer) return;

    this.markersLayer.clearLayers();

    const markers = this.visibleMarkers();

    markers.forEach(marker => {
      const leafletMarker = this.createMarker(marker);
      if (leafletMarker) {
        this.markersLayer!.addLayer(leafletMarker);
      }
    });

    // Fit bounds if we have markers
    if (markers.length > 0) {
      const bounds = L.latLngBounds(markers.map(m => [m.lat, m.lng]));
      this.map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    }
  }

  private createMarker(marker: MapMarker): L.Marker | null {
    const icon = this.createIcon(marker);

    const leafletMarker = L.marker([marker.lat, marker.lng], { icon });

    // Create popup content
    const popupContent = this.createPopupContent(marker);
    leafletMarker.bindPopup(popupContent, { maxWidth: 300 });

    return leafletMarker;
  }

  private createIcon(marker: MapMarker): L.DivIcon {
    const color = marker.type === 'intervention'
      ? MARKER_COLORS[marker.status || 0]
      : '#6b7280';

    const iconHtml = marker.type === 'intervention'
      ? `<div style="
          background-color: ${color};
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        "></div>`
      : `<div style="
          background-color: ${color};
          width: 20px;
          height: 20px;
          border-radius: 4px;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        "></div>`;

    return L.divIcon({
      html: iconHtml,
      className: 'custom-marker',
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
  }

  private createPopupContent(marker: MapMarker): string {
    if (marker.type === 'client') {
      const data = marker.data as any;
      return `
        <div class="p-2">
          <h3 class="font-semibold text-gray-900 mb-2">${data.name}</h3>
          <p class="text-sm text-gray-600 mb-1">
            <i class="pi pi-map-marker mr-1"></i>${data.address}
          </p>
          ${data.phone ? `<p class="text-sm text-gray-600 mb-1">
            <i class="pi pi-phone mr-1"></i>${data.phone}
          </p>` : ''}
          <p class="text-sm text-gray-500 mt-2">
            ${data.interventionCount} intervention(s)
          </p>
          <button onclick="window.dispatchEvent(new CustomEvent('viewClient', {detail: '${data.id}'}))"
            class="mt-2 text-sm text-indigo-600 hover:text-indigo-800 cursor-pointer">
            Voir le client →
          </button>
        </div>
      `;
    } else {
      const data = marker.data as any;
      const statusLabel = INTERVENTION_STATUS_LABELS[data.status];
      const typeLabel = INTERVENTION_TYPE_LABELS[data.type];
      const statusColor = MARKER_COLORS[data.status];

      return `
        <div class="p-2">
          <div class="flex items-center gap-2 mb-2">
            <span style="background-color: ${statusColor}20; color: ${statusColor}; padding: 2px 8px; border-radius: 4px; font-size: 12px;">
              ${typeLabel}
            </span>
            <span style="background-color: ${statusColor}20; color: ${statusColor}; padding: 2px 8px; border-radius: 4px; font-size: 12px;">
              ${statusLabel}
            </span>
          </div>
          <h3 class="font-semibold text-gray-900 mb-1">${data.clientName}</h3>
          <p class="text-sm text-gray-600 mb-2">${data.clientAddress}</p>
          ${data.technicianName ? `<p class="text-sm text-gray-600 mb-1">
            <i class="pi pi-user mr-1"></i>${data.technicianName}
          </p>` : ''}
          ${data.scheduledDate ? `<p class="text-sm text-gray-600 mb-1">
            <i class="pi pi-calendar mr-1"></i>${data.scheduledDate}
            ${data.scheduledStartTime ? ` à ${data.scheduledStartTime.substring(0, 5)}` : ''}
          </p>` : ''}
          <p class="text-sm text-gray-500 mt-2 line-clamp-2">${data.description}</p>
          <button onclick="window.dispatchEvent(new CustomEvent('viewIntervention', {detail: '${data.id}'}))"
            class="mt-2 text-sm text-indigo-600 hover:text-indigo-800 cursor-pointer">
            Voir l'intervention →
          </button>
        </div>
      `;
    }
  }
}
