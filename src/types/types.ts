export const CAPACITY = 12;

export enum BotCommand {
  INFO = 'info',
  SCHEDULE = 'schedule',
  MY_BOOKINGS = 'my_bookings',
  ADMIN_PANEL = 'admin_panel',
}

export enum BotCommandText {
  INFO = 'Информация',
  SCHEDULE = 'Записаться',
  MY_BOOKINGS = 'Мои записи',
  ADMIN_PANEL = 'Админ-панель',
}

export enum TrainingTime {
  '07:00' = '07:00',
  '08:00' = '08:00',
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
  '21:00' = '21:00',
  '22:00' = '22:00',
}

export const CROSS_FIT_SCHEDULE: Record<number, string[]> = {
  0: [],
  1: [
    TrainingTime['09:00'],
    TrainingTime['10:00'],
    TrainingTime['18:00'],
    TrainingTime['19:00'],
    TrainingTime['20:00'],
  ],
  2: [TrainingTime['18:00'], TrainingTime['19:00'], TrainingTime['20:00']],
  3: [
    TrainingTime['09:00'],
    TrainingTime['10:00'],
    TrainingTime['18:00'],
    TrainingTime['19:00'],
    TrainingTime['20:00'],
  ],
  4: [TrainingTime['18:00'], TrainingTime['19:00'], TrainingTime['20:00']],
  5: [
    TrainingTime['09:00'],
    TrainingTime['10:00'],
    TrainingTime['18:00'],
    TrainingTime['19:00'],
    TrainingTime['20:00'],
  ],
  6: [TrainingTime['10:00'], TrainingTime['11:00']],
};

export const CROSS_FIT_ALL_TIME = [
  TrainingTime['07:00'],
  TrainingTime['08:00'],
  TrainingTime['09:00'],
  TrainingTime['10:00'],
  TrainingTime['11:00'],
  TrainingTime['12:00'],
  TrainingTime['13:00'],
  TrainingTime['14:00'],
  TrainingTime['15:00'],
  TrainingTime['16:00'],
  TrainingTime['17:00'],
  TrainingTime['18:00'],
  TrainingTime['19:00'],
  TrainingTime['20:00'],
  TrainingTime['21:00'],
  TrainingTime['22:00'],
];

export interface ITraining {
  id: number;
  date: string;
  dayOfWeek: number;
  time: string;
  capacity: number;
  booked: number;
  users?: IBooking[];
}

export interface IBooking {
  id: number;
  userId: bigint | number;
  userName: string;
  userNick: string | null;
  trainingId: number;
  createdAt: Date;
  training?: ITraining;
}

export type MessageType = 'reply' | 'edit';

export enum CrossfitTypes {
  CROSS_FIT_DAY = 'CROSS_FIT_DAY',
  CROSS_FIT_TIME = 'CROSS_FIT_TIME',
  CROSS_FIT_BOOKING = 'CROSS_FIT_BOOKING',
  CROSS_FIT_CANCEL = 'CROSS_FIT_CANCEL',
  CROSS_FIT_TIME_BACK = 'CROSS_FIT_TIME_BACK',
  CROSS_FIT_DAY_BACK = 'CROSS_FIT_DAY_BACK',
  CROSS_FIT_MY_BACK = 'CROSS_FIT_MY_BACK',
  CLOSE = 'CLOSE',
}

export enum CrossfitTypesText {
  CLOSE = 'Закрыть',
}

export enum InfoButtons {
  INFO_ABOUT = 'INFO_ABOUT',
  INFO_TIMETABLE = 'INFO_TIMETABLE',
  INFO_PRICE = 'INFO_PRICE',
  INFO_FIRST_TIME = 'INFO_FIRST_TIME',
  INFO_PROMOTIONS = 'INFO_PROMOTIONS',
  INFO_CONTACTS = 'INFO_CONTACTS',
  INFO_QUESTION = 'INFO_QUESTION',
}

export enum InfoButtonsText {
  INFO_ABOUT = 'О нас',
  INFO_TIMETABLE = 'Расписание',
  INFO_PRICE = 'Стоимость занятий',
  INFO_FIRST_TIME = 'Первая тренировка',
  INFO_PROMOTIONS = 'Акции',
  INFO_CONTACTS = 'Контакты',
  INFO_QUESTION = 'Задать вопрос',
}

export enum ScheduleButtons {
  CROSS_FIT = 'CROSS_FIT',
  WEIGHTLIFTING = 'WEIGHTLIFTING',
}

export enum ScheduleButtonsText {
  CROSS_FIT = 'Кроссфит',
  WEIGHTLIFTING = 'Тяжелая атлетика',
}

export enum AdminButtons {
  ADMIN_SCHEDULE = 'ADMIN_SCHEDULE',
  ADMIN_DAY = 'ADMIN_DAY',
  ADMIN_ADD_DAY = 'ADMIN_ADD_DAY',
  ADMIN_SELECT_DAY = 'ADMIN_SELECT_DAY',
  ADMIN_CONFIRM_ADD = 'ADMIN_CONFIRM_ADD',
  ADMIN_SELECT_ADD_TIME = 'ADMIN_SELECT_ADD_TIME',
  ADMIN_ADD_TIME = 'ADMIN_ADD_TIME',
  ADMIN_REMOVE_TIME = 'ADMIN_REMOVE_TIME',
  ADMIN_SELECT_REMOVE_TIME = 'ADMIN_SELECT_REMOVE_TIME',
  ADMIN_REMOVE_DAY = 'ADMIN_REMOVE_DAY',
  ADMIN_BOOKINGS = 'ADMIN_BOOKINGS',
  ADMIN_BACK = 'ADMIN_BACK',
}

export enum AdminButtonsText {
  ADMIN_SCHEDULE = 'Расписание',
  ADMIN_ADD_DAY = 'Добавить день',
  ADMIN_ADD_TIME = 'Добавить время тренировки',
  ADMIN_REMOVE_TIME = 'Удалить время тренировки',
  ADMIN_REMOVE_DAY = 'Удалить день',
  ADMIN_BOOKINGS = 'Список записавшихся',
  ADMIN_BACK = 'Назад',
}

export enum WeightliftingButtons {
  WEIGHTLIFTING_WEN = 'WEIGHTLIFTING_WEN',
  WEIGHTLIFTING_RFI = 'WEIGHTLIFTING_RFI',
}

export enum WeightliftingButtonsText {
  WEIGHTLIFTING_WEN = 'Среда 17:00',
  WEIGHTLIFTING_RFI = 'Пятница 17:00',
}

export interface Route {
  match: (data: string) => boolean;
  handler: (ctx: any, match: RegExpMatchArray | null) => Promise<void>;
}
