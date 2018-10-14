import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams} from 'ionic-angular';
import {TeamInterface} from "../../models/chat";
import {AuthService} from "../../providers/pidge-client/auth-service";
import {EventService} from "../../providers/pidge-client/event-service";
import {LoadingStacker} from "../../providers/stacker/loading-stacker";
import {Event} from "../../models/event"
import {StandardToast} from "../../providers/services/standard-toast";

@IonicPage()
@Component({
  selector: 'page-create-event',
  templateUrl: 'create-event.html',
})
export class CreateEventPage {

  public chat: TeamInterface;
  public event = {note: null, title: null, date: null, time: null};
  public users: { [uqid: string]: boolean } = {};

  protected loader;

  constructor(protected navCtrl: NavController,
              protected navParams: NavParams,
              protected auth: AuthService,
              protected eventService: EventService,
              protected loadingStacker: LoadingStacker,
              protected toastCtrl: StandardToast) {

    this.chat = this.navParams.get('chat');
    this.event.title = `${this.chat.title} event`;

    for (let user of this.chat.users) {
      this.users[user.uqid] = true;
    }

  }

  public createEvent() {
    let date = new Date(this.event.date + "T" + this.event.time);
    let invited = [];
    for (let uqid in this.users) {
      if (this.users[uqid]) {
        invited.push(uqid);
      }
    }
    this.loadingStacker.add();
    this.eventService.createEvent(this.chat, {
      title: this.event.title,
      note: this.event.note,
      date: date,
      invited: invited
    })
      .then((event: Event) => {
        this.successToast("Event created successfully");
        this.loadingStacker.pop();
        return this.navCtrl.pop();
      })
      .catch(error => this.errorToast(error));
  }

  public get minDate() {
    let date = new Date(new Date().getTime() + 1 * 24 * 60 * 60 * 1000);
    date.setHours(0, 0, 0);
    return date.toISOString().split("T")[0];
  }

  public get maxDate() {
    let date = new Date(new Date().getTime() + 8 * 24 * 60 * 60 * 1000);
    date.setHours(23, 59, 59);
    return date.toISOString().split("T")[0];
  }

  protected successToast(message: string) {
    return this.toastCtrl.showSuccess(message);
  }

  protected errorToast(error: any) {
    return this.toastCtrl.showError(error);
  }
}
