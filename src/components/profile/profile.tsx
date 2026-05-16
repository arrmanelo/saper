import React from 'react';
import { User, Settings, History, BarChart3, MapPin, Crown, LogOut } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/auth';
import type { GameHistory, UserStats } from '@/types';
import { formatTime, formatDate } from '@/utils/game-logic';

const MOCK_HISTORY: GameHistory[] = [
  { id: '1', userId: '1', difficulty: 'beginner', result: 'won', time: 15, moves: 18, flags: 10, date: '2026-05-16T10:00:00Z', seed: 'abc' },
  { id: '2', userId: '1', difficulty: 'intermediate', result: 'lost', time: 45, moves: 30, flags: 15, date: '2026-05-16T09:30:00Z', seed: 'def' },
  { id: '3', userId: '1', difficulty: 'expert', result: 'won', time: 120, moves: 150, flags: 99, date: '2026-05-15T14:00:00Z', seed: 'ghi', dailyChallenge: true },
  { id: '4', userId: '1', difficulty: 'beginner', result: 'won', time: 12, moves: 15, flags: 10, date: '2026-05-15T11:00:00Z', seed: 'jkl' },
  { id: '5', userId: '1', difficulty: 'intermediate', result: 'won', time: 55, moves: 60, flags: 40, date: '2026-05-14T16:00:00Z', seed: 'mno' },
];

const MOCK_STATS: UserStats = {
  gamesPlayed: 47,
  gamesWon: 32,
  gamesLost: 15,
  winRate: 68,
  bestTimeBeginner: 12,
  bestTimeIntermediate: 45,
  bestTimeExpert: 89,
  totalTime: 3840,
  avgTime: 82,
  currentStreak: 3,
  bestStreak: 7,
  flagsPlaced: 1240,
  minesFound: 890,
};

export function Profile() {
  const { user, signOut } = useAuth();

  return (
    <div className="space-y-4">
      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
              <User className="w-8 h-8 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold">{user?.username || 'Гость'}</h2>
                {user?.isPro && (
                  <Badge variant="success" className="gap-1">
                    <Crown className="w-3 h-3" />
                    PRO
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                <MapPin className="w-4 h-4" />
                {user?.city || 'Москва'}, {user?.country || 'Россия'}
              </div>
            </div>
            {user && (
              <Button variant="ghost" size="sm" onClick={signOut} className="gap-1">
                <LogOut className="w-4 h-4" />
                Выйти
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard 
          icon={<BarChart3 className="w-5 h-5 text-primary-600" />}
          label="Побед"
          value={`${MOCK_STATS.winRate}%`}
          sublabel={`${MOCK_STATS.gamesWon}/${MOCK_STATS.gamesPlayed}`}
        />
        <StatCard 
          icon={<History className="w-5 h-5 text-green-600" />}
          label="Лучшая серия"
          value={MOCK_STATS.bestStreak.toString()}
          sublabel={`Текущая: ${MOCK_STATS.currentStreak}`}
        />
        <StatCard 
          icon={<Settings className="w-5 h-5 text-amber-600" />}
          label="Флагов"
          value={MOCK_STATS.flagsPlaced.toString()}
          sublabel={`Мин найдено: ${MOCK_STATS.minesFound}`}
        />
        <StatCard 
          icon={<BarChart3 className="w-5 h-5 text-purple-600" />}
          label="Время в игре"
          value={`${Math.floor(MOCK_STATS.totalTime / 60)}ч`}
          sublabel={`Среднее: ${MOCK_STATS.avgTime}с`}
        />
      </div>

      {/* Detailed Stats & History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Статистика и история</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="stats">
            <TabsList className="w-full">
              <TabsTrigger value="stats" className="gap-1">
                <BarChart3 className="w-4 h-4" />
                Статистика
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-1">
                <History className="w-4 h-4" />
                История
              </TabsTrigger>
              <TabsTrigger value="records" className="gap-1">
                <Crown className="w-4 h-4" />
                Рекорды
              </TabsTrigger>
            </TabsList>

            <TabsContent value="stats" className="mt-4 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{MOCK_STATS.bestTimeBeginner}s</div>
                  <div className="text-xs text-muted-foreground">Новичок</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{MOCK_STATS.bestTimeIntermediate}s</div>
                  <div className="text-xs text-muted-foreground">Любитель</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{MOCK_STATS.bestTimeExpert}s</div>
                  <div className="text-xs text-muted-foreground">Эксперт</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Прогресс к PRO</span>
                  <span className="font-medium">68%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full" style={{ width: '68%' }} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="history" className="mt-4">
              <div className="space-y-2">
                {MOCK_HISTORY.map((game) => (
                  <div 
                    key={game.id} 
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${game.result === 'won' ? 'bg-green-500' : 'bg-red-500'}`} />
                      <div>
                        <div className="font-medium text-sm">
                          {game.difficulty === 'beginner' ? 'Новичок' : 
                           game.difficulty === 'intermediate' ? 'Любитель' : 'Эксперт'}
                          {game.dailyChallenge && (
                            <Badge variant="success" className="ml-2 text-[10px]">Daily</Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">{formatDate(game.date)}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-medium">{formatTime(game.time)}</div>
                      <div className="text-xs text-muted-foreground">{game.moves} ходов</div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="records" className="mt-4">
              <div className="text-center py-8 text-muted-foreground">
                <Crown className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Рекорды обновляются автоматически</p>
                <p className="text-sm mt-1">Играйте больше, чтобы улучшить свои показатели!</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ icon, label, value, sublabel }: { 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  sublabel: string;
}) {
  return (
    <div className="bg-card border rounded-xl p-3">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <div className="text-xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground">{sublabel}</div>
    </div>
  );
}
