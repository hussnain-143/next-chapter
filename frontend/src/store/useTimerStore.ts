import { create } from 'zustand';

type TimerMode = 'focus' | 'short' | 'long';

interface TimerState {
  mode: TimerMode;
  timeLeft: number;
  isRunning: boolean;
  pomodoroCount: number;
  focusLength: number; // in minutes
  shortLength: number;
  longLength: number;
  setMode: (mode: TimerMode) => void;
  setTimeLeft: (time: number) => void;
  setIsRunning: (isRunning: boolean) => void;
  incrementPomodoro: () => void;
  resetTimer: () => void;
  setLengths: (focus: number, short: number, long: number) => void;
  tick: () => void;
}

export const useTimerStore = create<TimerState>((set, get) => ({
  mode: 'focus',
  timeLeft: 25 * 60,
  isRunning: false,
  pomodoroCount: 0,
  focusLength: 25,
  shortLength: 5,
  longLength: 15,
  setMode: (mode) => {
    const state = get();
    let time = state.focusLength * 60;
    if (mode === 'short') time = state.shortLength * 60;
    if (mode === 'long') time = state.longLength * 60;
    set({ mode, timeLeft: time, isRunning: false });
  },
  setTimeLeft: (timeLeft) => set({ timeLeft }),
  setIsRunning: (isRunning) => set({ isRunning }),
  incrementPomodoro: () => set((state) => ({ pomodoroCount: state.pomodoroCount + 1 })),
  resetTimer: () => {
    const state = get();
    state.setMode(state.mode);
  },
  setLengths: (focus, short, long) => {
    set({ focusLength: focus, shortLength: short, longLength: long });
    const state = get();
    state.resetTimer();
  },
  tick: () => {
    const state = get();
    if (state.timeLeft <= 1) {
      if (state.mode === 'focus') {
        state.incrementPomodoro();
        state.setMode('short');
      } else {
        state.setMode('focus');
      }
    } else {
      set({ timeLeft: state.timeLeft - 1 });
    }
  },
}));
