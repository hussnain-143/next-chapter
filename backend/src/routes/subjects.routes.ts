import { Router, Response } from 'express';
import Subject from '../models/Subject';
import Chapter from '../models/Chapter';
import Lesson from '../models/Lesson';
import KnowledgeNode from '../models/KnowledgeNode';
import { AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// Get all subjects
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const subjects = await Subject.find({ userId, isArchived: false }).sort({ order: 1, createdAt: -1 });
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
});

// Get single subject
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject || subject.userId !== req.user!.id) {
      return res.status(404).json({ error: 'Subject not found' });
    }
    res.json(subject);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch subject' });
  }
});

// Create subject
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const count = await Subject.countDocuments({ userId });
    const subject = new Subject({ ...req.body, userId, order: count });
    await subject.save();

    // Create knowledge graph node
    await new KnowledgeNode({
      userId,
      subjectId: subject._id,
      type: 'subject',
      label: subject.name,
      masteryScore: 0,
    }).save();

    res.status(201).json(subject);
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Subject with this name already exists' });
    }
    res.status(500).json({ error: 'Failed to create subject' });
  }
});

// Update subject
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject || subject.userId !== req.user!.id) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    const updated = await Subject.findByIdAndUpdate(req.params.id, req.body, { new: true });

    // Update knowledge node label
    await KnowledgeNode.findOneAndUpdate(
      { subjectId: subject._id, type: 'subject' },
      { label: updated!.name }
    );

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update subject' });
  }
});

// Delete subject (cascade)
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const subjectId = req.params.id;
    const subject = await Subject.findById(subjectId);
    if (!subject || subject.userId !== req.user!.id) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    const chapters = await Chapter.find({ subjectId });
    const chapterIds = chapters.map((c) => c._id);

    await Promise.all([
      Lesson.deleteMany({ chapterId: { $in: chapterIds } }),
      Chapter.deleteMany({ subjectId }),
      KnowledgeNode.deleteMany({ subjectId }),
      Subject.findByIdAndDelete(subjectId),
    ]);

    res.json({ message: 'Subject deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete subject' });
  }
});

// Reorder subjects — accepts { order: [{ id, order }] }
router.put('/reorder', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { order } = req.body as { order: { id: string; order: number }[] };
    if (!Array.isArray(order)) return res.status(400).json({ error: 'order must be an array' });

    await Promise.all(
      order.map((item) =>
        Subject.findOneAndUpdate({ _id: item.id, userId }, { order: item.order })
      )
    );
    res.json({ message: 'Subjects reordered' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reorder subjects' });
  }
});

// Recalculate subject stats
router.post('/:id/recalculate', async (req: AuthRequest, res: Response) => {
  try {
    const subjectId = req.params.id;
    const userId = req.user!.id;

    const subject = await Subject.findById(subjectId);
    if (!subject || subject.userId !== userId) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    const chapters = await Chapter.find({ subjectId });
    const lessons = await Lesson.find({ subjectId });

    const totalChapters = chapters.length;
    const completedChapters = chapters.filter((c) => c.progressPercent === 100).length;
    const totalLessons = lessons.length;
    const completedLessons = lessons.filter((l) => l.status === 'completed').length;
    const totalTimeSpent = lessons.reduce((acc, l) => acc + l.timeSpent, 0);
    const xpEarned = lessons.reduce((acc, l) => acc + l.xpEarned, 0);
    const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    const updated = await Subject.findByIdAndUpdate(
      subjectId,
      { totalChapters, completedChapters, totalLessons, completedLessons, progressPercent, totalTimeSpent, xpEarned },
      { new: true }
    );

    // Update knowledge node mastery
    await KnowledgeNode.findOneAndUpdate(
      { subjectId, type: 'subject', userId },
      { masteryScore: progressPercent }
    );

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to recalculate stats' });
  }
});

export default router;
