'use client';

import { useQuery } from '@tanstack/react-query';
import { getKnowledgeGraph } from '../../lib/api';
import { ReactFlow, Controls, Background, MiniMap } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { GitFork, Sparkles } from 'lucide-react';

export default function KnowledgeGraph() {
  const { data, isLoading } = useQuery({
    queryKey: ['knowledgeGraph'],
    queryFn: getKnowledgeGraph,
  });

  const getStyleForType = (type: string) => {
    switch (type) {
      case 'subject':
        return {
          background: 'var(--primary)',
          border: '2px solid rgba(255,255,255,0.2)',
          color: '#ffffff',
          borderRadius: '16px',
          padding: '12px 18px',
          fontWeight: 'bold',
          fontSize: '13px',
          boxShadow: '0 4px 20px rgba(124, 58, 237, 0.4)',
        };
      case 'chapter':
        return {
          background: 'var(--gold)',
          border: '2px solid rgba(255,255,255,0.2)',
          color: '#1E1B4B', /* deep navy for contrast on gold */
          borderRadius: '12px',
          padding: '10px 14px',
          fontWeight: '700',
          fontSize: '12px',
          boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)',
        };
      case 'lesson':
        return {
          background: 'var(--card)',
          border: '2px solid var(--accent)',
          color: 'var(--foreground)',
          borderRadius: '10px',
          padding: '8px 12px',
          fontSize: '11px',
          fontWeight: '600',
          boxShadow: '0 2px 10px rgba(59, 130, 246, 0.15)',
        };
      default:
        return {};
    }
  };

  // Auto-layout when positions are unset (0,0). Graph node ids are KnowledgeNode ids;
  // parent links use data.subjectId / data.chapterId (Subject/Chapter document ids).
  const buildNodes = () => {
    if (!data?.nodes?.length) return [];

    const radius = 200;
    const centerX = 400;
    const centerY = 280;
    const subjectNodes = data.nodes.filter((n) => n.type === 'subject');

    const subjectIndexByDocId = new Map<string, number>();
    subjectNodes.forEach((n, i) => {
      if (n.data?.subjectId) subjectIndexByDocId.set(String(n.data.subjectId), i);
    });

    const chaptersBySubject = new Map<string, typeof data.nodes>();
    data.nodes
      .filter((n) => n.type === 'chapter' && n.data?.subjectId)
      .forEach((n) => {
        const key = String(n.data.subjectId);
        if (!chaptersBySubject.has(key)) chaptersBySubject.set(key, []);
        chaptersBySubject.get(key)!.push(n);
      });

    const lessonsByChapter = new Map<string, typeof data.nodes>();
    data.nodes
      .filter((n) => n.type === 'lesson' && n.data?.chapterId)
      .forEach((n) => {
        const key = String(n.data.chapterId);
        if (!lessonsByChapter.has(key)) lessonsByChapter.set(key, []);
        lessonsByChapter.get(key)!.push(n);
      });

    const needsAutoLayout = data.nodes.every(
      (n) => (n.position?.x ?? 0) === 0 && (n.position?.y ?? 0) === 0
    );

    return data.nodes.map((node) => {
      let x = node.position?.x ?? 0;
      let y = node.position?.y ?? 0;

      if (needsAutoLayout || (x === 0 && y === 0)) {
        if (node.type === 'subject') {
          const subIdx = subjectNodes.indexOf(node);
          const angle = (subIdx / Math.max(1, subjectNodes.length)) * Math.PI * 2 - Math.PI / 2;
          x = centerX + Math.cos(angle) * radius;
          y = centerY + Math.sin(angle) * radius;
        } else if (node.type === 'chapter' && node.data?.subjectId) {
          const subjectKey = String(node.data.subjectId);
          const siblings = chaptersBySubject.get(subjectKey) ?? [];
          const chIdx = siblings.indexOf(node);
          const pSubIdx = subjectIndexByDocId.get(subjectKey) ?? 0;
          const angle = (pSubIdx / Math.max(1, subjectNodes.length)) * Math.PI * 2 - Math.PI / 2;
          const spread = (chIdx - (siblings.length - 1) / 2) * 150;
          x = centerX + Math.cos(angle) * (radius + 120) + spread * Math.sin(angle);
          y = centerY + Math.sin(angle) * (radius + 120) - spread * Math.cos(angle) + 80;
        } else if (node.type === 'lesson' && node.data?.chapterId) {
          const chapterKey = String(node.data.chapterId);
          const chNode = data.nodes.find(
            (n) => n.type === 'chapter' && String(n.data?.chapterId) === chapterKey
          );
          const siblings = lessonsByChapter.get(chapterKey) ?? [];
          const lesIdx = siblings.indexOf(node);
          const subjectKey = chNode?.data?.subjectId ? String(chNode.data.subjectId) : '';
          const chapterSiblings = subjectKey ? (chaptersBySubject.get(subjectKey) ?? []) : [];
          const chIdx = chNode ? chapterSiblings.indexOf(chNode) : 0;
          const pSubIdx = subjectKey ? (subjectIndexByDocId.get(subjectKey) ?? 0) : 0;
          const angle = (pSubIdx / Math.max(1, subjectNodes.length)) * Math.PI * 2 - Math.PI / 2;
          const chSpread = (chIdx - (chapterSiblings.length - 1) / 2) * 150;
          const lesSpread = (lesIdx - (siblings.length - 1) / 2) * 100;
          x =
            centerX +
            Math.cos(angle) * (radius + 220) +
            chSpread * Math.sin(angle) +
            lesSpread * Math.sin(angle + Math.PI / 2);
          y =
            centerY +
            Math.sin(angle) * (radius + 220) -
            chSpread * Math.cos(angle) +
            lesSpread * Math.cos(angle + Math.PI / 2) +
            160;
        }
      }

      return {
        id: node.id,
        data: { label: node.data?.label ?? '' },
        position: { x, y },
        style: getStyleForType(node.type),
      };
    });
  };

  const formattedNodes = buildNodes();
  const formattedEdges = data?.edges || [];

  return (
    <div className="space-y-6 max-w-6xl mx-auto h-[calc(100vh-120px)] flex flex-col overflow-hidden">
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Knowledge Map Graph <GitFork className="w-5 h-5 text-primary rotate-180" />
          </h2>
          <p className="text-sm text-muted-foreground">Interactive layout connecting Subjects, Chapters, and Lesson mastery nodes.</p>
        </div>
        <div className="flex items-center gap-2 bg-primary/10 dark:bg-primary/15 border border-primary/20 px-3 py-1.5 rounded-full text-primary dark:text-primary font-semibold text-xs shadow-sm">
          <Sparkles className="w-4 h-4 text-primary animate-pulse" />
          <span>Interactive Connective Network</span>
        </div>
      </div>

      <div className="flex-1 glass-card rounded-3xl overflow-hidden border border-border/40 relative shadow-inner">
        {isLoading ? (
          <div className="w-full h-full p-8 space-y-4 animate-pulse">
            <div className="h-6 w-3/4 rounded-full bg-accent/20" />
            <div className="h-40 rounded-3xl bg-accent/20" />
            <div className="grid grid-cols-2 gap-4">
              <div className="h-24 rounded-3xl bg-accent/20" />
              <div className="h-24 rounded-3xl bg-accent/20" />
            </div>
          </div>
        ) : formattedNodes.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground italic">
            No subjects or lessons added yet. Create some to draw your knowledge graph!
          </div>
        ) : (
          <ReactFlow
            nodes={formattedNodes as any}
            edges={formattedEdges}
            fitView
            fitViewOptions={{ padding: 0.2, maxZoom: 1 }}
            minZoom={0.2}
            className="bg-accent/5 dark:bg-transparent"
          >
            <Controls className="!bg-card !border-border/60 !rounded-xl !shadow-lg" />
            <MiniMap 
              nodeColor={(node) => {
                if (node.style?.background === 'var(--primary)') return '#7C3AED';
                if (node.style?.background === 'var(--gold)') return '#F59E0B';
                return '#3B82F6'; // lesson border color
              }}
              className="!bg-card !border-border/60 !rounded-xl !shadow-lg hidden md:block" 
            />
            <Background color="rgba(100, 116, 139, 0.1)" gap={16} size={1} />
          </ReactFlow>
        )}
      </div>
    </div>
  );
}
