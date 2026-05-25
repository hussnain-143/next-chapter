/** Hierarchical layout: each subject is its own top-down tree (no overlapping rings). */

export type GraphApiNode = {
  id: string;
  type: string;
  data?: {
    label?: string;
    masteryScore?: number;
    subjectId?: string;
    chapterId?: string;
    lessonId?: string;
  };
  position?: { x?: number; y?: number };
};

const CHAPTER_GAP = 240;
const LESSON_GAP = 110;
const SUBJECT_TO_CHAPTERS = 140;
const CHAPTER_TO_LESSONS = 130;
const CLUSTER_PADDING_X = 80;
const CLUSTER_PADDING_Y = 60;
const CLUSTER_GAP_Y = 120;

export function computeKnowledgeGraphLayout(nodes: GraphApiNode[]): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();

  const subjectNodes = nodes.filter((n) => n.type === 'subject');
  if (!subjectNodes.length) return positions;

  let clusterYOffset = CLUSTER_PADDING_Y;

  subjectNodes.forEach((subject) => {
    const subjectDocId = String(subject.data?.subjectId ?? '');
    const chapters = nodes
      .filter((n) => n.type === 'chapter' && String(n.data?.subjectId) === subjectDocId)
      .sort((a, b) => (a.data?.label ?? '').localeCompare(b.data?.label ?? ''));

    const chapterCount = Math.max(chapters.length, 1);
    const chapterGap =
      chapters.length > 6
        ? Math.min(280, Math.max(200, Math.floor(2200 / chapters.length)))
        : CHAPTER_GAP;
    const clusterWidth = Math.max((chapterCount - 1) * chapterGap, 0);
    const clusterCenterX = CLUSTER_PADDING_X + clusterWidth / 2;

    // Subject centered above its chapter row
    positions.set(subject.id, {
      x: clusterCenterX,
      y: clusterYOffset,
    });

    let maxLessonsInCluster = 0;

    chapters.forEach((chapter, chIdx) => {
      const chapterDocId = String(chapter.data?.chapterId ?? '');
      const lessons = nodes
        .filter((n) => n.type === 'lesson' && String(n.data?.chapterId) === chapterDocId)
        .sort((a, b) => (a.data?.label ?? '').localeCompare(b.data?.label ?? ''));

      maxLessonsInCluster = Math.max(maxLessonsInCluster, lessons.length);

      const chapterX = CLUSTER_PADDING_X + chIdx * chapterGap;
      const chapterY = clusterYOffset + SUBJECT_TO_CHAPTERS;

      positions.set(chapter.id, { x: chapterX, y: chapterY });

      lessons.forEach((lesson, lesIdx) => {
        positions.set(lesson.id, {
          x: chapterX,
          y: chapterY + CHAPTER_TO_LESSONS + lesIdx * LESSON_GAP,
        });
      });
    });

    const clusterHeight =
      SUBJECT_TO_CHAPTERS +
      CHAPTER_TO_LESSONS +
      Math.max(maxLessonsInCluster, 1) * LESSON_GAP +
      80;

    clusterYOffset += clusterHeight + CLUSTER_GAP_Y;
  });

  return positions;
}
