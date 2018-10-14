import {Component} from '@angular/core';
import {Alert, AlertController, IonicPage, NavController, NavParams} from 'ionic-angular';
import {Chat, ChatParticipant, ChatUser, ChatUserInterface} from "../../models/chat";
import {ChatService} from "../../providers/pidge-client/chat-service";
import {LoadingStacker} from "../../providers/stacker/loading-stacker";
import {AnalyticsLogger} from "../../providers/services/analytics-logger";
import {StandardToast} from "../../providers/services/standard-toast";

@IonicPage({})
@Component({
  selector: 'page-chat-participant-info',
  templateUrl: 'chat-participant-info.html',
})
export class ChatParticipantInfoPage {

  protected user: ChatUser;
  protected chat: Chat;
  protected then;
  protected busy: boolean = false;
  protected alert: Alert;
  protected you: ChatParticipant;

  constructor(protected navCtrl: NavController,
              protected navParams: NavParams,
              protected alertCtrl: AlertController,
              protected chatService: ChatService,
              protected loadingStacker: LoadingStacker,
              protected toastCtrl: StandardToast,
              protected analytics: AnalyticsLogger) {
    this.user = navParams.get('user');
    this.chat = navParams.get('chat');
    this.you = navParams.get('you');
    this.then = navParams.get('then');

  }

  ionViewDidEnter() {
    this.analytics.ga().then(ga => ga.trackView('Team Member Page'));
  }

  ionViewWillLeave() {
    this.then(this.user);
  }

  ionViewCanLeave() {
    return !this.busy;
  }

  protected changeRole() {
    this.alert = this.alertCtrl.create({
      title: "Change User Role",
      message: "This will take effect once the team interface is opened next time and won't affect currently opened sessions.",
      subTitle: "Choose the role for user " + this.user.name,
      buttons: [
        {
          text: 'Admin',
          handler: () => {
            this.changeRoleTo('Admin');
          }
        },
        {
          text: 'Supervisor',
          handler: () => {
            this.changeRoleTo('Supervisor')
          }
        },
        {
          text: 'Participant',
          handler: () => {
            this.changeRoleTo('Participant')
          }
        }
      ]
    });
    this.alert.present();
  }

  protected changeRoleTo(role: string) {
    this.busy = true;
    this.loadingStacker.add();
    this.chatService.updateChatUser(this.chat, this.user, {
      is_admin: role === 'Admin',
      is_supervisor: role === 'Supervisor'
    })
      .then((userData) => {
        let user = new ChatUser(userData as ChatUserInterface);
        this.user = user;
        this.then(user);
        this.alert.dismiss();
        this.successToast("Role changed successfully");
      })
      .catch(error => {
        this.errorToast(typeof(error) === 'object' ? error.message || error.error : error);
      })
      .then(() => this.loadingStacker.pop());
  }

  protected reinvite() {
    return Promise.resolve(this.loadingStacker.add())
      .then(() => this.chatService.addUserToChat(this.chat, this.user))
      .then(() => this.successToast("User added successfully"))
      .then(() => this.navCtrl.pop())
      .catch(error => this.errorToast(error))
      .then(() => this.loadingStacker.pop())
      .then(() => this.then(null))
  }

  protected get canChangeRole() {
    return this.chat.you.isAdmin && this.chat.you.userId !== this.user.id && !this.user.pivot.leftAt;
  }

  protected successToast(message: string) {
    this.busy = false;
    return this.toastCtrl.showSuccess(message);
  }

  protected errorToast(error: any) {
    this.busy = false;
    return this.toastCtrl.showError(error);
  }

  protected removeFromChat() {
    return Promise.resolve(this.loadingStacker.add())
      .then(() => this.chatService.removeUserFromChat(this.chat, this.user))
      .then(() => this.successToast("User removed successfully"))
      .then(() => this.navCtrl.pop())
      .catch(error => this.errorToast(error))
      .then(() => this.loadingStacker.pop())
      .then(() => this.then(null))
      ;
  }

  protected get canRemoveFromChat(): boolean {
    return !(this.user.id === this.chat.you.userId || this.user.pivot.type() === 'Left')
  }

}
