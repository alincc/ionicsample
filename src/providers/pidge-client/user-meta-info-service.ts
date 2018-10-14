import {Injectable} from '@angular/core';
import {Subject} from "rxjs/Subject";
import {AUTH_OBSERVED_ACTION_LOGOUT, AuthService} from "./auth-service";
import {PidgeApiService} from "./pidge-api-service";
import {config} from "../config/config";
import {TeamInterface} from "../../models/chat";
import {ChatParticipantSummaryInterface} from "../../models/chat-participant-summary";
import {NotificationInterface} from "../../models/notification";
import {UserInterface} from "../../models/user";
import {EventInvitationInterface} from "../../models/event-invitation";
import {pidgeApiUrl} from "./pidge-url";
import {Subscription} from "rxjs/Subscription";

@Injectable()
export class UserMetaInfoService {

  protected observableInstance: Subject<UserMetaInfoInterface>;
  protected interval: any;
  protected successLoads = 0;
  protected lastLoaded: UserMetaInfoInterface = {successLoads: 0};
  protected loaded = false;
  protected requestInProgress: boolean = false;

  constructor(protected auth: AuthService,
              protected apis: PidgeApiService) {
    this.observableInstance = new Subject();
    this.auth.subscribe(data => {
      this.clearInterval();
      if (data.loggedIn) {
        this.interval = setInterval(() => this.streamMetaInfo(), config.load_meta_data_refresh_rate);
        this.streamMetaInfo();
      } else if (!data.loggedIn || data.event === AUTH_OBSERVED_ACTION_LOGOUT) {
        this.clearInterval();
        this.lastLoaded = {successLoades: 0};
        this.loaded = false;
      }
    });
  }

  public observable() {
    return this.observableInstance;
  }

  protected clearInterval() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  protected streamMetaInfo(): Promise<UserMetaInfoInterface> {
    if (this.requestInProgress) {
      return Promise.resolve(this.lastLoaded);
    }
    this.requestInProgress = true;
    return this.apis.get(this.auth.currentUser, pidgeApiUrl("user"), {})
      .then((data: UserMetaInfoInterface) => {
        this.successLoads++;
        this.lastLoaded = data;
        data.successLoads = this.successLoads;
        this.observableInstance.next(data);
      })
      .catch(error => console.error(error))
      .then(() => this.requestInProgress = false)
      .then(() => this.lastLoaded) //just to make the callback consistent
      ;
  }

  public subscribe(callable): Subscription {
    let subscription = this.observableInstance.subscribe(callable);
    if (this.lastLoaded) {
      callable(this.lastLoaded);
    }
    return subscription;
  }

  public info() {
    return this.lastLoaded;
  }

  public refresh() {
    return this.streamMetaInfo();
  }

  public onlyOnce(): Promise<UserMetaInfoInterface> {
    let subscription: Subscription;
    return new Promise((resolve, reject) => {
      if (this.lastLoaded) {
        return resolve(this.lastLoaded);
      }
      subscription = this.subscribe(meta => meta ? (subscription && subscription.unsubscribe()) || resolve(meta) : null);
    });
  }
}

export interface UserMetaInfoInterface {
  chats?: TeamInterface[];
  chatsSummary?: ChatParticipantSummaryInterface[];
  notifications?: NotificationInterface[];
  user?: UserInterface;
  events?: {
    Pending?: EventInvitationInterface[];
    Invitation?: EventInvitationInterface[];
    Confirmed?: EventInvitationInterface[];
    Cancelled?: EventInvitationInterface[];
    Done?: EventInvitationInterface[];
    Rejected?: EventInvitationInterface[];
    Past?: EventInvitationInterface[];
  };
  eventsList?: EventInvitationInterface[],
  successLoads?: number;

  [key: string]: any;
}
