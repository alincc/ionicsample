import {Injectable} from "@angular/core";
import {PidgeApiService} from "./pidge-api-service";
import {Subject} from "rxjs/Subject";
import {UserMetaInfoInterface, UserMetaInfoService} from "./user-meta-info-service";
import {AuthService} from "./auth-service";
import {EventInvitation, EventInvitationInterface} from "../../models/event-invitation"
import {Standardize} from "./standardize";

@Injectable()
export class UserEventsListService {

  protected events: UserEventsList = {
    pending: [],
    confirmed: [],
    invitations: [],
    done: [],
    rejected: []
  } as UserEventsList;
  protected eventsList: EventInvitation[] = [];

  protected observableInstance: Subject<UserEventsListInterface>;

  constructor(protected userMeta: UserMetaInfoService,
              protected auth: AuthService,
              protected apis: PidgeApiService) {
    this.observableInstance = new Subject();
    this.auth.subscribe(data => {
      if (!data.loggedIn) {
        this.events = {};
        this.triggerNext();
      }
    });
    this.userMeta.subscribe((data: UserMetaInfoInterface) => {
      this.metaFetched(data);
    });
    this.metaFetched(this.userMeta.info());
  }

  protected metaFetched(data?: UserMetaInfoInterface) {
    if (!data || !data.successLoads) {
      return;
    }
    // this.events.invitations = Standardize.eventInvitationsList(data.events.Invitation);
    // this.events.confirmed = Standardize.eventInvitationsList(data.events.Confirmed);
    // this.events.cancelled = Standardize.eventInvitationsList(data.events.Cancelled);
    // this.events.pending = Standardize.eventInvitationsList(data.events.Pending);
    // this.events.rejected = Standardize.eventInvitationsList(data.events.Rejected);
    // this.events.done = Standardize.eventInvitationsList(data.events.Done);
    // this.events.past = Standardize.eventInvitationsList(data.events.Past);
    this.eventsList = Standardize.eventInvitationsList(data.eventsList);
    this.triggerNext();
  }

  public static prepareEventInvitations(list: EventInvitation[]) {
    let result = [];
    for (let invitation of list) {
      result.push(invitation);
    }
    return result;
  }

  protected triggerNext() {
    this.observableInstance.next(this.events);
  }

  public observable() {
    return this.observableInstance;
  }

  public subscribe(callable) {
    return this.observableInstance.subscribe(callable);
  }

  public grouped(): UserEventsList {
    return this.events;
  }

  public fetchNewEvents() {
    return this.userMeta.refresh();
  }

  public list(): EventInvitation[] {
    return this.eventsList;
  }
}

export class UserEventsList implements UserEventsListInterface {
  pending?: EventInvitation[];
  invitations?: EventInvitation[];
  confirmed?: EventInvitation[];
  cancelled?: EventInvitation[];
  rejected?: EventInvitation[];
  done?: EventInvitation[];
  past?: EventInvitation[];
}

export interface UserEventsListInterface {
  pending?: EventInvitationInterface[];
  invitations?: EventInvitationInterface[];
  confirmed?: EventInvitationInterface[];
  cancelled?: EventInvitationInterface[];
  rejected?: EventInvitationInterface[];
  done?: EventInvitationInterface[];
  past?: EventInvitationInterface[];
}
