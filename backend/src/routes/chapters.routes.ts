import { Router, Response } from 'express';
import Chapter from '../models/Chapter';
import Lesson from '../models/Lesson';
import Subject from '../models/Subject';
import KnowledgeNode from '../models/KnowledgeNode';
import { AuthRequest } from '../middleware/auth.middleware';
import { recalculateChapterStats } from '../services/progress.service';

const router = Router();

// Get chapters by subject
router.get('/subject/:subjectId', async (req: AuthRequest, res: Response) => {
  try {
    const chapters = await (Chapter as any).find({
      subjectId: req.params.subjectId,
      userId: req.user!.id,
    }).sort({ order: 1 });

    await Promise.all(chapters.map((ch: { _id: string }) => recalculateChapterStats(String(ch._id))));

    const refreshed = await (Chapter as any).find({
      subjectId: req.params.subjectId,
      userId: req.user!.id,
    }).sort({ order: 1 });

    res.json(refreshed);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch chapters' });
  }
});

// Get single chapter
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const chapter = await (Chapter as any).findById(req.params.id);
    if (!chapter || chapter.userId !== req.user!.id) {
      return res.status(404).json({ error: 'Chapter not found' });
    }
    res.json(chapter);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch chapter' });
  }
});

// Create chapter
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const lastChapter = await (Chapter as any).findOne({ subjectId: req.body.subjectId }).sort({ order: -1 });
    const order = lastChapter ? lastChapter.order + 1 : 0;

    const chapter = new (Chapter as any)({ ...req.body, userId, order });
    await chapter.save();

    // Update subject chapter count
    await (Subject as any).findByIdAndUpdate(req.body.subjectId, { $inc: { totalChapters: 1 } });

    // Create knowledge node
    await new (KnowledgeNode as any)({
      userId,
      subjectId: req.body.subjectId,
      chapterId: chapter._id,
      type: 'chapter',
      label: chapter.title,
    }).save();

    res.status(201).json(chapter);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create chapter' });
  }
});

// Update chapter
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const chapter = await (Chapter as any).findById(req.params.id);
    if (!chapter || chapter.userId !== req.user!.id) {
      return res.status(404).json({ error: 'Chapter not found' });
    }

    const updated = await (Chapter as any).findByIdAndUpdate(req.params.id, req.body, { new: true });

    await (KnowledgeNode as any).findOneAndUpdate(
      { chapterId: chapter._id, type: 'chapter' },
      { label: updated!.title }
    );

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update chapter' });
  }
});

// Delete chapter (cascade)
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const chapter = await (Chapter as any).findById(req.params.id);
    if (!chapter || chapter.userId !== req.user!.id) {
      return res.status(404).json({ error: 'Chapter not found' });
    }

    const lessonCount = await (Lesson as any).countDocuments({ chapterId: chapter._id });

    await Promise.all([
      (Lesson as any).deleteMany({ chapterId: chapter._id }),
      (KnowledgeNode as any).deleteMany({ chapterId: chapter._id }),
      (Chapter as any).findByIdAndDelete(req.params.id),
      (Subject as any).findByIdAndUpdate(chapter.subjectId, {
        $inc: { totalChapters: -1, totalLessons: -lessonCount },
      }),
    ]);

    res.json({ message: 'Chapter deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete chapter' });
  }
});

// Reorder chapters
router.put('/reorder/:subjectId', async (req: AuthRequest, res: Response) => {
  try {
    const { order } = req.body; // array of { id, order }
    await Promise.all(
      order.map((item: { id: string; order: number }) =>
        (Chapter as any).findByIdAndUpdate(item.id, { order: item.order })
      )
    );
    res.json({ message: 'Chapters reordered' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reorder chapters' });
  }
});

// Recalculate chapter stats
router.post('/:id/recalculate', async (req: AuthRequest, res: Response) => {
  try {
    const chapterId = req.params.id;
    const chapter = await (Chapter as any).findById(chapterId);
    if (!chapter || chapter.userId !== req.user!.id) {
      return res.status(404).json({ error: 'Chapter not found' });
    }

    const lessons = await (Lesson as any).find({ chapterId });

    const totalLessons = lessons.length;
    const completedLessons = lessons.filter((l: any) => l.status === 'completed').length;
    const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
    const totalTimeSpent = lessons.reduce((acc: number, l: any) => acc + l.timeSpent, 0);

    const updated = await (Chapter as any).findByIdAndUpdate(
      chapterId,
      { totalLessons, completedLessons, progressPercent, totalTimeSpent },
      { new: true }
    );

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to recalculate stats' });
  }
});

export default router;
