import { Component, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { Technician } from '../../models/technician';

@Component({
  selector: 'app-technician-table',
  standalone: true,
  imports: [DatePipe, TableModule, ButtonModule, TagModule, TooltipModule],
  template: `
    <p-table
      [value]="technicians()"
      [loading]="loading()"
      [paginator]="true"
      [rows]="10"
      [rowsPerPageOptions]="[5, 10, 25, 50]"
      [showCurrentPageReport]="true"
      currentPageReportTemplate="Affichage {first} à {last} sur {totalRecords} techniciens"
      styleClass="p-datatable-striped"
    >
      <ng-template pTemplate="header">
        <tr>
          <th pSortableColumn="lastName">
            Nom
            <p-sortIcon field="lastName" />
          </th>
          <th pSortableColumn="email">
            Email
            <p-sortIcon field="email" />
          </th>
          <th pSortableColumn="isActive">
            Statut
            <p-sortIcon field="isActive" />
          </th>
          <th pSortableColumn="createdAt">
            Créé le
            <p-sortIcon field="createdAt" />
          </th>
          <th class="text-center w-32">Actions</th>
        </tr>
      </ng-template>

      <ng-template pTemplate="body" let-technician>
        <tr>
          <td>
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center"
              >
                <span class="text-indigo-600 font-medium">
                  {{ technician.firstName.charAt(0) }}{{ technician.lastName.charAt(0) }}
                </span>
              </div>
              <div>
                <div class="font-medium text-gray-900">
                  {{ technician.firstName }} {{ technician.lastName }}
                </div>
              </div>
            </div>
          </td>
          <td>
            <span class="text-gray-600">{{ technician.email }}</span>
          </td>
          <td>
            <p-tag
              [value]="technician.isActive ? 'Actif' : 'Inactif'"
              [severity]="technician.isActive ? 'success' : 'danger'"
            />
          </td>
          <td>
            <span class="text-gray-600">
              {{ technician.createdAt | date:'dd/MM/yyyy' }}
            </span>
          </td>
          <td>
            <div class="flex items-center justify-center gap-1">
              <p-button
                icon="pi pi-pencil"
                [rounded]="true"
                [text]="true"
                severity="secondary"
                pTooltip="Modifier"
                tooltipPosition="top"
                (onClick)="edit.emit(technician)"
              />
              @if (technician.isActive) {
                <p-button
                  icon="pi pi-trash"
                  [rounded]="true"
                  [text]="true"
                  severity="danger"
                  pTooltip="Désactiver"
                  tooltipPosition="top"
                  (onClick)="delete.emit(technician)"
                />
              }
            </div>
          </td>
        </tr>
      </ng-template>

      <ng-template pTemplate="emptymessage">
        <tr>
          <td colspan="5" class="text-center py-8 text-gray-500">
            <i class="pi pi-users text-4xl mb-2 block"></i>
            <p>Aucun technicien trouvé</p>
          </td>
        </tr>
      </ng-template>
    </p-table>
  `,
})
export class TechnicianTable {
  technicians = input.required<Technician[]>();
  loading = input(false);

  edit = output<Technician>();
  delete = output<Technician>();
}
