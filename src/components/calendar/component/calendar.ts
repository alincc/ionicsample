import {Component, EventEmitter, Input, Output, OnInit, forwardRef} from '@angular/core';
import {Month, Year, zeroDate} from "./calendar-units";
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from "@angular/forms";

const noop = () => {
};

export const CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => Calendar),
  multi: true
};

@Component({
  selector: 'calendar',
  templateUrl: 'calendar.html',
  providers: [CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR]
})
export class Calendar implements OnInit, ControlValueAccessor {

  protected min: Date;
  protected max: Date;
  protected _selected: Date;
  protected _current: Date;
  protected disabled: boolean = false;
  protected onChangeCallback: (_: any) => void = noop;
  protected onTouchedCallback: () => void = noop;

  @Input('min') _min: string;
  @Input('max') _max: string;
  @Input('selected') __selected: string;
  @Input('current') __current: string;

  @Input() cellMainContent(date: Date, sameMonth: boolean): string {
    return sameMonth ? date.getDate().toString() : "";
  };

  @Output() onSelect = new EventEmitter<Date>();

  constructor() {
    this.selected = new Date;
    this.current = new Date;
  }

  ngOnInit() {
    this.min = this._min ? zeroDate(this._min) : null;
    this.max = this._max ? zeroDate(this._max) : null;
    let selectedDate = zeroDate(this.__selected ? this.__selected : new Date());
    this.selected = this.canSelect(selectedDate) ? selectedDate : (this.min ? this.min : (this.max ? this.max : new Date()));
    let currentDate = zeroDate(this.__current ? this.__current : (this.selected ? this.selected : new Date()));
    this.current = this.canSelect(currentDate) ? currentDate : (this.min ? this.min : (this.max ? this.max : new Date()));
  }

  get current(): Date {
    return this._current;
  }

  set current(value: Date) {
    this._current = value;
  }

  get selected(): Date {
    return this._selected;
  }

  set selected(value: Date) {
    this._selected = value;
  }

  public get currentMonth() {
    return new Month(this.current.getTime());
  }

  public get currentYear() {
    return new Year(this.current.getTime());
  }

  public prevMonth() {
    let dt = this.currentMonth.prev().date;
    this.current = this.min && dt.getTime() < this.min.getTime() ? new Date(this.min.getTime()) : dt;
  }

  public nextMonth() {
    let dt = this.currentMonth.next().date;
    this.current = this.max && dt.getTime() > this.max.getTime() ? new Date(this.max.getTime()) : dt;
  }

  public canGoNextMonth(): boolean {
    return this.max && !this.currentMonth.isSame(this.max) || !this.max;
  }

  public canGoPrevMonth(): boolean {
    return this.min && !this.currentMonth.isSame(this.min) || !this.min;
  }

  public prevYear() {
    let dt = this.currentYear.prev().date;
    this.current = this.min && dt.getTime() < this.min.getTime() ? new Date(this.min.getTime()) : dt;
  }

  public nextYear() {
    let dt = this.currentYear.next().date;
    this.current = this.max && dt.getTime() > this.max.getTime() ? new Date(this.max.getTime()) : dt;
  }

  public canGoNextYear(): boolean {
    return this.max && !this.currentYear.isSame(this.max) || !this.max;
  }

  public canGoPrevYear(): boolean {
    return this.min && !this.currentYear.isSame(this.min) || !this.min;
  }

  public canSelect(date: Date): boolean {
    return (!this.min || this.min && this.min.getTime() <= zeroDate(date.getTime()).getTime())
      && (!this.max || this.max && this.max.getTime() >= zeroDate(date.getTime()).getTime());
  }

  public select(date: Date) {
    if (!this.canSelect(date)) {
      throw "Can not select this date. min: " + this.min + ", max: " + this.max;
    }
    this._selected = date;
    this.onSelect.emit(date);
  }

  get value(): Date {
    return this.selected;
  };

  set value(selected: Date) {
    if (selected.getTime() !== this.selected.getTime()) {
      this.selected = selected;
      this.onChangeCallback(selected);
    }
  }

  writeValue(selected: Date): void {
    if (selected.getTime() !== this.selected.getTime()) {
      this.selected = selected;
    }
  }

  registerOnChange(fn: any): void {
    this.onChangeCallback = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouchedCallback = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

}
