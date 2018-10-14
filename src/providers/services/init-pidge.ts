import {Injectable} from '@angular/core';
import {AUTH_OBSERVED_ACTION_LOGIN, AuthObservedAction, AuthService} from "../pidge-client/auth-service";
import {Subject} from "rxjs/Subject";
import {Subscription} from "rxjs/Subscription";
import {AnalyticsLogger} from "./analytics-logger";
import {UserInterface} from "../../models/user";

enum ToReady {
  Auth
}

@Injectable()
export class InitPidge {

  protected observableInstance: Subject<any>;
  private _ready: boolean = false;
  private user: UserInterface;
  protected statuses = [false];

  constructor(protected authService: AuthService,
              protected analytics: AnalyticsLogger) {
    this.observableInstance = new Subject();
    this.initAuth();
  }

  get ready(): boolean {
    return this._ready;
  }

  set ready(value: boolean) {
    this._ready = value;
    this.triggerObservers(this.ready);
  }

  public observable(): Subject<boolean> {
    return this.observableInstance;
  }

  public subscribe(callable): Subscription {
    let result = this.observableInstance.subscribe(callable);
    callable(this.ready);
    return result;
  }

  private triggerObservers(ready: boolean) {
    return this.observableInstance.next(ready);
  }

  protected initAuth() {
    this.authService.subscribe((authEvent: AuthObservedAction) => {
      this.user = authEvent.loggedIn && authEvent.user ? authEvent.user : null;
      this.analytics.ga().then(ga => {
        if (authEvent.loggedIn && authEvent.action === AUTH_OBSERVED_ACTION_LOGIN) {
          ga.setUserId(this.user.uqid);
          ga.setAnonymizeIp(false);
        } else if (!authEvent.loggedIn) {
          ga.setAnonymizeIp(true);
        }
      });
    });
    if (this.authService.currentUser) {
      this.updateReadyStatus(ToReady.Auth, true);
    } else {
      this.authService.loginLastUser()
        .then(user => this.updateReadyStatus(ToReady.Auth, true))
        .catch(err => this.updateReadyStatus(ToReady.Auth, false));
    }
  }

  protected updateReadyStatus(part: ToReady, ready: boolean) {
    this.statuses[part] = ready;
    this.ready = this.statuses.filter(el => !el).length === 0;
  }

}
