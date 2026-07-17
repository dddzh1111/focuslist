import { z } from 'zod';

export const updateSettingsSchema = z.object({
  focusDuration: z.number().int().min(1).max(120).optional(),
  shortBreakDuration: z.number().int().min(1).max(30).optional(),
  longBreakDuration: z.number().int().min(1).max(60).optional(),
  longBreakInterval: z.number().int().min(1).max(10).optional(),
  autoStartBreak: z.boolean().optional(),
  autoStartFocus: z.boolean().optional(),
  whiteNoise: z.enum(['none', 'rain', 'forest', 'cafe']).optional(),
  volume: z.number().int().min(0).max(100).optional(),
});
