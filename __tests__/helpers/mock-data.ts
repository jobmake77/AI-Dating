// Mock user data
export const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  username: 'testuser',
  display_name: 'Test User',
  bio: 'Test bio',
  avatar_url: null,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

// Mock content data
export const mockContent = {
  id: 'content-123',
  user_id: 'user-123',
  title: 'Test Content',
  content: '<p>Test content body</p>',
  slug: 'test-content-abc123',
  type: 'article' as const,
  status: 'published' as const,
  reading_time: 5,
  views_count: 100,
  likes_count: 10,
  comments_count: 5,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

// Mock comment data
export const mockComment = {
  id: 'comment-123',
  content_id: 'content-123',
  user_id: 'user-123',
  content: 'Test comment',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

// Mock like data
export const mockLike = {
  id: 'like-123',
  content_id: 'content-123',
  user_id: 'user-123',
  created_at: '2024-01-01T00:00:00Z',
}

// Mock follow data
export const mockFollow = {
  id: 'follow-123',
  follower_id: 'user-123',
  following_id: 'user-456',
  created_at: '2024-01-01T00:00:00Z',
}

// Mock community data
export const mockCommunity = {
  id: 'community-123',
  name: 'Test Community',
  slug: 'test-community',
  description: 'Test community description',
  created_at: '2024-01-01T00:00:00Z',
}

// Mock event data
export const mockEvent = {
  id: 'event-123',
  title: 'Test Event',
  description: 'Test event description',
  start_date: '2024-12-01T00:00:00Z',
  end_date: '2024-12-02T00:00:00Z',
  created_at: '2024-01-01T00:00:00Z',
}
