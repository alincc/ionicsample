import {User, UserInterface} from "./user";
import {Chat, TeamInterface} from "./chat";
import BaseModel from "./base";
import {Event, EventInterface} from "./event";
import {EventInvitation, EventInvitationInterface} from "./event-invitation";
import {Standardize} from "../providers/pidge-client/standardize";

export interface NotificationInterface {
  id?: number;
  title: string;
  type: string;
  message: string;
  data?: any;
  user?: UserInterface;
  relatedUser?: UserInterface;
  relatedChat?: TeamInterface;
  relatedEvent?: EventInterface;
  relatedInvitation?: EventInvitationInterface;
  createdAt?: Date;
  updatedAt?: Date;
  readAt?: Date;
}

export class Notification extends BaseModel implements NotificationInterface {
  id?: number;
  title: string;
  type: string;
  message: string;
  data?: any;
  user?: UserInterface;
  relatedUser?: UserInterface;
  relatedChat?: Chat;
  relatedEvent?: Event;
  relatedInvitation?: EventInvitation;
  createdAt?: Date;
  updatedAt?: Date;
  readAt?: Date;
  relatedUserId?: number;
  relatedChatId?: number;
  relatedEventId?: number;
  relatedInvitationId?: number;

  protected get dateKeys() {
    return ['createdAt', 'updatedAt', 'readAt'];
  }

  protected get rawKeysMapping() {
    return {
      "created_at": "createdAt",
      "updated_at": "updatedAt",
      "read_at": "readAt",
      "related_user": "relatedUser",
      "related_chat": "relatedChat",
      "related_event": "relatedEvent",
      "related_event_invitation": "relatedInvitation",
      "related_user_id": "relatedUserId",
      "related_chat_id": "relatedChatId",
      "related_event_id": "relatedEventId",
      "related_event_invitation_id": "relatedInvitationId",
    };
  }

  constructor(loaded: NotificationInterface) {
    super(loaded);
    this.user = this.user ? (this.user instanceof User ? this.user : Standardize.user(this.user)) : null;
    this.relatedUser = this.relatedUser ? (this.relatedUser instanceof User ? this.relatedUser : Standardize.user(this.relatedUser)) : null;
    this.relatedChat = this.relatedChat ? (this.relatedChat instanceof Chat ? this.relatedChat : Standardize.chat(this.relatedChat)) : null;
    this.relatedEvent = this.relatedEvent ? (this.relatedEvent instanceof Event ? this.relatedEvent : Standardize.event(this.relatedEvent)) : null;
    this.relatedInvitation = this.relatedInvitation ? (this.relatedInvitation instanceof EventInvitation ? this.relatedInvitation : Standardize.eventInvitation(this.relatedInvitation)) : null;
  }

  get isRead(): boolean {
    return !!this.readAt;
  }

}

export abstract class NotificationPresenter {

  protected _notification: Notification;

  constructor(notification: Notification) {
    this._notification = notification;
  }

  abstract generateTitle(): string;

  abstract generateMessage(): string;

}
