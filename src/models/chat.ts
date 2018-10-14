import {User, UserInterface} from "./user";
import BaseModel from "./base";
import {Event, EventInterface} from "./event";
import {RegularEvent, RegularEventInterface} from "./regular-event";
import {ChatParticipantSummary, ChatParticipantSummaryInterface} from "./chat-participant-summary";
import {Standardize} from "../providers/pidge-client/standardize";

export interface TeamInterface {

  [key: string]: any;

  id?: number;
  uqid?: string;
  title: string;
  description?: string;
  sport?: string;
  type?: string;
  image?: string;

  createdAt?: Date;
  updatedAt?: Date;
  lastPostAt?: Date;
  startAt?: Date;
  endAt?: Date;

  users?: ChatUserInterface[];
  events?: RegularEventInterface[];
  eventInstances?: EventInterface[];
  you?: ChatParticipantInterface;

  summary?: ChatParticipantSummaryInterface;

}

export class Chat extends BaseModel implements TeamInterface {

  [key: string]: any;

  id?: number;
  uqid?: string;
  title: string;
  description?: string;
  sport?: string;
  image?: string;
  type?: string;

  createdAt?: Date;
  updatedAt?: Date;
  lastPostAt?: Date;
  startAt?: Date;
  endAt?: Date;

  users?: ChatUserInterface[];
  events?: RegularEvent[];
  eventInstances?: Event[];
  you?: ChatParticipant;

  summary?: ChatParticipantSummary;

  protected get dateKeys() {
    return ['createdAt', 'updatedAt', 'lastPostAt', 'startAt', 'endAt']
  };

  protected get rawKeysMapping() {
    return {
      last_post_at: "lastPostAt",
      start_at: "startAt",
      end_at: "endAt",
      created_at: "createdAt",
      updated_at: "updatedAt"
    };
  }

  constructor(loaded: TeamInterface) {

    super(loaded);

    this.users = Standardize.chatUsersList(this.users || []);
    this.you = this.you ? (this.you instanceof ChatParticipant ? this.you : Standardize.chatParticipant(this.you)) : null;
    this.summary = this.summary ? (this.summary instanceof ChatParticipantSummary ? this.summary : Standardize.chatParticipantSummary(this.summary)) : null;
    this.events = Standardize.regularEventsList(this.events || [], this);
    this.eventInstances = Standardize.eventsList(this.eventInstances || [], this);
  }

  protected preRawDataTransform(data) {
    data.you = data.you || data.pivot;
  }

}

export interface ChatParticipantInterface {

  id?: number;
  userId?: number;
  isAdmin: boolean;
  isSupervisor: boolean;
  isActive: boolean;

  createdAt?: Date;
  updatedAt?: Date;
  checkedAt?: Date;
  leftAt?: Date;

  user?: UserInterface;
}

export class ChatParticipant extends BaseModel implements ChatParticipantInterface {

  id?: number;
  userId?: number;
  isAdmin: boolean;
  isSupervisor: boolean;
  isActive: boolean;

  createdAt?: Date;
  updatedAt?: Date;
  checkedAt?: Date;
  leftAt?: Date;

  user?: UserInterface;

  protected get dateKeys() {
    return ['createdAt', 'updatedAt', 'checkedAt', 'leftAt'];
  }

  protected get rawKeysMapping() {
    return {
      "user_id": "userId",
      "is_admin": "isAdmin",
      "is_supervisor": "isSupervisor",
      "is_active": "isActive",
      "created_at": "createdAt",
      "updated_at": "updatedAt",
      "checked_at": "checkedAt",
      "left_at": "leftAt",
    };
  }

  constructor(loaded: ChatParticipantInterface) {
    super(loaded);
    this.user = this.user ? (this.user instanceof User ? this.user : Standardize.user(this.user)) : null;
  }

  public isSystem() {
    return this.user && (this.user.id === 0 || this.user.uqid === 'system');
  }

  public get typeNum(): number {
    switch (this.type()) {
      case "Admin":
        return 1;
      case "Supervisor":
        return 2;
      case "Participant":
        return 3;
      case "Left":
        return 4;
    }
  }

  public type(normalType: string = "Participant"): string {
    return !this.isActive
      ? "Left"
      : (this.isAdmin
          ? "Admin"
          : ( this.isSupervisor ? "Supervisor" : normalType )
      );
  }

}

export interface ChatUserInterface extends UserInterface {

  pivot: ChatParticipantInterface;

}

export class ChatUser extends User implements ChatUserInterface {

  pivot: ChatParticipant;

  constructor(loaded: UserInterface) {
    super(loaded);
    this.pivot = this.pivot instanceof ChatParticipant ? this.pivot : new ChatParticipant(this.pivot);
  }

}

export interface ChatMessageInterface {

  id?: number;
  message: string;
  starLevel?: number;

  createdAt?: Date;
  updatedAt?: Date;

  participant?: ChatParticipantInterface;
}

export class ChatMessage extends BaseModel implements ChatMessageInterface {

  protected static SYSTEM_MESSAGE_PREFIX = '[system] ';

  private _starLevel?: number;
  protected _message: string;

  createdAt?: Date;
  updatedAt?: Date;

  participant?: ChatParticipant;

  protected get dateKeys() {
    return ['createdAt', 'updatedAt'];
  }

  protected get rawKeysMapping() {
    return {
      "created_at": "createdAt",
      "updated_at": "updatedAt",
      "star_level": "starLevel"
    };
  }

  constructor(loaded: ChatMessageInterface) {
    super(loaded);
    this.participant = this.participant ? (this.participant instanceof ChatParticipant ? this.participant : new ChatParticipant(this.participant)) : null;
  }

  get starLevel(): number {
    return this._starLevel;
  }

  set starLevel(value: number) {
    this._starLevel = value;
  }

  public isSystemMessage(): boolean {
    return this.rawMessage.substr(0, ChatMessage.SYSTEM_MESSAGE_PREFIX.length).toLowerCase() === ChatMessage.SYSTEM_MESSAGE_PREFIX || (this.participant && this.participant.isSystem());
  }

  public set message(message: string) {
    this._message = message;
  }

  public get message(): string {
    if (!this.isSystemMessage()) {
      return this.rawMessage;
    }
    switch (this.rawMessage.toLowerCase()) {
      case '[system] joined...':
      case '[system] left...':
        return this.rawMessage.replace(/^\[system\]/g, this.participant.user.name).replace("...", ".");
      default:
        return this.rawMessage.replace(/^\[system\]/g, '');
    }
  }

  public get rawMessage(): string {
    return this._message;
  }

}

export interface GroupedChatMessagesInterface {

  sender: ChatParticipantInterface;
  messages: ChatMessageInterface[];
  isSystem: boolean;

}
