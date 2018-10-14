import {Component} from '@angular/core';
import {IonicPage, Loading, NavController, Platform,NavParams} from 'ionic-angular';
import {UserInterface} from '../../models/user';
import {AuthService, CredentialsInterface} from "../../providers/pidge-client/auth-service";
import {HomePage} from "../home/home";
import {LoadingStacker} from "../../providers/stacker/loading-stacker";
import {AnalyticsLogger} from "../../providers/services/analytics-logger";
import {RegisterPage} from "../register/register";
import {ForgotPasswordPage} from "../forgot-password/forgot-password";
import {StandardResponseAlert} from "../../providers/services/standard-response-alert";
import {StandardToast} from "../../providers/services/standard-toast";

@IonicPage({
  segment: 'login'
})
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  protected loading: Loading;
  protected credentials: CredentialsInterface = {email: '', password: ''};
  protected user: UserInterface;

  constructor(protected platform: Platform,
              private nav: NavController,
              private auth: AuthService,
              protected loadingStacker: LoadingStacker,
              protected analytics: AnalyticsLogger,
              protected standardAlert: StandardResponseAlert,
              protected standardToast: StandardToast,
              protected navParams: NavParams) {

  }



  ionViewDidEnter() {
    this.analytics.ga().then(ga => ga.trackView('Login Page'));
  }

  public createAccount() {
    this.nav.push(RegisterPage)
      .then(() => this.nav.length() > 2 ? this.nav.remove(1, 1) : null);
  }

  public forgotPassword() {
    this.nav.push(ForgotPasswordPage);
  }

  public login() {
    this.loadingStacker.add("Logging in...")
    this.auth.loginViaCredentials(this.credentials)
      .then((user: UserInterface) => this.user = user)
      .then(() => this.nav.push(HomePage, {user: this.user}))
      .then(() => this.nav.remove(1, this.nav.length() - 2))
      .catch(error => {
        console.error(error);
        if (error.hint && error.hint === "Resend verification email") {
          this.showError(error, {
            text: "Resend",
            role: "cancel",
            handler: () => {
              this.loadingStacker.add();
              this.auth.resendVerificationEmail(this.credentials.email)
                .then(message => this.standardToast.showSuccess(message))
                .catch(() => this.standardAlert.showError("Something went wrong. Please contact the support for help"))
                .then(() => this.loadingStacker.pop())
              ;
            }
          });
        } else {
          this.showError(error);
        }
      })
      .catch(e => console.error(e))
      .then(() => this.loadingStacker.pop());
  }

  protected showError(error, additionalButton = null) {
    let text = typeof(error) == "string" ? error : (typeof(error) == "object" ? (error.hasOwnProperty("message") ? error.message : (error.hasOwnProperty("text") ? error.text : (error.hasOwnProperty("error") ? error.error : error.toString() || "Unknown error"))) : error.toString() || "Unknown error");
    return this.standardAlert.showError(text);
  }

}
