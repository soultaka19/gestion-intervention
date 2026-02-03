import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { SkeletonModule } from 'primeng/skeleton';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ClientData } from '../../services/client-data';
import { Client, CreateClient } from '../../models/client';
import { ClientForm } from '../client-form/client-form';

@Component({
  selector: 'app-client-detail',
  standalone: true,
  imports: [
    ButtonModule,
    CardModule,
    TagModule,
    DialogModule,
    ConfirmDialogModule,
    ToastModule,
    SkeletonModule,
    ClientForm,
  ],
  providers: [ConfirmationService, MessageService],
  template: `
    <p-toast />
    <p-confirmDialog />

    <div class="p-6">
      <!-- Back button -->
      <div class="mb-4">
        <p-button
          label="Retour aux clients"
          icon="pi pi-arrow-left"
          [text]="true"
          (onClick)="goBack()"
        />
      </div>

      @if (clientData.loading() && !client()) {
        <!-- Loading skeleton -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p-skeleton width="200px" height="2rem" styleClass="mb-4" />
          <p-skeleton width="100%" height="1rem" styleClass="mb-2" />
          <p-skeleton width="80%" height="1rem" styleClass="mb-2" />
          <p-skeleton width="60%" height="1rem" />
        </div>
      } @else if (client(); as c) {
        <!-- Client info card -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <!-- Header -->
          <div class="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
            <div class="flex items-center justify-between">
              <div>
                <h1 class="text-2xl font-bold text-white">{{ c.name }}</h1>
                <p class="text-white/80 mt-1">{{ c.address }}, {{ c.postalCode }} {{ c.city }}</p>
              </div>
              <div class="flex gap-2">
                <p-button
                  icon="pi pi-pencil"
                  severity="secondary"
                  [rounded]="true"
                  (onClick)="openEditDialog()"
                />
                <p-button
                  icon="pi pi-trash"
                  severity="danger"
                  [rounded]="true"
                  (onClick)="onDelete()"
                />
              </div>
            </div>
          </div>

          <!-- Content -->
          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <!-- Contact -->
              <div>
                <h3 class="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                  Contact
                </h3>
                <div class="space-y-2">
                  <div class="flex items-center gap-2">
                    <i class="pi pi-phone text-gray-400"></i>
                    <a [href]="'tel:' + c.phone" class="text-indigo-600 hover:text-indigo-800">
                      {{ c.phone }}
                    </a>
                  </div>
                  <div class="flex items-center gap-2">
                    <i class="pi pi-envelope text-gray-400"></i>
                    <a [href]="'mailto:' + c.email" class="text-indigo-600 hover:text-indigo-800">
                      {{ c.email }}
                    </a>
                  </div>
                </div>
              </div>

              <!-- Location -->
              <div>
                <h3 class="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                  Localisation
                </h3>
                <div class="space-y-2">
                  <div class="flex items-center gap-2">
                    <i class="pi pi-map-marker text-gray-400"></i>
                    <span class="text-gray-700">{{ c.address }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <i class="pi pi-building text-gray-400"></i>
                    <span class="text-gray-700">{{ c.postalCode }} {{ c.city }}</span>
                  </div>
                  @if (c.latitude && c.longitude) {
                    <div class="flex items-center gap-2">
                      <i class="pi pi-compass text-gray-400"></i>
                      <span class="text-gray-500 text-sm">
                        {{ c.latitude.toFixed(4) }}, {{ c.longitude.toFixed(4) }}
                      </span>
                    </div>
                  }
                </div>
              </div>

              <!-- Stats -->
              <div>
                <h3 class="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                  Statistiques
                </h3>
                <div class="space-y-2">
                  <div class="flex items-center gap-2">
                    <i class="pi pi-box text-gray-400"></i>
                    <span class="text-gray-700">{{ c.equipmentCount }} équipement(s)</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <i class="pi pi-calendar text-gray-400"></i>
                    <span class="text-gray-500 text-sm">
                      Client depuis le {{ formatDate(c.createdAt) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Notes -->
            @if (c.notes) {
              <div class="mt-6 pt-6 border-t border-gray-200">
                <h3 class="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                  Notes
                </h3>
                <p class="text-gray-700 bg-gray-50 p-4 rounded-lg">{{ c.notes }}</p>
              </div>
            }
          </div>
        </div>

        <!-- Equipments section (placeholder for iteration 3) -->
        <div class="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-gray-900">Équipements</h2>
            <p-button
              label="Ajouter un équipement"
              icon="pi pi-plus"
              [outlined]="true"
              size="small"
              [disabled]="true"
            />
          </div>
          <div class="text-center py-8 text-gray-500">
            <i class="pi pi-box text-4xl mb-2 block text-gray-300"></i>
            <p>Les équipements seront disponibles dans la prochaine itération</p>
          </div>
        </div>
      } @else {
        <!-- Not found -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <i class="pi pi-exclamation-circle text-4xl text-gray-300 mb-4"></i>
          <h2 class="text-xl font-semibold text-gray-700 mb-2">Client non trouvé</h2>
          <p class="text-gray-500 mb-4">Le client demandé n'existe pas ou a été supprimé.</p>
          <p-button label="Retour aux clients" (onClick)="goBack()" />
        </div>
      }
    </div>

    <!-- Edit Dialog -->
    <p-dialog
      header="Modifier le client"
      [(visible)]="showEditDialog"
      [modal]="true"
      [style]="{ width: '500px' }"
      [draggable]="false"
      [resizable]="false"
    >
      <app-client-form
        [client]="client()"
        [loading]="saving()"
        (save)="onSave($event)"
        (cancel)="closeEditDialog()"
      />
    </p-dialog>
  `,
})
export class ClientDetail implements OnInit {
  clientData = inject(ClientData);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  client = this.clientData.selectedClient;
  showEditDialog = false;
  saving = signal(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.clientData.getById(id).subscribe({
        error: err => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: err.message || 'Impossible de charger le client',
          });
        },
      });
    }
  }

  goBack(): void {
    this.clientData.clearSelection();
    this.router.navigate(['/home/clients']);
  }

  openEditDialog(): void {
    this.showEditDialog = true;
  }

  closeEditDialog(): void {
    this.showEditDialog = false;
  }

  onSave(data: CreateClient): void {
    const client = this.client();
    if (!client) return;

    this.saving.set(true);
    this.clientData.update(client.id, data).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Client modifié avec succès',
        });
        this.closeEditDialog();
        this.saving.set(false);
      },
      error: err => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: err.message || 'Impossible de modifier le client',
        });
        this.saving.set(false);
      },
    });
  }

  onDelete(): void {
    const client = this.client();
    if (!client) return;

    this.confirmationService.confirm({
      message: `Êtes-vous sûr de vouloir supprimer le client "${client.name}" ?`,
      header: 'Confirmation de suppression',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Supprimer',
      rejectLabel: 'Annuler',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.clientData.delete(client.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Succès',
              detail: 'Client supprimé avec succès',
            });
            this.goBack();
          },
          error: err => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: err.message || 'Impossible de supprimer le client',
            });
          },
        });
      },
    });
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
}
