import React, { useState, useMemo } from 'react';
import { useAppStore } from '@stores/appStore';
import { allModules } from '@content/modules';
import { BookOpen, Target, ArrowRight, CheckCircle2, Clock, Zap, Globe, Shield } from 'lucide-react';
import { cn } from '@lib/utils';

interface PathNode {
  moduleId: number;
  title: string;
  description: string;
  icon: string;
  estimatedWeeks: number;
  reason: string;
}

const goals: { id: string; label: string; icon: React.ReactNode; desc: string }[] = [
  { id: 'from-scratch', label: 'Od zera do testera', icon: <BookOpen size={20} />, desc: 'Nigdy nie pisalem testow automatycznych. Chce nauczyc sie wszystkiego od podstaw.' },
  { id: 'master-pom', label: 'Mistrz POM', icon: <Target size={20} />, desc: 'Piszac testy, ale chce opanowac Wzorzec obiektu strony, kompozycje i wzorce.' },
  { id: 'ci-cd', label: 'CI/CD Expert', icon: <Zap size={20} />, desc: 'Chce zintegrowac testy z pipeline CI/CD, sharding, cache, monitoring.' },
  { id: 'api', label: 'API & Kontrakty', icon: <Globe size={20} />, desc: 'Interesuje mnie testowanie API, GraphQL, kontrakty (Pact), mocki.' },
  { id: 'security', label: 'Bezpieczeństwo & Compliance', icon: <Shield size={20} />, desc: 'Chce testowac bezpieczenstwo, penetracje, RODO, WCAG, compliance.' },
];

const levels: { id: string; label: string; desc: string }[] = [
  { id: 'beginner', label: 'Poczatkujacy', desc: 'Dopiero zaczynam z automatyzacja testow.' },
  { id: 'intermediate', label: 'Sredniozaawansowany', desc: 'Pisze testy, ale chce isc glebiej.' },
  { id: 'advanced', label: 'Zaawansowany', desc: 'Mam doswiadczenie, szukam zaawansowanych technik.' },
];

const paths: Record<string, { title: string; desc: string; modules: PathNode[]; totalWeeks: number }> = {
  'from-scratch': {
    title: 'Od zera do testera Playwright',
    desc: 'Pelna sciezka od instalacji po CI/CD i zaawansowane testy.',
    totalWeeks: 12,
    modules: [
      { moduleId: 1, title: 'Wprowadzenie do Playwright', description: 'Instalacja, pierwszy test, architektura', icon: '\ud83d\ude80', estimatedWeeks: 1, reason: 'Fundament - musisz wiedziec jak dziala Playwright' },
      { moduleId: 2, title: 'Podstawy testow', description: 'Selektory, akcje, asercje, nawigacja', icon: '\ud83d\udcdd', estimatedWeeks: 2, reason: 'Podstawowe techniki testowania interfejsu użytkownika' },
      { moduleId: 3, title: 'Asercje i weryfikacje', description: 'Auto-waiting, expect API, matchers', icon: '\u2705', estimatedWeeks: 1, reason: 'Kluczowa umiejetnosc - pisanie poprawnych asercji' },
      { moduleId: 4, title: 'Interakcje Zaawansowane', description: 'Drag & drop, iframes, dialogs', icon: '\ud83d\udd8c\ufe0f', estimatedWeeks: 1, reason: 'Testy prawdziwych, zlozonych interfejsow' },
      { moduleId: 5, title: 'Test Runner', description: 'Konfiguracja, fixtures, tagi, organizacja', icon: '\u2699\ufe0f', estimatedWeeks: 1, reason: 'Zorganizowana struktura testow' },
      { moduleId: 6, title: 'Wzorzec obiektu strony', description: 'POM, komponenty, fixtures', icon: '\ud83d\udcd0', estimatedWeeks: 2, reason: 'Podstawa utrzymywalnej automatyzacji' },
      { moduleId: 9, title: 'Debugowanie', description: 'Inspector, Trace Viewer, VS Code', icon: '\ud83d\udd0d', estimatedWeeks: 1, reason: 'Umiejetnosc debugowania oszczedza godziny' },
      { moduleId: 10, title: 'Raportowanie', description: 'Reportery, quality gates, dashboards', icon: '\ud83d\udcca', estimatedWeeks: 1, reason: 'Raporty dla zespolu i managementu' },
      { moduleId: 11, title: 'CI/CD', description: 'GitHub Actions, Docker, optymalizacja', icon: '\u26a1', estimatedWeeks: 2, reason: 'Automatyzacja w pipeline' },
    ],
  },
  'master-pom': {
    title: 'Mistrz Wzorzec obiektu strony',
    desc: 'Od podstaw POM po zaawansowane wzorce projektowe.',
    totalWeeks: 5,
    modules: [
      { moduleId: 6, title: 'Wzorzec obiektu strony', description: 'POM, komponenty, wzorce', icon: '\ud83d\udcd0', estimatedWeeks: 2, reason: 'Fundament POM' },
      { moduleId: 12, title: 'Best Practices', description: 'SOLID, refaktoryzacja, standardy', icon: '\ud83c\udf1f', estimatedWeeks: 1, reason: 'Kod testowy na poziomie produkcyjnym' },
      { moduleId: 7, title: 'Dane testowe', description: 'Fixtures, fabryki, data-driven', icon: '\ud83d\udce6', estimatedWeeks: 1, reason: 'Dane testowe w POM' },
      { moduleId: 16, title: 'Testowanie komponentów', description: 'Playwright CT, komponenty React/Vue', icon: '\ud83e\udde9', estimatedWeeks: 1, reason: 'Testowanie komponentow w izolacji' },
    ],
  },
  'ci-cd': {
    title: 'CI/CD Expert', desc: 'Pipeline, sharding, monitoring, optymalizacja.',
    totalWeeks: 5,
    modules: [
      { moduleId: 11, title: 'CI/CD', description: 'GitHub Actions, Azure, CircleCI', icon: '\u26a1', estimatedWeeks: 2, reason: 'Konfiguracja pipeline' },
      { moduleId: 13, title: 'Wydajność', description: 'Wydajnosc testow, monitoring', icon: '\u26a1', estimatedWeeks: 2, reason: 'Szybkie i stabilne CI' },
      { moduleId: 16, title: 'Docker', description: 'Testcontainers, docker-compose', icon: '\ud83d\udc33', estimatedWeeks: 1, reason: 'Konteneryzacja testow' },
    ],
  },
  'api': {
    title: 'API & Kontrakty Expert', desc: 'REST, GraphQL, Pact, walidacja schematow.',
    totalWeeks: 4,
    modules: [
      { moduleId: 8, title: 'Testowanie API', description: 'REST, GraphQL, kontrakty', icon: '\ud83d\udd0c', estimatedWeeks: 2, reason: 'Fundament testow API' },
      { moduleId: 7, title: 'Dane testowe', description: 'Generowanie danych, mocki', icon: '\ud83d\udce6', estimatedWeeks: 1, reason: 'Dane testowe dla API' },
      { moduleId: 10, title: 'Raportowanie', description: 'Raporty API, quality gates', icon: '\ud83d\udcca', estimatedWeeks: 1, reason: 'Dokumentacja API testow' },
    ],
  },
  'security': {
    title: 'Bezpieczeństwo & Compliance', desc: 'OWASP, RODO, WCAG, pentesty.',
    totalWeeks: 5,
    modules: [
      { moduleId: 14, title: 'Bezpieczeństwo & Accessibility', description: 'OWASP, WCAG, compliance', icon: '\ud83d\udee1\ufe0f', estimatedWeeks: 3, reason: 'Podstawy security i a11y' },
      { moduleId: 16, title: 'Integracje', description: 'Webhooki, Circuit Breaker', icon: '\ud83d\udd17', estimatedWeeks: 1, reason: 'Testowanie zewnetrznych integracji' },
      { moduleId: 13, title: 'Monitoring', description: 'Prometheus, Grafana, alerty', icon: '\ud83d\udcc8', estimatedWeeks: 1, reason: 'Monitorowanie bezpieczenstwa' },
    ],
  },
};

export function LearningPathWizard() {
  const [step, setStep] = useState<'goal' | 'level' | 'result'>('goal');
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string>('beginner');
  const { setCurrentLesson } = useAppStore();

  const path = selectedGoal ? paths[selectedGoal] : null;

  const handleSelectGoal = (goalId: string) => {
    setSelectedGoal(goalId);
    setStep('level');
  };

  const handleSelectLevel = (levelId: string) => {
    setSelectedLevel(levelId);
    setStep('result');
  };

  const handleStartModule = (moduleId: number) => {
    const mod = allModules.find(m => m.id === moduleId);
    if (mod && mod.lessons.length > 0) {
      setCurrentLesson(moduleId, mod.lessons[0].id);
    }
  };

  const handleReset = () => {
    setSelectedGoal(null);
    setSelectedLevel('beginner');
    setStep('goal');
  };

  const levelText = selectedLevel === 'beginner' ? 'Poczatkujacy' : selectedLevel === 'intermediate' ? 'Sredniozaawansowany' : 'Zaawansowany';

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4">
      {/* Header */}
      <div className="text-center mb-4">
        <h2 className="text-lg font-bold">\ud83e\udded Sciezka nauki</h2>
        <p className="text-xs text-muted-foreground mt-1">Dostosowana do Twoich celow i poziomu</p>
      </div>

      {/* Progress indicator */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {['goal', 'level', 'result'].map((s, i) => (
          <React.Fragment key={s}>
            <div className={cn(
              'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors',
              step === s ? 'bg-primary text-primary-foreground' : step === 'result' && i < 2 ? 'bg-green-500 text-white' : 'bg-secondary text-muted-foreground'
            )}>
              {s === 'goal' ? '1' : s === 'level' ? '2' : '3'}
            </div>
            {i < 2 && <div className={cn('w-8 h-0.5', step === 'result' || (step === 'level' && i === 0) ? 'bg-green-500' : 'bg-secondary')} />}
          </React.Fragment>
        ))}
      </div>

      {/* Goal selection */}
      {step === 'goal' && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground mb-2">Jaki jest Twoj glowny cel?</p>
          {goals.map(g => (
            <button key={g.id} onClick={() => handleSelectGoal(g.id)}
              className="w-full flex items-start gap-3 p-3 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-colors text-left">
              <div className="p-1.5 rounded bg-primary/10 text-primary shrink-0">{g.icon}</div>
              <div className="min-w-0">
                <div className="text-sm font-medium">{g.label}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">{g.desc}</div>
              </div>
              <ArrowRight size={16} className="text-muted-foreground shrink-0 self-center" />
            </button>
          ))}
        </div>
      )}

      {/* Level selection */}
      {step === 'level' && (
        <div className="space-y-2">
          <button onClick={() => setStep('goal')} className="text-xs text-primary hover:underline mb-2">&larr; Wroc do wyboru celu</button>
          <p className="text-xs font-medium text-muted-foreground mb-2">Jaki jest Twoj poziom?</p>
          {levels.map(l => (
            <button key={l.id} onClick={() => handleSelectLevel(l.id)}
              className={cn(
                'w-full flex items-start gap-3 p-3 rounded-lg border transition-colors text-left',
                selectedLevel === l.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
              )}>
              <div className={cn('w-4 h-4 rounded-full border-2 mt-0.5 shrink-0', selectedLevel === l.id ? 'border-primary bg-primary' : 'border-muted-foreground')} />
              <div className="min-w-0">
                <div className="text-sm font-medium">{l.label}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">{l.desc}</div>
              </div>
            </button>
          ))}
          <button onClick={() => handleSelectLevel(selectedLevel)}
            className="w-full mt-3 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
            Generuj sciezke
          </button>
        </div>
      )}

      {/* Result */}
      {step === 'result' && path && (
        <div className="space-y-3">
          <button onClick={() => setStep('level')} className="text-xs text-primary hover:underline">&larr; Wroc</button>
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
            <h3 className="text-base font-bold">{path.title}</h3>
            <p className="text-xs text-muted-foreground mt-1">{path.desc}</p>
            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Clock size={14} /> ~{path.totalWeeks} tygodni</span>
              <span className="flex items-center gap-1"><BookOpen size={14} /> {path.modules.length} modulow</span>
              <span>Poziom: {levelText}</span>
            </div>
          </div>

          <p className="text-xs font-medium text-muted-foreground mt-4">Twoja sciezka:</p>
          <div className="space-y-2">
            {path.modules.map((m, i) => (
              <div key={m.moduleId} className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                <div className="flex flex-col items-center shrink-0">
                  <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">{i + 1}</div>
                  {i < path.modules.length - 1 && <div className="w-0.5 h-4 bg-border" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{m.icon}</span>
                    <span className="text-sm font-medium">Modul {m.moduleId}: {m.title}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{m.reason}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">~{m.estimatedWeeks} tydz.</span>
                  </div>
                </div>
                <button onClick={() => handleStartModule(m.moduleId)}
                  className="shrink-0 self-center px-3 py-1.5 rounded-md bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors">
                  Start
                </button>
              </div>
            ))}
          </div>

          <button onClick={handleReset}
            className="w-full py-2 rounded-lg border border-border text-xs text-muted-foreground hover:bg-accent transition-colors mt-2">
            Wygeneruj nowa sciezke
          </button>
        </div>
      )}
    </div>
  );
}
