import {Component} from '@angular/core';
import {IonicPage, NavParams, ViewController} from 'ionic-angular';
import {EventService} from "../../providers/pidge-client/event-service";
import {Event} from "../../models/event";
import {localTzDateAsISO} from "../../shared/time";
import {config} from "../../providers/config/config";
import {Standardize} from "../../providers/pidge-client/standardize";
import {AnalyticsLogger} from "../../providers/services/analytics-logger";

@IonicPage({})
@Component({
  selector: 'page-event-edit',
  templateUrl: 'event-edit.html',
})
export class EventEditPage {

  protected event: Event;
  protected done;
  protected chat;
  protected _date: string;
  protected minDate;
  protected maxDate;

  constructor(protected viewCtrl: ViewController,
              protected navParams: NavParams,
              protected eventService: EventService,
              protected analytics: AnalyticsLogger) {

    this.event = navParams.get('event');
    this.chat = navParams.get('chat') || this.event.chat;
    this.event = Standardize.event(this.event, this.chat);
    this.done = navParams.get('done');
    this._date = localTzDateAsISO(this.event.date);

    this.minDate = this.getMinDate();
    this.maxDate = this.getMaxDate();

  }

  ionViewDidEnter() {
    this.analytics.ga().then(ga=>ga.trackView('Edit Event Page'));
  }

  protected get date(): string {
    return this._date;
  }

  protected set date(dt: string) {
    this.event.date = new Date(dt);
    this._date = dt;
  }

  protected dismiss() {
    this.viewCtrl.dismiss();
  }

  protected saveEvent($event) {
    $event.preventDefault();
    $event.stopPropagation();
    this.eventService.updateEvent(this.chat, this.event, {
      title: this.event.title,
      note: this.event.note,
      date: this.event.date.toISOString()
    }).then((event: Event) => this.event.setRawData(event.rawLoadedData))
      .then(() => this.done(this.event))
      .then(() => this.viewCtrl.dismiss());
  }

  protected getMinDate(): string {
    return localTzDateAsISO(new Date(Date.now() + config.event_invitation_hours_to_close * 60 * 60 * 1000));
  }

  protected getMaxDate(): string {
    let max = new Date();
    max.setDate(max.getDate() + 7);
    return localTzDateAsISO(max);
  }

}
