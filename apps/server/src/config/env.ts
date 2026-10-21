import { z } from 'zod';

export const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  GRAPH_DATA_PATH: z.string().min(1).default('data/train-ticket.json'),
});

export type Env = z.infer<typeof envSchema>;

export const ENV = Symbol('ENV');
