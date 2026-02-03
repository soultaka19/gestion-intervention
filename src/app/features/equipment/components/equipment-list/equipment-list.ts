import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { ClientData } from '../../../client/services/client-data';
import { CreateEquipment, Equipment, EQUIPMENT_TYPES } from '../../models/equipment';
import { EquipmentData, EquipmentFilters } from '../../services/equipment-data';
import { EquipmentForm } from '../equipment-form/equipment-form';
import { EquipmentTable } from '../equipment-table/equipment-table';

@Component({
  selector: 'app-equipment-list',
  standalone: true,
  imports: [
    FormsModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    DialogModule,
    ConfirmDialogModule,
    ToastModule,
    EquipmentTable,
    EquipmentForm,
  ],
  providers: [ConfirmationService, MessageService],
  template: `
    <p-toast />
    <p-confirmDialog />

    <div class="p-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Équipements</h1>
          <p class="text-gray-500 mt-1">Gérez les équipements de vos clients</p>
        </div>
        <p-button
          label="Nouvel équipement"
          icon="pi pi-plus"
          (onClick)="openCreateDialog()"
        />
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <!-- Search -->
          <div class="flex-1 w-full sm:w-auto">
            <span class="p-input-icon-left w-full">
              <i class="pi pi-search"></i>
              <input
                pInputText
                type="text"
                class="w-full"
                placeholder="Rechercher par marque, modèle ou n° série..."
                [value]="searchQuery()"
                (input)="onSearch($event)"
              />
            </span>
          </div>

          <!-- Type filter -->
          <div class="w-full sm:w-48">
            <p-select
              [options]="typeOptions"
              [(ngModel)]="selectedType"
              placeholder="Tous les types"
              [showClear]="true"
              styleClass="w-full"
              (onChange)="onFilterChange()"
            />
          </div>

          <!-- Clear filters -->
          @if (searchQuery() || selectedType) {
            <p-button
              icon="pi pi-times"
              severity="secondary"
              [text]="true"
              pTooltip="Effacer les filtres"
              (onClick)="clearFilters()"
            />
          }
        </div>
      </div>

      <!-- Table -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200">
        <app-equipment-table
          [equipments]="equipmentData.equipments()"
          [loading]="equipmentData.loading()"
          [showClient]="true"
          (edit)="openEditDialog($event)"
          (delete)="onDelete($event)"
          (maintenance)="onMaintenance($event)"
        />
      </div>
    </div>

    <!-- Create/Edit Dialog -->
    <p-dialog
      [header]="editingEquipment() ? 'Modifier equipement' : 'Nouvel equipement'"
      [(visible)]="showDialog"
      [modal]="true"
      [style]="{ width: '550px' }"
      [draggable]="false"
      [resizable]="false"
    >
      <app-equipment-form
        [equipment]="editingEquipment()"
        [clients]="clientData.clients()"
        [loading]="saving()"
        (save)="onSave($event)"
        (cancel)="closeDialog()"
      />
    </p-dialog>
  `,
})
export class EquipmentList implements OnInit {
  equipmentData = inject(EquipmentData);
  clientData = inject(ClientData);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  searchQuery = signal('');
  selectedType: number | null = null;
  showDialog = false;
  editingEquipment = signal<Equipment | null>(null);
  saving = signal(false);

  typeOptions = EQUIPMENT_TYPES;

  private searchTimeout: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    this.loadEquipments();
    this.loadClients();
  }

  loadEquipments(): void {
    const filters: EquipmentFilters = {};
    if (this.searchQuery()) filters.search = this.searchQuery();
    if (this.selectedType) filters.type = this.selectedType;

    this.equipmentData.getAll(filters).subscribe({
      error: err => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: err.message || 'Impossible de charger les équipements',
        });
      },
    });
  }

  loadClients(): void {
    this.clientData.getAll().subscribe();
  }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);

    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    this.searchTimeout = setTimeout(() => {
      this.loadEquipments();
    }, 300);
  }

  onFilterChange(): void {
    this.loadEquipments();
  }

  clearFilters(): void {
    this.searchQuery.set('');
    this.selectedType = null;
    this.loadEquipments();
  }

  openCreateDialog(): void {
    this.editingEquipment.set(null);
    this.showDialog = true;
  }

  openEditDialog(equipment: Equipment): void {
    this.editingEquipment.set(equipment);
    this.showDialog = true;
  }

  closeDialog(): void {
    this.showDialog = false;
    this.editingEquipment.set(null);
  }

  onSave(data: CreateEquipment): void {
    this.saving.set(true);
    const equipment = this.editingEquipment();

    if (equipment) {
      this.equipmentData.update(equipment.id, data).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Équipement modifié avec succès',
          });
          this.closeDialog();
          this.saving.set(false);
        },
        error: err => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: err.message || 'Impossible de modifier l\'équipement',
          });
          this.saving.set(false);
        },
      });
    } else {
      this.equipmentData.create(data).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Équipement créé avec succès',
          });
          this.closeDialog();
          this.saving.set(false);
        },
        error: err => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: err.message || 'Impossible de créer l\'équipement',
          });
          this.saving.set(false);
        },
      });
    }
  }

  onDelete(equipment: Equipment): void {
    this.confirmationService.confirm({
      message: `Êtes-vous sûr de vouloir supprimer l'équipement "${equipment.brand} ${equipment.model}" ?`,
      header: 'Confirmation de suppression',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Supprimer',
      rejectLabel: 'Annuler',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.equipmentData.delete(equipment.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Succès',
              detail: 'Équipement supprimé avec succès',
            });
          },
          error: err => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: err.message || 'Impossible de supprimer l\'équipement',
            });
          },
        });
      },
    });
  }

  onMaintenance(equipment: Equipment): void {
    this.confirmationService.confirm({
      message: `Marquer l'équipement "${equipment.brand} ${equipment.model}" comme maintenancé ?`,
      header: 'Confirmer la maintenance',
      icon: 'pi pi-wrench',
      acceptLabel: 'Confirmer',
      rejectLabel: 'Annuler',
      accept: () => {
        this.equipmentData.markAsMaintained(equipment.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Succès',
              detail: 'Maintenance enregistrée avec succès',
            });
          },
          error: err => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: err.message || 'Impossible d\'enregistrer la maintenance',
            });
          },
        });
      },
    });
  }
}
