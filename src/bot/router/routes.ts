import {
  AdminButtons,
  CrossfitTypes,
  HealthyBackTypes,
  Route,
  WeightliftingButtons,
} from '../../types/types';

import {
  handleCrossfit,
  handleCrossfitDay,
  handleCrossfitTime,
} from '../handlers/schedule/handleCrossfit';

import {
  handleBookingInfo,
  handleCancelBooking,
  handleMyBookings,
} from '../handlers/booking/handleBooking';

import {
  addTrainingTime,
  handleAdminAddDay,
  handleAdminAddTime,
  handleAdminConfirmAdd,
  handleAdminRemoveDay,
  handleAdminRemoveTime,
  handleAdminSchedule,
  handleAdminScheduleDay,
  handleAdminSelectTime,
  removeTrainingTime,
} from '../handlers/admin/handleAdminSchedule';

import { scheduleButtons } from '../keyboards/scheduleButtons';

import { TrainingType } from '@prisma/client';
import { handleAdminBookings } from '../handlers/admin/handleAdminBookings';
import {
  handleHealthyBack,
  handleHealthyBackDay,
  handleHealthyBackTime,
} from '../handlers/schedule/handleHealthyBack';
import { handleWeightliftingDay } from '../handlers/schedule/handleWeightlifting';

export const routes: Route[] = [
  // SYSTEM
  {
    match: d => d === CrossfitTypes.CLOSE,
    handler: async ctx => {
      await ctx.editMessageReplyMarkup(undefined);
      await ctx.answerCbQuery();
    },
  },

  {
    match: d => d === CrossfitTypes.CROSS_FIT_TIME_BACK,
    handler: async ctx => {
      await handleCrossfit(ctx, 'edit');
      await ctx.answerCbQuery();
    },
  },

  {
    match: d => d === HealthyBackTypes.HEALTHY_BACK_TIME_BACK,
    handler: async ctx => {
      await handleHealthyBack(ctx, 'edit');
      await ctx.answerCbQuery();
    },
  },

  {
    match: d => d === CrossfitTypes.CROSS_FIT_DAY_BACK,
    handler: async ctx => {
      await ctx.editMessageText('Выберите тип тренировки', scheduleButtons);
      await ctx.answerCbQuery();
    },
  },

  {
    match: d => d === HealthyBackTypes.HEALTHY_BACK_DAY_BACK,
    handler: async ctx => {
      await ctx.editMessageText('Выберите тип тренировки', scheduleButtons);
      await ctx.answerCbQuery();
    },
  },

  {
    match: d => d === CrossfitTypes.CROSS_FIT_MY_BACK,
    handler: async ctx => {
      await handleMyBookings(ctx, 'edit');
      await ctx.answerCbQuery();
    },
  },

  // CROSSFIT — DAY
  {
    match: d => d.startsWith(`${CrossfitTypes.CROSS_FIT_DAY}_`),
    handler: async (ctx, m) => {
      const day = Number(ctx.callbackQuery.data.split('_')[3]);
      if (Number.isNaN(day)) return ctx.answerCbQuery('Некорректный день');
      await handleCrossfitDay(ctx, day, 'edit');
      await ctx.answerCbQuery();
    },
  },

  // HEALTHY — DAY
  {
    match: d => d.startsWith(`${HealthyBackTypes.HEALTHY_BACK_DAY}_`),
    handler: async (ctx, m) => {
      const day = Number(ctx.callbackQuery.data.split('_')[3]);
      if (Number.isNaN(day)) return ctx.answerCbQuery('Некорректный день');
      await handleHealthyBackDay(ctx, day, 'edit');
      await ctx.answerCbQuery();
    },
  },

  // CROSSFIT — TIME
  {
    match: d => d.startsWith(`${CrossfitTypes.CROSS_FIT_TIME}_`),
    handler: async ctx => {
      const trainingId = Number(ctx.callbackQuery.data.split('_')[3]);
      if (Number.isNaN(trainingId)) return ctx.answerCbQuery('Некорректное время');
      await handleCrossfitTime(ctx, trainingId, process.env.ADMIN_ID!);
      await ctx.answerCbQuery();
    },
  },

  // HEALTHY — TIME
  {
    match: d => d.startsWith(`${HealthyBackTypes.HEALTHY_BACK_TIME}_`),
    handler: async ctx => {
      const trainingId = Number(ctx.callbackQuery.data.split('_')[3]);
      if (Number.isNaN(trainingId)) return ctx.answerCbQuery('Некорректное время');
      await handleHealthyBackTime(ctx, trainingId, process.env.ADMIN_ID!);
      await ctx.answerCbQuery();
    },
  },

  // BOOKING INFO / CANCEL
  {
    match: d => d.startsWith(`${CrossfitTypes.CROSS_FIT_BOOKING}_`),
    handler: async ctx => {
      const id = Number(ctx.callbackQuery.data.split('_')[3]);
      if (Number.isNaN(id)) {
        return ctx.answerCbQuery('Ошибка');
      }
      await handleBookingInfo(ctx, id);
      await ctx.answerCbQuery();
    },
  },

  {
    match: d => d.startsWith(`${HealthyBackTypes.HEALTHY_BACK_BOOKING}_`),
    handler: async ctx => {
      const id = Number(ctx.callbackQuery.data.split('_')[3]);
      if (Number.isNaN(id)) {
        return ctx.answerCbQuery('Ошибка');
      }
      await handleBookingInfo(ctx, id);
      await ctx.answerCbQuery();
    },
  },

  {
    match: d => d.startsWith(`${CrossfitTypes.CROSS_FIT_CANCEL}_`),
    handler: async ctx => {
      const id = Number(ctx.callbackQuery.data.split('_')[3]);
      if (Number.isNaN(id)) {
        return ctx.answerCbQuery('Ошибка');
      }
      await handleCancelBooking(ctx, id, process.env.ADMIN_ID!);
      await ctx.answerCbQuery();
    },
  },

  // ADMIN — DAY
  {
    match: d => d.startsWith(`${AdminButtons.ADMIN_DAY}_`),
    handler: async ctx => {
      const day = Number(ctx.callbackQuery.data.split('_')[2]);
      const type = ctx.callbackQuery.data.split('_')[3];

      if (Number.isNaN(day) || !(type === TrainingType.CROSSFIT || type === TrainingType.BACK)) {
        return ctx.answerCbQuery('Ошибка');
      }
      await handleAdminScheduleDay(ctx, day, type);
      await ctx.answerCbQuery();
    },
  },

  // ADMIN — ADD DAY
  {
    match: d => d.startsWith(`${AdminButtons.ADMIN_ADD_DAY}_`),

    handler: async ctx => {
      const type = ctx.callbackQuery.data.split('_')[3];
      if (type === TrainingType.CROSSFIT || type === TrainingType.BACK) {
        await handleAdminAddDay(ctx, type);
        await ctx.answerCbQuery();
      } else {
        return ctx.answerCbQuery('Ошибка');
      }
    },
  },

  {
    match: d => d.startsWith(`${AdminButtons.ADMIN_SELECT_DAY}_`),
    handler: async ctx => {
      const day = Number(ctx.callbackQuery.data.split('_')[3]);
      const type = ctx.callbackQuery.data.split('_')[4];
      if (Number.isNaN(day) || !(type === TrainingType.CROSSFIT || type === TrainingType.BACK)) {
        return ctx.answerCbQuery('Ошибка');
      }
      await handleAdminSelectTime(ctx, day, type);
      await ctx.answerCbQuery();
    },
  },

  {
    match: d => d.startsWith(`${AdminButtons.ADMIN_CONFIRM_ADD}_`),
    handler: async ctx => {
      const [, , , day, time, type] = ctx.callbackQuery.data.split('_');
      const dayOfWeek = Number(day);
      if (Number.isNaN(day) || !(type === TrainingType.CROSSFIT || type === TrainingType.BACK)) {
        return ctx.answerCbQuery('Ошибка');
      }
      await handleAdminConfirmAdd(ctx, dayOfWeek, time, type);
      await ctx.answerCbQuery();
    },
  },

  // ADMIN — ADD TIME
  {
    match: d => d.startsWith(`${AdminButtons.ADMIN_ADD_TIME}_`),
    handler: async ctx => {
      const day = Number(ctx.callbackQuery.data.split('_')[3]);
      const type = ctx.callbackQuery.data.split('_')[4];
      if (Number.isNaN(day) || !(type === TrainingType.CROSSFIT || type === TrainingType.BACK)) {
        return ctx.answerCbQuery('Ошибка');
      }
      await handleAdminAddTime(ctx, day, type);
      await ctx.answerCbQuery();
    },
  },

  {
    match: d => d.startsWith(`${AdminButtons.ADMIN_SELECT_ADD_TIME}_`),
    handler: async ctx => {
      const [, , , , day, time, type] = ctx.callbackQuery.data.split('_');
      const dayOfWeek = Number(day);
      if (
        Number.isNaN(dayOfWeek) ||
        !(type === TrainingType.CROSSFIT || type === TrainingType.BACK)
      ) {
        return ctx.answerCbQuery('Ошибка');
      }
      await addTrainingTime(ctx, dayOfWeek, time, type);
      await ctx.answerCbQuery();
    },
  },

  // ADMIN — REMOVE TIME
  {
    match: d => d.startsWith(`${AdminButtons.ADMIN_REMOVE_TIME}_`),
    handler: async ctx => {
      const day = Number(ctx.callbackQuery.data.split('_')[3]);
      const type = ctx.callbackQuery.data.split('_')[4];
      if (Number.isNaN(day) || !(type === TrainingType.CROSSFIT || type === TrainingType.BACK)) {
        return ctx.answerCbQuery('Ошибка');
      }
      await handleAdminRemoveTime(ctx, day, type);
      await ctx.answerCbQuery();
    },
  },

  {
    match: d => d.startsWith(`${AdminButtons.ADMIN_SELECT_REMOVE_TIME}_`),
    handler: async ctx => {
      const id = Number(ctx.callbackQuery.data.split('_')[4]);
      if (Number.isNaN(id)) {
        return ctx.answerCbQuery('Ошибка');
      }
      await removeTrainingTime(ctx, id);
      await ctx.answerCbQuery();
    },
  },

  // ADMIN — REMOVE DAY
  {
    match: d => d.startsWith(`${AdminButtons.ADMIN_REMOVE_DAY}_`),
    handler: async ctx => {
      const day = Number(ctx.callbackQuery.data.split('_')[3]);
      const type = ctx.callbackQuery.data.split('_')[4];
      if (Number.isNaN(day) || !(type === TrainingType.CROSSFIT || type === TrainingType.BACK)) {
        return ctx.answerCbQuery('Ошибка');
      }
      await handleAdminRemoveDay(ctx, day, type);
      await ctx.answerCbQuery();
    },
  },

  // ADMIN — SCHEDULE ROOT
  {
    match: d => d.startsWith(`${AdminButtons.ADMIN_SCHEDULE}_`),
    handler: async ctx => {
      const type = ctx.callbackQuery.data.split('_')[2];
      if (type === TrainingType.CROSSFIT || type === TrainingType.BACK) {
        await handleAdminSchedule(ctx, type);
        await ctx.answerCbQuery();
      } else {
        return ctx.answerCbQuery('Ошибка');
      }
    },
  },

  {
    match: d => d.startsWith(`${AdminButtons.ADMIN_BOOKINGS}_`),
    handler: async ctx => {
      const dayOfWeek = Number(ctx.callbackQuery.data.split('_')[2]);
      const type = ctx.callbackQuery.data.split('_')[3];
      if (
        Number.isNaN(dayOfWeek) ||
        !(type === TrainingType.CROSSFIT || type === TrainingType.BACK)
      ) {
        return ctx.answerCbQuery('Ошибка');
      }
      await ctx.editMessageReplyMarkup(undefined);
      await handleAdminBookings(ctx, dayOfWeek, type);
      await ctx.answerCbQuery();
    },
  },

  // WEIGHTLIFTING
  {
    match: d =>
      d === WeightliftingButtons.WEIGHTLIFTING_WEN || d === WeightliftingButtons.WEIGHTLIFTING_RFI,
    handler: async ctx => {
      await handleWeightliftingDay(ctx, ctx.callbackQuery.data, process.env.ADMIN_ID!);
      await ctx.answerCbQuery();
    },
  },
];
