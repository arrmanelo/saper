import React, { useMemo } from 'react';
import { Brain, Lightbulb, Target, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/hooks/game-store';
import { getAICoachSuggestion } from '@/utils/game-logic';
import { Button } from '@/components/ui/button';

export function AICoach() {
  const { game, settings, updateSettings } = useGameStore();
  const { board, status } = game;
  const { showProbability } = settings;

  const suggestion = useMemo(() => {
    if (status !== 'playing') return null;
    return getAICoachSuggestion(board);
  }, [board, status]);

  if (!showProbability) {
    return (
      <div className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-xl p-4 border border-primary-200 dark:border-primary-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-100 dark:bg-primary-800 rounded-lg">
            <Brain className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm">AI Coach</h3>
            <p className="text-xs text-muted-foreground">Включите подсказки для анализа вероятностей</p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => updateSettings({ showProbability: true })}
          >
            Включить
          </Button>
        </div>
      </div>
    );
  }

  if (!suggestion) {
    return (
      <div className="bg-muted rounded-xl p-4 border">
        <div className="flex items-center gap-3">
          <Brain className="w-5 h-5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground flex-1">Сделайте первый ход для анализа</p>
          <button
            onClick={() => updateSettings({ showProbability: false })}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            title="Выключить AI Coach"
          >
            ✕
          </button>
        </div>
      </div>
    );
  }

  const icons = {
    safe: <CheckCircle2 className="w-5 h-5 text-green-500" />,
    mine: <AlertTriangle className="w-5 h-5 text-red-500" />,
    guess: <Target className="w-5 h-5 text-yellow-500" />,
    flag: <AlertTriangle className="w-5 h-5 text-amber-500" />,
    open: <Lightbulb className="w-5 h-5 text-blue-500" />,
  };

  const colors = {
    safe: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    mine: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    guess: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
    flag: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
    open: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={suggestion.message}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`rounded-xl p-4 border ${colors[suggestion.type]}`}
      >
        <div className="flex items-start gap-3">
          <div className="mt-0.5">{icons[suggestion.type]}</div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm">{suggestion.message}</p>
            <p className="text-xs text-muted-foreground mt-1">{suggestion.explanation}</p>

            {suggestion.confidence < 1 && (
              <div className="mt-2">
                <div className="flex items-center gap-2 text-xs">
                  <span>Уверенность:</span>
                  <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary-500 rounded-full transition-all"
                      style={{ width: `${suggestion.confidence * 100}%` }}
                    />
                  </div>
                  <span className="font-mono">{Math.round(suggestion.confidence * 100)}%</span>
                </div>
              </div>
            )}
          </div>
          <button
            onClick={() => updateSettings({ showProbability: false })}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0"
            title="Выключить AI Coach"
          >
            ✕
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
