'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getKnowledgeGraph } from '../../lib/api';
import { computeKnowledgeGraphLayout } from '../../lib/graphLayout';
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

const EDGE_COLORS = {
  subjectChapter: '#A78BFA',
  chapterLesson: '#38BDF8',
  manual: '#94A3B8',
} as const;

export default function KnowledgeGraph() {
  const { data, isLoading } = useQuery({
    queryKey: ['knowledgeGraph'],
    queryFn: getKnowledgeGraph,
  });

  const { nodes: formattedNodes, edges: formattedEdges, counts } = useMemo(() => {
    if (!data?.nodes?.length) {
      return { nodes: [], edges: [] as Edge[], counts: { subjects: 0, chapters: 0, lessons: 0 } };
    }

    const layoutPositions = computeKnowledgeGraphLayout(data.nodes);
    const nodeById = new Map(data.nodes.map((n) => [n.id, n]));

    const nodes = data.nodes.map((node) => {
      const pos = layoutPositions.get(node.id) ?? { x: 0, y: 0 };
      const nodeType = (node.type ?? 'lesson') as KnowledgeGraphNodeData['nodeType'];

      return {
        id: node.id,
        type: 'knowledge',
        position: pos,
        data: {
          label: node.data?.label ?? 'Untitled',
          nodeType,
          masteryScore: node.data?.masteryScore ?? 0,
        } satisfies KnowledgeGraphNodeData,
      };
    });

    // Only tree edges (subject→chapter→lesson); drop manual links that crisscross the layout
    const edges: Edge[] = (data.edges ?? [])
      .filter((edge) => {
        const sourceNode = nodeById.get(edge.source);
        const targetNode = nodeById.get(edge.target);
        if (!sourceNode || !targetNode) return false;
        if (sourceNode.type === 'subject' && targetNode.type === 'chapter') {
          return String(sourceNode.data?.subjectId) === String(targetNode.data?.subjectId);
        }
        if (sourceNode.type === 'chapter' && targetNode.type === 'lesson') {
          return String(sourceNode.data?.chapterId) === String(targetNode.data?.chapterId);
        }
        return false;
      })
      .map((edge) => {
        const sourceNode = nodeById.get(edge.source)!;
        const isSubjectChapter = sourceNode.type === 'subject';
        const stroke = isSubjectChapter ? EDGE_COLORS.subjectChapter : EDGE_COLORS.chapterLesson;

        return {
          ...edge,
          type: 'smoothstep',
          animated: false,
          style: { stroke, strokeWidth: 2.5, opacity: 0.9 },
          markerEnd: { type: MarkerType.ArrowClosed, color: stroke, width: 14, height: 14 },
        };
      });

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
        description="Each subject is its own tree: subject on top, chapters in a row below, lessons under each chapter."
        icon={GitFork}
        hint="Scroll to zoom · Drag the canvas to pan · Colours: violet = subject, cream = chapter, slate = lesson."
      />

      {!isLoading && formattedNodes.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <LegendItem
            swatchClass="bg-gradient-to-br from-violet-600 to-indigo-700"
            label={`${counts.subjects} Subjects`}
          />
          <LegendItem swatchClass="bg-[#FFFBEB] border-2 border-amber-500/60" label={`${counts.chapters} Chapters`} />
          <LegendItem swatchClass="bg-[#1E293B] border-2 border-sky-500/50" label={`${counts.lessons} Lessons`} />
        </div>
      )}

      <div className="flex-1 min-h-[480px] glass-card rounded-2xl overflow-hidden border border-border/50 relative shadow-lg">
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
            fitViewOptions={{ padding: 0.3, maxZoom: 1 }}
            minZoom={0.1}
            maxZoom={1.25}
            nodesDraggable={false}
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
                if (t === 'subject') return '#7C3AED';
                if (t === 'chapter') return '#F59E0B';
                return '#334155';
              }}
              maskColor="rgba(28, 26, 46, 0.8)"
              className="!bg-card !border-border !rounded-xl !shadow-lg hidden md:block"
            />
            <Background color="rgba(155, 142, 196, 0.1)" gap={24} size={1} />
            <Panel position="bottom-right" className="hidden sm:block m-3">
              <div className="flex items-center gap-2 rounded-lg bg-card/95 border border-border px-3 py-2 text-xs text-muted-foreground shadow-md backdrop-blur-sm">
                <ZoomIn className="w-3.5 h-3.5 shrink-0" aria-hidden />
                <span>Scroll to zoom · drag canvas to pan</span>
              </div>
            </Panel>
          </ReactFlow>
        )}
      </div>
    </div>
  );
}

function LegendItem({ swatchClass, label }: { swatchClass: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-3 py-1.5 font-medium text-foreground">
      <span className={`w-3.5 h-3.5 rounded-full shrink-0 ${swatchClass}`} aria-hidden />
      {label}
    </span>
  );
}
