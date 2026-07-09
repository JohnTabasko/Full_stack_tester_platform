import React, { useState, useCallback, useEffect } from 'react';
import { useAppStore } from '@stores/appStore';
import { cn } from '@lib/utils';
import type { QuizQuestion } from '../types';
import { CheckCircle2, XCircle, AlertTriangle, Trophy, RefreshCw, ArrowRight } from 'lucide-react';

interface QuizViewProps {
  moduleId: number;
  lessonId: string;
  questions: QuizQuestion[];
}

export function QuizView({ moduleId, lessonId, questions }: QuizViewProps) {
  const { addAchievement, setUserStats } = useAppStore();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showExplanations, setShowExplanations] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);

  useEffect(() => {
    setAnswers({});
    setSubmitted(false);
    setShowExplanations(false);
    setQuizStarted(false);
  }, [moduleId, lessonId]);

  const calculateScore = useCallback(() => {
    let correct = 0;
    for (const q of questions) {
      if (answers[q.id] === q.correctAnswer) correct++;
    }
    return {
      score: Math.round((correct / questions.length) * 100),
      correct,
      total: questions.length,
    };
  }, [answers, questions]);

  const handleSubmit = async () => {
    // Check if all questions answered
    const unanswered = questions.filter((q) => answers[q.id] === undefined);
    if (unanswered.length > 0 && !submitted) {
      return;
    }

    if (!submitted) {
      const result = calculateScore();
      setSubmitted(true);
      setShowExplanations(true);

      // Save to Baza danych
      await window.electronAPI?.saveQuizResult({
        moduleId,
        lessonId,
        score: result.score,
        totalQuestions: result.total,
        correctAnswers: result.correct,
        answers: questions.map((q) => answers[q.id] ?? -1),
      });
      const updatedStats = await window.electronAPI?.getUserStats();
      if (updatedStats) {
        setUserStats(updatedStats);
      }

      // Check achievements
      if (result.score === 100) {
        addAchievement('quiz-master');
      }
    } else {
      // Reset
      setAnswers({});
      setSubmitted(false);
      setShowExplanations(false);
    }
  };

  if (!quizStarted) {
    return (
      <div className="h-full overflow-y-auto p-6 animate-fade-in flex items-center justify-center">
        <div className="max-w-md text-center">
          <div className="text-5xl mb-4">📝</div>
          <h2 className="text-xl font-bold mb-2">Quiz: Sprawdź swoją wiedzę</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Ten quiz zawiera {questions.length} pytań sprawdzających Twoją wiedzę z tej lekcji.
          </p>
          <div className="text-xs text-muted-foreground mb-6 space-y-1">
            <p>• Odpowiedz na wszystkie pytania</p>
            <p>• Zobaczysz wynik po zakończeniu</p>
            <p>• Możesz powtórzyć quiz wielokrotnie</p>
          </div>
          <button
            onClick={() => setQuizStarted(true)}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Rozpocznij quiz
          </button>
        </div>
      </div>
    );
  }

  const result = submitted ? calculateScore() : null;
  const allAnswered = questions.every((q) => answers[q.id] !== undefined);

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6 animate-fade-in">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold">Quiz</h2>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {Object.keys(answers).length}/{questions.length} odpowiedzi
            </span>
            {submitted && result && (
              <span
                className={cn(
                  'text-sm font-bold px-2 py-0.5 rounded',
                  result.score >= 80 ? 'text-green-500 bg-green-500/10' :
                  result.score >= 50 ? 'text-amber-400 bg-amber-400/10' :
                  'text-destructive bg-destructive/10'
                )}
              >
                {result.score}%
              </span>
            )}
          </div>
        </div>

        {submitted && result && (
          <div className={cn(
            'border rounded-lg p-4 mb-6',
            result.score >= 80 ? 'border-green-500/30 bg-green-500/5' :
            result.score >= 50 ? 'border-amber-400/30 bg-amber-400/5' :
            'border-destructive/30 bg-destructive/5'
          )}>
            <div className="flex items-center gap-3">
              {result.score >= 80 ? (
                <Trophy size={24} className="text-green-500" />
              ) : result.score >= 50 ? (
                <AlertTriangle size={24} className="text-amber-400" />
              ) : (
                <XCircle size={24} className="text-destructive" />
              )}
              <div>
                <p className="font-semibold">
                  {result.score >= 80 ? 'Świetnie!' : result.score >= 50 ? 'Nieźle, ale możesz poprawić!' : 'Warto powtórzyć materiał'}
                </p>
                <p className="text-sm text-muted-foreground">
                  Poprawne odpowiedzi: {result.correct}/{result.total} ({result.score}%)
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {questions.map((q, index) => {
            const userAnswer = answers[q.id];
            const isCorrect = submitted && userAnswer === q.correctAnswer;
            const isWrong = submitted && userAnswer !== undefined && userAnswer !== q.correctAnswer;

            return (
              <div
                key={q.id}
                className={cn(
                  'border rounded-2xl p-4 transition-all bg-card/60 shadow-sm',
                  isCorrect && 'border-green-500/30 bg-green-500/5',
                  isWrong && 'border-destructive/30 bg-destructive/5',
                  !submitted && 'border-border hover:border-primary/30'
                )}
              >
                <div className="flex items-start gap-3 mb-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-secondary text-xs font-bold shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <p className="text-sm font-medium flex-1">{q.question}</p>
                  {submitted && isCorrect && <CheckCircle2 size={18} className="text-green-500 shrink-0" />}
                  {submitted && isWrong && <XCircle size={18} className="text-destructive shrink-0" />}
                </div>

                <div className="space-y-2 ml-9">
                  {q.options.map((option, optIndex) => {
                    const isSelected = userAnswer === optIndex;
                    const isCorrectOption = q.correctAnswer === optIndex;

                    return (
                      <button
                        key={optIndex}
                        onClick={() => {
                          if (!submitted) {
                            setAnswers((prev) => ({ ...prev, [q.id]: optIndex }));
                          }
                        }}
                        disabled={submitted}
                        className={cn(
                          'w-full text-left px-3 py-3 rounded-xl text-sm transition-all border border-border/70 bg-background/50',
                          !submitted && 'hover:bg-accent hover:border-primary/30 cursor-pointer hover:translate-x-0.5',
                          isSelected && !submitted && 'bg-primary/10 border border-primary/30',
                          isSelected && isCorrect && submitted && 'bg-green-500/15 border-green-500/60 text-green-600 animate-checkmark',
                          isSelected && isWrong && submitted && 'bg-destructive/15 border-destructive/60 text-destructive',
                          isCorrectOption && submitted && !isSelected && 'bg-green-500/10 border-green-500/40',
                          !isSelected && !isCorrectOption && submitted && 'opacity-50'
                        )}
                      >
                        <span className="font-mono text-xs mr-2 opacity-50">
                          {String.fromCharCode(65 + optIndex)}.
                        </span>
                        {option}
                      </button>
                    );
                  })}
                </div>

                {submitted && showExplanations && q.explanation && (
                  <div className="mt-3 ml-9 text-xs rounded-xl border border-primary/20 bg-primary/5 p-3 text-muted-foreground">
                    <div className="font-semibold text-primary mb-1">Wyjaśnienie</div>
                    {q.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={handleSubmit}
            className={cn(
              'flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-sm transition-all',
              submitted
                ? 'bg-secondary text-foreground hover:bg-secondary/80'
                : allAnswered
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'bg-secondary text-muted-foreground cursor-not-allowed'
            )}
            disabled={!allAnswered && !submitted}
          >
            {submitted ? (
              <>
                <RefreshCw size={16} />
                Spróbuj ponownie
              </>
            ) : (
              <>
                <CheckCircle2 size={16} />
                Sprawdź odpowiedzi
              </>
            )}
          </button>

          {!allAnswered && !submitted && (
            <p className="text-xs text-muted-foreground">
              Odpowiedz na wszystkie pytania aby zakończyć quiz
            </p>
          )}
        </div>
      </div>
    </div>
  );
}