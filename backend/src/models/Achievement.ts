import mongoose, { Schema, Document } from 'mongoose';

export interface IAchievement extends Document {
  userId: string;
  type: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  earnedAt: Date;
  category: 'streak' | 'completion' | 'mastery' | 'speed' | 'consistency' | 'exploration';
}

const AchievementSchema = new Schema<IAchievement>(
  {
    userId: { type: String, required: true, index: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    icon: { type: String, default: '🏆' },
    xpReward: { type: Number, default: 50 },
    earnedAt: { type: Date, default: Date.now },
    category: {
      type: String,
      enum: ['streak', 'completion', 'mastery', 'speed', 'consistency', 'exploration'],
      default: 'completion',
    },
  },
  { timestamps: true }
);

AchievementSchema.index({ userId: 1, type: 1 }, { unique: true });

export default mongoose.model<IAchievement>('Achievement', AchievementSchema);
