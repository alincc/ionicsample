import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {Chat} from "../../models/chat";
import {ChatService,memberInterface} from "../../providers/pidge-client/chat-service";
import {StandardResponseAlert} from "../../providers/services/standard-response-alert";

/**
 * Generated class for the PendingInvitedMembersPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-pending-invited-members',
  templateUrl: 'pending-invited-members.html',
})
export class PendingInvitedMembersPage {
  protected team: Chat;
  protected members:Array<memberInterface>=[];

  constructor(protected navCtrl: NavController,
              protected navParams: NavParams,
              protected chatService: ChatService,
              protected standardAlert: StandardResponseAlert) {
                 this.team=this.navParams.get('team');
                this.getTeamMember();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PendingInvitedMembersPage');
  }
  protected getTeamMember()
  {
    Promise.resolve(this.chatService.getPendingMembers(this.team))
    .then(result=>this.members=result)
    .catch(error=>this.standardAlert.showError(error))
  }
  protected deleteTeamMember(member:memberInterface)
  {
    
    Promise.resolve(this.chatService.deleteInvitedMembers(this.team,member))
    .then(result=>this.standardAlert.showSuccess("Member deleted"))
    .catch(error=>this.standardAlert.showError(error))
  }
  protected resendToTeamMember(member:memberInterface)
  {
   
    Promise.resolve(this.chatService.resendToInvitedMembers(this.team,member))
    .then(result=>this.standardAlert.showSuccess("Invitation Resend"))
    .catch(error=>this.standardAlert.showError(error))
  }
  protected get memberListShow(): boolean {
    return this.members.length > 0;
  }

}
