import BaseModel from "./base";
import {Chat, TeamInterface} from "./chat";
import {Event, EventInterface} from "./event";
import {Day, DayInterface, Time, TimeInterface} from "../shared/time";
import {Standardize} from "../providers/pidge-client/standardize";

export interface RegularEventInterface {
  /**
   * dayOfWeek of week. Sunday=0
   */
  day?: DayInterface;
  /**
   * in UTC
   */
  time?: TimeInterface;
  /**
   * date of next occurrence, if still applicable (i.e. not beyond team expiry date).
   */
  nextOccurrence?: Date;
  /**
   * actual event instance (if created in backend)
   */
  nextInstance?: EventInterface;
  /**
   * related chat
   */
  chat?: TeamInterface;
  //new attributes
  //@TODO:clean
  intervalStartsOn?: Date;
  intervalEndsOn?: Date;
  interval?: number;
  intervalUnit?: "Week" | "Day" | "Month";
  createdInstances?: number;
  title?: string;
  geolocation?: string;
  type?: string;
  address?: string;
  uqid?: string;
  note?: string;
}

export class RegularEvent extends BaseModel implements RegularEventInterface {
  get note(): string {
    return this._note;
  }

  set note(value: string) {
    this._note = value;
  }

  private _note: string;

  get type(): string {
    return this._type;
  }

  set type(value: string) {
    this._type = value;
  }

  get uqid(): string {
    return this._uqid;
  }

  set uqid(value: string) {
    this._uqid = value;
  }

  protected _id?: number;
  /**
   * dayOfWeek of week. Sunday=0
   */
  protected _day: Day;
  /**
   * in UTC
   */
  protected _time: Time;
  /**
   * date of next occurrence, if still applicable (i.e. not beyond team expiry date).
   */
  protected _nextOccurrence?: Date;
  /**
   * actual event instance (if created in backend)
   */
  protected _nextInstance?: Event;
  /**
   * related chat
   */
  protected _chat?: Chat;
  /**
   * Is the regular event active or not
   */
  protected isActive: boolean;

  private _intervalStartsOn?: Date;
  private _intervalEndsOn?: Date;
  private _interval?: number;
  private _intervalUnit?: "Week" | "Day" | "Month";
  private _createdInstances?: number;
  private _title?: string;
  private _geolocation?: string;
  private _address?: string;
  private _uqid?: string;
  private _type?: string;

  //conversion and casting
  protected get dateKeys() {
    return ["createdAt", "updatedAt", "nextOccurrence", "intervalStartsOn", "intervalEndsOn"];
  }

  protected get rawKeysMapping() {
    return {
      next_occurrence: "nextOccurrence",
      next_instance: "nextInstance",
      created_at: "createdAt",
      updated_at: "updatedAt",
      is_active: "isActive",
      interval_starts_on: "intervalStartsOn",
      interval_ends_on: "intervalEndsOn",
      interval_unit: "intervalUnit"
    };
  }

  constructor(data: RegularEventInterface) {
    super(data);
    this.chat = this.chat ? (this.chat instanceof Chat ? this.chat : Standardize.chat(this.chat)) : null;
    this.nextInstance = this.nextInstance ? (this.nextInstance instanceof Event ? this.nextInstance : Standardize.event(this.nextInstance, this.chat, this)) : null;
  }

  protected preRawDataTransform(data: Object) {
    let tm = data["time"];
    data["time"] = new Time();
    data["time"].utcStringValue = tm;
    data["day"] = new Day(data["day"]);
  }

  get id(): number {
    return this._id;
  }

  set id(value: number) {
    if (this._id) {
      return;
    }
    this._id = value;
  }

  set chat(value: Chat) {
    this._chat = value;
  }

  get chat(): Chat {
    return this._chat;
  }

  set nextInstance(value: Event) {
    this._nextInstance = value;
  }

  get nextInstance(): Event {
    return this._nextInstance;
  }

  set nextOccurrence(value: Date) {
    this._nextOccurrence = value;
  }

  get nextOccurrence(): Date {
    return this._nextOccurrence;
  }

  setDay(day: number) {
    this.day = new Day(day);
  }

  set day(day: Day) {
    this._day = day;
  }

  get day(): Day {
    return this._day;
  }

  setTime(value: any) {
    this.time = new Time(value);
  }

  set time(value: Time) {
    this._time = value;
  }

  get time(): Time {
    return this._time;
  }

  get address(): string {
    return this._address;
  }

  set address(value: string) {
    this._address = value;
  }

  get geolocation(): string {
    return this._geolocation;
  }

  set geolocation(value: string) {
    this._geolocation = value;
  }

  get title(): string {
    return this._title;
  }

  set title(value: string) {
    this._title = value;
  }

  get createdInstances(): number {
    return this._createdInstances;
  }

  set createdInstances(value: number) {
    this._createdInstances = value;
  }

  get intervalUnit() {
    return this._intervalUnit;
  }

  set intervalUnit(value) {
    this._intervalUnit = value;
  }

  get interval(): number {
    return this._interval;
  }

  set interval(value: number) {
    this._interval = value;
  }

  get intervalEndsOn(): Date {
    return this._intervalEndsOn;
  }

  set intervalEndsOn(value: Date) {
    this._intervalEndsOn = value;
  }

  get intervalStartsOn(): Date {
    return this._intervalStartsOn;
  }

  set intervalStartsOn(value: Date) {
    this._intervalStartsOn = value;
  }

}
