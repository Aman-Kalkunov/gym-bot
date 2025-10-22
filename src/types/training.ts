export enum TrainingType {
  Crossfit = "crossfit",
  Stretching = "stretching",
  Weightlifting = "weightlifting",
}

export enum Weekday {
  Monday = 1,
  Tuesday,
  Wednesday,
  Thursday,
  Friday,
  Saturday,
  Sunday,
}

export enum TrainingTime {
  "18:00" = "18:00",
  "19:00" = "19:00",
  "20:00" = "20:00",
}

export interface Training {
  id: string;
  type: TrainingType;
  day: Weekday;
  time: TrainingTime;
  capacity?: number;
  booked?: number;
}
