import React, { useState, useEffect } from 'react';
import { Trophy, MapPin, Calendar, Globe, Users } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Difficulty, LeaderboardEntry } from '@/types';
import { formatTime, formatDate } from '@/utils/game-logic';

// Mock data for demo
const MOCK_LEADERBOARD: Record<string, LeaderboardEntry[]> = {
  beginner: [
    { id: '1', userId: '1', username: 'ProPlayer', difficulty: 'beginner', time: 12, moves: 15, date: '2026-05-15', city: 'Москва', country: 'Россия' },
    { id: '2', userId: '2', username: 'SpeedRunner', difficulty: 'beginner', time: 15, moves: 18, date: '2026-05-15', city: 'Алматы', country: 'Казахстан' },
    { id: '3', userId: '3', username: 'MineMaster', difficulty: 'beginner', time: 18, moves: 20, date: '2026-05-14', city: 'Москва', country: 'Россия' },
    { id: '4', userId: '4', username: 'Newbie', difficulty: 'beginner', time: 25, moves: 30, date: '2026-05-15', city: 'Санкт-Петербург', country: 'Россия' },
    { id: '5', userId: '5', username: 'CasualGamer', difficulty: 'beginner', time: 32, moves: 35, date: '2026-05-13', city: 'Алматы', country: 'Казахстан' },
  ],
  intermediate: [
    { id: '6', userId: '1', username: 'ProPlayer', difficulty: 'intermediate', time: 45, moves: 55, date: '2026-05-15', city: 'Москва', country: 'Россия' },
    { id: '7', userId: '2', username: 'SpeedRunner', difficulty: 'intermediate', time: 52, moves: 60, date: '2026-05-14', city: 'Алматы', country: 'Казахстан' },
    { id: '8', userId: '6', username: 'ExpertMine', difficulty: 'intermediate', time: 58, moves: 65, date: '2026-05-15', city: 'Москва', country: 'Россия' },
  ],
  expert: [
    { id: '9', userId: '1', username: 'ProPlayer', difficulty: 'expert', time: 89, moves: 120, date: '2026-05-15', city: 'Москва', country: 'Россия' },
    { id: '10', userId: '7', username: 'GrandMaster', difficulty: 'expert', time: 95, moves: 110, date: '2026-05-15', city: 'Алматы', country: 'Казахстан' },
    { id: '11', userId: '2', username: 'SpeedRunner', difficulty: 'expert', time: 102, moves: 130, date: '2026-05-14', city: 'Алматы', country: 'Казахстан' },
  ],
};

const MOCK_DAILY: LeaderboardEntry[] = [
  { id: 'd1', userId: '1', username: 'ProPlayer', difficulty: 'intermediate', time: 42, moves: 50, date: '2026-05-16', city: 'Москва', country: 'Россия', dailyChallenge: true, dailyDate: '2026-05-16' },
  { id: 'd2', userId: '2', username: 'SpeedRunner', difficulty: 'intermediate', time: 48, moves: 55, date: '2026-05-16', city: 'Алматы', country: 'Казахстан', dailyChallenge: true, dailyDate: '2026-05-16' },
  { id: 'd3', userId: '8', username: 'DailyChamp', difficulty: 'intermediate', time: 51, moves: 58, date: '2026-05-16', city: 'Москва', country: 'Россия', dailyChallenge: true, dailyDate: '2026-05-16' },
];

const CITIES = ['Москва', 'Алматы', 'Санкт-Петербург'];

export function Leaderboard() {
  const [difficulty, setDifficulty] = useState<Difficulty>('beginner');
  const [view, setView] = useState<'global' | 'city' | 'daily'>('global');
  const [selectedCity, setSelectedCity] = useState('Москва');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    // In real app, fetch from Supabase
    let data: LeaderboardEntry[] = [];
    if (view === 'daily') {
      data = MOCK_DAILY;
    } else if (view === 'city') {
      data = (MOCK_LEADERBOARD[difficulty] || []).filter(e => e.city === selectedCity);
    } else {
      data = MOCK_LEADERBOARD[difficulty] || [];
    }
    setEntries(data);
  }, [difficulty, view, selectedCity]);

  const getMedal = (index: number) => {
    if (index === 0) return <span className="text-2xl">🥇</span>;
    if (index === 1) return <span className="text-2xl">🥈</span>;
    if (index === 2) return <span className="text-2xl">🥉</span>;
    return <span className="text-muted-foreground font-mono w-8 text-center">{index + 1}</span>;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            <CardTitle>Таблица лидеров</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="global" value={view} onValueChange={(v) => setView(v as any)}>
            <TabsList className="w-full">
              <TabsTrigger value="global" className="gap-1">
                <Globe className="w-4 h-4" />
                Глобальный
              </TabsTrigger>
              <TabsTrigger value="city" className="gap-1">
                <MapPin className="w-4 h-4" />
                По городам
              </TabsTrigger>
              <TabsTrigger value="daily" className="gap-1">
                <Calendar className="w-4 h-4" />
                Daily Challenge
              </TabsTrigger>
            </TabsList>

            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground">Сложность:</span>
              {(['beginner', 'intermediate', 'expert'] as Difficulty[]).map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    difficulty === d
                      ? 'bg-primary-600 text-slate-900 dark:text-white'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  {d === 'beginner' ? 'Новичок' : d === 'intermediate' ? 'Любитель' : 'Эксперт'}
                </button>
              ))}
            </div>

            {view === 'city' && (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Город:</span>
                {CITIES.map((city) => (
                  <button
                    key={city}
                    onClick={() => setSelectedCity(city)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      selectedCity === city
                        ? 'bg-primary-600 text-slate-900 dark:text-white'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            )}

            <TabsContent value="global" className="mt-4">
              <LeaderboardTable entries={entries} getMedal={getMedal} showCity />
            </TabsContent>
            <TabsContent value="city" className="mt-4">
              <LeaderboardTable entries={entries} getMedal={getMedal} />
            </TabsContent>
            <TabsContent value="daily" className="mt-4">
              <div className="mb-3">
                <Badge variant="success" className="gap-1">
                  <Calendar className="w-3 h-3" />
                  Сегодняшний челлендж
                </Badge>
              </div>
              <LeaderboardTable entries={entries} getMedal={getMedal} showCity />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function LeaderboardTable({ 
  entries, 
  getMedal, 
  showCity = false 
}: { 
  entries: LeaderboardEntry[]; 
  getMedal: (i: number) => React.ReactNode;
  showCity?: boolean;
}) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>Пока нет записей</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2 px-2 w-12">#</th>
            <th className="text-left py-2 px-2">Игрок</th>
            <th className="text-right py-2 px-2">Время</th>
            <th className="text-right py-2 px-2">Ходы</th>
            {showCity && <th className="text-left py-2 px-2">Город</th>}
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, index) => (
            <tr 
              key={entry.id} 
              className="border-b last:border-0 hover:bg-muted/50 transition-colors"
            >
              <td className="py-2 px-2">{getMedal(index)}</td>
              <td className="py-2 px-2 font-medium">{entry.username}</td>
              <td className="py-2 px-2 text-right font-mono">{formatTime(entry.time)}</td>
              <td className="py-2 px-2 text-right text-muted-foreground">{entry.moves}</td>
              {showCity && (
                <td className="py-2 px-2">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    {entry.city}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
