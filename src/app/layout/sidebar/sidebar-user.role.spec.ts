import { USER_ROLE_LABELS, USER_ROLE_NAMES, UserRoleValue } from '../../core/auth/models/auth.models';

/**
 * F-8 — le role affiche dans la sidebar etait vide ou numerique.
 *
 * L'API serialise ses enums en entiers (`role: 0`), mais la table de libelles
 * etait indexee par des chaines. Deux consequences, dont la seconde est la plus
 * traitre : `roleLabels[0]` valait undefined, ET le test `role ? ...` traitait
 * la valeur 0 comme absente — un administrateur ne voyait donc aucun role.
 */
describe('Libelles de role (F-8)', () => {
  it('couvre les trois valeurs envoyees par l’API', () => {
    expect(USER_ROLE_LABELS[0]).toBe('Administrateur');
    expect(USER_ROLE_LABELS[1]).toBe('Planificateur');
    expect(USER_ROLE_LABELS[2]).toBe('Technicien');
  });

  it('donne un libelle a Admin, dont la valeur 0 est falsy', () => {
    const role: UserRoleValue = 0;
    // Reproduction de l'ancien defaut : `role ? ... : ''` renvoyait ''.
    const ancienCalcul = role ? USER_ROLE_LABELS[role] : '';
    expect(ancienCalcul).toBe('');

    const nouveauCalcul = role === null || role === undefined ? '' : USER_ROLE_LABELS[role];
    expect(nouveauCalcul).toBe('Administrateur');
  });

  it('associe chaque valeur au nom de role attendu par l’API', () => {
    expect(USER_ROLE_NAMES[0]).toBe('Admin');
    expect(USER_ROLE_NAMES[2]).toBe('Technicien');
  });
});
