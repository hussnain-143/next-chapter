import mongoose, { Document } from 'mongoose';
export interface IChapter extends Document {
    subjectId: mongoose.Types.ObjectId;
    userId: string;
    title: string;
    description: string;
    order: number;
    totalLessons: number;
    completedLessons: number;
    progressPercent: number;
    totalTimeSpent: number;
    isLocked: boolean;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IChapter, {}, {}, {}, mongoose.Document<unknown, {}, IChapter, {}, {}> & IChapter & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Chapter.d.ts.map