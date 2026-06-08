import { config, collection, fields } from '@keystatic/core';
import { createElement } from 'react';

// ============================================================
//  KEYSTATIC CONFIG — Enrique Olvera · News admin
// ============================================================
//
//  Local dev uses local file storage so localhost works without GitHub auth.
//  Production uses GitHub mode: the admin commits content straight to this repo
//  via a GitHub App, so editors work on the LIVE site (newseolvera signs in).
//  Needs 3 env vars (set in Vercel, and in .env.local for local dev):
//    KEYSTATIC_GITHUB_CLIENT_ID / KEYSTATIC_GITHUB_CLIENT_SECRET / KEYSTATIC_SECRET
//  Create them once via the setup wizard at <site>/keystatic (it pre-fills the
//  GitHub App: contents read/write + pull-requests, callback on this domain).
//  The build-time reader still reads the committed files from disk, so the
//  static site renders even before the wizard is done.
//
export default config({
  storage: import.meta.env.DEV
    ? { kind: 'local' }
    : {
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
    navigation: {
      Content: ['news', 'categories'],
    },
  },

  collections: {
    categories: collection({
      label: 'Categories',
      slugField: 'name',
      path: 'src/content/categories/*',
      entryLayout: 'form',
      columns: ['name'],
      schema: {
        name: fields.slug({
          name: {
            label: 'Name EN',
            validation: { isRequired: true },
          },
          slug: {
            label: 'Slug',
            description: 'Used internally to connect News entries with this category.',
          },
        }),
        nameEs: fields.text({
          label: 'Name ES',
          description: 'Spanish category label shown when the site language is ES.',
        }),
      },
    }),

    news: collection({
      label: 'News',
      slugField: 'title',
      path: 'src/content/news/*',
      entryLayout: 'form',
      columns: ['title', 'date', 'category'],
      schema: {
        image: fields.image({
          label: 'Image',
          description: 'News image. The original aspect ratio is preserved.',
          directory: 'public/images/news',
          publicPath: '/images/news/',
          validation: { isRequired: true },
        }),
        title: fields.slug({
          name: {
            label: 'Title EN',
            validation: { isRequired: true },
          },
        }),
        titleEs: fields.text({
          label: 'Title ES',
          description: 'Spanish title shown when the site language is ES.',
          validation: { isRequired: true },
        }),
        date: fields.date({
          label: 'Date',
          description: 'Controls ordering. The newest entry appears first unless another one is pinned.',
        }),
        category: fields.relationship({
          label: 'Category',
          description: 'Used to filter the news archive.',
          collection: 'categories',
          validation: { isRequired: true },
        }),
        pinned: fields.checkbox({
          label: 'Pin as lead story',
          description:
            'Shows this entry as the lead story. If several entries are pinned, the newest pinned entry is used.',
          defaultValue: false,
        }),
        excerpt: fields.text({
          label: 'Excerpt EN',
          description: 'English short text used on cards and lead story previews.',
          multiline: true,
          validation: { length: { max: 1200 } },
        }),
        excerptEs: fields.text({
          label: 'Excerpt ES',
          description: 'Spanish short text used on cards and lead story previews.',
          multiline: true,
          validation: { length: { max: 1200 } },
        }),
        body: fields.text({
          label: 'Post EN',
          description: 'English content for the internal news page. Separate paragraphs with a blank line.',
          multiline: true,
        }),
        bodyEs: fields.text({
          label: 'Post ES',
          description: 'Spanish content for the internal news page. Separate paragraphs with a blank line.',
          multiline: true,
        }),
        link: fields.url({
          label: 'External link',
          description: 'Optional. If present, it appears as an external link inside the post.',
        }),
      },
    }),
  },
});
