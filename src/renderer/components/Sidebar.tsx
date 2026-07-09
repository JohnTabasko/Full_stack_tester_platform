import React, { lazy, Suspense, useState } from 'react';
import { ChevronDown, ChevronRight, CheckCircle2, Circle, BookOpen, Bookmark, StickyNote, Trophy, BarChart3, Target, HelpCircle, Bug, Award, Settings as SettingsIcon, FileText, Youtube, Compass, Box, Terminal, Play, Printer, FlaskConical } from 'lucide-react';
import { useAppStore } from '@stores/appStore';
import { cn } from '@lib/utils';
import type { Module, SidebarSection } from '../types';

const DailyChallenges = lazy(() => import('./DailyChallenges').then((m) => ({ default: m.DailyChallenges })));
const Faq = lazy(() => import('./Faq').then((m) => ({ default: m.Faq })));
const Glossary = lazy(() => import('./Glossary').then((m) => ({ default: m.Glossary })));
const TroubleshootingWizard = lazy(() => import('./TroubleshootingWizard').then((m) => ({ default: m.TroubleshootingWizard })));
const Settings = lazy(() => import('./Settings').then((m) => ({ default: m.Settings })));
const CheatSheets = lazy(() => import('./CheatSheets').then((m) => ({ default: m.CheatSheets })));
const VideoTutorials = lazy(() => import('./VideoTutorials').then((m) => ({ default: m.VideoTutorials })));
const LearningPathWizard = lazy(() => import('./LearningPathWizard').then((m) => ({ default: m.LearningPathWizard })));
const InteractiveSandbox = lazy(() => import('./InteractiveSandbox').then((m) => ({ default: m.InteractiveSandbox })));
const ProjectTemplates = lazy(() => import('./ProjectTemplates').then((m) => ({ default: m.ProjectTemplates })));
const PdfExport = lazy(() => import('./PdfExport').then((m) => ({ default: m.PdfExport })));
const PracticalLab = lazy(() => import('./PracticalLab').then((m) => ({ default: m.PracticalLab })));

function PanelFallback() {
  return <div className="p-4 text-xs text-muted-foreground animate-pulse">Ładowanie sekcji...</div>;
}

interface SidebarProps {
  modules: Module[];
  currentModuleId: number | null;
  currentLessonId: string | null;
  onSelectLesson: (moduleId: number, lessonId: string) => void;
  isOpen: boolean;
}

export function Sidebar({ modules, currentModuleId, currentLessonId, onSelectLesson, isOpen }: SidebarProps) {
  const { progress, isLessonCompleted, getModuleProgress, sidebarSection, setSidebarSection, bookmarkedLessons } = useAppStore();
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set([1]));

  const toggleModule = (moduleId: number) => {
    setExpandedModules((prev) => { const next = new Set(prev); if (next.has(moduleId)) next.delete(moduleId); else next.add(moduleId); return next; });
  };

  const sections: { id: SidebarSection; label: string; icon: React.ReactNode }[] = [
    { id: 'modules', label: 'Moduły', icon: <BookOpen size={16} /> },
    { id: 'bookmarks', label: 'Zakładki', icon: <Bookmark size={16} /> },
    { id: 'daily', label: 'Wyzwania', icon: <Target size={16} /> },
    { id: 'cheatsheets', label: 'Ściągi', icon: <FileText size={16} /> },
    { id: 'videos', label: 'Video', icon: <Youtube size={16} /> },
    { id: 'faq', label: 'FAQ', icon: <HelpCircle size={16} /> },
    { id: 'glossary', label: 'Słownik', icon: <BookOpen size={16} /> },
    { id: 'achievements', label: 'Osiągnięcia', icon: <Trophy size={16} /> },
    { id: 'certificate', label: 'Certyfikat', icon: <Award size={16} /> },
    { id: 'wizard', label: 'Diagnostyka', icon: <Bug size={16} /> },
    { id: 'path', label: 'Sciezka', icon: <Compass size={16} /> },
    { id: 'templates', label: 'Szablony', icon: <Box size={16} /> },
    { id: 'sandbox', label: 'Sandbox', icon: <Terminal size={16} /> },
    { id: 'practice', label: 'Praktyka', icon: <FlaskConical size={16} /> },
    { id: 'settings', label: 'Ustawienia', icon: <SettingsIcon size={16} /> },
  ];

  if (!isOpen) return null;

  return (
    <aside className="w-full md:w-80 md:max-w-80 max-h-[42vh] md:max-h-none flex flex-col rounded-2xl app-surface shrink-0 overflow-hidden">
      <div className="border-b border-border/70 p-3">
        <div className="mb-2 flex items-center justify-between px-1">
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Nawigacja</span>
          <span className="text-[10px] text-muted-foreground">{modules.length} modułów</span>
        </div>
        <div className="grid grid-cols-4 gap-1.5">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => setSidebarSection(section.id)}
            title={section.label}
            className={cn(
              'nav-tile flex flex-col items-center gap-1',
              sidebarSection === section.id ? 'nav-tile-active' : 'nav-tile-idle'
            )}
          >
            {section.icon}
            <span className="max-w-full truncate">{section.label}</span>
          </button>
        ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {sidebarSection === 'modules' && (
          <div className="p-2 space-y-1">
            {modules.map((module) => {
              const progress = getModuleProgress(module.id, module.lessons.length);
              const isExpanded = expandedModules.has(module.id);
              return (
                <div key={module.id} className="mb-0.5">
                  <button onClick={() => toggleModule(module.id)}
                    className={cn('w-full flex items-center gap-2 px-3 py-2.5 text-sm rounded-xl hover:bg-accent/60 transition-all', currentModuleId === module.id && 'bg-primary/10 text-primary ring-1 ring-primary/20')}>
                    {isExpanded ? <ChevronDown size={14} className="text-muted-foreground shrink-0" /> : <ChevronRight size={14} className="text-muted-foreground shrink-0" />}
                    <span className="mr-1">{module.icon}</span>
                    <div className="flex-1 text-left min-w-0">
                      <div className="font-medium text-xs truncate">{module.title}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden"><div className="h-full progress-gradient rounded-full transition-all" style={{ width: `${progress}%` }} /></div>
                        <span className="text-[10px] text-muted-foreground">{progress}%</span>
                      </div>
                    </div>
                  </button>
                  {isExpanded && (
                    <div className="ml-2">
                      {module.lessons.map((lesson) => {
                        const completed = isLessonCompleted(module.id, lesson.id);
                        const isCurrent = currentModuleId === module.id && currentLessonId === lesson.id;
                        return (
                          <button key={lesson.id} onClick={() => onSelectLesson(module.id, lesson.id)}
                            className={cn('w-full flex items-center gap-2 px-3 py-2 text-xs transition-all rounded-xl mx-1 my-0.5',
                              isCurrent ? 'bg-primary/10 text-primary font-medium ring-1 ring-primary/20' : 'hover:bg-accent/50 text-muted-foreground hover:text-foreground')}>
                            {completed ? <CheckCircle2 size={14} className="text-green-500 shrink-0" /> : <Circle size={14} className="text-muted-foreground/50 shrink-0" />}
                            <span className="flex-1 text-left truncate">{lesson.title}</span>
                            <span className="text-[10px] text-muted-foreground shrink-0">{lesson.duration}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {sidebarSection === 'bookmarks' && (
          <div className="py-2">
            {[...bookmarkedLessons].length === 0 ? (
              <div className="px-4 py-8 text-center text-xs text-muted-foreground">
                <Bookmark size={24} className="mx-auto mb-2 opacity-30" /><p>Brak zakładek</p>
              </div>
            ) : (
              [...bookmarkedLessons].map(lessonKey => {
                const [moduleId, lessonId] = lessonKey.split('-');
                const mod = modules.find(m => m.id === parseInt(moduleId));
                const les = mod?.lessons.find(l => l.id === lessonId);
                if (!les) return null;
                return (
                  <button key={lessonKey} onClick={() => onSelectLesson(parseInt(moduleId), lessonId)} className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-accent/50">
                    <Bookmark size={14} className="text-amber-400 shrink-0" /><span className="flex-1 text-left truncate">{les.title}</span>
                  </button>
                );
              })
            )}
          </div>
        )}

        {sidebarSection === 'achievements' && (
          <div className="py-2">
            {[
              { id: 'first-lesson', icon: '🎯', title: 'Pierwszy krok', desc: 'Ukończ pierwszą lekcję' },
              { id: 'module-1-complete', icon: '🏗️', title: 'Fundamenty', desc: 'Ukończ Moduł 1' },
              { id: 'quiz-master', icon: '🏆', title: 'Mistrz Quizów', desc: '3 quizy na 100%' },
              { id: 'streak-7', icon: '🔥', title: 'Tydzień nauki', desc: 'Passa 7 dni' },
            ].map((ach) => {
              const unlocked = useAppStore.getState().unlockedAchievements.includes(ach.id);
              return (
                <div key={ach.id} className={cn('flex items-center gap-2 p-2 rounded-md text-xs', unlocked ? 'bg-primary/5' : 'opacity-40 grayscale')}>
                  <span className="text-lg">{ach.icon}</span>
                  <div><div className="font-medium">{ach.title}</div><div className="text-[10px] text-muted-foreground">{ach.desc}</div></div>
                  {unlocked && <CheckCircle2 size={12} className="text-green-500 ml-auto shrink-0" />}
                </div>
              );
            })}
          </div>
        )}

        <Suspense fallback={<PanelFallback />}>
          {sidebarSection === 'daily' && <DailyChallenges />}
          {sidebarSection === 'cheatsheets' && <CheatSheets />}
          {sidebarSection === 'videos' && <VideoTutorials />}
          {sidebarSection === 'faq' && <Faq />}
          {sidebarSection === 'glossary' && <Glossary />}
          {sidebarSection === 'wizard' && <TroubleshootingWizard />}
          {sidebarSection === 'path' && <LearningPathWizard />}
          {sidebarSection === 'templates' && <ProjectTemplates />}
          {sidebarSection === 'sandbox' && <InteractiveSandbox />}
          {sidebarSection === 'certificate' && <PdfExport />}
          {sidebarSection === 'practice' && <PracticalLab />}
          {sidebarSection === 'settings' && <Settings />}
        </Suspense>
      </div>

      <div className="p-4 border-t border-border/70 bg-background/30">
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
            <div className="h-full progress-gradient rounded-full transition-all duration-500"
              style={{ width: `${(() => { let total=0,completed=0; for(const m of modules) for(const l of m.lessons) { total++; if(isLessonCompleted(m.id,l.id)) completed++; } return total>0?Math.round((completed/total)*100):0; })()}%` }} />
          </div>
          <span className="text-[10px] text-muted-foreground">
            {(() => { let completed=0,total=0; for(const m of modules) for(const l of m.lessons) { total++; if(isLessonCompleted(m.id,l.id)) completed++; } return `${completed}/${total}`; })()}
          </span>
        </div>
      </div>
    </aside>
  );
}
