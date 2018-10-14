import {Component} from '@angular/core';
import {App, IonicPage, NavController, NavParams} from 'ionic-angular';
import {Color, ColorTween} from "../../shared/color";
import {LoadingStacker} from "../../providers/stacker/loading-stacker";
import {EventInvitation} from "../../models/event-invitation";
import {EventService} from "../../providers/pidge-client/event-service";
import {UserMetaInfoService} from "../../providers/pidge-client/user-meta-info-service";
import {date} from "../../shared/date-format";
import {UserEventsListService} from "../../providers/pidge-client/user-event-list-service";
import {EventPage} from "../event/event";
import {AnalyticsLogger} from "../../providers/services/analytics-logger";
import {DAY_NAMES_LONG, DAY_NAMES_SHORT} from "../../shared/time";
import {Chat, TeamInterface} from "../../models/chat";
import {Event} from "../../models/event";
import {RegularEvent} from "../../models/regular-event";
import {StandardResponseAlert} from "../../providers/services/standard-response-alert";
import {EventFormPage} from "../event-form/event-form";
import {ChatService} from "../../providers/pidge-client/chat-service";
import {AuthService} from "../../providers/pidge-client/auth-service";
import {UserInterface} from "../../models/user";
import {delayExecution} from "../../shared/misc";
import {ChatCreatePage} from "../chat-create/chat-create";
import {StandardToast} from "../../providers/services/standard-toast";

@IonicPage({})
@Component({
  selector: 'page-calendar',
  templateUrl: 'calendar.html',
})
export class CalendarPage {

  protected eventsList: EventInvitation[];
  protected displayedEventsGrouped: EventInvitationDisplayGroup[];
  protected _displayedGroup: String = "coming";
  protected user: UserInterface;
  protected invitationsUnderUpdate: { [id: number]: false | null | string } = {};

  constructor(protected navCtrl: NavController,
              protected navParams: NavParams,
              protected eventsListService: UserEventsListService,
              protected toastCtrl: StandardToast,
              protected eventsService: EventService,
              protected userService: UserMetaInfoService,
              protected chatService: ChatService,
              protected loadingStacker: LoadingStacker,
              protected analytics: AnalyticsLogger,
              protected authService: AuthService,
              protected standardAlert: StandardResponseAlert,
              protected app: App) {
  }

  protected init() {
    this.eventsListService.subscribe(events => {
      this.setEventsList(this.eventsListService.list());
    });
    this.setEventsList([]);
    this.eventsListService.fetchNewEvents()
  }

  public ionViewDidEnter() {
    this.analytics.ga().then(ga => ga.trackView('Calendar Page'));
  }

  public ionViewDidLoad() {
    this.authService.whenUserAuthenticated()
      .then(user => this.user = user)
      .then(() => this.init());
    this.authService.retrieveCurrentUser()
      .catch(e => this.app.getRootNav().setRoot('LoadingPage'));
  }

  public successToast(message: string) {
    return this.toastCtrl.showSuccess(message);
  }

  public errorToast(error: any) {
    return this.toastCtrl.showError(error);
  }

  public refreshEvents(refresher) {
    this.eventsListService.fetchNewEvents()
      .then(() => refresher.complete())
      .catch(() => refresher.complete());
  }

  public dayName(dayOfWeek: number, short: boolean = true) {
    let longNames = DAY_NAMES_LONG;
    let shortNames = DAY_NAMES_SHORT;
    let source = short ? shortNames : longNames;
    return source[dayOfWeek % 7];
  }

  public acceptEventInvitation($event, invitation: EventInvitation) {
    $event && $event.stopPropagation && $event.stopPropagation();
    return Promise.resolve(this.invitationsUnderUpdate[invitation.id] = 'accept')
      .then(() => this.eventsService.acceptEventInvitation(invitation))
      .then(() => this.userService.refresh())
      .then(() => this.successToast("Invitation has been accepted successfully"))
      .catch(error => this.errorToast("Failed to accept the invitation: " + error))
      .then(() => this.invitationsUnderUpdate[invitation.id] = false)
      ;
  }

  public rejectEventInvitation($event, invitation: EventInvitation) {
    $event && $event.stopPropagation && $event.stopPropagation();
    return Promise.resolve(this.invitationsUnderUpdate[invitation.id] = 'reject')
      .then(() => this.eventsService.rejectEventInvitation(invitation))
      .then(() => this.userService.refresh())
      .then(() => this.successToast("Invitation has been rejected successfully"))
      .catch(error => this.errorToast("Failed to reject the invitation: " + error))
      .then(() => this.invitationsUnderUpdate[invitation.id] = false)
      ;
  }

  protected invitationStatusColor(invitation: EventInvitation) {
    switch (invitation.status) {
      case 'Cancelled':
        return 'light';
      case 'Rejected':
        return 'danger';
      case 'Done':
        return 'secondary';
      default:
        return 'primary';
    }
  }

  protected setEventsList(list: EventInvitation[]) {
    let njs = JSON.stringify(list);
    let ojs = JSON.stringify(this.eventsList);
    if (njs === ojs) {
      return;
    }
    this.eventsList = list;
    this.groupDisplayedEvents();
  }

  protected set displayedGroup(group: String) {
    this._displayedGroup = group === "past" ? "past" : "coming";
    this.groupDisplayedEvents();
  }

  protected get displayedGroup(): String {
    return this._displayedGroup;
  }

  protected get displayedEventsList(): EventInvitation[] {
    return this.eventsList.filter((event, index) => {
        return this.displayedGroup === 'past' ? event.event.isPast : !event.event.isPast;
      }
    );
  }

  protected groupDisplayedEvents(): GroupedEvents {
    let group = new GroupedEvents(this.displayedGroup === 'past' ? this.displayedEventsList : this.displayedEventsList.reverse());
    console.log('group.grouped', group.grouped);
    this.displayedEventsGrouped = group.grouped;
    return group;
  }

  protected date(format: String, time: Date): String {
  
    return date(format, time);
  }

  protected itemSwiping($event, invitation) {
    let percent = $event.getSlidingPercent();
    let $nativeElement = $event._elementRef.nativeElement;
    let revealRightOptions = percent > 0;
    let color = new ColorTween($nativeElement.classList.value.match("invitation-pending") ? new Color(0, 140, 130) : new Color(255, 255, 255), revealRightOptions ? new Color(245, 61, 61) : new Color(0, 140, 130)).perc(Math.abs(percent) / 3).hex;
    $nativeElement.getElementsByTagName("ion-item")[0].style.backgroundColor = color;
  }

  protected openEventInvitationPage(invitation: EventInvitation) {
    this.navCtrl.push(EventPage, {event: invitation.event, invitation: invitation});
  }

  protected openEventPage(event: Event) {
    return Promise.resolve(this.loadingStacker.add())
      .then(() => delayExecution(() => this.navCtrl.push(EventPage, {event, chat: event.chat}), 200))
      .then(() => this.loadingStacker.pop());
  }

  protected openRegularEventPage(event: RegularEvent) {
    //this.navCtrl.push(TeamInfoPage, {event, uqid: event.uqid});
    //@TODO: implement the page
  }

  protected createEvent() {
    let showCreateEventPage = ((item: TeamInterface) => this.navCtrl.push(EventFormPage, {
      uqid: item.uqid,
      then: (item: Event | RegularEvent) => {
        return item instanceof Event ? this.openEventPage(item as Event) : this.openRegularEventPage(item as RegularEvent)
      }
    }));
    return Promise.resolve(this.loadingStacker.add())
      .then(() => this.chatService.onlyOnce())
      .then(teams => teams.filter((chat: TeamInterface) => chat.you.isAdmin))
      .then(adminedTeams => !adminedTeams.length ? this.standardAlert.showError("You are not an admin in any team, so cannot create events yet!", [{
        text: 'Create New Team',
        role: 'Cancel',
        handler: () => {
          Promise.resolve(this.loadingStacker.add())
            .then(() => this.navCtrl.push(ChatCreatePage, {
              then: (data: { chat: Chat }) => Promise.resolve(this.loadingStacker.add())
                .then(() => this.chatService.refreshChats())
                .then(() => {
                  return showCreateEventPage(data.chat)
                })//this.navCtrl.push(EventFormPage, {uqid: data.chat.uqid}))
                .then(() => this.loadingStacker.pop())
            }))
            .then(() => this.loadingStacker.pop());
        }
      }]) : showCreateEventPage(adminedTeams[0]))
      .then(() => this.loadingStacker.pop());
  }

  protected eventUsers(eventInvitation: EventInvitation) {
    //@TODO: load eventUsers later
    return [];
  }

  protected trackEventId(index: number, event: EventInvitation): string {
    return event.id.toString() + event.updatedAt.getTime().toString();
  }

  protected trackEventGroupId(index: number, eventGroup: EventInvitationDisplayGroup): string {
  //  alert('date '+eventGroup.date);
    return eventGroup.date.getTime().toString() + "-" + eventGroup.list.map(event => event.id.toString() + "-" + event.updatedAt.getTime().toString()).join("");
  }

}

class GroupedEvents {

  protected list: EventInvitation[] = [];

  constructor(list: EventInvitation[]) {
    this.list = list;
  }

  public get grouped(): Array<EventInvitationDisplayGroup> {
    let result = [];
    let lastGroup;
    let pTopLevel = null;
    console.log("this.list",this.list);
    this.list.forEach((value) => {
      // console.log("this.list"+this.list[0].event.date);
      // console.log("2this.list"+value.event.date);
    // alert(value.event.date);
      let dateDay = date("Y-m-d", value.event.date);
      let topLevel = date('F Y', value.event.date);
      if (!lastGroup || lastGroup.dt !== dateDay) {
        if (lastGroup) {
          result.push(lastGroup);
        }
        lastGroup = {date: value.event.date, dt: dateDay, topLevel: topLevel === pTopLevel ? null : topLevel, list: []};
        pTopLevel = topLevel;
      }
      lastGroup.list.push(value);
    });
    if (lastGroup) {
      result.push(lastGroup);
    }
    return result;
  }

}

interface EventInvitationDisplayGroup {
  date: Date;
  dt: string;
  topLevel: string;
  list: EventInvitation[];
}
