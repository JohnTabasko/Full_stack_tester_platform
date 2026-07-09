import React, { useEffect, useState } from 'react';
import { Trophy, X } from 'lucide-react';

interface AchievementPopupProps {
  title: string;
  icon: string;
  onClose: () => void;
}

export function AchievementPopup({ title, icon, onClose }: AchievementPopupProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`}
    >
      <div className="bg-card border border-border rounded-lg shadow-xl p-4 max-w-sm animate-slide-up">
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-2xl shrink-0">
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-primary mb-0.5">🏆 Osiągnięcie odblokowane!</p>
            <p className="text-sm font-semibold">{title}</p>
          </div>
          <button
            onClick={() => {
              setVisible(false);
              setTimeout(onClose, 300);
            }}
            className="p-1 rounded hover:bg-accent transition-colors text-muted-foreground shrink-0"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}