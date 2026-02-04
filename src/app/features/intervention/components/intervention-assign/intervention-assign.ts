import { Component, inject, input, output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { Technician } from '../../../technician/models/technician';
import { AssignTechnician } from '../../models/intervention';



@Component({
  selector: 'app-intervention-assign',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonModule, SelectModule, DatePickerModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
      <!-- Technicien -->
      <div>
        <label for="technicianId" class="block text-sm font-medium text-gray-700 mb-1">
          Technicien <span class="text-red-500">*</span>
        </label>
        <p-select
          id="technicianId"
          formControlName="technicianId"
          [options]="technicians()"
          optionLabel="firstName"
          optionValue="id"
          placeholder="Sélectionnez un technicien"
          styleClass="w-full"
        />
        @if (form.get('technicianId')?.invalid && form.get('technicianId')?.touched) {
          <small class="text-red-500 text-xs">Le technicien est requis</small>
        }
      </div>

      <!-- Date -->
      <div>
        <label for="scheduledDate" class="block text-sm font-medium text-gray-700 mb-1">
          Date <span class="text-red-500">*</span>
        </label>
        <p-datepicker
          id="scheduledDate"
          formControlName="scheduledDate"
          dateFormat="dd/mm/yy"
          [showIcon]="true"
          [minDate]="minDate"
          styleClass="w-full"
        />
        @if (form.get('scheduledDate')?.invalid && form.get('scheduledDate')?.touched) {
          <small class="text-red-500 text-xs">La date est requise</small>
        }
      </div>

      <!-- Horaires -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label for="startTime" class="block text-sm font-medium text-gray-700 mb-1">
            Heure de début <span class="text-red-500">*</span>
          </label>
          <p-datepicker
            id="startTime"
            formControlName="startTime"
            [timeOnly]="true"
            [showIcon]="true"
            icon="pi pi-clock"
            styleClass="w-full"
          />
        </div>
        <div>
          <label for="endTime" class="block text-sm font-medium text-gray-700 mb-1">
            Heure de fin <span class="text-red-500">*</span>
          </label>
          <p-datepicker
            id="endTime"
            formControlName="endTime"
            [timeOnly]="true"
            [showIcon]="true"
            icon="pi pi-clock"
            styleClass="w-full"
          />
        </div>
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
          label="Affecter"
          icon="pi pi-user-plus"
          [loading]="loading()"
          [disabled]="form.invalid || loading()"
        />
      </div>
    </form>
  `,
})
export class InterventionAssign {
  private fb = inject(FormBuilder);

  technicians = input<Technician[]>([]);
  loading = input(false);

  save = output<AssignTechnician>();
  cancel = output<void>();

  minDate = new Date();

  form: FormGroup = this.fb.group({
    technicianId: ['', Validators.required],
    scheduledDate: [null, Validators.required],
    startTime: [null, Validators.required],
    endTime: [null, Validators.required],
  });

  onSubmit(): void {
    if (this.form.invalid) return;

    const formValue = this.form.value;
    const data: AssignTechnician = {
      technicianId: formValue.technicianId,
      scheduledDate: this.formatDate(formValue.scheduledDate),
      scheduledStartTime: this.formatTime(formValue.startTime),
      scheduledEndTime: this.formatTime(formValue.endTime),
    };
    this.save.emit(data);
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private formatTime(date: Date): string {
    return date.toTimeString().substring(0, 8);
  }
}
