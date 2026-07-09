import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useAppStore } from '@stores/appStore';
import { allModules } from '@content/modules';
import { Download, Printer, FileText, Award, BookOpen, Code2, Shield, CheckCircle2, Lock, FlaskConical } from 'lucide-react';
import { cn } from '@lib/utils';
import { REQUIRED_PRACTICAL_TASK_IDS } from './PracticalLab';

type ExportType = 'certificate' | 'cheatsheet' | 'notes' | 'progress';

export function PdfExport() {
  const { progress, userStats } = useAppStore();
  const [exportType, setExportType] = useState<ExportType>('certificate');
  const [userName, setUserName] = useState('');
  const [examStatus, setExamStatus] = useState<{
    passed: boolean;
    requiredCount: number;
    completedCount: number;
    missingTaskIds: string[];
    percentage: number;
    updatedAt: string | null;
  } | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const stats = useMemo(() => {
    let completed = 0;
    let total = 0;
    for (const mod of allModules) {
      for (const lesson of mod.lessons) {
        total++;
        if (progress[`${mod.id}-${lesson.id}`]?.completed) completed++;
      }
    }
    return { completed, total, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 };
  }, [progress]);

  useEffect(() => {
    async function loadExamStatus() {
      try {
        const status = await window.electronAPI?.getExamStatus(REQUIRED_PRACTICAL_TASK_IDS);
        if (status) {
          setExamStatus(status);
        }
      } catch (error) {
        console.error('Failed to load practical exam status:', error);
        setExamStatus({
          passed: false,
          requiredCount: REQUIRED_PRACTICAL_TASK_IDS.length,
          completedCount: 0,
          missingTaskIds: REQUIRED_PRACTICAL_TASK_IDS,
          percentage: 0,
          updatedAt: null,
        });
      }
    }
    loadExamStatus();
  }, []);

  const certificateUnlocked = examStatus?.passed === true;

  const handlePrint = () => {
    if (exportType === 'certificate' && !certificateUnlocked) return;
    window.print();
  };

  const handleDownloadPDF = () => {
    if (exportType === 'certificate' && !certificateUnlocked) return;
    // Use browser print-to-PDF functionality
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write('<html><head><title>Export</title><style>');
    // Copy all styles
    const styles = document.querySelectorAll('style, link[rel="stylesheet"]');
    styles.forEach(s => printWindow!.document.write(s.outerHTML));
    printWindow.document.write('<style>');
    printWindow.document.write(`
      @page { size: A4; margin: 0; }
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      @media print {
        .no-print { display: none !important; }
      }
    `);
    printWindow.document.write('</style></head><body>');

    if (printRef.current) {
      printWindow.document.write(printRef.current.innerHTML);
    }

    printWindow.document.write('</body></html>');
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  };

  const certificateContent = (
    <div className="min-h-[297mm] w-[210mm] mx-auto bg-white text-black p-12 flex flex-col items-center justify-between" style={{ fontFamily: 'Georgia, serif' }}>
      {/* Top border */}
      <div className="w-full text-center">
        <div className="text-6xl mb-2">\ud83c\udfad</div>
        <div className="text-sm tracking-[0.3em] uppercase text-gray-500">Certyfikat ukonczenia</div>
      </div>

      {/* Title */}
      <div className="text-center">
        <div className="text-4xl font-bold mb-2">Playwright 1.60</div>
        <div className="text-xl text-gray-600">Profesjonalista testowania full stack</div>
        <div className="w-24 h-0.5 bg-gray-300 mx-auto my-4" />
        <div className="text-sm text-gray-500">Niniejszym zaswiadcza sie, ze</div>
        <div className="text-3xl font-bold my-3 border-b-2 border-gray-300 pb-1 inline-block min-w-[200px]">
          {userName || '______________________'}
        </div>
        <div className="text-sm text-gray-500 mt-2">ukonczyl(a) kurs obejmujacy {allModules.length} modulow, {stats.total} lekcji</div>
        <div className="text-sm text-gray-500">z zakresu automatyzacji testow Playwright</div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-6 w-full max-w-lg">
        {[
          { label: 'Moduly', value: String(allModules.length) },
          { label: 'Lekcje', value: String(stats.total) },
          { label: 'Ukonczono', value: stats.percentage + '%' },
          { label: 'Godzin', value: String(userStats?.totalTimeSpent ? Math.round(userStats.totalTimeSpent / 3600) : '-') },
        ].map(s => (
          <div key={s.label} className="text-center">
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-[10px] text-gray-500 uppercase mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Skills */}
      <div className="text-center max-w-md">
        <div className="text-xs text-gray-500 mb-2">ZAKRES UMIEJETNOSCI</div>
        <div className="flex flex-wrap justify-center gap-1.5">
          {[
            'Runner testów Playwright', 'Wzorzec obiektu strony', 'Testowanie API (REST/GraphQL)',
            'CI/CD (GitHub Actions)', 'Testy wydajnościowe', 'Bezpieczeństwo & OWASP',
            'Docker & Testcontainers', 'Testy kontraktowe (Pact)', 'Testowanie komponentów',
            'Monitoring (Grafana)', 'Dostępność WCAG', 'SQL i testowanie baz danych',
            'Testowanie mobilne', 'Testowanie wspierane przez SI', 'Egzamin praktyczny',
          ].map(skill => (
            <span key={skill} className="text-[10px] px-2 py-1 bg-gray-100 rounded">{skill}</span>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="w-full flex justify-between items-end text-xs text-gray-500">
        <div className="text-center">
          <div className="w-32 h-0.5 bg-gray-300 mb-1" />
          <div>Data</div>
        </div>
        <div className="text-center">
          <div className="text-lg mb-1">\ud83c\udfad</div>
          <div>Arena.ai Learning Platform</div>
        </div>
        <div className="text-center">
          <div className="w-32 h-0.5 bg-gray-300 mb-1" />
          <div>Podpis</div>
        </div>
      </div>
    </div>
  );


  const lockedCertificateContent = (
    <div className="min-h-[297mm] w-[210mm] mx-auto bg-white text-black p-12 flex flex-col items-center justify-center" style={{ fontFamily: 'Arial, sans-serif' }}>
      <div className="text-center max-w-xl">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-6">
          <Lock size={42} className="text-gray-500" />
        </div>
        <h1 className="text-3xl font-bold mb-3">Certyfikat zablokowany</h1>
        <p className="text-gray-600 mb-6">
          Certyfikat Profesjonalista testowania full stack jest dostępny dopiero po zaliczeniu praktycznego egzaminu w sekcji <strong>Praktyka</strong>.
        </p>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-lg bg-gray-50 border">
            <div className="text-2xl font-bold">{examStatus?.percentage ?? 0}%</div>
            <div className="text-xs text-gray-500 uppercase">Egzamin</div>
          </div>
          <div className="p-4 rounded-lg bg-gray-50 border">
            <div className="text-2xl font-bold">{examStatus?.completedCount ?? 0}</div>
            <div className="text-xs text-gray-500 uppercase">Zaliczone</div>
          </div>
          <div className="p-4 rounded-lg bg-gray-50 border">
            <div className="text-2xl font-bold">{examStatus?.requiredCount ?? REQUIRED_PRACTICAL_TASK_IDS.length}</div>
            <div className="text-xs text-gray-500 uppercase">Wymagane</div>
          </div>
        </div>
        <div className="text-sm text-gray-600 text-left bg-gray-50 border rounded-lg p-4">
          <div className="font-semibold mb-2 flex items-center gap-2"><FlaskConical size={16} /> Wymagane zadania praktyczne:</div>
          <ul className="list-disc ml-5 space-y-1">
            <li>E2E interfejsu użytkownika z diagnostyką</li>
            <li>API contract + scenariusz negatywny</li>
            <li>Baza danych integrity check</li>
            <li>CI/CD quality gate</li>
            <li>Obserwowalność z correlation ID</li>
            <li>Bezpieczeństwo IDOR / multi-tenant isolation</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const cheatsheetContent = (
    <div className="min-h-[297mm] w-[210mm] mx-auto bg-white text-black p-8" style={{ fontFamily: 'monospace', fontSize: '10px' }}>
      <h1 className="text-base font-bold mb-3 text-center border-b-2 border-black pb-2" style={{ fontFamily: 'sans-serif' }}>
        \ud83d\udcdd Playwright 1.60 — Sciaga Szybkiego Uzycia
      </h1>

      {/* Basic Commands */}
      <div className="mb-4">
        <h2 className="text-xs font-bold bg-gray-200 px-1 mb-1" style={{ fontFamily: 'sans-serif' }}>PODSTAWOWE KOMENDY</h2>
        <div className="grid grid-cols-2 gap-1 text-[9px]">
          <div>npx playwright test</div><div>Uruchom wszystkie testy</div>
          <div>npx playwright test --headed</div><div>Tryb headed</div>
          <div>npx playwright test --ui</div><div>tryb UI</div>
          <div>npx playwright test --debug</div><div>Debug mode</div>
          <div>npx playwright test --grep @smoke</div><div>Filtruj po tagu</div>
          <div>npx playwright test --repeat-each=10</div><div>Wykrywanie flaky</div>
          <div>npx playwright test --shard=1/4</div><div>Sharding</div>
          <div>npx playwright show-report</div><div>Otworz report</div>
        </div>
      </div>

      {/* Selectors */}
      <div className="mb-4">
        <h2 className="text-xs font-bold bg-gray-200 px-1 mb-1" style={{ fontFamily: 'sans-serif' }}>SELEKTORY (HIERARCHIA)</h2>
        <div className="text-[9px] leading-relaxed">
          <div>page.locator('[data-testid="submit"]')  &larr; NAJLEPSZY</div>
          <div>page.getByRole('button', {'{'} name: 'Submit' {'}'})</div>
          <div>page.getByLabel('Email')</div>
          <div>page.getByPlaceholder('Enter email')</div>
          <div>page.getByText('Click here')</div>
          <div>page.locator('.css-class')</div>
          <div>page.locator('//div[@id="x"]')  &larr; UNIKAJ (najwolniejszy)</div>
        </div>
      </div>

      {/* Actions */}
      <div className="mb-4">
        <h2 className="text-xs font-bold bg-gray-200 px-1 mb-1" style={{ fontFamily: 'sans-serif' }}>AKCJE</h2>
        <div className="grid grid-cols-2 gap-0.5 text-[9px]">
          <div>.click() / .dblclick()</div><div>Klikniecie</div>
          <div>.fill(value) / .clear()</div><div>Input</div>
          <div>.press('Enter')</div><div>Klawisz</div>
          <div>.hover() / .focus()</div><div>Hover/Focus</div>
          <div>.selectOption('value')</div><div>Select</div>
          <div>.setInputFiles(...)</div><div>Upload pliku</div>
          <div>.check() / .uncheck()</div><div>Checkbox</div>
          <div>.dragTo(target)</div><div>Drag &amp; drop</div>
        </div>
      </div>

      {/* Assertions */}
      <div className="mb-4">
        <h2 className="text-xs font-bold bg-gray-200 px-1 mb-1" style={{ fontFamily: 'sans-serif' }}>ASERCJE</h2>
        <div className="text-[9px] leading-relaxed">
          <div>await expect(page).toHaveTitle(/text/)</div>
          <div>await expect(page).toHaveURL(/path/)</div>
          <div>await expect(locator).toBeVisible()</div>
          <div>await expect(locator).toBeHidden()</div>
          <div>await expect(locator).toBeEnabled() / .toBeDisabled()</div>
          <div>await expect(locator).toHaveText('text')</div>
          <div>await expect(locator).toContainText('partial')</div>
          <div>await expect(locator).toHaveValue('val')</div>
          <div>await expect(locator).toHaveCount(5)</div>
          <div>await expect(page).toHaveScreenshot()</div>
          <div>expect.soft(locator).toBeVisible() &larr; Nie przerywa testu</div>
        </div>
      </div>

      {/* Config */}
      <div className="mb-4">
        <h2 className="text-xs font-bold bg-gray-200 px-1 mb-1" style={{ fontFamily: 'sans-serif' }}>KONFIGURACJA (najwazniejsze)</h2>
        <div className="text-[9px] leading-relaxed">
          <div>retries: process.env.CI ? 3 : 0</div>
          <div>workers: process.env.CI ? 3 : undefined</div>
          <div>trace: 'retain-on-failure'  &larr; NIE 'on'!</div>
          <div>screenshot: 'only-on-failure'</div>
          <div>fullyParallel: true</div>
          <div>use: {'{'} baseURL: 'http://localhost:3000' {'}'}</div>
        </div>
      </div>

      {/* Testowanie API */}
      <div>
        <h2 className="text-xs font-bold bg-gray-200 px-1 mb-1" style={{ fontFamily: 'sans-serif' }}>API TESTING</h2>
        <div className="text-[9px] leading-relaxed">
          <div>const resp = await request.get('/api/users')</div>
          <div>expect(resp.status()).toBe(200)</div>
          <div>const data = await resp.json()</div>
          <div>await page.route('**/api/**', r =&gt; r.fulfill({'{'} status: 200 {'}'}))</div>
        </div>
      </div>

      <div className="text-center mt-4 text-[8px] text-gray-400" style={{ fontFamily: 'sans-serif' }}>
        Wygenerowane przez Arena.ai Playwright Learning Platform | Playwright 1.60
      </div>
    </div>
  );

  const notesExportContent = (
    <div className="min-h-[297mm] w-[210mm] mx-auto bg-white text-black p-8" style={{ fontFamily: 'sans-serif' }}>
      <h1 className="text-xl font-bold mb-4 text-center border-b-2 border-black pb-2">\ud83d\udcdd Moje Notatki</h1>
      <p className="text-xs text-gray-500 text-center mb-4">Export notatek z Playwright Learning Platform</p>
      <div className="text-xs text-gray-400 text-center italic">
        W aplikacji otworz panel notatek podczas lekcji i uzyj Export z poziomu tej strony
      </div>
    </div>
  );

  const progressExportContent = (
    <div className="min-h-[297mm] w-[210mm] mx-auto bg-white text-black p-8" style={{ fontFamily: 'sans-serif' }}>
      <h1 className="text-xl font-bold mb-4 text-center border-b-2 border-black pb-2">\ud83d\udcca Raport Postepu</h1>
      <div className="text-sm text-center mb-4">
        Uzytkownik: <strong>{userName || 'Nieznany'}</strong> | Data: {new Date().toLocaleDateString('pl-PL')}
      </div>
      <div className="text-center mb-4">
        <div className="text-4xl font-bold text-green-600">{stats.percentage}%</div>
        <div className="text-xs text-gray-500">{stats.completed}/{stats.total} lekcji ukonczonych</div>
      </div>
      <table className="w-full text-xs border-collapse mb-4">
        <thead>
          <tr className="bg-gray-100">
            <th className="text-left p-1 border">Modul</th>
            <th className="text-center p-1 border">Postep</th>
            <th className="text-center p-1 border">Status</th>
          </tr>
        </thead>
        <tbody>
          {allModules.map(mod => {
            let modCompleted = 0;
            for (const lesson of mod.lessons) {
              if (progress[`${mod.id}-${lesson.id}`]?.completed) modCompleted++;
            }
            const pct = mod.lessons.length > 0 ? Math.round((modCompleted / mod.lessons.length) * 100) : 0;
            return (
              <tr key={mod.id}>
                <td className="p-1 border">{mod.icon} {mod.title}</td>
                <td className="text-center p-1 border">{modCompleted}/{mod.lessons.length}</td>
                <td className="text-center p-1 border">
                  {pct === 100 ? '\u2705' : pct > 0 ? '\ud83d\udd36' : '\u26aa'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="text-xs text-gray-400 text-center mt-4">
        Wygenerowane przez Arena.ai Playwright Learning Platform
      </div>
    </div>
  );

  const getPreview = () => {
    switch (exportType) {
      case 'certificate': return certificateUnlocked ? certificateContent : lockedCertificateContent;
      case 'cheatsheet': return cheatsheetContent;
      case 'notes': return notesExportContent;
      case 'progress': return progressExportContent;
    }
  };

  const exportTypes: { id: ExportType; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: 'certificate', label: 'Certyfikat', icon: <Award size={16} />, desc: 'Certyfikat ukonczenia kursu' },
    { id: 'cheatsheet', label: 'Sciaga', icon: <FileText size={16} />, desc: 'Sciaga szybkiego uzycia Playwright' },
    { id: 'progress', label: 'Raport postepu', icon: <BookOpen size={16} />, desc: 'Szczegolowy raport postepu' },
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-card shrink-0 no-print">
        <div className="flex items-center gap-1">
          {exportTypes.map(type => (
            <button key={type.id} onClick={() => setExportType(type.id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                exportType === type.id ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent/50'
              )}>
              {type.icon}
              {type.label}
            </button>
          ))}
        </div>
        <div className="flex-1" />
        {(exportType === 'certificate' || exportType === 'progress') && (
          <input
            value={userName}
            onChange={e => setUserName(e.target.value)}
            placeholder="Twoje imie i nazwisko..."
            className="px-2 py-1 rounded border border-border bg-background text-xs w-48"
          />
        )}
        <button onClick={handlePrint}
          disabled={exportType === 'certificate' && !certificateUnlocked}
          className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-secondary text-xs font-medium hover:bg-accent', exportType === 'certificate' && !certificateUnlocked && 'opacity-50 cursor-not-allowed')}>
          <Printer size={14} /> Drukuj
        </button>
        <button onClick={handleDownloadPDF}
          disabled={exportType === 'certificate' && !certificateUnlocked}
          className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20', exportType === 'certificate' && !certificateUnlocked && 'opacity-50 cursor-not-allowed')}>
          <Download size={14} /> PDF
        </button>
      </div>

      {/* Description */}
      <div className="px-4 py-2 border-b border-border bg-card/30 no-print shrink-0">
        <p className="text-xs text-muted-foreground">
          {exportTypes.find(t => t.id === exportType)?.desc}.
          {exportType === 'certificate' && !certificateUnlocked
            ? ` Certyfikat jest zablokowany do czasu zaliczenia praktyki: ${examStatus?.completedCount ?? 0}/${examStatus?.requiredCount ?? REQUIRED_PRACTICAL_TASK_IDS.length}.`
            : ' Kliknij PDF aby pobrac, lub Drukuj aby wydrukowac.'}
        </p>
      </div>

      {/* Preview */}
      <div className="flex-1 overflow-auto bg-gray-200 dark:bg-gray-800 p-4">
        <div ref={printRef} className="shadow-2xl mx-auto">
          {getPreview()}
        </div>
      </div>
    </div>
  );
}
