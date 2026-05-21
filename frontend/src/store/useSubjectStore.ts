import { create } from 'zustand';
import { ISubject, IChapter, ILesson } from '../types';

interface SubjectState {
  subjects: ISubject[];
  currentSubject: ISubject | null;
  chapters: IChapter[];
  currentChapter: IChapter | null;
  lessons: ILesson[];
  currentLesson: ILesson | null;
  searchQuery: string;
  setSubjects: (subjects: ISubject[]) => void;
  setCurrentSubject: (subject: ISubject | null) => void;
  setChapters: (chapters: IChapter[]) => void;
  setCurrentChapter: (chapter: IChapter | null) => void;
  setLessons: (lessons: ILesson[]) => void;
  setCurrentLesson: (lesson: ILesson | null) => void;
  setSearchQuery: (query: string) => void;
}

export const useSubjectStore = create<SubjectState>((set) => ({
  subjects: [],
  currentSubject: null,
  chapters: [],
  currentChapter: null,
  lessons: [],
  currentLesson: null,
  searchQuery: '',
  setSubjects: (subjects) => set({ subjects }),
  setCurrentSubject: (currentSubject) => set({ currentSubject, currentChapter: null, currentLesson: null }),
  setChapters: (chapters) => set({ chapters }),
  setCurrentChapter: (currentChapter) => set({ currentChapter, currentLesson: null }),
  setLessons: (lessons) => set({ lessons }),
  setCurrentLesson: (currentLesson) => set({ currentLesson }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
}));
