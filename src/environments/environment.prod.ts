export const environment = {
  production: true,

  // Chemin RELATIF : les appels partent vers l'origine courante, ou la
  // reecriture Vercel (vercel.json) les relaie vers l'API du VPS. On y gagne
  // deux choses : plus de preflight CORS sur chaque appel, et un premier octet
  // plus rapide — l'edge de Montreal reutilise une connexion TLS deja ouverte
  // vers Nuremberg, la ou un appel direct depuis le navigateur repaie la
  // poignee de main complete.
  apiUrl: '/api',

  // Le hub SignalR, LUI, va en direct.
  //
  // Une reecriture Vercel est un proxy HTTP : elle ne relaie pas la montee en
  // WebSocket. Passer le hub par `/hubs` ferait echouer l'upgrade et SignalR
  // retomberait, au mieux, sur du long-polling. L'appel direct est couvert par
  // la liste blanche CORS de l'API (Cors:AllowedOrigins), et le jeton passe en
  // query string — seule option pour un WebSocket navigateur, deja prevue par
  // Program.cs pour les seuls chemins /hubs.
  hubUrl: 'https://techmaint-api.soultaka.com/hubs/location',
};
