import mongoose, { Document } from 'mongoose';
export interface ISubject extends Document {
    name: string;
    description: string;
    color: string;
    icon: string;
    userId: string;
    totalChapters: number;
    completedChapters: number;
    totalLessons: number;
    completedLessons: number;
    progressPercent: number;
    totalTimeSpent: number;
    xpEarned: number;
    tags: string[];
    isArchived: boolean;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<ISubject, {}, {}, {}, mongoose.Document<unknown, {}, ISubject, {}, {}> & ISubject & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Subject.d.ts.map