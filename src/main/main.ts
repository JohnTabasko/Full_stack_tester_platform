import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { spawn } from 'child_process';
import Database from 'better-sqlite3';

let mainWindow: BrowserWindow | null = null;
let db: Database.Database | null = null;

type DbCountRow = { cnt: number };
type DbProgressRow = {
  id: number;
  module_id: number;
  lesson_id: string;
  completed: number;
  score: number;
  time_spent: number;
  last_accessed: string | null;
};
type DbUserPointsRow = {
  points: number;
  streak: number;
  last_activity_date: string | null;
  total_time_spent: number;
};

type BackupPayload = {
  progress?: unknown[];
  quizResults?: unknown[];
  notes?: unknown[];
  bookmarks?: unknown[];
  achievements?: unknown[];
  settings?: unknown[];
  userPoints?: unknown[];
  examResults?: unknown[];
  exerciseResults?: unknown[];
};

type PlaygroundRunResult = {
  success: boolean;
  exitCode: number | null;
  timedOut: boolean;
  durationMs: number;
  stdout: string;
  stderr: string;
  command: string;
  runDir: string;
  testFile: string;
  error?: string;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function toNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function toInteger(value: unknown, fallback = 0): number {
  return Math.trunc(toNumber(value, fallback));
}

function toStringOrNull(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

function toStringValue(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function normalizeUserStats(row: DbUserPointsRow | undefined) {
  return {
    points: row?.points ?? 0,
    streak: row?.streak ?? 0,
    lastActivityDate: row?.last_activity_date ?? '',
    totalTimeSpent: row?.total_time_spent ?? 0,
  };
}

function getDbPath(): string {
  const userDataPath = app.getPath('userData');
  return path.join(userDataPath, 'playwright-learning.db');
}

function getPlaywrightCliPath(): string {
  try {
    // In development this resolves from the project node_modules directory.
    // In a packaged build it resolves from the bundled application dependencies.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require.resolve('@playwright/test/cli');
  } catch {
    // Fallback for installations where the package entry layout differs.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const packageJson = require.resolve('@playwright/test/package.json');
    return path.join(path.dirname(packageJson), 'cli.js');
  }
}

function getNodeCommand(): string {
  return process.env.NODE_BINARY || (process.platform === 'win32' ? 'node.exe' : 'node');
}

function runPlaywrightTest(code: string): Promise<PlaygroundRunResult> {
  return new Promise((resolve) => {
    const startedAt = Date.now();
    const runId = `run-${startedAt}-${Math.random().toString(36).slice(2, 8)}`;
    const runDir = path.join(app.getPath('userData'), 'playground-runs', runId);
    const testFile = path.join(runDir, 'playground.spec.ts');
    const configFile = path.join(runDir, 'playwright.config.js');
    const outputDir = path.join(runDir, 'wyniki-testu');

    try {
      fs.mkdirSync(runDir, { recursive: true });
      fs.writeFileSync(testFile, code, 'utf-8');
      fs.writeFileSync(configFile, `module.exports = {\n  testDir: ${JSON.stringify(runDir)},\n  timeout: 30_000,\n  expect: { timeout: 5_000 },\n  fullyParallel: false,\n  workers: 1,\n  reporter: [['line']],\n  outputDir: ${JSON.stringify(outputDir)},\n  use: {\n    headless: true,\n    trace: 'retain-on-failure',\n    screenshot: 'only-on-failure',\n    video: 'retain-on-failure',\n    ignoreHTTPSErrors: true,\n  },\n};\n`, 'utf-8');
    } catch (error) {
      resolve({
        success: false,
        exitCode: null,
        timedOut: false,
        durationMs: Date.now() - startedAt,
        stdout: '',
        stderr: '',
        command: '',
        runDir,
        testFile,
        error: error instanceof Error ? error.message : 'Nie udało się przygotować katalogu uruchomieniowego.',
      });
      return;
    }

    let cliPath: string;
    try {
      cliPath = getPlaywrightCliPath();
    } catch (error) {
      resolve({
        success: false,
        exitCode: null,
        timedOut: false,
        durationMs: Date.now() - startedAt,
        stdout: '',
        stderr: '',
        command: '',
        runDir,
        testFile,
        error: error instanceof Error
          ? `Nie znaleziono pakietu @playwright/test: ${error.message}`
          : 'Nie znaleziono pakietu @playwright/test.',
      });
      return;
    }

    const nodeModulesDir = path.resolve(path.dirname(cliPath), '..', '..');
    const runNodeModules = path.join(runDir, 'node_modules');
    try {
      if (!fs.existsSync(runNodeModules) && fs.existsSync(nodeModulesDir)) {
        fs.symlinkSync(nodeModulesDir, runNodeModules, process.platform === 'win32' ? 'junction' : 'dir');
      }
    } catch {
      // Jeżeli symlink nie powstanie, Playwright nadal zwróci rzeczywisty błąd modułów w wyniku uruchomienia.
    }

    const nodeCommand = getNodeCommand();
    const args = [cliPath, 'test', testFile, '--config', configFile, '--workers=1'];
    const command = `${nodeCommand} ${args.map((arg) => arg.includes(' ') ? JSON.stringify(arg) : arg).join(' ')}`;
    const child = spawn(nodeCommand, args, {
      cwd: runDir,
      env: {
        ...process.env,
        CI: '1',
        FORCE_COLOR: '0',
        PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD: process.env.PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD ?? '0',
        NODE_PATH: [nodeModulesDir, process.env.NODE_PATH].filter(Boolean).join(path.delimiter),
      },
      windowsHide: true,
    });

    let stdout = '';
    let stderr = '';
    let timedOut = false;
    const hardTimeoutMs = 60_000;
    const timer = setTimeout(() => {
      timedOut = true;
      child.kill('SIGKILL');
    }, hardTimeoutMs);

    child.stdout.on('data', (chunk: Buffer) => {
      stdout += chunk.toString('utf-8');
    });
    child.stderr.on('data', (chunk: Buffer) => {
      stderr += chunk.toString('utf-8');
    });
    child.on('error', (error) => {
      clearTimeout(timer);
      resolve({
        success: false,
        exitCode: null,
        timedOut,
        durationMs: Date.now() - startedAt,
        stdout,
        stderr,
        command,
        runDir,
        testFile,
        error: `Nie udało się uruchomić procesu Node.js. Sprawdź, czy polecenie „${nodeCommand}” jest dostępne w PATH. Szczegóły: ${error.message}`,
      });
    });
    child.on('close', (exitCode) => {
      clearTimeout(timer);
      const durationMs = Date.now() - startedAt;
      const browserHint = `${stdout}\n${stderr}`.includes('playwright install')
        ? '\n\nWskazówka: test został uruchomiony naprawdę, ale Playwright nie znalazł wymaganej przeglądarki. Uruchom w projekcie: npx playwright install --with-deps chromium'
        : '';
      resolve({
        success: exitCode === 0 && !timedOut,
        exitCode,
        timedOut,
        durationMs,
        stdout: `${stdout}${browserHint}`,
        stderr,
        command,
        runDir,
        testFile,
      });
    });
  });
}

function initDatabase(): void {
  if (db) return;

  db = new Database(getDbPath());
  db.pragma('journal_mode = WAL');

  db.exec(`
    CREATE TABLE IF NOT EXISTS progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      module_id INTEGER NOT NULL,
      lesson_id TEXT NOT NULL,
      completed BOOLEAN DEFAULT 0,
      score REAL DEFAULT 0,
      time_spent INTEGER DEFAULT 0,
      last_accessed TEXT,
      UNIQUE(module_id, lesson_id)
    );

    CREATE TABLE IF NOT EXISTS quiz_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      module_id INTEGER NOT NULL,
      lesson_id TEXT NOT NULL,
      score REAL NOT NULL,
      total_questions INTEGER NOT NULL,
      correct_answers INTEGER NOT NULL,
      completed_at TEXT DEFAULT (datetime('now')),
      answers JSON
    );

    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      module_id INTEGER NOT NULL,
      lesson_id TEXT NOT NULL,
      content TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      UNIQUE(module_id, lesson_id)
    );

    CREATE TABLE IF NOT EXISTS bookmarks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      module_id INTEGER NOT NULL,
      lesson_id TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(module_id, lesson_id)
    );

    CREATE TABLE IF NOT EXISTS achievements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      achievement_id TEXT UNIQUE NOT NULL,
      unlocked_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS user_points (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      points INTEGER DEFAULT 0,
      streak INTEGER DEFAULT 0,
      last_activity_date TEXT,
      total_time_spent INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS exam_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id TEXT UNIQUE NOT NULL,
      area TEXT NOT NULL,
      title TEXT NOT NULL,
      score INTEGER NOT NULL,
      passed_checks TEXT NOT NULL,
      submitted_code TEXT,
      completed BOOLEAN DEFAULT 0,
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS exercise_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      module_id INTEGER NOT NULL,
      lesson_id TEXT NOT NULL,
      exercise_id TEXT NOT NULL,
      score INTEGER NOT NULL,
      passed_checks TEXT NOT NULL,
      answer TEXT,
      completed BOOLEAN DEFAULT 0,
      updated_at TEXT DEFAULT (datetime('now')),
      UNIQUE(module_id, lesson_id, exercise_id)
    );
  `);

  // Insert default user_points row if not exists
  const pointsRow = db.prepare('SELECT COUNT(*) as cnt FROM user_points').get() as DbCountRow;
  if (pointsRow.cnt === 0) {
    db.prepare('INSERT INTO user_points (points, streak, last_activity_date, total_time_spent) VALUES (0, 0, ?, 0)').run(new Date().toISOString());
  }
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: '🎭 Playwright Learning Platform',
    icon: path.join(__dirname, '../../resources/icon.png'),
    frame: true,
    titleBarStyle: 'default',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    backgroundColor: '#0a0a0b',
    show: false,
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
    mainWindow?.focus();
  });

  if (process.env.NODE_ENV === 'development' || process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// ============ IPC Handlers ============

// Progress
ipcMain.handle('db:getProgress', (_, moduleId: number, lessonId: string) => {
  initDatabase();
  const row = db!.prepare('SELECT * FROM progress WHERE module_id = ? AND lesson_id = ?').get(moduleId, lessonId) as any;
  return row || null;
});

ipcMain.handle('db:updateProgress', (_, moduleId: number, lessonId: string, data: Partial<{
  completed: boolean;
  score: number;
  timeSpent: number;
  timeSpentDelta: number;
  lastAccessed: string;
}>) => {
  initDatabase();
  const existing = db!.prepare(
    'SELECT * FROM progress WHERE module_id = ? AND lesson_id = ?'
  ).get(moduleId, lessonId) as DbProgressRow | undefined;

  const now = new Date().toISOString();
  const completed = data.completed ?? Boolean(existing?.completed);
  const score = data.score ?? existing?.score ?? 0;
  const timeSpent = Math.max(0, data.timeSpent ?? existing?.time_spent ?? 0);
  const lastAccessed = data.lastAccessed ?? now;
  const newlyCompleted = completed && !existing?.completed;
  const timeSpentDelta = Math.max(0, data.timeSpentDelta ?? Math.max(0, timeSpent - (existing?.time_spent ?? 0)));

  if (existing) {
    db!.prepare(
      'UPDATE progress SET completed = ?, score = ?, time_spent = ?, last_accessed = ? WHERE module_id = ? AND lesson_id = ?'
    ).run(completed ? 1 : 0, score, timeSpent, lastAccessed, moduleId, lessonId);
  } else {
    db!.prepare(
      'INSERT INTO progress (module_id, lesson_id, completed, score, time_spent, last_accessed) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(moduleId, lessonId, completed ? 1 : 0, score, timeSpent, lastAccessed);
  }

  db!.prepare('UPDATE user_points SET total_time_spent = total_time_spent + ?, last_activity_date = ? WHERE id = 1')
    .run(timeSpentDelta, now);

  if (newlyCompleted) {
    db!.prepare('UPDATE user_points SET points = points + 10, last_activity_date = ? WHERE id = 1')
      .run(now);
  }

  return { success: true, newlyCompleted };
});

ipcMain.handle('db:getAllProgress', () => {
  initDatabase();
  return db!.prepare('SELECT * FROM progress').all();
});

// Quiz
ipcMain.handle('db:saveQuizResult', (_, data: any) => {
  initDatabase();
  const result = db!.prepare(
    'INSERT INTO quiz_results (module_id, lesson_id, score, total_questions, correct_answers, answers) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(data.moduleId, data.lessonId, data.score, data.totalQuestions, data.correctAnswers, JSON.stringify(data.answers || []));

  // Add points
  const earnedPoints = Math.floor(data.score * 5);
  db!.prepare('UPDATE user_points SET points = points + ?, last_activity_date = ? WHERE id = 1')
    .run(earnedPoints, new Date().toISOString());

  return { success: true, id: result.lastInsertRowid, earnedPoints };
});

ipcMain.handle('db:getQuizResults', (_, moduleId: number, lessonId: string) => {
  initDatabase();
  return db!.prepare(
    'SELECT * FROM quiz_results WHERE module_id = ? AND lesson_id = ? ORDER BY completed_at DESC'
  ).all(moduleId, lessonId);
});

// Notes
ipcMain.handle('db:getNote', (_, moduleId: number, lessonId: string) => {
  initDatabase();
  const row = db!.prepare('SELECT * FROM notes WHERE module_id = ? AND lesson_id = ?').get(moduleId, lessonId) as any;
  return row || null;
});

ipcMain.handle('db:saveNote', (_, moduleId: number, lessonId: string, content: string) => {
  initDatabase();
  const existing = db!.prepare('SELECT id FROM notes WHERE module_id = ? AND lesson_id = ?').get(moduleId, lessonId) as any;

  if (existing) {
    db!.prepare('UPDATE notes SET content = ?, updated_at = ? WHERE module_id = ? AND lesson_id = ?')
      .run(content, new Date().toISOString(), moduleId, lessonId);
  } else {
    db!.prepare('INSERT INTO notes (module_id, lesson_id, content) VALUES (?, ?, ?)')
      .run(moduleId, lessonId, content);
  }

  return { success: true };
});

// Bookmarks
ipcMain.handle('db:toggleBookmark', (_, moduleId: number, lessonId: string) => {
  initDatabase();
  const existing = db!.prepare('SELECT id FROM bookmarks WHERE module_id = ? AND lesson_id = ?').get(moduleId, lessonId) as any;

  if (existing) {
    db!.prepare('DELETE FROM bookmarks WHERE module_id = ? AND lesson_id = ?').run(moduleId, lessonId);
    return { bookmarked: false };
  } else {
    db!.prepare('INSERT INTO bookmarks (module_id, lesson_id) VALUES (?, ?)').run(moduleId, lessonId);
    return { bookmarked: true };
  }
});

ipcMain.handle('db:getBookmarks', () => {
  initDatabase();
  return db!.prepare('SELECT * FROM bookmarks ORDER BY created_at DESC').all();
});

ipcMain.handle('db:isBookmarked', (_, moduleId: number, lessonId: string) => {
  initDatabase();
  const row = db!.prepare('SELECT id FROM bookmarks WHERE module_id = ? AND lesson_id = ?').get(moduleId, lessonId);
  return !!row;
});

// Settings
ipcMain.handle('db:getSetting', (_, key: string) => {
  initDatabase();
  const row = db!.prepare('SELECT value FROM settings WHERE key = ?').get(key) as any;
  return row?.value || null;
});

ipcMain.handle('db:setSetting', (_, key: string, value: string) => {
  initDatabase();
  const existing = db!.prepare('SELECT key FROM settings WHERE key = ?').get(key) as any;
  if (existing) {
    db!.prepare('UPDATE settings SET value = ? WHERE key = ?').run(value, key);
  } else {
    db!.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run(key, value);
  }
  return { success: true };
});

// Achievements
ipcMain.handle('db:unlockAchievement', (_, achievementId: string) => {
  initDatabase();
  try {
    db!.prepare('INSERT INTO achievements (achievement_id) VALUES (?)').run(achievementId);
    return { success: true, newlyUnlocked: true };
  } catch {
    return { success: true, newlyUnlocked: false };
  }
});

ipcMain.handle('db:getAchievements', () => {
  initDatabase();
  return db!.prepare('SELECT * FROM achievements ORDER BY unlocked_at DESC').all();
});

// User stats
ipcMain.handle('db:getUserStats', () => {
  initDatabase();
  const row = db!.prepare('SELECT * FROM user_points WHERE id = 1').get() as DbUserPointsRow | undefined;
  return normalizeUserStats(row);
});


// Practical exam
ipcMain.handle('db:saveExamResult', (_, data: {
  taskId: string;
  area: string;
  title: string;
  score: number;
  passedChecks: string[];
  submittedCode?: string;
}) => {
  initDatabase();
  const now = new Date().toISOString();
  db!.prepare(
    `INSERT INTO exam_results (task_id, area, title, score, passed_checks, submitted_code, completed, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(task_id) DO UPDATE SET
       area = excluded.area,
       title = excluded.title,
       score = excluded.score,
       passed_checks = excluded.passed_checks,
       submitted_code = excluded.submitted_code,
       completed = excluded.completed,
       updated_at = excluded.updated_at`
  ).run(
    data.taskId,
    data.area,
    data.title,
    Math.max(0, Math.min(100, Math.round(data.score))),
    JSON.stringify(data.passedChecks ?? []),
    data.submittedCode ?? null,
    data.score >= 100 ? 1 : 0,
    now
  );
  return { success: true, updatedAt: now };
});

ipcMain.handle('db:getExamResults', () => {
  initDatabase();
  return db!.prepare('SELECT * FROM exam_results ORDER BY updated_at DESC').all();
});

ipcMain.handle('db:getExamStatus', (_, requiredTaskIds: string[]) => {
  initDatabase();
  const rows = db!.prepare('SELECT task_id, score, completed, updated_at FROM exam_results').all() as Array<{
    task_id: string;
    score: number;
    completed: number;
    updated_at: string;
  }>;
  const completedIds = new Set(rows.filter((row) => row.completed || row.score >= 100).map((row) => row.task_id));
  const missingTaskIds = requiredTaskIds.filter((id) => !completedIds.has(id));
  const requiredCount = requiredTaskIds.length;
  const completedCount = requiredCount - missingTaskIds.length;
  return {
    passed: requiredCount > 0 && missingTaskIds.length === 0,
    requiredCount,
    completedCount,
    missingTaskIds,
    percentage: requiredCount > 0 ? Math.round((completedCount / requiredCount) * 100) : 0,
    updatedAt: rows[0]?.updated_at ?? null,
  };
});

// Export/Import
ipcMain.handle('app:exportData', async () => {
  initDatabase();
  const data = {
    progress: db!.prepare('SELECT * FROM progress').all(),
    quizResults: db!.prepare('SELECT * FROM quiz_results').all(),
    notes: db!.prepare('SELECT * FROM notes').all(),
    bookmarks: db!.prepare('SELECT * FROM bookmarks').all(),
    achievements: db!.prepare('SELECT * FROM achievements').all(),
    settings: db!.prepare('SELECT * FROM settings').all(),
    userPoints: db!.prepare('SELECT * FROM user_points').all(),
    examResults: db!.prepare('SELECT * FROM exam_results').all(),
    exerciseResults: db!.prepare('SELECT * FROM exercise_results').all(),
    exportedAt: new Date().toISOString(),
  };

  const result = await dialog.showSaveDialog(mainWindow!, {
    title: 'Eksportuj dane',
    defaultPath: 'playwright-learning-backup.json',
    filters: [{ name: 'JSON', extensions: ['json'] }],
  });

  if (!result.canceled && result.filePath) {
    fs.writeFileSync(result.filePath, JSON.stringify(data, null, 2), 'utf-8');
    return { success: true, path: result.filePath };
  }
  return { success: false };
});

ipcMain.handle('app:importData', async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    title: 'Importuj dane',
    filters: [{ name: 'JSON', extensions: ['json'] }],
    properties: ['openFile'],
  });

  if (result.canceled || !result.filePaths[0]) {
    return { success: false };
  }

  try {
    const raw = fs.readFileSync(result.filePaths[0], 'utf-8');
    const parsed = JSON.parse(raw) as unknown;
    const dataRecord = asRecord(parsed);
    if (!dataRecord) {
      throw new Error('Backup file must contain a JSON object');
    }
    const data = dataRecord as BackupPayload;

    initDatabase();

    const insertProgress = db!.prepare(
      'INSERT OR REPLACE INTO progress (module_id, lesson_id, completed, score, time_spent, last_accessed) VALUES (?, ?, ?, ?, ?, ?)'
    );
    const insertQuizResult = db!.prepare(
      'INSERT INTO quiz_results (module_id, lesson_id, score, total_questions, correct_answers, completed_at, answers) VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    const insertNotes = db!.prepare(
      'INSERT OR REPLACE INTO notes (module_id, lesson_id, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?)'
    );
    const insertBookmark = db!.prepare(
      'INSERT OR IGNORE INTO bookmarks (module_id, lesson_id, created_at) VALUES (?, ?, ?)'
    );
    const insertAchievement = db!.prepare(
      'INSERT OR IGNORE INTO achievements (achievement_id, unlocked_at) VALUES (?, ?)'
    );
    const insertSetting = db!.prepare(
      'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)'
    );
    const updateUserPoints = db!.prepare(
      'UPDATE user_points SET points = ?, streak = ?, last_activity_date = ?, total_time_spent = ? WHERE id = 1'
    );
    const insertExamResult = db!.prepare(
      'INSERT OR REPLACE INTO exam_results (task_id, area, title, score, passed_checks, submitted_code, completed, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    );
    const insertExerciseResult = db!.prepare(
      'INSERT OR REPLACE INTO exercise_results (module_id, lesson_id, exercise_id, score, passed_checks, answer, completed, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    );

    const importTransaction = db!.transaction(() => {
      for (const item of data.progress ?? []) {
        const p = asRecord(item);
        if (!p) continue;
        insertProgress.run(
          toInteger(p.module_id),
          toStringValue(p.lesson_id),
          toInteger(p.completed),
          toNumber(p.score),
          toInteger(p.time_spent),
          toStringOrNull(p.last_accessed)
        );
      }

      for (const item of data.quizResults ?? []) {
        const q = asRecord(item);
        if (!q) continue;
        insertQuizResult.run(
          toInteger(q.module_id),
          toStringValue(q.lesson_id),
          toNumber(q.score),
          toInteger(q.total_questions),
          toInteger(q.correct_answers),
          toStringOrNull(q.completed_at) ?? new Date().toISOString(),
          typeof q.answers === 'string' ? q.answers : JSON.stringify(q.answers ?? [])
        );
      }

      for (const item of data.notes ?? []) {
        const n = asRecord(item);
        if (!n) continue;
        insertNotes.run(
          toInteger(n.module_id),
          toStringValue(n.lesson_id),
          toStringValue(n.content),
          toStringOrNull(n.created_at) ?? new Date().toISOString(),
          toStringOrNull(n.updated_at) ?? new Date().toISOString()
        );
      }

      for (const item of data.bookmarks ?? []) {
        const b = asRecord(item);
        if (!b) continue;
        insertBookmark.run(
          toInteger(b.module_id),
          toStringValue(b.lesson_id),
          toStringOrNull(b.created_at) ?? new Date().toISOString()
        );
      }

      for (const item of data.achievements ?? []) {
        const a = asRecord(item);
        if (!a) continue;
        insertAchievement.run(
          toStringValue(a.achievement_id),
          toStringOrNull(a.unlocked_at) ?? new Date().toISOString()
        );
      }

      for (const item of data.settings ?? []) {
        const setting = asRecord(item);
        if (!setting) continue;
        insertSetting.run(toStringValue(setting.key), toStringValue(setting.value));
      }

      for (const item of data.examResults ?? []) {
        const exam = asRecord(item);
        if (!exam) continue;
        insertExamResult.run(
          toStringValue(exam.task_id),
          toStringValue(exam.area),
          toStringValue(exam.title),
          toInteger(exam.score),
          toStringValue(exam.passed_checks, '[]'),
          toStringOrNull(exam.submitted_code),
          toInteger(exam.completed),
          toStringOrNull(exam.updated_at) ?? new Date().toISOString()
        );
      }

      for (const item of data.exerciseResults ?? []) {
        const exercise = asRecord(item);
        if (!exercise) continue;
        insertExerciseResult.run(
          toInteger(exercise.module_id),
          toStringValue(exercise.lesson_id),
          toStringValue(exercise.exercise_id),
          toInteger(exercise.score),
          toStringValue(exercise.passed_checks, '[]'),
          toStringOrNull(exercise.answer),
          toInteger(exercise.completed),
          toStringOrNull(exercise.updated_at) ?? new Date().toISOString()
        );
      }

      const firstUserPoints = (data.userPoints ?? []).map(asRecord).find(Boolean);
      if (firstUserPoints) {
        updateUserPoints.run(
          toInteger(firstUserPoints.points),
          toInteger(firstUserPoints.streak),
          toStringOrNull(firstUserPoints.last_activity_date) ?? new Date().toISOString(),
          toInteger(firstUserPoints.total_time_spent)
        );
      }
    });

    importTransaction();
    return { success: true };
  } catch (error) {
    console.error('Failed to import data:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown import error' };
  }
});


// Exercise results
ipcMain.handle('db:saveExerciseResult', (_, data: {
  moduleId: number;
  lessonId: string;
  exerciseId: string;
  score: number;
  passedChecks: string[];
  answer?: string;
}) => {
  initDatabase();
  const now = new Date().toISOString();
  const score = Math.max(0, Math.min(100, Math.round(data.score)));
  db!.prepare(
    `INSERT INTO exercise_results (module_id, lesson_id, exercise_id, score, passed_checks, answer, completed, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(module_id, lesson_id, exercise_id) DO UPDATE SET
       score = excluded.score,
       passed_checks = excluded.passed_checks,
       answer = excluded.answer,
       completed = excluded.completed,
       updated_at = excluded.updated_at`
  ).run(
    data.moduleId,
    data.lessonId,
    data.exerciseId,
    score,
    JSON.stringify(data.passedChecks ?? []),
    data.answer ?? '',
    score >= 80 ? 1 : 0,
    now
  );
  return { success: true, updatedAt: now };
});

ipcMain.handle('db:getExerciseResult', (_, moduleId: number, lessonId: string, exerciseId: string) => {
  initDatabase();
  return db!.prepare(
    'SELECT * FROM exercise_results WHERE module_id = ? AND lesson_id = ? AND exercise_id = ?'
  ).get(moduleId, lessonId, exerciseId) ?? null;
});

ipcMain.handle('db:getExerciseResultsForLesson', (_, moduleId: number, lessonId: string) => {
  initDatabase();
  return db!.prepare(
    'SELECT * FROM exercise_results WHERE module_id = ? AND lesson_id = ? ORDER BY updated_at DESC'
  ).all(moduleId, lessonId);
});

ipcMain.handle('db:getAllExerciseResults', () => {
  initDatabase();
  return db!.prepare('SELECT * FROM exercise_results ORDER BY updated_at DESC').all();
});

// Playground
ipcMain.handle('app:runPlaygroundTest', async (_, code: string) => {
  if (typeof code !== 'string' || code.trim().length === 0) {
    return {
      success: false,
      exitCode: null,
      timedOut: false,
      durationMs: 0,
      stdout: '',
      stderr: '',
      command: '',
      runDir: '',
      testFile: '',
      error: 'Edytor jest pusty — wpisz kod testu przed uruchomieniem.',
    } satisfies PlaygroundRunResult;
  }

  if (code.length > 200_000) {
    return {
      success: false,
      exitCode: null,
      timedOut: false,
      durationMs: 0,
      stdout: '',
      stderr: '',
      command: '',
      runDir: '',
      testFile: '',
      error: 'Kod jest zbyt długi dla placu zabaw. Skróć przykład do pojedynczej lekcji lub jednego scenariusza.',
    } satisfies PlaygroundRunResult;
  }

  return runPlaywrightTest(code);
});

// External links
ipcMain.handle('app:openExternal', async (_, rawUrl: string) => {
  const url = new URL(rawUrl);
  if (!['https:', 'http:'].includes(url.protocol)) {
    throw new Error(`Unsupported external URL protocol: ${url.protocol}`);
  }
  await shell.openExternal(url.toString());
});

// ============ App Lifecycle ============

app.whenReady().then(() => {
  initDatabase();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (db) {
    db.close();
    db = null;
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  if (db) {
    db.close();
    db = null;
  }
});