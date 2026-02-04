import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TechnicianData } from '../../services/technician-data';
import { Technician, CreateTechnician, UpdateTechnician } from '../../models/technician';
import { TechnicianTable } from '../technician-table/technician-table';
import { TechnicianForm } from '../technician-form/technician-form';

@Component({
  selector: 'app-technician-list',
  standalone: true,
  imports: [
    FormsModule,
    ButtonModule,
    CheckboxModule,
    DialogModule,
    ConfirmDialogModule,
    ToastModule,
    TechnicianTable,
    TechnicianForm,
  ],
  providers: [ConfirmationService, MessageService],
  template: `
    <p-toast />
    <p-confirmDialog />

    <div class="p-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Techniciens</h1>
          <p class="text-gray-500 mt-1">Gérez les techniciens de votre équipe</p>
        </div>
        <p-button
          label="Nouveau technicien"
          icon="pi pi-plus"
          (onClick)="openCreateDialog()"
        />
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2">
            <p-checkbox
              [(ngModel)]="showInactive"
              [binary]="true"
              inputId="showInactive"
              (onChange)="loadTechnicians()"
            />
            <label for="showInactive" class="text-sm text-gray-700 cursor-pointer">
              Afficher les inactifs
            </label>
          </div>

          <div class="ml-auto text-sm text-gray-600">
            {{ technicianData.technicians().length }} technicien(s)
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200">
        <app-technician-table
          [technicians]="technicianData.technicians()"
          [loading]="technicianData.loading()"
          (edit)="openEditDialog($event)"
          (delete)="onDelete($event)"
        />
      </div>
    </div>

    <!-- Create/Edit Dialog -->
    <p-dialog
      [header]="editingTechnician() ? 'Modifier le technicien' : 'Nouveau technicien'"
      [(visible)]="showDialog"
      [modal]="true"
      [style]="{ width: '450px' }"
      [draggable]="false"
      [resizable]="false"
    >
      <app-technician-form
        [technician]="editingTechnician()"
        [loading]="saving()"
        (saveCreate)="onCreate($event)"
        (saveUpdate)="onUpdate($event)"
        (cancel)="closeDialog()"
      />
    </p-dialog>
  `,
})
export class TechnicianList implements OnInit {
  technicianData = inject(TechnicianData);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  showInactive = false;
  showDialog = false;
  editingTechnician = signal<Technician | null>(null);
  saving = signal(false);

  ngOnInit(): void {
    this.loadTechnicians();
  }

  loadTechnicians(): void {
    this.technicianData.getAll(!this.showInactive).subscribe({
      error: err => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: err.message || 'Impossible de charger les techniciens',
        });
      },
    });
  }

  openCreateDialog(): void {
    this.editingTechnician.set(null);
    this.showDialog = true;
  }

  openEditDialog(technician: Technician): void {
    this.editingTechnician.set(technician);
    this.showDialog = true;
  }

  closeDialog(): void {
    this.showDialog = false;
    this.editingTechnician.set(null);
  }

  onCreate(data: CreateTechnician): void {
    this.saving.set(true);
    this.technicianData.create(data).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Technicien créé avec succès',
        });
        this.closeDialog();
        this.saving.set(false);
      },
      error: err => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: err.message || 'Impossible de créer le technicien',
        });
        this.saving.set(false);
      },
    });
  }

  onUpdate(data: UpdateTechnician): void {
    const technician = this.editingTechnician();
    if (!technician) return;

    this.saving.set(true);
    this.technicianData.update(technician.id, data).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Technicien modifié avec succès',
        });
        this.closeDialog();
        this.saving.set(false);
      },
      error: err => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: err.message || 'Impossible de modifier le technicien',
        });
        this.saving.set(false);
      },
    });
  }

  onDelete(technician: Technician): void {
    this.confirmationService.confirm({
      message: `Êtes-vous sûr de vouloir désactiver ${technician.firstName} ${technician.lastName} ?`,
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Désactiver',
      rejectLabel: 'Annuler',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.technicianData.delete(technician.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Succès',
              detail: 'Technicien désactivé',
            });
            this.loadTechnicians();
          },
          error: err => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: err.message || 'Impossible de désactiver le technicien',
            });
          },
        });
      },
    });
  }
}
