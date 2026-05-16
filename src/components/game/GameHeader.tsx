import React from 'react';
import { Timer, Flag, RotateCcw, Pause, Play, Brain, Trophy, Bomb } from 'lucide-react';
import { useGameStore } from '@/hooks/useGameStore';
import { useTimer } from '@/hooks/useTimer';
import { formatTime } from '@/utils/gameLogic';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export function GameHeader() {
  const { game, pause, resume, newGame, settings } = useGameStore();
  const { status, config, flags, difficulty, dailyChallenge } = game;
  const time = useTimer(status === 'playing', game.startTime);

  const minesLeft = config.mines - flags;

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {dailyChallenge && (
            <Badge variant="success" className="gap-1">
              <Trophy className="w-3 h-3" />
              Daily Challenge
            </Badge>
          )}
          <Badge variant="secondary" className="capitalize">
            {difficulty === 'beginner' ? 'Новичок' : 
             difficulty === 'intermediate' ? 'Любитель' : 
             difficulty === 'expert' ? 'Эксперт' : 'Свой'}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {settings.showProbability && (
            <Badge variant="outline" className="gap-1 text-xs">
              <Brain className="w-3 h-3" />
              AI Coach
            </Badge>
          )}
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex items-center justify-between bg-card border rounded-xl p-3 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Bomb className="w-4 h-4 text-red-500" />
            <span className={minesLeft < 0 ? 'text-red-500' : ''}>{minesLeft}</span>
          </div>

          <div className="flex items-center gap-2 text-sm font-medium">
            <Timer className="w-4 h-4 text-blue-500" />
            <span className="font-mono text-lg">{formatTime(time)}</span>
          </div>

          <div className="flex items-center gap-2 text-sm font-medium">
            <Flag className="w-4 h-4 text-amber-500" />
            <span>{flags}/{config.mines}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {status === 'playing' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={pause}
              className="gap-1"
            >
              <Pause className="w-4 h-4" />
            </Button>
          )}
          {status === 'paused' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resume}
              className="gap-1"
            >
              <Play className="w-4 h-4" />
            </Button>
          )}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => newGame(difficulty)}
            className="gap-1"
          >
            <RotateCcw className="w-4 h-4" />
            Новая игра
          </Button>
        </div>
      </div>
    </div>
  );
}
