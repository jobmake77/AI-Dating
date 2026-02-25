CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  cover_url TEXT,
  location TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  type TEXT NOT NULL DEFAULT 'offline' CHECK (type IN ('official', 'offline')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'ended')),
  creator_id UUID REFERENCES users(id) ON DELETE SET NULL,
  participants_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE event_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "events_select_all" ON events FOR SELECT USING (true);
CREATE POLICY "events_insert_offline" ON events FOR INSERT
  WITH CHECK (auth.uid() = creator_id AND type = 'offline');
CREATE POLICY "events_update_own" ON events FOR UPDATE USING (auth.uid() = creator_id);

CREATE POLICY "event_participants_select" ON event_participants FOR SELECT USING (true);
CREATE POLICY "event_participants_insert" ON event_participants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "event_participants_delete" ON event_participants FOR DELETE USING (auth.uid() = user_id);

-- 自动维护 participants_count
CREATE OR REPLACE FUNCTION update_event_participants_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE events SET participants_count = participants_count + 1 WHERE id = NEW.event_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE events SET participants_count = GREATEST(participants_count - 1, 0) WHERE id = OLD.event_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER event_participants_count_trigger
AFTER INSERT OR DELETE ON event_participants
FOR EACH ROW EXECUTE FUNCTION update_event_participants_count();
