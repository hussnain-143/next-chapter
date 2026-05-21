"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Chapter_1 = __importDefault(require("../models/Chapter"));
const Lesson_1 = __importDefault(require("../models/Lesson"));
const Subject_1 = __importDefault(require("../models/Subject"));
const KnowledgeNode_1 = __importDefault(require("../models/KnowledgeNode"));
const router = (0, express_1.Router)();
const USER_ID = 'default-user';
// Get chapters by subject
router.get('/subject/:subjectId', async (req, res) => {
    try {
        const chapters = await Chapter_1.default.find({
            subjectId: req.params.subjectId,
            userId: USER_ID,
        }).sort({ order: 1 });
        res.json(chapters);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch chapters' });
    }
});
// Get single chapter
router.get('/:id', async (req, res) => {
    try {
        const chapter = await Chapter_1.default.findById(req.params.id);
        if (!chapter)
            return res.status(404).json({ error: 'Chapter not found' });
        res.json(chapter);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch chapter' });
    }
});
// Create chapter
router.post('/', async (req, res) => {
    try {
        const lastChapter = await Chapter_1.default.findOne({ subjectId: req.body.subjectId }).sort({ order: -1 });
        const order = lastChapter ? lastChapter.order + 1 : 0;
        const chapter = new Chapter_1.default({ ...req.body, userId: USER_ID, order });
        await chapter.save();
        // Update subject chapter count
        await Subject_1.default.findByIdAndUpdate(req.body.subjectId, { $inc: { totalChapters: 1 } });
        // Create knowledge node
        await new KnowledgeNode_1.default({
            userId: USER_ID,
            subjectId: req.body.subjectId,
            chapterId: chapter._id,
            type: 'chapter',
            label: chapter.title,
        }).save();
        res.status(201).json(chapter);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create chapter' });
    }
});
// Update chapter
router.put('/:id', async (req, res) => {
    try {
        const chapter = await Chapter_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!chapter)
            return res.status(404).json({ error: 'Chapter not found' });
        await KnowledgeNode_1.default.findOneAndUpdate({ chapterId: chapter._id, type: 'chapter' }, { label: chapter.title });
        res.json(chapter);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update chapter' });
    }
});
// Delete chapter (cascade)
router.delete('/:id', async (req, res) => {
    try {
        const chapter = await Chapter_1.default.findById(req.params.id);
        if (!chapter)
            return res.status(404).json({ error: 'Chapter not found' });
        const lessonCount = await Lesson_1.default.countDocuments({ chapterId: chapter._id });
        await Promise.all([
            Lesson_1.default.deleteMany({ chapterId: chapter._id }),
            KnowledgeNode_1.default.deleteMany({ chapterId: chapter._id }),
            Chapter_1.default.findByIdAndDelete(req.params.id),
            Subject_1.default.findByIdAndUpdate(chapter.subjectId, {
                $inc: { totalChapters: -1, totalLessons: -lessonCount },
            }),
        ]);
        res.json({ message: 'Chapter deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete chapter' });
    }
});
// Reorder chapters
router.put('/reorder/:subjectId', async (req, res) => {
    try {
        const { order } = req.body; // array of { id, order }
        await Promise.all(order.map((item) => Chapter_1.default.findByIdAndUpdate(item.id, { order: item.order })));
        res.json({ message: 'Chapters reordered' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to reorder chapters' });
    }
});
// Recalculate chapter stats
router.post('/:id/recalculate', async (req, res) => {
    try {
        const chapterId = req.params.id;
        const lessons = await Lesson_1.default.find({ chapterId });
        const totalLessons = lessons.length;
        const completedLessons = lessons.filter((l) => l.status === 'completed').length;
        const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
        const totalTimeSpent = lessons.reduce((acc, l) => acc + l.timeSpent, 0);
        const chapter = await Chapter_1.default.findByIdAndUpdate(chapterId, { totalLessons, completedLessons, progressPercent, totalTimeSpent }, { new: true });
        res.json(chapter);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to recalculate stats' });
    }
});
exports.default = router;
//# sourceMappingURL=chapters.routes.js.map