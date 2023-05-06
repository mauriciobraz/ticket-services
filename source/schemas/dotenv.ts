import { z } from 'zod';

const NodeEnv = z.enum(['DEVELOPMENT', 'PRODUCTION']).default('DEVELOPMENT');

const DiscordToken = z
  .string()
  .regex(/^[\w-]+\.[\w-]+\.[\w-]+$/, 'Token must be in the format of a JWT');

const LogLevel = z
  .string()
  .regex(/^[0-6]$/, 'Log level must be a number between 0 and 6')
  .transform((value) => parseInt(value ?? '3', 10));

const Snowflake = z
  .string()
  .regex(
    /^\d{17,19}$/,
    'Snowflake must be a number between 17 and 19 digits long'
  );

const DotenvSchema = z.object({
  NODE_ENV: NodeEnv,
  LOG_LEVEL: LogLevel,
  DISCORD_TOKEN: DiscordToken,

  TICKET_CATEGORY_ID: Snowflake,
  SUPERVISOR_ROLE_ID: Snowflake,

  WORKER_ROLE_ID: Snowflake,
  WORKER_NOTIFICATIONS_CHANNEL_ID: Snowflake,
});

export const {
  DISCORD_TOKEN,
  LOG_LEVEL,
  NODE_ENV,
  SUPERVISOR_ROLE_ID,
  TICKET_CATEGORY_ID,
  WORKER_NOTIFICATIONS_CHANNEL_ID,
  WORKER_ROLE_ID,
} = DotenvSchema.parse(process.env);

export type Dotenv = z.infer<typeof DotenvSchema>;
export default DotenvSchema;
