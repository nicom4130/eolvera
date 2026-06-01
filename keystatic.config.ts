import { config, collection, fields } from '@keystatic/core';
import { createElement } from 'react';

// ============================================================
//  KEYSTATIC CONFIG — Enrique Olvera · News admin
// ============================================================
//
//  GitHub mode: the admin commits content straight to this repo via a GitHub
//  App, so editors work on the LIVE site (newseolvera signs in with GitHub).
//  Needs 3 env vars (set in Vercel, and in .env.local for local dev):
//    KEYSTATIC_GITHUB_CLIENT_ID / KEYSTATIC_GITHUB_CLIENT_SECRET / KEYSTATIC_SECRET
//  Create them once via the setup wizard at <site>/keystatic (it pre-fills the
//  GitHub App: contents read/write + pull-requests, callback on this domain).
//  The build-time reader still reads the committed files from disk, so the
//  static site renders even before the wizard is done.
//
export default config({
  storage: {
    kind: 'github',
    repo: 'newseolvera/enriqueolvera-site',
  },

  ui: {
    // Keystatic's admin uses its own design system; what we CAN brand is the
    // wordmark + name. The mark is a serif monogram in the site's display family
    // (Bodoni Moda, falling back to Georgia inside the admin).
    brand: {
      name: 'Enrique Olvera',
      mark: () =>
        createElement(
          'span',
          {
            style: {
              fontFamily: '"Bodoni Moda", Georgia, "Times New Roman", serif',
              fontSize: '20px',
              fontWeight: 600,
              letterSpacing: '-0.02em',
              lineHeight: 1,
            },
          },
          'EO'
        ),
    },
  },

  collections: {
    news: collection({
      label: 'News',
      slugField: 'title',
      path: 'src/content/news/*',
      entryLayout: 'form',
      columns: ['title', 'date'],
      schema: {
        image: fields.image({
          label: 'Imagen',
          description: 'Imagen de la noticia (se respeta su proporción original).',
          directory: 'public/images/news',
          publicPath: '/images/news/',
          validation: { isRequired: true },
        }),
        title: fields.slug({
          name: {
            label: 'Título',
            validation: { isRequired: true },
          },
        }),
        date: fields.date({
          label: 'Fecha',
          description: 'Ordena las notas: la más reciente va primero (salvo que fijes otra como principal).',
        }),
        pinned: fields.checkbox({
          label: 'Fijar como nota principal',
          description:
            'La coloca arriba, en grande, como portada (reemplaza a la más reciente). Si seleccionas varias, se usa la más reciente.',
          defaultValue: false,
        }),
        size: fields.select({
          label: 'Tamaño en el mosaico',
          description: 'Normal entra en la cuadrícula de columnas; Ancho completo ocupa una fila entera para ella sola. (No aplica si es la nota principal.)',
          options: [
            { label: 'Normal — en la cuadrícula', value: 'normal' },
            { label: 'Ancho completo — fila propia', value: 'full' },
          ],
          defaultValue: 'normal',
        }),
        excerpt: fields.text({
          label: 'Resumen (máx. ~200 palabras)',
          description: 'Texto breve que acompaña a la nota destacada.',
          multiline: true,
          validation: { length: { max: 1200 } },
        }),
        link: fields.url({
          label: 'Enlace externo',
          description: 'El botón "View +" abre este enlace en otra pestaña.',
          validation: { isRequired: true },
        }),
      },
    }),
  },
});
