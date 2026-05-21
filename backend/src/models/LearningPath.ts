import mongoose, { Schema, Document } from 'mongoose';

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

const LearningPathSchema = new Schema<ILearningPath>(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    lessonIds: [{ type: Schema.Types.ObjectId, ref: 'Lesson' }],
    scheduledDates: [{ type: Date }],
    spacedRepetitionInterval: [{ type: Number }],
    nextReviewAt: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
    completedCount: { type: Number, default: 0 },
    totalCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

LearningPathSchema.index({ userId: 1, isActive: 1 });
LearningPathSchema.index({ userId: 1, nextReviewAt: 1 });

export default mongoose.model<ILearningPath>('LearningPath', LearningPathSchema);
