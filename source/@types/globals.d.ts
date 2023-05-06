import { Logger } from 'tslog';

import { Dotenv } from '@/schemas/dotenv';

declare global {
  /** Utility type to add a logger to an object (e.g. an interaction) */
  type Loggable<T extends object> = T & {
    logger: Logger<unknown>;
  };

  /** Replace a key in an object with a new type. */
  type Replace<T, K extends keyof T, V> = Omit<T, K> & {
    [P in K]: V;
  };

  namespace NodeJS {
    interface ProcessEnv
      extends NodeJS.ProcessEnv,
        Replace<Dotenv, keyof Dotenv, string> {}
  }
}

export {};
