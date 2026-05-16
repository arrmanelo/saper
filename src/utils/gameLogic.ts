import type { Cell, GameConfig, GameState, Difficulty, AICoachSuggestion } from '@/types';
import { DIFFICULTY_CONFIG } from '@/types';

// Seeded random for daily challenges
export function seededRandom(seed: string): () => number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Ensure state is positive and not 0
  let state = Math.abs(hash) || 123456789;
  
  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

export function generateSeed(): string {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

export function getDailySeed(date: string): string {
  return `daily_${date}`;
}

export function createBoard(config: GameConfig, seed?: string): Cell[][] {
  const { width, height, mines } = config;
  const board: Cell[][] = Array(height)
    .fill(null)
    .map((_, y) =>
      Array(width)
        .fill(null)
        .map((_, x) => ({
          x,
          y,
          isMine: false,
          isRevealed: false,
          isFlagged: false,
          neighborMines: 0,
        }))
    );

  // Place mines
  const rng = seed ? seededRandom(seed) : Math.random;
  let minesPlaced = 0;
  const positions: [number, number][] = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      positions.push([x, y]);
    }
  }

  // Fisher-Yates shuffle
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }

  for (let i = 0; i < mines && i < positions.length; i++) {
    const [x, y] = positions[i];
    board[y][x].isMine = true;
    minesPlaced++;
  }

  // Calculate neighbor mines
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (!board[y][x].isMine) {
        let count = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const ny = y + dy;
            const nx = x + dx;
            if (ny >= 0 && ny < height && nx >= 0 && nx < width && board[ny][nx].isMine) {
              count++;
            }
          }
        }
        board[y][x].neighborMines = count;
      }
    }
  }

  return board;
}

export function getNeighbors(board: Cell[][], x: number, y: number): Cell[] {
  const neighbors: Cell[] = [];
  const height = board.length;
  const width = board[0].length;

  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;
      const ny = y + dy;
      const nx = x + dx;
      if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
        neighbors.push(board[ny][nx]);
      }
    }
  }
  return neighbors;
}

export function revealCell(board: Cell[][], x: number, y: number): Cell[][] {
  const newBoard = board.map(row => row.map(cell => ({ ...cell })));
  const cell = newBoard[y][x];

  if (cell.isRevealed || cell.isFlagged) return newBoard;

  cell.isRevealed = true;

  if (cell.neighborMines === 0 && !cell.isMine) {
    // Flood fill
    const queue: [number, number][] = [[x, y]];
    const visited = new Set<string>([`${x},${y}`]);

    while (queue.length > 0) {
      const [cx, cy] = queue.shift()!;

      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;
          const nx = cx + dx;
          const ny = cy + dy;

          if (ny >= 0 && ny < newBoard.length && nx >= 0 && nx < newBoard[0].length) {
            const key = `${nx},${ny}`;
            if (!visited.has(key)) {
              visited.add(key);
              const neighbor = newBoard[ny][nx];
              if (!neighbor.isRevealed && !neighbor.isFlagged && !neighbor.isMine) {
                neighbor.isRevealed = true;
                if (neighbor.neighborMines === 0) {
                  queue.push([nx, ny]);
                }
              }
            }
          }
        }
      }
    }
  }

  return newBoard;
}

export function toggleFlag(board: Cell[][], x: number, y: number): Cell[][] {
  const newBoard = board.map(row => row.map(cell => ({ ...cell })));
  const cell = newBoard[y][x];

  if (cell.isRevealed) return newBoard;

  cell.isFlagged = !cell.isFlagged;
  return newBoard;
}

export function chordClick(board: Cell[][], x: number, y: number): Cell[][] {
  const cell = board[y][x];
  if (!cell.isRevealed || cell.neighborMines === 0) return board;

  const neighbors = getNeighbors(board, x, y);
  const flaggedCount = neighbors.filter(n => n.isFlagged).length;

  if (flaggedCount !== cell.neighborMines) return board;

  let newBoard = board.map(row => row.map(c => ({ ...c })));

  for (const neighbor of neighbors) {
    if (!neighbor.isRevealed && !neighbor.isFlagged) {
      if (neighbor.isMine) {
        // Game over - reveal the mine
        newBoard[neighbor.y][neighbor.x].isRevealed = true;
        return newBoard;
      }
      newBoard = revealCell(newBoard, neighbor.x, neighbor.y);
    }
  }

  return newBoard;
}

export function checkWin(board: Cell[][]): boolean {
  for (const row of board) {
    for (const cell of row) {
      if (!cell.isMine && !cell.isRevealed) {
        return false;
      }
    }
  }
  return true;
}

export function checkLoss(board: Cell[][]): boolean {
  for (const row of board) {
    for (const cell of row) {
      if (cell.isMine && cell.isRevealed) {
        return true;
      }
    }
  }
  return false;
}

export function revealAllMines(board: Cell[][]): Cell[][] {
  return board.map(row =>
    row.map(cell =>
      cell.isMine ? { ...cell, isRevealed: true } : cell
    )
  );
}

export function getFlagCount(board: Cell[][]): number {
  return board.flat().filter(c => c.isFlagged).length;
}

export function getRevealedCount(board: Cell[][]): number {
  return board.flat().filter(c => c.isRevealed).length;
}

// AI Coach: Calculate probabilities for each cell
export function calculateProbabilities(board: Cell[][]): Cell[][] {
  const newBoard = board.map(row => row.map(cell => ({ ...cell })));
  const height = board.length;
  const width = board[0].length;

  // Reset probabilities
  for (const row of newBoard) {
    for (const cell of row) {
      cell.probability = undefined;
      cell.isSafe = undefined;
      cell.isMineCertain = undefined;
    }
  }

  // Find all revealed cells with numbers
  const numberedCells: Cell[] = [];
  for (const row of newBoard) {
    for (const cell of row) {
      if (cell.isRevealed && cell.neighborMines > 0) {
        numberedCells.push(cell);
      }
    }
  }

  // For each numbered cell, analyze its neighbors
  for (const numCell of numberedCells) {
    const neighbors = getNeighbors(newBoard, numCell.x, numCell.y);
    const hiddenNeighbors = neighbors.filter(n => !n.isRevealed && !n.isFlagged);
    const flaggedNeighbors = neighbors.filter(n => n.isFlagged);
    const minesLeft = numCell.neighborMines - flaggedNeighbors.length;

    if (hiddenNeighbors.length === 0) continue;

    // If all hidden are mines
    if (minesLeft === hiddenNeighbors.length) {
      for (const neighbor of hiddenNeighbors) {
        newBoard[neighbor.y][neighbor.x].isMineCertain = true;
        newBoard[neighbor.y][neighbor.x].probability = 1;
      }
    }
    // If no mines left
    else if (minesLeft === 0) {
      for (const neighbor of hiddenNeighbors) {
        newBoard[neighbor.y][neighbor.x].isSafe = true;
        newBoard[neighbor.y][neighbor.x].probability = 0;
      }
    }
    // Calculate probability
    else {
      const prob = minesLeft / hiddenNeighbors.length;
      for (const neighbor of hiddenNeighbors) {
        const current = newBoard[neighbor.y][neighbor.x].probability;
        if (current === undefined || prob > current) {
          newBoard[neighbor.y][neighbor.x].probability = prob;
        }
      }
    }
  }

  // Calculate global probability for completely unknown cells
  const totalCells = height * width;
  const totalMines = board.flat().filter(c => c.isMine).length;
  const revealedCount = board.flat().filter(c => c.isRevealed).length;
  const flaggedCount = board.flat().filter(c => c.isFlagged).length;
  const knownMines = flaggedCount;
  const unknownCells = totalCells - revealedCount - flaggedCount;
  const remainingMines = totalMines - knownMines;

  const globalProb = unknownCells > 0 ? remainingMines / unknownCells : 0;

  for (const row of newBoard) {
    for (const cell of row) {
      if (!cell.isRevealed && !cell.isFlagged && cell.probability === undefined) {
        cell.probability = globalProb;
      }
    }
  }

  return newBoard;
}

// AI Coach: Get suggestion
export function getAICoachSuggestion(board: Cell[][]): AICoachSuggestion | null {
  const boardWithProbs = calculateProbabilities(board);

  // Collect all certain mines to flag
  const certainMines: Cell[] = [];
  // Collect all safe cells to open
  const safeCells: Cell[] = [];
  
  for (const row of boardWithProbs) {
    for (const cell of row) {
      if (!cell.isRevealed && !cell.isFlagged) {
        if (cell.isMineCertain || cell.probability === 1) {
          certainMines.push(cell);
        } else if (cell.isSafe || cell.probability === 0) {
          safeCells.push(cell);
        }
      }
    }
  }

  // Priority 1: Flag certain mines
  if (certainMines.length > 0) {
    const coords = certainMines.slice(0, 5).map(c => `(${c.x + 1},${c.y + 1})`).join(', ');
    return {
      type: 'flag',
      cells: certainMines.map(c => ({ x: c.x, y: c.y })),
      message: `🚩 Поставьте флаг${certainMines.length > 1 ? 'и' : ''} — ${certainMines.length} мин${certainMines.length > 1 ? '' : 'а'} найден${certainMines.length > 1 ? 'о' : 'а'}!`,
      confidence: 1,
      explanation: `Точно мин${certainMines.length > 1 ? 'ы' : 'а'} в: ${coords}. Нажмите ПКМ, чтобы поставить флаг.`,
    };
  }

  // Priority 2: Open safe cells  
  if (safeCells.length > 0) {
    const coords = safeCells.slice(0, 5).map(c => `(${c.x + 1},${c.y + 1})`).join(', ');
    return {
      type: 'safe',
      cells: safeCells.map(c => ({ x: c.x, y: c.y })),
      message: `✅ Смело нажимайте — ${safeCells.length} безопасных клеток!`,
      confidence: 1,
      explanation: `Клетки ${coords} точно без мин. Нажмите на любую из них.`,
    };
  }

  // Priority 3: Find best guess
  let safestCell: Cell | null = null;
  let lowestProb = 1;

  for (const row of boardWithProbs) {
    for (const cell of row) {
      if (!cell.isRevealed && !cell.isFlagged && cell.probability !== undefined) {
        if (cell.probability < lowestProb) {
          lowestProb = cell.probability;
          safestCell = cell;
        }
      }
    }
  }

  if (!safestCell) return null;

  // Find all cells with same lowest probability
  const bestGuesses: Cell[] = [];
  for (const row of boardWithProbs) {
    for (const cell of row) {
      if (!cell.isRevealed && !cell.isFlagged && cell.probability === lowestProb) {
        bestGuesses.push(cell);
      }
    }
  }

  const probPercent = Math.round(lowestProb * 100);
  const bestCoord = `(${safestCell.x + 1},${safestCell.y + 1})`;

  if (probPercent < 20) {
    return {
      type: 'guess',
      cells: bestGuesses.slice(0, 3).map(c => ({ x: c.x, y: c.y })),
      message: `👉 Лучший ход: клетка ${bestCoord} — риск всего ${probPercent}%`,
      confidence: 1 - lowestProb,
      explanation: `Из всех скрытых клеток, ${bestCoord} имеет самую низкую вероятность мины. Это ваш лучший выбор.`,
    };
  } else if (probPercent < 50) {
    return {
      type: 'guess',
      cells: bestGuesses.slice(0, 3).map(c => ({ x: c.x, y: c.y })),
      message: `⚠️ Рискованно, но лучший вариант: ${bestCoord} (${probPercent}% риска)`,
      confidence: 1 - lowestProb,
      explanation: `Безопасных клеток нет. Клетка ${bestCoord} — наименее опасная. Попробуйте поискать другие закономерности.`,
    };
  } else {
    return {
      type: 'mine',
      cells: bestGuesses.slice(0, 3).map(c => ({ x: c.x, y: c.y })),
      message: `🎲 Придётся угадывать — минимальный риск ${probPercent}% в ${bestCoord}`,
      confidence: 1 - lowestProb,
      explanation: `Все оставшиеся клетки опасны. ${bestCoord} — наименее рискованный вариант. Удачи!`,
    };
  }
}

// Get hint for specific cell
export function getCellHint(board: Cell[][], x: number, y: number): string {
  const cell = board[y][x];
  if (cell.isRevealed) return 'Клетка уже открыта';
  if (cell.isFlagged) return 'Клетка помечена флагом';

  const boardWithProbs = calculateProbabilities(board);
  const probCell = boardWithProbs[y][x];

  if (probCell.isSafe) return '✅ Безопасно открывать!';
  if (probCell.isMineCertain) return '💣 Здесь точно мина!';
  if (probCell.probability !== undefined) {
    const prob = Math.round(probCell.probability * 100);
    return prob < 20 ? `🟢 Низкий риск (${prob}%)` : 
           prob < 50 ? `🟡 Средний риск (${prob}%)` : 
           prob < 80 ? `🟠 Высокий риск (${prob}%)` : 
           `🔴 Опасно (${prob}%)`;
  }
  return '❓ Недостаточно данных';
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
