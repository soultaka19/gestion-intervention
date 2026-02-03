import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CheckboxModule } from 'primeng/checkbox';
import { Auth } from '../../../core/auth/services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    CheckboxModule
  ],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
      <div class="w-full max-w-md">
        <!-- Logo -->
        <div class="text-center mb-8">
          <h1 class="text-4xl font-bold text-white mb-2">TechMaint</h1>
          <p class="text-white/80">Gestion des interventions</p>
        </div>

        <!-- Card -->
        <div class="bg-white rounded-2xl shadow-2xl p-8">
          <h2 class="text-2xl font-semibold text-gray-800 mb-6">Connexion</h2>

          @if (errorMessage()) {
            <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {{ errorMessage() }}
            </div>
          }

          <form [formGroup]="form" (ngSubmit)="onSubmit()">
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
                [class.ng-invalid]="form.get('email')?.invalid && form.get('email')?.touched"
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
                [feedback]="false"
                [toggleMask]="true"
                styleClass="w-full"
                inputStyleClass="w-full"
                placeholder="••••••••"
              />
              @if (form.get('password')?.invalid && form.get('password')?.touched) {
                <small class="text-red-500 text-xs mt-1">Mot de passe requis</small>
              }
            </div>

            <!-- Remember me -->
            <div class="flex items-center justify-between mb-6">
              <div class="flex items-center">
                <p-checkbox
                  formControlName="rememberMe"
                  [binary]="true"
                  inputId="rememberMe"
                />
                <label for="rememberMe" class="ml-2 text-sm text-gray-600">
                  Se souvenir de moi
                </label>
              </div>
              <a href="#" class="text-sm text-indigo-600 hover:text-indigo-800">
                Mot de passe oublié ?
              </a>
            </div>

            <!-- Submit -->
            <p-button
              type="submit"
              label="Se connecter"
              [loading]="isLoading()"
              [disabled]="form.invalid || isLoading()"
              styleClass="w-full"
              severity="primary"
            />
          </form>

          <!-- Register link -->
          <div class="mt-6 text-center">
            <p class="text-gray-600">
              Pas encore de compte ?
              <a routerLink="/auth/register" class="text-indigo-600 hover:text-indigo-800 font-medium">
                Créer une organisation
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
export class Login {
  private fb = inject(FormBuilder);
  private auth = inject(Auth);
  private router = inject(Router);

  isLoading = signal(false);
  errorMessage = signal('');

  form: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    rememberMe: [false]
  });

  onSubmit(): void {
    if (this.form.invalid) return;

    this.isLoading.set(true);
    this.errorMessage.set('');

    const { email, password } = this.form.value;

    this.auth.login({ email, password }).subscribe({
      next: () => {
        this.router.navigate(['/home/dashbord']);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.message || 'Erreur de connexion');
      }
    });
  }
}
