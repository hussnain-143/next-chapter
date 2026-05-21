import axios from 'axios';
import { ISubject, IChapter, ILesson, IDashboardStats, IWeeklyReport, IStudySession, IExecutionLog, ILearningPath } from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5051/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      try {
        const parsed = JSON.parse(authStorage);
        const token = parsed.state?.token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (e) {
        // Handle parsing error quietly
      }
    }
  }
  return config;
});

// Auth Endpoints
export const registerUser = (username: string, email: string, password: string) => 
  api.post('/auth/register', { username, email, password }).then((res) => res.data);
export const loginUser = (email: string, password: string) => 
  api.post('/auth/login', { email, password }).then((res) => res.data);
export const getMe = () => api.get('/auth/me').then((res) => res.data);

// Subject Endpoints
export const getSubjects = () => api.get<ISubject[]>('/subjects').then((res) => res.data);
export const reorderSubjects = (order: { id: string; order: number }[]) =>
  api.put<{ message: string }>('/subjects/reorder', { order }).then((res) => res.data);
export const getSubject = (id: string) => api.get<ISubject>(`/subjects/${id}`).then((res) => res.data);
export const createSubject = (data: Partial<ISubject>) => api.post<ISubject>('/subjects', data).then((res) => res.data);
export const updateSubject = (id: string, data: Partial<ISubject>) => api.put<ISubject>(`/subjects/${id}`, data).then((res) => res.data);
export const deleteSubject = (id: string) => api.delete<{ message: string }>(`/subjects/${id}`).then((res) => res.data);
export const recalculateSubject = (id: string) => api.post<ISubject>(`/subjects/${id}/recalculate`).then((res) => res.data);

// Chapter Endpoints
export const getChapters = (subjectId: string) => api.get<IChapter[]>(`/chapters/subject/${subjectId}`).then((res) => res.data);
export const getChapter = (id: string) => api.get<IChapter>(`/chapters/${id}`).then((res) => res.data);
export const createChapter = (data: Partial<IChapter>) => api.post<IChapter>('/chapters', data).then((res) => res.data);
export const updateChapter = (id: string, data: Partial<IChapter>) => api.put<IChapter>(`/chapters/${id}`, data).then((res) => res.data);
export const deleteChapter = (id: string) => api.delete<{ message: string }>(`/chapters/${id}`).then((res) => res.data);
export const reorderChapters = (subjectId: string, order: { id: string; order: number }[]) =>
  api.put<{ message: string }>(`/chapters/reorder/${subjectId}`, { order }).then((res) => res.data);
export const recalculateChapter = (id: string) => api.post<IChapter>(`/chapters/${id}/recalculate`).then((res) => res.data);

// Lesson Endpoints
export const getLessons = (chapterId: string) => api.get<ILesson[]>(`/lessons/chapter/${chapterId}`).then((res) => res.data);
export const getLesson = (id: string) => api.get<ILesson>(`/lessons/${id}`).then((res) => res.data);
export const createLesson = (data: Partial<ILesson>) => api.post<ILesson>('/lessons', data).then((res) => res.data);
export const updateLesson = (id: string, data: Partial<ILesson>) => api.put<ILesson>(`/lessons/${id}`, data).then((res) => res.data);
export const deleteLesson = (id: string) => api.delete<{ message: string }>(`/lessons/${id}`).then((res) => res.data);
export const toggleBookmark = (id: string) => api.patch<ILesson>(`/lessons/${id}/bookmark`).then((res) => res.data);
export const getBookmarkedLessons = () => api.get<ILesson[]>('/lessons/bookmarked').then((res) => res.data);
export const getDueReviewLessons = () => api.get<ILesson[]>('/lessons/due-review').then((res) => res.data);
export const searchLessons = (q: string) => api.get<ILesson[]>(`/lessons/search?q=${q}`).then((res) => res.data);

// AI Endpoints
export const generateQuiz = (lessonId: string) => api.post(`/ai/quiz/${lessonId}`).then((res) => res.data);
export const generateFlashcards = (lessonId: string) => api.post(`/ai/flashcards/${lessonId}`).then((res) => res.data);
export const generateCodingChallenge = (lessonId: string) => api.post(`/ai/coding-challenge/${lessonId}`).then((res) => res.data);
export const generateInterview = (lessonId: string) => api.post(`/ai/interview/${lessonId}`).then((res) => res.data);
export const summarizeLesson = (lessonId: string) => api.post(`/ai/summarize/${lessonId}`).then((res) => res.data);
export const generatePracticeTasks = (lessonId: string) => api.post(`/ai/practice/${lessonId}`).then((res) => res.data);
export const generateProjects = (subjectId: string) => api.post(`/ai/projects/${subjectId}`).then((res) => res.data);
export const chatWithAI = (messages: { role: 'user' | 'assistant'; content: string }[], context?: string) =>
  api.post<{ message: string }>('/ai/chat', { messages, context }).then((res) => res.data);
export const getWeakTopics = () => api.get<{ weakTopics: { lessonTitle: string; reason: string; suggestedAction: string; priority: string }[] }>('/ai/weak-topics').then((res) => res.data);
export const getRecommendations = () => api.get<{ recommendations: { title: string; description: string; reason: string; type: string; priority: number }[] }>('/ai/recommendations').then((res) => res.data);

// Analytics Endpoints
export const getDashboardStats = () => api.get<IDashboardStats>('/analytics/dashboard').then((res) => res.data);
export const getWeeklyReport = () => api.get<IWeeklyReport>('/analytics/weekly-report').then((res) => res.data);
export const getSubjectAnalytics = (subjectId: string) => api.get<any>(`/analytics/subject/${subjectId}`).then((res) => res.data);
export const logSession = (data: Partial<IStudySession>) => api.post<IStudySession>('/analytics/session', data).then((res) => res.data);
export const getSessions = (limit?: number) => api.get<IStudySession[]>(`/analytics/sessions${limit ? `?limit=${limit}` : ''}`).then((res) => res.data);
export const getExecutionLogs = (limit?: number) => api.get<IExecutionLog[]>(`/analytics/execution-logs${limit ? `?limit=${limit}` : ''}`).then((res) => res.data);
export const getKnowledgeGraph = () => api.get<{ nodes: any[]; edges: any[] }>('/analytics/knowledge-graph').then((res) => res.data);
export const getLearningPaths = () => api.get<ILearningPath[]>('/analytics/learning-paths').then((res) => res.data);
export const createLearningPath = (data: { title: string; lessonIds: string[]; scheduledDates: string[]; spacedRepetitionInterval: number[] }) =>
  api.post<ILearningPath>('/analytics/learning-paths', data).then((res) => res.data);
