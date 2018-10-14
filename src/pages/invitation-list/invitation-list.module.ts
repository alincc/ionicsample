import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { InvitationListPage } from './invitation-list';

@NgModule({
  declarations: [
    InvitationListPage,
  ],
  imports: [
    IonicPageModule.forChild(InvitationListPage),
  ],
})
export class InvitationListPageModule {}
