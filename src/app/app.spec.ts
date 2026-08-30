import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';

/**
 * F-21 — cette spec etait le squelette laisse par `ng new` : elle cherchait
 * « Hello, gestion-intervention » dans un `<h1>` que le template n'a jamais eu
 * (`app.html` ne contient qu'un `<router-outlet />`). Elle echouait donc depuis
 * le premier jour, ce qui rendait toute la suite rouge et sans valeur de signal.
 */
describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it("s'instancie", () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('rend le router-outlet, seul contenu du composant racine', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const rendu = fixture.nativeElement as HTMLElement;
    expect(rendu.querySelector('router-outlet')).not.toBeNull();
  });
});
