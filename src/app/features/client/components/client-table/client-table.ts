import { Component, input, output } from '@angular/core';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { Client } from '../../models/client';

@Component({
  selector: 'app-client-table',
  standalone: true,
  imports: [TableModule, ButtonModule, TagModule, TooltipModule],
  template: `
    <p-table
      [value]="clients()"
      [loading]="loading()"
      [paginator]="true"
      [rows]="10"
      [rowsPerPageOptions]="[5, 10, 25, 50]"
      [showCurrentPageReport]="true"
      currentPageReportTemplate="Affichage {first} à {last} sur {totalRecords} clients"
      [globalFilterFields]="['name', 'city', 'email', 'phone']"
      styleClass="p-datatable-striped"
    >
      <ng-template pTemplate="header">
        <tr>
          <th pSortableColumn="name">
            Nom
            <p-sortIcon field="name" />
          </th>
          <th pSortableColumn="city">
            Ville
            <p-sortIcon field="city" />
          </th>
          <th>Téléphone</th>
          <th>Email</th>
          <th pSortableColumn="equipmentCount" class="text-center">
            Équipements
            <p-sortIcon field="equipmentCount" />
          </th>
          <th class="text-center w-32">Actions</th>
        </tr>
      </ng-template>

      <ng-template pTemplate="body" let-client>
        <tr>
          <td>
            <div class="font-medium text-gray-900">{{ client.name }}</div>
            <div class="text-sm text-gray-500">{{ client.address }}</div>
          </td>
          <td>
            <span class="text-gray-700">{{ client.city }}</span>
            <span class="text-gray-400 text-sm ml-1">({{ client.postalCode }})</span>
          </td>
          <td>
            <a [href]="'tel:' + client.phone" class="text-indigo-600 hover:text-indigo-800">
              {{ client.phone }}
            </a>
          </td>
          <td>
            <a [href]="'mailto:' + client.email" class="text-indigo-600 hover:text-indigo-800">
              {{ client.email }}
            </a>
          </td>
          <td class="text-center">
            <p-tag
              [value]="client.equipmentCount.toString()"
              [severity]="client.equipmentCount > 0 ? 'info' : 'secondary'"
            />
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
                (onClick)="view.emit(client)"
              />
              <p-button
                icon="pi pi-pencil"
                [rounded]="true"
                [text]="true"
                severity="secondary"
                pTooltip="Modifier"
                tooltipPosition="top"
                (onClick)="edit.emit(client)"
              />
              <p-button
                icon="pi pi-trash"
                [rounded]="true"
                [text]="true"
                severity="danger"
                pTooltip="Supprimer"
                tooltipPosition="top"
                (onClick)="delete.emit(client)"
              />
            </div>
          </td>
        </tr>
      </ng-template>

      <ng-template pTemplate="emptymessage">
        <tr>
          <td colspan="6" class="text-center py-8 text-gray-500">
            <i class="pi pi-users text-4xl mb-2 block"></i>
            <p>Aucun client trouvé</p>
          </td>
        </tr>
      </ng-template>
    </p-table>
  `,
})
export class ClientTable {
  clients = input.required<Client[]>();
  loading = input(false);

  view = output<Client>();
  edit = output<Client>();
  delete = output<Client>();
}
