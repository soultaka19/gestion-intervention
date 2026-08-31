import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Demo } from '../../core/demo/demo';
import { Auth } from '../../core/auth/services/auth';
import { USER_ROLE_LABELS } from '../../core/auth/models/auth.models';

/**
 * Bandeau permanent de la démonstration.
 *
 * Il dit trois choses, en continu : que les données sont fictives, dans combien
 * de temps elles disparaissent, et qu'on peut changer de rôle. Le changement de
 * rôle est ce qui rend le contrôle d'accès visible — l'interface change sous
 * les yeux du visiteur, sans qu'il quitte la démonstration.
 */
@Component({
  selector: 'app-demo-banner',
  imports: [],
  template: `
    @if (demo.estDemo()) {
      <div class="bg-amber-50 border-b border-amber-200 px-4 py-2
                  flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">

        <span class="font-medium text-amber-900">
          Démonstration — données fictives
        </span>

        <span class="text-amber-800" role="timer" aria-live="off">
          @if (demo.expire()) {
            Cet espace a expiré et va être effacé.
          } @else {
            Effacé automatiquement dans {{ demo.resteLisible() }}
          }
        </span>

        <div class="flex items-center gap-2 ml-auto">
          <label for="demo-role" class="text-amber-800">Rôle&nbsp;:</label>
          <select id="demo-role"
                  class="rounded border border-amber-300 bg-white px-2 py-1
                         text-amber-900 focus:outline-none focus:ring-2
                         focus:ring-amber-400"
                  [value]="courrielCourant()"
                  (change)="basculer($event)">
            @for (compte of demo.comptes(); track compte.email) {
              <option [value]="compte.email">
                {{ libelle(compte.role) }} — {{ compte.firstName }} {{ compte.lastName }}
              </option>
            }
          </select>

          <button type="button" (click)="quitter()"
                  class="rounded px-2 py-1 text-amber-800 underline
                         hover:text-amber-900">
            Quitter
          </button>
        </div>
      </div>
    }
  `
})
export class DemoBanner {
  readonly demo = inject(Demo);
  private auth = inject(Auth);
  private router = inject(Router);

  readonly courrielCourant = computed(() => this.auth.currentUser()?.email ?? '');

  libelle(role: number): string {
    return USER_ROLE_LABELS[role as keyof typeof USER_ROLE_LABELS] ?? 'Inconnu';
  }

  basculer(evenement: Event): void {
    const courriel = (evenement.target as HTMLSelectElement).value;
    this.demo.changerDeRole(courriel).subscribe({
      // Le tableau de bord est le seul écran visible par les trois rôles :
      // basculer vers Technicien depuis /home/clients menerait sur un écran
      // interdit juste apres le changement.
      next: () => this.router.navigate(['/home/dashbord'])
    });
  }

  quitter(): void {
    this.demo.terminer();
    this.auth.logout();
  }
}
