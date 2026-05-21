import mongoose, { Schema, Document } from 'mongoose';

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

const ChapterSchema = new Schema<IChapter>(
  {
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true, index: true },
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    order: { type: Number, default: 0 },
    totalLessons: { type: Number, default: 0 },
    completedLessons: { type: Number, default: 0 },
    progressPercent: { type: Number, default: 0 },
    totalTimeSpent: { type: Number, default: 0 },
    isLocked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

ChapterSchema.index({ subjectId: 1, order: 1 });
ChapterSchema.index({ userId: 1, subjectId: 1 });

export default mongoose.model<IChapter>('Chapter', ChapterSchema);
