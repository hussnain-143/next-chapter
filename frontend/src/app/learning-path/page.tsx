'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDueReviewLessons, updateLesson } from '../../lib/api';
import { 
  Calendar, 
  CheckCircle, 
  RotateCw, 
  HelpCircle,
  ExternalLink,
  Sparkles,
  BookOpen
} from 'lucide-react';
import Link from 'next/link';

export default function LearningPath() {
  const queryClient = useQueryClient();

  const { data: dueLessons = [], isLoading } = useQuery({
    queryKey: ['dueReviewLessons'],
    queryFn: getDueReviewLessons,
  });

  const reviewMutation = useMutation({
    mutationFn: (lessonId: string) => updateLesson(lessonId, { status: 'revision' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dueReviewLessons'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    },
  });

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'beginner': return 'bg-accent/10 text-accent border-accent/20';
      case 'intermediate': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'advanced': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Spaced Repetition Scheduler <Calendar className="w-5.5 h-5.5 text-primary" />
          </h2>
          <p className="text-sm text-muted-foreground">Smart learning path intervals designed to review topics before you forget them.</p>
        </div>
      </div>

      {/* Spaced repetition logic card */}
      <div className="p-6 border border-primary/20 bg-primary/5 rounded-3xl space-y-3">
        <h3 className="text-sm font-bold text-primary uppercase tracking-widest flex items-center gap-1.5">
          <Sparkles className="w-4.5 h-4.5" />
          <span>Intelligent Spaced Repetition (SuperMemo-2 SM2)</span>
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Topics you complete are automatically added to your spaced repetition pipeline. Each time you revise a lesson, the scheduling intervals double (e.g. 1 day → 3 days → 7 days → 14 days → 30 days) to lock the concepts into your long-term memory.
        </p>
      </div>

      {/* Due for review section */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-foreground uppercase tracking-widest px-1">Review Queue</h3>

        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-accent/20 rounded-2xl"></div>
            ))}
          </div>
        ) : dueLessons.length === 0 ? (
          <div className="glass-card rounded-3xl p-16 text-center space-y-4 max-w-md mx-auto">
            <div className="w-12 h-12 bg-accent/10 text-accent rounded-xl flex items-center justify-center mx-auto border border-accent/20">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-foreground">All caught up!</h3>
              <p className="text-xs text-muted-foreground">No lessons are currently due for review. Keep studying!</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dueLessons.map((lesson) => (
              <div
                key={lesson._id}
                className="glass-card rounded-2xl p-5 hover:translate-y-[-2px] hover:shadow-md transition-all duration-300 flex flex-col justify-between h-44"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-start gap-4">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase ${getDifficultyColor(lesson.difficulty)}`}>
                      {lesson.difficulty}
                    </span>
                    <span className="text-[10px] text-red-500 font-bold font-mono uppercase bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded">
                      Overdue
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-foreground truncate">{lesson.title}</h4>
                  <p className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed">
                    Last reviewed {lesson.lastReviewedAt ? new Date(lesson.lastReviewedAt).toLocaleDateString() : 'Never'}. Spaced interval: {lesson.reviewCount} iterations.
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-border/40 pt-3 mt-3">
                  <Link
                    href={`/subjects/${lesson.subjectId}/${lesson.chapterId}/${lesson._id}`}
                    className="text-[10px] text-muted-foreground hover:text-foreground font-semibold flex items-center gap-1"
                  >
                    <span>Open Lesson</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>

                  <button
                    onClick={() => reviewMutation.mutate(lesson._id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-[10px] font-semibold hover:bg-primary/95 transition duration-200"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Log Revision</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
