import mongoose, { Schema, Document } from 'mongoose';

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

const StudySessionSchema = new Schema<IStudySession>(
  {
    userId: { type: String, required: true, index: true },
    lessonId: { type: Schema.Types.ObjectId, ref: 'Lesson', index: true },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', index: true },
    chapterId: { type: Schema.Types.ObjectId, ref: 'Chapter', index: true },
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
  },
  { timestamps: true }
);

StudySessionSchema.index({ userId: 1, startTime: -1 });
StudySessionSchema.index({ userId: 1, subjectId: 1, startTime: -1 });

export default mongoose.model<IStudySession>('StudySession', StudySessionSchema);
