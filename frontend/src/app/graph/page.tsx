'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getKnowledgeGraph } from '../../lib/api';
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  Panel,
  MarkerType,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { GitFork, ZoomIn, Loader2 } from 'lucide-react';
import { PageIntro } from '../../components/ui/PageIntro';
import {
  knowledgeGraphNodeTypes,
  type KnowledgeGraphNodeData,
} from '../../components/graph/KnowledgeGraphNode';

export default function KnowledgeGraph() {
  const { data, isLoading } = useQuery({
    queryKey: ['knowledgeGraph'],
    queryFn: getKnowledgeGraph,
  });

  const { nodes: formattedNodes, edges: formattedEdges, counts } = useMemo(() => {
    if (!data?.nodes?.length) {
      return { nodes: [], edges: [] as Edge[], counts: { subjects: 0, chapters: 0, lessons: 0 } };
    }

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

    const nodes = data.nodes.map((node) => {
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

      const nodeType = (node.type ?? 'lesson') as KnowledgeGraphNodeData['nodeType'];

      return {
        id: node.id,
        type: 'knowledge',
        position: { x, y },
        data: {
          label: node.data?.label ?? 'Untitled',
          nodeType,
          masteryScore: node.data?.masteryScore ?? 0,
        } satisfies KnowledgeGraphNodeData,
      };
    });

    const edges: Edge[] = (data.edges ?? []).map((edge) => ({
      ...edge,
      type: 'smoothstep',
      animated: edge.animated ?? true,
      style: { stroke: '#6366F1', strokeWidth: 2, opacity: 0.65 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#6366F1', width: 16, height: 16 },
    }));

    return {
      nodes,
      edges,
      counts: {
        subjects: data.nodes.filter((n) => n.type === 'subject').length,
        chapters: data.nodes.filter((n) => n.type === 'chapter').length,
        lessons: data.nodes.filter((n) => n.type === 'lesson').length,
      },
    };
  }, [data]);

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto h-[calc(100vh-100px)] pb-6">
      <PageIntro
        title="Knowledge Map"
        description="See how your subjects, chapters, and lessons connect. Purple nodes are subjects, gold are chapters, and blue-bordered cards are lessons."
        icon={GitFork}
        hint="Scroll to zoom · Drag the background to pan · Use +/− controls at the bottom left."
      />

      {!isLoading && formattedNodes.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <LegendItem color="bg-primary" label={`${counts.subjects} Subjects`} />
          <LegendItem color="bg-[#FBBF24]" label={`${counts.chapters} Chapters`} />
          <LegendItem color="bg-card border-2 border-accent" label={`${counts.lessons} Lessons`} />
        </div>
      )}

      <div className="flex-1 min-h-[420px] glass-card rounded-2xl overflow-hidden border border-border/50 relative shadow-lg">
        {isLoading ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin text-primary" aria-hidden />
            <p className="text-sm font-medium">Loading your knowledge map…</p>
          </div>
        ) : formattedNodes.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-4 p-8 text-center max-w-md mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <GitFork className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-foreground">No map data yet</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Add subjects, chapters, and lessons from the Subjects page. They will appear here automatically.
            </p>
          </div>
        ) : (
          <ReactFlow
            nodes={formattedNodes}
            edges={formattedEdges}
            nodeTypes={knowledgeGraphNodeTypes}
            fitView
            fitViewOptions={{ padding: 0.25, maxZoom: 0.95 }}
            minZoom={0.15}
            maxZoom={1.5}
            proOptions={{ hideAttribution: true }}
            className="knowledge-graph-flow"
          >
            <Controls
              showInteractive={false}
              className="!bg-card !border-border !rounded-xl !shadow-lg [&>button]:!bg-card [&>button]:!border-border [&>button]:!text-foreground [&>button:hover]:!bg-muted"
            />
            <MiniMap
              nodeColor={(node) => {
                const t = (node.data as KnowledgeGraphNodeData)?.nodeType;
                if (t === 'subject') return '#8B5CF6';
                if (t === 'chapter') return '#FBBF24';
                return '#6366F1';
              }}
              maskColor="rgba(28, 26, 46, 0.75)"
              className="!bg-card !border-border !rounded-xl !shadow-lg hidden md:block"
            />
            <Background color="rgba(155, 142, 196, 0.12)" gap={20} size={1} />
            <Panel position="bottom-right" className="hidden sm:block m-3">
              <div className="flex items-center gap-2 rounded-lg bg-card/95 border border-border px-3 py-2 text-xs text-muted-foreground shadow-md backdrop-blur-sm">
                <ZoomIn className="w-3.5 h-3.5 shrink-0" aria-hidden />
                <span>Pinch or scroll to zoom</span>
              </div>
            </Panel>
          </ReactFlow>
        )}
      </div>
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-3 py-1.5 font-medium text-foreground">
      <span className={`w-3 h-3 rounded-full shrink-0 ${color}`} aria-hidden />
      {label}
    </span>
  );
}
