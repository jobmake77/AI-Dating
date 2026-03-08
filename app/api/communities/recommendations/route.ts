import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  getMixedRecommendations,
  getHotCommunities,
  getNewCommunities,
  getInterestBasedRecommendations
} from '@/lib/algorithms/community-recommendations'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type') || 'mixed'
    const limit = parseInt(searchParams.get('limit') || '10')

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let recommendations

    switch (type) {
      case 'hot':
        recommendations = await getHotCommunities(limit)
        break
      case 'new':
        recommendations = await getNewCommunities(limit)
        break
      case 'interest':
        if (!user) {
          return NextResponse.json(
            { error: '需要登录才能获取兴趣推荐' },
            { status: 401 }
          )
        }
        recommendations = await getInterestBasedRecommendations(user.id, limit)
        break
      case 'mixed':
      default:
        recommendations = await getMixedRecommendations(user?.id || null, limit)
        break
    }

    return NextResponse.json({
      success: true,
      data: recommendations,
      count: recommendations.length
    })
  } catch (error) {
    console.error('获取社区推荐失败:', error)
    return NextResponse.json(
      { error: '获取社区推荐失败' },
      { status: 500 }
    )
  }
}
