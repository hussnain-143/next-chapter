import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

export const generateQuiz = async (lessonContent: string, lessonTitle: string) => {
  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are a quiz generator. Generate 5 multiple-choice questions based on the lesson content. Return JSON array with objects containing: question, options (array of 4), correctAnswer (index 0-3), explanation.',
      },
      {
        role: 'user',
        content: `Generate a quiz for the lesson "${lessonTitle}":\n\n${lessonContent}`,
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.7,
  });

  return JSON.parse(response.choices[0].message.content || '{"questions":[]}');
};

export const generateFlashcards = async (lessonContent: string, lessonTitle: string) => {
  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are a flashcard generator. Generate 10 flashcards based on the lesson content. Return JSON array with objects containing: front (question/term), back (answer/definition), difficulty (easy/medium/hard).',
      },
      {
        role: 'user',
        content: `Generate flashcards for "${lessonTitle}":\n\n${lessonContent}`,
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.7,
  });

  return JSON.parse(response.choices[0].message.content || '{"flashcards":[]}');
};

export const generateCodingChallenge = async (lessonContent: string, lessonTitle: string) => {
  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are a coding challenge generator. Generate 3 coding challenges based on the lesson. Return JSON with challenges array containing: title, description, difficulty (easy/medium/hard), hints (array), sampleInput, expectedOutput, starterCode.',
      },
      {
        role: 'user',
        content: `Generate coding challenges for "${lessonTitle}":\n\n${lessonContent}`,
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.7,
  });

  return JSON.parse(response.choices[0].message.content || '{"challenges":[]}');
};

export const generateInterviewQuestions = async (lessonContent: string, lessonTitle: string) => {
  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are an interview prep assistant. Generate 5 interview questions based on the lesson content. Return JSON with questions array containing: question, expectedAnswer, difficulty (easy/medium/hard), category (conceptual/practical/behavioral).',
      },
      {
        role: 'user',
        content: `Generate interview questions for "${lessonTitle}":\n\n${lessonContent}`,
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.7,
  });

  return JSON.parse(response.choices[0].message.content || '{"questions":[]}');
};

export const summarizeLesson = async (lessonContent: string, lessonTitle: string) => {
  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are a study assistant. Summarize the lesson content into clear, concise bullet points. Return JSON with summary (string), keyPoints (array of strings), prerequisites (array), and relatedTopics (array).',
      },
      {
        role: 'user',
        content: `Summarize the lesson "${lessonTitle}":\n\n${lessonContent}`,
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.5,
  });

  return JSON.parse(response.choices[0].message.content || '{"summary":"","keyPoints":[]}');
};

export const generatePracticeTasks = async (lessonContent: string, lessonTitle: string) => {
  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are a practice task generator. Generate 5 practical tasks to reinforce learning. Return JSON with tasks array containing: title, description, estimatedTime (minutes), difficulty, type (exercise/project/research).',
      },
      {
        role: 'user',
        content: `Generate practice tasks for "${lessonTitle}":\n\n${lessonContent}`,
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.7,
  });

  return JSON.parse(response.choices[0].message.content || '{"tasks":[]}');
};

export const generateProjectSuggestions = async (subjectName: string, lessons: string[]) => {
  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are a project advisor. Suggest 3 real-world projects based on the subject and completed lessons. Return JSON with projects array containing: title, description, difficulty, estimatedHours, technologies (array), learningOutcomes (array).',
      },
      {
        role: 'user',
        content: `Suggest projects for subject "${subjectName}" with lessons: ${lessons.join(', ')}`,
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.8,
  });

  return JSON.parse(response.choices[0].message.content || '{"projects":[]}');
};

export const chatWithAI = async (messages: { role: 'user' | 'assistant'; content: string }[], context: string) => {
  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are an AI study assistant for "Next Chapter" learning platform. You help users understand their study material, answer questions, explain concepts, and provide study advice. Here's the current learning context:\n\n${context}`,
      },
      ...messages,
    ],
    temperature: 0.7,
    max_tokens: 1000,
  });

  return response.choices[0].message.content;
};

export const detectWeakTopics = async (
  lessons: { title: string; masteryScore: number; status: string }[]
) => {
  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a learning analytics assistant. Analyze the student\'s lesson data and identify weak topics that need more attention. Return JSON with weakTopics array containing: lessonTitle, reason, suggestedAction, priority (high/medium/low).',
        },
        {
          role: 'user',
          content: `Analyze these lessons for weak areas:\n${JSON.stringify(lessons, null, 2)}`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.5,
    });
    return JSON.parse(response.choices[0].message.content || '{"weakTopics":[]}');
  } catch (error) {
    console.error('detectWeakTopics error:', error);
    return { weakTopics: [] };
  }
};

export const getRecommendations = async (
  completedLessons: string[],
  currentSubjects: string[],
  weakTopics: string[]
) => {
  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a personalized learning advisor. Based on the student\'s progress, suggest what to learn next. Return JSON with recommendations array containing: title, description, reason, type (new_topic/review/deepen/practice), priority (1-5).',
        },
        {
          role: 'user',
          content: `Completed: ${completedLessons.join(', ')}\nCurrent subjects: ${currentSubjects.join(', ')}\nWeak areas: ${weakTopics.join(', ')}`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });
    return JSON.parse(response.choices[0].message.content || '{"recommendations":[]}');
  } catch (error) {
    console.error('getRecommendations error:', error);
    return { recommendations: [] };
  }
};
