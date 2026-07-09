import React from 'react';
import { useAppStore } from '@stores/appStore';
import { Award, CheckCircle2, ExternalLink, Download } from 'lucide-react';
import { allModules, getTotalLessonsCount } from '@content/modules';

export function Certyfikat() {
  const { progress, userStats } = useAppStore();

  let totalLessons = 0, completedLessons = 0;
  for (const mod of allModules) {
    for (const lesson of mod.lessons) {
      totalLessons++;
      const key = `${mod.id}-${lesson.id}`;
      if (progress[key]?.completed) completedLessons++;
    }
  }
  const overallProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const points = userStats?.points || 0;

  const certLevel = overallProgress >= 90 ? 'Expert' : overallProgress >= 70 ? 'Professional' : overallProgress >= 40 ? 'Foundation' : null;
  const certColor = certLevel === 'Expert' ? 'from-amber-400 to-orange-500' : certLevel === 'Professional' ? 'from-blue-400 to-purple-500' : certLevel === 'Foundation' ? 'from-green-400 to-emerald-500' : 'from-muted to-muted-foreground';

  return (
    <div className="h-full overflow-y-auto p-6 animate-fade-in">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
          <Award size={20} /> Certyfikat ukończenia
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          Twój certyfikat potwierdzający znajomość Playwright
        </p>

        {/* Certificate Card */}
        <div className={`p-8 rounded-xl border-2 bg-gradient-to-br ${certColor} bg-opacity-10 text-center mb-8`}>
          <div className="text-6xl mb-4">🎭</div>
          <h3 className="text-2xl font-bold mb-2">Playwright Learning Platform</h3>
          <p className="text-lg mb-4">Certyfikat ukończenia</p>

          {certLevel ? (
            <>
              <div className={`text-3xl font-black mb-1 bg-gradient-to-r ${certColor} bg-clip-text text-transparent`}>
                {certLevel}
              </div>
              <p className="text-sm mb-4">Poziom certyfikacji</p>
            </>
          ) : (
            <p className="text-muted-foreground mb-4">Kontynuuj naukę aby zdobyć certyfikat</p>
          )}

          <div className="inline-flex items-center gap-2 px-4 py-2 bg-card rounded-full border border-border">
            <span className="font-mono font-bold">{overallProgress}%</span>
            <span className="text-xs text-muted-foreground">ukończono</span>
          </div>
        </div>

        {/* Requirements */}
        <div className="space-y-4 mb-8">
          <h3 className="font-semibold flex items-center gap-2">
            <CheckCircle2 size={16} /> Wymagania certyfikacji
          </h3>
          {[
            { level: 'Foundation', progress: 40, desc: 'Ukończ moduły 1-5. Opanuj podstawy Playwright.' },
            { level: 'Professional', progress: 70, desc: 'Ukończ moduły 1-10. Biegłość w zaawansowanych technikach.' },
            { level: 'Expert', progress: 90, desc: 'Ukończ wszystkie 15 modułów. Capstone project. Mistrzostwo.' },
          ].map(cert => (
            <div key={cert.level} className={`flex items-center gap-3 p-3 rounded-lg border ${overallProgress >= cert.progress ? 'border-green-500/30 bg-green-500/5' : 'border-border bg-card'}`}>
              {overallProgress >= cert.progress ? <CheckCircle2 size={18} className="text-green-500" /> : <div className="w-[18px] h-[18px] rounded-full border-2 border-muted-foreground/30" />}
              <div>
                <p className="text-sm font-medium">{cert.level} {overallProgress >= cert.progress && '✅'}</p>
                <p className="text-xs text-muted-foreground">{cert.desc}</p>
              </div>
              <span className="ml-auto text-xs text-muted-foreground">{cert.progress}%</span>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-card rounded-lg border border-border text-center">
            <p className="text-2xl font-bold">{completedLessons}</p>
            <p className="text-[10px] text-muted-foreground">Lekcji ukończono</p>
          </div>
          <div className="p-3 bg-card rounded-lg border border-border text-center">
            <p className="text-2xl font-bold">{totalLessons}</p>
            <p className="text-[10px] text-muted-foreground">Lekcji łącznie</p>
          </div>
          <div className="p-3 bg-card rounded-lg border border-border text-center">
            <p className="text-2xl font-bold text-amber-400">{points}</p>
            <p className="text-[10px] text-muted-foreground">Punktów</p>
          </div>
        </div>
      </div>
    </div>
  );
}
