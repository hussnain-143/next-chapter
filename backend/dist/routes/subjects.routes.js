"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Subject_1 = __importDefault(require("../models/Subject"));
const Chapter_1 = __importDefault(require("../models/Chapter"));
const Lesson_1 = __importDefault(require("../models/Lesson"));
const KnowledgeNode_1 = __importDefault(require("../models/KnowledgeNode"));
const router = (0, express_1.Router)();
const USER_ID = 'default-user';
// Get all subjects
router.get('/', async (_req, res) => {
    try {
        const subjects = await Subject_1.default.find({ userId: USER_ID, isArchived: false }).sort({ createdAt: -1 });
        res.json(subjects);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch subjects' });
    }
});
// Get single subject
router.get('/:id', async (req, res) => {
    try {
        const subject = await Subject_1.default.findById(req.params.id);
        if (!subject)
            return res.status(404).json({ error: 'Subject not found' });
        res.json(subject);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch subject' });
    }
});
// Create subject
router.post('/', async (req, res) => {
    try {
        const subject = new Subject_1.default({ ...req.body, userId: USER_ID });
        await subject.save();
        // Create knowledge graph node
        await new KnowledgeNode_1.default({
            userId: USER_ID,
            subjectId: subject._id,
            type: 'subject',
            label: subject.name,
            masteryScore: 0,
        }).save();
        res.status(201).json(subject);
    }
    catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ error: 'Subject with this name already exists' });
        }
        res.status(500).json({ error: 'Failed to create subject' });
    }
});
// Update subject
router.put('/:id', async (req, res) => {
    try {
        const subject = await Subject_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!subject)
            return res.status(404).json({ error: 'Subject not found' });
        // Update knowledge node label
        await KnowledgeNode_1.default.findOneAndUpdate({ subjectId: subject._id, type: 'subject' }, { label: subject.name });
        res.json(subject);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update subject' });
    }
});
// Delete subject (cascade)
router.delete('/:id', async (req, res) => {
    try {
        const subjectId = req.params.id;
        const chapters = await Chapter_1.default.find({ subjectId });
        const chapterIds = chapters.map((c) => c._id);
        await Promise.all([
            Lesson_1.default.deleteMany({ chapterId: { $in: chapterIds } }),
            Chapter_1.default.deleteMany({ subjectId }),
            KnowledgeNode_1.default.deleteMany({ subjectId }),
            Subject_1.default.findByIdAndDelete(subjectId),
        ]);
        res.json({ message: 'Subject deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete subject' });
    }
});
// Recalculate subject stats
router.post('/:id/recalculate', async (req, res) => {
    try {
        const subjectId = req.params.id;
        const chapters = await Chapter_1.default.find({ subjectId });
        const lessons = await Lesson_1.default.find({ subjectId });
        const totalChapters = chapters.length;
        const completedChapters = chapters.filter((c) => c.progressPercent === 100).length;
        const totalLessons = lessons.length;
        const completedLessons = lessons.filter((l) => l.status === 'completed').length;
        const totalTimeSpent = lessons.reduce((acc, l) => acc + l.timeSpent, 0);
        const xpEarned = lessons.reduce((acc, l) => acc + l.xpEarned, 0);
        const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
        const subject = await Subject_1.default.findByIdAndUpdate(subjectId, { totalChapters, completedChapters, totalLessons, completedLessons, progressPercent, totalTimeSpent, xpEarned }, { new: true });
        // Update knowledge node mastery
        await KnowledgeNode_1.default.findOneAndUpdate({ subjectId, type: 'subject', userId: USER_ID }, { masteryScore: progressPercent });
        res.json(subject);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to recalculate stats' });
    }
});
exports.default = router;
//# sourceMappingURL=subjects.routes.js.map