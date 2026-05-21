import mongoose from 'mongoose';
export declare const getDashboardStats: (userId?: string) => Promise<{
    totalSubjects: number;
    totalLessons: number;
    completedLessons: number;
    inProgressLessons: number;
    totalTimeSpent: number;
    totalXP: number;
    streak: number;
    productivityScore: number;
    completionRate: number;
    heatmapData: any[];
    weeklyData: any[];
    subjectProgress: {
        id: mongoose.Types.ObjectId;
        name: string;
        color: string;
        icon: string;
        progress: number;
        totalLessons: number;
        completedLessons: number;
    }[];
    recentActivity: (mongoose.Document<unknown, {}, import("../models/ExecutionLog").IExecutionLog, {}, {}> & import("../models/ExecutionLog").IExecutionLog & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    })[];
}>;
export declare const getWeeklyReport: (userId?: string) => Promise<{
    totalStudyTime: number;
    sessionsCompleted: number;
    lessonsCompleted: number;
    totalPomodoros: number;
    totalActions: number;
    averageSessionLength: number;
}>;
export declare const getSubjectAnalytics: (subjectId: string, userId?: string) => Promise<{
    totalLessons: number;
    statusBreakdown: {
        pending: number;
        started: number;
        'in-progress': number;
        revision: number;
        completed: number;
    };
    averageMastery: number;
    totalTimeSpent: number;
    bookmarkedCount: number;
}>;
//# sourceMappingURL=analytics.service.d.ts.map