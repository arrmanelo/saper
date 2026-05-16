import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Navbar } from '@/components/navbar';
import { GamePage } from '@/pages/game';
import { DailyPage } from '@/pages/daily';
import { LeaderboardPage } from '@/pages/leaderboard';
import { ProfilePage } from '@/pages/profile';
import { SettingsPage } from '@/pages/settings';
import { useTheme } from '@/hooks/theme';

export default function App() {
  useTheme();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="container mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<GamePage />} />
          <Route path="/daily" element={<DailyPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>
    </div>
  );
}
