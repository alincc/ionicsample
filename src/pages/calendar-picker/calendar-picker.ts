import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams, ViewController} from 'ionic-angular';
import {timezoneOffsetString} from "../../shared/time";

@IonicPage()
@Component({
  selector: 'page-picker',
  templateUrl: 'calendar-picker.html',
})
export class CalendarPickerPage {

  protected min: Date;
  protected max: Date;
  protected current: Date;
  protected selected: Date;
  protected timezone: string = timezoneOffsetString();

  constructor(public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController) {
    this.min = navParams.get('min');
    this.max = navParams.get('max');
    this.current = navParams.get('current');
    this.selected = navParams.get('selected');
  }

  setDate(date: Date) {
    this.selected = date;
  }

  finish() {
    this.viewCtrl.dismiss(this.selected);
  }

  cancel() {
    this.viewCtrl.dismiss(null);
  }

}
