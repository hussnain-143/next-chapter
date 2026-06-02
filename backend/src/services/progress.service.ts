import Chapter from '../models/Chapter';
import Subject from '../models/Subject';
import Lesson from '../models/Lesson';
import User from '../models/User';
import KnowledgeNode from '../models/KnowledgeNode';

export async function recalculateChapterStats(chapterId: string) {
  const lessons = await Lesson.find({ chapterId });
  const totalLessons = lessons.length;
  const completedLessons = lessons.filter((l) => l.status === 'completed').length;
  const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const totalTimeSpent = lessons.reduce((acc, l) => acc + (l.timeSpent || 0), 0);

  return Chapter.findByIdAndUpdate(
    chapterId,
    { totalLessons, completedLessons, progressPercent, totalTimeSpent },
    { new: true }
  );
}

export async function recalculateSubjectStats(subjectId: string) {
  const chapters = await Chapter.find({ subjectId });
  const lessons = await Lesson.find({ subjectId });

  const totalChapters = chapters.length;
  const completedChapters = chapters.filter((c) => c.progressPercent === 100).length;
  const totalLessons = lessons.length;
  const completedLessons = lessons.filter((l) => l.status === 'completed').length;
  const totalTimeSpent = lessons.reduce((acc, l) => acc + (l.timeSpent || 0), 0);
  const xpEarned = lessons.reduce((acc, l) => acc + (l.xpEarned || 0), 0);
  const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  const updated = await Subject.findByIdAndUpdate(
    subjectId,
    {
      totalChapters,
      completedChapters,
      totalLessons,
      completedLessons,
      progressPercent,
      totalTimeSpent,
      xpEarned,
    },
    { new: true }
  );

  await KnowledgeNode.findOneAndUpdate(
    { subjectId, type: 'subject' },
    { masteryScore: progressPercent }
  );

  return updated;
}

export async function recalculateLessonHierarchy(chapterId: string, subjectId: string) {
  await recalculateChapterStats(chapterId);
  await recalculateSubjectStats(subjectId);
}

/** Keep User.xp / level in sync with lesson XP totals */
export async function syncUserGamification(userId: string, streak?: number) {
  const lessons = await Lesson.find({ userId });
  const totalXP = lessons.reduce((acc, l) => acc + (l.xpEarned || 0), 0);
  const level = Math.max(1, Math.floor(totalXP / 1000) + 1);

  const update: Record<string, number> = { xp: totalXP, level };
  if (typeof streak === 'number') update.streak = streak;

  return (User as any).findByIdAndUpdate(userId, update, { new: true });
}
