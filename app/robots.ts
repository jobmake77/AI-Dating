import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Only disallow user-facing private pages; do NOT list API/admin paths here
        disallow: [
          '/settings',
          '/create',
          '/edit/',
          '/messages/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
