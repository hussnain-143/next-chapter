import { Router, Request, Response } from 'express';
import Subject from '../models/Subject';
import Chapter from '../models/Chapter';
import Lesson from '../models/Lesson';
import KnowledgeNode from '../models/KnowledgeNode';

const router = Router();
const USER_ID = 'default-user';

// Get all subjects
router.get('/', async (_req: Request, res: Response) => {
  try {
    const subjects = await Subject.find({ userId: USER_ID, isArchived: false }).sort({ createdAt: -1 });
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
});

// Get single subject
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) return res.status(404).json({ error: 'Subject not found' });
    res.json(subject);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch subject' });
  }
});

// Create subject
router.post('/', async (req: Request, res: Response) => {
  try {
    const subject = new Subject({ ...req.body, userId: USER_ID });
    await subject.save();

    // Create knowledge graph node
    await new KnowledgeNode({
      userId: USER_ID,
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
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!subject) return res.status(404).json({ error: 'Subject not found' });

    // Update knowledge node label
    await KnowledgeNode.findOneAndUpdate(
      { subjectId: subject._id, type: 'subject' },
      { label: subject.name }
    );

    res.json(subject);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update subject' });
  }
});

// Delete subject (cascade)
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const subjectId = req.params.id;
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

// Recalculate subject stats
router.post('/:id/recalculate', async (req: Request, res: Response) => {
  try {
    const subjectId = req.params.id;
    const chapters = await Chapter.find({ subjectId });
    const lessons = await Lesson.find({ subjectId });

    const totalChapters = chapters.length;
    const completedChapters = chapters.filter((c) => c.progressPercent === 100).length;
    const totalLessons = lessons.length;
    const completedLessons = lessons.filter((l) => l.status === 'completed').length;
    const totalTimeSpent = lessons.reduce((acc, l) => acc + l.timeSpent, 0);
    const xpEarned = lessons.reduce((acc, l) => acc + l.xpEarned, 0);
    const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    const subject = await Subject.findByIdAndUpdate(
      subjectId,
      { totalChapters, completedChapters, totalLessons, completedLessons, progressPercent, totalTimeSpent, xpEarned },
      { new: true }
    );

    // Update knowledge node mastery
    await KnowledgeNode.findOneAndUpdate(
      { subjectId, type: 'subject', userId: USER_ID },
      { masteryScore: progressPercent }
    );

    res.json(subject);
  } catch (error) {
    res.status(500).json({ error: 'Failed to recalculate stats' });
  }
});

export default router;
