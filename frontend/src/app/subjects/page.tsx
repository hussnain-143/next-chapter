'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSubjects, createSubject, deleteSubject } from '../../lib/api';
import { Plus, X, Trash2, BookOpen, Palette, CheckCircle2, ArrowRight, Check } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

const CUSTOM_COLORS = [
  '#6366f1', // Indigo
  '#3b82f6', // Blue
  '#0ea5e9', // Sky
  '#10b981', // Emerald
  '#84cc16', // Lime
  '#eab308', // Yellow
  '#f59e0b', // Amber
  '#f97316', // Orange
  '#ef4444', // Red
  '#ec4899', // Pink
  '#d946ef', // Fuchsia
  '#8b5cf6', // Violet
];

export default function Subjects() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#6366f1');

  const { data: subjects = [], isLoading } = useQuery({
    queryKey: ['subjects'],
    queryFn: getSubjects,
  });

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
      toast.success('Subject deleted', {
        description: 'The subject has been successfully removed.'
      });
    },
  });

  const resetForm = () => {
    setStep(1);
    setName('');
    setDescription('');
    setColor('#6366f1');
  };

  const handleOpenModal = () => {
    resetForm();
    setIsOpen(true);
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setStep(2);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    const toastId = toast.loading('Creating subject...', {
      description: 'Setting up your new learning path'
    });

    createMutation.mutate(
      { name, description, icon: name.charAt(0).toUpperCase(), color },
      {
        onSuccess: () => {
          toast.success('Subject created!', {
            id: toastId,
            description: `${name} has been added to your library.`,
            icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          });
        },
        onError: (err: any) => {
          toast.error('Failed to create subject', {
            id: toastId,
            description: err.response?.data?.error || 'Something went wrong.'
          });
        }
      }
    );
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12 fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground">Subjects Library</h2>
          <p className="text-sm text-muted-foreground mt-1 font-medium">Manage your study curriculum subjects.</p>
        </div>
        <button
          onClick={handleOpenModal}
          className="flex items-center gap-2 px-5 py-3 text-sm font-bold rounded-xl btn-gradient shadow-sm hover:opacity-90 transition-opacity active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>New Subject</span>
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-44 bg-accent/10 rounded-[1.5rem] border border-border/50"></div>
          ))}
        </div>
      ) : subjects.length === 0 ? (
        <div className="glass-card rounded-[2rem] p-16 text-center space-y-6 max-w-lg mx-auto mt-12 border border-border/50 fade-in">
          <div className="w-20 h-20 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto border border-primary/20 shadow-inner">
            <BookOpen className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-foreground">No subjects found</h3>
            <p className="text-sm text-muted-foreground font-medium">Create a subject to begin organizing your chapters, lessons, and track your progress.</p>
          </div>
          <button
            onClick={handleOpenModal}
            className="px-6 py-3 text-sm font-bold rounded-xl btn-gradient shadow-sm mx-auto hover:opacity-90 transition-opacity active:scale-[0.98]"
          >
            Add First Subject
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((sub) => (
            <div
              key={sub._id}
              className="glass-card rounded-[1.5rem] p-6 flex flex-col justify-between h-48 hover:shadow-md transition-all duration-200 relative group border border-border/60 hover:border-primary/30"
            >
              <div className="flex justify-between items-start gap-4">
                <Link href={`/subjects/${sub._id}`} className="flex items-start gap-4 max-w-[85%] group/link">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold shadow-inner border shrink-0 transition-transform group-hover/link:scale-105"
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
                  className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition opacity-0 group-hover:opacity-100"
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
          ))}
        </div>
      )}

      {/* Simplified Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          />
          
          <div className="glass-card rounded-[2rem] max-w-lg w-full p-8 shadow-2xl relative z-10 border border-white/20 dark:border-white/10 overflow-hidden fade-in">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent" />
            
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-muted-foreground hover:bg-accent/10 hover:text-foreground transition z-20"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-8 relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                  {step === 1 ? <BookOpen className="w-5 h-5" /> : <Palette className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">
                    {step === 1 ? 'Subject Details' : 'Design your Subject'}
                  </h3>
                  <p className="text-xs text-muted-foreground font-medium">
                    Step {step} of 2
                  </p>
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="w-full h-1.5 bg-muted rounded-full mt-4 overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: step === 1 ? '50%' : '100%' }}
                />
              </div>
            </div>

            {step === 1 ? (
              <form onSubmit={handleNextStep} className="space-y-5 relative z-10">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest block ml-1">Subject Name</label>
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="e.g. Data Structures, React Patterns"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3.5 text-sm bg-background/50 border border-border/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition font-medium shadow-sm hover:border-primary/50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest block ml-1">Description (Optional)</label>
                  <textarea
                    placeholder="Briefly describe what you'll learn in this subject..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-3.5 text-sm bg-background/50 border border-border/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition h-28 resize-none font-medium shadow-sm hover:border-primary/50"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 text-sm font-bold rounded-xl btn-gradient flex items-center justify-center gap-2 group mt-6 shadow-sm hover:opacity-90 transition-all active:scale-[0.98]"
                >
                  Continue
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                {/* Live Preview Card */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest block ml-1">Preview</label>
                  <div className="p-4 rounded-2xl border border-border/60 bg-accent/5 flex flex-col justify-between h-32 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-background/40 to-background/10 z-0" />
                    <div className="relative z-10 flex items-start gap-4">
                      <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-bold border shadow-inner bg-background transition-colors duration-300"
                        style={{ borderColor: `${color}40`, boxShadow: `0 4px 20px ${color}20`, color: color }}
                      >
                        {name ? name.charAt(0).toUpperCase() : '?'}
                      </div>
                      <div className="pt-1 min-w-0">
                        <div className="font-bold text-lg text-foreground truncate">{name || 'Subject Name'}</div>
                        <div className="text-xs text-muted-foreground font-medium line-clamp-1 mt-0.5">{description || 'No description added'}</div>
                      </div>
                    </div>
                    <div className="relative z-10 w-full h-1.5 bg-background/50 rounded-full mt-4 overflow-hidden border border-border/50">
                      <div className="h-full w-1/3 rounded-full transition-colors duration-300" style={{ backgroundColor: color }} />
                    </div>
                  </div>
                </div>

                {/* Color Selection */}
                <div className="space-y-3 pt-2">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest block ml-1">Choose Theme Color</label>
                  <div className="flex flex-wrap gap-3">
                    {CUSTOM_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${color === c ? 'scale-110 ring-2 ring-offset-2 ring-offset-background' : 'hover:scale-105 opacity-80 hover:opacity-100'}`}
                        style={{ backgroundColor: c, ringColor: c }}
                      >
                        {color === c && <Check className="w-5 h-5 text-white drop-shadow-md" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-6 border-t border-border/40">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-5 py-4 text-sm font-bold rounded-xl border border-border/80 hover:bg-accent/10 transition-colors flex-1"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="py-4 text-sm font-bold rounded-xl btn-gradient flex items-center justify-center gap-2 flex-[2] shadow-sm hover:opacity-90 transition-all active:scale-[0.98]"
                  >
                    {createMutation.isPending ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        Create Subject
                        <CheckCircle2 className="w-4 h-4" />
                      </>
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
