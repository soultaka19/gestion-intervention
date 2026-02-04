import { Component, input, output, effect, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { Client } from '../../../client/models/client';
import { Equipment } from '../../../equipment/models/equipment';
import {
  Intervention,
  CreateIntervention,
  INTERVENTION_TYPES,
} from '../../models/intervention';

@Component({
  selector: 'app-intervention-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    SelectModule,
  ],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
      <!-- Client -->
      @if (!intervention()) {
        <div>
          <label for="clientId" class="block text-sm font-medium text-gray-700 mb-1">
            Client <span class="text-red-500">*</span>
          </label>
          <p-select
            id="clientId"
            formControlName="clientId"
            [options]="clients()"
            optionLabel="name"
            optionValue="id"
            placeholder="Sélectionnez un client"
            styleClass="w-full"
            [filter]="true"
            filterPlaceholder="Rechercher..."
            (onChange)="onClientChange($event.value)"
          />
          @if (form.get('clientId')?.invalid && form.get('clientId')?.touched) {
            <small class="text-red-500 text-xs">Le client est requis</small>
          }
        </div>
      }

      <!-- Équipement (optionnel) -->
      <div>
        <label for="equipmentId" class="block text-sm font-medium text-gray-700 mb-1">
          Équipement (optionnel)
        </label>
        <p-select
          id="equipmentId"
          formControlName="equipmentId"
          [options]="filteredEquipments()"
          optionLabel="displayName"
          optionValue="id"
          placeholder="Sélectionnez un équipement"
          styleClass="w-full"
          [showClear]="true"
        />
      </div>

      <!-- Type d'intervention -->
      <div>
        <label for="type" class="block text-sm font-medium text-gray-700 mb-1">
          Type d'intervention <span class="text-red-500">*</span>
        </label>
        <p-select
          id="type"
          formControlName="type"
          [options]="interventionTypes"
          optionLabel="label"
          optionValue="value"
          placeholder="Sélectionnez un type"
          styleClass="w-full"
        />
        @if (form.get('type')?.invalid && form.get('type')?.touched) {
          <small class="text-red-500 text-xs">Le type est requis</small>
        }
      </div>

      <!-- Description -->
      <div>
        <label for="description" class="block text-sm font-medium text-gray-700 mb-1">
          Description <span class="text-red-500">*</span>
        </label>
        <textarea
          pTextarea
          id="description"
          formControlName="description"
          class="w-full"
          rows="3"
          placeholder="Décrivez le motif de l'intervention..."
        ></textarea>
        @if (form.get('description')?.invalid && form.get('description')?.touched) {
          <small class="text-red-500 text-xs">La description est requise</small>
        }
      </div>

      <!-- Notes -->
      <div>
        <label for="notes" class="block text-sm font-medium text-gray-700 mb-1">
          Notes internes
        </label>
        <textarea
          pTextarea
          id="notes"
          formControlName="notes"
          class="w-full"
          rows="2"
          placeholder="Notes pour le planificateur..."
        ></textarea>
      </div>

      <!-- Actions -->
      <div class="flex justify-end gap-2 pt-4">
        <p-button
          type="button"
          label="Annuler"
          severity="secondary"
          [outlined]="true"
          (onClick)="cancel.emit()"
        />
        <p-button
          type="submit"
          [label]="intervention() ? 'Modifier' : 'Créer'"
          [loading]="loading()"
          [disabled]="form.invalid || loading()"
        />
      </div>
    </form>
  `,
})
export class InterventionForm {
  private fb = inject(FormBuilder);

  intervention = input<Intervention | null>(null);
  clients = input<Client[]>([]);
  equipments = input<Equipment[]>([]);
  loading = input(false);

  save = output<CreateIntervention>();
  cancel = output<void>();

  interventionTypes = INTERVENTION_TYPES;
  filteredEquipments = input<{ id: string; displayName: string }[]>([]);

  form: FormGroup = this.fb.group({
    clientId: ['', Validators.required],
    equipmentId: [null],
    type: [null, Validators.required],
    description: ['', Validators.required],
    notes: [''],
  });

  private selectedClientId: string | null = null;

  constructor() {
    effect(() => {
      const intervention = this.intervention();
      if (intervention) {
        this.form.patchValue({
          clientId: intervention.clientId,
          equipmentId: intervention.equipmentId,
          type: intervention.type,
          description: intervention.description,
          notes: intervention.notes || '',
        });
        this.selectedClientId = intervention.clientId;
      } else {
        this.form.reset();
        this.selectedClientId = null;
      }
    });
  }

  onClientChange(clientId: string): void {
    this.selectedClientId = clientId;
    this.form.patchValue({ equipmentId: null });
  }

  getFilteredEquipments(): { id: string; displayName: string }[] {
    if (!this.selectedClientId) return [];
    return this.equipments()
      .filter(e => e.clientId === this.selectedClientId)
      .map(e => ({
        id: e.id,
        displayName: `${e.brand} ${e.model} (${e.serialNumber})`,
      }));
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    const formValue = this.form.value;
    const data: CreateIntervention = {
      clientId: formValue.clientId,
      equipmentId: formValue.equipmentId || null,
      type: formValue.type,
      description: formValue.description,
      notes: formValue.notes || null,
    };

    this.save.emit(data);
  }
}
