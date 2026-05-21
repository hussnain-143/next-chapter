import mongoose, { Document } from 'mongoose';
export type ExecutionAction = 'started' | 'paused' | 'resumed' | 'completed' | 'revised' | 'bookmarked' | 'quiz_taken' | 'note_added' | 'code_added';
export interface IExecutionLog extends Document {
    userId: string;
    lessonId: mongoose.Types.ObjectId;
    subjectId: mongoose.Types.ObjectId;
    chapterId: mongoose.Types.ObjectId;
    action: ExecutionAction;
    duration: number;
    timestamp: Date;
    notes: string;
    metadata: Record<string, any>;
    createdAt: Date;
}
declare const _default: mongoose.Model<IExecutionLog, {}, {}, {}, mongoose.Document<unknown, {}, IExecutionLog, {}, {}> & IExecutionLog & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=ExecutionLog.d.ts.map