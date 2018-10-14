import {Injectable} from '@angular/core';
import {Subject} from "rxjs/Subject";
import {ObservableInterface} from "../../shared/observable-interface";
import {Subscription} from "rxjs/Subscription";

@Injectable()
export class StackerFactory {
  /**
   *
   * @param onInit function
   * @param onFinish function
   * @returns {StackerFactory}
   */
  public make(onInit, onFinish) {
    return (new Stacker()).setInit(onInit).setFinish(onFinish);
  }

}

export class Stacker implements ObservableInterface {

  protected _onFinish;
  protected _onInit;
  protected initiated: any = null;
  protected messages: string[] = [];
  protected observableInstance: Subject<StackChangedInterface>;

  constructor() {
    this.observableInstance = new Subject();
  }

  public observable(): Subject<StackChangedInterface> {
    return this.observableInstance;
  }

  public subscribe(callable): Subscription {
    return this.observableInstance.subscribe(callable);
  }

  public get message(): string | null {
    if (this.isEmpty()) {
      return null;
    }
    let message: string;
    for (let i = 0; i < this.stacked && !message; i++) {
      message = this.messages[i];
    }
    return message;
  }

  public setMessage(message: string): Stacker {
    if (!this.stacked) {
      this.add(message);
    } else {
      this.messages[0] = message;
    }
    return this;
  }

  /**
   *
   * @param callable
   * @returns {Stacker}
   */
  public setInit(callable): Stacker {
    this.onInit = callable;
    return this;
  }

  /**
   *
   * @param callable
   * @returns {Stacker}
   */
  public setFinish(callable): Stacker {
    this.onFinish = callable;
    return this;
  }

  get onInit() {
    return this._onInit;
  }

  set onInit(callable) {
    this._onInit = callable;
  }

  get onFinish() {
    return this._onFinish;
  }

  set onFinish(callable) {
    this._onFinish = callable;
  }

  public add(message: string = "") {
    this.messages.unshift(message);
    if (this.stacked === 1) {
      let callable = this.onInit;
      this.initiated = callable();
      this.triggerObservers("initiated");
    }
    this.triggerObservers("added");
  }

  public pop() {
    this.messages.shift();
    this.triggerObservers("removed");
    if (this.stacked === 0) {
      let callable = this.onFinish;
      this.initiated = callable(this.initiated);
      this.triggerObservers("finished");
    }
  }

  public empty() {
    this.messages = [null];
    return this.pop();
  }

  get stacked(): number {
    return this.messages.length;
  }

  public isEmpty(): boolean {
    return this.stacked === 0;
  }

  protected triggerObservers(action: string) {
    this.observableInstance.next({
      action: action,
      stacked: this.stacked,
      message: this.stacked > 0 ? this.messages[this.stacked - 1] : null,
      messages: this.messages
    } as StackChangedInterface);
  }
}

interface StackChangedInterface {
  action: ("added" | "removed" | "initiated" | "finished");
  stacked: number;
  message?: string;
  messages?: string[];
}
