import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { Api } from '../services/api';
import { Auth } from '../auth/services/auth';
import { DemoSession } from './demo.models';

const DEMO_KEY = 'demo_session';

/**
 * Bac à sable de démonstration.
 *
 * Un visiteur obtient sa propre organisation, alimentée en données fictives et
 * effacée automatiquement côté serveur. Rien ne lui est demandé : ni adresse
 * courriel, ni mot de passe, ni consentement.
 *
 * L'isolation n'est pas assurée ici : elle l'est par le filtre de requête de
 * l'API. Ce service ne fait que porter l'état d'affichage.
 */
@Injectable({ providedIn: 'root' })
export class Demo {
  private api = inject(Api);
  private auth = inject(Auth);

  private sessionSignal = signal<DemoSession | null>(this.chargerDepuisStockage());

  /** Horloge d'une seconde, pour que le compte à rebours descende vraiment. */
  private maintenant = signal(Date.now());

  readonly session = this.sessionSignal.asReadonly();
  readonly estDemo = computed(() => this.sessionSignal() !== null);
  readonly comptes = computed(() => this.sessionSignal()?.accounts ?? []);

  /** Millisecondes restantes, jamais négatives. */
  readonly resteMs = computed(() => {
    const session = this.sessionSignal();
    if (!session) {
      return 0;
    }
    return Math.max(0, new Date(session.sandboxExpiresAt).getTime() - this.maintenant());
  });

  readonly resteLisible = computed(() => {
    const totalSecondes = Math.floor(this.resteMs() / 1000);
    const minutes = Math.floor(totalSecondes / 60);
    const secondes = totalSecondes % 60;
    return `${minutes} min ${secondes.toString().padStart(2, '0')} s`;
  });

  readonly expire = computed(() => this.estDemo() && this.resteMs() === 0);

  constructor() {
    // On ne fait tourner l'horloge que s'il y a une démonstration en cours :
    // inutile de réveiller la détection de changements toutes les secondes
    // pour un utilisateur normal.
    setInterval(() => {
      if (this.sessionSignal()) {
        this.maintenant.set(Date.now());
      }
    }, 1000);
  }

  /** Crée un bac à sable et ouvre la session dans la foulée. */
  creer(): Observable<DemoSession> {
    return this.api.post<DemoSession>('/demo/sandbox', {}).pipe(
      tap(session => {
        localStorage.setItem(DEMO_KEY, JSON.stringify(session));
        this.sessionSignal.set(session);
        this.auth.applySession({
          token: session.token,
          expiresAt: session.tokenExpiresAt,
          user: session.user
        });
      })
    );
  }

  /**
   * Bascule vers un autre rôle du même bac à sable. C'est ce qui rend le
   * contrôle d'accès visible : le visiteur voit l'interface changer sans
   * quitter la démonstration.
   */
  changerDeRole(courriel: string): Observable<unknown> {
    const session = this.sessionSignal();
    if (!session) {
      throw new Error('Aucun bac à sable en cours');
    }
    return this.auth.login({ email: courriel, password: session.sharedPassword });
  }

  /** Efface l'état local. Le serveur, lui, purge de son côté à l'expiration. */
  terminer(): void {
    localStorage.removeItem(DEMO_KEY);
    this.sessionSignal.set(null);
  }

  private chargerDepuisStockage(): DemoSession | null {
    const brut = localStorage.getItem(DEMO_KEY);
    if (!brut) {
      return null;
    }
    try {
      const session = JSON.parse(brut) as DemoSession;
      // Une session dont le bac est déjà expiré côté serveur ne doit pas
      // ressusciter au rechargement de la page.
      if (new Date(session.sandboxExpiresAt).getTime() <= Date.now()) {
        localStorage.removeItem(DEMO_KEY);
        return null;
      }
      return session;
    } catch {
      localStorage.removeItem(DEMO_KEY);
      return null;
    }
  }
}
