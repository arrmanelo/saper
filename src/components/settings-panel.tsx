import React from 'react';
import { Settings, Volume2, Vibrate, Eye, Flag, Smartphone, Palette, CreditCard } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGameStore } from '@/hooks/game-store';
import { useAuth } from '@/hooks/auth';

export function SettingsPanel() {
  const { settings, updateSettings, newGame } = useGameStore();
  const { user } = useAuth();
  const { 
    soundEnabled, 
    vibrationEnabled, 
    showProbability, 
    autoFlag, 
    cellSize, 
    skin,
    theme 
  } = settings;

  const toggleSetting = (key: keyof typeof settings) => {
    updateSettings({ [key]: !settings[key] });
  };

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            <CardTitle className="text-lg">Настройки игры</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Game Settings */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Игровые</h3>

            <SettingRow
              icon={<Eye className="w-5 h-5" />}
              label="AI Coach (вероятности)"
              description="Показывать вероятность мины на каждой клетке"
              checked={showProbability}
              onChange={() => toggleSetting('showProbability')}
            />

            <SettingRow
              icon={<Flag className="w-5 h-5" />}
              label="Авто-флаги"
              description="Автоматически ставить флаги, когда мина очевидна"
              checked={autoFlag}
              onChange={() => toggleSetting('autoFlag')}
              pro
              isPro={user?.isPro}
            />
          </div>

          <div className="border-t" />

          {/* Interface */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Интерфейс</h3>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">Размер клеток</div>
                  <div className="text-xs text-muted-foreground">Для удобства на разных устройствах</div>
                </div>
              </div>
              <div className="flex gap-1">
                {(['small', 'medium', 'large'] as const).map((size) => (
                  <button
                    key={size}
                    onClick={() => updateSettings({ cellSize: size })}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                      cellSize === size
                        ? 'bg-primary-600 text-slate-900 dark:text-white'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    {size === 'small' ? 'Мелкие' : size === 'medium' ? 'Средние' : 'Крупные'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Palette className="w-5 h-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">Тема оформления</div>
                  <div className="text-xs text-muted-foreground">Оформление игрового поля</div>
                </div>
              </div>
              <div className="flex gap-1">
                {(['classic', 'modern', 'dark'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => updateSettings({ skin: s })}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                      skin === s
                        ? 'bg-primary-600 text-slate-900 dark:text-white'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    {s === 'classic' ? 'Классика' : s === 'modern' ? 'Современная' : 'Тёмная'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t" />

          {/* Sound & Haptics */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Звук и вибрация</h3>

            <SettingRow
              icon={<Volume2 className="w-5 h-5" />}
              label="Звуковые эффекты"
              checked={soundEnabled}
              onChange={() => toggleSetting('soundEnabled')}
            />

            <SettingRow
              icon={<Vibrate className="w-5 h-5" />}
              label="Вибрация"
              description="Тактильная обратная связь при ходах"
              checked={vibrationEnabled}
              onChange={() => toggleSetting('vibrationEnabled')}
            />
          </div>

          <div className="border-t" />

          {/* Danger Zone */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-red-500 uppercase tracking-wider">Сброс</h3>
            <Button 
              variant="outline" 
              className="w-full text-red-600 border-red-200 hover:bg-red-50"
              onClick={() => {
                if (confirm('Сбросить все настройки?')) {
                  updateSettings({
                    theme: 'system',
                    soundEnabled: true,
                    vibrationEnabled: true,
                    showProbability: false,
                    autoFlag: false,
                    cellSize: 'medium',
                    skin: 'classic',
                  });
                }
              }}
            >
              Сбросить настройки
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pro Upgrade */}
      {!user?.isPro && (
        <Card className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 border-primary-200 dark:border-primary-800">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary-600 rounded-xl">
                <CreditCard className="w-6 h-6 text-slate-900 dark:text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg">Upgrade to Pro</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Получите доступ ко всем скинам, авто-флагам, расширенной статистике и безлимитному AI Coach.
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-2xl font-bold">$4.99</span>
                  <span className="text-sm text-muted-foreground">/месяц</span>
                </div>
                <Button className="mt-3 w-full gap-2">
                  <CreditCard className="w-4 h-4" />
                  Оформить Pro
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function SettingRow({ 
  icon, 
  label, 
  description, 
  checked, 
  onChange,
  pro,
  isPro 
}: { 
  icon: React.ReactNode;
  label: string;
  description?: string;
  checked: boolean;
  onChange: () => void;
  pro?: boolean;
  isPro?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="text-muted-foreground">{icon}</div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium">{label}</span>
            {pro && (
              <span className="px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-bold rounded">
                PRO
              </span>
            )}
          </div>
          {description && <div className="text-xs text-muted-foreground">{description}</div>}
        </div>
      </div>
      <button
        onClick={onChange}
        disabled={pro && !isPro}
        className={`relative w-11 h-6 rounded-full transition-colors ${
          checked ? 'bg-primary-600' : 'bg-muted'
        } ${pro && !isPro ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <div
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}
