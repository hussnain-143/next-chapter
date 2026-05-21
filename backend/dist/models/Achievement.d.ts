import mongoose, { Document } from 'mongoose';
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
declare const _default: mongoose.Model<IAchievement, {}, {}, {}, mongoose.Document<unknown, {}, IAchievement, {}, {}> & IAchievement & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Achievement.d.ts.map