import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams} from 'ionic-angular';
import {AnalyticsLogger} from "../../providers/services/analytics-logger";

@IonicPage({})
@Component({
  selector: 'page-account',
  templateUrl: 'account.html',
})
export class AccountPage {

  constructor(protected navCtrl: NavController,
              protected navParams: NavParams,
              protected analytics: AnalyticsLogger) {
  }

  ionViewDidEnter() {
    this.analytics.ga().then(ga=>ga.trackView('Account Page'));
  }

}
