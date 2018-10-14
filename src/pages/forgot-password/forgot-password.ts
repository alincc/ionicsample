import {AuthService} from './../../providers/pidge-client/auth-service';
import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams} from 'ionic-angular';
import {LoadingStacker} from "../../providers/stacker/loading-stacker";
import {LoginPage} from "../login/login";
import {StandardResponseAlert} from "../../providers/services/standard-response-alert";

@IonicPage()
@Component({
  selector: 'page-forgot-password',
  templateUrl: 'forgot-password.html',
})
export class ForgotPasswordPage {

  protected email: string;
  protected sentDiv: HTMLElement | any;

  constructor(protected navCtrl: NavController,
              protected navParams: NavParams,
              protected loadingStacker: LoadingStacker,
              protected auth: AuthService,
              protected alertCtrl: StandardResponseAlert) {
  }

  public forgotPassword() {
    this.loadingStacker.add("Sending new password ...");
    this.auth.forgotPassword(this.email)
      .then(() => this.loadingStacker.pop()) //if success, we need to display this first
      .then(() => this.email = "")
      .then(() => this.alertCtrl.showSuccess("You should receive an email with instructions to reset your password"))
      .then(() => this.navCtrl.pop())
      .catch(err => this.alertCtrl.showError(err))
      .then(() => this.loadingStacker.pop()) //if failed we need to remove the stacker before we continue
    ;
  }

  public loginPage() {
    this.navCtrl.push(LoginPage)
      .then(() => this.navCtrl.remove(1, 1));
  }

  ngAfterViewInit() {
    this.sentDiv = document.getElementById("message-sent");
  }

  protected goBack() {
    return this.navCtrl.pop();
  }

}
