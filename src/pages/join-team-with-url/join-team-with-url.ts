import { UpcomingEventInterface } from './../../models/event';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,ModalController } from 'ionic-angular';
import { StandardResponseAlert } from "../../providers/services/standard-response-alert";
import { LoginPage } from "../login/login";
import { ChatService, PuplicUrl } from "../../providers/pidge-client/chat-service";
import { LoadingStacker } from "../../providers/stacker/loading-stacker";
import { AnalyticsLogger } from "../../providers/services/analytics-logger";
import { currentUser } from "../../providers/pidge-client/current-user";
import { RegisterPage } from "../register/register";
import { ChatPage } from "../chat/chat";
import { AuthService } from "../../providers/pidge-client/auth-service";
import { Subscription } from 'rxjs/Subscription';
import { InvitationListPage } from './../invitation-list/invitation-list';

@IonicPage({
  segment: 'public-url/:urlKey'
})
@Component({
  selector: 'page-join-team-with-url',
  templateUrl: 'join-team-with-url.html',
})
export class JoinTeamWithUrlPage {

  protected urlKey: string;
  protected urlObject: PuplicUrl;
  protected showTeamDetail: boolean = false;
  protected regularEvent:Array<UpcomingEventInterface>=[];
  protected singleEvent:Array<UpcomingEventInterface>=[];
  protected event:UpcomingEventInterface=undefined;
  //subscription is class wide property to avoid double subscriptions
  protected authSubscription: Subscription; 

  constructor(protected standardAlert: StandardResponseAlert,
    protected chatService: ChatService,
    protected navCtrl: NavController,
    protected analytics: AnalyticsLogger,
    protected navParams: NavParams,
    protected loadingStacker: LoadingStacker,
    protected auth: AuthService,
    protected  modalCtrl: ModalController ) {

    this.urlKey = this.navParams.get('urlKey');

    console.log('url key' + this.urlKey);

    Promise.resolve(this.loadingStacker.add())
      .then(() => this.getPublicUrlInfo())
      .catch(e => this.standardAlert.showError(e))
      .then(() => this.loadingStacker.pop());

  }
  checkSchedule() {
    let invitationListPage = this.modalCtrl.create(InvitationListPage,{'singleEvent':this.singleEvent,'regularEvent':this.regularEvent});
    invitationListPage.onDidDismiss(data => {
      if(data!=undefined){
      this.event=data;
      this.joinTeam(this.event);
      }
    });
    invitationListPage.present();
  }
  protected subscribeTojoinTeam() {

    //to avoid double subscriptions
    if(this.authSubscription){
      return;
    }

    //subscribe
    this.authSubscription = this.auth.subscribe(update=>{

      if(!update.loggedIn){
        return;
      }
      
      //unsubscribe and clear the variable
      this.authSubscription.unsubscribe();
      this.authSubscription = null;

      return this.joinTeam(this.event);

    });
  }

  ionViewDidLoad() {
    this.analytics.ga().then(ga => ga.trackView('Team Public Invitation Page'));
  }

  protected authenticateFirst() {
    this.subscribeTojoinTeam();
    return this.standardAlert.showInfo("Please signup/login first, then try again.", [
      {
        text: 'Register',
        role: 'cancel',
        handler: () => {
          this.navCtrl.push(RegisterPage, {
            'linkable': this.urlObject.linkable, 'urlObject': this.urlObject, callback: () => {
              this.joinTeam(this.event);
            }
          });
        }
      },
      {
        text: 'Login',
        role: 'cancel',
        handler: () => {
          this.navCtrl.push(LoginPage, {
            'linkable': this.urlObject.linkable, 'urlObject': this.urlObject, callback: () => {
              this.joinTeam(this.event);
            }
          });
        }
      }
    ]);
  }

  protected showError(error) {
    return this.standardAlert.showError(error);
  }

  protected getPublicUrlInfo() {

    return Promise.resolve(this.chatService.getPublicUrlInfo(this.urlKey))
      .then(publicUrl => { this.urlObject = publicUrl;this.regularEvent=this.urlObject.linkable.upcoming_regular_events;this.singleEvent=this.urlObject.linkable.upcoming_single_events; console.log('url object' , this.urlObject); })
      .catch(error => this.showError(error));

  }

  protected joinTeam(event) {
    return Promise.resolve(this.loadingStacker.add())
      .then(() => currentUser())
      .then(user => user ? Promise.resolve(user) : Promise.reject(this.authenticateFirst()))
      .then(user => this.chatService.joinTeamWithUrl(this.urlObject.linkable, this.urlObject,event))
      .then(() => this.standardAlert.showSuccess('You did it and joined ' + this.urlObject.linkable.title + '! Welcome on board, again!'))
      .then(() => this.chatService.chatInfo(this.urlObject.linkable.uqid))
      .then(chat => this.navCtrl.push(ChatPage, { chat: chat }))
      .catch(e => null)
      .then(() => this.loadingStacker.pop())
      ;
  }
}
