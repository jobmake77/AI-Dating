import { ImageResponse } from '@vercel/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'home'

    switch (type) {
      case 'home':
        return generateHomeOG()
      case 'post':
        return generatePostOG(searchParams)
      case 'user':
        return generateUserOG(searchParams)
      case 'community':
        return generateCommunityOG(searchParams)
      case 'event':
        return generateEventOG(searchParams)
      default:
        return generateHomeOG()
    }
  } catch (e) {
    console.error('OG Image generation error:', e)
    return new Response('Failed to generate image', { status: 500 })
  }
}

function generateHomeOG() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        <div style={{ display: 'flex', fontSize: 80, fontWeight: 'bold', color: 'white' }}>
          AI-Dating
        </div>
        <div style={{ display: 'flex', fontSize: 32, color: 'rgba(255,255,255,0.9)', marginTop: 20 }}>
          A Date with AI: 连接 AI 开发者与创作者
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}

function generatePostOG(params: URLSearchParams) {
  const title = params.get('title') || '未命名内容'
  const author = params.get('author') || '匿名'
  const tags = params.get('tags')?.split(',') || []

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: 'white',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        <div style={{ display: 'flex', flex: 1, padding: 60 }}>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: '100%' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', fontSize: 56, fontWeight: 'bold', color: '#1a1a1a', lineHeight: 1.2 }}>
                {title.length > 60 ? title.substring(0, 60) + '...' : title}
              </div>
              {tags.length > 0 && (
                <div style={{ display: 'flex', gap: 12, marginTop: 30, flexWrap: 'wrap' }}>
                  {tags.slice(0, 4).map((tag, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        padding: '8px 16px',
                        background: '#f3f4f6',
                        borderRadius: 8,
                        fontSize: 20,
                        color: '#6b7280',
                      }}
                    >
                      #{tag}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ display: 'flex', fontSize: 28, color: '#6b7280' }}>
                  作者: {author}
                </div>
              </div>
              <div style={{ display: 'flex', fontSize: 32, fontWeight: 'bold', color: '#667eea' }}>
                AI-Dating
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}

function generateUserOG(params: URLSearchParams) {
  const name = params.get('name') || '用户'
  const username = params.get('username') || 'user'
  const bio = params.get('bio') || ''
  const contentsCount = params.get('contents') || '0'
  const followersCount = params.get('followers') || '0'

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          background: 'white',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        <div style={{ display: 'flex', flex: 1, padding: 60, flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', fontSize: 64, fontWeight: 'bold', color: '#1a1a1a' }}>
              {name}
            </div>
            <div style={{ display: 'flex', fontSize: 32, color: '#6b7280', marginTop: 12 }}>
              @{username}
            </div>
            {bio && (
              <div style={{ display: 'flex', fontSize: 28, color: '#4b5563', marginTop: 30, lineHeight: 1.4 }}>
                {bio.length > 100 ? bio.substring(0, 100) + '...' : bio}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 40 }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', fontSize: 40, fontWeight: 'bold', color: '#1a1a1a' }}>
                  {contentsCount}
                </div>
                <div style={{ display: 'flex', fontSize: 24, color: '#6b7280' }}>
                  内容
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', fontSize: 40, fontWeight: 'bold', color: '#1a1a1a' }}>
                  {followersCount}
                </div>
                <div style={{ display: 'flex', fontSize: 24, color: '#6b7280' }}>
                  关注者
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', fontSize: 32, fontWeight: 'bold', color: '#667eea' }}>
              AI-Dating
            </div>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}

function generateCommunityOG(params: URLSearchParams) {
  const name = params.get('name') || '社区'
  const desc = params.get('desc') || ''
  const members = params.get('members') || '0'

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        <div style={{ display: 'flex', flex: 1, padding: 60, flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', fontSize: 72, fontWeight: 'bold', color: 'white' }}>
              {name}
            </div>
            {desc && (
              <div style={{ display: 'flex', fontSize: 32, color: 'rgba(255,255,255,0.9)', marginTop: 30, lineHeight: 1.4 }}>
                {desc.length > 120 ? desc.substring(0, 120) + '...' : desc}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ display: 'flex', fontSize: 48, fontWeight: 'bold', color: 'white' }}>
                {members}
              </div>
              <div style={{ display: 'flex', fontSize: 28, color: 'rgba(255,255,255,0.9)' }}>
                位成员
              </div>
            </div>
            <div style={{ display: 'flex', fontSize: 32, fontWeight: 'bold', color: 'white' }}>
              AI-Dating
            </div>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}

function generateEventOG(params: URLSearchParams) {
  const title = params.get('title') || '活动'
  const date = params.get('date') || ''
  const location = params.get('location') || ''
  const participants = params.get('participants') || '0'

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          background: 'white',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        <div style={{ display: 'flex', flex: 1, padding: 60, flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', padding: '8px 20px', background: '#667eea', borderRadius: 8, fontSize: 24, color: 'white', width: 'fit-content' }}>
              活动
            </div>
            <div style={{ display: 'flex', fontSize: 56, fontWeight: 'bold', color: '#1a1a1a', marginTop: 30, lineHeight: 1.2 }}>
              {title.length > 50 ? title.substring(0, 50) + '...' : title}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 40 }}>
              {date && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ display: 'flex', fontSize: 28, color: '#6b7280' }}>
                    📅 {date}
                  </div>
                </div>
              )}
              {location && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ display: 'flex', fontSize: 28, color: '#6b7280' }}>
                    📍 {location}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ display: 'flex', fontSize: 40, fontWeight: 'bold', color: '#1a1a1a' }}>
                {participants}
              </div>
              <div style={{ display: 'flex', fontSize: 28, color: '#6b7280' }}>
                人参与
              </div>
            </div>
            <div style={{ display: 'flex', fontSize: 32, fontWeight: 'bold', color: '#667eea' }}>
              AI-Dating
            </div>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}

