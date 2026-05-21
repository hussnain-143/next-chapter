import mongoose, { Document } from 'mongoose';
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
declare const _default: mongoose.Model<IKnowledgeNode, {}, {}, {}, mongoose.Document<unknown, {}, IKnowledgeNode, {}, {}> & IKnowledgeNode & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=KnowledgeNode.d.ts.map