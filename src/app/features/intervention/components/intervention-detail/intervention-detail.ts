import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { TechnicianData } from '../../../technician';
import {
  CompleteIntervention,
  INTERVENTION_STATUS_LABELS,
  INTERVENTION_TYPE_LABELS
} from '../../models/intervention';
import { InterventionData } from '../../services/intervention-data';
import { InterventionAssign } from '../intervention-assign/intervention-assign';
import { InterventionComplete } from '../intervention-complete/intervention-complete';

@Component({
  selector: 'app-intervention-detail',
  standalone: true,
  imports: [
    DatePipe,
    ButtonModule,
    CardModule,
    TagModule,
    DialogModule,
    ConfirmDialogModule,
    ToastModule,
    InterventionAssign,
    InterventionComplete,
  ],
  providers: [ConfirmationService, MessageService],
  template: `
    <p-toast />
    <p-confirmDialog />

    <div class="p-6">
      <!-- Header -->
      <div class="flex items-center gap-4 mb-6">
        <p-button
          icon="pi pi-arrow-left"
          [rounded]="true"
          [text]="true"
          severity="secondary"
          (onClick)="goBack()"
        />
        <div class="flex-1">
          <h1 class="text-2xl font-bold text-gray-900">Détails de l'intervention</h1>
          <p class="text-gray-500 mt-1">
            @if (intervention()) {
              {{ intervention()!.clientName }}
            }
          </p>
        </div>
        @if (intervention()) {
          <div class="flex gap-2">
            @if (intervention()!.status === 0) {
              <p-button
                label="Affecter"
                icon="pi pi-user-plus"
                severity="success"
                (onClick)="openAssignDialog()"
              />
            }
            @if (intervention()!.status === 1 || intervention()!.status === 2) {
              <p-button
                label="Itinéraire"
                icon="pi pi-map"
                severity="help"
                (onClick)="goToRoute()"
              />
            }
            @if (intervention()!.status === 1) {
              <p-button
                label="Démarrer"
                icon="pi pi-play"
                severity="info"
                (onClick)="onStart()"
              />
            }
            @if (intervention()!.status === 2) {
              <p-button
                label="Terminer"
                icon="pi pi-check"
                severity="success"
                (onClick)="openCompleteDialog()"
              />
            }
            @if (intervention()!.status < 2) {
              <p-button
                label="Annuler"
                icon="pi pi-times"
                severity="danger"
                [outlined]="true"
                (onClick)="onCancel()"
              />
            }
          </div>
        }
      </div>

      @if (interventionData.loading()) {
        <div class="flex items-center justify-center py-12">
          <i class="pi pi-spin pi-spinner text-4xl text-indigo-600"></i>
        </div>
      } @else if (intervention()) {
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Informations principales -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Détails intervention -->
            <p-card>
              <ng-template pTemplate="header">
                <div class="px-6 py-4 border-b border-gray-200">
                  <h2 class="text-lg font-semibold text-gray-900">Informations</h2>
                </div>
              </ng-template>

              <div class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="text-sm text-gray-500">Type</label>
                    <div class="mt-1">
                      <p-tag
                        [value]="getTypeLabel(intervention()!.type)"
                        [severity]="getTypeSeverity(intervention()!.type)"
                      />
                    </div>
                  </div>
                  <div>
                    <label class="text-sm text-gray-500">Statut</label>
                    <div class="mt-1">
                      <p-tag
                        [value]="getStatusLabel(intervention()!.status)"
                        [severity]="getStatusSeverity(intervention()!.status)"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label class="text-sm text-gray-500">Description</label>
                  <p class="mt-1 text-gray-900">{{ intervention()!.description }}</p>
                </div>

                @if (intervention()!.notes) {
                  <div>
                    <label class="text-sm text-gray-500">Notes internes</label>
                    <p class="mt-1 text-gray-700">{{ intervention()!.notes }}</p>
                  </div>
                }

                @if (intervention()!.report) {
                  <div>
                    <label class="text-sm text-gray-500">Rapport d'intervention</label>
                    <p class="mt-1 text-gray-700">{{ intervention()!.report }}</p>
                  </div>
                }
              </div>
            </p-card>

            <!-- Équipement -->
            @if (intervention()!.equipmentId) {
              <p-card>
                <ng-template pTemplate="header">
                  <div class="px-6 py-4 border-b border-gray-200">
                    <h2 class="text-lg font-semibold text-gray-900">Équipement concerné</h2>
                  </div>
                </ng-template>

                <div class="flex items-center gap-4">
                  <div
                    class="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center"
                  >
                    <i class="pi pi-cog text-xl text-indigo-600"></i>
                  </div>
                  <div>
                    <p class="font-medium text-gray-900">
                      {{ intervention()!.equipmentBrand }} {{ intervention()!.equipmentModel }}
                    </p>
                    @if (intervention()!.equipmentInfo) {
                      <p class="text-sm text-gray-500">
                        {{ intervention()!.equipmentInfo }}
                      </p>
                    }
                  </div>
                </div>
              </p-card>
            }
          </div>

          <!-- Sidebar -->
          <div class="space-y-6">
            <!-- Client -->
            <p-card>
              <ng-template pTemplate="header">
                <div class="px-6 py-4 border-b border-gray-200">
                  <h2 class="text-lg font-semibold text-gray-900">Client</h2>
                </div>
              </ng-template>

              <div class="space-y-3">
                <div class="flex items-center gap-3">
                  <i class="pi pi-building text-gray-400"></i>
                  <span class="text-gray-900">{{ intervention()!.clientName }}</span>
                </div>
                <div class="flex items-start gap-3">
                  <i class="pi pi-map-marker text-gray-400"></i>
                  <span class="text-gray-700">{{ intervention()!.clientAddress }}</span>
                </div>
              </div>
            </p-card>

            <!-- Planification -->
            <p-card>
              <ng-template pTemplate="header">
                <div class="px-6 py-4 border-b border-gray-200">
                  <h2 class="text-lg font-semibold text-gray-900">Planification</h2>
                </div>
              </ng-template>

              <div class="space-y-3">
                @if (intervention()!.technicianName) {
                  <div class="flex items-center gap-3">
                    <i class="pi pi-user text-gray-400"></i>
                    <span class="text-gray-900">{{ intervention()!.technicianName }}</span>
                  </div>
                } @else {
                  <p class="text-gray-500 italic">Aucun technicien assigné</p>
                }

                @if (intervention()!.scheduledDate) {
                  <div class="flex items-center gap-3">
                    <i class="pi pi-calendar text-gray-400"></i>
                    <span class="text-gray-700">
                      {{ intervention()!.scheduledDate | date:'dd/MM/yyyy' }}
                    </span>
                  </div>
                  @if (intervention()!.scheduledStartTime) {
                    <div class="flex items-center gap-3">
                      <i class="pi pi-clock text-gray-400"></i>
                      <span class="text-gray-700">
                        {{ formatTime(intervention()!.scheduledStartTime!) }}
                        @if (intervention()!.scheduledEndTime) {
                          - {{ formatTime(intervention()!.scheduledEndTime!) }}
                        }
                      </span>
                    </div>
                  }
                } @else {
                  <p class="text-gray-500 italic">Non planifiée</p>
                }
              </div>
            </p-card>

            <!-- Historique -->
            <p-card>
              <ng-template pTemplate="header">
                <div class="px-6 py-4 border-b border-gray-200">
                  <h2 class="text-lg font-semibold text-gray-900">Historique</h2>
                </div>
              </ng-template>

              <div class="space-y-3 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-500">Créée le</span>
                  <span class="text-gray-900">
                    {{ intervention()!.createdAt | date:'dd/MM/yyyy HH:mm' }}
                  </span>
                </div>
                @if (intervention()!.startedAt) {
                  <div class="flex justify-between">
                    <span class="text-gray-500">Démarrée le</span>
                    <span class="text-gray-900">
                      {{ intervention()!.startedAt | date:'dd/MM/yyyy HH:mm' }}
                    </span>
                  </div>
                }
                @if (intervention()!.completedAt) {
                  <div class="flex justify-between">
                    <span class="text-gray-500">Terminée le</span>
                    <span class="text-gray-900">
                      {{ intervention()!.completedAt | date:'dd/MM/yyyy HH:mm' }}
                    </span>
                  </div>
                }
              </div>
            </p-card>
          </div>
        </div>
      } @else {
        <div class="text-center py-12">
          <i class="pi pi-exclamation-circle text-4xl text-gray-400 mb-4"></i>
          <p class="text-gray-500">Intervention non trouvée</p>
        </div>
      }
    </div>

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

    <!-- Complete Dialog -->
    <p-dialog
      header="Terminer l'intervention"
      [(visible)]="showCompleteDialog"
      [modal]="true"
      [style]="{ width: '500px' }"
      [draggable]="false"
      [resizable]="false"
    >
      <app-intervention-complete
        [loading]="saving()"
        (save)="onComplete($event)"
        (cancel)="closeCompleteDialog()"
      />
    </p-dialog>
  `,
})
export class InterventionDetail implements OnInit {
  interventionData = inject(InterventionData);
  technicianData = inject(TechnicianData);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  intervention = this.interventionData.selectedIntervention;
  showAssignDialog = false;
  showCompleteDialog = false;
  saving = signal(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadIntervention(id);
    }
    // F-7 — la liste des techniciens n'etait chargee nulle part. En arrivant
    // sur la page depuis la liste, le cache du service etait deja rempli par
    // l'ecran precedent et le dialogue « Affecter » paraissait fonctionner ; en
    // acces DIRECT a l'URL — un rechargement, un lien partage —, le cache etait
    // vide et le dialogue s'ouvrait sans aucun technicien, sans message d'erreur.
    this.loadTechnicians();
  }

  loadIntervention(id: string): void {
    this.interventionData.getById(id).subscribe({
      error: err => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: err.message || 'Impossible de charger l\'intervention',
        });
      },
    });
  }

  loadTechnicians(): void {
    this.technicianData.getAll().subscribe();
  }

  goBack(): void {
    this.router.navigate(['/home/interventions']);
  }

  goToRoute(): void {
    const i = this.intervention();
    if (!i) return;
    this.router.navigate(['/home/carte'], {
      queryParams: {
        interventionId: i.id,
        technicianId: i.technicianId,
        lat: i.clientLatitude,
        lng: i.clientLongitude,
        clientName: i.clientName,
      },
    });
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

  formatTime(time: string): string {
    return time.substring(0, 5);
  }

  openAssignDialog(): void {
    this.showAssignDialog = true;
  }

  closeAssignDialog(): void {
    this.showAssignDialog = false;
  }

  onAssign(data: any): void {
    const intervention = this.intervention();
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

  onStart(): void {
    const intervention = this.intervention();
    if (!intervention) return;

    this.confirmationService.confirm({
      message: 'Êtes-vous sûr de vouloir démarrer cette intervention ?',
      header: 'Confirmation',
      icon: 'pi pi-play',
      acceptLabel: 'Démarrer',
      rejectLabel: 'Annuler',
      accept: () => {
        this.interventionData.start(intervention.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Succès',
              detail: 'Intervention démarrée',
            });
          },
          error: err => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: err.message || 'Impossible de démarrer l\'intervention',
            });
          },
        });
      },
    });
  }

  openCompleteDialog(): void {
    this.showCompleteDialog = true;
  }

  closeCompleteDialog(): void {
    this.showCompleteDialog = false;
  }

  onComplete(data: CompleteIntervention): void {
    const intervention = this.intervention();
    if (!intervention) return;

    this.saving.set(true);
    this.interventionData.complete(intervention.id, data).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Intervention terminée avec succès',
        });
        this.closeCompleteDialog();
        this.saving.set(false);
      },
      error: err => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: err.message || 'Impossible de terminer l\'intervention',
        });
        this.saving.set(false);
      },
    });
  }

  onCancel(): void {
    const intervention = this.intervention();
    if (!intervention) return;

    this.confirmationService.confirm({
      message: 'Êtes-vous sûr de vouloir annuler cette intervention ?',
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
