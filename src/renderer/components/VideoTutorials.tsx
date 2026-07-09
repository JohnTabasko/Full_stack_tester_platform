import React, { useState } from 'react';
import { Play, Youtube, Clock, Filter, Search, ExternalLink } from 'lucide-react';

interface Tutorial {
  id: string;
  title: string;
  duration: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  topic: string;
  youtubeId: string;
  description: string;
}

const TUTORIALS: Tutorial[] = [
  {
    id: 'v1', title: 'Playwright w 10 minut — szybki start',
    duration: '10:00', level: 'beginner', topic: 'Wprowadzenie',
    youtubeId: 'wawbt1cATtY',
    description: 'Instalacja, pierwszy test, omówienie podstawowych konceptów Playwright.'
  },
  {
    id: 'v2', title: 'Selektory —jak znaleźć każdy element',
    duration: '15:00', level: 'beginner', topic: 'Selektory',
    youtubeId: 'Xz6lh2SDxLs',
    description: 'CSS, Text, Role, TestID, XPath — wszystkie strategie selektorów.'
  },
  {
    id: 'v3', title: 'Auto-waiting — dlaczego nie potrzebujesz waitForTimeout',
    duration: '12:00', level: 'beginner', topic: 'Auto-waiting',
    youtubeId: '5Xm5Nn5FSOE',
    description: 'Jak działa auto-waiting, actionability checks, dlaczego waitForTimeout to antypattern.'
  },
  {
    id: 'v4', title: 'Wzorzec obiektu strony — od podstaw do zaawansowanych',
    duration: '25:00', level: 'intermediate', topic: 'POM',
    youtubeId: '6FJzQSk3LRE',
    description: 'BasePage, komponenty, Page Factory, Fluent API, Journey Pattern.'
  },
  {
    id: 'v5', title: 'Testowanie API z Playwright — REST i GraphQL',
    duration: '20:00', level: 'intermediate', topic: 'Testowanie API',
    youtubeId: 'd8B2D3sFpX0',
    description: 'request fixture, CRUD, JSON Schema validation, GraphQL queries i mutations.'
  },
  {
    id: 'v6', title: 'Network Interception — mockowanie, blokowanie, modyfikacja',
    duration: '18:00', level: 'intermediate', topic: 'Sieć',
    youtubeId: 'Fh9g3X9mOqU',
    description: 'page.route(), route.fulfill(), route.abort(), HAR recording i replay.'
  },
  {
    id: 'v7', title: 'CI/CD z GitHub Actions — kompletny pipeline',
    duration: '22:00', level: 'intermediate', topic: 'CI/CD',
    youtubeId: 'Hn5g4JkLmNo',
    description: 'Workflow, matrix, sharding, cache, artifacts, report publishing na GitHub Pages.'
  },
  {
    id: 'v8', title: 'Fixtures — dependency injection w Playwright',
    duration: '20:00', level: 'intermediate', topic: 'Fikstury',
    youtubeId: 'Kp8q7RtUvWx',
    description: 'test.extend(), custom fixtures, worker-scoped, auto-fixtures, Application fixture.'
  },
  {
    id: 'v9', title: 'Debugowanie — Inspector, Trace Viewer, tryb UI',
    duration: '18:00', level: 'intermediate', topic: 'Debugowanie',
    youtubeId: 'Lm3n4OpQrSt',
    description: '--debug, page.pause(), Trace Viewer time-travel, tryb UI, VS Code debugging.'
  },
  {
    id: 'v10', title: 'Testy regresji wizualnej — toHaveScreenshot i Percy',
    duration: '15:00', level: 'intermediate', topic: 'Testy wizualne',
    youtubeId: 'Nq9r8TsUvWx',
    description: 'toHaveScreenshot(), baseline, masking, cross-browser, Percy integration.'
  },
  {
    id: 'v11', title: 'Zarządzanie danymi testowymi — Factory, Builder, Faker.js',
    duration: '20:00', level: 'intermediate', topic: 'Dane testowe',
    youtubeId: 'Pw5x6YzAbCd',
    description: 'Factory pattern, Builder z fluent API, Faker.js z seed, cleanup tracker.'
  },
  {
    id: 'v12', title: 'Bezpieczeństwo i dostępność — OWASP + WCAG',
    duration: '25:00', level: 'advanced', topic: 'Bezpieczeństwo/A11y',
    youtubeId: 'Qr3s4TuVwXy',
    description: 'XSS, CSRF, security headers, axe-core, nawigacja klawiaturą, color contrast.'
  },
  {
    id: 'v13', title: 'Performance — test execution i aplikacji',
    duration: '22:00', level: 'advanced', topic: 'Wydajność',
    youtubeId: 'Rs7t8UvWxYz',
    description: 'Resource blocking, auth reuse, workers, sharding, Lighthouse CI, Core Web Vitals.'
  },
  {
    id: 'v14', title: 'Authentication — storageState, JWT, OAuth, MFA',
    duration: '20:00', level: 'intermediate', topic: 'Uwierzytelnianie',
    youtubeId: 'St9u0VwXyZa',
    description: 'globalSetup, storageState, JWT token injection, OAuth popup, TOTP MFA.'
  },
  {
    id: 'v15', title: 'Capstone — budowa kompletnego frameworku testów',
    duration: '30:00', level: 'advanced', topic: 'Projekt',
    youtubeId: 'Tu1v2WxYzAb',
    description: 'Architektura, POM, fixtures, CI/CD, reporting — wszystko od zera do production-ready.'
  },
];

const TOPICS = ['Wprowadzenie', 'Selektory', 'Auto-waiting', 'POM', 'Testowanie API', 'Sieć', 'CI/CD', 'Fikstury', 'Debugowanie', 'Testy wizualne', 'Dane testowe', 'Bezpieczeństwo/A11y', 'Wydajność', 'Uwierzytelnianie', 'Projekt'];
const LEVELS = ['beginner', 'intermediate', 'advanced'] as const;

export function VideoTutorials() {
  const [selectedVideo, setSelectedVideo] = useState<Tutorial | null>(null);
  const [filterTopic, setFilterTopic] = useState<string>('');
  const [filterLevel, setFilterLevel] = useState<string>('');
  const [search, setSearch] = useState('');

  const filtered = TUTORIALS.filter(t => {
    if (filterTopic && t.topic !== filterTopic) return false;
    if (filterLevel && t.level !== filterLevel) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase()) && !t.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const levelColor = (level: string) =>
    level === 'beginner' ? 'bg-green-500/10 text-green-400' :
    level === 'intermediate' ? 'bg-blue-500/10 text-blue-400' :
    'bg-purple-500/10 text-purple-400';

  const levelLabel = (level: string) =>
    level === 'beginner' ? '🟢 Podstawowy' :
    level === 'intermediate' ? '🔵 Średni' : '🟣 Zaawansowany';

  return (
    <div className="h-full overflow-y-auto p-6 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
          <Youtube size={20} className="text-red-500" /> Video Tutorials
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          15 filmów instruktażowych — od podstaw do eksperta. Wybierz temat i oglądaj.
        </p>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Szukaj filmu..." className="w-full pl-9 pr-3 py-2 bg-secondary rounded-md text-sm outline-none" />
          </div>
          <select value={filterTopic} onChange={e => setFilterTopic(e.target.value)}
            className="px-3 py-2 bg-secondary rounded-md text-sm outline-none">
            <option value="">Wszystkie tematy</option>
            {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={filterLevel} onChange={e => setFilterLevel(e.target.value)}
            className="px-3 py-2 bg-secondary rounded-md text-sm outline-none">
            <option value="">Wszystkie poziomy</option>
            {LEVELS.map(l => <option key={l} value={l}>{levelLabel(l)}</option>)}
          </select>
        </div>

        {/* Video player */}
        {selectedVideo && (
          <div className="mb-6 rounded-xl overflow-hidden border border-border bg-black">
            <div className="aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}?autoplay=1&rel=0`}
                title={selectedVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
            <div className="p-4 bg-card">
              <h3 className="font-semibold">{selectedVideo.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{selectedVideo.description}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`text-xs px-2 py-0.5 rounded ${levelColor(selectedVideo.level)}`}>
                  {levelLabel(selectedVideo.level)}
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock size={12} /> {selectedVideo.duration}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Video list */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map(tutorial => (
            <button
              key={tutorial.id}
              onClick={() => setSelectedVideo(tutorial)}
              className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all hover:border-primary/40 ${
                selectedVideo?.id === tutorial.id ? 'border-primary bg-primary/5' : 'border-border bg-card'
              }`}
            >
              <div className="relative shrink-0 w-24 h-16 rounded-lg bg-black overflow-hidden flex items-center justify-center">
                <Play size={20} className="text-white/70" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${levelColor(tutorial.level)}`}>
                    {levelLabel(tutorial.level)}
                  </span>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Clock size={10} /> {tutorial.duration}
                  </span>
                </div>
                <p className="text-sm font-medium mt-1 line-clamp-2">{tutorial.title}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{tutorial.topic}</p>
              </div>
            </button>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Youtube size={32} className="mx-auto mb-2 opacity-30" />
            <p>Brak filmów spełniających kryteria</p>
          </div>
        )}

        <div className="mt-8 p-4 bg-primary/5 rounded-lg border border-primary/20 text-sm text-center">
          <p>
            Więcej tutoriali na oficjalnym kanale{' '}
            <button onClick={() => window.electronAPI?.openExternal('https://www.youtube.com/@Playwrightdev')} 
              className="text-primary underline inline-flex items-center gap-1">
              Playwright na YouTube <ExternalLink size={11} />
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
