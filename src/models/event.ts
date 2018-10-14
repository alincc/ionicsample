import {Chat, TeamInterface} from "./chat";
import BaseModel from "./base";
import {RegularEvent, RegularEventInterface} from "./regular-event";
import {EventInvitation} from "./event-invitation";
import {Standardize} from "../providers/pidge-client/standardize";
import {config} from "../providers/config/config";

export interface EventInterface {

  id?: number;
  uqid?: string;
  title: string;
  note?: string;
  time?: string;
  invited: string[];
  accepted?: string[];
  confirmed?: string[];
  rejected?: string[];
  chatId?: number;
  isPast?: boolean;
  address?: string;
  geolocation?: string;
  type?: string;

  date: Date;
  createdAt?: Date;
  updatedAt?: Date;

  chat?: TeamInterface;
  regularEvent?: RegularEventInterface;
  invitations?: EventInvitation[];

}

export class Event extends BaseModel implements EventInterface {

  //core
  id?: number;
  uqid?: string;
  title: string;
  note?: string;
  address?: string;
  geolocation?: string;
  type?: string;
  time?: string;
  invited: string[];
  accepted?: string[];
  confirmed?: string[];
  rejected?: string[];
  chatId?: number;
  isPast?: boolean;

  //related objects
  chat?: Chat;
  regularEvent?: RegularEvent;
  invitations?: EventInvitation[];

  //date KeysPipe
  date: Date;
  createdAt?: Date;
  updatedAt?: Date;

  protected get dateKeys() {
    return ['createdAt', 'updatedAt', 'date'];
  }

  protected get rawKeysMapping() {
    return {
      "updated_at": "updatedAt",
      "created_at": "createdAt",
      "chat_id": "chatId",
      "is_past": "isPast",
      "regular_event": "regularEvent"
    };
  }

  constructor(loaded: EventInterface) {
    super(loaded);
    this.regularEvent = this.regularEvent ? (this.regularEvent instanceof RegularEvent ? this.regularEvent : Standardize.regularEvent(this.regularEvent)) : null;
    this.chat = this.chat ? (this.chat instanceof Chat ? this.chat : Standardize.chat(this.chat)) : null;
    this.invitations = this.invitations ? (this.invitations instanceof Array ? Standardize.eventInvitationsList(this.invitations) : []) : [];
  }

  public canAdminUpdate(): boolean {
    return (this.date.getTime() - config.event_invitation_hours_to_close * 60 * 60 * 1000 > new Date().getTime());
  }

}
export interface UpcomingEventInterface
{
  address: string,
created_at: Date,
date: Date,
geolocation: string,
id: number,
invitations: Array<any>,
is_past: boolean,
note: string,
team_id: number,
team_regular_event_id: number,
title: string,
type: string,
updated_at: Date,
uqid: string,
}
