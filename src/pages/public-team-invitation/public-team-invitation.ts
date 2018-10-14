import {Component} from '@angular/core';
import {AlertController, App, IonicPage, NavController, NavParams} from 'ionic-angular';
import {ChatService} from "../../providers/pidge-client/chat-service";
import {Chat} from "../../models/chat";
import {LoadingStacker} from "../../providers/stacker/loading-stacker";
import {AuthService} from "../../providers/pidge-client/auth-service";
import {LoadingPage} from "../loading/loading";
import {LoginPage} from "../login/login";
import {HomePage} from "../home/home";
import {StandardResponseAlert} from "../../providers/services/standard-response-alert";

@IonicPage({
  segment: 'team/:uqid/on-board'
})
@Component({
  selector: 'page-public-team-invitation',
  templateUrl: 'public-team-invitation.html',
})
export class PublicTeamInvitationPage {

  protected email;
  protected name;
  private team: Chat;

  constructor(protected navCtrl: NavController,
              protected navParams: NavParams,
              protected chatService: ChatService,
              protected alertCtrl: AlertController,
              protected loadingStacker: LoadingStacker,
              protected authService: AuthService,
              protected standardAlert: StandardResponseAlert,
              protected app: App) {

    this.authService.loginLastUser()
      .then(user => this.init(user))
      .catch(e => this.authenticateFirst());
  }

  protected init(user) {
    if (!user) {
      return this.authenticateFirst();
    }
    this.chatService.chatInfo(this.navParams.get('uqid'))
      .then(team => this.team = team);
  }

  protected authenticateFirst() {
    return this.showError("Please authenticate")
      .then(() => this.navCtrl.setRoot('LoadingPage'))
      .then(() => LoadingPage.loadedChange(true, 'LoginPage'))
      ;
  }

  protected invite() {
    this.loadingStacker.add();
    this.chatService.inviteEmailToChat(this.team, this.email, {name: this.name})
      .then(() => {
        this.email = "";
        this.name = null;
      })
      .then(() => this.standardAlert.showSuccess('Check your inbox for an invitation email, or if you have already created an account with Pidge, you should have been added already.', [], {
        title: 'Thank You',
        subTitle: 'Invitation Sent'
      }))
      .catch(err => this.showError(err))
      .then(() => this.loadingStacker.pop());
  }

  protected showError(error) {
    return this.standardAlert.showError(error);
  }

  protected backToTeam() {
    this.app.getRootNav().setRoot('HomePage');
  }
}
