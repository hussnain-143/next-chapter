import mongoose, { Document } from 'mongoose';
export interface ILearningPath extends Document {
    userId: string;
    title: string;
    lessonIds: mongoose.Types.ObjectId[];
    scheduledDates: Date[];
    spacedRepetitionInterval: number[];
    nextReviewAt: Date | null;
    isActive: boolean;
    completedCount: number;
    totalCount: number;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<ILearningPath, {}, {}, {}, mongoose.Document<unknown, {}, ILearningPath, {}, {}> & ILearningPath & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=LearningPath.d.ts.map