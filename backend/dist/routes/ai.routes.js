"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Lesson_1 = __importDefault(require("../models/Lesson"));
const Subject_1 = __importDefault(require("../models/Subject"));
const ai = __importStar(require("../services/openai.service"));
const router = (0, express_1.Router)();
const USER_ID = 'default-user';
// Generate quiz for a lesson
router.post('/quiz/:lessonId', async (req, res) => {
    try {
        const lesson = await Lesson_1.default.findById(req.params.lessonId);
        if (!lesson)
            return res.status(404).json({ error: 'Lesson not found' });
        const quiz = await ai.generateQuiz(lesson.content || lesson.notes, lesson.title);
        res.json(quiz);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to generate quiz' });
    }
});
// Generate flashcards
router.post('/flashcards/:lessonId', async (req, res) => {
    try {
        const lesson = await Lesson_1.default.findById(req.params.lessonId);
        if (!lesson)
            return res.status(404).json({ error: 'Lesson not found' });
        const flashcards = await ai.generateFlashcards(lesson.content || lesson.notes, lesson.title);
        res.json(flashcards);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to generate flashcards' });
    }
});
// Generate coding challenges
router.post('/coding-challenge/:lessonId', async (req, res) => {
    try {
        const lesson = await Lesson_1.default.findById(req.params.lessonId);
        if (!lesson)
            return res.status(404).json({ error: 'Lesson not found' });
        const challenges = await ai.generateCodingChallenge(lesson.content || lesson.notes, lesson.title);
        res.json(challenges);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to generate challenges' });
    }
});
// Generate interview questions
router.post('/interview/:lessonId', async (req, res) => {
    try {
        const lesson = await Lesson_1.default.findById(req.params.lessonId);
        if (!lesson)
            return res.status(404).json({ error: 'Lesson not found' });
        const questions = await ai.generateInterviewQuestions(lesson.content || lesson.notes, lesson.title);
        res.json(questions);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to generate interview questions' });
    }
});
// Summarize lesson
router.post('/summarize/:lessonId', async (req, res) => {
    try {
        const lesson = await Lesson_1.default.findById(req.params.lessonId);
        if (!lesson)
            return res.status(404).json({ error: 'Lesson not found' });
        const summary = await ai.summarizeLesson(lesson.content || lesson.notes, lesson.title);
        // Save summary to lesson
        await Lesson_1.default.findByIdAndUpdate(req.params.lessonId, { summary: summary.summary });
        res.json(summary);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to summarize lesson' });
    }
});
// Generate practice tasks
router.post('/practice/:lessonId', async (req, res) => {
    try {
        const lesson = await Lesson_1.default.findById(req.params.lessonId);
        if (!lesson)
            return res.status(404).json({ error: 'Lesson not found' });
        const tasks = await ai.generatePracticeTasks(lesson.content || lesson.notes, lesson.title);
        res.json(tasks);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to generate practice tasks' });
    }
});
// Generate project suggestions for a subject
router.post('/projects/:subjectId', async (req, res) => {
    try {
        const subject = await Subject_1.default.findById(req.params.subjectId);
        if (!subject)
            return res.status(404).json({ error: 'Subject not found' });
        const lessons = await Lesson_1.default.find({ subjectId: req.params.subjectId, status: 'completed' });
        const lessonTitles = lessons.map((l) => l.title);
        const projects = await ai.generateProjectSuggestions(subject.name, lessonTitles);
        res.json(projects);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to generate projects' });
    }
});
// AI Chat
router.post('/chat', async (req, res) => {
    try {
        const { messages, context } = req.body;
        const reply = await ai.chatWithAI(messages, context || '');
        res.json({ message: reply });
    }
    catch (error) {
        res.status(500).json({ error: 'AI chat failed' });
    }
});
// Detect weak topics
router.get('/weak-topics', async (_req, res) => {
    try {
        const lessons = await Lesson_1.default.find({ userId: USER_ID }).select('title masteryScore status');
        const lessonData = lessons.map((l) => ({
            title: l.title,
            masteryScore: l.masteryScore,
            status: l.status,
        }));
        const weakTopics = await ai.detectWeakTopics(lessonData);
        res.json(weakTopics);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to detect weak topics' });
    }
});
// Get recommendations
router.get('/recommendations', async (_req, res) => {
    try {
        const completedLessons = await Lesson_1.default.find({ userId: USER_ID, status: 'completed' }).select('title');
        const subjects = await Subject_1.default.find({ userId: USER_ID }).select('name');
        const weakLessons = await Lesson_1.default.find({ userId: USER_ID, masteryScore: { $lt: 50 } }).select('title');
        const recommendations = await ai.getRecommendations(completedLessons.map((l) => l.title), subjects.map((s) => s.name), weakLessons.map((l) => l.title));
        res.json(recommendations);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to get recommendations' });
    }
});
exports.default = router;
//# sourceMappingURL=ai.routes.js.map