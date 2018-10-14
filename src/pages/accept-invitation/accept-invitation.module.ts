import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AcceptInvitationPage } from './accept-invitation';

@NgModule({
  declarations: [
    AcceptInvitationPage,
  ],
  imports: [
    IonicPageModule.forChild(AcceptInvitationPage),
  ],
})
export class AcceptInvitationPageModule {}
