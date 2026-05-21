export declare const generateQuiz: (lessonContent: string, lessonTitle: string) => Promise<any>;
export declare const generateFlashcards: (lessonContent: string, lessonTitle: string) => Promise<any>;
export declare const generateCodingChallenge: (lessonContent: string, lessonTitle: string) => Promise<any>;
export declare const generateInterviewQuestions: (lessonContent: string, lessonTitle: string) => Promise<any>;
export declare const summarizeLesson: (lessonContent: string, lessonTitle: string) => Promise<any>;
export declare const generatePracticeTasks: (lessonContent: string, lessonTitle: string) => Promise<any>;
export declare const generateProjectSuggestions: (subjectName: string, lessons: string[]) => Promise<any>;
export declare const chatWithAI: (messages: {
    role: "user" | "assistant";
    content: string;
}[], context: string) => Promise<string | null>;
export declare const detectWeakTopics: (lessons: {
    title: string;
    masteryScore: number;
    status: string;
}[]) => Promise<any>;
export declare const getRecommendations: (completedLessons: string[], currentSubjects: string[], weakTopics: string[]) => Promise<any>;
//# sourceMappingURL=openai.service.d.ts.map