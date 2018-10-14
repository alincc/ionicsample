import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { JoinTeamWithUrlPage } from './join-team-with-url';

@NgModule({
  declarations: [
    JoinTeamWithUrlPage,
  ],
  imports: [
    IonicPageModule.forChild(JoinTeamWithUrlPage),
  ],
})
export class JoinTeamWithUrlPageModule {}
