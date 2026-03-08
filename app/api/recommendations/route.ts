import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getPersonalizedRecommendations, getTrendingRecommendations } from '@/lib/algorithms/content-recommendations'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '10')

    let recommendations

    if (user) {
      // Get personalized recommendations for logged-in users
      recommendations = await getPersonalizedRecommendations(user.id, limit)
    } else {
      // Get trending recommendations for anonymous users
      recommendations = await getTrendingRecommendations(limit)
    }

    if (recommendations.length === 0) {
      return NextResponse.json({ data: [], message: 'No recommendations found' })
    }

    // Fetch full content details
    const contentIds = recommendations.map(r => r.content_id)
    const { data: contents, error } = await supabase
      .from('contents')
      .select(`
        *,
        author:users!author_id(
          id,
          username,
          full_name,
          avatar_url
        )
      `)
      .in('id', contentIds)
      .eq('status', 'approved')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Merge recommendations with content details
    const result = recommendations.map(rec => {
      const content = contents?.find(c => c.id === rec.content_id)
      return {
        ...content,
        recommendation_score: rec.score,
        recommendation_reason: rec.reason,
      }
    }).filter(Boolean)

    return NextResponse.json({ data: result })
  } catch (error) {
    console.error('Recommendations API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
