import BaseModel from "./base";
import {Event, EventInterface} from "./event";
import {User, UserInterface} from "./user";
import {Standardize} from "../providers/pidge-client/standardize";
import {config} from "../providers/config/config";

export interface EventInvitationInterface {

  id: number;
  eventId: number;
  userId: number;
  ready: boolean;
  confirmed: boolean;
  status?: string;
  position?: string;
  uqid?: string;

  createdAt?: Date;
  updatedAt?: Date;

  event?: EventInterface;
  user?: UserInterface;
}

export class EventInvitation extends BaseModel implements EventInvitationInterface {

  id: number;
  eventId: number;
  userId: number;
  ready: boolean;
  confirmed: boolean;
  _status?: string;
  position?: string;
  uqid?: string;

  createdAt?: Date;
  updatedAt?: Date;

  event?: Event;
  user?: UserInterface;

  protected get dateKeys() {
    return ["createdAt", "updatedAt"];
  }

  protected get rawKeysMapping() {
    return {
      "updated_at": "updatedAt",
      "created_at": "createdAt",
      "event_id": "eventId",
      "user_id": "userId"
    };
  }

  constructor(data: EventInvitationInterface) {
    super(data);
    this.event = this.event ? (this.event instanceof Event ? this.event : Standardize.event(this.event)) : null;
    this.user = this.user ? (this.user instanceof User ? this.user : Standardize.user(this.user)) : null;
  }

  public get status(): string {
    return this.event && this.event.isPast ? "Done" : this._status;
  }

  public set status(value: string) {
    this._status = value;
  }

  public canMemberAnswer(checkStatus: boolean = false): boolean {
    return ((this.event && this.event.date.getTime() - config.event_invitation_hours_to_close * 60 * 60 * 1000 > new Date().getTime()) ||
      false )// (!this.event && this.createdAt.getTime() + 7 - config.event_invitation_hours_to_close * 60 * 60 * 1000 > new Date().getTime()))
      && (checkStatus ? ["Invitation", "Rejected", "Pending"].indexOf(this.status) !== -1 : true);
  }

  public canMemberAccept(): boolean {
    return ["Invitation", "Rejected"].indexOf(this.status) !== -1 && this.canMemberAnswer();
  }

  public canMemberReject(): boolean {
    return ["Invitation", "Pending"].indexOf(this.status) !== -1 && this.canMemberAnswer();
  }

  public canAdminAnswer(checkStatus: boolean = false): boolean {
    return ((this.event && this.event.date.getTime() - config.event_invitation_admin_hours_to_close * 60 * 60 * 1000 > new Date().getTime()) ||
      false )//(!this.event && this.createdAt.getTime() + 7 - config.event_invitation_admin_hours_to_close * 60 * 60 * 1000 > new Date().getTime()))
      && (checkStatus ? ["Pending", "Cancelled", "Confirmed", "Invitation"].indexOf(this.status) !== -1 : true);
  }

  public canAdminAccept(): boolean {
    return ["Pending", "Cancelled", "Invitation"].indexOf(this.status) !== -1 && this.canAdminAnswer();
  }

  public canAdminReject(): boolean {
    return ["Pending", "Confirmed", "Invitation"].indexOf(this.status) !== -1 && this.canAdminAnswer();
  }

}
