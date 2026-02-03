import { Component, input, output, effect, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { Client, CreateClient } from '../../models/client';

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonModule, InputTextModule, TextareaModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
      <!-- Nom -->
      <div>
        <label for="name" class="block text-sm font-medium text-gray-700 mb-1">
          Nom du client <span class="text-red-500">*</span>
        </label>
        <input
          pInputText
          id="name"
          formControlName="name"
          class="w-full"
          placeholder="Ex: Famille Dupont"
        />
        @if (form.get('name')?.invalid && form.get('name')?.touched) {
          <small class="text-red-500 text-xs">Le nom est requis</small>
        }
      </div>

      <!-- Adresse -->
      <div>
        <label for="address" class="block text-sm font-medium text-gray-700 mb-1">
          Adresse <span class="text-red-500">*</span>
        </label>
        <input
          pInputText
          id="address"
          formControlName="address"
          class="w-full"
          placeholder="Ex: 15 Rue de la Paix"
        />
        @if (form.get('address')?.invalid && form.get('address')?.touched) {
          <small class="text-red-500 text-xs">L'adresse est requise</small>
        }
      </div>

      <!-- Ville et Code postal -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label for="city" class="block text-sm font-medium text-gray-700 mb-1">
            Ville <span class="text-red-500">*</span>
          </label>
          <input
            pInputText
            id="city"
            formControlName="city"
            class="w-full"
            placeholder="Ex: Paris"
          />
          @if (form.get('city')?.invalid && form.get('city')?.touched) {
            <small class="text-red-500 text-xs">La ville est requise</small>
          }
        </div>
        <div>
          <label for="postalCode" class="block text-sm font-medium text-gray-700 mb-1">
            Code postal <span class="text-red-500">*</span>
          </label>
          <input
            pInputText
            id="postalCode"
            formControlName="postalCode"
            class="w-full"
            placeholder="Ex: 75002"
          />
          @if (form.get('postalCode')?.invalid && form.get('postalCode')?.touched) {
            <small class="text-red-500 text-xs">Le code postal est requis</small>
          }
        </div>
      </div>

      <!-- Téléphone et Email -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label for="phone" class="block text-sm font-medium text-gray-700 mb-1">
            Téléphone <span class="text-red-500">*</span>
          </label>
          <input
            pInputText
            id="phone"
            formControlName="phone"
            class="w-full"
            placeholder="Ex: 01 23 45 67 89"
          />
          @if (form.get('phone')?.invalid && form.get('phone')?.touched) {
            <small class="text-red-500 text-xs">Le téléphone est requis</small>
          }
        </div>
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
            Email <span class="text-red-500">*</span>
          </label>
          <input
            pInputText
            id="email"
            type="email"
            formControlName="email"
            class="w-full"
            placeholder="Ex: client@email.fr"
          />
          @if (form.get('email')?.invalid && form.get('email')?.touched) {
            <small class="text-red-500 text-xs">Email requis et valide</small>
          }
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
          placeholder="Ex: Code portail: 1234"
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
          [label]="client() ? 'Modifier' : 'Créer'"
          [loading]="loading()"
          [disabled]="form.invalid || loading()"
        />
      </div>
    </form>
  `,
})
export class ClientForm {
  private fb = inject(FormBuilder);

  client = input<Client | null>(null);
  loading = input(false);

  save = output<CreateClient>();
  cancel = output<void>();

  form: FormGroup = this.fb.group({
    name: ['', Validators.required],
    address: ['', Validators.required],
    city: ['', Validators.required],
    postalCode: ['', Validators.required],
    phone: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    notes: [''],
  });

  constructor() {
    effect(() => {
      const client = this.client();
      if (client) {
        this.form.patchValue({
          name: client.name,
          address: client.address,
          city: client.city,
          postalCode: client.postalCode,
          phone: client.phone,
          email: client.email,
          notes: client.notes || '',
        });
      } else {
        this.form.reset();
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.save.emit(this.form.value as CreateClient);
  }
}
