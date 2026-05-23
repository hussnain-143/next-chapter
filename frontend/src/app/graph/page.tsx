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

  // Convert raw node layouts if coordinate points are missing or all 0
  const buildNodes = () => {
    if (!data || !data.nodes) return [];
    
    // Auto spacing nodes dynamically using simple grid circle formula if positions are zero
    const radius = 180;
    const subjects = data.nodes.filter(n => n.type === 'subject');
    
    return data.nodes.map((node, idx) => {
      let x = node.position?.x || 0;
      let y = node.position?.y || 0;
      
      // If position not set, let's arrange subjects in a ring, chapters underneath
      if (x === 0 && y === 0) {
        if (node.type === 'subject') {
          const subIdx = subjects.indexOf(node);
          const angle = (subIdx / Math.max(1, subjects.length)) * Math.PI * 2;
          x = 250 + Math.cos(angle) * radius * 1.5;
          y = 200 + Math.sin(angle) * radius * 1.5;
        } else if (node.type === 'chapter' && node.data?.subjectId) {
          const pSub = subjects.find(s => s.id === node.data.subjectId);
          const pSubIdx = pSub ? subjects.indexOf(pSub) : 0;
          const angle = (pSubIdx / Math.max(1, subjects.length)) * Math.PI * 2;
          // Offset chapter under parent subject
          const chIdx = data.nodes.filter(n => n.type === 'chapter' && n.data?.subjectId === node.data.subjectId).indexOf(node);
          x = 250 + Math.cos(angle) * radius * 1.5 + (chIdx - 1) * 130;
          y = 200 + Math.sin(angle) * radius * 1.5 + 130;
        } else if (node.type === 'lesson' && node.data?.chapterId) {
          const chNode = data.nodes.find(n => n.type === 'chapter' && n.id === node.data.chapterId);
          const chIdx = chNode ? data.nodes.filter(n => n.type === 'chapter' && n.data?.subjectId === chNode.data?.subjectId).indexOf(chNode) : 0;
          const pSub = chNode ? subjects.find(s => s.id === chNode.data?.subjectId) : null;
          const pSubIdx = pSub ? subjects.indexOf(pSub) : 0;
          const angle = (pSubIdx / Math.max(1, subjects.length)) * Math.PI * 2;
          
          const lesIdx = data.nodes.filter(n => n.type === 'lesson' && n.data?.chapterId === node.data.chapterId).indexOf(node);
          x = 250 + Math.cos(angle) * radius * 1.5 + (chIdx - 1) * 130 + (lesIdx - 1) * 80;
          y = 200 + Math.sin(angle) * radius * 1.5 + 230;
        }
      }

      return {
        id: node.id,
        data: { label: node.data.label },
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
