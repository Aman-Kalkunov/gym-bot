export enum TrainingType {
  CROSS_FIT = 'crossfit',
}

export enum TrainingTime {
  '09:00' = '09:00',
  '10:00' = '10:00',
  '11:00' = '11:00',
  '12:00' = '12:00',
  '13:00' = '13:00',
  '14:00' = '14:00',
  '15:00' = '15:00',
  '16:00' = '16:00',
  '17:00' = '17:00',
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

export interface IBooking {
  id: number;
  userId: number;
  userName: string;
  userNick: string | null;
  trainingId: number;
  training: ITraining;
  createdAt: Date;
}

export type MessageType = 'reply' | 'edit';
