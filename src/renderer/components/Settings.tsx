import React, { useState } from 'react';
import { useAppStore } from '@stores/appStore';
import { Settings as SettingsIcon, Sun, Moon, Type, Download, Upload, Database, Trash2 } from 'lucide-react';

export function Settings() {
  const { theme, setTheme, fontSize, setFontSize } = useAppStore();
  const [message, setMessage] = useState('');

  const handleExport = async () => {
    const result = await window.electronAPI?.exportData();
    setMessage(result?.success ? 'Dane wyeksportowane pomyślnie!' : 'Błąd eksportu');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleImport = async () => {
    const result = await window.electronAPI?.importData();
    setMessage(result?.success ? 'Dane zaimportowane pomyślnie!' : 'Błąd importu');
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="h-full overflow-y-auto p-6 animate-fade-in">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <SettingsIcon size={20} /> Ustawienia
        </h2>

        {/* Wyglad */}
        <section className="mb-8">
          <h3 className="text-sm font-semibold text-muted-foreground mb-4">WYGLĄD</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-card rounded-lg border border-border">
              <div>
                <p className="font-medium">Motyw</p>
                <p className="text-xs text-muted-foreground">Wybierz jasny lub ciemny motyw</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => setTheme('light')} className={`p-2 rounded-md ${theme === 'light' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                  <Sun size={16} />
                </button>
                <button onClick={() => setTheme('dark')} className={`p-2 rounded-md ${theme === 'dark' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                  <Moon size={16} />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-card rounded-lg border border-border">
              <div>
                <p className="font-medium">Rozmiar czcionki</p>
                <p className="text-xs text-muted-foreground">Dostosuj rozmiar tekstu</p>
              </div>
              <div className="flex gap-1">
                {(['small', 'medium', 'large'] as const).map(size => (
                  <button key={size} onClick={() => setFontSize(size)} className={`px-3 py-1 rounded-md text-xs ${fontSize === size ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                    {size === 'small' ? 'Mała' : size === 'medium' ? 'Średnia' : 'Duża'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Dane */}
        <section className="mb-8">
          <h3 className="text-sm font-semibold text-muted-foreground mb-4">DANE</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-card rounded-lg border border-border">
              <div>
                <p className="font-medium">Eksportuj postępy</p>
                <p className="text-xs text-muted-foreground">Zapisz swoje postępy do pliku JSON</p>
              </div>
              <button onClick={handleExport} className="flex items-center gap-2 px-3 py-2 bg-primary/10 text-primary rounded-md text-sm hover:bg-primary/20">
                <Download size={14} /> Eksportuj
              </button>
            </div>
            <div className="flex items-center justify-between p-4 bg-card rounded-lg border border-border">
              <div>
                <p className="font-medium">Importuj postępy</p>
                <p className="text-xs text-muted-foreground">Wczytaj postępy z pliku JSON</p>
              </div>
              <button onClick={handleImport} className="flex items-center gap-2 px-3 py-2 bg-primary/10 text-primary rounded-md text-sm hover:bg-primary/20">
                <Upload size={14} /> Importuj
              </button>
            </div>
          </div>
        </section>

        {message && (
          <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-sm text-green-600">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
