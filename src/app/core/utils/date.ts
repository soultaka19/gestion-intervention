/**
 * Formatage de date pour l'API, en heure LOCALE (F-11).
 *
 * Les trois formulaires du projet utilisaient `date.toISOString().split('T')[0]`.
 * `toISOString()` convertit d'abord en UTC : la date envoyee n'est donc pas
 * celle que l'utilisateur a choisie dans le calendrier des qu'il se trouve d'un
 * cote ou de l'autre de minuit UTC.
 *
 *   Ottawa, UTC-4, un calendrier qui pose l'heure a 00:00 locale
 *     choix « 20 septembre » -> 2026-09-20T04:00Z -> « 2026-09-20 »   correct
 *   Ottawa, UTC-4, un champ qui conserve l'heure courante (20 h)
 *     choix « 20 septembre » -> 2026-09-21T00:00Z -> « 2026-09-21 »   DECALE
 *   Paris, UTC+2, minuit local
 *     choix « 20 septembre » -> 2026-09-19T22:00Z -> « 2026-09-19 »   DECALE
 *
 * Le decalage est invisible en journee sur un fuseau negatif : c'est
 * precisement ce qui le rendait difficile a reproduire. On lit desormais les
 * composantes locales, sans aucune conversion.
 */
export function formatDateLocale(date: Date): string {
  const annee = date.getFullYear();
  const mois = String(date.getMonth() + 1).padStart(2, '0');
  const jour = String(date.getDate()).padStart(2, '0');
  return `${annee}-${mois}-${jour}`;
}
