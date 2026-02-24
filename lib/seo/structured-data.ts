import { Organization, WithContext } from 'schema-dts'

export function getOrganizationSchema(): WithContext<Organization> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'AI-Dating',
    description: 'A Date with AI: 连接 AI 开发者与创作者的技术社区',
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
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

export function getArticleSchema(article: {
  title: string
  description: string
  author: string
  publishedTime: string
  modifiedTime: string
  image?: string
  tags?: string[]
}) {
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
}) {
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
