import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { Auth } from '../../../core/auth/services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    ButtonModule,
    InputTextModule,
    PasswordModule
  ],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
      <div class="w-full max-w-md">
        <!-- Logo -->
        <div class="text-center mb-8">
          <h1 class="text-4xl font-bold text-white mb-2">TechMaint</h1>
          <p class="text-white/80">Créer votre organisation</p>
        </div>

        <!-- Card -->
        <div class="bg-white rounded-2xl shadow-2xl p-8">
          <h2 class="text-2xl font-semibold text-gray-800 mb-6">Inscription</h2>

          @if (errorMessage()) {
            <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {{ errorMessage() }}
            </div>
          }

          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <!-- Organization name -->
            <div class="mb-4">
              <label for="organizationName" class="block text-sm font-medium text-gray-700 mb-1">
                Nom de l'organisation
              </label>
              <input
                pInputText
                id="organizationName"
                type="text"
                formControlName="organizationName"
                class="w-full"
                placeholder="Ma Société SARL"
              />
              @if (form.get('organizationName')?.invalid && form.get('organizationName')?.touched) {
                <small class="text-red-500 text-xs mt-1">Nom de l'organisation requis</small>
              }
            </div>

            <!-- Name fields -->
            <div class="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label for="firstName" class="block text-sm font-medium text-gray-700 mb-1">
                  Prénom
                </label>
                <input
                  pInputText
                  id="firstName"
                  type="text"
                  formControlName="firstName"
                  class="w-full"
                  placeholder="Jean"
                />
                @if (form.get('firstName')?.invalid && form.get('firstName')?.touched) {
                  <small class="text-red-500 text-xs mt-1">Prénom requis</small>
                }
              </div>
              <div>
                <label for="lastName" class="block text-sm font-medium text-gray-700 mb-1">
                  Nom
                </label>
                <input
                  pInputText
                  id="lastName"
                  type="text"
                  formControlName="lastName"
                  class="w-full"
                  placeholder="Dupont"
                />
                @if (form.get('lastName')?.invalid && form.get('lastName')?.touched) {
                  <small class="text-red-500 text-xs mt-1">Nom requis</small>
                }
              </div>
            </div>

            <!-- Email -->
            <div class="mb-4">
              <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                pInputText
                id="email"
                type="email"
                formControlName="email"
                class="w-full"
                placeholder="votre@email.fr"
              />
              @if (form.get('email')?.invalid && form.get('email')?.touched) {
                <small class="text-red-500 text-xs mt-1">Email requis et valide</small>
              }
            </div>

            <!-- Password -->
            <div class="mb-4">
              <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe
              </label>
              <p-password
                id="password"
                formControlName="password"
                [toggleMask]="true"
                styleClass="w-full"
                inputStyleClass="w-full"
                placeholder="••••••••"
                weakLabel="Faible"
                mediumLabel="Moyen"
                strongLabel="Fort"
              />
              @if (form.get('password')?.invalid && form.get('password')?.touched) {
                <small class="text-red-500 text-xs mt-1">Minimum 8 caractères</small>
              }
            </div>

            <!-- Confirm password -->
            <div class="mb-6">
              <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">
                Confirmer le mot de passe
              </label>
              <p-password
                id="confirmPassword"
                formControlName="confirmPassword"
                [feedback]="false"
                [toggleMask]="true"
                styleClass="w-full"
                inputStyleClass="w-full"
                placeholder="••••••••"
              />
              @if (form.get('confirmPassword')?.touched && form.hasError('passwordMismatch')) {
                <small class="text-red-500 text-xs mt-1">Les mots de passe ne correspondent pas</small>
              }
            </div>

            <!-- Submit -->
            <p-button
              type="submit"
              label="Créer mon compte"
              [loading]="isLoading()"
              [disabled]="form.invalid || isLoading()"
              styleClass="w-full"
              severity="primary"
            />
          </form>

          <!-- Login link -->
          <div class="mt-6 text-center">
            <p class="text-gray-600">
              Déjà un compte ?
              <a routerLink="/auth/login" class="text-indigo-600 hover:text-indigo-800 font-medium">
                Se connecter
              </a>
            </p>
          </div>
        </div>

        <!-- Footer -->
        <p class="text-center text-white/60 text-sm mt-8">
          © 2026 TechMaint. Tous droits réservés.
        </p>
      </div>
    </div>
  `
})
export class Register {
  private fb = inject(FormBuilder);
  private auth = inject(Auth);
  private router = inject(Router);

  isLoading = signal(false);
  errorMessage = signal('');

  form: FormGroup = this.fb.group({
    organizationName: ['', Validators.required],
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required]
  }, {
    validators: this.passwordMatchValidator
  });

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.isLoading.set(true);
    this.errorMessage.set('');

    const { organizationName, email, password, firstName, lastName } = this.form.value;

    this.auth.register({ organizationName, email, password, firstName, lastName }).subscribe({
      next: () => {
        this.router.navigate(['/home/dashbord']);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.message || 'Erreur lors de l\'inscription');
      }
    });
  }
}
