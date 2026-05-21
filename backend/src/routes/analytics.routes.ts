import { Router, Request, Response } from 'express';
import * as analyticsService from '../services/analytics.service';
import StudySession from '../models/StudySession';
import ExecutionLog from '../models/ExecutionLog';
import KnowledgeNode from '../models/KnowledgeNode';
import LearningPath from '../models/LearningPath';

const router = Router();
const USER_ID = 'default-user';

// Dashboard stats
router.get('/dashboard', async (_req: Request, res: Response) => {
  try {
    const stats = await analyticsService.getDashboardStats(USER_ID);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get dashboard stats' });
  }
});

// Weekly report
router.get('/weekly-report', async (_req: Request, res: Response) => {
  try {
    const report = await analyticsService.getWeeklyReport(USER_ID);
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get weekly report' });
  }
});

// Subject analytics
router.get('/subject/:subjectId', async (req: Request, res: Response) => {
  try {
    const analytics = await analyticsService.getSubjectAnalytics(req.params.subjectId as string, USER_ID);
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get subject analytics' });
  }
});

// Log study session
router.post('/session', async (req: Request, res: Response) => {
  try {
    const session = new StudySession({ ...req.body, userId: USER_ID });
    await session.save();
    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ error: 'Failed to log session' });
  }
});

// Get study sessions
router.get('/sessions', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const sessions = await StudySession.find({ userId: USER_ID })
      .populate('lessonId', 'title')
      .populate('subjectId', 'name color')
      .sort({ startTime: -1 })
      .limit(limit);
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

// Get execution logs
router.get('/execution-logs', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const logs = await ExecutionLog.find({ userId: USER_ID })
      .populate('lessonId', 'title')
      .populate('subjectId', 'name color icon')
      .populate('chapterId', 'title')
      .sort({ timestamp: -1 })
      .limit(limit);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch execution logs' });
  }
});

// Get knowledge graph data
router.get('/knowledge-graph', async (_req: Request, res: Response) => {
  try {
    const nodes = await KnowledgeNode.find({ userId: USER_ID });

    // Build graph data for React Flow
    const graphNodes = nodes.map((node) => ({
      id: node._id.toString(),
      type: node.type,
      data: {
        label: node.label,
        masteryScore: node.masteryScore,
        type: node.type,
        subjectId: node.subjectId?.toString(),
        chapterId: node.chapterId?.toString(),
        lessonId: node.lessonId?.toString(),
      },
      position: { x: node.positionX, y: node.positionY },
    }));

    // Auto-generate edges
    const edges: any[] = [];
    nodes.forEach((node) => {
      if (node.type === 'chapter' && node.subjectId) {
        const parentNode = nodes.find(
          (n) => n.type === 'subject' && n.subjectId?.toString() === node.subjectId?.toString()
        );
        if (parentNode) {
          edges.push({
            id: `e-${parentNode._id}-${node._id}`,
            source: parentNode._id.toString(),
            target: node._id.toString(),
            animated: true,
          });
        }
      }
      if (node.type === 'lesson' && node.chapterId) {
        const parentNode = nodes.find(
          (n) => n.type === 'chapter' && n.chapterId?.toString() === node.chapterId?.toString()
        );
        if (parentNode) {
          edges.push({
            id: `e-${parentNode._id}-${node._id}`,
            source: parentNode._id.toString(),
            target: node._id.toString(),
            animated: true,
          });
        }
      }
      // Manual connections
      node.connections.forEach((connId) => {
        edges.push({
          id: `e-${node._id}-${connId}`,
          source: node._id.toString(),
          target: connId.toString(),
          style: { stroke: '#6366f1' },
        });
      });
    });

    res.json({ nodes: graphNodes, edges });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get knowledge graph' });
  }
});

// Learning paths
router.get('/learning-paths', async (_req: Request, res: Response) => {
  try {
    const paths = await LearningPath.find({ userId: USER_ID, isActive: true })
      .populate('lessonIds', 'title status masteryScore')
      .sort({ createdAt: -1 });
    res.json(paths);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch learning paths' });
  }
});

router.post('/learning-paths', async (req: Request, res: Response) => {
  try {
    const path = new LearningPath({
      ...req.body,
      userId: USER_ID,
      totalCount: req.body.lessonIds?.length || 0,
    });
    await path.save();
    res.status(201).json(path);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create learning path' });
  }
});

export default router;
