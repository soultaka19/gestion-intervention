import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ClientData } from '../../services/client-data';
import { Client, CreateClient } from '../../models/client';
import { ClientTable } from '../client-table/client-table';
import { ClientForm } from '../client-form/client-form';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [
    ButtonModule,
    InputTextModule,
    DialogModule,
    ConfirmDialogModule,
    ToastModule,
    ClientTable,
    ClientForm,
  ],
  providers: [ConfirmationService, MessageService],
  template: `
    <p-toast />
    <p-confirmDialog />

    <div class="p-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Clients</h1>
          <p class="text-gray-500 mt-1">Gérez vos clients et leurs informations</p>
        </div>
        <p-button
          label="Nouveau client"
          icon="pi pi-plus"
          (onClick)="openCreateDialog()"
        />
      </div>

      <!-- Search -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div class="flex items-center gap-2">
          <span class="p-input-icon-left flex-1">
            <i class="pi pi-search"></i>
            <input
              pInputText
              type="text"
              class="w-full"
              placeholder="Rechercher un client par nom ou adresse..."
              [value]="searchQuery()"
              (input)="onSearch($event)"
            />
          </span>
          @if (searchQuery()) {
            <p-button
              icon="pi pi-times"
              severity="secondary"
              [text]="true"
              (onClick)="clearSearch()"
            />
          }
        </div>
      </div>

      <!-- Table -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200">
        <app-client-table
          [clients]="clientData.clients()"
          [loading]="clientData.loading()"
          (view)="onView($event)"
          (edit)="openEditDialog($event)"
          (delete)="onDelete($event)"
        />
      </div>
    </div>

    <!-- Create/Edit Dialog -->
    <p-dialog
      [header]="editingClient() ? 'Modifier le client' : 'Nouveau client'"
      [(visible)]="showDialog"
      [modal]="true"
      [style]="{ width: '500px' }"
      [draggable]="false"
      [resizable]="false"
    >
      <app-client-form
        [client]="editingClient()"
        [loading]="saving()"
        (save)="onSave($event)"
        (cancel)="closeDialog()"
      />
    </p-dialog>
  `,
})
export class ClientList implements OnInit {
  clientData = inject(ClientData);
  private router = inject(Router);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  searchQuery = signal('');
  showDialog = false;
  editingClient = signal<Client | null>(null);
  saving = signal(false);

  private searchTimeout: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    this.loadClients();
  }

  loadClients(): void {
    const search = this.searchQuery() || undefined;
    this.clientData.getAll(search).subscribe({
      error: err => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: err.message || 'Impossible de charger les clients',
        });
      },
    });
  }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);

    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    this.searchTimeout = setTimeout(() => {
      this.loadClients();
    }, 300);
  }

  clearSearch(): void {
    this.searchQuery.set('');
    this.loadClients();
  }

  onView(client: Client): void {
    this.router.navigate(['/home/clients', client.id]);
  }

  openCreateDialog(): void {
    this.editingClient.set(null);
    this.showDialog = true;
  }

  openEditDialog(client: Client): void {
    this.editingClient.set(client);
    this.showDialog = true;
  }

  closeDialog(): void {
    this.showDialog = false;
    this.editingClient.set(null);
  }

  onSave(data: CreateClient): void {
    this.saving.set(true);
    const client = this.editingClient();

    if (client) {
      this.clientData.update(client.id, data).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Client modifié avec succès',
          });
          this.closeDialog();
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
    } else {
      this.clientData.create(data).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Client créé avec succès',
          });
          this.closeDialog();
          this.saving.set(false);
        },
        error: err => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: err.message || 'Impossible de créer le client',
          });
          this.saving.set(false);
        },
      });
    }
  }

  onDelete(client: Client): void {
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
}
