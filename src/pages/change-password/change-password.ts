import {Component, ViewChild} from '@angular/core';
import {IonicPage, NavController, NavParams} from 'ionic-angular';
import {FormControl, FormGroup, NgForm, Validators} from "@angular/forms";
import {LoadingStacker} from "../../providers/stacker/loading-stacker";
import {UserService} from "../../providers/pidge-client/user-service";
import {StandardResponseAlert} from "../../providers/services/standard-response-alert";
import {StandardToast} from "../../providers/services/standard-toast";

@IonicPage()
@Component({
  selector: 'page-change-password',
  templateUrl: 'change-password.html',
})
export class ChangePasswordPage {
  @ViewChild('changePasswordForm') changePasswordForm: NgForm;

  protected currentPassword: string;
  protected newPassword: string;
  protected confirmPassword: string;

  constructor(protected navCtrl: NavController,
              protected navParams: NavParams,
              protected userService: UserService,
              protected loadingStacker: LoadingStacker,
              protected alertCtrl: StandardResponseAlert,
              protected toastCtrl: StandardToast) {
  }

  ionViewDidEnger() {
    this.changePasswordForm.form.controls.curPwd.setValidators([Validators.required, Validators.minLength(6)]);
    this.changePasswordForm.form.controls.newPwd.setValidators([Validators.required, Validators.minLength(6)]);
    this.changePasswordForm.form.controls.cfrmPwd.setValidators([Validators.required, confirm]);
  }

  protected changePassword() {
    this.loadingStacker.add();
    this.userService.changePassword(this.currentPassword, this.newPassword, this.confirmPassword)
      .then(() => this.navCtrl.pop())
      .then(() => this.toastCtrl.showSuccess("Password changed"))
      .catch(e => this.alertCtrl.showError(e))
      .then(() => this.loadingStacker.pop());
  }

}

function confirm(confirm: FormControl) {
  if (confirm.value !== (confirm.root as FormGroup).controls.newPwd.value) {
    return {"confirm": "Password confirmation is incorrect"};
  }
  return null;
}
