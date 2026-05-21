import mongoose, { Document } from 'mongoose';
export type LessonStatus = 'pending' | 'started' | 'in-progress' | 'revision' | 'completed';
export interface ICodeSnippet {
    language: string;
    code: string;
    title: string;
}
export interface IResource {
    title: string;
    url: string;
    type: 'link' | 'file' | 'video' | 'article';
}
export interface ILesson extends Document {
    chapterId: mongoose.Types.ObjectId;
    subjectId: mongoose.Types.ObjectId;
    userId: string;
    title: string;
    content: string;
    status: LessonStatus;
    codeSnippets: ICodeSnippet[];
    resources: IResource[];
    timeSpent: number;
    xpEarned: number;
    isBookmarked: boolean;
    order: number;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    notes: string;
    summary: string;
    tags: string[];
    lastReviewedAt: Date | null;
    nextReviewAt: Date | null;
    reviewCount: number;
    masteryScore: number;
    completedAt: Date | null;
    startedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<ILesson, {}, {}, {}, mongoose.Document<unknown, {}, ILesson, {}, {}> & ILesson & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Lesson.d.ts.map