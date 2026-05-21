import mongoose, { Schema, Document } from 'mongoose';

export interface IKnowledgeNode extends Document {
  userId: string;
  subjectId: mongoose.Types.ObjectId;
  chapterId: mongoose.Types.ObjectId | null;
  lessonId: mongoose.Types.ObjectId | null;
  type: 'subject' | 'chapter' | 'lesson';
  label: string;
  connections: mongoose.Types.ObjectId[];
  masteryScore: number;
  positionX: number;
  positionY: number;
  createdAt: Date;
  updatedAt: Date;
}

const KnowledgeNodeSchema = new Schema<IKnowledgeNode>(
  {
    userId: { type: String, required: true, index: true },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    chapterId: { type: Schema.Types.ObjectId, ref: 'Chapter', default: null },
    lessonId: { type: Schema.Types.ObjectId, ref: 'Lesson', default: null },
    type: {
      type: String,
      enum: ['subject', 'chapter', 'lesson'],
      required: true,
    },
    label: { type: String, required: true },
    connections: [{ type: Schema.Types.ObjectId, ref: 'KnowledgeNode' }],
    masteryScore: { type: Number, default: 0, min: 0, max: 100 },
    positionX: { type: Number, default: 0 },
    positionY: { type: Number, default: 0 },
  },
  { timestamps: true }
);

KnowledgeNodeSchema.index({ userId: 1, type: 1 });
KnowledgeNodeSchema.index({ userId: 1, subjectId: 1 });

export default mongoose.model<IKnowledgeNode>('KnowledgeNode', KnowledgeNodeSchema);
