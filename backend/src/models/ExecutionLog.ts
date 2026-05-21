import mongoose, { Schema, Document } from 'mongoose';

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

const ExecutionLogSchema = new Schema<IExecutionLog>(
  {
    userId: { type: String, required: true, index: true },
    lessonId: { type: Schema.Types.ObjectId, ref: 'Lesson', index: true },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', index: true },
    chapterId: { type: Schema.Types.ObjectId, ref: 'Chapter', index: true },
    action: {
      type: String,
      enum: ['started', 'paused', 'resumed', 'completed', 'revised', 'bookmarked', 'quiz_taken', 'note_added', 'code_added'],
      required: true,
    },
    duration: { type: Number, default: 0 },
    timestamp: { type: Date, default: Date.now, index: true },
    notes: { type: String, default: '' },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

ExecutionLogSchema.index({ userId: 1, timestamp: -1 });
ExecutionLogSchema.index({ userId: 1, action: 1, timestamp: -1 });

export default mongoose.model<IExecutionLog>('ExecutionLog', ExecutionLogSchema);
