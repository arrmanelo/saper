import React, { useState } from 'react';
import { GameHeader } from '@/components/game/GameHeader';
import { GameBoard } from '@/components/game/GameBoard';
import { AICoach } from '@/components/game/AICoach';
import { useGameStore } from '@/hooks/useGameStore';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Card, CardContent } from '@/components/ui/Card';
import { DIFFICULTY_CONFIG } from '@/types';
import type { Difficulty } from '@/types';
import { Trophy, Settings, Brain, Sparkles, RotateCcw, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function GamePage() {
  const { game, newGame, settings } = useGameStore();
  const { status, difficulty } = game;
  const [showNewGame, setShowNewGame] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  // Когда статус игры меняется на idle, мы должны снова показывать экран "Готовы начать?"
  // Но только если мы сами явно сбрасываем игру.
  React.useEffect(() => {
    if (status !== 'idle') {
      setHasStarted(true);
    }
  }, [status]);

  const difficulties: Difficulty[] = ['beginner', 'intermediate', 'expert'];

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Difficulty Selector */}
      <div className="flex items-center justify-center gap-2 flex-wrap">
        {difficulties.map((d) => (
          <button
            key={d}
            onClick={() => {
              newGame(d);
              setHasStarted(false);
            }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              difficulty === d
                ? 'bg-primary-600 text-slate-900 dark:text-white shadow-lg shadow-primary-600/25 scale-105'
                : 'bg-muted hover:bg-muted/80 text-muted-foreground'
            }`}
          >
            {DIFFICULTY_CONFIG[d].name}
          </button>
        ))}
        <button
          onClick={() => {
             setShowNewGame(true);
             setHasStarted(false);
          }}
          className="px-4 py-2 rounded-full text-sm font-medium bg-muted hover:bg-muted/80 text-muted-foreground transition-all"
        >
          Свой...
        </button>
      </div>

      {/* Game Header */}
      <GameHeader />

      {/* AI Coach */}
      {(status === 'playing' || status === 'idle') && (
        <AICoach />
      )}

      {/* Game Board */}
      <AnimatePresence mode="wait">
        {status === 'idle' && !hasStarted ? (
          <motion.div
            key="idle"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center justify-center py-12"
          >
            <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center mb-4">
              <Sparkles className="w-10 h-10 text-primary-600 dark:text-primary-400" />
            </div>
            <h2 className="text-xl font-bold mb-2">Готовы начать?</h2>
            <p className="text-muted-foreground text-center max-w-md mb-4">
              Выберите сложность и сделайте первый ход. Используйте AI Coach для анализа вероятностей!
            </p>
            <Button onClick={() => setHasStarted(true)} className="gap-2">
              <Play className="w-4 h-4" />
              Начать игру
            </Button>
          </motion.div>
        ) : status === 'paused' ? (
          <motion.div
            key="paused"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-12"
          >
            <h2 className="text-2xl font-bold mb-4">Пауза</h2>
            <Button onClick={() => useGameStore.getState().resume()} className="gap-2">
              <Play className="w-4 h-4" />
              Продолжить
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="board"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center"
          >
            <GameBoard />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Over Overlay */}
      <AnimatePresence>
        {(status === 'won' || status === 'lost') && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className={`border-2 ${status === 'won' ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-red-500 bg-red-50 dark:bg-red-900/20'}`}>
              <CardContent className="pt-6 text-center">
                <div className="text-5xl mb-3">
                  {status === 'won' ? '🎉' : '💥'}
                </div>
                <h2 className="text-2xl font-bold mb-1">
                  {status === 'won' ? 'Победа!' : 'Взрыв!'}
                </h2>
                <p className="text-muted-foreground mb-2">
                  {status === 'won' 
                    ? `Отличная работа! Время: ${game.time}с, Ходов: ${game.moves}` 
                    : 'Мина взорвалась. Попробуйте ещё раз!'}
                </p>
                {status === 'lost' && (() => {
                  // Find where mines were and where safest move was
                  const mineCount = game.board.flat().filter(c => c.isMine).length;
                  const revealedCount = game.board.flat().filter(c => c.isRevealed && !c.isMine).length;
                  const totalCells = game.config.width * game.config.height;
                  const progress = Math.round((revealedCount / (totalCells - mineCount)) * 100);
                  return (
                    <div className="bg-muted/50 rounded-lg p-3 mb-3 text-left text-sm">
                      <p className="font-medium mb-1">📊 Анализ игры:</p>
                      <p className="text-muted-foreground">
                        Вы открыли {progress}% безопасных клеток ({revealedCount} из {totalCells - mineCount}).
                      </p>
                      <p className="text-muted-foreground mt-1">
                        💡 Совет: включите AI Coach — он подсказывает самую безопасную клетку для каждого хода.
                      </p>
                    </div>
                  );
                })()}
                <div className="flex gap-2 justify-center">
                  <Button onClick={() => {
                    newGame(difficulty);
                    setHasStarted(false);
                  }} className="gap-2">
                    <RotateCcw className="w-4 h-4" />
                    Ещё раз
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => window.location.href = '/leaderboard'}
                    className="gap-2"
                  >
                    <Trophy className="w-4 h-4" />
                    Таблица
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <QuickStat icon={<Brain className="w-4 h-4" />} label="Режим" value={settings.showProbability ? 'AI Coach' : 'Классика'} />
        <QuickStat icon={<Trophy className="w-4 h-4" />} label="Рекорд" value={`${game.time || '--'}с`} />
        <QuickStat icon={<Settings className="w-4 h-4" />} label="Размер" value={`${game.config.width}×${game.config.height}`} />
        <QuickStat icon={<Sparkles className="w-4 h-4" />} label="Статус" value={status === 'won' ? 'Победа' : status === 'lost' ? 'Поражение' : 'В процессе'} />
      </div>

      {/* Custom Game Dialog */}
      <Dialog open={showNewGame} onClose={() => setShowNewGame(false)} title="Настройка поля">
        <CustomGameForm onStart={(config) => {
          newGame('custom', config);
          setShowNewGame(false);
          setHasStarted(false);
        }} />
      </Dialog>
    </div>
  );
}

function QuickStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-card border rounded-xl p-3 flex items-center gap-3">
      <div className="text-muted-foreground">{icon}</div>
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="font-medium text-sm">{value}</div>
      </div>
    </div>
  );
}

function CustomGameForm({ onStart }: { onStart: (config: { width: number; height: number; mines: number; name: string }) => void }) {
  const [width, setWidth] = React.useState(16);
  const [height, setHeight] = React.useState(16);
  const [mines, setMines] = React.useState(40);

  const maxMines = width * height - 1;
  const isValid = mines > 0 && mines < maxMines && width >= 5 && width <= 50 && height >= 5 && height <= 50;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-sm font-medium">Ширина</label>
          <input
            type="number"
            value={width}
            onChange={(e) => setWidth(Math.max(5, Math.min(50, parseInt(e.target.value) || 5)))}
            className="w-full mt-1 px-3 py-2 border rounded-lg bg-background text-foreground"
            min={5}
            max={50}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Высота</label>
          <input
            type="number"
            value={height}
            onChange={(e) => setHeight(Math.max(5, Math.min(50, parseInt(e.target.value) || 5)))}
            className="w-full mt-1 px-3 py-2 border rounded-lg bg-background text-foreground"
            min={5}
            max={50}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Мины</label>
          <input
            type="number"
            value={mines}
            onChange={(e) => setMines(Math.max(1, Math.min(maxMines, parseInt(e.target.value) || 1)))}
            className="w-full mt-1 px-3 py-2 border rounded-lg bg-background text-foreground"
            min={1}
            max={maxMines}
          />
        </div>
      </div>
      <div className="text-xs text-muted-foreground">
        Рекомендуется: мины ≈ {Math.round(width * height * 0.15)} для сложности 15%
      </div>
      <Button 
        className="w-full" 
        disabled={!isValid}
        onClick={() => onStart({ width, height, mines, name: 'Custom' })}
      >
        Начать игру
      </Button>
    </div>
  );
}
