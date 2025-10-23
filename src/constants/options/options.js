// Будние дни, кроссфит и пробные тренировки
export const allTime = [['18:00'], ['19:00'], ['20:00']];

// Понедельник, кроссфит и пробные тренировки
export const mondayTime = [['9:00'], ['18:00', '19:00'], ['20:00']];

// Вторник, кроссфит и пробные тренировки
export const tuesdayTime = [['18:00'], ['19:00'], ['20:00']];

// Среда, кроссфит и пробные тренировки
export const wednesdayTime = [['9:00', '10:00'], ['18:00', '19:00'], ['20:00']];

// Четверг, кроссфит и пробные тренировки
export const thursdayTime = [['10:00', '11:00']];

// Пятница, кроссфит и пробные тренировки
export const fridayTime = [['9:00', '10:00'], ['18:00', '19:00'], ['20:00']];

// Выходные дни, кроссфит и пробные тренировки
export const saturdayTime = [['10:00'], ['11:00']];

export const crossDays = {
  mondayTime: mondayTime,
  tuesdayTime: tuesdayTime,
  wednesdayTime: wednesdayTime,
  thursdayTime: thursdayTime,
  fridayTime: fridayTime,
  saturdayTime: saturdayTime,
};
// Тяжелая атлетика
export const weightliftingTime = ['17:00'];

// Стретчинг среда
export const stretchingNightTime = [[{ text: '19:00', callback_data: `scheduleTime~19:00` }]];

// Стретчинг суббота
export const stretchingTime = [[{ text: '11:00', callback_data: `scheduleTime~11:00` }]];

// Бокс для детей
export const boxTime = [[{ text: '16:00', callback_data: `scheduleTime~16:00` }]];

export const getScheduleDate = (targetDayId, isWeightliftin) => {
  const today = new Date();
  const currentDay = today.getDay();
  let targetDay = currentDay === 0 ? targetDayId : targetDayId - currentDay;
  if (isWeightliftin && currentDay === 6) {
    targetDay = targetDayId + 1;
  }
  const targetDate = new Date(today.setDate(today.getDate() + targetDay));
  const day = targetDate.getDate();
  const month = targetDate.getMonth() + 1;
  const year = targetDate.getFullYear();

  return `${day < 10 ? `0${day}` : day}.${month < 10 ? `0${month}` : month}.${year}`;
};

export const getAvailableDays = (days, isWeightlifti) => {
  const today = new Date().getDay();
  if (today === 6 && isWeightlifti) {
    return days;
  }
  if (today !== 0) {
    return days.filter(day => day.id >= today);
  }
  return days;
};

export const days = [
  'Воскресенье',
  'Понедельник',
  'Вторник',
  'Среда',
  'Четверг',
  'Пятница',
  'Суббота',
];

export const infoOptions = [
  [
    { text: 'О нас', callback_data: 'about' },
    { text: 'Расписание', callback_data: 'timetable' },
  ],
  [
    { text: 'Стоимость занятий', callback_data: 'price' },
    { text: 'Первая тренировка', callback_data: 'firstTime' },
  ],
  [
    { text: 'Акции', callback_data: 'promotions' },
    { text: 'Контакты', callback_data: 'contacts' },
  ],
  [{ text: 'Задать вопрос', callback_data: 'question' }],
];
export const workoutType = [
  [{ text: 'Кроссфит', callback_data: 'crossfit' }],
  [{ text: 'Тяжелая атлетика', callback_data: 'weightlifting' }],
  [{ text: 'Stretching', callback_data: 'stretching' }],
  // [{ text: "Бокс для детей", callback_data: "box" }],
  [{ text: 'Пробная бесплатная тренировка', callback_data: 'free' }],
];

export const workoutTypeOptions = {
  reply_markup: JSON.stringify({
    inline_keyboard: workoutType,
  }),
};

export const infoCommandOptions = {
  reply_markup: JSON.stringify({
    inline_keyboard: infoOptions,
  }),
};

export const getScheduleAllDay = () => [
  { id: 1, day: days[1], date: `${getScheduleDate(1)}` },
  { id: 2, day: days[2], date: `${getScheduleDate(2)}` },
  { id: 3, day: days[3], date: `${getScheduleDate(3)}` },
  { id: 4, day: days[4], date: `${getScheduleDate(4)}` },
  // { id: 5, day: days[5], date: `${getScheduleDate(5)}` },
  // { id: 6, day: days[6], date: `${getScheduleDate(6)}` },
];

export const getStretchingDay = () => [
  { id: 3, day: days[3], date: `${getScheduleDate(3)}` },
  // { id: 6, day: days[6], date: `${getScheduleDate(6)}` },
];

export const getBoxDay = () => [{ id: 4, day: days[4], date: `${getScheduleDate(4)}` }];

export const getWeightliftingDay = () => [
  { id: 1, day: days[1], date: `${getScheduleDate(1, true)}` },
  { id: 3, day: days[3], date: `${getScheduleDate(3, true)}` },
  { id: 5, day: days[5], date: `${getScheduleDate(5, true)}` },
];

export const getScheduleAllDayOptions = () => ({
  reply_markup: JSON.stringify({
    inline_keyboard: getAvailableDays(getScheduleAllDay()).map(day => {
      return [
        {
          text: `${day.day} ${day.date}`,
          callback_data: `scheduleDay:${day.id}`,
        },
      ];
    }),
  }),
});

export const getStretchingDayOptions = () => {
  return {
    reply_markup: JSON.stringify({
      inline_keyboard: getAvailableDays(getStretchingDay()).map(day => {
        return [
          {
            text: `${day.day} ${day.date}`,
            callback_data: `scheduleDay:${day.id}`,
          },
        ];
      }),
    }),
  };
};

export const getWeightliftingDayOptions = () => {
  return {
    reply_markup: JSON.stringify({
      inline_keyboard: getAvailableDays(getWeightliftingDay(), true).map(day => {
        return [
          {
            text: `${day.day} ${day.date}`,
            callback_data: `scheduleDay:${day.id}`,
          },
        ];
      }),
    }),
  };
};

export const getBoxDayOptions = () => {
  return {
    reply_markup: JSON.stringify({
      inline_keyboard: getAvailableDays(getBoxDay()).map(day => {
        return [
          {
            text: `${day.day} ${day.date}`,
            callback_data: `scheduleDay:${day.id}`,
          },
        ];
      }),
    }),
  };
};

export const timeOptions = day => {
  return {
    reply_markup: JSON.stringify({
      inline_keyboard: crossDays[day].map(row => {
        return row.map(time => {
          return {
            text: time,
            callback_data: `scheduleTime~${time}`,
          };
        });
      }),
    }),
  };
};

export const stretchingTimeOptions = nightTime => {
  return {
    reply_markup: JSON.stringify({
      inline_keyboard: nightTime ? stretchingNightTime : stretchingTime,
    }),
  };
};

export const boxTimeOptions = () => {
  return {
    reply_markup: JSON.stringify({
      inline_keyboard: boxTime,
    }),
  };
};

export const weightliftingTimeOptions = () => {
  return {
    reply_markup: JSON.stringify({
      inline_keyboard: weightliftingTime.map(time => {
        return [
          {
            text: time,
            callback_data: `scheduleTime~${time}`,
          },
        ];
      }),
    }),
  };
};
