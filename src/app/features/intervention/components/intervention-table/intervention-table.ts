import { Component, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import {
  Intervention,
  INTERVENTION_STATUS_LABELS,
  INTERVENTION_TYPE_LABELS,
} from '../../models/intervention';

@Component({
  selector: 'app-intervention-table',
  standalone: true,
  imports: [DatePipe, TableModule, ButtonModule, TagModule, TooltipModule],
  template: `
    <p-table
      [value]="interventions()"
      [loading]="loading()"
      [paginator]="true"
      [rows]="10"
      [rowsPerPageOptions]="[5, 10, 25, 50]"
      [showCurrentPageReport]="true"
      currentPageReportTemplate="Affichage {first} à {last} sur {totalRecords} interventions"
      styleClass="p-datatable-striped"
    >
      <ng-template pTemplate="header">
        <tr>
          <th pSortableColumn="clientName">
            Client
            <p-sortIcon field="clientName" />
          </th>
          <th pSortableColumn="type">
            Type
            <p-sortIcon field="type" />
          </th>
          <th pSortableColumn="status">
            Statut
            <p-sortIcon field="status" />
          </th>
          <th pSortableColumn="scheduledDate">
            Date planifiée
            <p-sortIcon field="scheduledDate" />
          </th>
          <th>Technicien</th>
          <th class="text-center w-40">Actions</th>
        </tr>
      </ng-template>

      <ng-template pTemplate="body" let-intervention>
        <tr>
          <td>
            <div class="font-medium text-gray-900">{{ intervention.clientName }}</div>
            <div class="text-sm text-gray-500">{{ intervention.clientAddress }}</div>
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
              <div class="text-gray-700">
                {{ intervention.scheduledDate | date:'dd/MM/yyyy' }}
              </div>
              @if (intervention.scheduledStartTime) {
                <div class="text-sm text-gray-500">
                  {{ formatTime(intervention.scheduledStartTime) }}
                  @if (intervention.scheduledEndTime) {
                    - {{ formatTime(intervention.scheduledEndTime) }}
                  }
                </div>
              }
            } @else {
              <span class="text-gray-400 italic">Non planifiée</span>
            }
          </td>
          <td>
            @if (intervention.technicianName) {
              <span class="text-gray-700">{{ intervention.technicianName }}</span>
            } @else {
              <span class="text-gray-400 italic">Non assigné</span>
            }
          </td>
          <td>
            <div class="flex items-center justify-center gap-1">
              <p-button
                icon="pi pi-eye"
                [rounded]="true"
                [text]="true"
                severity="info"
                pTooltip="Voir détails"
                tooltipPosition="top"
                (onClick)="view.emit(intervention)"
              />
              @if (intervention.status === 0) {
                <p-button
                  icon="pi pi-user-plus"
                  [rounded]="true"
                  [text]="true"
                  severity="success"
                  pTooltip="Affecter"
                  tooltipPosition="top"
                  (onClick)="assign.emit(intervention)"
                />
              }
              @if (intervention.status < 3) {
                <p-button
                  icon="pi pi-pencil"
                  [rounded]="true"
                  [text]="true"
                  severity="secondary"
                  pTooltip="Modifier"
                  tooltipPosition="top"
                  (onClick)="edit.emit(intervention)"
                />
              }
              @if (intervention.status < 2) {
                <p-button
                  icon="pi pi-times"
                  [rounded]="true"
                  [text]="true"
                  severity="danger"
                  pTooltip="Annuler"
                  tooltipPosition="top"
                  (onClick)="cancel.emit(intervention)"
                />
              }
            </div>
          </td>
        </tr>
      </ng-template>

      <ng-template pTemplate="emptymessage">
        <tr>
          <td colspan="6" class="text-center py-8 text-gray-500">
            <i class="pi pi-briefcase text-4xl mb-2 block"></i>
            <p>Aucune intervention trouvée</p>
          </td>
        </tr>
      </ng-template>
    </p-table>
  `,
})
export class InterventionTable {
  interventions = input.required<Intervention[]>();
  loading = input(false);

  view = output<Intervention>();
  edit = output<Intervention>();
  assign = output<Intervention>();
  cancel = output<Intervention>();

  getStatusLabel(status: number): string {
    return INTERVENTION_STATUS_LABELS[status] || 'Inconnu';
  }

  getStatusSeverity(status: number): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    const severities: Record<number, 'success' | 'info' | 'warn' | 'danger' | 'secondary'> = {
      0: 'warn',      // Pending
      1: 'info',      // Scheduled
      2: 'success',   // InProgress
      3: 'success',   // Completed
      4: 'danger',    // Cancelled
    };
    return severities[status] || 'secondary';
  }

  getTypeLabel(type: number): string {
    return INTERVENTION_TYPE_LABELS[type] || 'Inconnu';
  }

  getTypeSeverity(type: number): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    const severities: Record<number, 'success' | 'info' | 'warn' | 'danger' | 'secondary'> = {
      0: 'info',      // Maintenance
      1: 'warn',      // Repair
      2: 'success',   // Installation
      3: 'secondary', // Inspection
      4: 'danger',    // Emergency
    };
    return severities[type] || 'secondary';
  }

  formatTime(time: string): string {
    return time.substring(0, 5);
  }
}
