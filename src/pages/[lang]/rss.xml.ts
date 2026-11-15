import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';
import site from '../../data/site.json';
import { LANGS, ui, type Lang } from '../../i18n';

export function getStaticPaths() {
  return LANGS.map((lang) => ({ params: { lang } }));
}

export async function GET(context: APIContext) {
  const lang = context.params.lang as Lang;
  const books = (await getCollection('books')).sort(
    (a, b) => (b.data.endDate ?? b.data.startDate).getTime() - (a.data.endDate ?? a.data.startDate).getTime(),
  );
  return rss({
    title: site.siteName,
    description: ui[lang].tagline,
    site: context.site!,
    items: books.map((b) => ({
      title: `${b.data.title} — ${b.data.author}`,
      pubDate: b.data.endDate ?? b.data.startDate,
      description: b.data.learned ?? `${b.data.pagesRead} / ${b.data.totalPages} ${ui[lang].pages}`,
      link: `/${lang}/livres/${b.id}/`,
    })),
    customData: `<language>${lang}</language>`,
  });
}
