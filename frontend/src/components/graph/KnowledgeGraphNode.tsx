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
    container: 'graph-node-subject shadow-[0_6px_28px_var(--glow-primary)]',
    badge: 'bg-white/25 text-white',
    barTrack: 'bg-white/25',
    barFill: 'bg-white',
  },
  chapter: {
    label: 'Chapter',
    container: 'graph-node-chapter shadow-[0_4px_18px_rgba(240,193,74,0.22)]',
    badge: 'bg-amber-900/12 text-[var(--graph-chapter-text)]',
    barTrack: 'bg-amber-900/12',
    barFill: 'bg-amber-600',
  },
  lesson: {
    label: 'Lesson',
    container: 'graph-node-lesson shadow-[0_4px_16px_rgba(56,189,248,0.18)]',
    badge: 'bg-sky-500/20 text-sky-200',
    barTrack: 'bg-slate-600/40',
    barFill: 'bg-sky-400',
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
      className={['w-[200px] rounded-xl border-2 px-3 py-2.5 nodrag', config.container].join(' ')}
      title={title}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2.5 !h-2.5 !border-2 !border-border !bg-background"
      />

      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span className={['text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded', config.badge].join(' ')}>
          {config.label}
        </span>
        <span className="text-xs font-bold tabular-nums opacity-90">{mastery}%</span>
      </div>

      <p className="text-[13px] font-semibold leading-snug line-clamp-3">{title}</p>

      <div className={`mt-2 h-1.5 rounded-full overflow-hidden ${config.barTrack}`}>
        <div className={`h-full rounded-full ${config.barFill}`} style={{ width: `${Math.min(100, mastery)}%` }} />
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2.5 !h-2.5 !border-2 !border-border !bg-background"
      />
    </div>
  );
}

export const KnowledgeGraphNode = memo(KnowledgeGraphNodeComponent);

export const knowledgeGraphNodeTypes = {
  knowledge: KnowledgeGraphNode,
};
