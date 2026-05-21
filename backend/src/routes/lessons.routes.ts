import { Router, Response } from 'express';
import Lesson from '../models/Lesson';
import Chapter from '../models/Chapter';
import Subject from '../models/Subject';
import ExecutionLog from '../models/ExecutionLog';
import KnowledgeNode from '../models/KnowledgeNode';
import { AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// Get lessons by chapter
router.get('/chapter/:chapterId', async (req: AuthRequest, res: Response) => {
  try {
    const lessons = await Lesson.find({
      chapterId: req.params.chapterId,
      userId: req.user!.id,
    }).sort({ order: 1 });
    res.json(lessons);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch lessons' });
  }
});

// Get bookmarked lessons
router.get('/bookmarked', async (req: AuthRequest, res: Response) => {
  try {
    const lessons = await Lesson.find({ userId: req.user!.id, isBookmarked: true })
      .populate('chapterId')
      .sort({ updatedAt: -1 });
    res.json(lessons);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bookmarked lessons' });
  }
});

// Get lessons due for review (spaced repetition)
router.get('/due-review', async (req: AuthRequest, res: Response) => {
  try {
    const now = new Date();
    const lessons = await Lesson.find({
      userId: req.user!.id,
      nextReviewAt: { $lte: now },
      status: { $in: ['completed', 'revision'] },
    }).sort({ nextReviewAt: 1 });
    res.json(lessons);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch review lessons' });
  }
});

// Full text search
router.get('/search', async (req: AuthRequest, res: Response) => {
  try {
    const query = req.query.q as string;
    if (!query) return res.json([]);

    const lessons = await Lesson.find(
      { userId: req.user!.id, $text: { $search: query } },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(20);
    res.json(lessons);
  } catch (error) {
    res.status(500).json({ error: 'Search failed' });
  }
});

// Get single lesson
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson || lesson.userId !== req.user!.id) {
      return res.status(404).json({ error: 'Lesson not found' });
    }
    res.json(lesson);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch lesson' });
  }
});

// Create lesson
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const chapter = await Chapter.findById(req.body.chapterId);
    if (!chapter) return res.status(404).json({ error: 'Chapter not found' });

    const lastLesson = await Lesson.findOne({ chapterId: req.body.chapterId }).sort({ order: -1 });
    const order = lastLesson ? lastLesson.order + 1 : 0;

    const lesson = new Lesson({
      ...req.body,
      userId,
      subjectId: chapter.subjectId,
      order,
    });
    await lesson.save();

    // Update counts
    await Promise.all([
      Chapter.findByIdAndUpdate(req.body.chapterId, { $inc: { totalLessons: 1 } }),
      Subject.findByIdAndUpdate(chapter.subjectId, { $inc: { totalLessons: 1 } }),
    ]);

    // Knowledge node
    await new KnowledgeNode({
      userId,
      subjectId: chapter.subjectId,
      chapterId: chapter._id,
      lessonId: lesson._id,
      type: 'lesson',
      label: lesson.title,
    }).save();

    // Execution log
    await new ExecutionLog({
      userId,
      lessonId: lesson._id,
      subjectId: chapter.subjectId,
      chapterId: chapter._id,
      action: 'started',
      notes: `Created lesson: ${lesson.title}`,
    }).save();

    res.status(201).json(lesson);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create lesson' });
  }
});

// Update lesson
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const oldLesson = await Lesson.findById(req.params.id);
    if (!oldLesson || oldLesson.userId !== userId) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    const lesson = await Lesson.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!lesson) return res.status(404).json({ error: 'Lesson not found' });

    // Track status changes
    if (req.body.status && req.body.status !== oldLesson.status) {
      let xpGain = 0;
      const updates: any = {};

      if (req.body.status === 'started' && !oldLesson.startedAt) {
        updates.startedAt = new Date();
        xpGain = 5;
      } else if (req.body.status === 'completed') {
        updates.completedAt = new Date();
        xpGain = 25;

        // Set next review (spaced repetition - review in 1 day)
        const nextReview = new Date();
        nextReview.setDate(nextReview.getDate() + 1);
        updates.nextReviewAt = nextReview;
        updates.reviewCount = (oldLesson.reviewCount || 0) + 1;
      } else if (req.body.status === 'revision') {
        // Increase interval: 1, 3, 7, 14, 30 days
        const intervals = [1, 3, 7, 14, 30];
        const idx = Math.min(oldLesson.reviewCount || 0, intervals.length - 1);
        const nextReview = new Date();
        nextReview.setDate(nextReview.getDate() + intervals[idx]);
        updates.nextReviewAt = nextReview;
        updates.lastReviewedAt = new Date();
        updates.reviewCount = (oldLesson.reviewCount || 0) + 1;
        xpGain = 10;
      }

      if (xpGain > 0) {
        updates.xpEarned = (oldLesson.xpEarned || 0) + xpGain;
      }

      if (Object.keys(updates).length > 0) {
        await Lesson.findByIdAndUpdate(req.params.id, updates);
      }

      // Log execution
      await new ExecutionLog({
        userId,
        lessonId: lesson._id,
        subjectId: lesson.subjectId,
        chapterId: lesson.chapterId,
        action: req.body.status === 'completed' ? 'completed' : req.body.status === 'revision' ? 'revised' : 'started',
        notes: `Status changed: ${oldLesson.status} → ${req.body.status}`,
      }).save();
    }

    // Update knowledge node
    await KnowledgeNode.findOneAndUpdate(
      { lessonId: lesson._id, type: 'lesson' },
      { label: lesson.title, masteryScore: lesson.masteryScore }
    );

    res.json(lesson);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update lesson' });
  }
});

// Toggle bookmark
router.patch('/:id/bookmark', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson || lesson.userId !== userId) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    lesson.isBookmarked = !lesson.isBookmarked;
    await lesson.save();

    if (lesson.isBookmarked) {
      await new ExecutionLog({
        userId,
        lessonId: lesson._id,
        subjectId: lesson.subjectId,
        chapterId: lesson.chapterId,
        action: 'bookmarked',
      }).save();
    }

    res.json(lesson);
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle bookmark' });
  }
});

// Delete lesson
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson || lesson.userId !== req.user!.id) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    await Promise.all([
      Lesson.findByIdAndDelete(req.params.id),
      Chapter.findByIdAndUpdate(lesson.chapterId, { $inc: { totalLessons: -1 } }),
      Subject.findByIdAndUpdate(lesson.subjectId, { $inc: { totalLessons: -1 } }),
      KnowledgeNode.deleteMany({ lessonId: lesson._id }),
    ]);

    res.json({ message: 'Lesson deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete lesson' });
  }
});

export default router;
