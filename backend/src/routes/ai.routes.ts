import { Router, Response } from 'express';
import Lesson from '../models/Lesson';
import Subject from '../models/Subject';
import * as ai from '../services/openai.service';
import { AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// Generate quiz for a lesson
router.post('/quiz/:lessonId', async (req: AuthRequest, res: Response) => {
  try {
    const lesson = await Lesson.findById(req.params.lessonId);
    if (!lesson || lesson.userId !== req.user!.id) {
      return res.status(404).json({ error: 'Lesson not found' });
    }
    const quiz = await ai.generateQuiz(lesson.content || lesson.notes, lesson.title);
    res.json(quiz);
  } catch (error) {
    console.error('Failed to generate quiz', error);
    res.status(500).json({ error: 'Failed to generate quiz' });
  }
});

// Generate flashcards
router.post('/flashcards/:lessonId', async (req: AuthRequest, res: Response) => {
  try {
    const lesson = await Lesson.findById(req.params.lessonId);
    if (!lesson || lesson.userId !== req.user!.id) {
      return res.status(404).json({ error: 'Lesson not found' });
    }
    const flashcards = await ai.generateFlashcards(lesson.content || lesson.notes, lesson.title);
    res.json(flashcards);
  } catch (error) {
    console.error('Failed to generate flashcards', error);
    res.status(500).json({ error: 'Failed to generate flashcards' });
  }
});

// Generate coding challenges
router.post('/coding-challenge/:lessonId', async (req: AuthRequest, res: Response) => {
  try {
    const lesson = await Lesson.findById(req.params.lessonId);
    if (!lesson || lesson.userId !== req.user!.id) {
      return res.status(404).json({ error: 'Lesson not found' });
    }
    const challenges = await ai.generateCodingChallenge(lesson.content || lesson.notes, lesson.title);
    res.json(challenges);
  } catch (error) {
    console.error('Failed to generate challenges', error);
    res.status(500).json({ error: 'Failed to generate challenges' });
  }
});

// Generate interview questions
router.post('/interview/:lessonId', async (req: AuthRequest, res: Response) => {
  try {
    const lesson = await Lesson.findById(req.params.lessonId);
    if (!lesson || lesson.userId !== req.user!.id) {
      return res.status(404).json({ error: 'Lesson not found' });
    }
    const questions = await ai.generateInterviewQuestions(lesson.content || lesson.notes, lesson.title);
    res.json(questions);
  } catch (error) {
    console.error('Failed to generate interview questions', error);
    res.status(500).json({ error: 'Failed to generate interview questions' });
  }
});

// Summarize lesson
router.post('/summarize/:lessonId', async (req: AuthRequest, res: Response) => {
  try {
    const lesson = await Lesson.findById(req.params.lessonId);
    if (!lesson || lesson.userId !== req.user!.id) {
      return res.status(404).json({ error: 'Lesson not found' });
    }
    const summary = await ai.summarizeLesson(lesson.content || lesson.notes, lesson.title);

    // Save summary to lesson
    await Lesson.findByIdAndUpdate(req.params.lessonId, { summary: summary.summary });

    res.json(summary);
  } catch (error) {
    console.error('Failed to summarize lesson', error);
    res.status(500).json({ error: 'Failed to summarize lesson' });
  }
});

// Generate practice tasks
router.post('/practice/:lessonId', async (req: AuthRequest, res: Response) => {
  try {
    const lesson = await Lesson.findById(req.params.lessonId);
    if (!lesson || lesson.userId !== req.user!.id) {
      return res.status(404).json({ error: 'Lesson not found' });
    }
    const tasks = await ai.generatePracticeTasks(lesson.content || lesson.notes, lesson.title);
    res.json(tasks);
  } catch (error) {
    console.error('Failed to generate practice tasks', error);
    res.status(500).json({ error: 'Failed to generate practice tasks' });
  }
});

// Generate project suggestions for a subject
router.post('/projects/:subjectId', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const subject = await Subject.findById(req.params.subjectId);
    if (!subject || subject.userId !== userId) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    const lessons = await Lesson.find({ subjectId: req.params.subjectId, userId, status: 'completed' });
    const lessonTitles = lessons.map((l) => l.title);

    const projects = await ai.generateProjectSuggestions(subject.name, lessonTitles);
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate projects' });
  }
});

// AI Chat (no user-scoped data — unchanged)
router.post('/chat', async (req: AuthRequest, res: Response) => {
  try {
    const { messages, context } = req.body;
    const reply = await ai.chatWithAI(messages, context || '');
    res.json({ message: reply });
  } catch (error) {
    res.status(500).json({ error: 'AI chat failed' });
  }
});

// Detect weak topics
router.get('/weak-topics', async (req: AuthRequest, res: Response) => {
  try {
    const lessons = await Lesson.find({ userId: req.user!.id }).select('title masteryScore status');
    const lessonData = lessons.map((l) => ({
      title: l.title,
      masteryScore: l.masteryScore,
      status: l.status,
    }));
    const result = await ai.detectWeakTopics(lessonData);
    res.json(result);
  } catch (error) {
    console.error('Failed to detect weak topics', error);
    res.status(500).json({ error: 'Failed to detect weak topics' });
  }
});

// Get recommendations
router.get('/recommendations', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const completedLessons = await Lesson.find({ userId, status: 'completed' }).select('title');
    const subjects = await Subject.find({ userId }).select('name');
    const weakLessons = await Lesson.find({ userId, masteryScore: { $lt: 50 } }).select('title');

    const result = await ai.getRecommendations(
      completedLessons.map((l) => l.title),
      subjects.map((s) => s.name),
      weakLessons.map((l) => l.title)
    );

    res.json(result);
  } catch (error) {
    console.error('Failed to get recommendations', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

export default router;
