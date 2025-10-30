import { TrainingTime } from './training';

export const CROSS_FIT_SCHEDULE: Record<number, string[]> = {
  0: [],
  1: [
    TrainingTime['09:00'],
    TrainingTime['10:00'],
    TrainingTime['11:00'],
    TrainingTime['18:00'],
    TrainingTime['19:00'],
    TrainingTime['20:00'],
  ],
  2: [TrainingTime['18:00'], TrainingTime['19:00'], TrainingTime['20:00']],
  3: [
    TrainingTime['09:00'],
    TrainingTime['10:00'],
    TrainingTime['11:00'],
    TrainingTime['18:00'],
    TrainingTime['19:00'],
    TrainingTime['20:00'],
  ],
  4: [TrainingTime['18:00'], TrainingTime['19:00'], TrainingTime['20:00']],
  5: [
    TrainingTime['09:00'],
    TrainingTime['10:00'],
    TrainingTime['11:00'],
    TrainingTime['18:00'],
    TrainingTime['19:00'],
    TrainingTime['20:00'],
  ],
  6: [TrainingTime['10:00'], TrainingTime['11:00']],
};
