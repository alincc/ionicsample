import {Component, ViewChild} from "@angular/core";
import {AlertController, IonicPage, NavController, NavParams} from "ionic-angular";
import {UserInterface} from "../../models/user";
import {HomePage} from "../home/home";
import {
  AuthApiFailedResponseInterface, AuthService, RegisterModelInterface,
  UserMembershipInvitationInterface
} from "../../providers/pidge-client/auth-service";
import {AnalyticsLogger} from "../../providers/services/analytics-logger";
import {LoadingStacker} from "../../providers/stacker/loading-stacker";
import {FormControl, FormGroup, NgForm, Validators} from "@angular/forms";
import {LoginPage} from "../login/login";
import {StandardResponseAlert} from "../../providers/services/standard-response-alert";
import {StandardToast} from "../../providers/services/standard-toast";

@IonicPage({})
@Component({
  selector: "page-register",
  templateUrl: "register.html",
})
export class RegisterPage {
  @ViewChild('registerForm') registerForm: NgForm;

  protected credentials = {email: "", password: "", name: "", from_email: ""};
  protected user: UserInterface;
  protected invitation: UserMembershipInvitationInterface;

  constructor(protected nav: NavController,
              protected navParams: NavParams,
              protected auth: AuthService,
              protected alertCtrl: AlertController,
              protected analytics: AnalyticsLogger,
              protected standardAlert: StandardResponseAlert,
              protected standardToast: StandardToast,
              protected loadingStacker: LoadingStacker) {
    this.invitation = this.navParams.get('invitation');
    if (this.invitation) {
      this.credentials.email = this.invitation.email.email;
      this.credentials.from_email = this.invitation.email.email;
      this.credentials.name = this.invitation.data && this.invitation.data.name ? this.invitation.data.name : "";
    }
  }

  ionViewDidLoad() {
  }

  ionViewDidEnter() {
    this.analytics.ga().then(ga => ga.trackView('Register Page'));
    // console.log(this.registerForm, this.registerForm.controls, this.registerForm.form, this.registerForm.form.controls);
    this.registerForm.form.controls.name.setValidators([Validators.required, Validators.minLength(3)]);
    this.registerForm.form.controls.email.setValidators([Validators.required, Validators.email]);
    this.registerForm.form.controls.password.setValidators([Validators.required, Validators.minLength(6)]);
    //this.registerForm.form.controls.confirm.setValidators([Validators.required, confirm]);
  }

  public loginToAccount() {
    return this.nav.push(LoginPage)
      .then(() => this.nav.length() > 2 ? this.nav.remove(1, 1) : null);
  }

  public register() {
    this.loadingStacker.add();
    this.auth.register(this.credentials as RegisterModelInterface)
      .then((user: UserInterface) => this.user = user)
      .then(() => this.nav.setRoot(HomePage, {user: this.user}))
      .catch((error: AuthApiFailedResponseInterface) => error.hint && error.hint === 'Resend verification email' ? this.showRegistrationDone(error) : this.showError(error.message))
      .then(() => this.loadingStacker.pop());
  }

  protected showError(error) {
    return this.standardAlert.showError(error);
  }

  private showRegistrationDone(e) {
    return this.standardToast.showSuccess(e.message)
      .then(() => this.loginToAccount());
  }
}

function confirm(confirm: FormControl) {
  if (confirm.value !== (confirm.root as FormGroup).controls.password.value) {
    return {"confirm": "Password confirmation is incorrect"};
  }
  return null;
}
