import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { InterventionMap } from './intervention-map';

/**
 * F-2 — les filtres de la carte etaient sans effet.
 *
 * `showClients`, `showInterventions` et `selectedStatus` etaient des champs
 * ordinaires lus dans des `computed`. Un `computed` ne se recalcule que si un
 * SIGNAL qu'il a lu change : cocher une case mettait le champ a jour, mais
 * `visibleMarkers()` renvoyait sa valeur memorisee. Ce test echouerait sur
 * l'ancienne implementation.
 */
describe('InterventionMap — filtres (F-2)', () => {
  let composant: any;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InterventionMap],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    composant = TestBed.createComponent(InterventionMap).componentInstance;

    composant.clients.set([
      { id: 'c1', name: 'Client Un', address: '1 rue', latitude: 45.4, longitude: -75.7 },
    ]);
    composant.interventions.set([
      { id: 'i1', clientName: 'Client Un', clientAddress: '1 rue', status: 0, type: 0,
        clientLatitude: 45.5, clientLongitude: -75.6 },
      { id: 'i2', clientName: 'Client Un', clientAddress: '2 rue', status: 2, type: 0,
        clientLatitude: 45.6, clientLongitude: -75.5 },
    ]);
  });

  const types = () => composant.visibleMarkers().map((m: any) => m.type);

  it('decocher « Clients » retire les marqueurs client', () => {
    expect(types()).toContain('client');
    composant.showClients.set(false);
    expect(types()).not.toContain('client');
  });

  it('decocher « Interventions » retire les marqueurs intervention', () => {
    expect(types()).toContain('intervention');
    composant.showInterventions.set(false);
    expect(types()).not.toContain('intervention');
  });

  it('le filtre par statut ne garde que les interventions de ce statut', () => {
    composant.showClients.set(false);
    expect(composant.visibleMarkers().length).toBe(2);

    composant.selectedStatus.set(0);
    const restants = composant.visibleMarkers();
    expect(restants.length).toBe(1);
    expect(restants[0].status).toBe(0);
  });

  it('remettre le statut a null reaffiche tout', () => {
    composant.showClients.set(false);
    composant.selectedStatus.set(0);
    expect(composant.visibleMarkers().length).toBe(1);

    composant.selectedStatus.set(null);
    expect(composant.visibleMarkers().length).toBe(2);
  });
});
