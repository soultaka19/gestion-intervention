import { formatDateLocale } from './date';

/**
 * F-11 — decalage d'un jour sur les dates envoyees a l'API.
 *
 * Trois formulaires utilisaient `date.toISOString().split('T')[0]`, qui
 * convertit d'abord en UTC. Ce test compare les deux formatages sur des
 * instants ou la conversion change de jour.
 */
describe('formatDateLocale (F-11)', () => {
  it('rend la date locale, pas la date UTC', () => {
    // 20 septembre 2026, 20 h locales. Sur un fuseau negatif (Ottawa, UTC-4)
    // cet instant vaut le 21 septembre en UTC.
    const d = new Date(2026, 8, 20, 20, 0, 0);
    expect(formatDateLocale(d)).toBe('2026-09-20');
  });

  it('tient a minuit local, ou toISOString bascule sur un fuseau positif', () => {
    const d = new Date(2026, 8, 20, 0, 0, 0);
    expect(formatDateLocale(d)).toBe('2026-09-20');
  });

  it('remplit les zeros du mois et du jour', () => {
    expect(formatDateLocale(new Date(2026, 0, 5))).toBe('2026-01-05');
    expect(formatDateLocale(new Date(2026, 11, 31))).toBe('2026-12-31');
  });

  it('ne depend pas de la composante horaire', () => {
    const matin = new Date(2026, 8, 20, 0, 0, 0);
    const soir = new Date(2026, 8, 20, 23, 59, 59);
    expect(formatDateLocale(matin)).toBe(formatDateLocale(soir));
  });
});
