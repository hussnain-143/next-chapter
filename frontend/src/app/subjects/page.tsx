'use client';

import { useState, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSubjects, createSubject, deleteSubject, reorderSubjects } from '../../lib/api';
import { ISubject } from '../../types';
import {
  Plus, X, Trash2, BookOpen, Palette, CheckCircle2,
  ArrowRight, Check, GripVertical, Layers,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

const CUSTOM_COLORS = [
  '#6366f1', '#3b82f6', '#0ea5e9', '#10b981',
  '#84cc16', '#eab308', '#f59e0b', '#f97316',
  '#ef4444', '#ec4899', '#d946ef', '#8b5cf6',
];

export default function Subjects() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#6366f1');

  // Drag state
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [localOrder, setLocalOrder] = useState<ISubject[] | null>(null);
  const dragNode = useRef<HTMLDivElement | null>(null);

  const { data: subjects = [], isLoading } = useQuery({
    queryKey: ['subjects'],
    queryFn: getSubjects,
  });

  // Reset local drag order whenever fresh server data arrives
  const prevSubjectsRef = useRef(subjects);
  if (prevSubjectsRef.current !== subjects) {
    prevSubjectsRef.current = subjects;
    // Only reset if we're not mid-drag
    if (!draggedId) setLocalOrder(null);
  }

  // Use local order if we have one (after drag), otherwise use server order
  const displaySubjects: ISubject[] = localOrder ?? subjects;

  const createMutation = useMutation({
    mutationFn: createSubject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      setIsOpen(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSubject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      toast.success('Subject deleted', { description: 'The subject has been removed.' });
    },
    onError: () => toast.error('Failed to delete subject'),
  });

  const reorderMutation = useMutation({
    mutationFn: reorderSubjects,
    onError: () => {
      // Revert on failure
      setLocalOrder(null);
      toast.error('Failed to save order', { description: 'Drag order was not saved.' });
    },
  });

  const resetForm = () => { setStep(1); setName(''); setDescription(''); setColor('#6366f1'); };
  const handleOpenModal = () => { resetForm(); setIsOpen(true); };
  const handleNextStep = (e: React.FormEvent) => { e.preventDefault(); if (!name.trim()) return; setStep(2); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const toastId = toast.loading('Creating subject…');
    createMutation.mutate(
      { name, description, icon: name.charAt(0).toUpperCase(), color },
      {
        onSuccess: () => toast.success('Subject created!', { id: toastId, description: `${name} added to your library.` }),
        onError: (err: any) => toast.error('Failed to create', { id: toastId, description: err.response?.data?.error || 'Something went wrong.' }),
      }
    );
  };

  // ── Drag handlers ──────────────────────────────────────────────────────────
  const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
    // Slight delay so the ghost image renders before we dim the card
    setTimeout(() => {
      if (dragNode.current) dragNode.current.style.opacity = '0.4';
    }, 0);
  }, []);

  const handleDragEnter = useCallback((id: string) => {
    if (id === draggedId) return;
    setDragOverId(id);
    setLocalOrder((prev) => {
      const list: ISubject[] = prev ?? subjects;
      const from = list.findIndex((s) => s._id === draggedId);
      const to = list.findIndex((s) => s._id === id);
      if (from === -1 || to === -1) return prev;
      const next = [...list];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  }, [draggedId, subjects]);

  const handleDragEnd = useCallback(() => {
    if (dragNode.current) dragNode.current.style.opacity = '1';
    setDraggedId(null);
    setDragOverId(null);

    // Persist new order
    const ordered: ISubject[] = localOrder ?? subjects;
    const payload = ordered.map((s, i) => ({ id: s._id, order: i }));
    reorderMutation.mutate(payload);
  }, [localOrder, subjects, reorderMutation]);

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground">Subjects Library</h2>
          <p className="text-sm text-muted-foreground mt-1 font-medium flex items-center gap-1.5">
            <GripVertical className="w-3.5 h-3.5 opacity-50" />
            Drag cards to reorder · click to open
          </p>
        </div>
        <button
          onClick={handleOpenModal}
          className="flex items-center gap-2 px-5 py-3 text-sm font-bold rounded-xl btn-gradient shadow-sm hover:opacity-90 transition-opacity active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          New Subject
        </button>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 bg-accent/10 rounded-[1.5rem] border border-border/50" />
          ))}
        </div>
      ) : displaySubjects.length === 0 ? (
        <div className="glass-card rounded-[2rem] p-16 text-center space-y-6 max-w-lg mx-auto mt-12 border border-border/50">
          <div className="w-20 h-20 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto border border-primary/20">
            <BookOpen className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-foreground">No subjects yet</h3>
            <p className="text-sm text-muted-foreground font-medium">Create a subject to start organising your chapters and lessons.</p>
          </div>
          <button onClick={handleOpenModal} className="px-6 py-3 text-sm font-bold rounded-xl btn-gradient shadow-sm mx-auto hover:opacity-90 transition-opacity active:scale-[0.98]">
            Add First Subject
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displaySubjects.map((sub) => {
            const isDragging = draggedId === sub._id;
            const isOver = dragOverId === sub._id;
            return (
              <div
                key={sub._id}
                ref={isDragging ? dragNode : null}
                draggable
                onDragStart={(e) => handleDragStart(e, sub._id)}
                onDragEnter={() => handleDragEnter(sub._id)}
                onDragOver={(e) => e.preventDefault()}
                onDragEnd={handleDragEnd}
                className={[
                  'glass-card rounded-[1.5rem] p-6 flex flex-col justify-between h-48 relative group border transition-all duration-200 cursor-grab active:cursor-grabbing select-none',
                  isDragging ? 'opacity-40 scale-[0.97]' : 'hover:shadow-md hover:border-primary/30',
                  isOver ? 'ring-2 ring-primary/40 border-primary/40 scale-[1.01]' : 'border-border/60',
                ].join(' ')}
              >
                {/* Drag handle */}
                <div className="absolute top-3 left-3 text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors">
                  <GripVertical className="w-4 h-4" />
                </div>

                <div className="flex justify-between items-start gap-4">
                  <Link
                    href={`/subjects/${sub._id}`}
                    className="flex items-start gap-4 max-w-[85%] group/link"
                    onClick={(e) => isDragging && e.preventDefault()}
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold shadow-inner border shrink-0 transition-transform group-hover/link:scale-105 ml-4"
                      style={{ backgroundColor: `${sub.color}15`, color: sub.color, borderColor: `${sub.color}30` }}
                    >
                      {sub.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 pt-0.5">
                      <h4 className="text-base font-bold text-foreground truncate group-hover/link:text-primary transition-colors">{sub.name}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1 font-medium">{sub.description || 'No description added.'}</p>
                    </div>
                  </Link>

                  <button
                    onClick={() => deleteMutation.mutate(sub._id)}
                    className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition opacity-0 group-hover:opacity-100 shrink-0"
                    title="Delete subject"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2.5 mt-4">
                  <div className="flex justify-between text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <span>{sub.completedLessons}/{sub.totalLessons} Lessons</span>
                    <span>{sub.progressPercent}%</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden border border-black/5 dark:border-white/5">
                    <div
                      className="h-full rounded-full transition-all duration-500 ease-out"
                      style={{ backgroundColor: sub.color, width: `${sub.progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsOpen(false)} className="absolute inset-0 bg-background/80 backdrop-blur-sm" />

          <div className="glass-card rounded-[2rem] max-w-lg w-full p-8 shadow-2xl relative z-10 border border-white/20 dark:border-white/10 overflow-hidden animate-fade-in-up">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent" />

            <button onClick={() => setIsOpen(false)} className="absolute top-5 right-5 p-2 rounded-xl text-muted-foreground hover:bg-accent/10 hover:text-foreground transition z-20">
              <X className="w-5 h-5" />
            </button>

            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                  {step === 1 ? <BookOpen className="w-5 h-5" /> : <Palette className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">{step === 1 ? 'Subject Details' : 'Design your Subject'}</h3>
                  <p className="text-xs text-muted-foreground font-medium">Step {step} of 2</p>
                </div>
              </div>
              <div className="w-full h-1.5 bg-muted rounded-full mt-4 overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: step === 1 ? '50%' : '100%' }} />
              </div>
            </div>

            {step === 1 ? (
              <form onSubmit={handleNextStep} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest block ml-1">Subject Name</label>
                  <input
                    type="text" required autoFocus
                    placeholder="e.g. Data Structures, React Patterns"
                    value={name} onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3.5 text-sm bg-background/50 border border-border/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition font-medium shadow-sm hover:border-primary/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest block ml-1">Description (Optional)</label>
                  <textarea
                    placeholder="Briefly describe what you'll learn…"
                    value={description} onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-3.5 text-sm bg-background/50 border border-border/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition h-28 resize-none font-medium shadow-sm hover:border-primary/50"
                  />
                </div>
                <button type="submit" className="w-full py-4 text-sm font-bold rounded-xl btn-gradient flex items-center justify-center gap-2 group mt-6 shadow-sm hover:opacity-90 transition-all active:scale-[0.98]">
                  Continue <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Preview */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest block ml-1">Preview</label>
                  <div className="p-4 rounded-2xl border border-border/60 bg-accent/5 flex flex-col justify-between h-32 relative overflow-hidden">
                    <div className="flex items-start gap-4">
                      <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-bold border shadow-inner bg-background transition-colors duration-300"
                        style={{ borderColor: `${color}40`, boxShadow: `0 4px 20px ${color}20`, color }}
                      >
                        {name ? name.charAt(0).toUpperCase() : '?'}
                      </div>
                      <div className="pt-1 min-w-0">
                        <div className="font-bold text-lg text-foreground truncate">{name || 'Subject Name'}</div>
                        <div className="text-xs text-muted-foreground font-medium line-clamp-1 mt-0.5">{description || 'No description'}</div>
                      </div>
                    </div>
                    <div className="w-full h-1.5 bg-background/50 rounded-full mt-4 overflow-hidden border border-border/50">
                      <div className="h-full w-1/3 rounded-full transition-colors duration-300" style={{ backgroundColor: color }} />
                    </div>
                  </div>
                </div>

                {/* Color picker */}
                <div className="space-y-3 pt-2">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest block ml-1">Theme Color</label>
                  <div className="flex flex-wrap gap-3">
                    {CUSTOM_COLORS.map((c) => (
                      <button
                        key={c} type="button" onClick={() => setColor(c)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${color === c ? 'scale-110 ring-2 ring-offset-2 ring-offset-background' : 'hover:scale-105 opacity-80 hover:opacity-100'}`}
                        style={{ backgroundColor: c, ['--tw-ring-color' as any]: c }}
                      >
                        {color === c && <Check className="w-5 h-5 text-white drop-shadow-md" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-6 border-t border-border/40">
                  <button type="button" onClick={() => setStep(1)} className="px-5 py-4 text-sm font-bold rounded-xl border border-border/80 hover:bg-accent/10 transition-colors flex-1">
                    Back
                  </button>
                  <button type="submit" disabled={createMutation.isPending} className="py-4 text-sm font-bold rounded-xl btn-gradient flex items-center justify-center gap-2 flex-[2] shadow-sm hover:opacity-90 transition-all active:scale-[0.98]">
                    {createMutation.isPending ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <><CheckCircle2 className="w-4 h-4" /> Create Subject</>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
