import { Component, input, output, effect, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CheckboxModule } from 'primeng/checkbox';
import { Technician, CreateTechnician, UpdateTechnician } from '../../models/technician';

@Component({
  selector: 'app-technician-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    CheckboxModule,
  ],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
      <!-- Prénom -->
      <div>
        <label for="firstName" class="block text-sm font-medium text-gray-700 mb-1">
          Prénom <span class="text-red-500">*</span>
        </label>
        <input
          pInputText
          id="firstName"
          formControlName="firstName"
          class="w-full"
          placeholder="Prénom du technicien"
        />
        @if (form.get('firstName')?.invalid && form.get('firstName')?.touched) {
          <small class="text-red-500 text-xs">Le prénom est requis</small>
        }
      </div>

      <!-- Nom -->
      <div>
        <label for="lastName" class="block text-sm font-medium text-gray-700 mb-1">
          Nom <span class="text-red-500">*</span>
        </label>
        <input
          pInputText
          id="lastName"
          formControlName="lastName"
          class="w-full"
          placeholder="Nom du technicien"
        />
        @if (form.get('lastName')?.invalid && form.get('lastName')?.touched) {
          <small class="text-red-500 text-xs">Le nom est requis</small>
        }
      </div>

      <!-- Email (uniquement pour création) -->
      @if (!technician()) {
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
            Email <span class="text-red-500">*</span>
          </label>
          <input
            pInputText
            id="email"
            formControlName="email"
            type="email"
            class="w-full"
            placeholder="email@exemple.fr"
          />
          @if (form.get('email')?.invalid && form.get('email')?.touched) {
            <small class="text-red-500 text-xs">Un email valide est requis</small>
          }
        </div>

        <!-- Mot de passe -->
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
            Mot de passe <span class="text-red-500">*</span>
          </label>
          <p-password
            id="password"
            formControlName="password"
            [toggleMask]="true"
            [feedback]="true"
            styleClass="w-full"
            inputStyleClass="w-full"
            placeholder="Mot de passe"
            weakLabel="Faible"
            mediumLabel="Moyen"
            strongLabel="Fort"
          />
          @if (form.get('password')?.invalid && form.get('password')?.touched) {
            <small class="text-red-500 text-xs">
              Le mot de passe doit contenir au moins 6 caractères
            </small>
          }
        </div>
      }

      <!-- Statut (uniquement pour modification) -->
      @if (technician()) {
        <div class="flex items-center gap-2">
          <p-checkbox
            formControlName="isActive"
            [binary]="true"
            inputId="isActive"
          />
          <label for="isActive" class="text-sm text-gray-700 cursor-pointer">
            Technicien actif
          </label>
        </div>
      }

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
          [label]="technician() ? 'Modifier' : 'Créer'"
          [loading]="loading()"
          [disabled]="form.invalid || loading()"
        />
      </div>
    </form>
  `,
})
export class TechnicianForm {
  private fb = inject(FormBuilder);

  technician = input<Technician | null>(null);
  loading = input(false);

  saveCreate = output<CreateTechnician>();
  saveUpdate = output<UpdateTechnician>();
  cancel = output<void>();

  form: FormGroup = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    isActive: [true],
  });

  constructor() {
    effect(() => {
      const technician = this.technician();
      if (technician) {
        this.form.patchValue({
          firstName: technician.firstName,
          lastName: technician.lastName,
          isActive: technician.isActive,
        });
        // Désactiver les champs non modifiables
        this.form.get('email')?.disable();
        this.form.get('password')?.disable();
      } else {
        this.form.reset({ isActive: true });
        this.form.get('email')?.enable();
        this.form.get('password')?.enable();
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    const formValue = this.form.getRawValue();

    if (this.technician()) {
      const updateData: UpdateTechnician = {
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        role: 2, // Technicien
        isActive: formValue.isActive,
      };
      this.saveUpdate.emit(updateData);
    } else {
      const createData: CreateTechnician = {
        email: formValue.email,
        password: formValue.password,
        firstName: formValue.firstName,
        lastName: formValue.lastName,
      };
      this.saveCreate.emit(createData);
    }
  }
}
