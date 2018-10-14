import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PublicTeamInvitationPage } from './public-team-invitation';

@NgModule({
  declarations: [
    PublicTeamInvitationPage,
  ],
  imports: [
    IonicPageModule.forChild(PublicTeamInvitationPage),
  ],
})
export class PublicTeamInvitationPageModule {}
