'use client';

import { use, useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getLesson, 
  updateLesson, 
  toggleBookmark,
  generateQuiz,
  generateFlashcards,
  generatePracticeTasks,
  summarizeLesson,
  generateCodingChallenge
} from '@/lib/api';
import { 
  Bookmark, 
  Sparkles, 
  BookOpen, 
  HelpCircle, 
  CheckCircle,
  FileText,
  HelpCircle as FlashcardIcon,
  Play,
  RotateCcw,
  Clock,
  ExternalLink,
  Code as CodeIcon,
  Trash2,
  X
} from 'lucide-react';
import Link from 'next/link';

export default function LessonDetails({ params: paramsPromise }: { params: Promise<{ id: string; chapterId: string; lessonId: string }> }) {
  const params = use(paramsPromise);
  const { id: subjectId, chapterId, lessonId } = params;
  const queryClient = useQueryClient();

  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // AI Content Modals State
  const [activeModal, setActiveModal] = useState<'quiz' | 'flashcards' | 'tasks' | 'challenges' | null>(null);
  const [aiData, setAiData] = useState<any>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});

  // Query
  const { data: lesson, isLoading } = useQuery({
    queryKey: ['lesson', lessonId],
    queryFn: () => getLesson(lessonId),
  });

  // Sync state
  useEffect(() => {
    if (lesson) {
      setNotes(lesson.notes || '');
    }
  }, [lesson]);

  // Mutations
  const updateMutation = useMutation({
    mutationFn: (data: any) => updateLesson(lessonId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson', lessonId] });
      queryClient.invalidateQueries({ queryKey: ['chapters', subjectId] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      setIsSaving(false);
      setIsDirty(false);
    },
    onError: () => {
      setIsSaving(false);
      alert('Unable to save notes. Please try again.');
    },
  });

  const handleSaveNotes = async () => {
    if (!isDirty) return;
    setIsSaving(true);
    updateMutation.mutate({ notes });
  };

  const handleStatusChange = (status: string) => {
    updateMutation.mutate({ status });
  };

  const handleToggleBookmark = async () => {
    try {
      await toggleBookmark(lessonId);
      queryClient.invalidateQueries({ queryKey: ['lesson', lessonId] });
    } catch (err) {
      console.error(err);
    }
  };

  // AI Generators
  const triggerAI = async (type: 'quiz' | 'flashcards' | 'tasks' | 'challenges' | 'summary') => {
    setLoadingAI(true);
    setAiData(null);
    setQuizScore(null);
    setQuizAnswers({});
    
    if (type !== 'summary') {
      setActiveModal(type);
    }
    
    try {
      let data;
      if (type === 'quiz') data = await generateQuiz(lessonId);
      else if (type === 'flashcards') data = await generateFlashcards(lessonId);
      else if (type === 'tasks') data = await generatePracticeTasks(lessonId);
      else if (type === 'challenges') data = await generateCodingChallenge(lessonId);
      else if (type === 'summary') {
        data = await summarizeLesson(lessonId);
        queryClient.invalidateQueries({ queryKey: ['lesson', lessonId] });
        alert('Lesson summarized and saved to summary section!');
      }
      setAiData(data);
    } catch (err) {
      console.error(err);
      alert('AI Generation failed. Make sure your OpenAI API key is set in backend .env.');
      setActiveModal(null);
    } finally {
      setLoadingAI(false);
    }
  };

  const submitQuiz = () => {
    if (!aiData || !aiData.questions) return;
    let score = 0;
    aiData.questions.forEach((q: any, idx: number) => {
      if (quizAnswers[idx] === q.correctAnswer) {
        score++;
      }
    });
    setQuizScore(score);
    // Log execution for taking quiz
    updateMutation.mutate({ 
      masteryScore: Math.round((score / aiData.questions.length) * 100) 
    });
  };

  if (isLoading || !lesson) return <div className="text-center py-12">Loading lesson content...</div>;

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12 relative">
      {/* Navigation breadcrumbs */}
      <div className="flex items-center justify-between">
        <Link href={`/subjects/${subjectId}`} className="text-xs text-muted-foreground hover:text-foreground font-semibold flex items-center gap-1.5 transition">
          <span>Back to Subject Space</span>
        </Link>
        <button
          onClick={handleToggleBookmark}
          className={`p-2 rounded-xl border transition ${
            lesson.isBookmarked 
              ? 'bg-blue-500/15 border-blue-500/30 text-blue-500 hover:bg-blue-500/25' 
              : 'border-border/60 bg-card hover:bg-accent/40 text-muted-foreground hover:text-foreground'
          }`}
          title={lesson.isBookmarked ? 'Bookmarked' : 'Add bookmark'}
        >
          <Bookmark className={`w-4.5 h-4.5 ${lesson.isBookmarked ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Editor + Summary Space */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div className="glass-card rounded-2xl p-6 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary uppercase font-mono tracking-wider">{lesson.difficulty}</span>
              <span className="text-[10px] font-semibold text-muted-foreground">Lesson node</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">{lesson.title}</h2>
          </div>

          {/* Notes Area */}
          <div className="glass-card rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <span className="text-xs font-bold text-foreground uppercase tracking-widest flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span>Study Notes</span>
              </span>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono text-muted-foreground">
                  {isSaving ? 'Saving...' : isDirty ? 'Unsaved changes' : 'Saved'}
                </span>
                <button
                  onClick={handleSaveNotes}
                  disabled={!isDirty || isSaving}
                  className="px-3 py-1.5 text-[10px] font-semibold rounded-xl border border-border/60 bg-card text-foreground hover:bg-accent/40 transition disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Save Notes
                </button>
              </div>
            </div>
            <textarea
              className="w-full h-[380px] bg-transparent border-0 p-4 rounded-xl focus:outline-none focus:ring-0 text-sm leading-relaxed text-foreground placeholder-muted-foreground resize-none"
              placeholder="Start drafting your study notes here."
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                setIsDirty(true);
              }}
            />
          </div>

          {/* AI generated summary if exists */}
          {lesson.summary && (
            <div className="p-6 border border-primary/20 bg-primary/5 rounded-2xl space-y-3">
              <h4 className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles className="w-4.5 h-4.5" />
                <span>AI Lesson Summary</span>
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">{lesson.summary}</p>
            </div>
          )}
        </div>

        {/* Sidebar Controls */}
        <div className="space-y-6">
          {/* Status Select Card */}
          <div className="glass-card rounded-2xl p-6 space-y-4">
            <span className="text-xs font-bold text-foreground uppercase tracking-widest block">Study Execution Status</span>
            
            <div className="grid grid-cols-2 gap-2">
              {['pending', 'started', 'in-progress', 'revision', 'completed'].map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  className={`px-3 py-2.5 rounded-xl border text-[11px] font-bold capitalize transition duration-200 ${
                    lesson.status === status
                      ? 'bg-primary border-primary text-primary-foreground shadow-md shadow-primary/10'
                      : 'border-border/60 bg-card hover:bg-accent/40 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            <div className="flex justify-between items-center text-[10px] font-semibold text-muted-foreground font-mono border-t border-border/40 pt-3">
              <span>Next Spaced Review:</span>
              <span>{lesson.nextReviewAt ? new Date(lesson.nextReviewAt).toLocaleDateString() : 'Not Scheduled'}</span>
            </div>
          </div>

          {/* AI study actions menu */}
          <div className="glass-card rounded-2xl p-6 space-y-4">
            <span className="text-xs font-bold text-foreground uppercase tracking-widest block flex items-center gap-1.5">
              <Sparkles className="w-4.5 h-4.5 text-primary animate-pulse" />
              <span>AI Study Suite</span>
            </span>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => triggerAI('quiz')}
                className="flex items-center gap-3 p-3 rounded-xl border border-border/60 bg-card hover:bg-accent/40 text-left transition"
              >
                <HelpCircle className="w-4 h-4 text-primary shrink-0" />
                <div className="min-w-0">
                  <h5 className="text-xs font-semibold text-foreground">Interactive Practice Quiz</h5>
                  <p className="text-[10px] text-muted-foreground">Test node comprehension</p>
                </div>
              </button>

              <button
                onClick={() => triggerAI('flashcards')}
                className="flex items-center gap-3 p-3 rounded-xl border border-border/60 bg-card hover:bg-accent/40 text-left transition"
              >
                <FlashcardIcon className="w-4 h-4 text-blue-500 shrink-0" />
                <div className="min-w-0">
                  <h5 className="text-xs font-semibold text-foreground">Flashcards Deck</h5>
                  <p className="text-[10px] text-muted-foreground">Spaced repetition review deck</p>
                </div>
              </button>

              <button
                onClick={() => triggerAI('challenges')}
                className="flex items-center gap-3 p-3 rounded-xl border border-border/60 bg-card hover:bg-accent/40 text-left transition"
              >
                <CodeIcon className="w-4 h-4 text-pink-500 shrink-0" />
                <div className="min-w-0">
                  <h5 className="text-xs font-semibold text-foreground">Coding Challenges</h5>
                  <p className="text-[10px] text-muted-foreground">Solve node practical problems</p>
                </div>
              </button>

              <button
                onClick={() => triggerAI('tasks')}
                className="flex items-center gap-3 p-3 rounded-xl border border-border/60 bg-card hover:bg-accent/40 text-left transition"
              >
                <CheckCircle className="w-4 h-4 text-accent shrink-0" />
                <div className="min-w-0">
                  <h5 className="text-xs font-semibold text-foreground">Reinforcement Tasks</h5>
                  <p className="text-[10px] text-muted-foreground">Hands-on practice guidelines</p>
                </div>
              </button>

              <button
                onClick={() => triggerAI('summary')}
                className="flex items-center gap-3 p-3 rounded-xl border border-border/60 bg-card hover:bg-accent/40 text-left transition"
              >
                <FileText className="w-4 h-4 text-amber-500 shrink-0" />
                <div className="min-w-0">
                  <h5 className="text-xs font-semibold text-foreground">Generate Summarization</h5>
                  <p className="text-[10px] text-muted-foreground">Extract summary points from notes</p>
                </div>
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* AI Display Modal */}
      {activeModal && (
        <div className="fixed inset-0 bg-slate-950/45 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card rounded-2xl max-w-xl w-full p-6 space-y-6 shadow-2xl relative max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:bg-accent/40 hover:text-foreground transition"
            >
              <Trash2 className="w-4 h-4 rotate-45" />
            </button>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2 capitalize">
                <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                <span>AI Generated {activeModal}</span>
              </h3>
              <p className="text-xs text-muted-foreground">Dynamic resources to expand your comprehension.</p>
            </div>

            {loadingAI ? (
              <div className="space-y-4 py-8 animate-pulse text-center">
                <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto"></div>
                <p className="text-xs text-muted-foreground">Reviewing note context and generating content...</p>
              </div>
            ) : !aiData ? (
              <p className="text-xs text-muted-foreground italic text-center py-6">Could not construct resources. Make sure your notes are not empty.</p>
            ) : (
              <div className="space-y-4">
                
                {/* Quiz Modal view */}
                {activeModal === 'quiz' && aiData.questions && (
                  <div className="space-y-6">
                    {aiData.questions.map((q: any, idx: number) => (
                      <div key={idx} className="p-4 border border-border/60 bg-accent/5 rounded-xl space-y-3">
                        <p className="text-xs font-bold text-foreground">
                          {idx + 1}. {q.question}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {q.options.map((opt: string, optIdx: number) => {
                            const isSelected = quizAnswers[idx] === optIdx;
                            const showCorrectness = quizScore !== null;
                            const isCorrectOpt = q.correctAnswer === optIdx;
                            
                            return (
                              <button
                                key={optIdx}
                                disabled={showCorrectness}
                                onClick={() => setQuizAnswers(prev => ({ ...prev, [idx]: optIdx }))}
                                className={`p-2.5 rounded-lg border text-xs font-medium text-left transition ${
                                  showCorrectness 
                                    ? isCorrectOpt 
                                      ? 'bg-accent/10 border-accent text-accent dark:text-accent font-semibold'
                                      : isSelected 
                                        ? 'bg-red-500/10 border-red-500 text-red-600 dark:text-red-400' 
                                        : 'border-border/60 bg-card opacity-50'
                                    : isSelected 
                                      ? 'bg-primary/10 border-primary text-primary font-semibold' 
                                      : 'border-border/60 bg-card hover:bg-accent/40 text-muted-foreground hover:text-foreground'
                                }`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                        {quizScore !== null && q.explanation && (
                          <p className="text-[10px] text-muted-foreground bg-accent/40 p-2.5 rounded-lg font-medium leading-relaxed">
                            <span className="font-bold text-foreground">Explanation:</span> {q.explanation}
                          </p>
                        )}
                      </div>
                    ))}
                    
                    {quizScore === null ? (
                      <button
                        onClick={submitQuiz}
                        className="w-full py-2.5 text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 transition duration-200"
                      >
                        Submit Quiz Answers
                      </button>
                    ) : (
                      <div className="text-center space-y-2 border-t border-border/40 pt-4">
                        <p className="text-sm font-bold text-foreground">
                          Score: {quizScore} / {aiData.questions.length} Correct
                        </p>
                        <button
                          onClick={() => {
                            setQuizScore(null);
                            setQuizAnswers({});
                          }}
                          className="px-4 py-2 text-xs font-semibold rounded-xl border border-border bg-card hover:bg-accent/40 transition"
                        >
                          Retry Quiz
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Flashcards View */}
                {activeModal === 'flashcards' && aiData.flashcards && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {aiData.flashcards.map((f: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-5 border border-border/60 bg-accent/5 rounded-2xl flex flex-col justify-between h-40 relative group cursor-pointer"
                      >
                        <div className="space-y-1">
                          <span className="text-[9px] font-bold text-muted-foreground uppercase font-mono">Front</span>
                          <p className="text-xs font-semibold text-foreground line-clamp-3">{f.front}</p>
                        </div>
                        <div className="absolute inset-0 bg-slate-900 border border-white/10 p-5 rounded-2xl flex flex-col justify-between opacity-0 hover:opacity-100 transition duration-300">
                          <div className="space-y-1">
                            <span className="text-[9px] font-bold text-primary uppercase font-mono">Back</span>
                            <p className="text-xs font-medium text-slate-200 leading-relaxed overflow-y-auto max-h-[85px]">{f.back}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Coding Challenges view */}
                {activeModal === 'challenges' && aiData.challenges && (
                  <div className="space-y-4">
                    {aiData.challenges.map((c: any, idx: number) => (
                      <div key={idx} className="p-5 border border-border/60 bg-accent/5 rounded-2xl space-y-3">
                        <div className="flex justify-between items-start">
                          <h4 className="text-xs font-bold text-foreground">{c.title}</h4>
                          <span className="text-[9px] font-bold text-muted-foreground uppercase font-mono">{c.difficulty}</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{c.description}</p>
                        
                        {c.starterCode && (
                          <pre className="p-3 bg-slate-950 border border-white/5 rounded-xl text-[10px] font-mono text-accent overflow-x-auto">
                            <code>{c.starterCode}</code>
                          </pre>
                        )}
                        <div className="text-[10px] text-muted-foreground font-medium">
                          <span className="font-bold text-foreground">Expected Output:</span> {c.expectedOutput}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Practice Tasks view */}
                {activeModal === 'tasks' && aiData.tasks && (
                  <div className="space-y-4">
                    {aiData.tasks.map((t: any, idx: number) => (
                      <div key={idx} className="p-5 border border-border/60 bg-accent/5 rounded-2xl space-y-2">
                        <div className="flex justify-between items-start">
                          <h4 className="text-xs font-bold text-foreground">{t.title}</h4>
                          <span className="text-[9px] text-muted-foreground font-mono font-semibold uppercase">{t.estimatedTime} Mins</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{t.description}</p>
                      </div>
                    ))}
                  </div>
                )}

              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
