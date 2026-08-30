import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { Dashbord } from './dashbord';

/**
 * F-21 — la spec passait, mais le composant emettait de VRAIES requetes HTTP
 * pendant le test : Vitest signalait « Impossible de contacter le serveur » a
 * chaque execution. Un test qui depend d'un serveur n'est pas un test unitaire ;
 * il echoue hors ligne et masque les vrais signaux dans le bruit.
 * `provideHttpClientTesting` intercepte les requetes sans rien envoyer.
 */
describe('Dashbord', () => {
  let component: Dashbord;
  let fixture: ComponentFixture<Dashbord>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dashbord],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(Dashbord);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it("s'instancie sans emettre de requete reseau", () => {
    expect(component).toBeTruthy();
  });
});
