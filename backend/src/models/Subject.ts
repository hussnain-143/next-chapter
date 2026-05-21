import mongoose, { Schema, Document } from 'mongoose';

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
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const SubjectSchema = new Schema<ISubject>(
  {
    name: { type: String, required: true, trim: true, index: true },
    description: { type: String, default: '' },
    color: { type: String, default: '#6366f1' },
    icon: { type: String, default: '📚' },
    userId: { type: String, required: true, index: true },
    totalChapters: { type: Number, default: 0 },
    completedChapters: { type: Number, default: 0 },
    totalLessons: { type: Number, default: 0 },
    completedLessons: { type: Number, default: 0 },
    progressPercent: { type: Number, default: 0 },
    totalTimeSpent: { type: Number, default: 0 },
    xpEarned: { type: Number, default: 0 },
    tags: [{ type: String }],
    isArchived: { type: Boolean, default: false },
    order: { type: Number, default: 0, index: true },
  },
  { timestamps: true }
);

SubjectSchema.index({ userId: 1, name: 1 }, { unique: true });
SubjectSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model<ISubject>('Subject', SubjectSchema);
