import {
  Component,
  inject,
  OnInit,
  OnDestroy,
  signal,
  computed,
  ElementRef,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { Router } from '@angular/router';
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
import {
  Intervention,
  INTERVENTION_STATUSES,
  INTERVENTION_STATUS_LABELS,
  INTERVENTION_TYPE_LABELS,
} from '../../../intervention/models/intervention';
import { Client } from '../../../client/models/client';
import {
  MapMarker,
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

    <div class="p-6 h-full flex flex-col">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Carte des interventions</h1>
          <p class="text-gray-500 mt-1">Visualisez les interventions sur la carte</p>
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
              Afficher les clients
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
              Afficher les interventions
            </label>
          </div>

          <!-- Stats -->
          <div class="ml-auto flex items-center gap-4 text-sm text-gray-600">
            <span>
              <i class="pi pi-map-marker text-blue-500 mr-1"></i>
              {{ visibleMarkers().length }} marqueurs
            </span>
          </div>
        </div>
      </div>

      <!-- Map container -->
      <div class="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div #mapContainer class="w-full h-full min-h-[500px]"></div>
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
  private interventionData = inject(InterventionData);
  private clientData = inject(ClientData);
  private messageService = inject(MessageService);

  private map: L.Map | null = null;
  private markersLayer: L.LayerGroup | null = null;

  interventions = signal<Intervention[]>([]);
  clients = signal<Client[]>([]);
  loading = signal(false);

  selectedStatus: number | null = null;
  showClients = true;
  showInterventions = true;

  statusOptions = INTERVENTION_STATUSES;

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

  ngOnInit(): void {
    this.loadData();
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  ngOnDestroy(): void {
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

    // Initial render
    setTimeout(() => {
      this.map?.invalidateSize();
      this.renderMarkers();
    }, 100);
  }

  loadData(): void {
    this.loading.set(true);

    this.clientData.getAll().subscribe({
      next: clients => {
        this.clients.set(clients);
      },
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
}
