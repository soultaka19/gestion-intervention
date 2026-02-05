import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { ClientData } from '../../../client/services/client-data';
import { EquipmentData } from '../../../equipment/services/equipment-data';
import { TechnicianData } from '../../../technician/services/technician-data';
import {
  AssignTechnician,
  CreateIntervention,
  Intervention,
  INTERVENTION_STATUSES,
  InterventionFilters,
} from '../../models/intervention';
import { InterventionData } from '../../services/intervention-data';
import { InterventionAssign } from '../intervention-assign/intervention-assign';
import { InterventionForm } from '../intervention-form/intervention-form';
import { InterventionTable } from '../intervention-table/intervention-table';

@Component({
  selector: 'app-intervention-list',
  standalone: true,
  imports: [
    FormsModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    DialogModule,
    ConfirmDialogModule,
    ToastModule,
    InterventionTable,
    InterventionForm,
    InterventionAssign,
  ],
  providers: [ConfirmationService, MessageService],
  template: `
    <p-toast />
    <p-confirmDialog />

    <div class="p-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Interventions</h1>
          <p class="text-gray-500 mt-1">Gérez les interventions et leur planification</p>
        </div>
        <p-button
          label="Nouvelle intervention"
          icon="pi pi-plus"
          (onClick)="openCreateDialog()"
        />
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <!-- Status filter -->
          <div class="w-full sm:w-48">
            <p-select
              [options]="statusOptions"
              [(ngModel)]="selectedStatus"
              placeholder="Tous les statuts"
              optionLabel="label"
              optionValue="value"
              [showClear]="true"
              styleClass="w-full"
              (onChange)="onFilterChange()"
            />
          </div>

          <!-- Clear filters -->
          @if (selectedStatus !== null) {
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
        <app-intervention-table
          [interventions]="interventionData.interventions()"
          [loading]="interventionData.loading()"
          (view)="onView($event)"
          (edit)="openEditDialog($event)"
          (assign)="openAssignDialog($event)"
          (cancel)="onCancel($event)"
        />
      </div>
    </div>

    <!-- Create/Edit Dialog -->
    <p-dialog
      [header]="editingIntervention() ? 'Modifier intervention' : 'Nouvelle intervention'"
      [(visible)]="showDialog"
      [modal]="true"
      [style]="{ width: '550px' }"
      [draggable]="false"
      [resizable]="false"
    >
      <app-intervention-form
        [intervention]="editingIntervention()"
        [clients]="clientData.clients()"
        [equipments]="equipmentData.equipments()"
        [loading]="saving()"
        (save)="onSave($event)"
        (cancel)="closeDialog()"
      />
    </p-dialog>

    <!-- Assign Dialog -->
    <p-dialog
      header="Affecter un technicien"
      [(visible)]="showAssignDialog"
      [modal]="true"
      [style]="{ width: '450px' }"
      [draggable]="false"
      [resizable]="false"
    >
      <app-intervention-assign
        [technicians]="technicianData.technicians()"
        [loading]="saving()"
        (save)="onAssign($event)"
        (cancel)="closeAssignDialog()"
      />
    </p-dialog>
  `,
})
export class InterventionList implements OnInit {
  interventionData = inject(InterventionData);
  clientData = inject(ClientData);
  equipmentData = inject(EquipmentData);
  technicianData = inject(TechnicianData);
  private router = inject(Router);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  selectedStatus: number | null = null;
  showDialog = false;
  showAssignDialog = false;
  editingIntervention = signal<Intervention | null>(null);
  assigningIntervention = signal<Intervention | null>(null);
  saving = signal(false);

  statusOptions = INTERVENTION_STATUSES;

  
  ngOnInit(): void {
    this.loadInterventions();
    this.loadClients();
    this.loadEquipments();
    this.loadTechnicians();
  }

  loadInterventions(): void {
    const filters: InterventionFilters = {};
    if (this.selectedStatus !== null) filters.status = this.selectedStatus;

    this.interventionData.getAll(filters).subscribe({
      error: err => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: err.message || 'Impossible de charger les interventions',
        });
      },
    });
  }

  loadTechnicians(): void {
    this.technicianData.getAll().subscribe();
  }

  loadClients(): void {
    this.clientData.getAll().subscribe();
  }

  loadEquipments(): void {
    this.equipmentData.getAll().subscribe();
  }

  onFilterChange(): void {
    this.loadInterventions();
  }

  clearFilters(): void {
    this.selectedStatus = null;
    this.loadInterventions();
  }

  onView(intervention: Intervention): void {
    this.router.navigate(['/home/interventions', intervention.id]);
  }

  openCreateDialog(): void {
    this.editingIntervention.set(null);
    this.showDialog = true;
  }

  openEditDialog(intervention: Intervention): void {
    this.editingIntervention.set(intervention);
    this.showDialog = true;
  }

  closeDialog(): void {
    this.showDialog = false;
    this.editingIntervention.set(null);
  }

  openAssignDialog(intervention: Intervention): void {
    this.assigningIntervention.set(intervention);
    this.showAssignDialog = true;
  }

  closeAssignDialog(): void {
    this.showAssignDialog = false;
    this.assigningIntervention.set(null);
  }

  onSave(data: CreateIntervention): void {
    this.saving.set(true);
    const intervention = this.editingIntervention();

    if (intervention) {
      this.interventionData.update(intervention.id, data).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Intervention modifiée avec succès',
          });
          this.closeDialog();
          this.saving.set(false);
        },
        error: err => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: err.message || 'Impossible de modifier l\'intervention',
          });
          this.saving.set(false);
        },
      });
    } else {
      this.interventionData.create(data).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Intervention créée avec succès',
          });
          this.closeDialog();
          this.saving.set(false);
        },
        error: err => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: err.message || 'Impossible de créer l\'intervention',
          });
          this.saving.set(false);
        },
      });
    }
  }

  onAssign(data: AssignTechnician): void {
    const intervention = this.assigningIntervention();
    if (!intervention) return;

    this.saving.set(true);
    this.interventionData.assign(intervention.id, data).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Technicien affecté avec succès',
        });
        this.closeAssignDialog();
        this.saving.set(false);
        this.loadInterventions();
      },
      error: err => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: err.message || 'Impossible d\'affecter le technicien',
        });
        this.saving.set(false);
      },
    });
  }

  onCancel(intervention: Intervention): void {
    this.confirmationService.confirm({
      message: `Êtes-vous sûr de vouloir annuler cette intervention ?`,
      header: 'Confirmation d\'annulation',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Annuler l\'intervention',
      rejectLabel: 'Retour',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.interventionData.cancel(intervention.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Succès',
              detail: 'Intervention annulée',
            });
            this.loadInterventions();
          },
          error: err => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: err.message || 'Impossible d\'annuler l\'intervention',
            });
          },
        });
      },
    });
  }
}
