import {Injectable} from '@angular/core';
import {GoogleAnalytics} from "@ionic-native/google-analytics";
import {config} from "../config/config";
import {VERSION_NUMBER} from "../../app/version";
import {Subject} from "rxjs/Subject";

@Injectable()
export class AnalyticsLogger {

  private _ready: boolean = false;
  private subject: Subject<GoogleAnalytics>;

  constructor(protected _ga: GoogleAnalytics) {
    this.subject = new Subject();
    this.prepare();
  }

  public ga(): Promise<GoogleAnalytics> {
    return new Promise(resolve => {
      if (this.ready) {
        return resolve(this._ga);
      } else {
        this.subject.subscribe((ga => resolve(this._ga)));
      }
    });
  }

  protected prepare() {
    this._ga.startTrackerWithId(config.google_analytics_id)
      .then(() => {
        this._ready = true;
        this._ga.setAppVersion(VERSION_NUMBER);
        this.subject.next(this._ga);
      })
      .catch(e => {
        console.error('Error starting GoogleAnalytics', e);
        if (e !== "cordova_not_available") {
          console.error('Trying again in 5 seconds');
          setTimeout(() => this.prepare(), 5000);
        }
      });
  }

  public get ready(): boolean {
    return this._ready;
  }


}
