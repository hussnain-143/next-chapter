"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const analyticsService = __importStar(require("../services/analytics.service"));
const StudySession_1 = __importDefault(require("../models/StudySession"));
const ExecutionLog_1 = __importDefault(require("../models/ExecutionLog"));
const KnowledgeNode_1 = __importDefault(require("../models/KnowledgeNode"));
const LearningPath_1 = __importDefault(require("../models/LearningPath"));
const router = (0, express_1.Router)();
const USER_ID = 'default-user';
// Dashboard stats
router.get('/dashboard', async (_req, res) => {
    try {
        const stats = await analyticsService.getDashboardStats(USER_ID);
        res.json(stats);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to get dashboard stats' });
    }
});
// Weekly report
router.get('/weekly-report', async (_req, res) => {
    try {
        const report = await analyticsService.getWeeklyReport(USER_ID);
        res.json(report);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to get weekly report' });
    }
});
// Subject analytics
router.get('/subject/:subjectId', async (req, res) => {
    try {
        const analytics = await analyticsService.getSubjectAnalytics(req.params.subjectId, USER_ID);
        res.json(analytics);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to get subject analytics' });
    }
});
// Log study session
router.post('/session', async (req, res) => {
    try {
        const session = new StudySession_1.default({ ...req.body, userId: USER_ID });
        await session.save();
        res.status(201).json(session);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to log session' });
    }
});
// Get study sessions
router.get('/sessions', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20;
        const sessions = await StudySession_1.default.find({ userId: USER_ID })
            .populate('lessonId', 'title')
            .populate('subjectId', 'name color')
            .sort({ startTime: -1 })
            .limit(limit);
        res.json(sessions);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch sessions' });
    }
});
// Get execution logs
router.get('/execution-logs', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const logs = await ExecutionLog_1.default.find({ userId: USER_ID })
            .populate('lessonId', 'title')
            .populate('subjectId', 'name color icon')
            .populate('chapterId', 'title')
            .sort({ timestamp: -1 })
            .limit(limit);
        res.json(logs);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch execution logs' });
    }
});
// Get knowledge graph data
router.get('/knowledge-graph', async (_req, res) => {
    try {
        const nodes = await KnowledgeNode_1.default.find({ userId: USER_ID });
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
        const edges = [];
        nodes.forEach((node) => {
            if (node.type === 'chapter' && node.subjectId) {
                const parentNode = nodes.find((n) => n.type === 'subject' && n.subjectId?.toString() === node.subjectId?.toString());
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
                const parentNode = nodes.find((n) => n.type === 'chapter' && n.chapterId?.toString() === node.chapterId?.toString());
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
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to get knowledge graph' });
    }
});
// Learning paths
router.get('/learning-paths', async (_req, res) => {
    try {
        const paths = await LearningPath_1.default.find({ userId: USER_ID, isActive: true })
            .populate('lessonIds', 'title status masteryScore')
            .sort({ createdAt: -1 });
        res.json(paths);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch learning paths' });
    }
});
router.post('/learning-paths', async (req, res) => {
    try {
        const path = new LearningPath_1.default({
            ...req.body,
            userId: USER_ID,
            totalCount: req.body.lessonIds?.length || 0,
        });
        await path.save();
        res.status(201).json(path);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create learning path' });
    }
});
exports.default = router;
//# sourceMappingURL=analytics.routes.js.map