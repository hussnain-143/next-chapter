"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = __importDefault(require("./config/database"));
const subjects_routes_1 = __importDefault(require("./routes/subjects.routes"));
const chapters_routes_1 = __importDefault(require("./routes/chapters.routes"));
const lessons_routes_1 = __importDefault(require("./routes/lessons.routes"));
const ai_routes_1 = __importDefault(require("./routes/ai.routes"));
const analytics_routes_1 = __importDefault(require("./routes/analytics.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middleware
app.use((0, cors_1.default)({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
// Health check
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', message: 'Next Chapter API is running 🚀' });
});
// Routes
app.use('/api/subjects', subjects_routes_1.default);
app.use('/api/chapters', chapters_routes_1.default);
app.use('/api/lessons', lessons_routes_1.default);
app.use('/api/ai', ai_routes_1.default);
app.use('/api/analytics', analytics_routes_1.default);
// Error handler
app.use((err, _req, res, _next) => {
    console.error('Error:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
});
// Start server
const startServer = async () => {
    await (0, database_1.default)();
    app.listen(PORT, () => {
        console.log(`🚀 Next Chapter API running on http://localhost:${PORT}`);
        console.log(`📚 Health check: http://localhost:${PORT}/api/health`);
    });
};
startServer().catch(console.error);
exports.default = app;
//# sourceMappingURL=index.js.map