import React, { useState, useEffect } from 'react';
import { Calendar, Trophy, Clock, Users, ArrowRight, Zap } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useGameStore } from '@/hooks/useGameStore';
import { getDailySeed, formatTime } from '@/utils/gameLogic';
import { DIFFICULTY_CONFIG } from '@/types';
import type { LeaderboardEntry } from '@/types';

const MOCK_DAILY_LEADERS: LeaderboardEntry[] = [
  { id: 'd1', userId: '1', username: 'SpeedKing', difficulty: 'intermediate', time: 38, moves: 45, date: '2026-05-16', city: 'Москва', country: 'Россия', dailyChallenge: true, dailyDate: '2026-05-16' },
  { id: 'd2', userId: '2', username: 'MineMaster', difficulty: 'intermediate', time: 42, moves: 50, date: '2026-05-16', city: 'Алматы', country: 'Казахстан', dailyChallenge: true, dailyDate: '2026-05-16' },
  { id: 'd3', userId: '3', username: 'ProSweeper', difficulty: 'intermediate', time: 47, moves: 55, date: '2026-05-16', city: 'Москва', country: 'Россия', dailyChallenge: true, dailyDate: '2026-05-16' },
];

export function DailyChallenge() {
  const [timeLeft, setTimeLeft] = useState('');
  const [completed, setCompleted] = useState(false);
  const [userTime, setUserTime] = useState<number | null>(null);
  const { newGame } = useGameStore();

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const diff = tomorrow.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const seed = getDailySeed(today);

  const startDaily = () => {
    newGame('intermediate', undefined, true);
    // Navigate to game
    window.location.href = '/';
  };

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      {/* Hero */}
      <Card className="bg-gradient-to-br from-primary-600 to-primary-800 text-slate-900 dark:text-white border-0">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-white/20 rounded-lg">
              <Zap className="w-6 h-6 text-yellow-300" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Daily Challenge</h1>
              <p className="text-primary-100">Одно поле для всех. Кто быстрее?</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <Calendar className="w-5 h-5 mx-auto mb-1 text-primary-200" />
              <div className="text-xs text-primary-200">Сегодня</div>
              <div className="font-bold">{new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <Clock className="w-5 h-5 mx-auto mb-1 text-primary-200" />
              <div className="text-xs text-primary-200">До сброса</div>
              <div className="font-mono font-bold">{timeLeft}</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <Users className="w-5 h-5 mx-auto mb-1 text-primary-200" />
              <div className="text-xs text-primary-200">Участников</div>
              <div className="font-bold">1,247</div>
            </div>
          </div>

          <div className="mt-4 flex gap-3">
            <Button 
              onClick={startDaily}
              className="flex-1 bg-white text-slate-900 hover:bg-slate-100 gap-2"
            >
              <Zap className="w-4 h-4" />
              {completed ? 'Играть снова' : 'Начать челлендж'}
            </Button>
            <Button 
              variant="outline" 
              className="border-white/30 text-slate-900 dark:text-white hover:bg-white/10"
              onClick={() => window.location.href = '/leaderboard'}
            >
              <Trophy className="w-4 h-4 mr-1" />
              Таблица
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Today's Board Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Параметры сегодняшнего поля
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <InfoBox label="Сложность" value="Любитель" />
            <InfoBox label="Размер" value="16×16" />
            <InfoBox label="Мин" value="40" />
            <InfoBox label="Сид" value={seed.slice(0, 8) + '...'} />
          </div>
          <p className="text-sm text-muted-foreground mt-3">
            Все игроки получают идентичное поле благодаря фиксированному сиду. 
            Победитель определяется по времени и точности.
          </p>
        </CardContent>
      </Card>

      {/* Your Result */}
      {userTime && (
        <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <Badge variant="success">Ваш результат</Badge>
                <div className="text-3xl font-bold mt-2">{formatTime(userTime)}</div>
                <div className="text-sm text-muted-foreground">Место в таблице: #12</div>
              </div>
              <Trophy className="w-12 h-12 text-green-500" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Топ-3 сегодня
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {MOCK_DAILY_LEADERS.map((entry, index) => (
              <div 
                key={entry.id} 
                className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
              >
                <div className="w-8 text-center">
                  {index === 0 ? <span className="text-2xl">🥇</span> :
                   index === 1 ? <span className="text-2xl">🥈</span> :
                   <span className="text-2xl">🥉</span>}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{entry.username}</div>
                  <div className="text-xs text-muted-foreground">{entry.city}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold">{formatTime(entry.time)}</div>
                  <div className="text-xs text-muted-foreground">{entry.moves} ходов</div>
                </div>
              </div>
            ))}
          </div>
          <Button 
            variant="outline" 
            className="w-full mt-3 gap-1"
            onClick={() => window.location.href = '/leaderboard'}
          >
            Весь рейтинг
            <ArrowRight className="w-4 h-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-muted rounded-lg p-3 text-center">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-bold text-lg">{value}</div>
    </div>
  );
}
