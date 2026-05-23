'use client';

import { use, useState, useEffect, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getSubject, 
  getChapters, 
  createChapter, 
  deleteChapter, 
  getLessons, 
  createLesson, 
  deleteLesson,
  updateChapter,
  updateSubject,
  reorderChapters,
  reorderLessons,
  generateProjects
} from '@/lib/api';
import { IChapter, ISubject, ILesson } from '@/types';
import SkeletonLoader from '@/components/ui/SkeletonLoader';
import { 
  Plus, 
  Trash2, 
  ChevronRight, 
  ChevronDown, 
  BookOpen, 
  Play, 
  Clock, 
  Sparkles,
  ArrowRight,
  Code,
  GripVertical,
  Pencil
} from 'lucide-react';
import Link from 'next/link';

export default function SubjectDetails({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = use(paramsPromise);
  const subjectId = params.id;
  const queryClient = useQueryClient();

  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({});
  
  // Chapter Form State
  const [showChapterModal, setShowChapterModal] = useState(false);
  const [chapterTitle, setChapterTitle] = useState('');
  const [chapterDesc, setChapterDesc] = useState('');

  // Lesson Form State
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonDiff, setLessonDiff] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');

  // AI Project Suggestions State
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [aiProjects, setAiProjects] = useState<any[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);

  // Subject edit state
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [subjectName, setSubjectName] = useState('');
  const [subjectDesc, setSubjectDesc] = useState('');

  // Chapter edit & reorder state
  const [editingChapter, setEditingChapter] = useState<IChapter | null>(null);
  const [draggedChapterId, setDraggedChapterId] = useState<string | null>(null);
  const [chapterDragOverId, setChapterDragOverId] = useState<string | null>(null);
  const [localChapterOrder, setLocalChapterOrder] = useState<IChapter[] | null>(null);
  const chapterDragNode = useRef<HTMLDivElement | null>(null);

  // Queries
  const { data: subject, isLoading: loadingSubject } = useQuery({
    queryKey: ['subject', subjectId],
    queryFn: () => getSubject(subjectId),
  });

  const { data: chapters = [], isLoading: loadingChapters } = useQuery({
    queryKey: ['chapters', subjectId],
    queryFn: () => getChapters(subjectId),
  });

  useEffect(() => {
    if (subject) {
      setSubjectName(subject.name);
      setSubjectDesc(subject.description || '');
    }
  }, [subject]);

  const displayChapters = localChapterOrder ?? chapters;

  // Mutations
  const createChapterMutation = useMutation({
    mutationFn: createChapter,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chapters', subjectId] });
      setShowChapterModal(false);
      setChapterTitle('');
      setChapterDesc('');
    },
  });

  const deleteChapterMutation = useMutation({
    mutationFn: deleteChapter,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chapters', subjectId] });
    },
  });

  const updateChapterMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<IChapter> }) => updateChapter(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chapters', subjectId] });
      setShowChapterModal(false);
      setEditingChapter(null);
      setChapterTitle('');
      setChapterDesc('');
    },
  });

  const updateSubjectMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ISubject> }) => updateSubject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subject', subjectId] });
      setShowSubjectModal(false);
    },
  });

  const reorderChapterMutation = useMutation({
    mutationFn: (order: { id: string; order: number }[]) => reorderChapters(subjectId, order),
    onMutate: async (order) => {
      await queryClient.cancelQueries({ queryKey: ['chapters', subjectId] });
      const previousChapters = queryClient.getQueryData<IChapter[]>(['chapters', subjectId]);
      if (previousChapters) {
        const nextChapters = order
          .map(({ id }) => previousChapters.find((chapter) => chapter._id === id))
          .filter((chapter): chapter is IChapter => Boolean(chapter));
        queryClient.setQueryData(['chapters', subjectId], nextChapters);
        setLocalChapterOrder(nextChapters);
      }
      return { previousChapters };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousChapters) {
        queryClient.setQueryData(['chapters', subjectId], context.previousChapters);
      }
      setLocalChapterOrder(null);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['chapters', subjectId] });
    },
  });

  useEffect(() => {
    if (!draggedChapterId && !reorderChapterMutation.isPending) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocalChapterOrder(null);
    }
  }, [chapters, draggedChapterId, reorderChapterMutation.isPending]);

  const createLessonMutation = useMutation({
    mutationFn: createLesson,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
      queryClient.invalidateQueries({ queryKey: ['chapters', subjectId] });
      queryClient.invalidateQueries({ queryKey: ['subject', subjectId] });
      if (activeChapterId) {
        queryClient.invalidateQueries({ queryKey: ['lessons', activeChapterId] });
      }
      setShowLessonModal(false);
      setLessonTitle('');
    },
  });

  const deleteLessonMutation = useMutation({
    mutationFn: deleteLesson,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
      queryClient.invalidateQueries({ queryKey: ['chapters', subjectId] });
      queryClient.invalidateQueries({ queryKey: ['subject', subjectId] });
      if (activeChapterId) {
        queryClient.invalidateQueries({ queryKey: ['lessons', activeChapterId] });
      }
    },
  });

  const handleChapterFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chapterTitle.trim()) return;

    if (editingChapter) {
      updateChapterMutation.mutate({
        id: editingChapter._id,
        data: { title: chapterTitle, description: chapterDesc },
      });
    } else {
      createChapterMutation.mutate({
        subjectId: subjectId as any,
        title: chapterTitle,
        description: chapterDesc,
      });
    }
  };

  const handleAddLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonTitle.trim() || !activeChapterId) return;
    createLessonMutation.mutate({
      chapterId: activeChapterId,
      subjectId: subjectId as any,
      title: lessonTitle,
      difficulty: lessonDiff,
      status: 'pending',
    });
  };

  const openChapterModal = (chapter?: IChapter) => {
    if (chapter) {
      setEditingChapter(chapter);
      setChapterTitle(chapter.title);
      setChapterDesc(chapter.description || '');
    } else {
      setEditingChapter(null);
      setChapterTitle('');
      setChapterDesc('');
    }
    setShowChapterModal(true);
  };

  const openSubjectEditModal = () => {
    if (!subject) return;
    setSubjectName(subject.name);
    setSubjectDesc(subject.description || '');
    setShowSubjectModal(true);
  };

  const handleSubjectSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectName.trim()) return;
    updateSubjectMutation.mutate({
      id: subjectId,
      data: { name: subjectName, description: subjectDesc },
    });
  };

  const handleChapterDragStart = useCallback((e: React.DragEvent, id: string) => {
    setDraggedChapterId(id);
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => {
      if (chapterDragNode.current) chapterDragNode.current.style.opacity = '0.4';
    }, 0);
  }, []);

  const handleChapterDragEnter = useCallback((id: string) => {
    if (id === draggedChapterId) return;
    setChapterDragOverId(id);
    setLocalChapterOrder((prev) => {
      const list = prev ?? chapters;
      const from = list.findIndex((c) => c._id === draggedChapterId);
      const to = list.findIndex((c) => c._id === id);
      if (from === -1 || to === -1) return prev;
      const next = [...list];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  }, [chapters, draggedChapterId]);

  const handleChapterDragEnd = useCallback(() => {
    if (chapterDragNode.current) chapterDragNode.current.style.opacity = '1';
    setDraggedChapterId(null);
    setChapterDragOverId(null);

    const ordered = localChapterOrder ?? chapters;
    const payload = ordered.map((chapter, index) => ({ id: chapter._id, order: index }));
    reorderChapterMutation.mutate(payload);
  }, [chapters, localChapterOrder, reorderChapterMutation]);

  const handleAILearnProjects = async () => {
    setLoadingProjects(true);
    setShowProjectModal(true);
    try {
      const data = await generateProjects(subjectId);
      setAiProjects(data.projects || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingProjects(false);
    }
  };

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters(prev => ({
      ...prev,
      [chapterId]: !prev[chapterId],
    }));
  };

  // Helper component to display lessons list inside chapter row
  function LessonList({ chapterId }: { chapterId: string }) {
    const queryClient = useQueryClient();
    const [draggedLessonId, setDraggedLessonId] = useState<string | null>(null);
    const [lessonDragOverId, setLessonDragOverId] = useState<string | null>(null);
    const [localLessonOrder, setLocalLessonOrder] = useState<ILesson[] | null>(null);
    const lessonDragNode = useRef<HTMLDivElement | null>(null);

    const { data: lessons = [], isLoading } = useQuery({
      queryKey: ['lessons', chapterId],
      queryFn: () => getLessons(chapterId),
      enabled: !!expandedChapters[chapterId],
    });

    useEffect(() => {
      if (!draggedLessonId) {
        setLocalLessonOrder(null);
      }
    }, [lessons, draggedLessonId]);

    const displayLessons = localLessonOrder ?? lessons;

    const handleLessonDragStart = useCallback((e: React.DragEvent, id: string) => {
      setDraggedLessonId(id);
      e.dataTransfer.effectAllowed = 'move';
      setTimeout(() => {
        if (lessonDragNode.current) lessonDragNode.current.style.opacity = '0.4';
      }, 0);
    }, []);

    const handleLessonDragEnter = useCallback((id: string) => {
      if (id === draggedLessonId) return;
      setLessonDragOverId(id);
      setLocalLessonOrder((prev) => {
        const list = prev ?? lessons;
        const from = list.findIndex((l) => l._id === draggedLessonId);
        const to = list.findIndex((l) => l._id === id);
        if (from === -1 || to === -1) return prev;
        const next = [...list];
        const [moved] = next.splice(from, 1);
        next.splice(to, 0, moved);
        return next;
      });
    }, [draggedLessonId, lessons]);

    const handleLessonDragEnd = useCallback(() => {
      if (lessonDragNode.current) lessonDragNode.current.style.opacity = '1';
      setDraggedLessonId(null);
      setLessonDragOverId(null);

      const ordered = localLessonOrder ?? lessons;
      const payload = ordered.map((lesson, index) => ({ id: lesson._id, order: index }));
      reorderLessons(chapterId, payload).then(() => {
        queryClient.invalidateQueries({ queryKey: ['lessons', chapterId] });
      });
    }, [chapterId, localLessonOrder, lessons, queryClient]);

    if (isLoading) {
      return (
        <div className="pl-12 py-3 space-y-3">
          {[...Array(3)].map((_, idx) => (
            <div key={idx} className="h-12 rounded-2xl bg-accent/20 animate-pulse" />
          ))}
        </div>
      );
    }

    return (
      <div className="pl-12 pr-6 pb-4 space-y-2 border-t border-border/20 pt-3 bg-accent/5">
        {displayLessons.length === 0 ? (
          <p className="text-xs text-muted-foreground italic py-1">No lessons added to this chapter yet.</p>
        ) : (
          displayLessons.map((lesson) => {
            const isDragging = draggedLessonId === lesson._id;
            const isOver = lessonDragOverId === lesson._id;
            return (
              <div
                key={lesson._id}
                ref={isDragging ? lessonDragNode : null}
                draggable
                onDragStart={(e) => handleLessonDragStart(e, lesson._id)}
                onDragEnter={() => handleLessonDragEnter(lesson._id)}
                onDragOver={(e) => e.preventDefault()}
                onDragEnd={handleLessonDragEnd}
                className={`flex items-center justify-between p-3.5 rounded-xl border border-border/50 bg-card hover:bg-accent/20 transition group ${isDragging ? 'opacity-40 scale-[0.97]' : ''} ${isOver ? 'ring-2 ring-primary/30 border-primary/30' : ''}`}
              >
                <Link href={`/subjects/${subjectId}/${chapterId}/${lesson._id}`} className="flex items-center gap-3.5 flex-1 min-w-0">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 capitalize ${
                    lesson.status === 'completed' ? 'bg-accent/10 text-accent border border-accent/20' :
                    lesson.status === 'revision' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                    lesson.status === 'in-progress' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' : 'bg-muted text-muted-foreground border border-border/80'
                  }`}>
                    {lesson.status}
                  </span>
                  <span className="text-xs font-semibold text-foreground truncate">{lesson.title}</span>
                </Link>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground font-semibold uppercase">{lesson.difficulty}</span>
                  <button
                    onClick={() => {
                      setActiveChapterId(chapterId);
                      deleteLessonMutation.mutate(lesson._id);
                    }}
                    className="p-1 rounded text-muted-foreground hover:text-red-500 transition opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    );
  }

  if (!subject) {
    return <SkeletonLoader />;
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Back button */}
      <Link href="/subjects" className="text-xs text-muted-foreground hover:text-foreground font-semibold flex items-center gap-1.5 transition">
        <ChevronRight className="w-4 h-4 rotate-180" />
        <span>Subjects Library</span>
      </Link>

      {/* Header Info */}
      <div className="glass-card rounded-3xl p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-3 max-w-xl">
          <div className="flex items-center gap-3.5">
            <span className="text-3xl">{subject.icon}</span>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">{subject.name}</h2>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{subject.description || 'No description available for this subject.'}</p>
        </div>

        {/* Action controls */}
        <div className="flex flex-col gap-3 shrink-0">
          <button
            onClick={openSubjectEditModal}
            className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl border border-border/60 bg-card text-foreground hover:bg-accent/10 transition shadow-sm"
          >
            <Pencil className="w-4 h-4" />
            <span>Edit Subject</span>
          </button>
          <button
            onClick={() => openChapterModal()}
            className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Chapter</span>
          </button>
          <button
            onClick={handleAILearnProjects}
            className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl border border-primary/20 bg-primary/10 text-primary hover:bg-primary/15 transition"
          >
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            <span>AI Project Suggestions</span>
          </button>
        </div>
      </div>

      {/* Chapter Row List */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-foreground uppercase tracking-widest px-1">Chapters List</h3>

        {loadingChapters ? (
          <div className="space-y-4 animate-pulse">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-accent/20 rounded-2xl"></div>
            ))}
          </div>
        ) : chapters.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center text-xs text-muted-foreground italic">
            No chapters added yet. Add a chapter to start organizing lessons.
          </div>
        ) : (
          <div className="space-y-3">
            {displayChapters.map((chapter) => {
              const isExpanded = !!expandedChapters[chapter._id];
              const isDraggingChapter = draggedChapterId === chapter._id;
              const isDragOverChapter = chapterDragOverId === chapter._id;
              return (
                <div
                  key={chapter._id}
                  ref={isDraggingChapter ? chapterDragNode : null}
                  draggable
                  onDragStart={(e) => handleChapterDragStart(e, chapter._id)}
                  onDragEnter={() => handleChapterDragEnter(chapter._id)}
                  onDragOver={(e) => e.preventDefault()}
                  onDragEnd={handleChapterDragEnd}
                  className={`glass-card rounded-2xl overflow-hidden border border-border/40 transition ${isDraggingChapter ? 'opacity-40 scale-[0.98]' : ''} ${isDragOverChapter ? 'ring-2 ring-primary/30 border-primary/30' : ''}`}
                >
                  <div className="flex items-center justify-between p-5 gap-4">
                    {/* Header trigger */}
                    <button
                      onClick={() => toggleChapter(chapter._id)}
                      className="flex items-center gap-4 flex-1 text-left min-w-0"
                    >
                      {isExpanded ? <ChevronDown className="w-4.5 h-4.5 text-muted-foreground" /> : <ChevronRight className="w-4.5 h-4.5 text-muted-foreground" />}
                      <div className="min-w-0 space-y-0.5">
                        <h4 className="text-sm font-semibold text-foreground truncate">{chapter.title}</h4>
                        <p className="text-[11px] text-muted-foreground truncate">{chapter.description || 'No description'}</p>
                      </div>
                    </button>

                    {/* Progress + actions */}
                    <div className="flex items-center gap-5 shrink-0">
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[10px] font-semibold text-muted-foreground font-mono">{chapter.progressPercent}% Completed</span>
                        <div className="w-24 h-1 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: `${chapter.progressPercent}%` }}></div>
                        </div>
                      </div>

                      <button
                        onClick={() => openChapterModal(chapter)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card text-[11px] font-semibold text-foreground hover:bg-accent/40 transition"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>Edit Chapter</span>
                      </button>

                      <button
                        onClick={() => {
                          setActiveChapterId(chapter._id);
                          setShowLessonModal(true);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card text-[11px] font-semibold text-foreground hover:bg-accent/40 transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Lesson</span>
                      </button>

                      <button
                        onClick={() => deleteChapterMutation.mutate(chapter._id)}
                        className="p-2 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  </div>

                  {isExpanded && <LessonList chapterId={chapter._id} />}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Chapter Creation Modal */}
      {showChapterModal && (
        <div className="fixed inset-0 bg-slate-950/45 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card rounded-2xl max-w-md w-full p-6 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setShowChapterModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:bg-accent/40 hover:text-foreground transition"
            >
              <Trash2 className="w-4 h-4 rotate-45" />
            </button>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-foreground">
                {editingChapter ? 'Edit Chapter' : 'Add New Chapter'}
              </h3>
              <p className="text-xs text-muted-foreground">
                {editingChapter ? 'Update chapter details before saving.' : 'Add a syllabus subdivision to your subject space.'}
              </p>
            </div>

            <form onSubmit={handleChapterFormSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-muted-foreground uppercase block">Chapter Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chapter 1: Basic Logic Gates"
                  value={chapterTitle}
                  onChange={(e) => setChapterTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-card border border-border/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-muted-foreground uppercase block">Chapter Description</label>
                <textarea
                  placeholder="e.g. Overview of boolean expressions and logic architectures..."
                  value={chapterDesc}
                  onChange={(e) => setChapterDesc(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-card border border-border/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition h-20 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={createChapterMutation.isPending}
                className="w-full py-2.5 text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 transition duration-200"
              >
                {createChapterMutation.isPending ? 'Adding...' : 'Add Chapter'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Subject Edit Modal */}
      {showSubjectModal && (
        <div className="fixed inset-0 bg-slate-950/45 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card rounded-2xl max-w-md w-full p-6 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setShowSubjectModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:bg-accent/40 hover:text-foreground transition"
            >
              <Trash2 className="w-4 h-4 rotate-45" />
            </button>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-foreground">Edit Subject</h3>
              <p className="text-xs text-muted-foreground">Update the subject title and overview.</p>
            </div>

            <form onSubmit={handleSubjectSave} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-muted-foreground uppercase block">Subject Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Artificial Intelligence Fundamentals"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-card border border-border/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-muted-foreground uppercase block">Subject Description</label>
                <textarea
                  placeholder="Update the subject description..."
                  value={subjectDesc}
                  onChange={(e) => setSubjectDesc(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-card border border-border/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition h-24 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={updateSubjectMutation.isPending}
                className="w-full py-2.5 text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 transition duration-200"
              >
                {updateSubjectMutation.isPending ? 'Saving...' : 'Save Subject'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Lesson Creation Modal */}
      {showLessonModal && (
        <div className="fixed inset-0 bg-slate-950/45 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card rounded-2xl max-w-md w-full p-6 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setShowLessonModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:bg-accent/40 hover:text-foreground transition"
            >
              <Trash2 className="w-4 h-4 rotate-45" />
            </button>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-foreground">Add New Lesson</h3>
              <p className="text-xs text-muted-foreground">Add a study node/topic detail card.</p>
            </div>

            <form onSubmit={handleAddLesson} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-muted-foreground uppercase block">Lesson Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. De Morgan's Theorem"
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-card border border-border/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-muted-foreground uppercase block">Difficulty</label>
                <select
                  value={lessonDiff}
                  onChange={(e) => setLessonDiff(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm bg-card border border-border/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={createLessonMutation.isPending}
                className="w-full py-2.5 text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 transition duration-200"
              >
                {createLessonMutation.isPending ? 'Adding...' : 'Add Lesson'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* AI Projects suggestions Modal */}
      {showProjectModal && (
        <div className="fixed inset-0 bg-slate-950/45 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl relative max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setShowProjectModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:bg-accent/40 hover:text-foreground transition"
            >
              <Trash2 className="w-4 h-4 rotate-45" />
            </button>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                <span>AI Recommended Practice Projects</span>
              </h3>
              <p className="text-xs text-muted-foreground">Real-world coding/practical projects generated dynamically based on your completed lessons.</p>
            </div>

            {loadingProjects ? (
              <div className="space-y-4 py-8 animate-pulse text-center">
                <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto"></div>
                <p className="text-xs text-muted-foreground">AI Coach is reviewing your completed lessons and designing custom projects...</p>
              </div>
            ) : aiProjects.length === 0 ? (
              <p className="text-xs text-muted-foreground italic text-center py-6">
                No projects could be generated. Try completing some lessons in this subject first to give AI enough context!
              </p>
            ) : (
              <div className="space-y-4">
                {aiProjects.map((p, idx) => (
                  <div key={idx} className="p-5 border border-border/60 bg-accent/5 rounded-2xl space-y-3">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h4 className="text-sm font-semibold text-foreground">{p.title}</h4>
                        <span className="text-[10px] text-muted-foreground font-medium uppercase font-mono">
                          Difficulty: {p.difficulty} • Est. Time: {p.estimatedHours} Hours
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{p.description}</p>
                    
                    {/* Tags */}
                    {p.technologies && (
                      <div className="flex flex-wrap gap-1.5">
                        {p.technologies.map((t: string) => (
                          <span key={t} className="text-[9px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-semibold">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
