import mongoose, { Document } from 'mongoose';
export interface IStudySession extends Document {
    userId: string;
    lessonId: mongoose.Types.ObjectId;
    subjectId: mongoose.Types.ObjectId;
    chapterId: mongoose.Types.ObjectId;
    duration: number;
    pomodoroCount: number;
    startTime: Date;
    endTime: Date;
    type: 'study' | 'review' | 'quiz' | 'practice';
    notes: string;
    createdAt: Date;
}
declare const _default: mongoose.Model<IStudySession, {}, {}, {}, mongoose.Document<unknown, {}, IStudySession, {}, {}> & IStudySession & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=StudySession.d.ts.map