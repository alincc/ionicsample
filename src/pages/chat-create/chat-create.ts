import {Component} from '@angular/core';
import {AlertController, IonicPage, NavController, NavParams} from 'ionic-angular';
import {Chat, TeamInterface} from "../../models/chat";
import {ChatService} from "../../providers/pidge-client/chat-service";
import {AnalyticsLogger} from "../../providers/services/analytics-logger";
import {LoadingStacker} from "../../providers/stacker/loading-stacker";
import {Sports} from "../../shared/sports";
import {ProfileImageProcessor} from "../../providers/services/profile-image-processor";
import {StandardResponseAlert} from "../../providers/services/standard-response-alert";
import {ChatPage} from "../chat/chat";

// import {ImageResizer, ImageResizerOptions} from "@ionic-native/image-resizer";

@IonicPage({})
@Component({
  selector: 'page-chat-create',
  templateUrl: 'chat-create.html',
})
export class ChatCreatePage {

  protected doneCallback: any;
  protected updatingModel: Chat;
  protected minStart: string = new Date().toISOString();
  protected minEnd: string = null;
  protected maxStart: string = new Date(new Date().getTime() + 1 * 365.25 * 24 * 60 * 60 * 1000).toISOString();
  protected maxEnd: string = new Date(new Date().getTime() + 5 * 365.25 * 24 * 60 * 60 * 1000).toISOString();
  protected sports: string[] = Sports;

  protected model: TeamInterface = {
    title: "",
    description: "",
    sport: "",
    image: "",
    startAt: null,
    endAt: null,
    type: "Team"
  };
  protected tempData = {
    listSport: null,
    otherSport: null
  };

  protected get sportList(): string {
    return this.tempData.listSport;
  }

  protected get sportOther(): string {
    return this.tempData.otherSport;
  }

  protected set sportList(value: string) {
    this.tempData.listSport = value;
    if (value !== 'Other') {
      this.model.sport = value;
    }
  }

  protected set sportOther(value: string) {
    this.tempData.otherSport = value;
    if (this.tempData.listSport === 'Other') {
      this.model.sport = value;
    }
  }

  public constructor(protected navCtrl: NavController,
                     protected navParams: NavParams,
                     protected chatService: ChatService,
                     protected alertCtrl: AlertController,
                     protected loadingStacker: LoadingStacker,
                     protected analytics: AnalyticsLogger,
                     protected profileProcessor: ProfileImageProcessor,
                     protected standardResponseAlert: StandardResponseAlert) {

    this.doneCallback = this.navParams.get('then');

    this.updatingModel = this.navParams.get('chat');
    if (this.updatingModel) {
      for (let key in this.model) {
        this.model[key] = this.updatingModel[key];
      }
      this.tempData.listSport = this.sports.indexOf(this.model.sport) !== -1 ? this.model.sport : 'Other';
      this.tempData.otherSport = this.tempData.listSport === 'Other' ? this.model.sport : null;
    }

  }

  ionViewDidEnter() {
    this.analytics.ga().then(ga => ga.trackView('Chat ' + (this.updatingModel && this.updatingModel.uqid ? 'Edit' : 'Create') + ' Page'));
  }

  protected saveTeam(evt) {
    Promise.resolve(this.loadingStacker.add('Saving'))
      .then(() => (this.updatingModel ? this.chatService.updateChat(this.updatingModel.uqid, this.model) : this.chatService.createNewChat(this.model)))
      .then((chat: Chat) => this.doneCallback && this.doneCallback({chat: chat}) || this.navCtrl.push(ChatPage, {
        chat,
        id: chat.uqid
      }))
      .catch(error => this.standardResponseAlert.showError("Team saving failed with this error: " + error))
      .then(() => this.loadingStacker.pop());
    evt.stopPropagation();
    evt.preventDefault();
    return false;
  }

  protected get endAt(): string {
    return this.model.endAt ? this.model.endAt.toISOString() : '';
  }

  protected set endAt(value: string) {
    this.model.endAt = new Date(value);
    console.log(this.model);
  }

  protected get startAt(): string {
    return this.model.startAt ? this.model.startAt.toISOString() : '';
  }

  protected set startAt(value: string) {
    this.model.startAt = new Date(value);
    this.minEnd = new Date(this.model.startAt.getTime() + 24 * 60 * 60 * 1000).toISOString();
  }

  protected changePhoto() {
    this.profileProcessor.changePhoto(128, 50)
      .then(image => image ? this.model.image = "data:image/jpg;base64," + image.replace(/^(unsafe:)?(data:image\/([a-z]{3,})?;base64,)?/, '') : null)
      .catch(e => null);
  }


}
