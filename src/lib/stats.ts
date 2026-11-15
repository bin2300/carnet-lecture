import { getCollection } from 'astro:content';
import site from '../data/site.json';

export async function getStats() {
  const books = (await getCollection('books')).sort(
    (a, b) => b.data.startDate.getTime() - a.data.startDate.getTime(),
  );

  const booksPages = books.reduce((sum, b) => sum + b.data.pagesRead, 0);
  const totalRead = site.pagesOffset + booksPages;
  const finished = books.filter((b) => b.data.status === 'termine').length;
  const current = books.find((b) => b.data.status === 'en-cours');

  const start = new Date(site.counterStartDate + 'T00:00:00Z');
  const days = Math.max(1, Math.ceil((Date.now() - start.getTime()) / 86_400_000));
  const perDay = totalRead / days;
  const perMonth = perDay * 30.4375;
  const pct = (totalRead / site.goalPages) * 100;

  return { books, totalRead, finished, current, perDay, perMonth, pct, goal: site.goalPages };
}
