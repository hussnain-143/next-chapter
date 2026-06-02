import StudySession from '../models/StudySession';
import Lesson from '../models/Lesson';
import Subject from '../models/Subject';
import ExecutionLog from '../models/ExecutionLog';
import { syncUserGamification, recalculateSubjectStats } from './progress.service';

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date: Date) {
  const d = startOfDay(date);
  d.setDate(d.getDate() + 1);
  return d;
}

/** True if the user studied or completed learning work on this calendar day */
async function hasLearningActivityOnDay(userId: string, day: Date): Promise<boolean> {
  const dayStart = startOfDay(day);
  const dayEnd = endOfDay(day);

  const [session, log, completedLesson] = await Promise.all([
    StudySession.findOne({
      userId,
      startTime: { $gte: dayStart, $lt: dayEnd },
    }),
    ExecutionLog.findOne({
      userId,
      timestamp: { $gte: dayStart, $lt: dayEnd },
      action: { $in: ['completed', 'started', 'revised'] },
    }),
    Lesson.findOne({
      userId,
      completedAt: { $gte: dayStart, $lt: dayEnd },
    }),
  ]);

  return Boolean(session || log || completedLesson);
}

async function calculateStreak(userId: string): Promise<number> {
  const today = startOfDay(new Date());
  let streak = 0;
  const checkDate = new Date(today);

  // If nothing logged yet today, start counting from yesterday (day still in progress)
  const activeToday = await hasLearningActivityOnDay(userId, today);
  if (!activeToday) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  while (await hasLearningActivityOnDay(userId, checkDate)) {
    streak++;
    checkDate.setDate(checkDate.getDate() - 1);
  }

  return streak;
}

function groupSessionsByDay(
  sessions: { startTime: Date | string; duration: number; pomodoroCount?: number }[]
) {
  const groups: Record<string, { _id: string; totalDuration: number; sessionCount: number; pomodoroCount: number }> = {};

  sessions.forEach((session) => {
    const dateStr = new Date(session.startTime).toISOString().split('T')[0];
    if (!groups[dateStr]) {
      groups[dateStr] = { _id: dateStr, totalDuration: 0, sessionCount: 0, pomodoroCount: 0 };
    }
    groups[dateStr].totalDuration += session.duration || 0;
    groups[dateStr].sessionCount += 1;
    groups[dateStr].pomodoroCount += session.pomodoroCount || 0;
  });

  return Object.values(groups).sort((a, b) => a._id.localeCompare(b._id));
}

export const getDashboardStats = async (userId: string) => {
  let subjects = await Subject.find({ userId, isArchived: false });

  // Refresh stored progress counters so dashboard bars stay accurate
  await Promise.all(subjects.map((s) => recalculateSubjectStats(String(s._id))));
  subjects = await Subject.find({ userId, isArchived: false });

  const [lessons, sessions, recentLogs] = await Promise.all([
    Lesson.find({ userId }),
    StudySession.find({ userId }),
    ExecutionLog.find({ userId }).sort({ timestamp: -1 }).limit(20),
  ]);

  const totalSubjects = subjects.length;
  const totalLessons = lessons.length;
  const completedLessons = lessons.filter((l) => l.status === 'completed').length;
  const inProgressLessons = lessons.filter((l) => l.status === 'in-progress' || l.status === 'started').length;

  const sessionTime = sessions.reduce((acc, s) => acc + (s.duration || 0), 0);
  const lessonTime = lessons.reduce((acc, l) => acc + (l.timeSpent || 0), 0);
  const totalTimeSpent = sessionTime + lessonTime;
  const totalXP = lessons.reduce((acc, l) => acc + (l.xpEarned || 0), 0);

  const streak = await calculateStreak(userId);
  await syncUserGamification(userId, streak);

  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const sessionsInYear = sessions.filter((s) => new Date(s.startTime) >= oneYearAgo);
  const sessionsInWeek = sessions.filter((s) => new Date(s.startTime) >= weekAgo);

  const heatmapData = groupSessionsByDay(sessionsInYear);
  const weeklyData = groupSessionsByDay(sessionsInWeek);

  const subjectProgress = subjects.map((s) => ({
    id: s._id,
    name: s.name,
    color: s.color,
    icon: s.icon,
    progress: s.progressPercent ?? 0,
    totalLessons: s.totalLessons ?? 0,
    completedLessons: s.completedLessons ?? 0,
  }));

  const completionRate = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const activeDays = heatmapData.filter((d) => d.totalDuration > 0).length;
  const avgDailyTime = activeDays > 0 ? totalTimeSpent / activeDays : 0;
  const productivityScore = Math.min(
    100,
    Math.round((avgDailyTime / 3600) * 40 + completionRateBoost(completedLessons, totalLessons))
  );

  return {
    totalSubjects,
    totalLessons,
    completedLessons,
    inProgressLessons,
    totalTimeSpent,
    totalXP,
    streak,
    userLevel: Math.max(1, Math.floor(totalXP / 1000) + 1),
    productivityScore,
    completionRate,
    heatmapData,
    weeklyData,
    subjectProgress,
    recentActivity: recentLogs,
  };
};

function completionRateBoost(completed: number, total: number) {
  if (total === 0) return 0;
  return (completed / total) * 30;
}

export const getWeeklyReport = async (userId: string) => {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const [sessions, completedLessons, logs] = await Promise.all([
    StudySession.find({ userId, startTime: { $gte: weekAgo } }),
    Lesson.find({ userId, completedAt: { $gte: weekAgo } }),
    ExecutionLog.find({ userId, timestamp: { $gte: weekAgo } }),
  ]);

  return {
    totalStudyTime: sessions.reduce((acc, s) => acc + s.duration, 0),
    sessionsCompleted: sessions.length,
    lessonsCompleted: completedLessons.length,
    totalPomodoros: sessions.reduce((acc, s) => acc + s.pomodoroCount, 0),
    totalActions: logs.length,
    averageSessionLength: sessions.length > 0
      ? sessions.reduce((acc, s) => acc + s.duration, 0) / sessions.length
      : 0,
  };
};

export const getSubjectAnalytics = async (subjectId: string, userId: string) => {
  const lessons = await Lesson.find({ subjectId, userId });

  const statusBreakdown = {
    pending: lessons.filter((l) => l.status === 'pending').length,
    started: lessons.filter((l) => l.status === 'started').length,
    'in-progress': lessons.filter((l) => l.status === 'in-progress').length,
    revision: lessons.filter((l) => l.status === 'revision').length,
    completed: lessons.filter((l) => l.status === 'completed').length,
  };

  const avgMastery = lessons.length > 0
    ? lessons.reduce((acc, l) => acc + l.masteryScore, 0) / lessons.length
    : 0;

  return {
    totalLessons: lessons.length,
    statusBreakdown,
    averageMastery: Math.round(avgMastery),
    totalTimeSpent: lessons.reduce((acc, l) => acc + l.timeSpent, 0),
    bookmarkedCount: lessons.filter((l) => l.isBookmarked).length,
  };
};
