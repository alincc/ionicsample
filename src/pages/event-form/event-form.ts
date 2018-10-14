import {Component} from '@angular/core';
import {AlertController, IonicPage, NavController, NavParams} from 'ionic-angular';
import {AnalyticsLogger} from "../../providers/services/analytics-logger";
import {LoadingStacker} from "../../providers/stacker/loading-stacker";
import {GenericScheduleInterface} from "../../models/generic-schedule-interface";
import {EventService} from "../../providers/pidge-client/event-service";
import {RegularEvent, RegularEventInterface} from "../../models/regular-event";
import {Event, EventInterface} from "../../models/event";
import {ChatService} from "../../providers/pidge-client/chat-service";
import {Chat} from "../../models/chat";
import {StandardResponseAlert} from "../../providers/services/standard-response-alert";
import {AuthService} from "../../providers/pidge-client/auth-service";
import {UserMetaInfoService} from "../../providers/pidge-client/user-meta-info-service";
import {currentTimezoneOffsetString, localTzDateAsISO} from "../../shared/time";
import {EventPage} from "../event/event";

@IonicPage({})
@Component({
  selector: 'page-event-form',
  templateUrl: 'event-form.html',
})
export class EventFormPage {

  protected doneCallback: any;
  protected updatingModel: RegularEventInterface | EventInterface;
  protected startDateMin: string = new Date().toISOString();
  //protected startDateMax: string = new Date().toISOString();

  protected startDateMax: string = new Date(new Date().getTime() + 365.25 * 24 * 60 * 60 * 1000).toISOString();
  protected stopDateMin: string = new Date().toISOString();
  protected stopDateMax: string = new Date(new Date().getTime() + 5 * 365.25 * 24 * 60 * 60 * 1000).toISOString();
  protected _startDateDatePart: string = new Date().toISOString().split('T')[0];
  protected _startDateTimePart: string = new Date().getHours() + ":00:00";
  protected _stopDateDatePart: string = new Date(new Date().getTime() + 365.25 * 24 * 60 * 60 * 1000).toISOString();
 // protected _stopDateDatePart: string = new Date().toISOString().split('T')[0];

  protected model: GenericScheduleInterface = {
    name: "",
    note: "",
    location: "",
    type: "",
    date: new Date().toISOString().replace(/\:[0-9]{2}\:/i, ':00:'),
    repeat: "No",
    stopRepeatingDate: new Date(new Date().getTime() + 365.25 * 24 * 60 * 60 * 1000).toISOString(),
    team_uqid: "",
    team_id: null,
    id: null,
    uqid: null,
    regular_id: null,
    regular_uqid: null
  };
  protected buttonTitle: string = "Create Event";
  protected editMode: string = "New";
  protected team: Chat;
  protected teams: Chat[];
  protected timezoneString: string = currentTimezoneOffsetString();

  public constructor(protected navCtrl: NavController,
                     protected alertCtrl: AlertController,
                     protected navParams: NavParams,
                     protected eventService: EventService,
                     protected loadingStacker: LoadingStacker,
                     protected analytics: AnalyticsLogger,
                     protected chatService: ChatService,
                     protected authService: AuthService,
                     protected userMeta: UserMetaInfoService,
                     protected standardAlert: StandardResponseAlert) {
     

    this.doneCallback = this.navParams.get('then');

    this.model.team_uqid = this.navParams.get('uqid');
    this.model.uqid = this.navParams.data.hasOwnProperty('event_uqid') ? this.navParams.data.event_uqid : null;

    Promise.resolve(this.loadingStacker.add())
      .then(() => this.authService.whenUserAuthenticated())
      .then(() => this.chatService.getChats())
      .then(teams => this.teams = teams.filter(team => team.you && team.you.isAdmin))
      .then(() => this.loadTeamInfo(this.model.team_uqid))
      .then(() => this.model.uqid && this.loadEventInfo(this.model.uqid))
      .then(() => this.loadingStacker.pop());

  }

  protected loadTeamInfo(uqid) {
    return this.chatService.chatInfo(uqid)
      .then(team => this.team = team)
      .catch(err => this.standardAlert.showError(err).then(() => this.navCtrl.pop()));
  }

  protected loadEventInfo(uqid) {
    return this.eventService.scheduleInfo(this.team.uqid, uqid)
      .then(event => this.extractModifyingEntity(event))
      .catch(err => this.standardAlert.showError(err).then(() => this.navCtrl.pop()));
  }

  private extractRegularAsModifyingEntity(regular: RegularEvent) {

    this.updatingModel = regular;

    this.model.name = regular.title;
    this.model.note = regular.note;
    this.model.location = regular.address;
    this.model.type = regular.type;
    this.model.date = regular.intervalStartsOn.toISOString();
    //temp ones
    this._startDateDatePart = localTzDateAsISO(regular.intervalStartsOn);
    this._startDateTimePart = this._startDateDatePart;
    this._stopDateDatePart = regular.intervalEndsOn ? localTzDateAsISO(regular.intervalEndsOn) : null;

    this.model.uqid = regular.uqid;
    this.model.id = regular.id;
    this.model.team_uqid = regular.chat.uqid;
    this.model.team_id = regular.chat.id;

    this.model.repeat = regular.intervalUnit === "Week" ? "Weekly" : (regular.intervalUnit === "Month" ? "Monthly" : "Daily");
    this.model.stopRepeatingDate = regular.intervalEndsOn ? regular.intervalEndsOn.toISOString() : null;

    this.buttonTitle = "Save Schedule";
    this.editMode = "Update";
  }

  private extractEventAsModifyingEntity(event: Event) {

    this.updatingModel = event;

    this.model.name = event.title;
    this.model.note = event.note;
    this.model.location = event.address;
    this.model.type = event.type;
    this.model.date = event.date.toISOString();
    //temp ones
    this._startDateDatePart = localTzDateAsISO(event.date);
    this._startDateTimePart = this._startDateDatePart;

    this.model.uqid = event.uqid;
    this.model.id = event.id;
    this.model.team_uqid = event.chat.uqid;
    this.model.team_id = event.chat.id;

    this.model.repeat = null;
    this.model.stopRepeatingDate = null;

    this.buttonTitle = "Save Event";
    this.editMode = "Update";
  }

  protected createEvent($e) {
    if (this.model.repeat) {
      //regular
    } else {
      //single
    }
    let data: EventInterface | RegularEventInterface;
    Promise.resolve(this.loadingStacker.add())
      .then(() => {
        return this.editMode === 'New' ? this.eventService.createSchedule(this.model) : this.eventService.updateSchedule(this.model);
      })
      .then((result: EventInterface | RegularEventInterface) => data = result)
      .then(() => this.navCtrl.pop())
      .then(() => this.doneCallback ? this.doneCallback(data) : (data.hasOwnProperty('interval_ends_on') || data.hasOwnProperty('intervalEndsOn') ? null : this.navCtrl.push(EventPage, {event: data})))
      .then(() => this.standardAlert.showSuccess((this.model.repeat ? "Team schedule" : "Event") + " has been " + (this.editMode === 'New' ? 'created' : 'updated')))
      .catch(err => this.standardAlert.showError(err))
      .then(() => this.loadingStacker.pop());
  }

  protected extractModifyingEntity(event: Event | RegularEvent) {
    if (event instanceof Event) {
      this.extractEventAsModifyingEntity(event)
    } else {
      this.extractRegularAsModifyingEntity(event);
    }
  }

  protected updatingModelType(): "Event" | "Schedule" | null {
    return this.updatingModel ? (this.updatingModel instanceof Event ? "Event" : "Schedule") : null;
  }

  get stopDateDatePart() {
    return this._stopDateDatePart;
  }

  set stopDateDatePart(value) {
    this._stopDateDatePart = value;
    this.model.stopRepeatingDate = value ? new Date(value.split('T')[0] + "T23:59:59" + currentTimezoneOffsetString()).toISOString() : null;
  }

  get startDateTimePart() {
    return this._startDateTimePart;
  }

  set startDateTimePart(value) {
    this._startDateTimePart = value;
    this.startDateDatePart && this.startDateTimePart && this.setModelDateTime(this.startDateDatePart, this.startDateTimePart);
  }

  get startDateDatePart() {
     console.log("get 1 "+this._startDateDatePart);

    return this._startDateDatePart;
  }

  set startDateDatePart(value) {
    this._startDateDatePart = value;
    // alert("1 "+this._startDateDatePart);
    this.startDateDatePart && this.startDateTimePart && this.setModelDateTime(this.startDateDatePart, this.startDateTimePart);
  // alert("2"+this._startDateDatePart);
  }

  protected setModelDateTime(date, time) {
    let normalizedTimeValues = time.replace(/^[0-9\-]+T/, '').replace(/(Z|z)|(\+[0-9\:]{3,5})$/, '').split(":").map(part => part.length < 2 ? "0" + part : part).join(":");
    let normalizedTimeLength = normalizedTimeValues.replace(/^([0-9]{2}\:[0-9]{2})$/, normalizedTimeValues + ":00").replace(/[^0-9\:]+/, '');
    let dateTimeString = date.split('T')[0] + 'T' + normalizedTimeLength + currentTimezoneOffsetString();
    let dt = new Date(dateTimeString);
    let end = new Date(this.model.stopRepeatingDate);
    this.model.date = dt.toISOString();
    if (dt.getTime() > end.getTime()) {
      this.model.stopRepeatingDate = new Date(dt.getTime() + 365.25 * 24 * 60 * 60 * 1000).toISOString();
    }
  }

}
