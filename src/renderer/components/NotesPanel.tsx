import React, { useState, useEffect, useCallback } from 'react';
import { Save, StickyNote, Trash2 } from 'lucide-react';
import { cn } from '@lib/utils';

interface NotesPanelProps {
  moduleId: number;
  lessonId: string;
}

export function NotesPanel({ moduleId, lessonId }: NotesPanelProps) {
  const [content, setContent] = useState('');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const note = await window.electronAPI?.getNote(moduleId, lessonId);
        if (note) {
          setContent(note.content);
        } else {
          setContent('');
        }
      } catch (err) {
        console.error('Failed to load note:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [moduleId, lessonId]);

  const handleSave = useCallback(async () => {
    try {
      await window.electronAPI?.saveNote(moduleId, lessonId, content);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Failed to save note:', err);
    }
  }, [moduleId, lessonId, content]);

  const handleClear = useCallback(async () => {
    setContent('');
    await window.electronAPI?.saveNote(moduleId, lessonId, '');
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [moduleId, lessonId]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-xs text-muted-foreground animate-pulse">Ładowanie...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <StickyNote size={14} className="text-primary" />
          <span className="text-xs font-medium">Notatki</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleClear}
            className="p-1 rounded hover:bg-accent transition-colors text-muted-foreground"
            title="Wyczyść"
          >
            <Trash2 size={13} />
          </button>
          <button
            onClick={handleSave}
            className={cn(
              'flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-all',
              saved
                ? 'bg-green-500/10 text-green-500'
                : 'bg-primary/10 text-primary hover:bg-primary/20'
            )}
          >
            <Save size={13} />
            {saved ? 'Zapisano!' : 'Zapisz'}
          </button>
        </div>
      </div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Twoje osobiste notatki do tej lekcji... 
        
✍️ Zapisz ważne informacje
💡 Dodaj własne pomysły
🔗 Wklej przydatne linki
⚠️ Zanotuj częste błędy"
        className="flex-1 p-4 bg-transparent resize-none text-sm text-muted-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:ring-0"
      />
    </div>
  );
}