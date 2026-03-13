import { Organization, WithContext, WebSite, Article, Person, Event } from 'schema-dts'

export function getOrganizationSchema(org?: {
  name?: string
  description?: string
  url?: string
  logo?: string
  memberCount?: number
}): WithContext<Organization> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: org?.name || 'AI-Dating',
    description: org?.description || 'A Date with AI: 连接 AI 开发者与创作者的技术社区',
    url: org?.url ? `${baseUrl}${org.url}` : baseUrl,
    logo: org?.logo || `${baseUrl}/logo.png`,
    ...(org?.memberCount && {
      numberOfEmployees: {
        '@type': 'QuantitativeValue',
        value: org.memberCount,
      },
    }),
    sameAs: [
      // 'https://twitter.com/aidating',
      // 'https://github.com/aidating',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      availableLanguage: ['Chinese', 'English'],
    },
  }
}

export function getWebSiteSchema(): WithContext<WebSite> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'AI-Dating',
    description: 'A Date with AI: 连接 AI 开发者与创作者的技术社区',
    url: baseUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/search?q={search_term_string}`,
      },
    },
  }
}

export function getArticleSchema(article: {
  title: string
  description: string
  author: string
  publishedTime: string
  modifiedTime: string
  image?: string
  tags?: string[]
}): WithContext<Article> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    author: {
      '@type': 'Person',
      name: article.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'AI-Dating',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`,
      },
    },
    datePublished: article.publishedTime,
    dateModified: article.modifiedTime,
    image: article.image || `${baseUrl}/og-image.png`,
    keywords: article.tags?.join(', '),
  }
}

export function getPersonSchema(person: {
  name: string
  username: string
  bio?: string
  image?: string
}): WithContext<Person> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: person.name,
    alternateName: person.username,
    description: person.bio,
    image: person.image,
    url: `${baseUrl}/u/${person.username}`,
  }
}

export function getEventSchema(event: {
  name: string
  description?: string
  startDate: string
  endDate?: string
  location: string
  image?: string
  organizer?: string
  attendeeCount?: number
}): WithContext<Event> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.name,
    description: event.description,
    startDate: event.startDate,
    endDate: event.endDate,
    location: {
      '@type': 'Place',
      name: event.location,
    },
    image: event.image || `${baseUrl}/og-image.png`,
    organizer: {
      '@type': 'Organization',
      name: event.organizer || 'AI-Dating',
    },
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
  }
}

export function getBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${baseUrl}${item.url}`,
    })),
  }
}
