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
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const CodeSnippetSchema = new mongoose_1.Schema({
    language: { type: String, default: 'javascript' },
    code: { type: String, required: true },
    title: { type: String, default: '' },
});
const ResourceSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    url: { type: String, required: true },
    type: { type: String, enum: ['link', 'file', 'video', 'article'], default: 'link' },
});
const LessonSchema = new mongoose_1.Schema({
    chapterId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Chapter', required: true, index: true },
    subjectId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Subject', required: true, index: true },
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true },
    content: { type: String, default: '' },
    status: {
        type: String,
        enum: ['pending', 'started', 'in-progress', 'revision', 'completed'],
        default: 'pending',
        index: true,
    },
    codeSnippets: [CodeSnippetSchema],
    resources: [ResourceSchema],
    timeSpent: { type: Number, default: 0 },
    xpEarned: { type: Number, default: 0 },
    isBookmarked: { type: Boolean, default: false, index: true },
    order: { type: Number, default: 0 },
    difficulty: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        default: 'beginner',
    },
    notes: { type: String, default: '' },
    summary: { type: String, default: '' },
    tags: [{ type: String }],
    lastReviewedAt: { type: Date, default: null },
    nextReviewAt: { type: Date, default: null },
    reviewCount: { type: Number, default: 0 },
    masteryScore: { type: Number, default: 0, min: 0, max: 100 },
    completedAt: { type: Date, default: null },
    startedAt: { type: Date, default: null },
}, { timestamps: true });
LessonSchema.index({ chapterId: 1, order: 1 });
LessonSchema.index({ userId: 1, status: 1 });
LessonSchema.index({ userId: 1, isBookmarked: 1 });
LessonSchema.index({ userId: 1, nextReviewAt: 1 });
LessonSchema.index({ '$**': 'text' }, { name: 'lesson_text_search' });
exports.default = mongoose_1.default.model('Lesson', LessonSchema);
//# sourceMappingURL=Lesson.js.map