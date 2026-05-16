<div align="center">

# 💣 Minesweeper Pro

**Современная платформа для игры в Сапёр с AI-подсказками и ежедневными челленджами**

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178C6?logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Tailwind](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-Auth_+_DB-3FCF8E?logo=supabase&logoColor=white)](https://supabase.com)

</div>

---

## ✨ Что умеет

🎯 **Классический сапёр** — 3 уровня сложности + настраиваемое поле  
🧠 **AI Coach** — математический анализ вероятностей, подсказки с координатами лучшего хода  
📅 **Daily Challenge** — одно поле для всех, глобальный рейтинг  
🏆 **Лидерборд** — таблица лучших с фильтрацией по городам  
🌙 **Тёмная / Светлая тема** — переключение в один клик  
📱 **Адаптивный дизайн** — работает на телефоне, планшете и десктопе  
🔐 **Авторизация** — регистрация и вход через Supabase Auth  
📊 **Статистика** — история игр, лучшие результаты, процент побед  

---

## 🧠 AI Coach

AI Coach работает на **чистой математике** — без внешних API и ключей:

- Вычисляет вероятность мины для каждой скрытой клетки
- Показывает **конкретные координаты** лучшего хода: _«Лучший ход: клетка (5,3) — риск 12%»_
- Определяет 100% безопасные клетки и 100% мины
- Объясняет логику на понятном языке для новичков
- После проигрыша показывает **анализ игры** — сколько % поля вы открыли

---

## 🛠 Стек технологий

| Компонент | Технология |
|-----------|------------|
| Фронтенд | React 18 + TypeScript |
| Стили | Tailwind CSS 3.4 |
| Состояние | Zustand |
| Анимации | Framer Motion |
| База данных | Supabase (PostgreSQL) |
| Авторизация | Supabase Auth |
| Роутинг | React Router 6 |
| Иконки | Lucide React |
| Сборка | Vite 5 |

---

## 🚀 Установка и запуск

```bash
# Клонируйте репозиторий
git clone https://github.com/arrmanelo/saper.git

# Перейдите в папку проекта
cd saper

# Установите зависимости
npm install

# Скопируйте файл окружения и заполните ключи Supabase
cp .env.example .env

# Запустите проект
npm run dev
```

Откройте [http://localhost:5173](http://localhost:5173) в браузере.

---

## ⚙️ Настройка Supabase

1. Создайте проект на [supabase.com](https://supabase.com)
2. Выполните SQL-миграцию из `supabase/migrations/001_initial_schema.sql`
3. Включите **Email Auth** в настройках аутентификации
4. Скопируйте `Project URL` и `Anon Key` в файл `.env`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## 🎮 Управление

| Действие | Мышь | Тач |
|----------|------|-----|
| Открыть клетку | Левый клик | Тап |
| Поставить флаг | Правый клик | Долгий тап |
| Открыть соседей | Двойной клик | Двойной тап |

---

## 📁 Структура проекта

```
src/
├── components/
│   ├── game/          # GameBoard, GameCell, GameHeader, AICoach
│   ├── leaderboard/   # Leaderboard
│   ├── profile/       # Profile
│   └── ui/            # Button, Card, Dialog, Input, Badge, Tabs
├── hooks/             # useGameStore, useAuth, useTheme, useTimer
├── pages/             # GamePage, DailyPage, LeaderboardPage, ProfilePage
├── types/             # TypeScript типы и конфиги сложности
├── utils/             # Игровая логика, AI Coach, вероятности
└── lib/               # Supabase клиент
```

---

## 📄 Лицензия

MIT
