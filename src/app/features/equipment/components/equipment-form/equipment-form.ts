import { Component, input, output, effect, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { Equipment, CreateEquipment, EquipmentType, EquipmentTypeOption } from '../../models/equipment';
import { Client } from '../../../client/models/client';

@Component({
  selector: 'app-equipment-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    SelectModule,
    DatePickerModule,
  ],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
      <!-- Client (si pas pré-sélectionné) -->
      @if (!preselectedClientId() && clients().length > 0) {
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
          />
          @if (form.get('clientId')?.invalid && form.get('clientId')?.touched) {
            <small class="text-red-500 text-xs">Le client est requis</small>
          }
        </div>
      }

      <!-- Type d'équipement -->
      <div>
        <label for="type" class="block text-sm font-medium text-gray-700 mb-1">
          Type d'équipement <span class="text-red-500">*</span>
        </label>
        <p-select
          id="type"
          formControlName="type"
          [options]="equipmentTypes()"
          optionLabel="label"
          optionValue="value"
          placeholder="Sélectionnez un type"
          styleClass="w-full"
        />
        @if (form.get('type')?.invalid && form.get('type')?.touched) {
          <small class="text-red-500 text-xs">Le type est requis</small>
        }
      </div>

      <!-- Marque et Modèle -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label for="brand" class="block text-sm font-medium text-gray-700 mb-1">
            Marque <span class="text-red-500">*</span>
          </label>
          <input
            pInputText
            id="brand"
            formControlName="brand"
            class="w-full"
            placeholder="Ex: Viessmann"
          />
          @if (form.get('brand')?.invalid && form.get('brand')?.touched) {
            <small class="text-red-500 text-xs">La marque est requise</small>
          }
        </div>
        <div>
          <label for="model" class="block text-sm font-medium text-gray-700 mb-1">
            Modèle <span class="text-red-500">*</span>
          </label>
          <input
            pInputText
            id="model"
            formControlName="model"
            class="w-full"
            placeholder="Ex: Vitodens 200-W"
          />
          @if (form.get('model')?.invalid && form.get('model')?.touched) {
            <small class="text-red-500 text-xs">Le modèle est requis</small>
          }
        </div>
      </div>

      <!-- Numéro de série -->
      <div>
        <label for="serialNumber" class="block text-sm font-medium text-gray-700 mb-1">
          Numéro de série <span class="text-red-500">*</span>
        </label>
        <input
          pInputText
          id="serialNumber"
          formControlName="serialNumber"
          class="w-full"
          placeholder="Ex: VD200W-2024-78542"
        />
        @if (form.get('serialNumber')?.invalid && form.get('serialNumber')?.touched) {
          <small class="text-red-500 text-xs">Le numéro de série est requis</small>
        }
      </div>

      <!-- Dates -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label for="installationDate" class="block text-sm font-medium text-gray-700 mb-1">
            Date d'installation
          </label>
          <p-datepicker
            id="installationDate"
            formControlName="installationDate"
            dateFormat="dd/mm/yy"
            [showIcon]="true"
            styleClass="w-full"
          />
        </div>
        <div>
          <label for="warrantyEndDate" class="block text-sm font-medium text-gray-700 mb-1">
            Fin de garantie
          </label>
          <p-datepicker
            id="warrantyEndDate"
            formControlName="warrantyEndDate"
            dateFormat="dd/mm/yy"
            [showIcon]="true"
            styleClass="w-full"
          />
        </div>
      </div>

      <!-- Notes -->
      <div>
        <label for="notes" class="block text-sm font-medium text-gray-700 mb-1">
          Notes
        </label>
        <textarea
          pTextarea
          id="notes"
          formControlName="notes"
          class="w-full"
          rows="3"
          placeholder="Ex: Chaudière gaz condensation 26kW"
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
          [label]="equipment() ? 'Modifier' : 'Créer'"
          [loading]="loading()"
          [disabled]="form.invalid || loading()"
        />
      </div>
    </form>
  `,
})
export class EquipmentForm implements OnInit {
  private fb = inject(FormBuilder);

  equipment = input<Equipment | null>(null);
  preselectedClientId = input<string | null>(null);
  clients = input<Client[]>([]);
  loading = input(false);

  save = output<CreateEquipment>();
  cancel = output<void>();

  equipmentTypes: () => { label: string; value: EquipmentType }[] = () => [
    { label: 'Chaudière', value: 'Chaudiere' },
    { label: 'Radiateur', value: 'Radiateur' },
    { label: 'Climatisation', value: 'Climatisation' },
    { label: 'Pompe à chaleur', value: 'PompeAChaleur' },
    { label: 'Chauffe-eau', value: 'ChauffeEau' },
    { label: 'Ventilation', value: 'Ventilation' },
    { label: 'Autre', value: 'Autre' },
  ];

  form: FormGroup = this.fb.group({
    clientId: ['', Validators.required],
    type: ['', Validators.required],
    brand: ['', Validators.required],
    model: ['', Validators.required],
    serialNumber: ['', Validators.required],
    installationDate: [null],
    warrantyEndDate: [null],
    notes: [''],
  });

  constructor() {
    effect(() => {
      const equipment = this.equipment();
      if (equipment) {
        this.form.patchValue({
          clientId: equipment.clientId,
          type: equipment.type,
          brand: equipment.brand,
          model: equipment.model,
          serialNumber: equipment.serialNumber,
          installationDate: equipment.installationDate ? new Date(equipment.installationDate) : null,
          warrantyEndDate: equipment.warrantyEndDate ? new Date(equipment.warrantyEndDate) : null,
          notes: equipment.notes || '',
        });
      } else {
        this.form.reset();
        const clientId = this.preselectedClientId();
        if (clientId) {
          this.form.patchValue({ clientId });
        }
      }
    });
  }

  ngOnInit(): void {
    const clientId = this.preselectedClientId();
    if (clientId) {
      this.form.patchValue({ clientId });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    const formValue = this.form.value;
    const data: CreateEquipment = {
      clientId: formValue.clientId,
      type: formValue.type,
      brand: formValue.brand,
      model: formValue.model,
      serialNumber: formValue.serialNumber,
      installationDate: formValue.installationDate
        ? this.formatDate(formValue.installationDate)
        : null,
      warrantyEndDate: formValue.warrantyEndDate
        ? this.formatDate(formValue.warrantyEndDate)
        : null,
      notes: formValue.notes || null,
    };

    this.save.emit(data);
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
