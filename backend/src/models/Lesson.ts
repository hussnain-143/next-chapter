import mongoose, { Schema, Document } from 'mongoose';

export type LessonStatus = 'pending' | 'started' | 'in-progress' | 'revision' | 'completed';

export interface ICodeSnippet {
  language: string;
  code: string;
  title: string;
}

export interface IResource {
  title: string;
  url: string;
  type: 'link' | 'file' | 'video' | 'article';
}

export interface ILesson extends Document {
  chapterId: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId;
  userId: string;
  title: string;
  content: string;
  status: LessonStatus;
  codeSnippets: ICodeSnippet[];
  resources: IResource[];
  timeSpent: number;
  xpEarned: number;
  isBookmarked: boolean;
  order: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  notes: string;
  summary: string;
  tags: string[];
  lastReviewedAt: Date | null;
  nextReviewAt: Date | null;
  reviewCount: number;
  masteryScore: number;
  completedAt: Date | null;
  startedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const CodeSnippetSchema = new Schema<ICodeSnippet>({
  language: { type: String, default: 'javascript' },
  code: { type: String, required: true },
  title: { type: String, default: '' },
});

const ResourceSchema = new Schema<IResource>({
  title: { type: String, required: true },
  url: { type: String, required: true },
  type: { type: String, enum: ['link', 'file', 'video', 'article'], default: 'link' },
});

const LessonSchema = new Schema<ILesson>(
  {
    chapterId: { type: Schema.Types.ObjectId, ref: 'Chapter', required: true, index: true },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true, index: true },
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true },
    content: { type: String, default: '' },
    status: {
      type: String,
      enum: ['pending', 'started', 'in-progress', 'revision', 'completed'],
      default: 'pending',
      index: true,
    },
    codeSnippets: [CodeSnippetSchema],
    resources: [ResourceSchema],
    timeSpent: { type: Number, default: 0 },
    xpEarned: { type: Number, default: 0 },
    isBookmarked: { type: Boolean, default: false, index: true },
    order: { type: Number, default: 0 },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    notes: { type: String, default: '' },
    summary: { type: String, default: '' },
    tags: [{ type: String }],
    lastReviewedAt: { type: Date, default: null },
    nextReviewAt: { type: Date, default: null },
    reviewCount: { type: Number, default: 0 },
    masteryScore: { type: Number, default: 0, min: 0, max: 100 },
    completedAt: { type: Date, default: null },
    startedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

LessonSchema.index({ chapterId: 1, order: 1 });
LessonSchema.index({ userId: 1, status: 1 });
LessonSchema.index({ userId: 1, isBookmarked: 1 });
LessonSchema.index({ userId: 1, nextReviewAt: 1 });
LessonSchema.index({ '$**': 'text' }, { name: 'lesson_text_search' });

export default mongoose.model<ILesson>('Lesson', LessonSchema);
