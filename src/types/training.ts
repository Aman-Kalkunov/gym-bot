export enum TrainingType {
  CROSS_FIT = 'crossfit',
}

export enum TrainingTime {
  '9:00' = '18:00',
  '10:00' = '19:00',
  '11:00' = '20:00',
  '12:00' = '18:00',
  '13:00' = '19:00',
  '14:00' = '20:00',
  '15:00' = '19:00',
  '16:00' = '20:00',
  '17:00' = '18:00',
  '18:00' = '18:00',
  '19:00' = '19:00',
  '20:00' = '20:00',
}

export interface ITraining {
  id: number;
  date: Date;
  dayOfWeek: number;
  time: string;
  capacity: number;
  booked: number;
}

export interface ISlot {
  id: number;
  time: string;
}
