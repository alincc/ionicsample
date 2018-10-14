import {DAY_NAMES_LONG, DAY_NAMES_SHORT, MONTH_NAMES_LONG, MONTH_NAMES_SHORT} from "../../../shared/time";
abstract class CalendarUnit {

  public _date;

  public get date(): Date {
    return this._date;
  }

  public set date(date: Date) {
    if (!date) {
      this._date = new Date();
    } else if (date instanceof Date) {
      this._date = date;
    } else {
      this._date = new Date(date);
    }
    this.date.setHours(0, 0, 0, 0);
  }

  constructor(date?: Date | any) {
    this.date = date;
  }

  abstract next(): CalendarUnit;

  abstract prev(): CalendarUnit;

  abstract isSame(date: Date): boolean;

}

export class Day extends CalendarUnit {

  constructor(date?: Date | any) {
    super(date);
    this.date.setHours(0, 0, 0, 0);
  }

  next(): Day {
    return new Day(this.date.getTime() + 1 * 24 * 60 * 60 * 1000);
  }

  prev(): Day {
    return new Day(this.date.getTime() - 1 * 24 * 60 * 60 * 1000);
  }

  isSame(date: Date): boolean {
    return new Date(date.getTime()).setHours(0, 0, 0, 0) === this.date.getTime();
  }

  public get name(): string {
    return DAY_NAMES_SHORT[this.date.getDay()];
  }

  public get fullName(): string {
    return DAY_NAMES_LONG[this.date.getDay()];
  }

  public get week() {
    return new Week(this.date.getTime());
  }

  public get month() {
    return new Month(this.date.getTime());
  }

  public get year() {
    return new Year(this.date.getTime());
  }

}

export class Week extends CalendarUnit {

  next(sameMonth?: boolean): Week {
    let week = new Week(this.date.getTime() + 7 * 24 * 60 * 60 * 1000);
    if (sameMonth) {
      week.date = week.firstDay.date;
    }
    return week;
  }

  prev(sameMonth?: boolean): Week {
    let week = new Week(this.date.getTime() - 7 * 24 * 60 * 60 * 1000);
    if (sameMonth) {
      week.date = week.lastDay.date;
    }
    return week;
  }

  isSame(date: Date): boolean {
    return getWeekNumber(date) === this.weekOfYear && date.getFullYear() === this.date.getFullYear();
  }

  public get days(): Day[] {
    let days = [];
    let start = 0 - this.date.getDay();
    for (let i = start; i < start + 7; i++) {
      let day = new Day(this.date.getTime() + i * 24 * 60 * 60 * 1000);
      days.push(day);
    }
    return days;
  }

  public get monthDays(): Day[] {
    let days = [];
    for (let day of this.days) {
      if (day.date.getMonth() !== this.date.getMonth()) {
        continue
      }
      days.push(day);
    }
    return days;
  }

  public get lastDay(): Day {
    return this.days[6];
  }

  public get lastMonthDay(): Day {
    let monthDays = this.monthDays;
    return monthDays[monthDays.length - 1];
  }

  public get firstDay(): Day {
    return this.days[0];
  }

  public get firstMonthDay(): Day {
    return this.monthDays[0];
  }

  public get weekOfYear(): number {
    return getWeekNumber(this.date);
  }

  public get monthDaysPrePaddings(): any[] {
    let result = [];
    for (let i = 0; i < this.firstMonthDay.date.getDay(); i++) {
      result.push(this.days[i]);
    }
    return result;
  }

  public get monthDaysPostPaddings(): any[] {
    let result = [];
    for (let i = this.lastMonthDay.date.getDay(); i < 6; i++) {
      result.push(this.days[i]);
    }
    return result;
  }

  public get month() {
    return new Month(this.date.getTime());
  }

  public get year() {
    return new Year(this.date.getTime());
  }

}

export class Month extends CalendarUnit {

  constructor(date?: Date | any) {
    super(date);
    this.date.setDate(1);
  }

  next(): Month {
    return this.date.getMonth() == 11 ? new Month(new Date(this.date.getFullYear() + 1, 0, 1)) : new Month(new Date(this.date.getFullYear(), this.date.getMonth() + 1, 1));
  }

  prev(): Month {
    return this.date.getMonth() == 0 ? new Month(new Date(this.date.getFullYear() - 1, 11, 1)) : new Month(new Date(this.date.getFullYear(), this.date.getMonth() - 1, 1));
  }

  isSame(date: Date): boolean {
    return date.getFullYear() === this.date.getFullYear() && date.getMonth() === this.date.getMonth();
  }

  public get numOfDays(): number {
    let dt = new Date(this.date.getFullYear(), this.date.getMonth(), 0);
    return dt.getDate();
  }

  public get days(): Day[] {
    let days = [];
    days.push(new Day(this.date.getTime()));
    for (let i = 1; i < this.numOfDays; i++) {
      days.push(days[i - 1].next());
    }
    return days;
  }

  public get weeks(): Week[] {
    let weeks = [];
    let week = new Week(this.date.getTime());
    while (week.firstDay.date.getMonth() === this.date.getMonth() || week.lastDay.date.getMonth() === this.date.getMonth()) {
      weeks.push(week);
      week = week.next(true);
    }
    return weeks;
  }

  public get lastDay(): Day {
    return this.days[this.numOfDays - 1];
  }

  public get firstDay(): Day {
    return this.days[0];
  }

  public get name(): string {
    return MONTH_NAMES_SHORT[this.date.getMonth()];
  }

  public get fullName(): string {
    return MONTH_NAMES_LONG[this.date.getMonth()];
  }

  public get year() {
    return new Year(this.date.getTime());
  }

}

export class Year extends CalendarUnit {

  constructor(date?: Date | any) {
    super(date);
    this.date.setMonth(0, 1);
  }

  next(): Year {
    return new Year(new Date(this.date.getFullYear() + 1, 0, 1));
  }

  prev(): Year {
    return new Year(new Date(this.date.getFullYear() - 1, 0, 1));
  }

  isSame(date: Date): boolean {
    return this.date.getFullYear() === date.getFullYear();
  }

  public get numOfDays(): number {
    return this.isLeapYear ? 366 : 365;
  }

  public get isLeapYear(): boolean {
    return this.date.getFullYear() % 400 === 0 || (this.date.getFullYear() % 100 !== 0 && this.date.getFullYear() % 4 === 0);
  }

  public get days(): Day[] {
    let days = [];
    days.push(new Day(this.date.getTime()));
    for (let i = 1; i < this.numOfDays; i++) {
      days.push(days[i - 1].next());
    }
    return days;
  }

  public get weeks(): Week[] {
    let weeks = [];
    let week = new Week(this.date.getTime());
    while (week.date.getFullYear() === this.date.getFullYear()) {
      weeks.push(week);
      week = week.next();
    }
    return weeks;
  }

  public get month(): Month[] {
    let months = [];
    for (let i = 0; i < 12; i++) {
      months.push(new Month(new Date(this.date.getFullYear(), i)));
    }
    return months;
  }

}

export function getWeekNumber(date: Date): number {
  var d = new Date(+date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  return Math.ceil((((d.getTime() - new Date(d.getFullYear(), 0, 1).getTime()) / 8.64e7) + 1) / 7);
}

export function zeroDate(date: any, millis: boolean = true, seconds: boolean = true, minutes: boolean = true, hours: boolean = true, day: boolean = false, month: boolean = false): Date {
  let dt = new Date(date instanceof Date ? date.getTime() : date);
  dt.setHours(hours ? 0 : dt.getHours(), minutes ? 0 : dt.getMinutes(), seconds ? 0 : dt.getSeconds(), millis ? 0 : dt.getMilliseconds());
  dt.setMonth(month ? 0 : dt.getMonth(), day ? 1 : dt.getDate());
  return dt;
}
