import {Component} from "@angular/core";
import {AlertController, IonicPage, NavController, NavParams} from "ionic-angular";
import {AuthService, UserMembershipInvitationInterface} from "../../providers/pidge-client/auth-service";
import {AnalyticsLogger} from "../../providers/services/analytics-logger";
import {LoadingStacker} from "../../providers/stacker/loading-stacker";
import {RegisterPage} from "../register/register";
import {StandardResponseAlert} from "../../providers/services/standard-response-alert";
import {LoadingPage} from "../loading/loading";

@IonicPage({
  segment: "invitation/:uqid/:challenge"
})
@Component({
  selector: "page-accept-invitation",
  templateUrl: "accept-invitation.html",
})
export class AcceptInvitationPage {

  protected invitation: UserMembershipInvitationInterface;

  constructor(protected nav: NavController,
              protected navParams: NavParams,
              protected auth: AuthService,
              protected alertCtrl: AlertController,
              protected analytics: AnalyticsLogger,
              protected standardAlert: StandardResponseAlert,
              protected loadingStacker: LoadingStacker) {

    this.loadingStacker.add();
    this.auth.loadInvitation(this.navParams.get('uqid'), this.navParams.get('challenge'))
      .then(invitation => this.invitation = invitation)
      .then(() => this.invitation['user_id'] ? this.throwError('Invitation already accepted') : null)
      .then(() => this.invitation.expires_at && new Date(this.invitation.expires_at).getTime() < new Date().getTime() ? this.throwError('Invitation has expired') : null)
      .then(() => this.accept())
      .catch(e => this.nav.setRoot('LoadingPage').then(() => this.standardAlert.showError(e)))
      .then(() => this.loadingStacker.pop())
  }

  public ionViewDidEnter() {
    this.analytics.ga().then(ga => ga.trackView('Accept Invitation Page'));
  }

  public accept() {
    return this.nav.setRoot(RegisterPage, {invitation: this.invitation});
  }

  protected throwError(s: string) {
    throw s;
  }

}
