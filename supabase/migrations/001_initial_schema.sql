-- Enable RLS
alter table if exists profiles enable row level security;
alter table if exists game_history enable row level security;
alter table if exists leaderboard enable row level security;
alter table if exists daily_challenges enable row level security;

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid references auth.users on delete cascade primary key,
  username text not null unique,
  email text not null,
  avatar text,
  city text,
  country text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  is_pro boolean default false,
  pro_expires_at timestamp with time zone,
  stats jsonb default '{
    "gamesPlayed": 0,
    "gamesWon": 0,
    "gamesLost": 0,
    "winRate": 0,
    "bestTimeBeginner": null,
    "bestTimeIntermediate": null,
    "bestTimeExpert": null,
    "totalTime": 0,
    "avgTime": 0,
    "currentStreak": 0,
    "bestStreak": 0,
    "flagsPlaced": 0,
    "minesFound": 0
  }'::jsonb,
  settings jsonb default '{
    "theme": "system",
    "soundEnabled": true,
    "vibrationEnabled": true,
    "showProbability": false,
    "autoFlag": false,
    "cellSize": "medium",
    "skin": "classic"
  }'::jsonb
);

-- Game history
CREATE TABLE IF NOT EXISTS game_history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  difficulty text not null,
  result text not null check (result in ('won', 'lost')),
  time integer not null,
  moves integer not null,
  flags integer not null default 0,
  date timestamp with time zone default timezone('utc'::text, now()) not null,
  seed text not null,
  city text,
  country text,
  daily_challenge boolean default false
);

-- Leaderboard
CREATE TABLE IF NOT EXISTS leaderboard (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  username text not null,
  avatar text,
  difficulty text not null,
  time integer not null,
  moves integer not null,
  date timestamp with time zone default timezone('utc'::text, now()) not null,
  city text,
  country text,
  daily_challenge boolean default false,
  daily_date date
);

-- Daily challenges
CREATE TABLE IF NOT EXISTS daily_challenges (
  id uuid default gen_random_uuid() primary key,
  date date not null unique,
  seed text not null,
  difficulty text not null,
  config jsonb not null,
  participants integer default 0,
  best_time integer
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_game_history_user_id ON game_history(user_id);
CREATE INDEX IF NOT EXISTS idx_game_history_date ON game_history(date);
CREATE INDEX IF NOT EXISTS idx_leaderboard_difficulty ON leaderboard(difficulty);
CREATE INDEX IF NOT EXISTS idx_leaderboard_time ON leaderboard(time);
CREATE INDEX IF NOT EXISTS idx_leaderboard_city ON leaderboard(city);
CREATE INDEX IF NOT EXISTS idx_leaderboard_daily ON leaderboard(daily_date);

-- RLS Policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Game history viewable by owner"
  ON game_history FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own game history"
  ON game_history FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Leaderboard is publicly viewable"
  ON leaderboard FOR SELECT USING (true);

CREATE POLICY "Users can insert own scores"
  ON leaderboard FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Daily challenges are publicly viewable"
  ON daily_challenges FOR SELECT USING (true);

-- Function to update stats after game
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET stats = jsonb_set(
    stats,
    '{gamesPlayed}',
    to_jsonb((stats->>'gamesPlayed')::int + 1)
  )
  WHERE id = NEW.user_id;

  IF NEW.result = 'won' THEN
    UPDATE profiles
    SET stats = jsonb_set(
      jsonb_set(stats, '{gamesWon}', to_jsonb((stats->>'gamesWon')::int + 1)),
      '{currentStreak}',
      to_jsonb((stats->>'currentStreak')::int + 1)
    )
    WHERE id = NEW.user_id;
  ELSE
    UPDATE profiles
    SET stats = jsonb_set(
      jsonb_set(stats, '{gamesLost}', to_jsonb((stats->>'gamesLost')::int + 1)),
      '{currentStreak}',
      '0'::jsonb
    )
    WHERE id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_game_inserted
  AFTER INSERT ON game_history
  FOR EACH ROW
  EXECUTE FUNCTION update_user_stats();
