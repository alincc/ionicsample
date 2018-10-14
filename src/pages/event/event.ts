import {Component} from '@angular/core';
import {AlertController, IonicPage, NavController, NavParams} from 'ionic-angular';
import {EventInvitation} from "../../models/event-invitation";
import {Event} from "../../models/event";
import {Chat, ChatParticipant} from "../../models/chat";
import {LoadingStacker} from "../../providers/stacker/loading-stacker";
import {EventService} from "../../providers/pidge-client/event-service";
import {ChatService} from "../../providers/pidge-client/chat-service";
import {date} from "../../shared/time";
import {ChatPage} from "../chat/chat";
import {config} from "../../providers/config/config";
import {AnalyticsLogger} from "../../providers/services/analytics-logger";
import {EventFormPage} from "../event-form/event-form";
import {StandardResponseAlert} from "../../providers/services/standard-response-alert";
import {UserMetaInfoService} from "../../providers/pidge-client/user-meta-info-service";
import {StandardToast} from "../../providers/services/standard-toast";

@IonicPage()
@Component({
  selector: 'page-event',
  templateUrl: 'event.html',
})
export class EventPage {

  protected _event: Event;
  protected groupedInvitations = {};
  protected invitation: EventInvitation;
  protected chat: Chat;
  protected you: ChatParticipant;
  protected _interval;
  protected blockHours: number;
  protected invitationsUnderUpdate: { [id: number]: false | null | string } = {};

  constructor(protected navCtrl: NavController,
              protected navParams: NavParams,
              protected chatService: ChatService,
              protected eventService: EventService,
              protected toastCtrl: StandardToast,
              protected alertCtrl: AlertController,
              protected userMeta: UserMetaInfoService,
              protected loadingStacker: LoadingStacker,
              protected analytics: AnalyticsLogger,
              protected standardAlert: StandardResponseAlert) {

    this.invitation = navParams.get("invitation");
    this.event = navParams.get("event") || (this.invitation && this.invitation.event ? this.invitation.event : null);
    this.chat = navParams.get("chat") || (this.event && this.event.chat ? this.event.chat : null);
    this.you = navParams.get("you") || (this.chat && this.chat.you ? this.chat.you : null);
    this.blockHours = config.event_invitation_hours_to_close;

    //load chat info
    if (!this.chat || !this.you) {
      this.loadChatInfo(!(this.event && this.event.invitations && this.event.invitations.length), !this.invitation);
    } else if (!this.event || !this.event.invitations || !this.event.invitations.length) {
      this.loadEventInfo(!this.invitation);
    } else if (!this.invitation) {
      this.loadInvitationInfo();
    } else {
      this.setLoadInterval();
    }
  }

  ionViewDidEnter() {
    this.analytics.ga().then(ga => ga.trackView('Event Page'));
  }

  ionViewWillUnload() {
    if (this._interval) {
      clearTimeout(this._interval);
    }
  }

  protected loadChatInfo(loadEventThen: boolean = false, loadInvitationThen: boolean = false) {
    return Promise.resolve(this.loadingStacker.add("Loading chat info..."))
      .then(() => this.chatService.chatInfo(this.chat.uqid))
      .then(chat => {
        this.chat = chat;
        this.you = this.chat.you;
        if (loadEventThen) {
          this.loadEventInfo(loadInvitationThen);
        } else if (loadInvitationThen) {
          this.loadInvitationInfo();
        } else {
          this.setLoadInterval();
        }
      })
      .catch(err => this.standardAlert.showError(err).then(() => this.navCtrl.pop()))
      .then(() => this.loadingStacker.pop());
  }

  protected loadEventInfo(loadInvitationThen: boolean = false, siltently: boolean = false) {
    return Promise.resolve(siltently ? null : this.loadingStacker.add("Loading event info..."))
      .then(() => this.eventService.eventInfo(this.chat.uqid, this.event.uqid))
      .then(event => {
        this.event = event as Event;
        if (loadInvitationThen) {
          this.loadInvitationInfo();
        }
        this.setLoadInterval();
      })
      .then(() => siltently ? null : this.loadingStacker.pop());
  }

  protected setLoadInterval() {
    if (this.event.isPast) {
      return;
    }
    //this._interval = setTimeout(() => this.loadEventInfo(true, true), 5000);
  }

  protected refreshEventInfo(refresher) {
    this.loadEventInfo(true)
      .then(() => refresher.complete())
      .catch(() => refresher.complete());
  }

  protected loadInvitationInfo() {
    let myInvitations = this.event.invitations.filter((invitation: EventInvitation) => invitation.userId === this.you.userId);
    if (myInvitations && myInvitations.length) {
      this.invitation = myInvitations[0];
    }
  }

  protected formatDate(format: String): String {
    return date(format, this.event.date);
  }

  protected get areYouAdmin(): boolean {
    return this.you ? this.you.isAdmin : false;
  }

  public successToast(message: string) {
    return this.toastCtrl.showSuccess(message);
  }

  public errorToast(error: any) {
    return this.toastCtrl.showError(error);
  }

  public openChat() {
    this.navCtrl.push(ChatPage, {chat: this.chat});
  }

  public acceptEventInvitation() {
    // return Promise.resolve(this.loadingStacker.add("Accepting invitation..."))
    return Promise.resolve(this.invitationsUnderUpdate[this.invitation.id] = "accept")
      .then(() => console.log(this.invitationsUnderUpdate))
      .then(() => this.eventService.acceptEventInvitation(this.invitation))
      .then(() => this.loadEventInfo(true, true))
      .then(() => this.successToast("Invitation has been accepted successfully"))
      .catch(error => this.standardAlert.showError(error))
      // .then(() => this.loadingStacker.pop())
      .then(() => this.invitationsUnderUpdate[this.invitation.id] = false)
      .then(() => console.log(this.invitationsUnderUpdate))
      ;
  }

  public rejectEventInvitation() {
    // return Promise.resolve(this.loadingStacker.add("Rejecting invitation..."))
    return Promise.resolve(this.invitationsUnderUpdate[this.invitation.id] = "reject")
      .then(() => console.log(this.invitationsUnderUpdate))
      .then(() => this.eventService.rejectEventInvitation(this.invitation))
      .then(() => this.loadEventInfo(true, true))
      .then(() => this.successToast("Invitation has been rejected successfully"))
      .catch(error => this.standardAlert.showError(error))
      // .then(() => this.loadingStacker.pop())
      .then(() => this.invitationsUnderUpdate[this.invitation.id] = false)
      .then(() => console.log(this.invitationsUnderUpdate))
      ;
  }

  public confirmParticipation(invitation: EventInvitation, position: string) {
    // return Promise.resolve(this.loadingStacker.add("Confirming participation..."))
    return Promise.resolve(this.invitationsUnderUpdate[invitation.id] = "confirm")
      .then(() => console.log(this.invitationsUnderUpdate))
      .then(() => this.eventService.confirmEventParticipation(invitation, position))
      .then(() => this.loadEventInfo(true, true))
      .then(() => this.successToast("Participation confirmed"))
      .catch(error => this.errorToast(error))
      // .then(() => this.loadingStacker.pop())
      .then(() => this.invitationsUnderUpdate[invitation.id] = false)
      .then(() => console.log(this.invitationsUnderUpdate))
      ;
  }

  public cancelParticipation(invitation: EventInvitation) {
    // return Promise.resolve(this.loadingStacker.add("Cancelling participation..."))
    return Promise.resolve(this.invitationsUnderUpdate[invitation.id] = "cancel")
      .then(() => console.log(this.invitationsUnderUpdate))
      .then(() => this.eventService.cancelEventParticipation(invitation))
      .then(() => this.loadEventInfo(true, true))
      .then(() => this.successToast("Participation cancelled"))
      .catch(error => this.errorToast(error))
      // .then(() => this.loadingStacker.pop())
      .then(() => this.invitationsUnderUpdate[invitation.id] = false)
      .then(() => console.log(this.invitationsUnderUpdate))
      ;
  }

  get event(): Event {
    return this._event;
  }

  set event(event: Event) {
    this._event = event;
    let result = {
      keys: ["Pending", "Confirmed", "Cancelled", "Invitation", "Rejected", "Past", "Done"]
    };
    for (let invitation of this.event.invitations) {
      if (!result.hasOwnProperty(invitation.status)) {
        result[invitation.status] = [];
      }
      result[invitation.status].push(invitation);
    }
    this.groupedInvitations = result;
  }

  public alert(message) {
    return this.standardAlert.showInfo(message);
  }

  protected editEvent() {
    return Promise.resolve(this.loadingStacker.add())
      .then(() => this.navCtrl.push(EventFormPage, {
        uqid: this.chat.uqid,
        event_uqid: this.event.uqid,
        then: (event: Event) => {
          this.event.setRawData(event.rawLoadedData);
          return this.loadEventInfo(false)
        }
      }))
      .then(() => this.loadingStacker.pop())
      ;
  }

  protected statusColor(status) {
    switch (status) {
      case 'Pending':
        return 'secondary';
      case 'Confirmed':
        return 'primary';
      case 'Cancelled':
        return 'danger_dark';
      case 'Rejected':
        return 'danger_alternate';
      case 'Past':
        return 'secondary_alternate';
      case 'Invitation':
        return 'invite';
    }
  }

  protected editRegularEvent() {
    return Promise.resolve(this.loadingStacker.add())
      .then(() => this.navCtrl.push(EventFormPage, {
        uqid: this.chat.uqid,
        event_uqid: this.event.regularEvent.uqid,
        then: (event: Event) => {
          this.event.setRawData(event.rawLoadedData);
          return this.loadEventInfo(false)
        }
      }))
      .then(() => this.loadingStacker.pop());
  }

  protected askForPosition(eventInvitation: EventInvitation) {
    return this.alertCtrl.create({
      title: "Set Member Position",
      subTitle: eventInvitation.user.name,
      message: "Please type the position below. You can change it later.",
      inputs: [
        {
          name: 'position',
          placeholder: 'Position'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Set',
          handler: data => {
            this.confirmParticipation(eventInvitation, data.position);
          }
        }
      ]
    }).present();
  }

  protected removeEvent(event: Event) {
    return this.alertCtrl.create({
      title: 'Sure to remove?',
      message: 'Are you sure you want to remove the regular event titled "' + event.title + '"?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
          }
        },
        {
          text: 'Delete ',
          role: 'cancel',
          handler: () => Promise.resolve(this.loadingStacker.add())
            .then(() => this.eventService.removeSchedule(this.chat, event, false))
            .then(() => this.standardAlert.showSuccess("Team schedule removed successfully!"))
            .then(() => this.userMeta.refresh())
            .then(() => this.navCtrl.pop())
            .catch(error => this.standardAlert.showError(error))
            .then(() => this.loadingStacker.pop())
        }
      ]
    }).present();
  }
}
