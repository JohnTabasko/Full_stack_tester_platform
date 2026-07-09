import React, { useState } from 'react';
import { useAppStore } from '@stores/appStore';
import { Target, CheckCircle2, Flame, Trophy, Zap } from 'lucide-react';

const CHALLENGES = [
  { id: 'd1', title: '3 lekcje dzisiaj', desc: 'Ukończ 3 dowolne lekcje', target: 3, icon: '📚', points: 50 },
  { id: 'd2', title: 'Quiz mistrz', desc: 'Zdobądź 100% w dowolnym quizie', target: 1, icon: '🧠', points: 30 },
  { id: 'd3', title: 'Odkrywca placu zabaw', desc: 'Uruchom kod na placu zabaw 3 razy', target: 3, icon: '🎮', points: 20 },
  { id: 'd4', title: 'Notatnik', desc: 'Dodaj notatkę do 2 lekcji', target: 2, icon: '📝', points: 20 },
  { id: 'd5', title: 'Zakładki', desc: 'Dodaj 3 zakładki do ulubionych lekcji', target: 3, icon: '🔖', points: 25 },
  { id: 'd6', title: 'Codzienna passa', desc: 'Ucz się 5 dni z rzędu', target: 5, icon: '🔥', points: 100 },
];

export function DailyChallenges() {
  const { userStats } = useAppStore();
  const [progress, setProgress] = useState<Record<string, number>>({});

  const streak = userStats?.streak || 0;
  const points = userStats?.points || 0;

  return (
    <div className="h-full overflow-y-auto p-6 animate-fade-in">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
          <Target size={20} /> Wyzwania dzienne
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          Codzienne wyzwania pomagające w systematycznej nauce
        </p>

        {/* Streak */}
        <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-xl border border-amber-500/20 mb-6">
          <div className="text-4xl">🔥</div>
          <div>
            <p className="font-bold text-lg">{streak} dni</p>
            <p className="text-sm text-muted-foreground">Twoja passa nauki</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-2xl font-bold text-amber-400">{points}</p>
            <p className="text-xs text-muted-foreground">punktów</p>
          </div>
        </div>

        {/* Challenges */}
        <div className="space-y-3">
          {CHALLENGES.map(challenge => {
            const p = progress[challenge.id] || 0;
            const done = p >= challenge.target;
            return (
              <div key={challenge.id} className={`p-4 rounded-xl border transition-all ${done ? 'border-green-500/30 bg-green-500/5' : 'border-border bg-card hover:border-primary/30'}`}>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{challenge.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{challenge.title}</p>
                      {done && <CheckCircle2 size={14} className="text-green-500" />}
                    </div>
                    <p className="text-xs text-muted-foreground">{challenge.desc}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${Math.min(100, (p / challenge.target) * 100)}%` }} />
                      </div>
                      <span className="text-[10px] text-muted-foreground">{p}/{challenge.target}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-medium text-amber-400">+{challenge.points} pkt</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-xs text-muted-foreground text-center mt-6">
          Wyzwania resetują się codziennie. Punkty są przyznawane automatycznie po ukończeniu.
        </p>
      </div>
    </div>
  );
}
