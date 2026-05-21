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
const StudySessionSchema = new mongoose_1.Schema({
    userId: { type: String, required: true, index: true },
    lessonId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Lesson', index: true },
    subjectId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Subject', index: true },
    chapterId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Chapter', index: true },
    duration: { type: Number, required: true, default: 0 },
    pomodoroCount: { type: Number, default: 0 },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    type: {
        type: String,
        enum: ['study', 'review', 'quiz', 'practice'],
        default: 'study',
    },
    notes: { type: String, default: '' },
}, { timestamps: true });
StudySessionSchema.index({ userId: 1, startTime: -1 });
StudySessionSchema.index({ userId: 1, subjectId: 1, startTime: -1 });
exports.default = mongoose_1.default.model('StudySession', StudySessionSchema);
//# sourceMappingURL=StudySession.js.map