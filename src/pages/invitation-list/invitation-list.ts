import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { UpcomingEventInterface } from '../../models/event';
import {date} from "../../shared/date-format";

/**
 * Generated class for the InvitationListPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-invitation-list',
  templateUrl: 'invitation-list.html',
})
export class InvitationListPage {
  protected regularEvent:Array<UpcomingEventInterface>=[];
  protected singleEvent:Array<UpcomingEventInterface>=[];
  constructor(protected navCtrl: NavController,
              protected navParams: NavParams,
              protected viewCtrl:ViewController) {
                this.regularEvent=this.navParams.get('regularEvent');
                this.singleEvent=this.navParams.get('singleEvent');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad InvitationListPage');
  }
  protected date(format: String, time: Date): String {
      time=new Date(time);
    return date(format, time);
  }
  joinEvent(eventInvitation)
  {
    this.viewCtrl.dismiss(eventInvitation);
  }
  close()
  {
    this.viewCtrl.dismiss();
  }
}
