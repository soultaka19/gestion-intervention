import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Demo } from '../../core/demo/demo';

/**
 * Porte d'entrée de la démonstration : `/demo`.
 *
 * Le visiteur n'a rien à remplir. On crée son bac à sable et on l'emmène
 * directement sur le tableau de bord, déjà peuplé.
 */
@Component({
  selector: 'app-demo-entry',
  imports: [],
  template: `
    <div class="min-h-screen flex items-center justify-center
                bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
      <div class="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center">

        @if (!erreur()) {
          <div class="w-12 h-12 mx-auto mb-6 border-4 border-indigo-200
                      border-t-indigo-600 rounded-full animate-spin"
               role="status" aria-label="Préparation en cours"></div>

          <h1 class="text-xl font-semibold text-gray-900 mb-2">
            Préparation de votre démonstration
          </h1>
          <p class="text-sm text-gray-600 leading-relaxed">
            Un espace de travail vous est créé, rempli de données fictives.
            Aucune information ne vous est demandée, et tout sera effacé
            automatiquement dans une heure.
          </p>
        } @else {
          <div class="w-12 h-12 mx-auto mb-6 rounded-full bg-amber-100
                      flex items-center justify-center text-2xl">!</div>

          <h1 class="text-xl font-semibold text-gray-900 mb-2">{{ titreErreur() }}</h1>
          <p class="text-sm text-gray-600 leading-relaxed mb-6">{{ erreur() }}</p>

          <button type="button" (click)="demarrer()"
                  class="px-5 py-2.5 rounded-lg bg-indigo-600 text-white text-sm
                         font-medium hover:bg-indigo-700 transition-colors">
            Réessayer
          </button>
        }
      </div>
    </div>
  `
})
export class DemoEntry {
  private demo = inject(Demo);
  private router = inject(Router);

  readonly erreur = signal<string | null>(null);
  readonly titreErreur = signal('Démonstration indisponible');

  constructor() {
    this.demarrer();
  }

  demarrer(): void {
    this.erreur.set(null);

    this.demo.creer().subscribe({
      next: () => this.router.navigate(['/home/dashbord']),
      error: (erreur: unknown) => this.afficherErreur(erreur)
    });
  }

  private afficherErreur(erreur: unknown): void {
    // 429 et 503 ne sont pas des pannes : ce sont les garde-fous qui font leur
    // travail. On le dit au visiteur plutot que d'afficher « une erreur est
    // survenue », qui laisserait croire que le produit ne fonctionne pas.
    const statut = erreur instanceof HttpErrorResponse ? erreur.status : 0;

    if (statut === 429) {
      this.titreErreur.set('Trop de démonstrations lancées');
      this.erreur.set(
        'Vous avez ouvert plusieurs espaces de démonstration coup sur coup. '
        + 'Patientez quelques minutes avant d\'en créer un nouveau.'
      );
      return;
    }

    if (statut === 503) {
      this.titreErreur.set('Démonstration momentanément saturée');
      this.erreur.set(
        'Trop d\'espaces sont ouverts en ce moment. Chacun expire au bout '
        + 'd\'une heure ; réessayez dans quelques minutes.'
      );
      return;
    }

    this.titreErreur.set('Démonstration indisponible');
    this.erreur.set(
      'L\'espace de démonstration n\'a pas pu être créé. '
      + 'Le service est peut-être en cours de redémarrage.'
    );
  }
}
