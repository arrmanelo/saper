import React, { useState } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { LogIn, UserPlus, Mail, Lock, User } from 'lucide-react';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

export function AuthModal({ open, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        await signIn(email, password);
      } else {
        if (!username.trim()) {
          setError('Введите имя пользователя');
          setLoading(false);
          return;
        }
        await signUp(email, password, username);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} title={mode === 'login' ? 'Вход' : 'Регистрация'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'register' && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Имя пользователя</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ваш никнейм"
                className="pl-10"
                required
              />
            </div>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="pl-10"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Пароль</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Минимум 6 символов"
              className="pl-10"
              required
              minLength={6}
            />
          </div>
        </div>

        {error && (
          <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">
            {error}
          </div>
        )}

        <Button type="submit" className="w-full gap-2" isLoading={loading}>
          {mode === 'login' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
          {mode === 'login' ? 'Войти' : 'Зарегистрироваться'}
        </Button>

        <div className="text-center text-sm">
          {mode === 'login' ? (
            <span className="text-muted-foreground">
              Нет аккаунта?{' '}
              <button type="button" onClick={() => setMode('register')} className="text-primary-600 hover:underline">
                Зарегистрироваться
              </button>
            </span>
          ) : (
            <span className="text-muted-foreground">
              Уже есть аккаунт?{' '}
              <button type="button" onClick={() => setMode('login')} className="text-primary-600 hover:underline">
                Войти
              </button>
            </span>
          )}
        </div>
      </form>
    </Dialog>
  );
}
