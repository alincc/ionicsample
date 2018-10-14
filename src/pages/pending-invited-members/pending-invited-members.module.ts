import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PendingInvitedMembersPage } from './pending-invited-members';

@NgModule({
  declarations: [
    PendingInvitedMembersPage,
  ],
  imports: [
    IonicPageModule.forChild(PendingInvitedMembersPage),
  ],
})
export class PendingInvitedMembersPageModule {}
