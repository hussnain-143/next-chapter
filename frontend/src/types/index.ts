export type LessonStatus = 'pending' | 'started' | 'in-progress' | 'revision' | 'completed';

export interface ICodeSnippet {
  language: string;
  code: string;
  title: string;
}

export interface IResource {
  title: string;
  url: string;
  type: 'link' | 'file' | 'video' | 'article';
}

export interface ILesson {
  _id: string;
  chapterId: string;
  subjectId: string;
  userId: string;
  title: string;
  content: string;
  status: LessonStatus;
  codeSnippets: ICodeSnippet[];
  resources: IResource[];
  timeSpent: number;
  xpEarned: number;
  isBookmarked: boolean;
  order: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  notes: string;
  summary: string;
  tags: string[];
  lastReviewedAt: string | null;
  nextReviewAt: string | null;
  reviewCount: number;
  masteryScore: number;
  completedAt: string | null;
  startedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IChapter {
  _id: string;
  subjectId: string;
  userId: string;
  title: string;
  description: string;
  order: number;
  totalLessons: number;
  completedLessons: number;
  progressPercent: number;
  totalTimeSpent: number;
  isLocked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ISubject {
  _id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  userId: string;
  totalChapters: number;
  completedChapters: number;
  totalLessons: number;
  completedLessons: number;
  progressPercent: number;
  totalTimeSpent: number;
  xpEarned: number;
  tags: string[];
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IStudySession {
  _id: string;
  userId: string;
  lessonId?: { _id: string; title: string };
  subjectId?: { _id: string; name: string; color: string };
  chapterId?: { _id: string; title: string };
  duration: number;
  pomodoroCount: number;
  startTime: string;
  endTime: string;
  type: 'study' | 'review' | 'quiz' | 'practice';
  notes: string;
  createdAt: string;
}

export interface IExecutionLog {
  _id: string;
  userId: string;
  lessonId?: { _id: string; title: string };
  subjectId?: { _id: string; name: string; color: string; icon: string };
  chapterId?: { _id: string; title: string };
  action: 'started' | 'paused' | 'resumed' | 'completed' | 'revised' | 'bookmarked' | 'quiz_taken' | 'note_added' | 'code_added';
  duration: number;
  timestamp: string;
  notes: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface ILearningPath {
  _id: string;
  userId: string;
  title: string;
  lessonIds: { _id: string; title: string; status: LessonStatus; masteryScore: number }[];
  scheduledDates: string[];
  spacedRepetitionInterval: number[];
  nextReviewAt: string | null;
  isActive: boolean;
  completedCount: number;
  totalCount: number;
  createdAt: string;
}

export interface IDashboardStats {
  totalSubjects: number;
  totalLessons: number;
  completedLessons: number;
  inProgressLessons: number;
  totalTimeSpent: number;
  totalXP: number;
  streak: number;
  productivityScore: number;
  completionRate: number;
  heatmapData: { _id: string; totalDuration: number; sessionCount: number }[];
  weeklyData: { _id: string; totalDuration: number; sessionCount: number; pomodoroCount: number }[];
  subjectProgress: {
    id: string;
    name: string;
    color: string;
    icon: string;
    progress: number;
    totalLessons: number;
    completedLessons: number;
  }[];
  recentActivity: IExecutionLog[];
}

export interface IWeeklyReport {
  totalStudyTime: number;
  sessionsCompleted: number;
  lessonsCompleted: number;
  totalPomodoros: number;
  totalActions: number;
  averageSessionLength: number;
}
