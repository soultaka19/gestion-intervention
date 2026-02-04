import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ChartModule } from 'primeng/chart';
import { SkeletonModule } from 'primeng/skeleton';
import { InterventionData } from '../features/intervention/services/intervention-data';
import { ClientData } from '../features/client/services/client-data';
import { EquipmentData } from '../features/equipment/services/equipment-data';
import {
  Intervention,
  INTERVENTION_STATUS_LABELS,
  INTERVENTION_TYPE_LABELS,
} from '../features/intervention/models/intervention';

interface DashboardStats {
  totalClients: number;
  totalEquipments: number;
  pendingInterventions: number;
  scheduledInterventions: number;
  inProgressInterventions: number;
  completedInterventions: number;
}

@Component({
  selector: 'app-dashbord',
  standalone: true,
  imports: [
    DatePipe,
    CardModule,
    ButtonModule,
    TableModule,
    TagModule,
    ChartModule,
    SkeletonModule,
  ],
  template: `
    <div class="p-6">
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Tableau de bord</h1>
        <p class="text-gray-500 mt-1">Vue d'ensemble de votre activité</p>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <!-- Clients -->
        <div
          class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
          (click)="navigateTo('/home/clients')"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-500">Clients</p>
              @if (loading()) {
                <div class="h-8 w-16 bg-gray-200 rounded animate-pulse mt-1"></div>
              } @else {
                <p class="text-3xl font-bold text-gray-900 mt-1">{{ stats().totalClients }}</p>
              }
            </div>
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <i class="pi pi-building text-xl text-blue-600"></i>
            </div>
          </div>
        </div>

        <!-- En attente -->
        <div
          class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
          (click)="navigateToInterventions(0)"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-500">En attente</p>
              @if (loading()) {
                <div class="h-8 w-16 bg-gray-200 rounded animate-pulse mt-1"></div>
              } @else {
                <p class="text-3xl font-bold text-orange-600 mt-1">
                  {{ stats().pendingInterventions }}
                </p>
              }
            </div>
            <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <i class="pi pi-clock text-xl text-orange-600"></i>
            </div>
          </div>
        </div>

        <!-- En cours -->
        <div
          class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
          (click)="navigateToInterventions(2)"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-500">En cours</p>
              @if (loading()) {
                <div class="h-8 w-16 bg-gray-200 rounded animate-pulse mt-1"></div>
              } @else {
                <p class="text-3xl font-bold text-blue-600 mt-1">
                  {{ stats().inProgressInterventions }}
                </p>
              }
            </div>
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <i class="pi pi-spin pi-cog text-xl text-blue-600"></i>
            </div>
          </div>
        </div>

        <!-- Terminées -->
        <div
          class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
          (click)="navigateToInterventions(3)"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-500">Terminées</p>
              @if (loading()) {
                <div class="h-8 w-16 bg-gray-200 rounded animate-pulse mt-1"></div>
              } @else {
                <p class="text-3xl font-bold text-green-600 mt-1">
                  {{ stats().completedInterventions }}
                </p>
              }
            </div>
            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <i class="pi pi-check-circle text-xl text-green-600"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts and Recent Interventions -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Chart -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Répartition des interventions</h2>
          @if (loading()) {
            <div class="h-64 bg-gray-100 rounded animate-pulse"></div>
          } @else {
            <p-chart type="doughnut" [data]="chartData()" [options]="chartOptions" />
          }
        </div>

        <!-- Recent Interventions -->
        <div class="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200">
          <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 class="text-lg font-semibold text-gray-900">Interventions récentes</h2>
            <p-button
              label="Voir tout"
              [link]="true"
              icon="pi pi-arrow-right"
              iconPos="right"
              (onClick)="navigateTo('/home/interventions')"
            />
          </div>

          <p-table
            [value]="recentInterventions()"
            [loading]="loading()"
            styleClass="p-datatable-sm"
          >
            <ng-template pTemplate="header">
              <tr>
                <th>Client</th>
                <th>Type</th>
                <th>Statut</th>
                <th>Date</th>
                <th></th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-intervention>
              <tr>
                <td>
                  <span class="font-medium text-gray-900">{{ intervention.clientName }}</span>
                </td>
                <td>
                  <p-tag
                    [value]="getTypeLabel(intervention.type)"
                    [severity]="getTypeSeverity(intervention.type)"
                  />
                </td>
                <td>
                  <p-tag
                    [value]="getStatusLabel(intervention.status)"
                    [severity]="getStatusSeverity(intervention.status)"
                  />
                </td>
                <td>
                  @if (intervention.scheduledDate) {
                    {{ intervention.scheduledDate | date:'dd/MM/yyyy' }}
                  } @else {
                    <span class="text-gray-400">-</span>
                  }
                </td>
                <td>
                  <p-button
                    icon="pi pi-eye"
                    [rounded]="true"
                    [text]="true"
                    severity="secondary"
                    (onClick)="viewIntervention(intervention)"
                  />
                </td>
              </tr>
            </ng-template>
            <ng-template pTemplate="emptymessage">
              <tr>
                <td colspan="5" class="text-center py-8 text-gray-500">
                  Aucune intervention récente
                </td>
              </tr>
            </ng-template>
          </p-table>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h2>
        <div class="flex flex-wrap gap-3">
          <p-button
            label="Nouvelle intervention"
            icon="pi pi-plus"
            (onClick)="navigateTo('/home/interventions')"
          />
          <p-button
            label="Nouveau client"
            icon="pi pi-building"
            severity="secondary"
            [outlined]="true"
            (onClick)="navigateTo('/home/clients')"
          />
          <p-button
            label="Planning"
            icon="pi pi-calendar"
            severity="info"
            [outlined]="true"
            (onClick)="navigateTo('/home/planning')"
          />
        </div>
      </div>
    </div>
  `,
})
export class Dashbord implements OnInit {
  private router = inject(Router);
  private interventionData = inject(InterventionData);
  private clientData = inject(ClientData);
  private equipmentData = inject(EquipmentData);

  loading = signal(true);
  interventions = signal<Intervention[]>([]);

  stats = computed<DashboardStats>(() => {
    const interventions = this.interventions();
    const clients = this.clientData.clients();
    const equipments = this.equipmentData.equipments();

    return {
      totalClients: clients.length,
      totalEquipments: equipments.length,
      pendingInterventions: interventions.filter(i => i.status === 0).length,
      scheduledInterventions: interventions.filter(i => i.status === 1).length,
      inProgressInterventions: interventions.filter(i => i.status === 2).length,
      completedInterventions: interventions.filter(i => i.status === 3).length,
    };
  });

  recentInterventions = computed(() => {
    return this.interventions()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  });

  chartData = computed(() => {
    const s = this.stats();
    return {
      labels: ['En attente', 'Planifiées', 'En cours', 'Terminées'],
      datasets: [
        {
          data: [
            s.pendingInterventions,
            s.scheduledInterventions,
            s.inProgressInterventions,
            s.completedInterventions,
          ],
          backgroundColor: ['#f97316', '#3b82f6', '#8b5cf6', '#22c55e'],
          hoverBackgroundColor: ['#ea580c', '#2563eb', '#7c3aed', '#16a34a'],
        },
      ],
    };
  });

  chartOptions = {
    cutout: '60%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
    },
    maintainAspectRatio: false,
  };

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);

    // Load all data in parallel
    this.clientData.getAll().subscribe();
    this.equipmentData.getAll().subscribe();
    this.interventionData.getAll().subscribe({
      next: interventions => {
        this.interventions.set(interventions);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  navigateToInterventions(status: number): void {
    this.router.navigate(['/home/interventions'], { queryParams: { status } });
  }

  viewIntervention(intervention: Intervention): void {
    this.router.navigate(['/home/interventions', intervention.id]);
  }

  getStatusLabel(status: number): string {
    return INTERVENTION_STATUS_LABELS[status] || 'Inconnu';
  }

  getStatusSeverity(status: number): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    const severities: Record<number, 'success' | 'info' | 'warn' | 'danger' | 'secondary'> = {
      0: 'warn',
      1: 'info',
      2: 'success',
      3: 'success',
      4: 'danger',
    };
    return severities[status] || 'secondary';
  }

  getTypeLabel(type: number): string {
    return INTERVENTION_TYPE_LABELS[type] || 'Inconnu';
  }

  getTypeSeverity(type: number): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    const severities: Record<number, 'success' | 'info' | 'warn' | 'danger' | 'secondary'> = {
      0: 'info',
      1: 'warn',
      2: 'success',
      3: 'secondary',
      4: 'danger',
    };
    return severities[type] || 'secondary';
  }
}
