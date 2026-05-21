import StudySession from '../models/StudySession';
import Lesson from '../models/Lesson';
import Subject from '../models/Subject';
import ExecutionLog from '../models/ExecutionLog';
import mongoose from 'mongoose';

const DEFAULT_USER_ID = 'default-user';

export const getDashboardStats = async (userId: string = DEFAULT_USER_ID) => {
  const [subjects, lessons, sessions, recentLogs] = await Promise.all([
    Subject.find({ userId, isArchived: false }),
    Lesson.find({ userId }),
    StudySession.find({ userId }),
    ExecutionLog.find({ userId }).sort({ timestamp: -1 }).limit(20),
  ]);

  const totalSubjects = subjects.length;
  const totalLessons = lessons.length;
  const completedLessons = lessons.filter((l) => l.status === 'completed').length;
  const inProgressLessons = lessons.filter((l) => l.status === 'in-progress').length;
  const totalTimeSpent = sessions.reduce((acc, s) => acc + s.duration, 0);
  const totalXP = lessons.reduce((acc, l) => acc + l.xpEarned, 0);

  // Calculate streak
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let streak = 0;
  const checkDate = new Date(today);

  while (true) {
    const dayStart = new Date(checkDate);
    const dayEnd = new Date(checkDate);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const hasSession = await StudySession.findOne({
      userId,
      startTime: { $gte: dayStart, $lt: dayEnd },
    });

    if (hasSession) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  // Heatmap data (last 365 days)
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const heatmapData = await StudySession.aggregate([
    {
      $match: {
        userId,
        startTime: { $gte: oneYearAgo },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$startTime' },
        },
        totalDuration: { $sum: '$duration' },
        sessionCount: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Weekly data (last 7 days)
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const weeklyData = await StudySession.aggregate([
    {
      $match: {
        userId,
        startTime: { $gte: weekAgo },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$startTime' },
        },
        totalDuration: { $sum: '$duration' },
        sessionCount: { $sum: 1 },
        pomodoroCount: { $sum: '$pomodoroCount' },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Subject progress
  const subjectProgress = subjects.map((s) => ({
    id: s._id,
    name: s.name,
    color: s.color,
    icon: s.icon,
    progress: s.progressPercent,
    totalLessons: s.totalLessons,
    completedLessons: s.completedLessons,
  }));

  // Productivity score (0-100)
  const avgDailyTime = totalTimeSpent / Math.max(heatmapData.length, 1);
  const productivityScore = Math.min(100, Math.round((avgDailyTime / 3600) * 33.33));

  return {
    totalSubjects,
    totalLessons,
    completedLessons,
    inProgressLessons,
    totalTimeSpent,
    totalXP,
    streak,
    productivityScore,
    completionRate: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
    heatmapData,
    weeklyData,
    subjectProgress,
    recentActivity: recentLogs,
  };
};

export const getWeeklyReport = async (userId: string = DEFAULT_USER_ID) => {
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

export const getSubjectAnalytics = async (subjectId: string, userId: string = DEFAULT_USER_ID) => {
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
