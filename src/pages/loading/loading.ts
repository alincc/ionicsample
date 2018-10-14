import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams} from 'ionic-angular';
import {AnalyticsLogger} from "../../providers/services/analytics-logger";
import {RegisterPage} from "../register/register";
import {LoginPage} from "../login/login";

let loaded: boolean = false;
let instance: LoadingPage;
let thenGotoPage;
let shouldMoveAfterAnimation: boolean = false;

@IonicPage({
  priority: 'high'
})
@Component({
  selector: 'page-loading',
  templateUrl: 'loading.html',
})
export class LoadingPage {

  protected logo;
  protected document;
  protected skipAnimation: boolean;

  constructor(protected navCtrl: NavController,
              protected navParams: NavParams,
              protected analytics: AnalyticsLogger) {

    instance = this;
    this.skipAnimation = this.navParams.get('skipAnimation');
    if (this.skipAnimation) {
      loaded = true;
      this.goToNextPage();
    }

  }

  protected get loaded(): boolean {
    return loaded;
  }

  protected displayLogin() {
    this.navCtrl.push(LoginPage);
  }

  protected displayRegister() {
    this.navCtrl.push(RegisterPage);
  }

  public static loadedChange(done: boolean, vThenGotoPage = null, force: boolean = false) {
    thenGotoPage = vThenGotoPage;
    if (done) {
      shouldMoveAfterAnimation = done;
      instance && instance.endAnimation(force);
    }
  }

  public endAnimation(force: boolean = false) {
    let animationEnd = () => {
      if (thenGotoPage) {
        this.goToNextPage();
        thenGotoPage = null;
      } else {
        loaded = shouldMoveAfterAnimation;
      }
      shouldMoveAfterAnimation = false;
    };
    if (force) {
      animationEnd();
    } else {
      this.logo.addEventListener("webkitAnimationIteration", animationEnd, {once: false});
      this.logo.addEventListener("animationiteration", animationEnd, {once: false});
    }
    return true;
  }

  protected goToNextPage() {
    this.navCtrl.setRoot(thenGotoPage);
    // this.navCtrl.push(thenGotoPage).then(() => this.navCtrl.length() > 2 ? this.navCtrl.remove(1, 1) : null);
  }

  ngAfterViewInit() {
    this.logo = this.logo || document.getElementById("main-logo");
    this.document = document;
  }

  static resetDone() {
    loaded = false;
    thenGotoPage = null;
    shouldMoveAfterAnimation = false;
  }
}
