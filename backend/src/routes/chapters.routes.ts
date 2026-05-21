import { Router, Response } from 'express';
import Chapter from '../models/Chapter';
import Lesson from '../models/Lesson';
import Subject from '../models/Subject';
import KnowledgeNode from '../models/KnowledgeNode';
import { AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// Get chapters by subject
router.get('/subject/:subjectId', async (req: AuthRequest, res: Response) => {
  try {
    const chapters = await Chapter.find({
      subjectId: req.params.subjectId,
      userId: req.user!.id,
    }).sort({ order: 1 });
    res.json(chapters);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch chapters' });
  }
});

// Get single chapter
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const chapter = await Chapter.findById(req.params.id);
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
    const lastChapter = await Chapter.findOne({ subjectId: req.body.subjectId }).sort({ order: -1 });
    const order = lastChapter ? lastChapter.order + 1 : 0;

    const chapter = new Chapter({ ...req.body, userId, order });
    await chapter.save();

    // Update subject chapter count
    await Subject.findByIdAndUpdate(req.body.subjectId, { $inc: { totalChapters: 1 } });

    // Create knowledge node
    await new KnowledgeNode({
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
    const chapter = await Chapter.findById(req.params.id);
    if (!chapter || chapter.userId !== req.user!.id) {
      return res.status(404).json({ error: 'Chapter not found' });
    }

    const updated = await Chapter.findByIdAndUpdate(req.params.id, req.body, { new: true });

    await KnowledgeNode.findOneAndUpdate(
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
    const chapter = await Chapter.findById(req.params.id);
    if (!chapter || chapter.userId !== req.user!.id) {
      return res.status(404).json({ error: 'Chapter not found' });
    }

    const lessonCount = await Lesson.countDocuments({ chapterId: chapter._id });

    await Promise.all([
      Lesson.deleteMany({ chapterId: chapter._id }),
      KnowledgeNode.deleteMany({ chapterId: chapter._id }),
      Chapter.findByIdAndDelete(req.params.id),
      Subject.findByIdAndUpdate(chapter.subjectId, {
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
        Chapter.findByIdAndUpdate(item.id, { order: item.order })
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
    const chapter = await Chapter.findById(chapterId);
    if (!chapter || chapter.userId !== req.user!.id) {
      return res.status(404).json({ error: 'Chapter not found' });
    }

    const lessons = await Lesson.find({ chapterId });

    const totalLessons = lessons.length;
    const completedLessons = lessons.filter((l) => l.status === 'completed').length;
    const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
    const totalTimeSpent = lessons.reduce((acc, l) => acc + l.timeSpent, 0);

    const updated = await Chapter.findByIdAndUpdate(
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
