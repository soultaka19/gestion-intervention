import { Component, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { Equipment, EquipmentTypeName, EQUIPMENT_TYPE_LABELS } from '../../models/equipment';

@Component({
  selector: 'app-equipment-table',
  standalone: true,
  imports: [DatePipe, TableModule, ButtonModule, TagModule, TooltipModule],
  template: `
    <p-table
      [value]="equipments()"
      [loading]="loading()"
      [paginator]="true"
      [rows]="10"
      [rowsPerPageOptions]="[5, 10, 25, 50]"
      [showCurrentPageReport]="true"
      currentPageReportTemplate="Affichage {first} à {last} sur {totalRecords} équipements"
      styleClass="p-datatable-striped"
    >
      <ng-template pTemplate="header">
        <tr>
          <th pSortableColumn="type">
            Type
            <p-sortIcon field="type" />
          </th>
          <th pSortableColumn="brand">
            Marque / Modèle
            <p-sortIcon field="brand" />
          </th>
          <th>N° Série</th>
          @if (showClient()) {
            <th pSortableColumn="clientName">
              Client
              <p-sortIcon field="clientName" />
            </th>
          }
          <th pSortableColumn="lastMaintenanceDate">
            Dernière maintenance
            <p-sortIcon field="lastMaintenanceDate" />
          </th>
          <th pSortableColumn="warrantyEndDate">
            Garantie
            <p-sortIcon field="warrantyEndDate" />
          </th>
          <th class="text-center w-40">Actions</th>
        </tr>
      </ng-template>

      <ng-template pTemplate="body" let-equipment>
        <tr>
          <td>
            <p-tag
              [value]="getTypeLabel(equipment.type)"
              [severity]="getTypeSeverity(equipment.type)"
            />
          </td>
          <td>
            <div class="font-medium text-gray-900">{{ equipment.brand }}</div>
            <div class="text-sm text-gray-500">{{ equipment.model }}</div>
          </td>
          <td>
            <span class="font-mono text-sm text-gray-600">{{ equipment.serialNumber }}</span>
          </td>
          @if (showClient()) {
            <td>
              <span class="text-gray-700">{{ equipment.clientName }}</span>
            </td>
          }
          <td>
            @if (equipment.lastMaintenanceDate) {
              <span [class]="getMaintenanceClass(equipment.lastMaintenanceDate)">
                {{ equipment.lastMaintenanceDate | date:'dd/MM/yyyy' }}
              </span>
            } @else {
              <span class="text-gray-400 italic">Jamais</span>
            }
          </td>
          <td>
            @if (equipment.warrantyEndDate) {
              <p-tag
                [value]="(equipment.warrantyEndDate | date:'dd/MM/yyyy') ?? ''"
                [severity]="getWarrantySeverity(equipment.warrantyEndDate)"
              />
            } @else {
              <span class="text-gray-400">-</span>
            }
          </td>
          <td>
            <div class="flex items-center justify-center gap-1">
              <p-button
                icon="pi pi-wrench"
                [rounded]="true"
                [text]="true"
                severity="success"
                pTooltip="Marquer maintenancé"
                tooltipPosition="top"
                (onClick)="maintenance.emit(equipment)"
              />
              <p-button
                icon="pi pi-pencil"
                [rounded]="true"
                [text]="true"
                severity="secondary"
                pTooltip="Modifier"
                tooltipPosition="top"
                (onClick)="edit.emit(equipment)"
              />
              <p-button
                icon="pi pi-trash"
                [rounded]="true"
                [text]="true"
                severity="danger"
                pTooltip="Supprimer"
                tooltipPosition="top"
                (onClick)="delete.emit(equipment)"
              />
            </div>
          </td>
        </tr>
      </ng-template>

      <ng-template pTemplate="emptymessage">
        <tr>
          <td [attr.colspan]="showClient() ? 7 : 6" class="text-center py-8 text-gray-500">
            <i class="pi pi-box text-4xl mb-2 block"></i>
            <p>Aucun équipement trouvé</p>
          </td>
        </tr>
      </ng-template>
    </p-table>
  `,
})
export class EquipmentTable {
  equipments = input.required<Equipment[]>();
  loading = input(false);
  showClient = input(true);

  edit = output<Equipment>();
  delete = output<Equipment>();
  maintenance = output<Equipment>();

  getTypeLabel(type: EquipmentTypeName): string {
    return EQUIPMENT_TYPE_LABELS[type] || 'Inconnu';
  }

  getTypeSeverity(type: EquipmentTypeName): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    const severities: Record<EquipmentTypeName, 'success' | 'info' | 'warn' | 'danger' | 'secondary'> = {
      Chaudiere: 'danger',
      Radiateur: 'warn',
      Climatisation: 'info',
      PompeAChaleur: 'success',
      ChauffeEau: 'warn',
      Ventilation: 'secondary',
      Autre: 'secondary',
    };
    return severities[type] || 'secondary';
  }

  getMaintenanceClass(dateString: string): string {
    const date = new Date(dateString);
    const monthsAgo = (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24 * 30);

    if (monthsAgo > 12) return 'text-red-600 font-medium';
    if (monthsAgo > 10) return 'text-orange-600';
    return 'text-green-600';
  }

  getWarrantySeverity(dateString: string): 'success' | 'warn' | 'danger' | 'secondary' {
    const date = new Date(dateString);
    const daysUntil = (date.getTime() - Date.now()) / (1000 * 60 * 60 * 24);

    if (daysUntil < 0) return 'danger';
    if (daysUntil < 30) return 'warn';
    return 'success';
  }
}
