import RegExpEvent from '@/libraries/regexp-event';

// Constants
// Constants
// Constants

/** @enum */
export const TicketCategory = {
  PVM: 'PVM',
  Skills: 'Skills',
  Quests: 'Quests',
  FireCape: 'FireCape',
  InfernalCape: 'InfernalCape',
} as const;

/** @enum */
export const TicketCategoryEmojis = {
  [TicketCategory.PVM]: '🗡️',
  [TicketCategory.Skills]: '🎓',
  [TicketCategory.Quests]: '🗺️',
  [TicketCategory.FireCape]: '🦎',
  [TicketCategory.InfernalCape]: '🔥',
} as const;

export const WORK_TYPES = [
  'PVM',
  'Skills',
  'Quests',
  'FireCape',
  'InfernalCape',
] as const;

export type WorkType = (typeof WORK_TYPES)[number];

// RegExpEvent
// RegExpEvent
// RegExpEvent

interface RegExpEvents {
  /**
   * Event triggered when a user wants to create a ticket.
   * This event does not need arguments, as it is already being
   * handled by the `SelectMenuBuilder.options` property.
   * @context Create Ticket
   */
  CreateTicket: never;

  /**
   * Event triggered when a worker wants to claim a work.
   * @param workId ID of the work to be claimed.
   * @context Worker
   */
  ClaimWork: [workId: string];

  /**
   * Event triggered when a supervisor wants to close a work.
   * @param workId ID of the work to be closed.
   * @context Supervisor
   */
  CloseWork: [workId: string];

  /**
   * Event triggered when a supervisor approves a work.
   * @param workId ID of the work to be approved.
   * @context Supervisor
   */
  ApproveWork: [workId: string];

  /**
   * Event triggered when a supervisor confirms the completion of a service.
   * @param channelId - ID of the private channel where the service was performed.
   * @param workId - ID of the work related to the service.
   * @param workerId - ID of the worker who performed the service.
   * @context Supervisor
   */
  ConfirmServiceCompletion: [workId: string];

  /**
   * Event triggered when a supervisor wants to delete a channel.
   * @context Supervisor
   */
  DeleteChannel: never;
}

export const RegExpEventHandler = new RegExpEvent<RegExpEvents>('T');
