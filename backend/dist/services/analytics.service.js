"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSubjectAnalytics = exports.getWeeklyReport = exports.getDashboardStats = void 0;
const StudySession_1 = __importDefault(require("../models/StudySession"));
const Lesson_1 = __importDefault(require("../models/Lesson"));
const Subject_1 = __importDefault(require("../models/Subject"));
const ExecutionLog_1 = __importDefault(require("../models/ExecutionLog"));
const DEFAULT_USER_ID = 'default-user';
const getDashboardStats = async (userId = DEFAULT_USER_ID) => {
    const [subjects, lessons, sessions, recentLogs] = await Promise.all([
        Subject_1.default.find({ userId, isArchived: false }),
        Lesson_1.default.find({ userId }),
        StudySession_1.default.find({ userId }),
        ExecutionLog_1.default.find({ userId }).sort({ timestamp: -1 }).limit(20),
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
        const hasSession = await StudySession_1.default.findOne({
            userId,
            startTime: { $gte: dayStart, $lt: dayEnd },
        });
        if (hasSession) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
        }
        else {
            break;
        }
    }
    // Heatmap data (last 365 days)
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const heatmapData = await StudySession_1.default.aggregate([
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
    const weeklyData = await StudySession_1.default.aggregate([
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
exports.getDashboardStats = getDashboardStats;
const getWeeklyReport = async (userId = DEFAULT_USER_ID) => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const [sessions, completedLessons, logs] = await Promise.all([
        StudySession_1.default.find({ userId, startTime: { $gte: weekAgo } }),
        Lesson_1.default.find({ userId, completedAt: { $gte: weekAgo } }),
        ExecutionLog_1.default.find({ userId, timestamp: { $gte: weekAgo } }),
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
exports.getWeeklyReport = getWeeklyReport;
const getSubjectAnalytics = async (subjectId, userId = DEFAULT_USER_ID) => {
    const lessons = await Lesson_1.default.find({ subjectId, userId });
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
exports.getSubjectAnalytics = getSubjectAnalytics;
//# sourceMappingURL=analytics.service.js.map