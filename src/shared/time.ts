export const DAY_NAMES_LONG = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
export const DAY_NAMES_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const MONTH_NAMES_LONG = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
export const MONTH_NAMES_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export {date} from './date-format';

/**
 * Extract time parts from decimal float representation. i.e. 5.5 will be parsed and extracted as 05:30
 * @param time {number} the decimal float time representation
 * @returns {{hours: number, minutes: number}}
 */
export function timePartsFromDecimalRepresentation(time: number) {
  let hours = Math.floor(Math.abs(time));
  let minutes = time % 1 * 60;
  return {hours: hours, minutes: minutes};
}

/**
 * Extract time parts from string representation
 * @param time {string} of format hh:mm
 * @returns {{hours: number, minutes: number}}
 */
export function timePartsFromStringRepresentation(time: string) {
  if (!/^[\+\-]?\d+\:?\d{0,2}$/.test(time)) {
    return {hours: 0, minutes: 0};
  }
  let parts = time.replace(/[^0-9\:]/, "").split(":");
  let hours = parseInt(parts[0]);
  let minutes = parseInt(parts[1]);
  return {hours: hours, minutes: minutes};
}

/**
 * Converts hours and minutes into decimal value representation
 * @param hours {number} from 0 to 23
 * @param minutes {number} from 0 to 59
 * @returns {number}
 */
export function timeValueFromParts(hours: number, minutes: number): number {
  return hours + minutes / 60;
}

/**
 * Returns the offset as a decimal float number, i.e. 3.5 means +03:30 offset
 * @param reverseSigns {boolean}
 * @returns {number}
 */
export function timezoneOffsetValue(reverseSigns: boolean = true): number {
  return new Date().getTimezoneOffset() / 60 * (reverseSigns ? -1 : 1);
}

/**
 * Returns the offset as a string representation. i.e. +03:30
 * @param separator {string}
 * @returns {string}
 */
export function timezoneOffsetString(separator: string = ":"): string {
  let offsetValue = timezoneOffsetValue();
  let {hours, minutes} = timePartsFromDecimalRepresentation(offsetValue);
  return (offsetValue > 0 ? "+" : "-") + formatTime(hours, minutes, separator);
}

/**
 * Formats the hour and minute as an hour string
 * @param hours
 * @param minutes
 * @param separator {string}
 * @returns {string}
 */
export function formatTime(hours: number, minutes: number, separator: string = ":"): string {
  return (hours < 10 ? "0" : "") + hours.toString() + separator + (minutes < 10 ? "0" : "") + minutes.toString();
}

export function dayName(day: number, longName: boolean = true): string {
  let source = longName ? DAY_NAMES_LONG : DAY_NAMES_SHORT;
  return source[day % 7];
}

export function dayShortName(day: number): string {
  return dayName(day, false);
}

export function dayLongName(day: number): string {
  return dayName(day, true);
}

export function monthName(month: number, longName: boolean = true): string {
  let source = longName ? MONTH_NAMES_LONG : MONTH_NAMES_SHORT;
  return source[month % 12];
}

export function monthShortName(month: number): string {
  return monthName(month, false);
}

export function monthLongName(month: number): string {
  return monthName(month, true);
}

export interface TimeInterface {

  hours: number;
  minutes: number;

}

export class Time implements TimeInterface {

  protected _hours: number = 0;
  protected _minutes: number = 0;

  /**
   * Create object of time, which values are stored as UTC, and displayed as Local
   * @param hours
   * @param minutes
   */
  constructor(hours?: number | string | TimeInterface, minutes?: number) {
    let parts: TimeInterface;
    if (typeof hours === "string") {
      parts = timePartsFromStringRepresentation(hours);
    } else if (typeof hours === "number" && typeof minutes === "undefined") {
      parts = timePartsFromDecimalRepresentation(hours);
    } else if (typeof hours === "object" && hours.hasOwnProperty('hours') && hours.hasOwnProperty('minutes')) {
      parts = hours;
    } else {
      parts = {hours: hours as number, minutes: minutes as number};
    }
    this.hours = parts.hours;
    this.minutes = parts.minutes;
  }

  get minutes(): number {
    let offset = timezoneOffsetValue() % 1 * 60;
    let minutes = this._minutes + offset;
    return minutes;
  }

  set minutes(value: number) {
    let offset = timezoneOffsetValue() % 1 * 60;
    this._minutes = value % 60 - offset;
  }

  get hours(): number {
    let offset = Math.ceil(timezoneOffsetValue());
    return this._hours + offset;
  }

  set hours(value: number) {
    let offset = Math.ceil(timezoneOffsetValue());
    this._hours = value % 24 - offset;
  }

  get decimalValue(): number {
    return timeValueFromParts(this.hours, this.minutes);
  }

  set decimalValue(value: number) {
    let {hours, minutes} = timePartsFromDecimalRepresentation(value);
    this.hours = hours;
    this.minutes = minutes;
  }

  get stringValue(): string {
    return formatTime(this.hours, this.minutes);
  }

  set stringValue(value: string) {
    let {hours, minutes} = timePartsFromStringRepresentation(value);
    this.hours = hours;
    this.minutes = minutes;
  }

  get utcMinutes(): number {
    return this._minutes;
  }

  set utcMinutes(value: number) {
    this._minutes = value % 60;
  }

  get utcHours(): number {
    return this._hours;
  }

  set utcHours(value: number) {
    this._hours = value % 24;
  }

  get utcDecimalValue(): number {
    return timeValueFromParts(this.utcHours, this.utcMinutes);
  }

  set utcDecimalValue(value: number) {
    let {hours, minutes} = timePartsFromDecimalRepresentation(value);
    this.utcHours = hours;
    this.utcMinutes = minutes;
  }

  get utcStringValue(): string {
    return formatTime(this.utcHours, this.utcMinutes);
  }

  set utcStringValue(value: string) {
    let {hours, minutes} = timePartsFromStringRepresentation(value);
    this.utcHours = hours;
    this.utcMinutes = minutes;
  }

  get utcStringValueAdjusted(): string {
    return new Time(this.utcDecimalValueAdjusted).stringValue;
  }

  get utcDecimalValueAdjusted(): number {
    return this.utcDecimalValue + (this.utcDecimalValue < 0 ? 24 : (this.utcDecimalValue >= 24 ? -24 : 0 ));
  }

  public utcAdjustDay(dayToAdjust: number | Day): number | Day {
    let adjustedDay = (dayToAdjust instanceof Day ? dayToAdjust.dayOfWeek : dayToAdjust) + (this.utcDecimalValue < 0 ? -1 : (this.utcDecimalValue >= 24 ? 1 : 0));
    adjustedDay = adjustedDay < 0 ? 6 : (adjustedDay > 6 ? adjustedDay % 7 : adjustedDay);
    return dayToAdjust instanceof Day ? new Day(adjustedDay) : adjustedDay;
  }

  get stringValueAdjusted(): string {
    return new Time(this.decimalValueAdjusted).stringValue.slice(0, 5);
  }

  get decimalValueAdjusted(): number {
    return this.decimalValue + (this.decimalValue < 0 ? 24 : (this.decimalValue >= 24 ? -24 : 0 ));
  }

  public adjustDay(day: number | Day): number | Day {
    let d = (day instanceof Day ? day.dayOfWeek : day) + (this.decimalValue < 0 ? -1 : (this.decimalValue >= 24 ? 1 : 0));
    return day instanceof Day ? new Day(d) : d;
  }

}

export interface DayInterface {

  dayOfWeek: number;

}

export class Day implements DayInterface {

  protected value: number = 0;

  constructor(day: number = 0) {
    this.dayOfWeek = day;
  }

  get dayOfWeek(): number {
    return this.value;
  }

  set dayOfWeek(value: number) {
    this.value = value % 7;
  }

  get longName(): string {
    return dayLongName(this.dayOfWeek);
  }

  get shortName(): string {
    return dayShortName(this.dayOfWeek);
  }

}

export interface MonthInterface {

  month: number;

}

export class Month implements MonthInterface {

  protected _month: number = 0;

  constructor(month: number = 0) {
    this.month = month;
  }

  get month(): number {
    return this._month;
  }

  set month(value: number) {
    this._month = value % 7;
  }

  get longName(): string {
    return monthLongName(this.month);
  }

  get shortName(): string {
    return monthShortName(this.month);
  }

}

function pad(num: number): string {
  var norm = Math.abs(Math.floor(num));
  return (norm < 10 ? '0' : '') + norm;
}

export function localTzDateAsISO(dt: Date): string {
  return dt.getFullYear() +
    '-' + pad(dt.getMonth() + 1) +
    '-' + pad(dt.getDate()) +
    'T' + pad(dt.getHours()) +
    ':' + pad(dt.getMinutes()) +
    ':' + pad(dt.getSeconds()) +
    currentTimezoneOffsetString();
}

let tzStringStatic: string;

export function currentTimezoneOffsetString() {
  if (!tzStringStatic) {
    var tzo = -(new Date().getTimezoneOffset());
    tzStringStatic = (tzo >= 0 ? '+' : '-') + pad(tzo / 60) + ':' + pad(tzo % 60);
  }
  return tzStringStatic;
}
