import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { InterventionMap } from './intervention-map';

/**
 * F-1 — regression sur le XSS stocke des popups de la carte.
 *
 * Les popups etaient construits par concatenation de chaines HTML, avec les
 * champs de la base interpoles tels quels. Un nom de client contenant du
 * balisage s'executait donc chez tout utilisateur de l'organisation ouvrant la
 * carte. Ce test verifie que la charge reste du TEXTE.
 */
describe('InterventionMap — popups (F-1)', () => {
  const CHARGE = '<img src=x onerror="window.__xss=true">';

  let composant: any;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InterventionMap],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    composant = TestBed.createComponent(InterventionMap).componentInstance;
  });

  it('rend un nom de client malveillant comme du texte, pas comme du balisage', () => {
    const popup: HTMLElement = composant.createPopupContent({
      type: 'client',
      lat: 45,
      lng: -75,
      data: { id: '1', name: CHARGE, address: '1 rue', interventionCount: 0 },
    });

    // Aucun element n'a ete cree a partir de la charge...
    expect(popup.querySelector('img')).toBeNull();
    // ...et le texte, lui, est bien present : rien n'a ete perdu au passage.
    expect(popup.textContent).toContain(CHARGE);
    // Le balisage apparait echappe dans le HTML serialise.
    expect(popup.innerHTML).toContain('&lt;img');
  });

  it("rend une description d'intervention malveillante comme du texte", () => {
    const popup: HTMLElement = composant.createPopupContent({
      type: 'intervention',
      lat: 45,
      lng: -75,
      status: 0,
      data: {
        id: '2',
        clientName: CHARGE,
        clientAddress: '1 rue',
        description: CHARGE,
        status: 0,
        type: 0,
      },
    });

    expect(popup.querySelector('img')).toBeNull();
    expect(popup.innerHTML).toContain('&lt;img');
    expect((window as any).__xss).toBeUndefined();
  });

  it('navigue par un ecouteur, sans onclick inline', () => {
    const popup: HTMLElement = composant.createPopupContent({
      type: 'client',
      lat: 45,
      lng: -75,
      data: { id: 'abc', name: 'Client', address: '1 rue', interventionCount: 0 },
    });

    const bouton = popup.querySelector('button')!;
    expect(bouton).not.toBeNull();
    // L'ancien code injectait l'identifiant dans une chaine de code executable.
    expect(bouton.getAttribute('onclick')).toBeNull();
  });
});
