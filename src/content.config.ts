import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const books = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/books' }),
  schema: z.object({
    title: z.string(),
    author: z.string(),
    totalPages: z.number().int().positive(),
    // Pages lues à ce jour (pour un livre terminé = totalPages)
    pagesRead: z.number().int().min(0).default(0),
    status: z.enum(['en-cours', 'termine', 'abandonne']).default('en-cours'),
    startDate: z.coerce.date(),
    endDate: z.coerce.date().optional(),
    // Langue du texte de la fiche (les notes ne sont pas traduites automatiquement)
    lang: z.enum(['fr', 'en']).default('fr'),
    // Ce que ce livre m'a appris (court, affiché en tête de fiche)
    learned: z.string().optional(),
    quotes: z.array(z.string()).default([]),
    // Visuels Canva exportés
    gallery: z
      .array(
        z.object({
          image: z.string(),
          alt: z.string().default(''),
        }),
      )
      .default([]),
  }),
});

export const collections = { books };
