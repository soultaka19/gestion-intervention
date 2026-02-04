import { Component, input, output, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';
import { CompleteIntervention } from '../../models/intervention';

@Component({
  selector: 'app-intervention-complete',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonModule, TextareaModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
      <!-- Notes du technicien -->
      <div>
        <label for="technicianNotes" class="block text-sm font-medium text-gray-700 mb-1">
          Notes du technicien <span class="text-red-500">*</span>
        </label>
        <textarea
          pTextarea
          id="technicianNotes"
          formControlName="technicianNotes"
          class="w-full"
          rows="4"
          placeholder="Décrivez les travaux effectués..."
        ></textarea>
        @if (form.get('technicianNotes')?.invalid && form.get('technicianNotes')?.touched) {
          <small class="text-red-500 text-xs">Les notes sont requises</small>
        }
      </div>

      <!-- Recommandations -->
      <div>
        <label for="recommendations" class="block text-sm font-medium text-gray-700 mb-1">
          Recommandations
        </label>
        <textarea
          pTextarea
          id="recommendations"
          formControlName="recommendations"
          class="w-full"
          rows="2"
          placeholder="Recommandations pour le client..."
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
          label="Terminer"
          icon="pi pi-check"
          [loading]="loading()"
          [disabled]="form.invalid || loading()"
        />
      </div>
    </form>
  `,
})
export class InterventionComplete {
  private fb = inject(FormBuilder);

  loading = input(false);

  save = output<CompleteIntervention>();
  cancel = output<void>();

  form: FormGroup = this.fb.group({
    technicianNotes: ['', Validators.required],
    recommendations: [''],
  });

  onSubmit(): void {
    if (this.form.invalid) return;

    const formValue = this.form.value;
    const data: CompleteIntervention = {
      technicianNotes: formValue.technicianNotes,
      report: formValue.recommendations
        ? { recommendations: formValue.recommendations }
        : undefined,
    };

    this.save.emit(data);
  }
}
