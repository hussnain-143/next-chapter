'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';

export type KnowledgeGraphNodeData = {
  label: string;
  nodeType: 'subject' | 'chapter' | 'lesson';
  masteryScore?: number;
};

const TYPE_CONFIG = {
  subject: {
    label: 'Subject',
    className:
      'bg-primary text-white border-violet-400/40 shadow-[0_4px_24px_rgba(139,92,246,0.35)]',
    badgeClass: 'bg-white/20 text-white',
    handle: '#C4B5FD',
  },
  chapter: {
    label: 'Chapter',
    className:
      'bg-[#FBBF24] text-[#1E1B4B] border-amber-300/50 shadow-[0_4px_20px_rgba(251,191,36,0.3)]',
    badgeClass: 'bg-[#1E1B4B]/15 text-[#1E1B4B]',
    handle: '#FDE68A',
  },
  lesson: {
    label: 'Lesson',
    className:
      'bg-card text-foreground border-accent/50 shadow-[0_2px_16px_rgba(99,102,241,0.2)]',
    badgeClass: 'bg-accent/15 text-secondary-foreground',
    handle: '#818CF8',
  },
} as const;

function KnowledgeGraphNodeComponent({ data }: NodeProps) {
  const nodeData = data as KnowledgeGraphNodeData;
  const type = nodeData?.nodeType ?? 'lesson';
  const config = TYPE_CONFIG[type];
  const mastery = Math.round(nodeData?.masteryScore ?? 0);
  const title = nodeData?.label ?? 'Untitled';

  return (
    <div
      className={[
        'min-w-[140px] max-w-[200px] rounded-xl border-2 px-3 py-2.5',
        config.className,
      ].join(' ')}
      title={title}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2 !h-2 !border-2 !bg-card"
        style={{ borderColor: config.handle }}
      />

      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span
          className={[
            'text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md',
            config.badgeClass,
          ].join(' ')}
        >
          {config.label}
        </span>
        <span className="text-[11px] font-bold tabular-nums opacity-90">{mastery}%</span>
      </div>

      <p className="text-sm font-semibold leading-snug line-clamp-2 break-words">{title}</p>

      <div className="mt-2 h-1 rounded-full bg-black/10 overflow-hidden">
        <div
          className="h-full rounded-full bg-white/70 transition-all"
          style={{ width: `${Math.min(100, mastery)}%` }}
        />
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2 !h-2 !border-2 !bg-card"
        style={{ borderColor: config.handle }}
      />
    </div>
  );
}

export const KnowledgeGraphNode = memo(KnowledgeGraphNodeComponent);

export const knowledgeGraphNodeTypes = {
  knowledge: KnowledgeGraphNode,
};
