import { SITE_URL, SITE_NAME, SITE_DESCRIPTION, FAQ, absoluteUrl } from '@/lib/site';

/**
 * Structured data (schema.org JSON-LD). Rendered server-side so crawlers and
 * rich-result parsers see it in the initial HTML. One @graph keeps the entities
 * cross-referenced (WebApplication ⇄ WebSite ⇄ Organization) instead of emitting
 * disconnected blobs.
 */
export function JsonLd() {
  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': absoluteUrl('/#organization'),
        name: SITE_NAME,
        url: SITE_URL,
        logo: absoluteUrl('/icon'),
      },
      {
        '@type': 'WebSite',
        '@id': absoluteUrl('/#website'),
        url: SITE_URL,
        name: SITE_NAME,
        description: SITE_DESCRIPTION,
        publisher: { '@id': absoluteUrl('/#organization') },
        inLanguage: 'en',
      },
      {
        '@type': 'WebApplication',
        '@id': absoluteUrl('/#webapp'),
        name: SITE_NAME,
        url: SITE_URL,
        description: SITE_DESCRIPTION,
        applicationCategory: 'GameApplication',
        operatingSystem: 'Any (web browser)',
        browserRequirements: 'Requires JavaScript.',
        isAccessibleForFree: true,
        inLanguage: 'en',
        publisher: { '@id': absoluteUrl('/#organization') },
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        about: { '@id': absoluteUrl('/#event') },
      },
      {
        '@type': 'SportsEvent',
        '@id': absoluteUrl('/#event'),
        name: '2026 FIFA World Cup',
        sport: 'Association football',
        description:
          'The 2026 FIFA World Cup: 48 nations, hosted across the United States, Canada, and Mexico.',
        startDate: '2026-06-11',
        endDate: '2026-07-19',
        eventStatus: 'https://schema.org/EventScheduled',
        eventAttendanceMode: 'https://schema.org/MixedEventAttendanceMode',
        location: [
          { '@type': 'Country', name: 'United States' },
          { '@type': 'Country', name: 'Canada' },
          { '@type': 'Country', name: 'Mexico' },
        ],
      },
      {
        '@type': 'FAQPage',
        '@id': absoluteUrl('/#faq'),
        mainEntity: FAQ.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: item.a },
        })),
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      // JSON.stringify output is safe here — no user input, all static strings.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}
