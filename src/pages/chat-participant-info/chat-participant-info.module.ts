import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import {ChatParticipantInfoPage} from "./chat-participant-info";
import {MomentModule} from "angular2-moment";

@NgModule({
  declarations: [
    ChatParticipantInfoPage,
  ],
  imports: [
    MomentModule,
    IonicPageModule.forChild(ChatParticipantInfoPage),
  ],
  exports: [
    ChatParticipantInfoPage
  ]
})
export class ChatParticipantInfoPageModule {}
