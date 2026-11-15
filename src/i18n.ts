export const LANGS = ['fr', 'en'] as const;
export type Lang = (typeof LANGS)[number];

export const ui = {
  fr: {
    htmlLang: 'fr',
    tagline: 'Trois millions de pages avant la fin.',
    pagesRead: 'pages lues',
    on: 'sur',
    booksFinished: 'livres terminés',
    reading: 'En cours de lecture',
    avgDay: 'pages / jour',
    avgMonth: 'pages / mois',
    library: 'Bibliothèque',
    journal: 'Journal de lecture',
    status: { 'en-cours': 'En cours', termine: 'Terminé', abandonne: 'Abandonné' },
    pages: 'pages',
    started: 'Commencé le',
    finished: 'Terminé le',
    learned: 'Ce que ce livre m’a appris',
    quotes: 'Citations marquantes',
    visuals: 'Visuels',
    share: 'Copier le lien',
    copied: 'Lien copié',
    back: '← Retour',
    empty: 'Aucun livre pour le moment.',
    close: 'Fermer',
    rss: 'Flux RSS',
    noteLang: 'Cette fiche est rédigée en français.',
    switchTo: 'English',
    footer: 'Sans algorithme, sans likes, sans notifications.',
  },
  en: {
    htmlLang: 'en',
    tagline: 'Three million pages before the end.',
    pagesRead: 'pages read',
    on: 'of',
    booksFinished: 'books finished',
    reading: 'Currently reading',
    avgDay: 'pages / day',
    avgMonth: 'pages / month',
    library: 'Library',
    journal: 'Reading journal',
    status: { 'en-cours': 'Reading', termine: 'Finished', abandonne: 'Abandoned' },
    pages: 'pages',
    started: 'Started',
    finished: 'Finished',
    learned: 'What this book taught me',
    quotes: 'Notable quotes',
    visuals: 'Visuals',
    share: 'Copy link',
    copied: 'Link copied',
    back: '← Back',
    empty: 'No books yet.',
    close: 'Close',
    rss: 'RSS feed',
    noteLang: 'This note is written in English.',
    switchTo: 'Français',
    footer: 'No algorithm, no likes, no notifications.',
  },
} as const;

export function otherLang(l: Lang): Lang {
  return l === 'fr' ? 'en' : 'fr';
}

export function fmtDate(d: Date, l: Lang): string {
  return new Intl.DateTimeFormat(l === 'fr' ? 'fr-BE' : 'en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(d);
}

export function fmtNum(n: number, l: Lang): string {
  return new Intl.NumberFormat(l === 'fr' ? 'fr-BE' : 'en-GB').format(n);
}
