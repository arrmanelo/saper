import { createClient } from '@supabase/supabase-js';
import type { UserProfile, GameHistory, LeaderboardEntry, DailyChallenge } from '@/types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Auth helpers
export const signUp = async (email: string, password: string, username: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username },
    },
  });
  if (error) throw error;

  // Create profile
  if (data.user) {
    await supabase.from('profiles').insert({
      id: data.user.id,
      username,
      email,
      stats: {
        gamesPlayed: 0,
        gamesWon: 0,
        gamesLost: 0,
        winRate: 0,
        bestTimeBeginner: null,
        bestTimeIntermediate: null,
        bestTimeExpert: null,
        totalTime: 0,
        avgTime: 0,
        currentStreak: 0,
        bestStreak: 0,
        flagsPlaced: 0,
        minesFound: 0,
      },
      settings: {
        theme: 'system',
        soundEnabled: true,
        vibrationEnabled: true,
        showProbability: false,
        autoFlag: false,
        cellSize: 'medium',
        skin: 'classic',
      },
    });
  }
  return data;
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getProfile = async (userId: string): Promise<UserProfile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) return null;
  return data;
};

export const updateProfile = async (userId: string, updates: Partial<UserProfile>) => {
  const { error } = await supabase.from('profiles').update(updates).eq('id', userId);
  if (error) throw error;
};

// Game history
export const saveGameHistory = async (history: Omit<GameHistory, 'id'>) => {
  const { data, error } = await supabase.from('game_history').insert(history).select().single();
  if (error) throw error;
  return data;
};

export const getGameHistory = async (userId: string, limit = 50): Promise<GameHistory[]> => {
  const { data, error } = await supabase
    .from('game_history')
    .select('*')
    .eq('userId', userId)
    .order('date', { ascending: false })
    .limit(limit);
  if (error) return [];
  return data || [];
};

// Leaderboard
export const getLeaderboard = async (
  difficulty: string,
  type: 'global' | 'city' | 'daily' = 'global',
  city?: string,
  date?: string,
  limit = 50
): Promise<LeaderboardEntry[]> => {
  let query = supabase
    .from('leaderboard')
    .select('*')
    .eq('difficulty', difficulty)
    .order('time', { ascending: true })
    .limit(limit);

  if (type === 'city' && city) {
    query = query.eq('city', city);
  }
  if (type === 'daily' && date) {
    query = query.eq('dailyChallenge', true).eq('dailyDate', date);
  }

  const { data, error } = await query;
  if (error) return [];
  return data || [];
};

export const submitScore = async (entry: Omit<LeaderboardEntry, 'id'>) => {
  const { data, error } = await supabase.from('leaderboard').insert(entry).select().single();
  if (error) throw error;
  return data;
};

// Daily Challenge
export const getDailyChallenge = async (date: string): Promise<DailyChallenge | null> => {
  const { data, error } = await supabase
    .from('daily_challenges')
    .select('*')
    .eq('date', date)
    .single();
  if (error) return null;
  return data;
};

export const createDailyChallenge = async (challenge: Omit<DailyChallenge, 'participants' | 'bestTime'>) => {
  const { data, error } = await supabase.from('daily_challenges').insert({
    ...challenge,
    participants: 0,
    bestTime: null,
  }).select().single();
  if (error) throw error;
  return data;
};

// Realtime subscriptions
export const subscribeToLeaderboard = (
  difficulty: string,
  callback: (entries: LeaderboardEntry[]) => void
) => {
  return supabase
    .channel('leaderboard_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'leaderboard',
        filter: `difficulty=eq.${difficulty}`,
      },
      (payload) => {
        callback(payload.new as LeaderboardEntry[]);
      }
    )
    .subscribe();
};
